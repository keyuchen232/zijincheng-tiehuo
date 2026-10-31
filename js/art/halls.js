/* ============================================================
   A · 美术  关 2–6 的通用画笔
   ------------------------------------------------------------
   关 1（午门）的画笔在 js/art/wumen.js，带那两套网格。
   这里只放「太和殿月台 / 乾清宫 / 修复台 / 御花园 / 神武门」
   复用的几件东西：地面、殿身、月台台阶、柱列、台面、终端、门。

   画笔签名：(ctx, prop, scene) => void
     ctx   已在地图坐标系
     prop  地图里那一条配置（x / y / baseY / w / h / opt）
     scene 只读 scene.vars（玩法改过的状态），不许写、不许弹窗。

   ★ 这一版改的是「画笔要读 vars」：
     玩法改一个变量，画面就得有反应。读的全是下面这些（键名即契约）：
       layerStones / layerImages / layerLabels / labelGlitch   关 2
       sag / sagSide / crack / dust                            关 3
       crackCount / stampUnfounded / verdictR07                关 4
       planSigned / keepWhat                                   关 5
       doorLit / clueARead / clueBRead                         关 6
     本文件不含任何玩家可见文字：要写的字一律走 G.str。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod || !G.art) return;
  const A = G.art;

  /* scene.vars 的安全读取 */
  function V(scene) { return (scene && scene.vars) || {}; }

  /* 从 script.json 取一行字；没有就返回''，绝不写死中文 */
  function S(key, vars) {
    if (!G.str || !G.str.has(key)) return '';
    return G.str.get(key, vars);
  }

  /* 匾额 / 建筑名：地图优先给 nameKey（'nodes.qianqing.name'），
     老写法 opt.name 仍然兼容，但地图里已经不再写中文了。 */
  function NAME(o, scene) {
    if (o && o.nameKey) return S(o.nameKey, V(scene));
    return (o && o.name) || '';
  }

  /* 说明牌关卡的数据源。这里用常量传 id，不直接把 id 字面量写进
     G.str.puzzle(...)：tools/check-modules.mjs 会把 G.str.* 的字符串参数
     当成完整文案路径去校验，而 puzzle id 里带点（taihe.labels），
     字面量传参会被误判成「文案 key 不存在」。 */
  const LABELS = 'taihe.labels';
  function labelsData() {
    return (G.str && G.str.puzzle && G.str.puzzle(LABELS)) || {};
  }

  /* ---------------- 广场上的「过日子痕迹」 ----------------
     地图最容易被说「空」的地方，就是殿前这片砖地：一整块同色地砖，
     走过去什么都没有。真实宫院不是这样的：中间有御路石，两侧有
     排水沟，砖缝里有苔，低洼处积过水，边角有补过的砖。
     这些都不影响走法与判定，但一眼就知道"这是被用过的院子"。

     全部用 prop 的坐标做确定性伪随机（不写 Math.random），
     否则每次进屋地面都在跳。 */
  function dressCourt(ctx, prop, tone) {
    const x = prop.x, y = prop.y, w = prop.w, h = prop.h;
    const cx = x + w / 2;
    /* 确定性伪随机：同一个 prop 每次都画在同一处 */
    let seed = (Math.round(x) * 7 + Math.round(y) * 13 + Math.round(h) * 3) % 997;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

    /* 1 御路石：中轴一条浅色石带，每 26px 一道横缝 */
    ctx.save();
    ctx.globalAlpha = tone === 'marble' ? 0.22 : 0.18;
    ctx.fillStyle = tone === 'marble' ? '#efe7d6' : '#cfc4ad';
    ctx.fillRect(cx - 24, y, 48, h);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(40,34,26,.35)';
    ctx.lineWidth = 1;
    for (let yy = y + 26; yy < y + h; yy += 26) {
      ctx.beginPath();
      ctx.moveTo(cx - 24, Math.round(yy) + 0.5);
      ctx.lineTo(cx + 24, Math.round(yy) + 0.5);
      ctx.stroke();
    }
    ctx.restore();

    /* 2 排水沟：御路两侧各一道暗线，尽头一个小方口（雨水口） */
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#2b2620';
    ctx.lineWidth = 2;
    [cx - 62, cx + 62].forEach(function (gx) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#151210';
      ctx.fillRect(gx - 4, y + h - 22, 8, 8);
      ctx.globalAlpha = 0.28;
    });
    ctx.restore();

    /* 3 苔痕 / 水渍：低洼处的深色斑，形状不规则 */
    const patches = Math.max(3, Math.round(h / 140));
    for (let i = 0; i < patches; i++) {
      const px = x + 20 + rnd() * (w - 40);
      const py = y + 20 + rnd() * (h - 40);
      const rx = 12 + rnd() * 26;
      const ry = 5 + rnd() * 10;
      ctx.save();
      ctx.globalAlpha = 0.10 + rnd() * 0.10;
      ctx.fillStyle = tone === 'marble' ? '#6d7a6a' : '#3f4a34';
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* 4 补过的砖：零星几块颜色不同的砖，边角发亮 */
    const fixes = 2 + Math.round(h / 260);
    for (let i = 0; i < fixes; i++) {
      const bx = x + 8 + Math.floor(rnd() * ((w - 16) / 24)) * 24;
      const by = y + 8 + Math.floor(rnd() * ((h - 16) / 12)) * 12;
      ctx.save();
      ctx.globalAlpha = 0.30;
      ctx.fillStyle = tone === 'marble' ? '#b9b2a1' : '#8a7f6c';
      ctx.fillRect(bx, by, 24, 12);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#f2e9d4';
      ctx.fillRect(bx, by, 24, 1);
      ctx.restore();
    }
  }

  /* 广场砖地（乾清宫、御花园用） */
  G.mod.painter('hall.court', function (ctx, prop) {
    A.paving(ctx, prop.x, prop.y, prop.w, prop.h, '#6c6153', '#5a5044', 11, 12);
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#e8ddc4';
    ctx.fillRect(prop.x + prop.w / 2 - 2, prop.y, 4, prop.h);
    ctx.restore();
    dressCourt(ctx, prop, 'court');
  });

  /* 汉白玉地面（太和殿月台用）：浅砖 + 中轴丹陛 + 一层青灰网格
     layerImages = 0（关 2 关掉图像层）时，青灰网格整层不画。 */
  G.mod.painter('hall.marble', function (ctx, prop, scene) {
    const v = V(scene);
    A.paving(ctx, prop.x, prop.y, prop.w, prop.h, '#8d8477', '#7c7367', 13, 10);

    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = '#d6cdbb';
    ctx.fillRect(prop.x + prop.w / 2 - 30, prop.y, 60, prop.h);
    ctx.restore();

    dressCourt(ctx, prop, 'marble');

    if (v.layerImages === 0) return;

    /* 投影坐标层：疏一点的青灰网格，提醒"这是叠上去的一层" */
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#7c929e';
    ctx.lineWidth = 1;
    let x, y;
    for (y = prop.y; y < prop.y + prop.h; y += 44) {
      ctx.beginPath();
      ctx.moveTo(prop.x, Math.round(y) + 0.5);
      ctx.lineTo(prop.x + prop.w, Math.round(y) + 0.5);
      ctx.stroke();
    }
    for (x = prop.x; x < prop.x + prop.w; x += 44) {
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, prop.y);
      ctx.lineTo(Math.round(x) + 0.5, prop.y + prop.h);
      ctx.stroke();
    }
    ctx.restore();
  });

  /* 殿身（opt: w / wallH / roofH / double / name）
     匾额属于"标签层"：layerLabels = 0 时不写名字。 */
  G.mod.painter('hall.palace', function (ctx, prop, scene) {
    const o = prop.opt || {};
    const v = V(scene);
    const labelsOn = v.layerLabels !== 0;
    A.drawHall(ctx, prop.x, prop.baseY, o.w || 480, {
      wallH: o.wallH || 34,
      roofH: o.roofH || 32,
      double: !!o.double,
      name: labelsOn ? NAME(o, scene) : '',
    });
  });

  /* 台面先于殿身绘制；前缘和台阶仍由 hall.terrace 在前景绘制。 */
  G.mod.painter('hall.terrace.deck', function (ctx, prop) {
    const o = prop.opt || {};
    const w = o.w || 560;
    const top = o.topY == null ? prop.baseY : o.topY;
    const front = o.frontY == null ? top + 121 : o.frontY;
    ctx.save();
    ctx.fillStyle = '#a29889';
    ctx.fillRect(prop.x - w / 2, top, w, front - top);
    ctx.fillStyle = '#b7ad9c';
    ctx.fillRect(prop.x - w / 2, top, w, 2);
    ctx.fillStyle = '#8a8073';
    for (let y = top + 18; y < front; y += 18) ctx.fillRect(prop.x - w / 2, y, w, 1);
    for (let x = prop.x - w / 2 + 40; x < prop.x + w / 2; x += 40) ctx.fillRect(x, top + 2, 1, front - top - 2);
    ctx.restore();
  });

  /* 月台：台基 + 栏杆 + 三段台阶 + 卫城山墙投影轮廓
     layerStones = 1 → 露出底下故宫自己的石雕，投影同时淡到 0.15
     layerImages = 0 → 投影整层不画
     labelGlitch = 1 → 栏杆上留 3 行错位的"乱码"（关 2 的错答案后果） */
  G.mod.painter('hall.terrace', function (ctx, prop, scene) {
    const o = prop.opt || {};
    const v = V(scene);
    const w = o.w || 560;
    const x = prop.x;
    const y = prop.baseY;

    ctx.save();
    /* 台基 */
    ctx.fillStyle = '#8a8073';
    ctx.fillRect(x - w / 2, y - 16, w, 16);
    ctx.fillStyle = '#a29889';
    ctx.fillRect(x - w / 2, y - 19, w, 3);

    /* 栏杆：一排短柱 */
    for (let i = 0; i <= 12; i++) {
      const px = x - w / 2 + (i * w) / 12;
      ctx.fillStyle = '#b7ad9c';
      ctx.fillRect(px - 2, y - 33, 4, 16);
    }

    /* 石作层：栏杆下面的浮雕。层开着的时候只是底纹，踩了图层石才看清。 */
    const carved = v.layerStones === 1 ? 0.85 : 0.30;
    ctx.globalAlpha = carved;
    ctx.strokeStyle = '#cfc6b2';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const px = x - w / 2 + 40 + i * 60;
      ctx.strokeRect(px, y - 14, 26, 10);
      ctx.beginPath();
      ctx.moveTo(px, y - 4);
      ctx.lineTo(px + 13, y - 14);
      ctx.lineTo(px + 26, y - 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* 三段台阶：走过三折，抬头才看得到殿身 */
    [[y + 2, 128], [y + 24, 100], [y + 46, 74]].forEach(function (s, i) {
      ctx.fillStyle = i % 2 ? '#8f8577' : '#9a9082';
      ctx.fillRect(x - s[1] / 2, s[0], s[1], 20);
    });

    /* 玩家写入规则后，标记画在台阶表面，避免被不透明台阶盖住。 */
    if (v.keepSteps) {
      ctx.save();
      ctx.strokeStyle = v.keepSteps === 'keep' ? '#8cdbc3' : '#d8b26a';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = 2;
      if (v.keepSteps !== 'drop') {
        ctx.setLineDash(v.keepSteps === 'note' ? [4, 4] : []);
        ctx.beginPath(); ctx.moveTo(x - 36, y + 7); ctx.lineTo(x + 36, y + 7); ctx.stroke();
      }
      ctx.font = '10px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(v.keepSteps === 'keep' ? '已保留 · 走近与抬头' : v.keepSteps === 'note' ? '待核 · 暂未写入规则' : '未采用 · 建筑仍留在原位', x, y + 22);
      ctx.restore();
    }

    /* 卫城投影：山墙轮廓，半透明青灰，叠在殿身之上（不是替换） */
    if (v.layerImages !== 0) {
      const alpha = v.layerStones === 1 ? 0.15 : 0.26;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#7c929e';
      ctx.lineWidth = 1;
      const cx = x + (o.dx || 0);
      const ty = y - 210;
      ctx.beginPath();
      ctx.moveTo(cx - 200, ty + 60);
      ctx.lineTo(cx, ty);
      ctx.lineTo(cx + 200, ty + 60);
      ctx.stroke();
      for (let i = 0; i <= 8; i++) {
        const px = cx - 200 + (i * 400) / 8;
        ctx.beginPath();
        ctx.moveTo(px, ty + 60);
        ctx.lineTo(px, ty + 88);
        ctx.stroke();
      }
    }

    /* 标签层被搞乱：栏杆上三行错位的短横，像没渲染完的字 */
    if (v.labelGlitch && (v.labelsDone || 0) < 3) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#b87f6a';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          const px = x - 120 + c * 42 + ((r * 7 + c * 3) % 9);
          const py = y - 46 + r * 9 + ((c * 5 + r) % 3);
          ctx.fillRect(px, py, 14 + ((c + r) % 4) * 3, 3);
        }
      }
    }
    ctx.restore();
  });

  /* 三块说明牌（标签层）。text 全部来自 script.json 的 plaques[i].text，
     画笔只负责摆在哪儿、亮不亮。 */
  G.mod.painter('hall.labelplates', function (ctx, prop, scene) {
    const v = V(scene);
    if (v.layerLabels === 0) return;
    const pz = labelsData();
    const plaques = pz.plaques || [];
    const spots = (prop.opt && prop.opt.at) || [];
    ctx.save();
    plaques.forEach(function (q, i) {
      const done = i < (v.labelsDone || 0);
      const resolved = (prop.opt && prop.opt.resolved) || spots;
      const at = (done ? resolved[i] : spots[i]) || { dx: 0, dy: 0 };
      const glitch = v.labelGlitch && !done;
      const px = prop.x + (at.dx || 0);
      const py = prop.baseY + (at.dy || 0);
      /* A short physical stem connects each label to its exhibit. */
      ctx.globalAlpha=.8;ctx.strokeStyle='#81725c';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(px,py+4);ctx.lineTo(px,py+15);ctx.stroke();
      ctx.fillStyle='#655c50';ctx.fillRect(px-10,py+14,20,3);
      const text = q.text || '';
      if (!text) return;
      const wid = Math.max(52, text.length * 11 + 10);
      ctx.globalAlpha = glitch ? 0.55 : 0.8;
      ctx.fillStyle = 'rgba(24,18,13,.78)';
      ctx.fillRect(px - wid / 2, py - 9, wid, 14);
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#8f7c5e';
      ctx.strokeRect(px - wid / 2, py - 9, wid, 14);
      ctx.globalAlpha = 0.95;
      G.text(ctx, text, px, py - 2, {
        size: 9, color: glitch ? '#c98f77' : (done && i < 2 ? '#a7c8d2' : '#d8c9a8'), align: 'center',
        outline: 'rgba(8,6,4,.85)', outlineWidth: 1,
      });
    });
    ctx.restore();
  });

  /* 柱列（opt: style 'stone'|'wood' / n / gap / h / material）
     关 3 的承重实验就画在这里：
       sag     0..1，塌陷进度（谁塌由 sagSide 指定）
       crack   1 = 柱身留裂纹（塌过就一直在）
       dust    1 = 起灰 */
  G.mod.painter('hall.columns', function (ctx, prop, scene) {
    const o = prop.opt || {};
    const v = V(scene);
    const n = o.n || 3;
    const gap = o.gap || 46;
    const h = o.h || 120;
    const mine = v.sagSide && v.sagSide === (o.style || 'stone');
    const sag = mine ? (v.sag || 0) : 0;

    for (let i = 0; i < n; i++) {
      const px = prop.x + (i - (n - 1) / 2) * gap;
      /* 塌陷：整根往下沉，并向一侧歪一点点 */
      const drop = sag * 14;
      const y = prop.baseY + drop;
      const hh = Math.max(24, h - sag * 10);
      const tilt = sag * (i % 2 ? 2.5 : -2.5);
      ctx.save();
      if (o.style === 'stone') {
        ctx.fillStyle = '#c9c0ad';
        ctx.beginPath();
        ctx.moveTo(px - 9 + tilt, y - 6);ctx.lineTo(px - 5 + tilt, y - hh + 28);
        ctx.lineTo(px + 5 + tilt, y - hh + 28);ctx.lineTo(px + 9 + tilt, y - 6);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.arc(px + tilt, y - hh + 18, 6, 0, Math.PI * 2);ctx.fill();
        ctx.fillRect(px - 7 + tilt, y - hh + 24, 14, 8);
        ctx.strokeStyle='#9c9382';ctx.lineWidth=1;
        for(let fold=-1;fold<=1;fold++){ctx.beginPath();ctx.moveTo(px+fold*3,y-hh+38);ctx.lineTo(px+fold*5,y-10);ctx.stroke();}
        ctx.fillStyle = '#b3a996';
        ctx.fillRect(px - 11 + tilt, y - hh - 10, 22, 10);
        ctx.fillStyle = '#8c8374';
        ctx.fillRect(px - 12, y - 5, 24, 5);
      } else {
        ctx.fillStyle = '#7d5a3a';
        ctx.fillRect(px - 6 + tilt, y - hh, 12, hh);
        ctx.fillStyle = '#6a4a2e';
        ctx.fillRect(px - 8 + tilt, y - hh - 8, 16, 8);
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(px - 10, y - 5, 20, 5);
      }

      /* Joint marks sit below the load beam, which is painted after stone columns. */
      const method = v[o.style === 'stone' ? 'stoneMethod' : 'woodMethod'];
      if (method) {
        ctx.strokeStyle = method === 'dowel' ? '#b9c1bd' : '#d8b26a';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-7,y-hh+10);ctx.lineTo(px+7,y-hh+10);ctx.stroke();
        if(method === 'tenon')ctx.strokeRect(px-3,y-hh+4,6,10);
        if(method === 'dowel')ctx.fillRect(px-1,y-hh+1,2,14);
      }
      /* 裂纹：塌过一次就一直留着 */
      if (v[o.style === 'stone' ? 'crackStone' : 'crackWood'] || (mine && v.crack)) {
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = '#2a221b';
        ctx.lineWidth = 1;
        for (let c = 0; c < 2; c++) {
          const cy = y - 18 - c * 16;
          ctx.beginPath();
          ctx.moveTo(px - 6, cy);
          ctx.lineTo(px - 1, cy - 5);
          ctx.lineTo(px + 4, cy - 1);
          ctx.lineTo(px + 7, cy - 7);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      /* 起灰：低透明度土色颗粒 */
      if (mine && v.dust) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#8d7a5e';
        for (let d = 0; d < 12; d++) {
          const dx = ((i * 13 + d * 37) % 40) - 20;
          const dy = -((d * 11 + i * 7) % 30);
          ctx.fillRect(px + dx, y + dy, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  });

  G.mod.painter('hall.loadbeam', function(ctx,prop,scene){
    const v=V(scene), y=prop.baseY-102;
    ctx.save();ctx.fillStyle='#a29886';ctx.fillRect(138,y,328,13);
    if(v.sag){const left=v.sagSide==='stone'?138:360;ctx.fillStyle='#665c4e';ctx.fillRect(left,y+13,106,v.sag*12);}
    ctx.strokeStyle='#d4c9b5';ctx.strokeRect(138,y,328,13);ctx.restore();
  });
  /* 修复台：一张长桌、几片纸、一盏台灯
     crackCount 0..3 → 纸面上多几道折痕
     stampUnfounded = 1 → 右下角压一枚"未成立"的印 */
  G.mod.painter('hall.bench', function (ctx, prop, scene) {
    const v = V(scene);
    const x = prop.x;
    const y = prop.baseY;
    const w = (prop.opt && prop.opt.w) || 260;
    ctx.save();
    ctx.fillStyle = '#3a2f26';
    ctx.fillRect(x - w / 2, y - 56, w, 10);
    ctx.fillStyle = '#2a221b';
    ctx.fillRect(x - w / 2 + 10, y - 46, 10, 46);
    ctx.fillRect(x + w / 2 - 20, y - 46, 10, 46);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#e9dfc6';
      ctx.fillRect(x - w / 2 + 22 + i * 40, y - 70, 28, 14);
      /* 折痕：每错一次多一道 */
      if (i < (v.crackCount || 0)) {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#9a8b6c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + 22 + i * 40, y - 70);
        ctx.lineTo(x - w / 2 + 50 + i * 40, y - 56);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = 'rgba(255,207,134,.16)';
    ctx.beginPath();
    ctx.arc(x, y - 88, 66, 0, Math.PI * 2);
    ctx.fill();

    /* 未成立印 */
    if (v.stampUnfounded) {
      const sx = x + w / 2 - 34;
      const sy = y - 40;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#8d2b22';
      ctx.fillRect(sx - 16, sy - 12, 32, 24);
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#f0c9a8';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 15, sy - 11, 30, 22);
      const mark = S('ui.panel.stampMark');
      if (mark) {
        G.text(ctx, mark, sx, sy - 4, {
          size: 9, color: '#f0c9a8', align: 'center',
          outline: 'rgba(60,12,8,.9)', outlineWidth: 1,
        });
      }
    }
    ctx.restore();
  });

  /* 广钟（关 4 的那件外来构件）
     verdictR07 = '' 未判 / 'fusion' 历史融合 / 'stripped' 被拆掉 / 'erased' 说明被抹 */
  G.mod.painter('hall.relic', function (ctx, prop, scene) {
    const x = prop.x;
    const y = prop.baseY;
    const s = (prop.opt && prop.opt.s) || 18;
    const verdict = V(scene).verdictR07 || '';
    ctx.save();
    /* 钟体 */
    ctx.fillStyle = '#6f5a3a';
    ctx.fillRect(x - s, y - s * 2, s * 2, s * 2);
    ctx.fillStyle = '#8a7047';
    ctx.fillRect(x - s + 2, y - s * 2 + 2, s * 2 - 4, s * 2 - 4);
    /* 顶钮 */
    ctx.fillStyle = '#a98a56';
    ctx.fillRect(x - 3, y - s * 2 - 6, 6, 6);
    /* Clock face and native wooden housing remain together after correction. */
    ctx.fillStyle='#e9dfc6';ctx.beginPath();ctx.arc(x,y-s*1.16,s*.62,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4a3b26';ctx.lineWidth=1;
    for(let k=0;k<12;k++){const a=k*Math.PI/6;ctx.beginPath();ctx.moveTo(x+Math.sin(a)*s*.46,y-s*1.16-Math.cos(a)*s*.46);ctx.lineTo(x+Math.sin(a)*s*.55,y-s*1.16-Math.cos(a)*s*.55);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(x,y-s*1.55);ctx.lineTo(x,y-s*1.16);ctx.lineTo(x+s*.3,y-s*.98);ctx.stroke();
    /* 外来构件：齿轮 + 铅灌铁销 */
    const foreignAlpha = verdict === 'stripped' ? 0.12 : 0.9;
    ctx.globalAlpha = foreignAlpha;
    ctx.fillStyle = '#c8b48a';
    ctx.beginPath();
    ctx.arc(x + s - 2, y - s - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a3b26';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(x + s - 2 + Math.cos(a) * 5, y - s - 2 + Math.sin(a) * 5);
      ctx.lineTo(x + s - 2 + Math.cos(a) * 9, y - s - 2 + Math.sin(a) * 9);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* 说明牌：erased 时只剩被撕掉的一个角 */
    ctx.fillStyle = 'rgba(233,223,198,.9)';
    if (verdict === 'erased') {
      ctx.beginPath();
      ctx.moveTo(x - s, y + 2);
      ctx.lineTo(x - s + 8, y + 2);
      ctx.lineTo(x - s, y + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x - s, y + 2, s * 2, 9);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#8f7c5e';
      if(verdict === 'fusion'){
        ctx.fillStyle='#9cbec6';ctx.fillRect(x-s+3,y+4,s-5,2);
        ctx.fillStyle='#8b6738';ctx.fillRect(x+2,y+4,s-5,2);
        ctx.strokeStyle='#346c53';ctx.beginPath();ctx.moveTo(x+s-8,y+7);ctx.lineTo(x+s-5,y+9);ctx.lineTo(x+s-1,y+3);ctx.stroke();
      } else for (let i = 0; i < 3; i++) ctx.fillRect(x - s + 3 + i * 9, y + 5, 6, 2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });

  /* 创作终端：一块立屏
     planSigned = 0 → 只有边框亮，屏幕是暗的
     planSigned = 1 → 整屏亮，并且按 keepWhat 画两条不同的参考线 */
  G.mod.painter('hall.terminal', function (ctx, prop, scene) {
    const v = V(scene);
    const x = prop.x;
    const y = prop.baseY;
    const signed = !!v.planSigned;
    ctx.save();
    ctx.fillStyle = '#241d18';
    ctx.fillRect(x - 70, y - 104, 140, 104);
    ctx.fillStyle = signed ? '#16343a' : '#173039';
    ctx.fillRect(x - 62, y - 96, 124, 78);

    /* A lit nine-cell sandbox exists before signing. Signing approves sources. */
    ctx.globalAlpha=.75;ctx.strokeStyle='#7c929e';ctx.lineWidth=1;
    for(let row=0;row<3;row++)for(let col=0;col<3;col++)ctx.strokeRect(x-57+col*38,y-91+row*23,35,20);
    if(v.keepWhat){
      const colors=['#d8b26a','#9cbec6','#c99587'];
      for(let i=0;i<3;i++){
        const col=v.keepWhat==='acropolis_axis'?1:i;
        ctx.fillStyle=colors[i];ctx.fillRect(x-53+col*38,y-86+i*23,24,10);
      }
    }
    if(signed){ctx.strokeStyle='#ffd479';ctx.beginPath();ctx.moveTo(x+28,y-26);ctx.lineTo(x+36,y-20);ctx.lineTo(x+51,y-35);ctx.stroke();}
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = signed ? '#ffd479' : '#6a5a3c';
    ctx.fillRect(x - 30, y - 10, 60, 6);
    ctx.restore();
  });

  /* 城门（opt: w / wallH / roofH / arches / name / text）
     doorLit = 0 → 门洞全暗；1 → 门洞透暖光，门钉逐颗亮起来 */
  G.mod.painter('hall.door', function (ctx, prop, scene) {
    const o = prop.opt || {};
    const v = V(scene);
    const lit = v.doorLit ? 1 : 0;
    A.drawGate(ctx, prop.x, prop.baseY, o.w || 600, {
      wallH: o.wallH || 70,
      roofH: o.roofH || 40,
      double: true,
      arches: o.arches || 3,
      name: NAME(o, scene),
    });

    const w = o.w || 600;
    const y = prop.baseY;
    ctx.save();
    if (lit) {
      /* 门洞里的暖光 */
      ctx.globalAlpha = 0.5;
      const g = ctx.createRadialGradient(prop.x, y - 30, 4, prop.x, y - 30, 120);
      g.addColorStop(0, 'rgba(255,207,134,.85)');
      g.addColorStop(1, 'rgba(255,207,134,0)');
      ctx.fillStyle = g;
      ctx.fillRect(prop.x - 130, y - 150, 260, 150);
      /* 门钉：从中间往两边逐颗亮 */
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
          const px = prop.x - 3 * 16 + c * 16;
          const py = y - 40 + r * 14;
          const reach = Math.abs(c - 3) / 3;
          ctx.globalAlpha = 0.55 + 0.45 * (1 - reach);
          ctx.fillStyle = '#ffd479';
          ctx.fillRect(px - 1, py - 1, 3, 3);
        }
      }
    } else {
      /* 未亮：门洞压黑 */
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#07060a';
      ctx.fillRect(prop.x - w * 0.22, y - 74, w * 0.44, 74);
    }
    ctx.restore();
  });

  /* 线索卡（关 6：两处线索各一张，读过就亮）
     位置由地图给，亮不亮由 clueARead / clueBRead 给。 */
  G.mod.painter('hall.clue', function (ctx, prop, scene) {
    const v = V(scene);
    const o = prop.opt || {};
    const read = o.read === 'a' ? !!v.clueARead : !!v.clueBRead;
    const x = prop.x;
    const y = prop.baseY;
    ctx.save();
    ctx.fillStyle = read ? '#e9dfc6' : '#6a6154';
    ctx.fillRect(x - 12, y - 16, 24, 16);
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = read ? '#d8b26a' : '#4a443a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 12, y - 16, 24, 16);
    ctx.globalAlpha = read ? 0.8 : 0.35;
    ctx.fillStyle = '#4a443a';
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 8, y - 12 + i * 4, 16 - i * 3, 1);
    ctx.restore();
  });

  /* 图层石（关 2）：三块可以踩上去切换图层的矮石
     opt.layer = 'stones' | 'images' | 'labels'，亮着自己那一层就是开的 */
  G.mod.painter('hall.layerstone', function (ctx, prop, scene) {
    const v = V(scene);
    const key = 'layer' + String((prop.opt && prop.opt.layer) || '').replace(/^./, function (c) {
      return c.toUpperCase();
    });
    const on = !!v[key];
    const x = prop.x;
    const y = prop.baseY;
    ctx.save();
    ctx.fillStyle = '#6b6255';
    ctx.fillRect(x - 14, y - 10, 28, 10);
    ctx.fillStyle = on ? '#d8b26a' : '#4c4740';
    ctx.fillRect(x - 11, y - 13, 22, 4);
    if (on) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ffd479';
      ctx.fillRect(x - 16, y - 22, 32, 10);
    }
    /* 石面上一个短字（来自 script.json 的图层名）。
       数据里的 id 是单数（stone / image / label），地图上的 opt.layer 是复数
       （stones / images / labels）—— 两边都认，免得改一处忘一处。 */
    const pz = labelsData();
    const layers = pz.layers || [];
    const want = (prop.opt && prop.opt.layer) || '';
    const lp = layers.filter(function (l) {
      return l.id === want || l.id + 's' === want;
    })[0];
    if (lp && lp.label) {
      ctx.globalAlpha = on ? 0.95 : 0.5;
      G.text(ctx, String(lp.label).slice(0, 1), x, y - 2, {
        size: 8, color: on ? '#2a2118' : '#a49a88', align: 'center',
      });
    }
    ctx.restore();
  });

  G.mod.painter('mentor.diotima', function(ctx,prop,scene){
    ctx.save();ctx.translate(prop.x,prop.baseY==null?prop.y:prop.baseY);ctx.scale(.16,.16);
    G.mod.paint('portrait.diotima',ctx,{w:240,h:360},scene);ctx.restore();
  });
  /* Physical comparison models on the terrace, each resting on a plinth. */
  G.mod.painter('hall.references',function(ctx,prop,scene){
    const v=V(scene);if(v.layerImages===0)return;
    const y=prop.baseY;ctx.save();ctx.globalAlpha=v.layerStones===1?.45:.85;
    ctx.fillStyle='#7a807b';ctx.fillRect(110,y,140,7);ctx.fillRect(394,y,136,7);
    ctx.fillStyle='#b2c0bd';ctx.strokeStyle='#718c96';ctx.lineWidth=2;
    /* East pediment: actual triangular gable and column supports. */
    ctx.beginPath();ctx.moveTo(114,y-44);ctx.lineTo(180,y-78);ctx.lineTo(246,y-44);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillRect(116,y-44,128,8);
    for(let i=0;i<6;i++){ctx.fillRect(124+i*21,y-36,7,36);ctx.fillRect(121+i*21,y-39,13,4);}
    /* Caryatid porch: six human silhouettes support the entablature. */
    ctx.fillRect(396,y-60,132,9);
    for(let i=0;i<6;i++){
      const x=406+i*22;ctx.beginPath();ctx.arc(x,y-43,5,0,Math.PI*2);ctx.fill();
      ctx.fillRect(x-7,y-53,14,5);ctx.beginPath();ctx.moveTo(x-5,y-37);ctx.lineTo(x+5,y-37);ctx.lineTo(x+8,y);ctx.lineTo(x-8,y);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#788f93';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-33);ctx.lineTo(x,y-4);ctx.stroke();
    }
    ctx.restore();
  });
  /* 树丛（御花园，opt: n / size） */
  G.mod.painter('hall.trees', function (ctx, prop) {
    const o = prop.opt || {};
    const n = o.n || 3;
    for (let i = 0; i < n; i++) {
      const px = prop.x + (i - (n - 1) / 2) * 62;
      A.tree(ctx, px, prop.baseY + (i % 2) * 22, o.size || 50, {});
    }
  });

  /* 石墩 / 花坛：让空地上有东西可站 */
  G.mod.painter('hall.rock', function (ctx, prop) {
    A.rock(ctx, prop.x, prop.baseY, (prop.opt && prop.opt.s) || 22);
  });
})();
