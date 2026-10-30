/* ============================================================
   紫禁城 · 铁火 — 地图模板 (MAP TEMPLATE)
   ------------------------------------------------------------
   这是一张「空白但已经合规」的地图：一座北京四合院小院。
   做新地图时：复制本文件 → 改 id / 尺寸 / 出生点 → 换掉 build() 里的内容。

   它演示了做一张新地图需要的全部东西：
     1. 世界尺寸与出生点           constructor / super({...})
     2. 地面预渲染                 buildGround + paintGround
     3. 墙体与建筑                 A.wallH / A.wallV / A.drawHall / A.drawGate
     4. 道具                       A.tree / A.lantern / A.lion / A.vat ...
     5. 碰撞                       this.solid() / this.solidRect()
     6. 深度排序                   一切立地物件靠 baseY（addEntity 自动记录）
     7. 交互点                     this.addInteract({x, y, r, label, action})
     8. NPC                        this.addNPC({...})
     9. 目标指引                   this.marker（金色浮标）
    10. 昼夜                       this.night + this.addLight() + N 键切换
    11. 羊皮纸地图                 M 键 + drawMap()
    12. HUD                       G.ui.location / objective / clock

   约定：坐标一律整数；尺寸按 art.js 的档位选（见 STYLE.md 第 4 节）。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  class TemplateScene extends G.WorldScene {
    constructor() {
      super({
        id: 'template',
        // 世界尺寸：约 1.75 屏宽 × 2.2 屏高。640×360 是视口，不是地图。
        w: 1120, h: 800,
        spawn: { x: 560, y: 650 },
        clock: '16:20',
        ambient: 'palace',
        lookAhead: 36,
      });

      this.title = '示例地图 · 城东小院';
      this.marker = { x: 560, y: 360 };   // 目标浮标
      this.mapOpen = false;

      // 羊皮纸导览图上要画的地标
      this.landmarks = [
        { x: 560, y: 300, name: '正房', w: 240, kind: 'hall' },
        { x: 310, y: 430, name: '西厢', w: 130, kind: 'hall' },
        { x: 810, y: 430, name: '东厢', w: 130, kind: 'hall' },
        { x: 560, y: 780, name: '垂花门', w: 130, kind: 'gate' },
        { x: 150, y: 600, name: '老槐', w: 20, kind: 'tree' },
      ];

      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    /* ============================================================
       进入
       ============================================================ */
    onEnter() {
      G.ui.location('家', '城东小院');
      this.objective('在院子里随便走走 · M 导览图 · N 昼夜');
      this.updateHud();
      G.audio.ambient('palace');
      // 首次进入给一段旁白（narrator: true 用楷体、不显示名字牌）
      if (!G.save.data.flags.tplIntro) {
        G.save.data.flags.tplIntro = true;
        G.save.persist();
        setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show([
            { name: '旅行手账', narrator: true, text: '一座普通的北京小院。灰砖、红门、两棵老槐。' },
            { name: '旅行手账', text: 'M 键看导览图，N 键切昼夜。做新地图时，把这一段换成你的故事就行。' },
          ]);
        }, 500);
      }
    }

    /* ============================================================
       建 造 —— 新地图主要改这里
       ============================================================ */
    build() {
      /* ---------- 1. 北面：墙后的一线屋脊，负责纵深 ---------- */
      this.addBuilding(180, 246, (c) => A.hutong(c, 180, 246, 130, { h: 18 }));
      this.addBuilding(940, 248, (c) => A.hutong(c, 940, 248, 120, { h: 17, tree: true }));
      this.addEntity({ x: 390, y: 244, baseY: 244, draw: (c) => A.tree(c, 390, 244, 0.95, { autumn: true }) });
      this.addEntity({ x: 742, y: 236, baseY: 236, draw: (c) => A.tree(c, 742, 236, 0.82) });

      /* ---------- 2. 后墙：正房左右两段院墙 ---------- */
      // A.wallH(x1, x2, baseY, h)：一段横向宫墙，带垛口与顶部金线
      this.addBuilding(245, 300, (c) => A.wallH(c, 60, 430, 300, 26));
      this.addBuilding(875, 300, (c) => A.wallH(c, 690, 1060, 300, 26));
      this.solid(60, 272, 370, 22);
      this.solid(690, 272, 370, 22);

      /* ---------- 3. 东西两侧院墙 ---------- */
      // A.wallV(x, y1, y2, w)：纵向墙（俯视时看到墙脊）
      this.addBuilding(62, 790, (c) => A.wallV(c, 55, 300, 790, 14));
      this.addBuilding(1057, 790, (c) => A.wallV(c, 1050, 300, 790, 14));
      this.solid(48, 300, 20, 490);
      this.solid(1044, 300, 20, 490);

      /* ---------- 4. 正房（重檐，院里最大的一栋） ---------- */
      this.addBuilding(560, 300, (c) => {
        A.drawHall(c, 560, 300, 240, {
          wallH: 34, roofH: 30, double: true, name: '正房', bays: 5,
          platformPad: 32, stairW: 44,
        });
      });
      // 建筑只挡住「屋身」那一条，不要挡住整块屋顶 —— 否则走不到屋檐下
      this.solidRect(560, 300, 242, 26);
      this.addInteract({
        x: 560, y: 344, r: 42, label: '推开正房的门',
        action: () => G.dialog.show([
          { name: '正房', text: '八仙桌、条案、两把太师椅。窗纸透进来的光是暖的。' },
          { name: '旅行手账', text: '（示例交互：这里可以换成你的剧情、商店或场景切换。）' },
        ]),
      });

      /* ---------- 4. 东西厢房（单檐，配殿档位） ---------- */
      const wings = [
        { x: 310, y: 430, name: '西厢' },
        { x: 810, y: 430, name: '东厢' },
      ];
      wings.forEach((b) => {
        this.addBuilding(b.x, b.y, (c) => {
          A.drawHall(c, b.x, b.y, 130, {
            wallH: 24, roofH: 22, name: b.name, platformPad: 22, stairW: 30,
          });
        });
        this.solidRect(b.x, b.y, 132, 20);
        this.addInteract({
          x: b.x, y: b.y + 40, r: 34, label: '看看' + b.name,
          action: () => G.dialog.show([
            { name: b.name, text: '屋里堆着旧家具，门轴一推就响。' },
          ]),
        });
      });

      /* ---------- 5. 南墙 + 垂花门（唯一的出入口） ---------- */
      this.addBuilding(277, 780, (c) => A.wallH(c, 60, 495, 780, 26));
      this.addBuilding(842, 780, (c) => A.wallH(c, 625, 1060, 780, 26));
      this.solid(60, 752, 435, 22);
      this.solid(625, 752, 435, 22);

      this.addBuilding(560, 780, (c) => {
        A.drawGate(c, 560, 780, 130, {
          wallH: 30, roofH: 22, double: true, arches: 1, name: '垂花门',
        });
      });
      this.solidRect(560, 780, 132, 22);
      this.addInteract({
        x: 560, y: 742, r: 38, label: '走出垂花门',
        action: () => G.fade.to(() => {
          this.setPlayer(560, 650);
          G.ui.toast('示例：这里可以 G.setScene(new 下一张地图())', 'good');
          G.audio.sfx('page');
        }),
      });

      /* ---------- 6. 石狮（左右对称） ---------- */
      this.addEntity({ x: 470, y: 326, baseY: 326, draw: (c) => A.lion(c, 470, 326, false) });
      this.addEntity({ x: 650, y: 326, baseY: 326, draw: (c) => A.lion(c, 650, 326, true) });
      this.solid(462, 318, 16, 8);
      this.solid(642, 318, 16, 8);

      /* ---------- 7. 水缸、石凳、导览牌 ---------- */
      for (const vx of [430, 690]) {
        this.addEntity({ x: vx, y: 452, baseY: 452, draw: (c) => A.vat(c, vx, 452, { water: true }) });
        this.solid(vx - 8, 444, 16, 8);
      }

      this.addEntity({ x: 400, y: 620, baseY: 620, draw: (c) => A.bench(c, 400, 620) });
      this.addEntity({ x: 720, y: 620, baseY: 620, draw: (c) => A.bench(c, 720, 620) });
      this.solid(392, 614, 16, 6);
      this.solid(712, 614, 16, 6);

      this.addEntity({ x: 660, y: 660, baseY: 660, draw: (c) => A.sign(c, 660, 660, '导览', { w: 46 }) });
      this.addInteract({
        x: 660, y: 674, r: 30, label: '读一读导览牌',
        action: () => G.dialog.show([
          { name: '导览牌', text: '城东小院 · 一进院。北房三间，东西厢房各两间，南面垂花门。' },
          { name: '旅行手账', text: '院子里所有尺寸，都能在 STYLE.md 里查到。' },
        ]),
      });

      /* ---------- 8. 老树 + 树影 ---------- */
      this.addEntity({ x: 150, y: 600, baseY: 600, draw: (c) => A.tree(c, 150, 600, 1.15, { autumn: true }) });
      this.addEntity({ x: 990, y: 585, baseY: 585, draw: (c) => A.tree(c, 990, 585, 1.0) });
      this.addEntity({ x: 250, y: 480, baseY: 480, draw: (c) => A.tree(c, 250, 480, 0.78, { autumn: true }) });
      this.solid(146, 594, 8, 6);
      this.solid(986, 579, 8, 6);
      this.solid(246, 474, 8, 6);
      this.addInteract({
        x: 150, y: 606, r: 30, label: '摸摸老槐树',
        action: () => G.dialog.show([
          { name: '老槐', text: '树皮裂得像老人的手背。树下比别处凉。' },
        ]),
      });

      /* ---------- 9. 灯笼（夜里同时是光点） ---------- */
      for (const lx of [462, 658]) {
        this.addEntity({ x: lx, y: 292, baseY: 292, draw: (c) => A.lantern(c, lx, 292, { h: 30, night: this.night }) });
        this.addLight(lx, 264, 112, 'rgba(255,150,60,.6)', 0.5);
      }
      for (const lx of [480, 640]) {
        this.addEntity({ x: lx, y: 794, baseY: 794, draw: (c) => A.lantern(c, lx, 794, { h: 26, night: this.night }) });
        this.addLight(lx, 768, 104, 'rgba(255,150,60,.55)', 0.45);
      }
      // 门口的一团暖光：夜里人都聚在灯下
      this.addLight(560, 770, 210, 'rgba(255,140,50,.4)', 0.3);

      /* ---------- 10. 宫猫（纯装饰） ---------- */
      this.addEntity({ x: 830, y: 664, baseY: 664, draw: (c) => A.cat(c, 830, 664, this.time, { color: '#b87845' }) });
      this.addInteract({
        x: 830, y: 670, r: 26, label: '猫在打盹',
        action: () => G.dialog.show([
          { name: '宫猫', text: '（尾巴尖动了一下，懒得睁眼。）' },
        ]),
      });

      /* ---------- 11. NPC ---------- */
      this.addNPC({
        x: 560, y: 540, name: '院主', palette: A.actorPalettes.guard,
        dir: 'down', quest: true,
        lines: [
          { name: '院主', text: '来啦？先坐，茶还烫着。' },
          { name: '院主', text: '院子里能走的地方都走过了？后头那棵老槐，比我岁数大。' },
        ],
      });
      this.addNPC({
        x: 350, y: 700, name: '游客', palette: A.actorPalettes.tourist,
        dir: 'right', wander: true,
        lines: [
          { name: '游客', text: '这院子的比例真舒服，走两步就到头。' },
        ],
      });
      this.addNPC({
        x: 735, y: 575, name: '摄影的', palette: A.actorPalettes.tourist2,
        dir: 'left',
        lines: [
          { name: '摄影的', text: '等太阳再斜一点，屋檐会在地上拉出很长一道影子。' },
        ],
      });

      /* ---------- 12. 中庭陈设：给画面加密度，别让院子空着 ---------- */
      this.addEntity({ x: 330, y: 570, baseY: 570, draw: (c) => A.sundial(c, 330, 570) });
      this.solid(322, 562, 14, 6);

      this.addEntity({ x: 800, y: 530, baseY: 530, draw: (c) => A.rock(c, 800, 530, 1.15) });
      this.solid(786, 518, 28, 12);

      this.addEntity({ x: 1000, y: 480, baseY: 480, draw: (c) => A.pine(c, 1000, 480, 0.92) });
      this.solid(996, 472, 8, 6);
      this.addEntity({ x: 120, y: 470, baseY: 470, draw: (c) => A.pine(c, 120, 470, 0.86) });
      this.solid(116, 462, 8, 6);

      // 纯装饰的路人：不进 interactables，也不挡路
      const strollers = [[350, 700, 'tourist2', 'right'], [640, 600, 'child', 'up'], [880, 610, 'auntie', 'left']];
      for (const [sx, sy, pal, dir] of strollers) {
        this.addEntity({
          x: sx, y: sy, baseY: sy,
          draw: (c) => A.drawActor(c, sx, sy, {
            dir, time: this.time + sx * 0.01, scale: 1.15,
            palette: A.actorPalettes[pal], moving: false,
          }),
        });
      }
    }

    /* ============================================================
       地 面 —— 全部画进一张离屏 canvas，运行时只贴一次
       ============================================================ */
    paintGround(c) {
      /* 1) 底色：院外的夯土 */
      c.fillStyle = '#6a5943';
      c.fillRect(0, 0, this.w, this.h);

      /* 2) 北面的胡同：墙后那一条地，负责纵深，不让画面上沿空着 */
      A.paving(c, 0, 120, this.w, 175, '#8a7a62', '#7c6c56', 30, 20);
      A.paving(c, 0, 240, this.w, 60, '#7e6f59', '#71624d', 31, 18);

      /* 3) 院内铺装（灰砖，18px 一块；底色与暗色只差一档，避免像坐标纸） */
      A.paving(c, 60, 290, 1000, 490, '#b4a789', '#aa9d80', 21, 18);

      /* 4) 中轴甬道（亮一档，中间压一条金线） */
      A.paving(c, 500, 290, 120, 490, '#c4b696', '#baab8b', 22, 18);
      c.fillStyle = 'rgba(216,178,106,.42)';
      c.fillRect(559, 290, 2, 490);
      c.fillStyle = 'rgba(70,55,38,.22)';
      c.fillRect(500, 290, 1, 490);
      c.fillRect(619, 290, 1, 490);

      /* 5) 靠墙的花圃：窄长条，不抢中庭 */
      for (const bed of [[70, 460, 80, 230], [970, 460, 80, 230]]) {
        A.paving(c, bed[0], bed[1], bed[2], bed[3], '#6d7c52', '#5f6e47', 23, 20);
        c.strokeStyle = 'rgba(60,48,32,.35)';
        c.lineWidth = 1;
        c.strokeRect(bed[0] + 0.5, bed[1] + 0.5, bed[2] - 1, bed[3] - 1);
        for (let i = 0; i < 22; i++) {
          const fx = (bed[0] + 6 + G.hash(i, 1, 91 + bed[0]) * (bed[2] - 12)) | 0;
          const fy = (bed[1] + 6 + G.hash(i, 2, 92 + bed[0]) * (bed[3] - 12)) | 0;
          c.fillStyle = G.pick(['#b65a62', '#d8a14c', '#e0d0a4']);
          c.fillRect(fx, fy, 1, 1);
          c.fillStyle = 'rgba(63,83,48,.55)';
          c.fillRect(fx, fy + 1, 1, 1);
        }
      }

      /* 6) 树影：单一光源，影子一律甩向左下 */
      for (const [sx, sy, r] of [[150, 602, 34], [990, 587, 28], [250, 482, 20]]) {
        c.save();
        c.globalAlpha = 0.12;
        c.fillStyle = '#2d2318';
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.ellipse(sx - i * 9, sy + 2 + (i % 2) * 3, r - i * 5, 5, 0, 0, G.TAU);
          c.fill();
        }
        c.restore();
      }

      /* 7) 落叶与小石子：只 1px，密度要低 */
      for (let i = 0; i < 80; i++) {
        const lx = (70 + G.hash(i, 51, 111) * 990) | 0;
        const ly = (300 + G.hash(i, 52, 112) * 460) | 0;
        c.fillStyle = G.pick(['rgba(184,124,54,.45)', 'rgba(205,151,62,.4)', 'rgba(139,94,44,.35)']);
        c.fillRect(lx, ly, 1, 1);
      }

      /* 8) 墙根的长投影 */
      const wg = c.createLinearGradient(60, 0, 100, 0);
      wg.addColorStop(0, 'rgba(50,30,20,.18)');
      wg.addColorStop(1, 'rgba(50,30,20,0)');
      c.fillStyle = wg;
      c.fillRect(60, 300, 40, 470);

      /* 9) 地面文字：低透明度，像刻在石头上 */
      c.save();
      c.globalAlpha = 0.16;
      G.text(c, '城 东 小 院', 560, 470, { size: 9, color: '#f2e4c6', align: 'center' });
      c.restore();
    }

    /* ============================================================
       每 帧 逻 辑
       ============================================================ */
    update(dt) {
      // M：羊皮纸导览图
      if (G.input.wasPressed('KeyM') && !G.isWorldPaused()) {
        this.toggleMap();
        G.input.clearPressed();
      }
      // N：昼夜切换（正式地图里由剧情 / 时间驱动）
      if (G.input.wasPressed('KeyN') && !G.isWorldPaused()) {
        this.night = !this.night;
        G.ui.toast(this.night ? '入夜了 · 灯笼亮起' : '天亮了', 'good');
        G.audio.sfx('page');
        G.input.clearPressed();
      }
      if (this.mapOpen) {
        this.time += dt;
        this.player.moving = false;
        G.fx.update(dt);
        return;
      }
      super.update(dt);
    }

    toggleMap(force) {
      this.mapOpen = force == null ? !this.mapOpen : !!force;
      G.audio.sfx('page');
      const hud = G.$('#hud');
      if (hud) hud.classList.toggle('map-open', this.mapOpen);
      if (this.mapOpen) {
        this.player.moving = false;
        G.ui.prompt(null);
      }
    }

    /* ============================================================
       羊 皮 纸 地 图 —— 世界坐标 → 纸面坐标
       ============================================================ */
    drawMap(ctx) {
      const mx = 110, my = 34, mw = 420, mh = 262;
      const X = (wx) => mx + (wx / this.w) * mw;
      const Y = (wy) => my + (wy / this.h) * mh;

      ctx.save();
      ctx.fillStyle = 'rgba(10,8,6,.84)';
      ctx.fillRect(0, 0, G.W, G.H);

      /* 纸 */
      ctx.fillStyle = '#e9d9b8';
      ctx.fillRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 150; i++) {
        ctx.fillStyle = G.hash(i, 3, 203) > 0.5 ? '#a68b5f' : '#fff5dd';
        ctx.fillRect(mx - 10 + G.hash(i, 1, 201) * (mw + 20), my - 18 + G.hash(i, 2, 202) * (mh + 36), 1, 1);
      }
      ctx.restore();
      ctx.strokeStyle = '#5f4529'; ctx.lineWidth = 2;
      ctx.strokeRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.strokeStyle = '#b08a55'; ctx.lineWidth = 1;
      ctx.strokeRect(mx - 9.5, my - 17.5, mw + 19, mh + 35);

      G.text(ctx, '城东小院 · 导览图', mx - 2, my - 7, { size: 11, color: '#3d2d1c', weight: 'bold' });
      G.text(ctx, 'M 关闭', mx + mw - 32, my - 7, { size: 7, color: '#7d684c' });

      // 淡印
      ctx.save();
      ctx.globalAlpha = 0.05;
      G.text(ctx, '院', mx + mw / 2, my + mh / 2 + 40, { size: 120, color: '#6b2e22', align: 'center', font: '"KaiTi","STKaiti",serif' });
      ctx.restore();

      // 院墙轮廓
      ctx.strokeStyle = 'rgba(122,60,40,.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(55), Y(300));
      ctx.lineTo(X(1050), Y(300));
      ctx.lineTo(X(1050), Y(780));
      ctx.lineTo(X(55), Y(780));
      ctx.closePath();
      ctx.stroke();

      // 北面的胡同（虚线示意，别让纸头空着）
      const hx = X(30), hy = Y(150), hw = X(1090) - X(30), hh = Y(288) - Y(150);
      ctx.save();
      ctx.fillStyle = 'rgba(140,120,88,.16)';
      ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = 'rgba(120,96,64,.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1);
      ctx.restore();
      G.text(ctx, '北 · 胡同', hx + 6, hy + hh - 5, { size: 7, color: '#7a6242' });

      // 地标
      for (const l of this.landmarks) {
        const px = X(l.x), py = Y(l.y);
        if (l.kind === 'tree') {
          ctx.fillStyle = 'rgba(95,116,71,.75)';
          ctx.beginPath(); ctx.arc(px, py, 4, 0, G.TAU); ctx.fill();
        } else {
          const bw = Math.max(12, (l.w / this.w) * mw * 1.35);
          const bh = 9;
          ctx.fillStyle = l.kind === 'gate' ? 'rgba(155,56,40,.55)' : 'rgba(155,56,40,.38)';
          ctx.fillRect(px - bw / 2, py - bh / 2, bw, bh);
          ctx.strokeStyle = 'rgba(90,45,30,.7)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - bw / 2 + 0.5, py - bh / 2 + 0.5, bw - 1, bh - 1);
        }
        G.text(ctx, l.name, px, py - 8, {
          size: 7, color: '#4a3520', align: 'center',
          outline: 'rgba(233,217,184,.9)', outlineWidth: 2,
        });
      }

      // 当前位置
      const px = X(this.player.x), py = Y(this.player.y);
      ctx.fillStyle = 'rgba(163,60,43,.9)';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, G.TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(163,60,43,.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(this.time * 3) * 1.5, 0, G.TAU); ctx.stroke();

      // 图例（压在纸面下沿的空白里）
      ctx.fillStyle = 'rgba(163,60,43,.9)';
      ctx.fillRect(mx - 2, my + mh + 8, 4, 4);
      G.text(ctx, '当前位置', mx + 8, my + mh + 13, { size: 7, color: '#5f4529' });
      G.text(ctx, '北 ↑', mx + mw - 26, my + mh + 13, { size: 7, color: '#7d684c' });
      ctx.restore();
    }

    drawScreen(ctx) {
      if (this.mapOpen) this.drawMap(ctx);
    }
  }

  G.TemplateScene = TemplateScene;
})();
