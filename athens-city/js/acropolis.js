/* ============================================================
   雅典 · 圣火 — the Acropolis
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  const ITEMS = {
    olive: { name: '橄榄木柴', x: 512, y: 980, desc: '卫城圣橄榄树修下的枝干，木质紧密，烧起来是清甜的香。' },
    resin: { name: '松脂火绒', x: 1148, y: 348, desc: '北坡松林里收的松脂，指尖一捻就粘，见火就着。' },
    brazier: { name: '青铜火盆', x: 1010, y: 1434, desc: '铜匠铺里打好的三足火盆，盆沿还留着一道新锉的亮边。' },
  };

  class AcropolisScene extends G.WorldScene {
    constructor() {
      super({
        id: 'acropolis', w: 1500, h: 1620, spawn: { x: 750, y: 1300 },
        clock: '16:20', ambient: 'palace', lookAhead: 52, gradeStrength: 0.45,
      });
      this.title = '卫城';
      this.marker = { x: 750, y: 620 };
      this.mapOpen = false;
      this.night = false;
      this.nightStrength = 0.5;
      this.build();
      this.buildGround((c) => this.paintGround(c));
      this.refreshNight();
    }

    /* ============================================================
       build
       ============================================================ */
    build() {
      /* ---------------- the rock rim ---------------- */
      this.solid(150, 96, 14, 1440);
      this.solid(1336, 96, 14, 1440);
      this.solid(150, 96, 1200, 14);
      this.solid(150, 1536, 1200, 14);

      /* ---------------- Propylaea (south entrance) ---------------- */
      this.addEntity({
        x: 750, y: 1500, baseY: 1500,
        draw: (c) => {
          A.drawGate(c, 750, 1500, 300, { wallH: 50, roofH: 26, name: '卫城山门' });
          A.wallV(c, 292, 1430, 1500, 12, { color: P.marbleMid });
          A.wallV(c, 1196, 1430, 1500, 12, { color: P.marbleMid });
        },
      });
      this.solid(590, 1478, 140, 24);
      this.solid(760, 1478, 140, 24);
      this.addInteract({
        x: 750, y: 1462, r: 40, label: '回望卫城山门',
        action: () => {
          if (G.unlock) G.unlock('propylaea');
          G.dialog.show([
            { name: '卫城山门', text: '山门建在西坡的陡处，中间是宽大的门廊，两侧各有一座翼廊。走进这道门，才算真正上了卫城。' },
            { name: '旅行手账', text: '石块被两千五百年的脚磨得发亮。' },
          ]);
        },
      });

      /* ---------------- Nike temple ---------------- */
      this.addBuilding(980, 1420, (c) => {
        A.drawTemple(c, 980, 1420, 74, { columnH: 20, columnW: 5, columns: 4, steps: 2, entH: 7, pedH: 8, name: '' });
      });
      this.solid(940, 1388, 80, 22);
      this.addInteract({
        x: 980, y: 1438, r: 30, label: '看看胜利女神庙',
        action: () => {
          if (G.unlock) G.unlock('nike');
          G.dialog.show([
            { name: '雅典娜·尼刻神庙', text: '供奉胜利女神尼刻的小神庙，立在山门南翼的堡台上。从前这里也有一座无翼的尼刻像，好让胜利永远留在雅典。' },
          ]);
        },
      });

      /* ---------------- Parthenon ---------------- */
      this.addBuilding(750, 900, (c) => {
        A.drawTemple(c, 750, 900, 470, {
          columnH: 74, columnW: 8, columns: 8, steps: 3, entH: 15, pedH: 20, name: 'ΠΑΡΘΕΝΩΝ',
        });
      });
      this.solid(560, 862, 380, 40);
      this.addInteract({
        x: 750, y: 918, r: 44, label: '仰看帕特农神庙',
        action: () => {
          if (G.unlock) G.unlock('parthenon');
          G.dialog.show([
            { name: '帕特农神庙', text: '雅典娜的居所，公元前 447 年起建。八根柱子迎向东升的太阳，山花里刻着她的诞生。' },
            { name: '帕特农神庙', text: '整座神庙没有一根绝对的直线——每一块石头都微微向内收，让眼睛看见的才是「直」。' },
            { name: '旅行手账', text: '柱子上的凹槽，像被风梳过。' },
          ]);
        },
      });
      this.solid(556, 900, 388, 6);
      // east front steps are open; west back too

      /* ---------------- Erechtheion ---------------- */
      this.addBuilding(1090, 800, (c) => {
        A.drawTemple(c, 1090, 800, 190, {
          columnH: 34, columnW: 6, columns: 5, steps: 2, entH: 10, pedH: 12, name: '',
        });
        A.caryatidPorch(c, 1000, 830, 1);
      });
      this.solid(990, 760, 210, 30);
      this.addInteract({
        x: 1090, y: 820, r: 40, label: '走向厄瑞克忒翁神庙',
        action: () => {
          if (G.unlock) G.unlock('erechtheion');
          G.dialog.show([
            { name: '厄瑞克忒翁神庙', text: '传说这里是雅典娜与波塞冬争当城市守护神的地方。南廊的六位少女雕像，用头顶着屋檐。' },
            { name: '旅行手账', text: '她们站得很直，可是风吹过的时候，好像连石头都在呼吸。' },
          ]);
        },
      });

      /* ---------------- Sacred olive tree ---------------- */
      this.addEntity({
        x: 512, y: 990, baseY: 990,
        draw: (c) => A.oliveTree(c, 512, 990, 1.15, { pot: false }),
      });
      this.solid(500, 980, 26, 12);
      this.addInteract({
        x: 512, y: 976, r: 40, label: '圣橄榄树下',
        action: () => this.oliveTree(),
      });

      /* ---------------- Athena Promachos ---------------- */
      this.addEntity({
        x: 750, y: 1150, baseY: 1150,
        draw: (c) => A.athenaStatue(c, 750, 1150, 1.3, this.time),
      });
      this.solid(736, 1134, 28, 16);
      this.addInteract({
        x: 750, y: 1136, r: 34, label: '走到雅典娜神像前',
        action: () => {
          if (G.unlock) G.unlock('promachos');
          G.dialog.show([
            { name: '雅典娜·普罗马霍斯', text: '「先锋雅典娜」的巨型铜像，从前站在卫城正中，盾与长矛在阳光下能远远望见。' },
          ]);
        },
      });

      /* ---------------- Altar of Athena & 老赫 ---------------- */
      this.addEntity({
        x: 750, y: 520, baseY: 520,
        draw: (c) => A.altar(c, 750, 520, this.night, this.time),
      });
      this.solid(734, 512, 32, 16);
      this.addInteract({
        x: 750, y: 500, r: 34, label: '看看雅典娜祭坛',
        action: () => {
          if (G.unlock) G.unlock('altar');
          G.dialog.show([
            { name: '雅典娜祭坛', text: '卫城北缘的祭坛，正对着帕特农神庙的西山墙。泛雅典娜节的火，就是从这里点起来的。' },
          ]);
        },
      });
      this.addNPC({
        x: 812, y: 560, name: '匠人 老赫', palette: A.actorPalettes.priest,
        accessory: 'torch', radius: 30, quest: () => !G.save.flag('finished'),
        getLines: () => this.hepLines(),
        onTalk: () => this.onHepTalk(),
      });

      /* ---------------- museum ---------------- */
      this.addBuilding(330, 1240, (c) => {
        A.stoa(c, 330, 1240, 200, { h: 28 });
        A.sign(c, 330, 1214, '卫城博物馆', { w: 70, size: 6 });
      });
      this.solid(236, 1206, 200, 28);
      this.addInteract({
        x: 330, y: 1258, r: 34, label: '走进卫城博物馆',
        action: () => {
          if (G.unlock) G.unlock('museum');
          G.dialog.show([
            { name: '卫城博物馆', text: '玻璃地板下是两千年前的街区地基，头顶是同样尺寸的帕特农柱廊。真品与复制品隔着玻璃对望。' },
          ]);
        },
      });

      /* ---------------- west sanctuary & north terrace ---------------- */
      // the Brauronion — a stoa along the west side
      this.addBuilding(330, 900, (c) => {
        A.stoa(c, 330, 900, 250, { h: 30 });
      });
      this.solid(208, 866, 250, 32);
      this.addInteract({
        x: 330, y: 918, r: 36, label: '走进西侧的神域',
        action: () => {
          if (G.unlock) G.unlock('museum');
          G.dialog.show([
            { name: '西侧神域', text: '一排柱廊贴着山岩，里面供着阿耳忒弥斯的神像。风穿过柱子，声音像退潮。' },
          ]);
        },
      });
      // a small shrine on the north terrace
      this.addBuilding(420, 470, (c) => {
        A.drawTemple(c, 420, 470, 96, {
          columnH: 22, columnW: 5, columns: 4, steps: 2, entH: 7, pedH: 8, name: '',
        });
      });
      this.solid(376, 440, 88, 24);
      this.addInteract({
        x: 420, y: 488, r: 30, label: '在北台的小神庙前停留',
        action: () => {
          G.dialog.show([
            { name: '北台小神庙', text: '这里原是宙斯·波利欧斯的小圣所。从台边望下去，普拉卡的屋顶一直铺到山脚。' },
          ]);
        },
      });
      // north parapet and tripods
      this.addEntity({
        x: 900, y: 300, baseY: 300,
        draw: (c) => {
          for (let x = 700; x < 1100; x += 14) {
            A.r(c, x, 296, 13, 6, '#c3b897');
            A.r(c, x, 296, 13, 1, '#ddd3b5');
            A.r(c, x, 301, 13, 1, '#8f8267');
          }
        },
      });
      this.addEntity({ x: 1080, y: 470, baseY: 470, draw: (c) => A.tripod(c, 1080, 470) });
      this.addEntity({ x: 560, y: 430, baseY: 430, draw: (c) => A.tripod(c, 560, 430) });
      this.addEntity({ x: 900, y: 400, baseY: 400, draw: (c) => A.oliveTree(c, 900, 400, 0.8, {}) });
      this.addEntity({ x: 640, y: 380, baseY: 380, draw: (c) => A.oliveTree(c, 640, 380, 0.75, {}) });
      this.addEntity({ x: 1240, y: 460, baseY: 460, draw: (c) => A.oliveTree(c, 1240, 460, 0.8, {}) });
      for (const [bx, by] of [[560, 560], [940, 560], [480, 700], [1020, 700]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => A.bush(c, bx, by, 0.9) });
      }

      /* ---------------- bronze workshop ---------------- */
      this.addBuilding(1010, 1450, (c) => {
        A.r(c, 950, 1416, 120, 32, '#b3a68a');
        A.r(c, 948, 1410, 124, 8, P.terra);
        A.r(c, 948, 1410, 124, 2, P.terraHi);
        for (let i = 0; i < 5; i++) A.column(c, 962 + i * 24, 1450, 32, 5, {});
        // forge glow
        A.r(c, 992, 1420, 24, 18, '#4a3428');
        A.r(c, 996, 1424, 16, 10, '#a8522c');
        A.r(c, 1000, 1426, 8, 6, '#ffb347');
        A.glow(c, 1004, 1428, 28, 'rgba(255,168,70,.35)', 0.5);
      });
      this.solid(944, 1412, 132, 30);
      this.addInteract({
        x: 1010, y: 1470, r: 36, label: '铜匠铺 · 取火盆',
        action: () => this.takeBrazier(),
      });

      /* ---------------- belvedere ---------------- */
      this.addEntity({
        x: 1200, y: 1140, baseY: 1140,
        draw: (c) => {
          for (let x = 1150; x < 1250; x += 12) {
            A.r(c, x, 1136, 11, 8, P.marble);
            A.r(c, x, 1136, 11, 1, P.marbleHi);
          }
        },
      });
      this.addInteract({
        x: 1200, y: 1156, r: 34, label: '在西观景台远眺',
        action: () => {
          if (G.unlock) G.unlock('belvedere');
          G.dialog.show([
            { name: '卫城观景台', text: '脚下是普拉卡的白房子，再远处是吕卡维多斯山，最远处那一点蓝是比雷埃夫斯港。' },
            { name: '旅行手账', text: '风从萨罗尼克湾一路吹上来，带着盐味。' },
          ]);
        },
      });

      /* ---------------- pines for resin ---------------- */
      for (const [px, py] of [[1080, 340], [1120, 300], [1160, 380], [1200, 320], [1240, 400]]) {
        this.addEntity({
          x: px, y: py, baseY: py,
          draw: (c) => A.pine(c, px, py, 1.2),
        });
      }
      this.addEntity({
        x: 1150, y: 352, baseY: 352,
        draw: (c) => this.resinDraw(c),
      });
      this.addInteract({
        x: 1148, y: 352, r: 34, label: '收集松脂',
        action: () => this.takeResin(),
      });

      /* ---------------- braziers, ruins and greenery ---------------- */
      // standing braziers that light after dark
      for (const [bx, by] of [[700, 1244], [800, 1244], [700, 724], [800, 724], [700, 1180], [800, 1180]]) {
        this.addEntity({
          x: bx, y: by, baseY: by,
          draw: (c) => A.brazier(c, bx, by, this.night, this.time),
        });
        this.solid(bx - 7, by - 5, 14, 5);
        this.addInteract({
          x: bx, y: by - 12, r: 22, label: '看看火盆',
          action: () => G.dialog.show([
            { name: '青铜火盆', text: this.night ? '火苗被风扯成一条斜线，映着脚下的石板。' : '火盆里堆着干透的松针，等着夜里点火。' },
          ]),
        });
      }
      // fallen drums and rubble along the sides
      for (const [dx, dy, dl] of [[620, 1120, 26], [860, 1040, 20], [560, 840, 24], [920, 760, 18], [640, 580, 20], [880, 560, 22]]) {
        this.addEntity({ x: dx, y: dy, baseY: dy, draw: (c) => A.columnDrum(c, dx, dy, dl, { s: 1 }) });
      }
      this.addEntity({ x: 420, y: 900, baseY: 900, draw: (c) => A.rubble(c, 420, 900, 1.6) });
      this.addEntity({ x: 1180, y: 620, baseY: 620, draw: (c) => A.rubble(c, 1180, 620, 1.4) });
      this.addEntity({ x: 960, y: 1310, baseY: 1310, draw: (c) => A.rubble(c, 960, 1310, 1.2) });
      // laurel bushes and sacred trees
      for (const [bx, by, bs] of [[600, 1180, 1], [900, 1180, 1], [600, 960, 1.1], [900, 960, 1.1], [430, 1180, 0.9], [1080, 1080, 0.9], [400, 760, 0.9], [1120, 620, 0.85]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => A.bush(c, bx, by, bs) });
      }
      this.addEntity({ x: 400, y: 1080, baseY: 1080, draw: (c) => A.oliveTree(c, 400, 1080, 0.9, {}) });
      this.addEntity({ x: 1260, y: 980, baseY: 980, draw: (c) => A.oliveTree(c, 1260, 980, 0.9, {}) });
      // inscribed steles
      for (const [sx, sy, txt] of [[600, 1320, '卫城大道'], [1090, 1120, '帕特农'], [760, 470, '雅典娜祭坛']]) {
        this.addEntity({ x: sx, y: sy, baseY: sy, draw: (c) => A.sign(c, sx, sy, txt, { w: 54, size: 6 }) });
      }
      // tripods and a stray goat
      this.addEntity({ x: 940, y: 1180, baseY: 1180, draw: (c) => A.tripod(c, 940, 1180) });
      this.addEntity({ x: 1220, y: 1300, baseY: 1300, draw: (c) => A.goat(c, 1220, 1300, this.time) });

      /* ---------------- laurel & props ---------------- */
      for (const [lx, ly] of [[420, 1150], [1080, 1250], [880, 700], [400, 700], [1180, 900]]) {
        this.addEntity({
          x: lx, y: ly, baseY: ly,
          draw: (c) => A.laurel(c, lx, ly, 14),
        });
      }
      // stone benches
      for (const [bx, by] of [[660, 1250], [840, 1250], [600, 700], [900, 700]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => A.bench(c, bx, by) });
      }
      // fallen drums around the Parthenon
      this.addEntity({
        x: 980, y: 960, baseY: 960,
        draw: (c) => {
          A.r(c, 966, 952, 28, 12, P.marbleMid);
          A.r(c, 966, 952, 28, 3, P.marble);
          A.r(c, 980, 948, 2, 4, P.marbleDark);
        },
      });

      /* ---------------- the sundial (daytime calibration puzzle) ---------------- */
      this.addEntity({
        x: 1080, y: 600, baseY: 600,
        draw: (c) => this.drawSundialPedestal(c, 1080, 600),
      });
      this.solid(1052, 586, 56, 20);
      this.addInteract({
        x: 1080, y: 612, r: 34, label: '校一校石制的日晷',
        action: () => this.doPuzzle(),
      });

      /* ---------------- photo spots (travel-journal camera) ---------------- */
      this.photoSpot('erechtheion', 1000, 764);
      this.photoSpot('altar', 750, 486);

      /* ---------------- a guide and tourists ---------------- */
      this.addNPC({
        x: 860, y: 1280, name: '讲解员 伊莲娜', palette: A.actorPalettes.guide,
        wander: 0, lines: [
          '帕特农的西面是山门，东面是日出。整座卫城，是照着太阳的方向摆的。',
          '入夜后别急着走，北边的祭坛会点圣火。',
        ],
      });
      this.addNPC({
        x: 620, y: 860, name: '游客', palette: A.actorPalettes.tourist,
        wander: 1, radius: 26, lines: ['这些柱子比照片上要细，也更近。'],
      });
      this.addNPC({
        x: 1180, y: 1000, name: '写生的画家', palette: A.actorPalettes.auntie,
        wander: 0, lines: [
          '我画了二十年卫城，还是画不好这道光。',
          '你看柱子上的凹槽，一面亮一面暗，整排就有了呼吸。',
        ],
      });
      this.addEntity({
        x: 700, y: 1080, baseY: 1080,
        draw: (c) => A.cat(c, 700, 1080, this.time, { color: '#d8cbb2' }),
      });
      this.addInteract({
        x: 700, y: 1086, r: 26, label: '摸摸卫城的猫',
        action: () => {
          if (G.unlock) G.unlock('cat');
          G.audio.sfx('pickup');
          G.dialog.show([
            { name: '卫城的猫', text: '（它眯起眼睛，在滚烫的石头上翻了个身。）' },
            { name: '旅行手账', text: '卫城的猫，大概是这山顶上最从容的居民。' },
          ]);
        },
      });
    }

    resinDraw(c) {
      // a resin-soaked cloth and a small clay pot
      A.r(c, 1140, 344, 18, 8, '#d9c9a4');
      A.r(c, 1142, 341, 14, 4, '#b98a3c');
      A.r(c, 1146, 340, 6, 2, '#e8c877');
      A.r(c, 1160, 342, 7, 8, '#a8623c');
      A.r(c, 1161, 340, 5, 3, '#c9875a');
      A.glow(c, 1150, 344, 12, 'rgba(255,220,150,.18)', 0.4);
    }

    /* ============================================================
       lifecycle
       ============================================================ */
    onEnter() {
      G.ui.location('卫城', '帕特农高地');
      this.night = G.save.flag('night') || G.save.flag('finished');
      this.refreshNight();
      this.clock = this.night ? '19:40' : '16:20';
      this.updateHud();
      this.refreshObjective();
      G.audio.ambient(this.night ? 'night' : 'palace');
      if (!G.save.flag('acropolisIntroSeen')) {
        G.save.data.flags.acropolisIntroSeen = true;
        G.save.persist();
        setTimeout(() => {
          if (G.scene !== this || this.night) return;
          G.dialog.show([
            { name: '旅行手账', narrator: true, text: '安检通过。石阶在脚下变陡，风也大了起来。' },
            { name: '旅行手账', narrator: true, text: '帕特农的八根柱子先露出头，然后才是整座山花。' },
            { name: '旅行手账', text: '往北走，祭坛旁边有个打铜的老人。听说今晚的圣火由他主持。' },
          ]);
        }, 700);
      }
    }

    updateHud() {
      const d = G.dateInfo(new Date());
      G.ui.clock(this.clock, d.cn + (this.night ? ' · 夜' : ' · 晴'));
    }

    collectedCount() {
      return ['olive', 'resin', 'brazier'].filter((k) => G.save.flag(k)).length;
    }

    refreshObjective() {
      const f = G.save.data.flags;
      if (f.finished) this.objective('圣火已点燃 · 夜里的卫城，可以再点一次');
      else if (this.night) this.objective('到祭坛去，点亮今夜的圣火');
      else if (this.collectedCount() >= 3) this.objective('材料齐了 · 回祭坛交给老赫');
      else if (f.metHephaistos) this.objective('替老赫寻找材料 (' + this.collectedCount() + '/3)');
      else this.objective('沿卫城大道向北，去祭坛找点火的匠人');
      this.updateMarker();
    }

    /* ============================================================
       quest
       ============================================================ */
    hepLines() {
      const f = G.save.data.flags;
      if (f.finished) return [
        { name: '老赫', text: '圣火这种东西，灭了还能点，人散了就聚不回来了。' },
        { name: '老赫', text: '想再点一次？火盆还是热的。' },
      ];
      if (this.night) return [
        { name: '老赫', text: '站远些。第一簇火，敬这山上的风。' },
        { name: '老赫', text: '看好了——火要朝神庙那边递，才算数。' },
      ];
      if (this.collectedCount() >= 3) return [
        { name: '老赫', text: '橄榄木、松脂、青铜盆，齐了。' },
        { name: '老赫', text: '日头还高。圣火要等天黑，你在这山上再转转，我去整理火种。' },
        { name: '旅行手账', text: '（风从坡下吹上来，大理石的影子一点点变长。）' },
      ];
      if (f.metHephaistos) {
        const left = ['olive', 'resin', 'brazier'].filter((k) => !f[k]).map((k) => ITEMS[k].name);
        return [
          { name: '老赫', text: '还差 ' + left.join('、') + '。' },
          { name: '老赫', text: '橄榄木在圣树下，松脂在北坡的松林里，火盆在西边的铜匠铺。' },
        ];
      }
      return [
        { name: '老赫', text: '你是来看点圣火的吧？我姓赫，在这山上打了半辈子铜。' },
        { name: '老赫', text: '圣火要三样东西：耐烧的橄榄木、见火就着的松脂、还有一只不漏的青铜火盆。' },
        { name: '老赫', text: '帮我把三样找齐：圣橄榄树下的木柴、北坡松林的松脂、西边铜匠铺的火盆。' },
        { name: '旅行手账', text: '好。等材料齐了，就能看一场真正的圣火。' },
      ];
    }

    onHepTalk() {
      const f = G.save.data.flags;
      if (f.finished) {
        if (this.night) this.startMinigame();
        return;
      }
      if (this.night) {
        this.startMinigame();
        return;
      }
      if (!f.metHephaistos) {
        G.save.flag('metHephaistos', true);
        this.refreshObjective();
        G.ui.toast('新任务 · 寻找三样材料', 'good', 2800);
      } else if (this.collectedCount() >= 3 && !f.night) {
        this.chooseHowToLight();
      }
    }

    collectItem(key) {
      if (G.save.flag(key)) return;
      G.save.flag(key, true);
      G.audio.sfx('pickup');
      G.ui.toast('获得「' + ITEMS[key].name + '」 · ' + ITEMS[key].desc, 'good', 3000);
      G.fx.burst(ITEMS[key].x, ITEMS[key].y - 10, 18, {
        colors: ['#ffd479', '#ffb347', '#f3e3b5'], min: 10, max: 40,
        lifeMin: 0.3, lifeMax: 0.8, grav: -10, sizeMax: 2,
      });
      this.refreshObjective();
      if (this.collectedCount() >= 3) {
        setTimeout(() => G.ui.toast('材料齐了 · 回祭坛找老赫', 'good', 3200), 500);
      }
    }

    oliveTree() {
      if (G.save.flag('olive')) {
        G.dialog.show([{ name: '圣橄榄树', text: '（树皮上有一道旧伤，摸上去像一条干涸的河。）' }]);
        return;
      }
      if (!G.save.flag('metHephaistos')) {
        G.dialog.show([{ name: '圣橄榄树', text: '橄榄树是雅典娜送给这座城的礼物。树下堆着几根修下来的旧枝。' }]);
        return;
      }
      this.collectItem('olive');
    }

    takeResin() {
      if (G.save.flag('resin')) return;
      if (!G.save.flag('metHephaistos')) {
        G.dialog.show([{ name: '松脂', text: '松林里凝着琥珀色的松脂，一捻就粘手。也许有人用得上。' }]);
        return;
      }
      this.collectItem('resin');
    }

    takeBrazier() {
      if (G.save.flag('brazier')) {
        G.dialog.show([{ name: '铜匠铺', text: '炉火还温着。铜匠已经收工，台面上只剩几只没打完的柄。' }]);
        return;
      }
      if (!G.save.flag('metHephaistos')) {
        G.dialog.show([{ name: '铜匠铺', text: '墙边立着一只打出雏形的青铜火盆，盆口还没来得及锉边。' }]);
        return;
      }
      this.collectItem('brazier');
    }

    /* ============================================================
       抉择 · how to light the sacred fire (branch-driven ending)
       ============================================================ */
    chooseHowToLight() {
      if (G.save.flag('night') || this._choosing) return;
      this._choosing = true;
      G.choice.show([
        { text: '把橄榄木炭、松脂、火盆都交给老赫，请他主持' },
        { text: '坚持由你自己亲手点这一炉' },
        { text: '只留一半材料，把另一半留给下一队远来的人（来得晚）' },
      ], {
        title: '材料齐了 · 这一炉圣火，你想怎么点？',
        onPick: (i) => {
          this._choosing = false;
          if (i === 0) G.save.addFlavor('help');
          else if (i === 1) G.save.addFlavor('hand');
          else G.save.addFlavor('last');
          G.save.persist();
          this.beginNight();
        },
      });
    }

    beginNight() {
      if (this._nighting) return;
      this._nighting = true;
      G.audio.sfx('gong');
      G.cinema.play([
        { text: '日 落', sub: 'SUNSET OVER THE ACROPOLIS', ms: 1800 },
        { text: '入 夜', sub: 'THE SACRED FIRE IS COMING', ms: 2100 },
      ], () => {
        this.night = true;
        G.save.flag('night', true);
        this.clock = '19:40';
        this.updateHud();
        this.refreshNight();
        this.refreshObjective();
        this.updateMarker();
        this.nightStrength = 0.5;
        G.audio.ambient('night');
        G.audio.sfx('crackle');
        G.save.persist();
        G.ui.toast('入夜了 · 祭坛前的火盆亮了起来', 'good', 3200);
        setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show([
            { name: '老赫', text: '火种收好了，火盆也架上了。' },
            { name: '老赫', text: '过来，我教你点第一簇。' },
          ], () => this.startMinigame());
        }, 900);
      });
    }

    startMinigame() {
      if (!G.minigame) return;
      G.minigame.start({
        onScore: (score, best) => {
          G.save.data.best = Math.max(G.save.data.best, best);
          G.save.persist();
        },
        onExit: (score, stats) => {
          if (!G.save.flag('finished')) {
            G.save.flag('finished', true);
            G.save.flag('night', true);
            if (G.unlock) G.unlock('sacredfire');
            G.save.persist();
            this.refreshObjective();
            this.updateMarker();
            setTimeout(() => {
              if (G.scene !== this) return;
              G.cinema.play([
                { text: '圣 火 长 明', sub: 'A NIGHT TO REMEMBER', ms: 2000 },
                { text: '旅 程 完 成', sub: 'THANKS FOR CLIMBING THE HILL', ms: 2000 },
              ], () => {
                const flavors = G.save.data.flavor || [];
                const tail = flavors.includes('last') ? [
                  { name: '老赫', text: '你留了一半材料。后面的队伍脚步近了，火种还在，不愁接不上。' },
                  { name: '旅行手账', text: '火熄了可以再点，人散了却要重新聚。这一半，是留给明天走回来的。' },
                ] : flavors.includes('hand') ? [
                  { name: '老赫', text: '这一炉，是你亲手点的。风把火苗压弯，又让它立起来，像你的手一样稳。' },
                  { name: '旅行手账', text: '亲手点起来的火，会记得那份重量。' },
                ] : [
                  { name: '老赫', text: '橄榄木、松脂、青铜盆，各归其位。老赫这一炉，敬的是山下整座城。' },
                  { name: '旅行手账', text: '让懂火的人去点，火会烧得更久一些。' },
                ];
                G.dialog.show([
                  { name: '老赫', text: '火苗立起来的时候，整座山都安静了一下。' },
                  { name: '老赫', text: '这火传了两千五百年，靠的就是有人愿意把手伸过去。' },
                  { name: '旅行手账', text: '今晚的风很轻。大理石的柱子、金红的火、还有山下的一整片灯，都留在了手账的最后一页。' },
                ].concat(tail));
              });
            }, 700);
          }
          G.audio.ambient('night');
          this.refreshObjective();
          this.updateMarker();
        },
      });
    }

    /* ============================================================
       night setup
       ============================================================ */
    refreshNight() {
      this.lights = [];
      if (!this.night) return;
      const lampSpots = [
        [660, 1250], [840, 1250], [660, 1050], [840, 1050],
        [660, 900], [840, 900], [660, 760], [840, 760],
        [660, 620], [840, 620], [560, 1450], [940, 1450],
        [330, 1240], [1010, 1450], [1200, 1140], [512, 990],
      ];
      for (const [x, y] of lampSpots) {
        this.addLight(x, y - 14, 24, 'rgba(255,168,80,.62)', 0.6);
      }
      // altar + temple
      this.addLight(750, 500, 96, 'rgba(255,150,60,.5)', 0.5);
      this.addLight(750, 900, 150, 'rgba(255,160,90,.2)', 0.26);
      this.addLight(750, 1470, 46, 'rgba(255,150,70,.4)', 0.36);
      this.addLight(1090, 800, 70, 'rgba(255,160,80,.24)', 0.3);
      this.addLight(1148, 348, 30, 'rgba(255,180,90,.24)', 0.3);
    }

    /* ============================================================
       sundial daytime puzzle + photo spots
       ============================================================ */
    drawSundialPedestal(c, x, baseY) {
      A.r(c, x - 22, baseY - 26, 44, 30, P.marbleMid);
      A.r(c, x - 22, baseY - 26, 44, 2, P.marbleHi);
      A.r(c, x - 26, baseY - 4, 52, 8, P.marble);
      A.r(c, x - 26, baseY - 4, 52, 2, P.marbleHi);
      // bronze disc + gnomon
      A.r(c, x - 2, baseY - 46, 3, 22, P.bronze);
      A.r(c, x - 3, baseY - 47, 5, 3, P.bronzeHi);
      c.fillStyle = '#c9b887';
      c.beginPath(); c.ellipse(x, baseY - 18, 12, 12, 0.35, 0, G.TAU); c.fill();
      c.strokeStyle = P.bronzeDark; c.lineWidth = 1;
      c.beginPath(); c.ellipse(x, baseY - 18, 12, 12, 0.35, 0, G.TAU); c.stroke();
    }

    doPuzzle() {
      if (G.save.flag('night')) {
        G.dialog.show([{ name: '日晷', text: '夜里没有日影，石盘的刻度都睡了。白天再来校。' }]);
        return;
      }
      G.dialog.show([
        { name: '日晷', text: '一块刻着时辰的石盘。日头高时，影子短；日头低时，影子长。' },
        { name: '日晷', text: '把表针对准石盘上刻的时辰，就能替城里的工匠校好一整个上午。' },
      ], () => {
        if (G.scene !== this) return;
        if (G.unlock) G.unlock('sundial');
        G.sundial.start({
          title: '校 日 · 卫城',
          hint: '左 / 右 转动表针 · 让影子对准金环 · 空格 锁定',
          onExit: () => { if (G.scene === this) G.ui.showHud(true); },
        });
      });
    }

    /* generic photo interaction: a "viewpoint" spot */
    photoSpot(id, x, y) {
      const spec = (G.photo && G.photo.spec(id)) || {};
      this.addEntity({
        x, y: y - 6, baseY: y - 6,
        draw: (c) => {
          A.r(c, x - 3, y - 2, 6, 4, P.bronzeDark);
          A.r(c, x - 7, y - 8, 14, 6, P.marbleMid);
          A.r(c, x - 6, y - 7, 12, 1, P.marbleHi);
        },
      });
      this.addInteract({
        x, y, r: 30, label: '给「' + (spec.title || id) + '」留一张影',
        action: () => {
          if (!G.save.hasPhoto(id)) {
            G.dialog.show([
              { name: '旅行手账', text: '这个机位，手账早就想拍了。' },
            ], () => G.photo.snap(id));
          } else {
            G.dialog.show([
              { name: '旅行手账', text: (spec.blurb || '已经留过影了。同一道光，再拍也是新的。') },
            ]);
          }
        },
      });
    }

    toggleMap(force) {
      this.mapOpen = force == null ? !this.mapOpen : !!force;
      G.audio.sfx('page');
      const hud = G.$('#hud');
      if (hud) hud.classList.toggle('map-open', this.mapOpen);
      if (this.mapOpen) { this.player.moving = false; G.ui.prompt(null); }
      else G.input.clearPressed();
    }

    update(dt) {
      if (G.input.wasPressed('KeyM') && !G.isWorldPaused()) {
        this.toggleMap();
        G.input.clearPressed();
      }
      if (this.mapOpen) {
        this.time += dt;
        this.player.moving = false;
        G.fx.update(dt);
        this.updateAmbient(dt);
        return;
      }
      super.update(dt);
    }

    updateMarker() {
      const f = G.save.data.flags;
      if (f.finished) { this.marker = null; return; }
      if (!f.metHephaistos || this.collectedCount() >= 3 || this.night) {
        this.marker = { x: 750, y: 640 };
        return;
      }
      let best = null, bd = Infinity;
      for (const key of ['olive', 'resin', 'brazier']) {
        if (f[key]) continue;
        const it = ITEMS[key];
        const d = Math.hypot(it.x - this.player.x, it.y - this.player.y);
        if (d < bd) { bd = d; best = it; }
      }
      this.marker = best ? { x: best.x, y: best.y } : null;
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      // the limestone plateau
      c.fillStyle = '#b7ab8a';
      c.fillRect(0, 0, this.w, this.h);
      A.paving(c, 166, 108, 1168, 1424, '#bdb08f', '#cabda0', 4, 20);
      // deep joints so the slabs read
      c.save();
      c.globalAlpha = 0.22;
      c.fillStyle = '#7d7157';
      for (let y = 108; y < 1532; y += 20) c.fillRect(166, y, 1168, 1);
      for (let x = 166; x < 1334; x += 20) c.fillRect(x, 108, 1, 1424);
      c.restore();

      // weathered colour washes
      for (let i = 0; i < 40; i++) {
        const x = 180 + G.hash(i, 11, 61) * 1140;
        const y = 120 + G.hash(i, 12, 62) * 1400;
        const w = 70 + G.hash(i, 13, 63) * 210;
        const h = 40 + G.hash(i, 14, 64) * 140;
        const warm = G.hash(i, 15, 65) > 0.5;
        c.fillStyle = warm ? 'rgba(248,232,196,.1)' : 'rgba(78,68,50,.09)';
        c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, G.TAU); c.fill();
      }
      // moss and dust in the joints
      c.save();
      c.globalAlpha = 0.4;
      c.fillStyle = '#7a7c50';
      for (let i = 0; i < 260; i++) {
        const x = 168 + G.hash(i, 21, 71) * 1162;
        const y = 110 + G.hash(i, 22, 72) * 1420;
        c.fillRect(x, y, 3, 1);
      }
      c.restore();

      // the processional way, north to the altar
      c.fillStyle = 'rgba(90,80,58,.5)';
      c.fillRect(664, 300, 172, 1200);
      A.paving(c, 668, 300, 164, 1200, '#ddd2b2', '#cec1a1', 7, 18);
      c.fillStyle = 'rgba(110,100,76,.55)';
      c.fillRect(668, 300, 2, 1200);
      c.fillRect(830, 300, 2, 1200);
      c.fillStyle = 'rgba(246,240,220,.5)';
      c.fillRect(671, 300, 1, 1200);
      c.fillRect(828, 300, 1, 1200);
      // carved central slab
      c.fillStyle = '#e7dbba';
      c.fillRect(736, 300, 28, 1200);
      c.fillStyle = 'rgba(151,130,94,.5)';
      c.fillRect(736, 300, 1, 1200);
      c.fillRect(763, 300, 1, 1200);
      // cross joints on the way
      c.save();
      c.globalAlpha = 0.18;
      c.fillStyle = '#6f6449';
      for (let y = 312; y < 1500; y += 22) c.fillRect(668, y, 164, 1);
      c.restore();

      // the monumental stair down to the Propylaea
      for (let i = 0; i < 6; i++) {
        const sw = 260 - i * 12;
        c.fillStyle = i % 2 ? '#cfc2a2' : '#e0d5b6';
        c.fillRect(750 - sw / 2, 1432 + i * 8, sw, 8);
        c.fillStyle = 'rgba(100,88,64,.35)';
        c.fillRect(750 - sw / 2, 1432 + i * 8, sw, 1);
      }

      // open earth around the sacred tree and the pines
      c.save();
      c.globalAlpha = 0.6;
      c.fillStyle = '#8a8a60';
      c.beginPath(); c.ellipse(512, 1000, 96, 58, 0, 0, G.TAU); c.fill();
      c.fillStyle = '#6f7b52';
      c.beginPath(); c.ellipse(1144, 350, 128, 68, 0, 0, G.TAU); c.fill();
      c.restore();

      // worn dirt paths to the workshop, museum, belvedere
      c.save();
      c.globalAlpha = 0.55;
      c.fillStyle = '#c3b491';
      c.fillRect(940, 1430, 80, 28);
      c.fillRect(300, 1240, 60, 16);
      c.fillRect(1140, 1140, 70, 16);
      c.fillRect(600, 760, 60, 16);
      c.restore();

      // the rim: a band of rough rock just inside the walls
      c.fillStyle = 'rgba(110,96,70,.45)';
      for (let x = 164; x < 1336; x += 12) {
        const hh = 6 + G.hash(x, 1, 11) * 8;
        c.fillRect(x, 110, 11, hh);
        c.fillRect(x, 1536 - hh, 11, hh);
      }
      for (let y = 110; y < 1536; y += 12) {
        const ww = 6 + G.hash(y, 2, 12) * 8;
        c.fillRect(164, y, ww, 11);
        c.fillRect(1336 - ww, y, ww, 11);
      }
      // grass tufts along the edges and in the gaps
      c.save();
      c.globalAlpha = 0.55;
      for (let i = 0; i < 110; i++) {
        const x = 170 + G.hash(i, 3, 21) * 1160;
        const y = G.hash(i, 4, 22) > 0.5 ? 120 + G.hash(i, 5, 23) * 46 : 1466 + G.hash(i, 6, 24) * 56;
        c.fillStyle = G.hash(i, 7, 25) > 0.5 ? '#6d7c4e' : '#87945c';
        c.fillRect(x, y, 2, 1);
        c.fillRect(x + 3, y - 1, 1, 2);
      }
      c.restore();
      // loose marble rubble along the west side
      c.save();
      c.globalAlpha = 0.5;
      for (let i = 0; i < 26; i++) {
        const x = 180 + G.hash(i, 31, 81) * 150;
        const y = 700 + G.hash(i, 32, 82) * 700;
        c.fillStyle = G.hash(i, 33, 83) > 0.5 ? '#cfc3a6' : '#a99c7e';
        c.fillRect(x, y, 3, 2);
      }
      c.restore();

      // deepen the plateau so the temples and statues stand out
      c.save();
      c.globalAlpha = 0.09;
      c.fillStyle = '#3e3520';
      c.fillRect(0, 0, this.w, this.h);
      c.restore();
    }

    drawGroundExtras(ctx) {
      // the cliff face along the south and east
      for (let x = 168; x < 1332; x += 16) {
        const hh = 6 + G.hash(x, 7, 31) * 12;
        A.r(ctx, x, 1536 - hh, 15, hh, '#9c8f70');
        A.r(ctx, x, 1536 - hh, 15, 1, '#c8bb9b');
        A.r(ctx, x, 1536 - 2, 15, 2, '#7d7157');
      }
      for (let y = 112; y < 1536; y += 16) {
        const ww = 6 + G.hash(y, 8, 32) * 10;
        A.r(ctx, 1336 - ww, y, ww, 15, '#9c8f70');
        A.r(ctx, 1336 - ww, y, 1, 15, '#c8bb9b');
      }
      // a low parapet along the west edge
      for (let y = 640; y < 1160; y += 14) {
        A.r(ctx, 172, y, 10, 13, '#c3b897');
        A.r(ctx, 172, y, 10, 1, '#ddd3b5');
        A.r(ctx, 172, y + 12, 10, 1, '#8f8267');
      }
    }


    updateAmbient(dt) {
      // dust in the slanting light
      if (Math.random() < dt * 3.6) {
        G.fx.add({
          x: this.cam.x + G.rand(-40, G.W + 40), y: this.cam.y + G.rand(0, G.H),
          vx: G.rand(-3, 5), vy: G.rand(-3, 2),
          life: G.rand(1.8, 3.4), size: 1,
          color: G.pick(['rgba(246,228,190,.4)', 'rgba(255,238,206,.3)']),
          grav: -1, glow: false,
        });
      }
      // embers from the altar after nightfall
      if (this.night && Math.random() < dt * 8) {
        G.fx.add({
          x: 750 + G.rand(-8, 8), y: 506 + G.rand(-4, 2),
          vx: G.rand(-8, 8), vy: G.rand(-26, -10),
          life: G.rand(0.8, 1.8), size: G.rand(1, 2),
          color: G.pick(['#ffd479', '#ff9d3c', '#fff3c4']),
          grav: -6, glow: true,
        });
      }
      // seagulls high above
      if (Math.random() < dt * 0.5) {
        G.fx.add({
          x: this.cam.x + G.rand(0, G.W), y: this.cam.y + G.rand(20, 120),
          vx: G.rand(6, 14), vy: G.rand(-2, 2),
          life: G.rand(1.6, 2.8), size: 1, color: 'rgba(246,244,236,.75)',
          grav: 0, glow: false,
        });
      }
    }

    /* ============================================================
       guide map
       ============================================================ */
    drawMap(ctx) {
      const mx = 100, my = 30, mw = 440, mh = 300;
      const X = (wx) => mx + (wx / this.w) * mw;
      const Y = (wy) => my + (wy / this.h) * mh;
      ctx.save();
      ctx.fillStyle = 'rgba(10,8,6,.84)';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#ecdfc0';
      ctx.fillRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 170; i++) {
        const px = mx - 10 + G.hash(i, 1, 201) * (mw + 20);
        const py = my - 18 + G.hash(i, 2, 202) * (mh + 36);
        ctx.fillStyle = G.hash(i, 3, 203) > 0.5 ? '#a68b5f' : '#fff5dd';
        ctx.fillRect(px, py, 1, 1);
      }
      ctx.restore();
      ctx.strokeStyle = '#5f4529'; ctx.lineWidth = 2;
      ctx.strokeRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.strokeStyle = '#b08a55'; ctx.lineWidth = 1;
      ctx.strokeRect(mx - 9.5, my - 17.5, mw + 19, mh + 35);
      G.text(ctx, '卫城导览图', mx - 2, my - 7, { size: 11, color: '#3d2d1c', weight: 'bold' });
      G.text(ctx, 'M 关闭', mx + mw - 32, my - 7, { size: 7, color: '#7d684c' });
      // the plateau
      ctx.save();
      ctx.beginPath();
      const px0 = X(164), py0 = Y(110), px1 = X(1336), py1 = Y(1536);
      ctx.moveTo(px0 + 6, py0);
      for (let x = px0; x < px1; x += 30) ctx.lineTo(x, py0 + (G.hash(x, 1, 3) * 4 - 2));
      ctx.lineTo(px1, py0 + 4);
      for (let y = py0; y < py1; y += 30) ctx.lineTo(px1 - (G.hash(y, 2, 4) * 4), y);
      ctx.lineTo(px1 - 4, py1);
      for (let x = px1; x > px0; x -= 30) ctx.lineTo(x, py1 - (G.hash(x, 3, 5) * 4));
      ctx.lineTo(px0, py1 - 4);
      for (let y = py1; y > py0; y -= 30) ctx.lineTo(px0 + (G.hash(y, 4, 6) * 4), y);
      ctx.closePath();
      ctx.fillStyle = '#e7d9b6';
      ctx.fill();
      ctx.strokeStyle = '#8a7550'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // cliff hatching along the rim
      ctx.clip();
      ctx.strokeStyle = 'rgba(140,116,76,.3)'; ctx.lineWidth = 1;
      for (let i = 0; i < 90; i++) {
        const hx = px0 + G.hash(i, 5, 7) * (px1 - px0);
        const hy = py0 + G.hash(i, 6, 8) * (py1 - py0);
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 5, hy + 3); ctx.stroke();
      }
      ctx.restore();

      // processional way
      ctx.strokeStyle = 'rgba(90,70,42,.55)'; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(X(750), Y(1480)); ctx.lineTo(X(750), Y(320)); ctx.stroke();
      ctx.strokeStyle = '#f4ead2'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(X(750), Y(1480)); ctx.lineTo(X(750), Y(320)); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,96,60,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(750), Y(1480)); ctx.lineTo(X(750), Y(320)); ctx.stroke();

      const footprint = (x, baseY, w, label) => {
        const lx = X(x - w / 2), rx = X(x + w / 2), by = Y(baseY);
        ctx.fillStyle = '#cabc99';
        ctx.fillRect(lx, by - 9, rx - lx, 8);
        ctx.strokeStyle = 'rgba(122,100,64,.5)'; ctx.lineWidth = 1;
        ctx.strokeRect(lx + 0.5, by - 8.5, rx - lx - 1, 7);
        ctx.fillStyle = '#8a3b2c';
        ctx.fillRect(lx, by - 11, rx - lx, 3);
        // column ticks
        ctx.fillStyle = 'rgba(122,100,64,.55)';
        const n = Math.max(2, Math.round((rx - lx) / 6));
        for (let i = 1; i < n; i++) ctx.fillRect(lx + (rx - lx) * i / n, by - 8, 1, 6);
        void label;
      };
      footprint(750, 900, 470, '帕特农');
      footprint(1090, 800, 190, '厄瑞克忒翁');
      footprint(980, 1420, 74, '尼刻庙');
      footprint(330, 1240, 200, '博物馆');
      footprint(1010, 1450, 120, '铜匠铺');
      footprint(330, 900, 250, '西侧神域');

      const label = (wx, wy, text, dx, dy, hot) => {
        const px = X(wx), py = Y(wy);
        if (hot) {
          ctx.strokeStyle = '#8a2f22'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(this.time * 3) * 1.5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = hot ? '#8a2f22' : '#4a3a26';
        ctx.beginPath(); ctx.arc(px, py, hot ? 3.2 : 2, 0, Math.PI * 2); ctx.fill();
        G.text(ctx, text, px + dx, py + dy, {
          size: 6.4, color: '#3d2d1c', outline: 'rgba(240,230,204,.85)', outlineWidth: 2.4,
        });
      };
      label(750, 900, '帕特农', 16, 18);
      label(1090, 800, '厄瑞克忒翁', 8, -4);
      label(750, 520, '祭坛', 10, -2, true);
      label(980, 1420, '尼刻庙', -40, -8);
      label(750, 1470, '山门', -30, -8, true);
      label(512, 990, '圣橄榄', -36, 2);
      label(1010, 1450, '铜匠铺', 8, 16);
      label(330, 1240, '博物馆', -34, -6);
      label(330, 900, '西侧神域', -42, -8);
      label(1200, 1140, '观景台', 8, 2);
      label(1148, 348, '松林', 8, 2);
      label(812, 560, '老赫', 10, 12);

      // you are here
      const px = X(this.player.x), py = Y(this.player.y);
      let chipX = px + 6, chipY = py + 4;
      if (chipX > mx + mw - 40) chipX = px - 36;
      if (chipY > my + mh - 12) chipY = py - 14;
      ctx.fillStyle = 'rgba(240,230,204,.92)';
      ctx.fillRect(chipX, chipY, 32, 9);
      ctx.fillStyle = '#b03a26';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b03a26'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
      G.text(ctx, '你在这里', chipX + 2, chipY + 7, { size: 6, color: '#7d2f22' });

      // compass
      const cxp = mx + mw - 26, cyp = my + mh - 32;
      ctx.save();
      ctx.strokeStyle = '#7d684c'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cxp, cyp, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cxp, cyp - 11); ctx.lineTo(cxp + 3, cyp + 1); ctx.lineTo(cxp, cyp - 3);
      ctx.lineTo(cxp - 3, cyp + 1); ctx.closePath();
      ctx.fillStyle = '#8a3b2c'; ctx.fill();
      G.text(ctx, 'N', cxp, cyp - 14, { size: 6, color: '#5f4529', align: 'center', weight: 'bold' });
      ctx.restore();

      G.text(ctx, '卫城 · 帕特农高地', mx + 8, my + mh + 15, { size: 7, color: '#6b5636' });
      G.text(ctx, '沿着大道向北 · 祭坛点火', mx + mw - 118, my + mh + 15, { size: 7, color: '#6b5636' });
      ctx.restore();
    }

    drawScreen(ctx) {
      if (this.mapOpen) { this.drawMap(ctx); return; }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [wx, spread] of [[300, 40], [1150, 34]]) {
        const sx = wx - this.cam.x;
        const sy = 120 - this.cam.y;
        ctx.globalAlpha = 0.045;
        ctx.fillStyle = '#ffe6b4';
        ctx.beginPath();
        ctx.moveTo(sx - 46, sy);
        ctx.lineTo(sx + 46, sy);
        ctx.lineTo(sx + 96 + spread, sy + 320);
        ctx.lineTo(sx - 96 - spread, sy + 320);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      const g = ctx.createRadialGradient(320, 175, 150, 320, 180, 380);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(8,5,3,.3)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
    }
  }

  G.AcropolisScene = AcropolisScene;
})();
