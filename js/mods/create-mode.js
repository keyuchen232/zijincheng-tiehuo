/* ============================================================
   C · 玩法  创造模式「造境台」
   ------------------------------------------------------------
   一张白台 + 六件构件（左中右希）。玩法只做三件事：
     1. 让玩家把构件请上台（写 scene.vars.picked，A 的画笔负责画）
     2. 实时算「对称 / 借景 / 比例」三条造境原则
     3. 合璧时可以把这次组合收成一张展签（PNG 下载）
   文案写在本文件里（这是新增模式，暂不进 script.json）。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const PIECES = G.CREATE_PIECES || [];
  const CN_IDS = PIECES.filter(function (p) { return p.id.indexOf('cn.') === 0; }).map(function (p) { return p.id; });
  const GR_IDS = PIECES.filter(function (p) { return p.id.indexOf('gr.') === 0; }).map(function (p) { return p.id; });
  const NAME = {};
  PIECES.forEach(function (p) { NAME[p.id] = p.name; });

  function store() {
    if (!G.save.data.create) G.save.data.create = { picked: [] };
    if (!Array.isArray(G.save.data.create.picked)) G.save.data.create.picked = [];
    return G.save.data.create;
  }

  function lawsOf(picked) {
    const cn = picked.filter(function (k) { return CN_IDS.indexOf(k) >= 0; }).length;
    const gr = picked.filter(function (k) { return GR_IDS.indexOf(k) >= 0; }).length;
    const total = cn + gr;
    const ratio = total ? gr / total : 0;
    const ratioOk = cn > 0 && gr > 0 && Math.max(cn, gr) <= Math.min(cn, gr) * 2;
    return {
      cn: cn, gr: gr, total: total, ratio: ratio,
      symmetry: cn > 0 && gr > 0 && Math.abs(cn - gr) <= 1,
      borrow: picked.indexOf('cn.wall') >= 0 || picked.indexOf('gr.pediment') >= 0,
      balance: ratioOk,
      harmony: cn > 0 && gr > 0 && Math.abs(cn - gr) <= 1 && ratioOk &&
        (picked.indexOf('cn.wall') >= 0 || picked.indexOf('gr.pediment') >= 0),
    };
  }

  function apply(scene, picked) {
    if (!scene) return lawsOf(picked);
    scene.vars.picked = picked.slice();
    const l = lawsOf(picked);
    scene.vars.blend = l.ratio;
    scene.vars.harmony = l.harmony;
    if (scene.repaint) scene.repaint();
    return l;
  }

  /* ---------------- 面板 ---------------- */
  let panel = null;
  let ui = null;

  function mount() {
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'create-panel';
    panel.className = 'create-panel hidden';
    panel.innerHTML = '' +
      '<div class="cp-card">' +
      '  <div class="cp-head"><b>造境台 · 中西合璧</b><span>紫禁城 × 雅典卫城</span>' +
      '  <button class="cp-close" type="button">收起</button></div>' +
      '  <p class="cp-tip">左边三件中式，右边三件希式。两边各至少一件、比例不偏过 2:1，就算「合璧」—— 天马行空，但要能自洽。</p>' +
      '  <div class="cp-groups">' +
      '    <div class="cp-col"><h4>中式 · 紫禁城</h4><div class="cp-list" id="cp-cn"></div></div>' +
      '    <div class="cp-col"><h4>希式 · 卫城</h4><div class="cp-list" id="cp-gr"></div></div>' +
      '  </div>' +
      '  <div class="cp-ratio"><span id="cp-ratio-label">中式 0% · 希式 0%</span>' +
      '    <div class="cp-bar"><i id="cp-bar-cn"></i><i id="cp-bar-gr"></i></div></div>' +
      '  <ul class="cp-laws" id="cp-laws"></ul>' +
      '  <div class="cp-actions">' +
      '    <button id="cp-export" type="button" class="cp-main">收境 · 生成展签</button>' +
      '    <button id="cp-clear" type="button">清空</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(panel);
    return panel;
  }

  function render(scene) {
    if (!panel) return;
    const picked = store().picked;
    const l = apply(scene, picked);
    ['cn', 'gr'].forEach(function (side) {
      const box = panel.querySelector('#cp-' + side);
      box.innerHTML = '';
      const ids = side === 'cn' ? CN_IDS : GR_IDS;
      ids.forEach(function (id) {
        const on = picked.indexOf(id) >= 0;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cp-item' + (on ? ' on' : '');
        b.textContent = NAME[id] + (on ? ' · 已上台' : '');
        b.addEventListener('click', function () {
          const arr = store().picked;
          const i = arr.indexOf(id);
          if (i >= 0) arr.splice(i, 1);
          else { if (arr.length >= 6) { G.ui.toast('台上最多六件', 'warn', 1800); return; } arr.push(id); }
          G.save.persist && G.save.persist();
          render(scene);
          G.audio && G.audio.sfx('blip');
        });
        box.appendChild(b);
      });
    });
    const pct = Math.round(l.ratio * 100);
    const rl = panel.querySelector('#cp-ratio-label');
    if (rl) rl.textContent = '中式 ' + (100 - pct) + '% · 希式 ' + pct + '%';
    const bc = panel.querySelector('#cp-bar-cn');
    const bg = panel.querySelector('#cp-bar-gr');
    if (bc) bc.style.width = (100 - pct) + '%';
    if (bg) bg.style.width = pct + '%';
    const ul = panel.querySelector('#cp-laws');
    if (ul) {
      const rows = [
        ['对称 · 两边各站至少一件，数量不偏过一件', l.symmetry],
        ['借景 · 有一面红墙或一道山墙作背景', l.borrow],
        ['比例 · 中式与希式大致相当（不超 2:1）', l.balance],
      ];
      ul.innerHTML = rows.map(function (r) {
        return '<li class="' + (r[1] ? 'ok' : '') + '">' + (r[1] ? '✓' : '·') + ' ' + r[0] + '</li>';
      }).join('') + '<li class="' + (l.harmony ? 'ok strong' : 'strong') + '">' +
        (l.harmony ? '✓ 合璧：这一台，可以收境了' : '· 合璧：三条都成立才可以收境') + '</li>';
    }
    const ex = panel.querySelector('#cp-export');
    if (ex) ex.disabled = !l.harmony;
  }

  function openPanel(scene, api) {
    mount();
    ui = api;
    render(scene);
    panel.classList.remove('hidden');
    if (api.overlay) api.overlay(panel);
    if (!panel._bound) {
      panel._bound = true;
      panel.querySelector('.cp-close').addEventListener('click', closePanel);
      panel.querySelector('#cp-clear').addEventListener('click', function () {
        store().picked = [];
        G.save.persist && G.save.persist();
        render(ui && ui.scene);
      });
      panel.querySelector('#cp-export').addEventListener('click', function () {
        const scene2 = ui && ui.scene;
        const l = lawsOf(store().picked);
        if (!l.harmony) return;
        exportCard(scene2, store().picked, l);
      });
    }
    G.audio && G.audio.sfx('page');
  }

  function closePanel() {
    if (panel) panel.classList.add('hidden');
    if (ui && ui.release) ui.release();
    ui = null;
  }

  /* ---------------- 展签 ---------------- */
  function autoName(picked) {
    if (picked.indexOf('cn.hall') >= 0 && picked.indexOf('gr.colonnade') >= 0) return '金瓦柱廊';
    if (picked.indexOf('cn.wall') >= 0 && picked.indexOf('gr.pediment') >= 0) return '朱墙山花';
    if (picked.indexOf('cn.gate') >= 0 && picked.indexOf('gr.caryatid') >= 0) return '月门女柱';
    return '双城一境';
  }

  function quote(picked) {
    const has = function (k) { return picked.indexOf(k) >= 0; };
    if (has('cn.hall') && has('gr.colonnade')) return '金瓦压在柱廊上，中轴借着卫城的光。';
    if (has('cn.wall') && has('gr.pediment')) return '一面朱墙替山墙挡住了风，山花就开在墙头上。';
    if (has('cn.gate') && has('gr.caryatid')) return '月洞门里走出女像柱，石头也有了呼吸。';
    return '把两座城放进同一台，先别问像不像，先问站不站得住。';
  }

  function exportCard(scene, picked, l) {
    const cv = document.createElement('canvas');
    cv.width = 900; cv.height = 1260;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;

    // 纸底
    c.fillStyle = '#f4ead8';
    c.fillRect(0, 0, 900, 1260);
    c.strokeStyle = '#c9b28a';
    c.lineWidth = 2;
    c.strokeRect(28, 28, 844, 1204);
    c.strokeStyle = '#8a6a3f';
    c.lineWidth = 1;
    c.strokeRect(40, 40, 820, 1180);

    // 标题
    c.fillStyle = '#3b2b1e';
    c.font = 'bold 40px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    c.fillText('造 境 台', 450, 120);
    c.font = '18px "Songti SC","STSong",serif';
    c.fillStyle = '#7a6448';
    c.fillText('紫禁城 × 雅典卫城 · 中西合璧', 450, 158);
    c.strokeStyle = '#c9b28a';
    c.beginPath(); c.moveTo(180, 182); c.lineTo(720, 182); c.stroke();

    // 台面上的组合
    const stageY = 620;
    c.fillStyle = '#e2d6ba';
    c.fillRect(120, 250, 660, 420);
    c.strokeStyle = '#c9b28a';
    c.strokeRect(120, 250, 660, 420);
    c.fillStyle = '#cbbfa2';
    c.fillRect(150, stageY + 8, 600, 18);
    c.fillStyle = '#9b8e75';
    c.fillRect(150, stageY + 26, 600, 8);
    const n = Math.max(1, picked.length);
    const gap = Math.min(120, 520 / n);
    for (let i = 0; i < picked.length; i++) {
      const x = 450 + (i - (picked.length - 1) / 2) * gap;
      c.save();
      c.translate(x, stageY + 4);
      c.scale(1.15, 1.15);
      if (G.CREATE_DRAW_PIECE) G.CREATE_DRAW_PIECE(c, picked[i], 0, 0, false);
      c.restore();
    }

    // 名称与题记
    c.fillStyle = '#3b2b1e';
    c.font = 'bold 30px "Songti SC","STSong",serif';
    c.fillText('「' + autoName(picked) + '」', 450, 730);
    c.font = '17px "Songti SC","STSong",serif';
    c.fillStyle = '#6b5a44';
    c.fillText(quote(picked), 450, 768);

    // 比例条
    const pct = Math.round(l.ratio * 100);
    c.fillStyle = '#d8cdb2';
    c.fillRect(200, 812, 500, 22);
    c.fillStyle = '#c79c54';
    c.fillRect(200, 812, 500 * (1 - l.ratio), 22);
    c.fillStyle = '#6d9a9c';
    c.fillRect(200 + 500 * (1 - l.ratio), 812, 500 * l.ratio, 22);
    c.fillStyle = '#3b2b1e';
    c.font = '16px "Songti SC","STSong",serif';
    c.textAlign = 'left';
    c.fillText('中式 ' + (100 - pct) + '%', 200, 858);
    c.textAlign = 'right';
    c.fillText('希式 ' + pct + '%', 700, 858);

    // 构件清单
    c.textAlign = 'left';
    c.fillStyle = '#3b2b1e';
    c.font = 'bold 20px "Songti SC","STSong",serif';
    c.fillText('台上构件', 120, 918);
    c.font = '17px "Songti SC","STSong",serif';
    c.fillStyle = '#5c4a35';
    picked.forEach(function (k, i) {
      c.fillText('· ' + (NAME[k] || k), 140, 952 + i * 30);
    });

    // 三条原则
    c.fillStyle = '#3b2b1e';
    c.font = 'bold 20px "Songti SC","STSong",serif';
    c.fillText('造境原则', 470, 918);
    c.font = '17px "Songti SC","STSong",serif';
    const rows = [['对称', l.symmetry], ['借景', l.borrow], ['比例', l.balance]];
    rows.forEach(function (row, i) {
      c.fillStyle = row[1] ? '#4f7a48' : '#8a7a63';
      c.fillText((row[1] ? '✓ ' : '· ') + row[0], 490, 952 + i * 30);
    });

    // 落款
    c.fillStyle = '#7a6448';
    c.font = '15px "Songti SC","STSong",serif';
    c.textAlign = 'center';
    const d = new Date();
    const stamp = d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
    c.fillText('万象灵境 · 造境台 ／ ' + stamp, 450, 1188);
    c.fillStyle = '#8a2f22';
    c.font = 'bold 16px "Songti SC","STSong",serif';
    c.fillText('合 璧', 450, 1130);

    cv.toBlob(function (blob) {
      if (!blob) { G.ui.toast('展签生成失败', 'bad', 2000); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '造境台-' + autoName(picked) + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      G.ui.toast('展签已下载 · 「' + autoName(picked) + '」', 'good', 2600);
    }, 'image/png');
  }

  /* ---------------- 登记玩法 ---------------- */
  G.mod.puzzle('create.pick', {
    summary: '创造模式：把中式 / 希式构件请上造境台，三条原则成立后可收境成展签。',
    open: function (api) { openPanel(api.scene, api); },
  });

  G.mod.puzzle('create.readme', {
    summary: '造境台说明',
    open: function (api) {
      G.dialog.show([
        { name: '造境台', text: '左边三件来自紫禁城，右边三件来自雅典卫城。走到台前按 E，就能把它们请上台。' },
        { name: '造境台', text: '台上的件要站得住：两边都有、数量不偏、有一面红墙或山墙作背景，才算合璧。' },
        { name: '旅行手账', text: '（天马行空可以，但要能自洽——这是这座台唯一的原则。）' },
      ], function () { if (api.release) api.release(); });
    },
  });
})();
