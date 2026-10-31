/* ============================================================
   C · 玩法  记录层：来源卡、印章、校准记录卡
   ------------------------------------------------------------
   这一层不绑在某一关上，它只做三件事：
     G.mod.giveCard(id)   发一张来源卡（flag: card.<id>，发过就不再发）
     G.mod.stamp(id)      盖一个印章（flag: stamp.<id>）
     G.mod.openRecord()   画「校准记录卡」——结局之后那张可以给别人看的表

   为什么用 flag 而不是另开一套存档：存档已经有 flag，加一层等于两套真相。
   为什么记录卡要读 flag 而不是读 vars：vars 是场景的，到神武门就没了；
   校准记录要跨六关，只能落在存档里。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  function cardById(id) {
    const all = (G.str && G.str.all('sourceCards')) || [];
    for (let i = 0; i < all.length; i += 1) {
      if (all[i] && all[i].id === id) return all[i];
    }
    return null;
  }

  function acquired(prefix) {
    const out = [];
    const all = (G.str && G.str.all('sourceCards')) || [];
    for (let i = 0; i < all.length; i += 1) {
      const id = all[i] && all[i].id;
      if (id && G.save && G.save.flag && G.save.flag(prefix + id)) out.push(id);
    }
    return out;
  }

  G.mod.giveCard = function (id) {
    if (!id || !G.save || !G.save.flag) return false;
    if (G.save.flag('card.' + id)) return false;
    G.save.flag('card.' + id, true);
    if (G.save.persist) G.save.persist();
    const c = cardById(id);
    G.ui.toast(G.str.get('ui.toast.cardObtained', { name: (c && c.name) || id }), 'ok');
    return true;
  };

  G.mod.stamp = function (id) {
    const key = 'stamp.' + (id || 'unfounded');
    if (!G.save || !G.save.flag) return false;
    if (G.save.flag(key)) return false;
    G.save.flag(key, true);
    if (G.save.persist) G.save.persist();
    G.ui.toast(G.str.get('ui.toast.stampObtained'), 'ok');
    return true;
  };

  G.mod.cards = function () { return acquired('card.'); };
  G.mod.stamps = function () { return acquired('stamp.'); };

  /* ---------------- 校准记录卡 ---------------- */
  let open = false;

  G.mod.openRecord = function () {
    open = true;
    const scene = G.scene;
    if (scene) {
      scene.screenPainters = scene.screenPainters || [];
      if (scene.screenPainters.indexOf('journal.record') < 0) {
        scene.screenPainters.push('journal.record');
      }
    }
  };

  function count(ids) {
    let n = 0;
    for (let i = 0; i < ids.length; i += 1) {
      if (G.mod.isDone(ids[i])) n += 1;
    }
    return n;
  }

  function values() {
    const mapIds = G.mod.list('map') || [];
    return {
      nodes: count(mapIds),
      links: G.save.flag('spot.repair_bench.evidence') ? 4 : 0,
      blank: G.save.flag('stamp.unfounded') ? 1 : 0,
      fixed: G.save.flag('creator.signed') ? 1 : 0,
      judged: G.save.flag('spot.repair_bench.relic') ? 1 : 0,
      kept: G.save.flag('keep.steps') ? 1 : 0,
      list: (G.mod.cards() || []).join(' · ') || '—',
    };
  }

  G.mod.painter('journal.record', function (ctx, prop, scene) {
    if (!open || !scene) return;
    const W = scene.w || 640;
    const H = scene.h || 900;
    const w = Math.min(430, W - 60);
    const fields = (G.str.raw() && G.str.raw().shareCard && G.str.raw().shareCard.fields) || [];
    const h = 96 + fields.length * 26;
    const x = (W - w) / 2;
    const y = Math.max(40, (H - h) / 2);

    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.fillStyle = '#0d1418';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#141d22';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(216,178,106,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);

    G.text(ctx, G.str.get('shareCard.title'), x + 20, y + 34,
      { size: 17, color: '#e8d5a8', weight: 'bold' });
    G.text(ctx, G.str.get('shareCard.subtitle'), x + 20, y + 56,
      { size: 10, color: '#8fa2a8' });

    const v = values();
    let ry = y + 84;
    for (let i = 0; i < fields.length; i += 1) {
      const f = fields[i] || {};
      /* 数据里每行的模板只用一个占位符：{done} / {n} / {list}。
         这里按 f.key 从 values() 取对应数字，别整包丢进去 ——
         整包传的话 {n} 对不上，fill() 会把字面量留在画面上。 */
      const n = v[f.key];
      const vars = { done: v.nodes, n: n == null ? 0 : n, list: v.list };
      G.text(ctx, f.label || '', x + 20, ry, { size: 11, color: '#a9b8bd' });
      G.text(ctx, G.str.get('shareCard.fields.' + i + '.value', vars), x + w - 20, ry,
        { size: 11, color: '#e8d5a8', align: 'right' });
      ry += 26;
    }

    G.text(ctx, G.str.get('shareCard.footer'), x + w / 2, y + h - 12,
      { size: 9, color: '#6b7d84', align: 'center' });
    ctx.restore();
  });

  /* 结局之后自动摊开这张表；其余 cut 不受影响 */
  const origCut = G.mod.cut;
  G.mod.cut = function (id, done) {
    return origCut.call(G.mod, id, function () {
      if (id === 'ending') G.mod.openRecord();
      if (typeof done === 'function') done();
    });
  };
})();
