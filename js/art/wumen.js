/* ============================================================
   A · 美术  午门画笔
   ------------------------------------------------------------
   每个画笔都是一个纯函数：(ctx, prop, scene) => 画点什么。
   · ctx  已经平移/缩放到地图坐标系，直接按地图坐标画
   · prop 是 data/maps/*.js 里那一条配置（坐标、opt）
   · scene.vars 是玩法改过的状态（比如网格对齐了没有）

   画笔不许读 G.save、不许弹对话框、不许改 vars —— 只画。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  /* 两套网格的配色：故宫=金，卫城投影=青灰 */
  const GOLD = 'rgba(216,178,106,';
  const CYAN = 'rgba(124,146,158,';

  function gridLines(ctx, x0, y0, w, h, cell, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0 % cell; x <= w; x += cell) {
      ctx.moveTo(Math.round(x) + 0.5, y0);
      ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = y0 + (y0 % cell); y <= h; y += cell) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* 广场石地 */
  G.mod.painter('wumen.plaza', function (ctx, prop, scene) {
    G.art.paving(ctx, prop.x, prop.y, prop.w, prop.h, '#6c6153', '#5a5044', 11, 12);

    /* 靠近城门的一道深色阴影带，让门"立"在广场上 */
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#0d0a07';
    ctx.fillRect(prop.x, prop.y - 26, prop.w, 30);
    ctx.restore();

    /* 中轴砖缝：从午门门洞一直铺到镜头前，给玩家一条视觉引导线 */
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#e8ddc4';
    ctx.fillRect(318, prop.y, 4, prop.h);
    ctx.restore();
  });

  /* 两套坐标系：金色=故宫（不动），青灰=卫城投影（会漂） */
  G.mod.painter('wumen.grid', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    const dx = (v.gridDx || 0) + (v.gridBoth || 0);
    const cell = 40;

    /* 故宫网格：原点固定在午门门洞中心 (320, 470) */
    gridLines(ctx, 320, 470, prop.w, prop.h, cell, GOLD + '1)', 0.16);

    /* 卫城投影网格：整体偏移 dx。对齐后仍在，只是叠住了 */
    gridLines(ctx, 320 + dx, 470, prop.w, prop.h, cell, CYAN + '1)', 0.20);

    /* 原点标记：一个小小的十字，对齐后变成一个小金点 */
    const ox = 320, oy = 470;
    ctx.save();
    ctx.globalAlpha = v.gridDx === 0 ? 0.9 : 0.5;
    ctx.fillStyle = v.gridDx === 0 ? '#ffd479' : '#9fb3bd';
    ctx.fillRect(ox - 3, oy - 1, 7, 3);
    ctx.fillRect(ox - 1, oy - 3, 3, 7);
    ctx.restore();
  });

  /* 午门城楼（用现成的 A.drawGate，A 之后可以直接换成手绘精灵） */
  G.mod.painter('wumen.gate', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    const dx = (v.gridDx || 0) + (v.gridBoth || 0);
    const w = (prop.opt && prop.opt.w) || 660;

    G.art.drawGate(ctx, prop.x, prop.baseY, w, {});

    /* 卫城投影：把帕特农山墙的轮廓用青灰描一遍，叠在城门上方。
       这是"投影叠印"，不是替换 —— 城门本身一格没动。 */
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.strokeStyle = '#7c929e';
    ctx.lineWidth = 1;
    const cx = prop.x + dx;
    const ty = prop.baseY - 250;
    ctx.beginPath();
    ctx.moveTo(cx - 210, ty + 66);
    ctx.lineTo(cx, ty);
    ctx.lineTo(cx + 210, ty + 66);
    ctx.stroke();
    for (let i = 0; i <= 8; i++) {
      const x = cx - 210 + (i * 420) / 8;
      ctx.beginPath();
      ctx.moveTo(x, ty + 66);
      ctx.lineTo(x, ty + 96);
      ctx.stroke();
    }
    ctx.restore();
  });

  /* 门额 */
  G.mod.painter('wumen.plaque', function (ctx, prop, scene) {
    const text = (prop.opt && prop.opt.text) || '午門';
    const w = 96, h = 30;
    ctx.save();
    ctx.fillStyle = 'rgba(16,12,9,.85)';
    ctx.fillRect(prop.x - w / 2 - 3, prop.baseY - h - 3, w + 6, h + 6);
    ctx.fillStyle = '#7a1f16';
    ctx.fillRect(prop.x - w / 2, prop.baseY - h, w, h);
    ctx.fillStyle = 'rgba(216,178,106,.85)';
    ctx.fillRect(prop.x - w / 2, prop.baseY - h, w, 1);
    ctx.fillRect(prop.x - w / 2, prop.baseY - 1, w, 1);
    ctx.restore();
    G.text(ctx, text, prop.x, prop.baseY - 9, {
      size: 15, color: '#f0d79b', align: 'center', weight: 'bold',
      outline: 'rgba(10,7,5,.9)', outlineWidth: 2,
    });
  });


  /* 石狮 / 华表 / 树 / 台阶 / 人群 / 告示牌：填满广场，靠近城门两侧 */
  G.mod.painter('wumen.lion', function (ctx, prop) {
    G.art.lion(ctx, prop.x, prop.baseY, !!(prop.opt && prop.opt.flip));
  });

  G.mod.painter('wumen.huabiao', function (ctx, prop) {
    const x = prop.x, b = prop.baseY;
    ctx.save();
    ctx.fillStyle = 'rgba(20,14,10,.25)';
    ctx.beginPath(); ctx.ellipse(x, b, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    G.art.r(ctx, x - 3, b - 78, 6, 78, '#d9cfb4');
    G.art.r(ctx, x - 3, b - 78, 2, 78, '#efe7d2');
    G.art.r(ctx, x - 9, b - 84, 18, 7, '#cfc3a6');
    G.art.r(ctx, x - 6, b - 90, 12, 6, '#e4dbc4');
    G.art.r(ctx, x - 12, b - 56, 24, 3, '#efe7d2');
    G.art.r(ctx, x - 9, b - 52, 18, 2, '#cfc3a6');
  });

  G.mod.painter('wumen.tree', function (ctx, prop) {
    const kind = (prop.opt && prop.opt.kind) || 'pine';
    if (kind === 'pine') G.art.pine(ctx, prop.x, prop.baseY, (prop.opt && prop.opt.s) || 0.9);
    else G.art.tree(ctx, prop.x, prop.baseY, (prop.opt && prop.opt.s) || 0.95, { autumn: !!(prop.opt && prop.opt.autumn) });
  });

  G.mod.painter('wumen.steps', function (ctx, prop) {
    const w = (prop.opt && prop.opt.w) || 180;
    for (let i = 0; i < 5; i++) {
      G.art.r(ctx, prop.x - w / 2 + i * 4, prop.baseY + i * 3, w - i * 8, 3, i % 2 ? '#cfc4a9' : '#b8ac90');
    }
  });

  G.mod.painter('wumen.crowd', function (ctx, prop, scene) {
    const n = (prop.opt && prop.opt.n) || 6;
    const t = (scene && scene.time) || 0;
    G.art.crowd(ctx, prop.x, prop.baseY, n, t, (prop.opt && prop.opt.seed) || 3);
  });

  G.mod.painter('wumen.sign', function (ctx, prop) {
    G.art.sign(ctx, prop.x, prop.baseY, (prop.opt && prop.opt.text) || '午门广场', { w: (prop.opt && prop.opt.w) || 54 });
  });

  G.mod.painter('wumen.vat', function (ctx, prop) {
    G.art.vat(ctx, prop.x, prop.baseY, { water: true });
  });

  /* 廊灯 */
  G.mod.painter('wumen.lantern', function (ctx, prop) {
    G.art.lantern(ctx, prop.x, prop.baseY, {});
  });
})();
