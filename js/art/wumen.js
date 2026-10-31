/* ============================================================
   A · 美术  午门画笔
   ------------------------------------------------------------
   每个画笔都是一个纯函数：(ctx, prop, scene) => 画点什么。
   · ctx  已经平移/缩放到地图坐标系，直接按地图坐标画
   · prop 是 data/maps/*.js 里那一条配置（坐标、opt）
   · scene.vars 是玩法改过的状态（比如网格对齐了没有）

   画笔不许读 G.save、不许弹对话框、不许改 vars —— 只画。
   本文件不含任何玩家可见文字：要写的字一律走 G.str（data/script.json）。

   本关读的 vars（由 js/mods/wumen-registration.js 写）：
     gridDx     卫城投影网格相对故宫网格的错位（像素）。0 = 已对齐
     gridBoth   选错原点时两套网格一起被拖走的距离
     seamShift  1 = 故宫自己的砖缝错位（选 C 的后果）
     nailShift  1 = 午门门钉间距被拉开（选 C 的后果）
     terraceGap 1 = 门前台基下沉（选 B 的后果）
     view       1 = 正在放"静帧"（screenPainters 用）
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
    /* 横线从 y0 % cell 起：这样必有一条横线过原点 y0，跟竖线过 x0 对称。
       以前写成 y0 + (y0 % cell)，偏移算了两遍，网格原点与十字对不上。 */
    for (let y = y0 % cell; y <= h; y += cell) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* 广场石地 */
  G.mod.painter('wumen.plaza', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    G.art.paving(ctx, prop.x, prop.y, prop.w, prop.h, '#6c6153', '#5a5044', 11, 12);

    /* 靠近城门的一道深色阴影带，让门"立"在广场上 */
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#0d0a07';
    ctx.fillRect(prop.x, prop.y - 26, prop.w, 30);
    ctx.restore();

    /* 广场上的使用痕迹：低洼处的苔、补过的砖、门洞灌进来的水渍。
       全用坐标做确定性伪随机，同一张图每次都一样。
       （"空"不是因为地太大，是因为地上什么都没有。） */
    (function dress(p) {
      let seed = (Math.round(p.x) * 7 + Math.round(p.y) * 13 + Math.round(p.h) * 3) % 997;
      const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
      const n = Math.max(4, Math.round(p.h / 110));
      for (let i = 0; i < n; i++) {
        const px = p.x + 18 + rnd() * (p.w - 36);
        const py = p.y + 16 + rnd() * (p.h - 32);
        /* 避开中轴那几像素，别把引导线糊掉 */
        if (Math.abs(px - (p.x + p.w / 2)) < 34) continue;
        ctx.save();
        ctx.globalAlpha = 0.09 + rnd() * 0.09;
        ctx.fillStyle = rnd() > 0.55 ? '#3d4732' : '#2f2a22';
        ctx.beginPath();
        ctx.ellipse(px, py, 11 + rnd() * 24, 4 + rnd() * 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (let i = 0; i < 4; i++) {
        const bx = p.x + 8 + Math.floor(rnd() * ((p.w - 16) / 24)) * 24;
        const by = p.y + 8 + Math.floor(rnd() * ((p.h - 16) / 12)) * 12;
        if (Math.abs(bx + 12 - (p.x + p.w / 2)) < 30) continue;
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#8a7f6c';
        ctx.fillRect(bx, by, 24, 12);
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = '#f2e9d4';
        ctx.fillRect(bx, by, 24, 1);
        ctx.restore();
      }
    })(prop);

    /* 中轴砖缝：从午门门洞一直铺到镜头前，给玩家一条视觉引导线。
       seamShift = 1 时，缝从中轴被推开 18px，而且两侧的横缝对不上 ——
       这是"故宫自己被动过"的证据，玩家要能一眼看见。 */
    const seamX = v.seamShift ? 336 : 318;
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#e8ddc4';
    ctx.fillRect(seamX, prop.y, 4, prop.h);

    if (v.seamShift) {
      /* 横缝错位：左半区和右半区各错开半块砖 */
      ctx.globalAlpha = 0.10;
      for (let y = prop.y + 12; y < prop.y + prop.h; y += 24) {
        ctx.fillRect(prop.x, y, 316, 2);
        ctx.fillRect(340, y + 12, prop.x + prop.w - 340, 2);
      }
    }
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

    /* terraceGap：台基被整体压低，门"陷"进地里一点 */
    const gap = v.terraceGap ? 4 : 0;
    G.art.drawGate(ctx, prop.x, prop.baseY + gap, w, {});

    if (gap) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#0d0a07';
      ctx.fillRect(prop.x - w / 2, prop.baseY + gap, w, 3);
      ctx.restore();
    }

    /* 门钉：选 C 之后间距被拉开（34 → 40），同一行还错开半颗 ——
       这是选单里没有说、但画面上看得见的那件事。 */
    const pitch = v.nailShift ? 40 : 34;
    const rows = 5, cols = 9;
    ctx.save();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = prop.x - ((cols - 1) / 2) * pitch + c * pitch;
        const py = prop.baseY - 34 + r * 13 + (v.nailShift && r % 2 ? 3 : 0);
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = '#d8b26a';
        ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3);
      }
    }
    ctx.restore();

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

  /* 门额。文字由地图 opt.textKey 指向 script.json 里的键
     （'nodes.wumen.plaque'），老写法 opt.text 仍然兼容；
     画笔不写死任何一个字。 */
  G.mod.painter('wumen.plaque', function (ctx, prop, scene) {
    const o = prop.opt || {};
    let text = o.text || '';
    if (o.textKey && G.str && G.str.has(o.textKey)) {
      text = G.str.get(o.textKey, (scene && scene.vars) || {});
    }
    if (!text) return;
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

  /* 廊灯 */
  G.mod.painter('wumen.lantern', function (ctx, prop) {
    G.art.lantern(ctx, prop.x, prop.baseY, {});
  });

  /* ------------------------------------------------------------
     屏幕层画笔（scene.screenPainters）：
     关 1 的"静帧"。先压暗整个画面，再打上取景框和一行小字，
     停 1.2 秒，让玩家在动之前先看清楚这一帧。
     文字走 G.str，本文件不写死。
     ------------------------------------------------------------ */
  G.mod.painter('wumen.silent', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    if (!v.view) return;
    const W = (scene && scene.w) || 640;
    const H = (scene && scene.h) || 1120;

    ctx.save();
    /* 压暗 + 轻微去色感 */
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(0, 0, W, H);

    /* 取景框：四角 */
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#d8b26a';
    ctx.lineWidth = 1;
    const m = 26, len = 18;
    ctx.beginPath();
    ctx.moveTo(m, m + len); ctx.lineTo(m, m); ctx.lineTo(m + len, m);
    ctx.moveTo(W - m - len, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + len);
    ctx.moveTo(m, H - m - len); ctx.lineTo(m, H - m); ctx.lineTo(m + len, H - m);
    ctx.moveTo(W - m - len, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - len);
    ctx.stroke();

    /* 十字线 */
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.stroke();

    /* 一行小字：静帧 / 停住 */
    if (G.str && G.str.has('ui.hud.silent')) {
      ctx.globalAlpha = 0.9;
      G.text(ctx, G.str.get('ui.hud.silent'), W / 2, H - 58, {
        size: 13, color: '#d8b26a', align: 'center',
        outline: 'rgba(8,6,4,.9)', outlineWidth: 2,
      });
      if (G.str.has('ui.hud.silentSub')) {
        G.text(ctx, G.str.get('ui.hud.silentSub'), W / 2, H - 40, {
          size: 11, color: '#9fb3bd', align: 'center',
          outline: 'rgba(8,6,4,.9)', outlineWidth: 2,
        });
      }
    }
    ctx.restore();
  });
  /* ------------------------------------------------------------
     远景投影：帕特农柱廊（山门之上的第二层"建筑"）
     ------------------------------------------------------------
     为什么要有这一块：第一眼只看到一座午门的话，玩家会以为这是
     一个故宫游戏，要走到第 2 关才明白"两套建筑叠在一张沙盘上"。
     所以把卫城的柱廊直接画在午门屋脊后面：比午门窄、比午门高，
     读起来像另一座建筑站在它背后；整层跟着 gridDx 一起漂，
     错位时就跟着歪 —— 这是"投影"，不是替换（午门一格没动）。
     地平和午门共用 baseY，物体按 baseY 排序，所以必然在门后面。
     ------------------------------------------------------------ */
  G.mod.painter('wumen.far', function (ctx, prop, scene) {
    const v = (scene && scene.vars) || {};
    const dx = (v.gridDx || 0) + (v.gridBoth || 0);
    const cx = prop.x + dx;
    const B = prop.baseY;

    const half = 292;
    const platY = B - 170;   /* 台基面 */
    const colTop = B - 240;  /* 柱头 */
    const entY = colTop - 12;/* 檐部顶 */
    const apex = entY - 70;  /* 山花顶点 */

    ctx.save();
    ctx.strokeStyle = CYAN + '1)';
    ctx.fillStyle = CYAN + '1)';
    ctx.lineWidth = 1;

    /* 台基：三道踏步 */
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - half - 12 + i * 8, platY + i * 5 + 0.5);
      ctx.lineTo(cx + half + 12 - i * 8, platY + i * 5 + 0.5);
      ctx.stroke();
    }

    /* 柱廊：14 根，比真帕特农少画几根，看清就行 */
    ctx.globalAlpha = 0.26;
    const n = 14;
    const gap = (half * 2) / (n - 1);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = Math.round(cx - half + i * gap) + 0.5;
      ctx.moveTo(x, colTop);
      ctx.lineTo(x, platY);
    }
    ctx.stroke();

    /* 檐部：两条横线夹一条细线 */
    ctx.globalAlpha = 0.30;
    ctx.beginPath();
    ctx.moveTo(cx - half - 16, entY + 0.5);
    ctx.lineTo(cx + half + 16, entY + 0.5);
    ctx.moveTo(cx - half - 16, entY + 6.5);
    ctx.lineTo(cx + half + 16, entY + 6.5);
    ctx.moveTo(cx - half - 12, entY + 12.5);
    ctx.lineTo(cx + half + 12, entY + 12.5);
    ctx.stroke();

    /* 山花：三角轮廓 + 极淡填充，填充让它"有体积"，不只是线框 */
    ctx.globalAlpha = 0.30;
    ctx.beginPath();
    ctx.moveTo(cx - half - 16, entY);
    ctx.lineTo(cx, apex);
    ctx.lineTo(cx + half + 16, entY);
    ctx.stroke();

    ctx.globalAlpha = 0.055;
    ctx.beginPath();
    ctx.moveTo(cx - half - 14, entY - 1);
    ctx.lineTo(cx, apex + 3);
    ctx.lineTo(cx + half + 14, entY - 1);
    ctx.closePath();
    ctx.fill();

    /* 山花两角的小涡卷：一眼能和故宫的庑殿顶区分开 */
    ctx.globalAlpha = 0.24;
    [-1, 1].forEach(function (s) {
      const x = cx + s * (half - 26);
      ctx.beginPath();
      ctx.arc(x, entY - 18, 6, s > 0 ? Math.PI * 0.6 : Math.PI * 0.4, s > 0 ? Math.PI * 2.1 : Math.PI * 1.4);
      ctx.stroke();
    });

    ctx.restore();
  });

})();
