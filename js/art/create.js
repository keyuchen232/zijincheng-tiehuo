/* ============================================================
   A · 美术 造境台（创造模式）
   ------------------------------------------------------------
   一件件中式/希式构件摆在两侧展台上，中央是空的造境台。
   玩法（js/mods/create-mode.js）把玩家选中的构件写进
   scene.vars.picked，这里负责把它们排到台上。
   画笔只画，不改状态。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;
  const A = G.art;
  const AG = G.artGreek || {};
  const r = A.r;

  const CN = [
    { id: 'cn.wall', name: '红墙', sub: '宫墙 · 朱红' },
    { id: 'cn.hall', name: '金瓦殿', sub: '重檐 · 琉璃' },
    { id: 'cn.gate', name: '月洞门', sub: '中轴 · 门阙' },
  ];
  const GR = [
    { id: 'gr.colonnade', name: '多立克柱廊', sub: '列柱 · 石梁' },
    { id: 'gr.pediment', name: '三角山墙', sub: '山花 · 檐部' },
    { id: 'gr.caryatid', name: '女像柱廊', sub: '六柱 · 人形' },
  ];
  G.CREATE_PIECES = CN.concat(GR);

  /* ---------- 地面 ---------- */
  G.mod.painter('create.plaza', function (ctx) {
    // 底色：暖石
    A.paving(ctx, 0, 0, 640, 1120, '#c2b69b', '#b0a488', 7, 16);
    // 两侧展台
    A.paving(ctx, 24, 250, 176, 720, '#cabd9f', '#b9ac8d', 21, 14);
    A.paving(ctx, 440, 250, 176, 720, '#cabd9f', '#b9ac8d', 22, 14);
    // 中央造境台
    A.paving(ctx, 152, 470, 336, 420, '#dcd1b4', '#c9bd9d', 11, 14);
    // 台口的两道石阶
    for (let i = 0; i < 4; i++) {
      r(ctx, 176 - i * 3, 890 + i * 4, 288 + i * 6, 4, i % 2 ? '#d3c8ab' : '#bfb394');
    }
    // 中轴引导线
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#8a6a3f';
    ctx.fillRect(318, 900, 4, 190);
    ctx.restore();
  });

  /* ---------- 单件构件（两侧展台） ---------- */
  function drawPiece(ctx, kind, x, y, faint) {
    ctx.save();
    if (faint) ctx.globalAlpha = 0.28;
    if (kind === 'cn.wall') {
      A.wallH(ctx, x - 52, x + 52, y, 26);
    } else if (kind === 'cn.hall') {
      A.drawHall(ctx, x, y, 118, { wallH: 22, roofH: 18, name: '', openDoor: true });
    } else if (kind === 'cn.gate') {
      A.drawGate(ctx, x, y, 96, { wallH: 26, roofH: 15, arches: 1, name: '' });
    } else if (kind === 'gr.colonnade') {
      if (AG.drawTemple) AG.drawTemple(ctx, x, y, 128, { columns: 6, step: true, name: '' });
    } else if (kind === 'gr.pediment') {
      if (AG.drawTemple) AG.drawTemple(ctx, x, y, 116, { columns: 4, pediment: true, step: true, name: '' });
    } else if (kind === 'gr.caryatid') {
      if (AG.caryatidPorch) AG.caryatidPorch(ctx, x, y, 1);
    }
    ctx.restore();
  }
  G.CREATE_DRAW_PIECE = drawPiece;

  G.mod.painter('create.piece', function (ctx, prop, scene) {
    const kind = prop.opt && prop.opt.kind;
    const picked = (scene && scene.vars && scene.vars.picked) || [];
    const used = picked.indexOf(kind) >= 0;
    drawPiece(ctx, kind, prop.x, prop.baseY, used);
    // 已选：展台上留一块「已请上台」的印
    if (used) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      r(ctx, prop.x - 13, prop.baseY + 6, 26, 12, '#6d3a24');
      G.text(ctx, '已选', prop.x, prop.baseY + 15, { size: 8, color: '#f4e2c2', align: 'center', weight: 'bold' });
      ctx.restore();
    }
  });

  /* ---------- 造境台：把选中的构件排上去 ---------- */
  G.mod.painter('create.stage', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    const picked = v.picked || [];
    const cx = 320;
    const base = 860;

    // 台座
    A.shadow(ctx, cx, base, 300, 7, 0.26);
    r(ctx, cx - 156, base - 16, 312, 16, '#9b8e75');
    r(ctx, cx - 152, base - 22, 304, 8, '#cbbfa2');
    r(ctx, cx - 148, base - 24, 296, 3, '#e6dcc3');

    if (!picked.length) {
      G.text(ctx, '台上还空着 —— 走到展台前按 E 选构件', cx, base - 70, {
        size: 9, color: '#6b5a44', align: 'center',
      });
      // 台上的定位十字
      ctx.save();
      ctx.globalAlpha = 0.35;
      r(ctx, cx - 6, base - 96, 12, 2, '#8a7a5e');
      r(ctx, cx - 1, base - 101, 2, 12, '#8a7a5e');
      ctx.restore();
      return;
    }

    // 排布：最近相邻的两种文化交替站台，形成「合璧」
    const sorted = picked.slice().sort(function (a, b) {
      const ac = a.indexOf('cn.') === 0 ? 0 : 1;
      const bc = b.indexOf('cn.') === 0 ? 0 : 1;
      return ac - bc;
    });
    const n = sorted.length;
    const gap = Math.min(84, 260 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const k = sorted[i];
      const x = cx + (i - (n - 1) / 2) * gap;
      ctx.save();
      ctx.translate(x, base - 26);
      ctx.scale(0.78, 0.78);
      drawPiece(ctx, k, 0, 0, false);
      ctx.restore();
    }

    // 合璧：两种文化各占一半以上 → 金色网格 + 云
    const blend = v.blend == null ? 0 : v.blend;
    if (v.harmony) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = '#d8b26a';
      ctx.lineWidth = 1;
      for (let gx = -120; gx <= 120; gx += 24) {
        ctx.beginPath(); ctx.moveTo(cx + gx, base - 150); ctx.lineTo(cx + gx, base - 20); ctx.stroke();
      }
      for (let gy = -150; gy <= -20; gy += 24) {
        ctx.beginPath(); ctx.moveTo(cx - 120, base + gy); ctx.lineTo(cx + 120, base + gy); ctx.stroke();
      }
      ctx.restore();
      G.text(ctx, '合 璧', cx, base - 176, {
        size: 13, color: '#8a5a24', align: 'center', weight: 'bold',
        outline: 'rgba(244,236,216,.9)', outlineWidth: 3,
      });
      G.text(ctx, '中式 ' + Math.round((1 - blend) * 100) + '% · 希式 ' + Math.round(blend * 100) + '%', cx, base - 158, {
        size: 8, color: '#6b5a44', align: 'center',
      });
    }
  });
})();

/* ---------- 附属画笔 ---------- */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;
  const A = G.art;
  const r = A.r;

  G.mod.painter('create.plaque', function (ctx, prop) {
    const text = (prop.opt && prop.opt.text) || '造境台';
    const w = 128, h = 34;
    ctx.save();
    ctx.fillStyle = 'rgba(16,12,9,.85)';
    ctx.fillRect(prop.x - w / 2 - 4, prop.baseY - h - 4, w + 8, h + 8);
    ctx.fillStyle = '#6f2a1c';
    ctx.fillRect(prop.x - w / 2, prop.baseY - h, w, h);
    ctx.fillStyle = 'rgba(216,178,106,.85)';
    ctx.fillRect(prop.x - w / 2, prop.baseY - h, w, 1);
    ctx.fillRect(prop.x - w / 2, prop.baseY - 1, w, 1);
    ctx.restore();
    G.text(ctx, text, prop.x, prop.baseY - 11, {
      size: 15, color: '#f0d79b', align: 'center', weight: 'bold',
      outline: 'rgba(10,7,5,.9)', outlineWidth: 2,
    });
  });

  G.mod.painter('create.lantern', function (ctx, prop) {
    A.lantern(ctx, prop.x, prop.baseY, { h: 30 });
  });
})();
