/* ============================================================
   雅典 · 圣火 — Athens & the Acropolis slopes
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  class AthensScene extends G.WorldScene {
    constructor() {
      super({
        id: 'athens', w: 2200, h: 1500, spawn: { x: 1100, y: 1240 },
        clock: '15:40', ambient: 'city', lookAhead: 40, gradeStrength: 0.5,
      });
      this.title = '雅典 · 卫城脚下';
      this.marker = { x: 1100, y: 846 };
      this.mapOpen = false;
      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    onEnter() {
      G.ui.location('雅典', '卫城脚下');
      this.refreshObjective();
      this.clock = '15:40';
      this.updateHud();
      G.audio.ambient('city');
      const flags = G.save.data.flags;
      if (!flags.introSeen) {
        flags.introSeen = true;
        G.save.persist();
        setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show([
            { name: '旅行手账', narrator: true, text: '雅典。泛雅典娜大道从凯拉米克斯一路向北，穿过古市集，最后爬上卫城的山门。' },
            { name: '旅行手账', narrator: true, text: '你带着一本没写完的手账，和一枚旧铜火种盒。' },
            { name: '旅行手账', narrator: true, text: '听说入夜之后，帕特农神庙前的祭坛上，要举行一场点圣火的仪式。' },
            { name: '旅行手账', text: '沿大道一直往北。卫城山门是入口，记得带上证件。' },
          ]);
        }, 600);
      }
    }

    refreshObjective() {
      const f = G.save.data.flags;
      if (f.entered && f.night) this.objective('夜访卫城 · 看一场点圣火');
      else if (f.entered) this.objective('已在卫城 · 去找主持圣火的匠人');
      else this.objective('沿泛雅典娜大道向北，到卫城山门入园');
      this.marker = { x: 1100, y: 846 };
    }

    /* ============================================================
       build the world
       ============================================================ */
    build() {
      /* ---------------- the Acropolis rock ---------------- */
      this.addEntity({
        x: 1100, y: 822, baseY: 822,
        draw: (c) => A.miniAcropolis(c, 1100, 822, 470, 300),
      });
      this.solid(880, 560, 440, 250);
      // the Propylaea front
      this.addBuilding(1100, 830, (c) => {
        A.drawGate(c, 1100, 830, 236, { wallH: 42, roofH: 22, name: '卫城山门' });
      });
      this.solidRect(1100, 830, 246, 20);
      this.interactables.push({
        x: 1100, y: 856, r: 54, label: '在卫城山门安检入园',
        action: () => this.gate(),
      });
      this.addInteract({
        x: 1242, y: 848, r: 30, label: '查看卫城导览牌',
        action: () => {
          if (G.unlock) { G.unlock('acropolis'); G.unlock('parthenon'); }
          G.dialog.show([
            { name: '导览牌', text: '雅典卫城，希腊语 Akropolis，意为「高处的城邦」。公元前五世纪重建，帕特农神庙、厄瑞克忒翁神庙与山门至今仍立在山顶。' },
            { name: '导览牌', text: '参观请从西侧山门入园，配合证件核验与随身物品安检。开放时间 08:00—20:00。' },
          ]);
        },
      });

      /* ---------------- Theatre of Dionysus ---------------- */
      this.addEntity({
        x: 880, y: 792, baseY: 792,
        draw: (c) => A.theater(c, 880, 792, 62),
      });
      this.solid(830, 770, 100, 24);
      this.addInteract({
        x: 880, y: 812, r: 34, label: '看看狄俄尼索斯剧场',
        action: () => {
          if (G.unlock) G.unlock('theater');
          G.dialog.show([
            { name: '狄俄尼索斯剧场', text: '卫城南坡上的露天剧场，可容一万七千人。悲剧与喜剧都从这里的酒神节里长出来。' },
            { name: '旅行手账', text: '坐在最上一排，能看见整个雅典铺到海边。' },
          ]);
        },
      });

      /* ---------------- Odeon of Herodes Atticus ---------------- */
      this.addEntity({
        x: 1322, y: 790, baseY: 790,
        draw: (c) => {
          A.theater(c, 1322, 790, 46);
          A.r(c, 1300, 726, 44, 34, '#a89c80');
          A.r(c, 1300, 726, 44, 3, P.marbleHi);
          for (let i = 0; i < 4; i++) A.r(c, 1304 + i * 11, 732, 4, 22, '#6d6350');
          A.r(c, 1296, 722, 52, 5, P.terra);
          A.r(c, 1296, 722, 52, 1, P.terraHi);
        },
      });
      this.solid(1290, 742, 64, 30);

      /* ---------------- Ancient Agora ---------------- */
      this.addBuilding(650, 992, (c) => {
        A.stoa(c, 650, 992, 240, { h: 26 });
      });
      this.solid(530, 958, 240, 30);
      this.addInteract({
        x: 650, y: 1010, r: 40, label: '走进古市集',
        action: () => {
          if (G.unlock) G.unlock('agora');
          G.dialog.show([
            { name: '古市集', text: '阿塔罗斯柱廊长达一百多米，是雅典人买卖、闲谈、听哲学的地方。苏格拉底常在这一带的柱廊下跟人辩到天黑。' },
          ]);
        },
      });
      this.addEntity({
        x: 545, y: 900, baseY: 900,
        draw: (c) => A.hephaisteion(c, 545, 900, 1),
      });
      this.solid(475, 866, 140, 34);
      this.addInteract({
        x: 545, y: 920, r: 34, label: '看看赫淮斯托斯神庙',
        action: () => {
          if (G.unlock) G.unlock('hephaisteion');
          G.dialog.show([
            { name: '赫淮斯托斯神庙', text: '希腊保存得最完整的一座古神庙，供奉火与锻造之神赫淮斯托斯。' },
            { name: '旅行手账', text: '火神的庙。也许老赫会喜欢这里。' },
          ]);
        },
      });

      /* ---------------- Roman Agora / library ---------------- */
      this.addBuilding(930, 1060, (c) => {
        A.stoa(c, 930, 1060, 120, { h: 20 });
        A.r(c, 890, 1028, 80, 10, P.marble);
      });
      this.solid(862, 1034, 136, 24);

      /* ---------------- Plaka ---------------- */
      this.addBuilding(1270, 1075, (c) => {
        this.house(c, 1225, 1075, 54, 34, '#e0d6bd');
        this.house(c, 1290, 1075, 60, 40, '#d8cdb2');
        this.house(c, 1352, 1075, 48, 30, '#e6dcc4');
        A.r(c, 1200, 1072, 170, 2, '#8f8267');
      });
      this.solid(1195, 1042, 175, 34);
      this.addInteract({
        x: 1280, y: 1098, r: 36, label: '走进普拉卡老城',
        action: () => {
          if (G.unlock) G.unlock('plaka');
          G.dialog.show([
            { name: '普拉卡', text: '卫城北坡下的老街区。白墙、九重葛、窄巷，柠檬树从院墙里探出来。' },
            { name: '旅行手账', text: '巷子尽头有一家开了很久的铜匠铺。' },
          ]);
        },
      });

      /* ---------------- Temple of Olympian Zeus ---------------- */
      this.addEntity({
        x: 1490, y: 1150, baseY: 1150,
        draw: (c) => A.templeOfZeus(c, 1490, 1150, 1),
      });
      this.solid(1420, 1110, 140, 36);
      this.addInteract({
        x: 1490, y: 1172, r: 36, label: '看奥林匹亚宙斯神庙',
        action: () => {
          if (G.unlock) G.unlock('zeus');
          G.dialog.show([
            { name: '奥林匹亚宙斯神庙', text: '曾经有一百零四根科林斯柱，如今只剩十五根立着。倒下的一根，还躺在原地。' },
          ]);
        },
      });
      // Hadrian's arch
      this.addEntity({
        x: 1372, y: 1160, baseY: 1160,
        draw: (c) => A.arch(c, 1372, 1160, 76, 60, {}),
      });
      this.solid(1348, 1104, 10, 58);
      this.solid(1386, 1104, 10, 58);
      this.addInteract({
        x: 1372, y: 1174, r: 26, label: '穿过哈德良拱门',
        action: () => {
          if (G.unlock) G.unlock('hadrian');
          G.audio.sfx('confirm');
          G.ui.toast('哈德良拱门 · 老城与新城的分界', '', 2200);
        },
      });

      /* ---------------- Syntagma ---------------- */
      this.addBuilding(1580, 1000, (c) => {
        // parliament facade
        A.r(c, 1500, 918, 160, 78, '#d8cdb2');
        A.r(c, 1500, 918, 160, 4, P.marbleHi);
        for (let i = 0; i < 9; i++) {
          A.column(c, 1510 + i * 17, 996, 62, 6, {});
        }
        A.r(c, 1492, 908, 176, 10, P.marble);
        A.r(c, 1492, 908, 176, 2, P.marbleHi);
        A.r(c, 1540, 934, 80, 3, '#c9a557');
      });
      this.solid(1490, 908, 180, 90);
      this.addInteract({
        x: 1580, y: 1012, r: 36, label: '在宪法广场歇脚',
        action: () => {
          if (G.unlock) G.unlock('syntagma');
          G.dialog.show([
            { name: '宪法广场', text: '议会大厦前的无名战士纪念碑下，两名穿白色短裙的卫兵每整点换岗。' },
          ]);
        },
      });
      // fountains
      for (const fx of [1520, 1640]) {
        this.addEntity({
          x: fx, y: 1040, baseY: 1040,
          draw: (c) => A.well(c, fx, 1040),
        });
      }

      /* ---------------- Lycabettus ---------------- */
      this.addEntity({
        x: 1820, y: 780, baseY: 780,
        draw: (c) => {
          for (let i = 0; i < 90; i++) {
            const ww = 130 - i * 1.15;
            A.r(c, 1820 - ww, 780 - i, ww * 2, 1, i % 6 === 0 ? '#7d7c5a' : '#8f8c68');
          }
          A.r(c, 1810, 692, 20, 16, '#f0e9d8');
          A.r(c, 1808, 688, 24, 5, P.terra);
          A.r(c, 1819, 680, 2, 9, '#8f8267');
          A.cypress(c, 1786, 742, 0.8);
          A.cypress(c, 1856, 736, 0.7);
        },
      });
      this.solid(1770, 700, 100, 80);
      this.addInteract({
        x: 1820, y: 800, r: 34, label: '爬上吕卡维多斯山',
        action: () => {
          if (G.unlock) G.unlock('lycabettus');
          G.dialog.show([
            { name: '吕卡维多斯山', text: '雅典最高的点。山下的城市摊开成一片白，远处是比雷埃夫斯港和萨罗尼克湾。' },
          ]);
        },
      });

      /* ---------------- Dipylon / start ---------------- */
      this.addBuilding(1100, 1390, (c) => {
        A.arch(c, 1100, 1390, 120, 74, {});
        A.rubble(c, 1010, 1392, 1.2);
        A.rubble(c, 1196, 1390, 1.1);
        A.cypress(c, 930, 1390, 0.9);
        A.cypress(c, 1270, 1388, 0.85);
        A.sign(c, 1074, 1388, '迪皮隆门 · 凯拉米克斯', { w: 74, size: 6 });
      });
      this.solidRect(1100, 1390, 130, 16);
      this.addInteract({
        x: 1100, y: 1404, r: 26, label: '回望迪皮隆门',
        action: () => {
          G.dialog.show([
            { name: '迪皮隆门', text: '古城雅典的西门，也是泛雅典娜节的起点。队伍从城外出发，穿过此门，一路走上卫城。' },
          ]);
        },
      });

      /* ---------------- Piraeus harbour ---------------- */
      this.addEntity({
        x: 320, y: 1440, baseY: 1440,
        draw: (c) => {
          A.bridge(c, 300, 1428, 60, {});
          // boats
          for (const [bx, bw, col] of [[220, 34, '#c9b98f'], [380, 30, '#b8a87e'], [150, 26, '#d5c6a0']]) {
            A.r(c, bx - bw / 2, 1416, bw, 8, '#4a3a26');
            A.r(c, bx - bw / 2, 1416, bw, 2, '#8a6a3a');
            A.r(c, bx - 1, 1396, 2, 22, '#6b5236');
            A.r(c, bx - 8, 1400, 16, 12, '#efe6d0');
          }
          A.flag(c, 430, 1420, this.time, '#3a6f8f');
        },
      });
      this.addInteract({
        x: 320, y: 1424, r: 44, label: '走到比雷埃夫斯港',
        action: () => {
          if (G.unlock) G.unlock('piraeus');
          G.dialog.show([
            { name: '比雷埃夫斯港', text: '雅典的港口，从这里能望见萨罗尼克湾。古时候，橄榄油和陶器从这里运往整个地中海。' },
          ]);
        },
      });
      // boat to Cape Sounion, available after the sacred fire
      this.addInteract({
        x: 320, y: 1456, r: 30, label: G.save.flag('finished') ? '乘船 · 去苏尼翁角' : '码头工人 · （隐约听说天黑后有船可以去最南的海岬）',
        action: () => this.boat(),
      });
      this.addEntity({
        x: 210, y: 1464, baseY: 1464,
        draw: (c) => {
          A.r(c, 178, 1452, 56, 8, '#4a3a26');
          A.r(c, 178, 1452, 56, 2, '#8a6a3a');
          A.r(c, 200, 1436, 2, 20, '#6b5236');
          A.r(c, 192, 1440, 14, 10, '#efe6d0');
        },
      });

      /* ---------------- olive grove ---------------- */
      const grove = [[520, 1160], [590, 1108], [660, 1176], [730, 1120], [470, 1240], [640, 1258]];
      for (const [gx, gy] of grove) {
        this.addEntity({
          x: gx, y: gy, baseY: gy,
          draw: (c) => A.oliveTree(c, gx, gy, 1, { pot: false }),
        });
      }
      this.addInteract({
        x: 600, y: 1180, r: 40, label: '在橄榄园 · 采收橄榄',
        action: () => this.oliveGrove(),
      });

      /* ---------------- Monastiraki market ---------------- */
      this.addBuilding(1010, 1120, (c) => {
        A.r(c, 940, 1092, 130, 26, '#d8cdb2');
        A.r(c, 938, 1086, 134, 8, P.terra);
        A.r(c, 940, 1092, 130, 2, P.terraHi);
        for (let i = 0; i < 4; i++) A.r(c, 950 + i * 32, 1096, 22, 18, '#a89c80');
        // awnings
        for (const [ax, col] of [[956, '#a8392c'], [1026, '#3a6f8f']]) {
          A.r(c, ax, 1064, 44, 8, col);
          A.r(c, ax, 1064, 44, 2, '#e8d9b6');
          A.r(c, ax + 2, 1072, 2, 20, '#6b5236');
          A.r(c, ax + 40, 1072, 2, 20, '#6b5236');
        }
      });
      this.solid(936, 1060, 140, 34);
      this.addInteract({
        x: 1010, y: 1136, r: 34, label: '逛蒙纳斯提拉奇市集',
        action: () => {
          if (G.unlock) G.unlock('monastiraki');
          this.marketTrade();
        },
      });

      /* ---------------- street props ---------------- */
      for (const [lx, ly] of [[1040, 940], [1160, 1000], [980, 1210], [1200, 1150], [1440, 1000]]) {
        this.addEntity({
          x: lx, y: ly, baseY: ly,
          draw: (c) => A.lamp(c, lx, ly, false),
        });
      }
      this.addEntity({
        x: 900, y: 1100, baseY: 1100,
        draw: (c) => A.sign(c, 900, 1100, '泛雅典娜大道', { w: 68, size: 6 }),
      });

      /* ---------------- roadside planting & ruins ---------------- */
      // cypresses lining the Panathenaic Way
      for (const [cx, cy] of [[1006, 960], [1006, 1080], [1006, 1220], [1158, 940], [1158, 1060], [1158, 1190], [1158, 1330], [1006, 1350]]) {
        this.addEntity({ x: cx, y: cy, baseY: cy, draw: (c) => A.cypress(c, cx, cy, 1.1) });
        this.solid(cx - 5, cy - 6, 10, 8);
      }
      // olive trees dotted along the route
      for (const [ox, oy, os] of [[960, 1150, 0.9], [1200, 1130, 0.85], [700, 1080, 1], [860, 1200, 0.8], [1420, 980, 0.9], [560, 900, 0.85]]) {
        this.addEntity({ x: ox, y: oy, baseY: oy, draw: (c) => A.oliveTree(c, ox, oy, os, {}) });
        this.solid(ox - 8, oy - 4, 16, 6);
      }
      // laurel bushes at the corners
      for (const [bx, by] of [[995, 1035], [1168, 1035], [1060, 1400], [1330, 1090], [520, 1085], [880, 1060]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => A.bush(c, bx, by, 1) });
      }
      // fallen column drums and rubble
      for (const [dx, dy, dl] of [[700, 1050, 26], [770, 1010, 18], [1420, 1220, 24], [600, 980, 20], [1340, 1210, 16]]) {
        this.addEntity({ x: dx, y: dy, baseY: dy, draw: (c) => A.columnDrum(c, dx, dy, dl, { s: 1 }) });
      }
      this.addEntity({ x: 470, y: 1030, baseY: 1030, draw: (c) => A.rubble(c, 470, 1030, 1.6) });
      this.addEntity({ x: 1560, y: 1120, baseY: 1120, draw: (c) => A.rubble(c, 1560, 1120, 1.4) });
      // benches and lamps
      for (const [bx, by] of [[980, 890], [1220, 890], [980, 1010], [1230, 1250]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => A.bench(c, bx, by) });
      }
      for (const [lx, ly] of [[1000, 1120], [1180, 980], [900, 1180], [1300, 1000], [1560, 1140]]) {
        this.addEntity({ x: lx, y: ly, baseY: ly, draw: (c) => A.lamp(c, lx, ly, false) });
      }
      // amphora clusters at the market
      for (const [ax, ay, as] of [[960, 1110, 0.9], [978, 1114, 0.8], [1120, 1100, 0.9], [1138, 1106, 0.75]]) {
        this.addEntity({ x: ax, y: ay, baseY: ay, draw: (c) => A.amphora(c, ax, ay, { s: as, color: as > 0.85 ? '#a8503a' : '#8a3b2c' }) });
      }
      // a small public well in Plaka
      this.addEntity({ x: 1360, y: 1140, baseY: 1140, draw: (c) => A.well(c, 1360, 1140) });
      this.addInteract({
        x: 1360, y: 1148, r: 26, label: '在井边打水',
        action: () => G.ui.toast('井水很凉，绳子上还挂着一只旧铜桶', '', 2200),
      });

      /* ---------------- photo spots (travel-journal camera) ---------------- */
      this.photoSpot('parthenon', 1290, 886, '在城南台地，给帕特农来一张留影');
      this.photoSpot('piraeus', 400, 1424, '给比雷埃夫斯港的海来一张留影');
      this.photoSpot('lycabettus', 1820, 820, '在吕卡维多斯山顶，俯拍整个雅典');

      /* ---------------- NPCs ---------------- */
      this.addNPC({
        x: 1006, y: 900, name: '导游 索菲娅', palette: A.actorPalettes.guide,
        wander: 0, lines: [
          '卫城就在上面。今天是好天气，大理石会被晒得发亮。',
          '沿这条路一直走，山门那儿要过安检。',
        ],
        onTalk: () => { if (G.unlock) G.unlock('acropolis'); },
      });
      this.addNPC({
        x: 1052, y: 1128, name: '卖橄榄的摊主', palette: A.actorPalettes.vendor,
        wander: 0, lines: [
          '卡拉马塔橄榄，尝一颗？配面包正好。',
          '点圣火的仪式在帕特农前面。你来得正是时候。',
        ],
      });
      this.addNPC({
        x: 1546, y: 1036, name: '卫兵', palette: A.actorPalettes.guard,
        wander: 0, lines: [
          '（他一动不动，只有红色帽缨在风里晃。）',
        ],
      });
      this.addNPC({
        x: 1330, y: 1180, name: '游客', palette: A.actorPalettes.tourist2,
        wander: 1, radius: 26, lines: [
          '这些柱子高得不讲道理。',
          '听说今晚这里会点圣火，我得留到天黑。',
        ],
      });
      this.addNPC({
        x: 780, y: 1080, name: '放羊的孩子', palette: A.actorPalettes.child,
        wander: 1, radius: 30, lines: [
          '我的羊跑到橄榄园里去了。',
          '上面的石头房子，是给女神住的。',
        ],
      });

      /* ---------------- a few animals ---------------- */
      this.addEntity({
        x: 700, y: 1030, baseY: 1030,
        draw: (c) => A.goat(c, 700, 1030, this.time),
      });
      this.addEntity({
        x: 760, y: 1018, baseY: 1018,
        draw: (c) => A.goat(c, 760, 1018, this.time + 1),
      });
      this.addEntity({
        x: 1210, y: 980, baseY: 980,
        draw: (c) => A.cat(c, 1210, 980, this.time, { color: '#c9bfa8' }),
      });
    }

    house(c, x, base, w, h, col) {
      A.shadow(c, x, base, w + 4, 2, 0.2);
      A.r(c, x - w / 2, base - h, w, h, col);
      // side shading and upper highlight
      A.r(c, x + w / 2 - 6, base - h, 6, h, 'rgba(90,78,58,.22)');
      A.r(c, x - w / 2, base - h, w, 2, '#f0e9d8');
      A.r(c, x - w / 2, base - 3, w, 3, '#8f8267');
      // door with a step
      A.r(c, x - 5, base - 14, 10, 12, '#6b5236');
      A.r(c, x - 4, base - 13, 8, 10, '#8a6a3a');
      A.r(c, x - 6, base - 4, 12, 2, '#a99c7e');
      A.r(c, x - 1, base - 9, 2, 2, '#c9a557');
      // windows with shutters
      for (const wx of [x - w / 2 + 7, x + w / 2 - 15]) {
        A.r(c, wx, base - h + 7, 8, 7, '#3a4a56');
        A.r(c, wx + 1, base - h + 8, 6, 5, '#5b7f92');
        A.r(c, wx - 2, base - h + 7, 2, 7, '#7d3a28');
        A.r(c, wx + 8, base - h + 7, 2, 7, '#7d3a28');
      }
      // balcony on taller houses
      if (h >= 36) {
        A.r(c, x - w / 2 + 4, base - h + 16, w - 8, 2, '#6b5236');
        for (let i = 0; i < 6; i++) A.r(c, x - w / 2 + 6 + i * (w - 12) / 5, base - h + 12, 1, 4, '#8a6a3a');
      }
      // tiled roof
      for (let i = 0; i < 9; i++) {
        const hw = (w + 10) / 2 * (1 - i * 0.06);
        A.r(c, x - hw, base - h - 1 - i, hw * 2, 1, i % 2 ? P.terra : P.terraHi);
      }
      A.r(c, x - (w + 10) / 2, base - h - 1, w + 10, 2, P.terraDark);
      // chimney
      A.r(c, x + w / 2 - 12, base - h - 12, 4, 6, '#a8503a');
      A.r(c, x + w / 2 - 13, base - h - 13, 6, 2, '#7d382a');
      // bougainvillea spilling over one wall
      if (G.hash(x, base, 5) > 0.45) {
        A.r(c, x - w / 2 - 1, base - h + 2, 8, 9, '#8a3b2c');
        A.r(c, x - w / 2 + 1, base - h + 3, 5, 3, '#c45a8a');
        A.r(c, x - w / 2 + 4, base - h + 6, 4, 3, '#d9739f');
      }
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      // dry attican earth
      c.fillStyle = '#948a63';
      c.fillRect(0, 0, this.w, this.h);
      // broad tonal patches so the plain never reads as flat
      for (let gy = 0; gy < this.h; gy += 48) {
        for (let gx = 0; gx < this.w; gx += 48) {
          const n = G.hash(gx, gy, 41);
          c.save();
          c.globalAlpha = 0.06 + n * 0.08;
          c.fillStyle = n > 0.5 ? '#b8ac82' : '#6f6746';
          c.beginPath();
          c.ellipse(gx + G.hash(gx, gy, 42) * 48, gy + G.hash(gx, gy, 43) * 48,
            30 + n * 34, 18 + n * 22, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      }
      // olive-green meadows, layered with darker rims and leaf texture
      const grass = [[120, 980, 460, 320], [720, 1180, 380, 240], [1560, 1060, 380, 260], [1740, 560, 300, 220], [240, 250, 520, 300], [1320, 260, 420, 260]];
      for (const [gx, gy, gw, gh] of grass) {
        const cx = gx + gw / 2, cy = gy + gh / 2;
        c.save();
        c.globalAlpha = 0.5;
        c.fillStyle = '#7f8b58';
        c.beginPath(); c.ellipse(cx, cy, gw / 2, gh / 2, 0, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.45;
        c.fillStyle = '#6a7749';
        c.beginPath(); c.ellipse(cx - gw * 0.1, cy + gh * 0.08, gw * 0.34, gh * 0.34, 0, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.4;
        c.fillStyle = '#93a267';
        c.beginPath(); c.ellipse(cx + gw * 0.16, cy - gh * 0.14, gw * 0.26, gh * 0.24, 0, 0, Math.PI * 2); c.fill();
        c.restore();
        // leaf flecks
        c.save();
        c.globalAlpha = 0.32;
        c.fillStyle = '#5c6a3e';
        for (let i = 0; i < 90; i++) {
          const fx = gx + G.hash(i, 1, 11) * gw;
          const fy = gy + G.hash(i, 2, 12) * gh;
          if (Math.hypot(fx - cx, fy - cy) > Math.min(gw, gh) * 0.5) continue;
          c.fillRect(fx, fy, 2, 1);
          if (i % 4 === 0) { c.fillStyle = '#a8b878'; c.fillRect(fx + 2, fy - 1, 1, 2); c.fillStyle = '#5c6a3e'; }
        }
        c.restore();
      }
      // scattered dry bushes and stones across the plain
      for (let i = 0; i < 120; i++) {
        const x = G.hash(i, 1, 71) * this.w;
        const y = G.hash(i, 2, 72) * this.h;
        c.save();
        c.globalAlpha = 0.5;
        if (G.hash(i, 3, 73) > 0.55) {
          c.fillStyle = '#776f4c';
          c.beginPath(); c.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2); c.fill();
        } else {
          c.fillStyle = '#a89c74';
          c.fillRect(x, y, 2, 1);
        }
        c.restore();
      }

      // the Saronic gulf along the south-west
      c.fillStyle = '#2b5870';
      c.beginPath();
      c.moveTo(0, 1408);
      c.quadraticCurveTo(260, 1386, 520, 1432);
      c.lineTo(520, 1500);
      c.lineTo(0, 1500);
      c.closePath();
      c.fill();
      // wet sand and surf
      c.save();
      c.globalAlpha = 0.7;
      c.fillStyle = '#c9b98f';
      c.beginPath();
      c.moveTo(0, 1396);
      c.quadraticCurveTo(260, 1374, 520, 1420);
      c.lineTo(520, 1440);
      c.quadraticCurveTo(260, 1398, 0, 1420);
      c.closePath();
      c.fill();
      c.restore();
      A.water(c, 0, 1400, 540, 100, 0, 3);
      c.save();
      c.globalAlpha = 0.6;
      c.fillStyle = '#d8e6de';
      for (let x = 8; x < 520; x += 26) c.fillRect(x, 1416 + Math.round(Math.sin(x) * 2), 12, 1);
      c.restore();

      // Panathenaic Way (north-south)
      this.road(c, 1040, 470, 1120, 1410, '#cfc3a6', '#b8ab8c');
      // cross street: Ermou / the market road
      this.road(c, 560, 1000, 1500, 1070, '#cbbf9f', '#b3a684');
      // Acropolis ascent
      this.road(c, 1050, 800, 1150, 1010, '#d8cdb2', '#c2b693');
      // Plaka lanes
      this.road(c, 1180, 1040, 1600, 1090, '#cec2a2', '#b9ac8a');
      // a diagonal lane to the theatre
      this.road(c, 900, 820, 1040, 1000, '#c7ba99', '#b0a381');

      // paved plaza at the Propylaea
      A.paving(c, 980, 800, 240, 60, '#cfc3a6', '#e0d6bb', 7, 10);
      // Agora square
      A.paving(c, 520, 1000, 260, 70, '#c7bb9a', '#d8cdb0', 11, 10);
      // Syntagma square
      A.paving(c, 1470, 1010, 230, 90, '#c9bd9c', '#dcd2b5', 13, 10);
      // Olympieion terrace
      A.paving(c, 1400, 1120, 190, 60, '#c3b795', '#d6cbaa', 17, 10);
      // Monastiraki square
      A.paving(c, 930, 1090, 170, 80, '#c5b998', '#d9cfb2', 19, 10);

      // grassy hill for Lycabettus base
      c.save();
      c.globalAlpha = 0.55;
      c.fillStyle = '#6f7d51';
      c.beginPath();
      c.ellipse(1820, 792, 120, 70, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // olive grove soil
      c.save();
      c.globalAlpha = 0.5;
      for (const [gx, gy] of [[520, 1160], [590, 1108], [660, 1176], [730, 1120], [470, 1240], [640, 1258]]) {
        c.fillStyle = '#7a6a4a';
        c.fillRect(gx - 14, gy + 2, 28, 6);
        c.fillStyle = 'rgba(58,48,30,.35)';
        c.fillRect(gx - 10, gy + 6, 20, 2);
      }
      c.restore();

      // fountain water at Syntagma
      A.water(c, 1508, 1026, 24, 16, 0, 1);
      A.water(c, 1628, 1026, 24, 16, 0, 2);

      // unify the ground with a slightly deeper tone so marble reads against it
      c.save();
      c.globalAlpha = 0.1;
      c.fillStyle = '#40361f';
      c.fillRect(0, 0, this.w, this.h);
      c.restore();
    }

    road(c, x, y, w, h, base, edge) {
      const ww = w - x, hh = h - y;
      c.fillStyle = edge || '#b0a381';
      c.fillRect(x - 1, y - 1, ww + 2, hh + 2);
      c.fillStyle = base;
      c.fillRect(x, y, ww, hh);
      // worn centre line
      c.save();
      c.globalAlpha = 0.22;
      c.fillStyle = '#e6d9b8';
      c.fillRect(x + ww * 0.34, y + (hh > 60 ? hh * 0.3 : 2), ww * 0.32, hh > 60 ? hh * 0.4 : Math.max(1, hh - 4));
      c.restore();
      // slab joints
      c.save();
      c.globalAlpha = 0.2;
      c.fillStyle = '#5f5540';
      for (let yy = y + 7; yy < h; yy += 14) c.fillRect(x, yy, ww, 1);
      for (let xx = x + 20; xx < w; xx += 20) c.fillRect(xx, y, 1, hh);
      c.restore();
      // darker kerbs
      c.save();
      c.globalAlpha = 0.32;
      c.fillStyle = '#7d7050';
      c.fillRect(x, y, 2, hh);
      c.fillRect(x + ww - 2, y, 2, hh);
      c.restore();
    }

    drawGroundExtras(ctx) {
      // low terrace wall along the south of the rock
      for (let x = 900; x < 1300; x += 14) {
        A.r(ctx, x, 812, 13, 6, '#b6aa8d');
        A.r(ctx, x, 812, 13, 1, '#d2c7ab');
        A.r(ctx, x, 817, 13, 1, '#8f8267');
      }
      // field walls along the roadsides
      for (const [wx, wy, len] of [[478, 1044, 150], [900, 930, 90], [1180, 1210, 120]]) {
        A.wallH(ctx, wx, wx + len, wy, 9, { color: '#b3a684' });
      }
      // tall dry grass tufts by the wayside
      ctx.save();
      for (let i = 0; i < 40; i++) {
        const x = 200 + G.hash(i, 4, 81) * 1800;
        const y = 560 + G.hash(i, 5, 82) * 820;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = G.hash(i, 6, 83) > 0.5 ? '#8f9a63' : '#a8b078';
        ctx.fillRect(x, y, 1, 3);
        ctx.fillRect(x + 1, y - 1, 1, 3);
        ctx.fillRect(x - 1, y, 1, 2);
      }
      ctx.restore();
      // marble chips near the ruin fields
      for (const [rx, ry] of [[455, 892], [1440, 1180], [700, 950]]) {
        A.rubble(ctx, rx, ry, 1.2);
      }
    }


    /* ============================================================
       interactions / ambient
       ============================================================ */
    toggleMap(force) {
      this.mapOpen = force == null ? !this.mapOpen : !!force;
      G.audio.sfx('page');
      const hud = G.$('#hud');
      if (hud) hud.classList.toggle('map-open', this.mapOpen);
      if (this.mapOpen) {
        this.player.moving = false;
        G.ui.prompt(null);
      } else {
        G.input.clearPressed();
      }
    }

    gate() {
      if (G.save.flag('entered')) {
        G.dialog.show([
          { name: '山门管理员', text: '您已经入园了。帕特农神庙前今晚有点圣火的仪式。' },
        ]);
        return;
      }
      G.dialog.show([
        { name: '卫城山门 · 管理员', text: '前方是卫城。请出示证件，随身物品过一下安检。' },
        { name: '旅行手账', text: '过了这道门，就是女神住的山顶。' },
      ], () => {
        if (G.security) G.security.start();
      });
    }

    /* ============================================================
       橄榄油 · 小经济
       在橄榄园采收橄榄 → 榨成橄榄油；到蒙纳斯提拉奇市集，用油
       向摊主换小物件。油是一种轻量的“货币”，也让探索多一个
       理由。
       ============================================================ */
    oliveGrove() {
      const has = G.save.data.oil || 0;
      if (!G.save.flag('olive')) {
        G.save.flag('olive', true);
        G.save.addOil(1);
        if (G.unlock) G.unlock('olive');
        G.audio.sfx('pickup');
        G.ui.toast('橄榄油 +1 · 先认识这座城市最老的一棵树', 'good', 2600);
        G.dialog.show([
          { name: '橄榄园', text: '雅典娜把橄榄树送给这座城市。银灰的叶子在风里翻过来，像一片安静的海。' },
          { name: '旅行手账', text: '树下的落果很多。捡起来，碾一碾，就是最旧的一种油。' },
        ]);
        return;
      }
      const cap = 8;
      if (has >= cap) {
        G.dialog.show([
          { name: '橄榄园', text: '橄榄桶满了。油这种东西，攒得再多，也还是要舍得拿出来用。' },
        ]);
        return;
      }
      G.choice.show([
        { text: '采收一篮 · 榨成新油' },
        { text: '只是坐一会儿，听风穿过银灰的叶子' },
        { text: '摸一摸那棵最老的树' },
      ], {
        title: '橄榄园 · 要去做什么？',
        onPick: (i) => {
          if (i === 0) {
            G.audio.sfx('pickup');
            G.save.addOil(1);
            G.ui.toast('橄榄油 +1（现有 ' + G.save.data.oil + '） · 可以拿去市集换东西', 'good', 2800);
            G.dialog.show([
              { name: '旅行手账', text: '一篮橄榄，石碾子一压，就流出清亮的油。装进小陶瓶，收进行囊。' },
            ]);
          } else if (i === 1) {
            G.dialog.show([
              { name: '橄榄园', text: '风把一整片树的叶子翻成银白色。远处有人在唱一支很老的歌。' },
            ]);
          } else {
            G.dialog.show([
              { name: '橄榄园', text: '那棵老树的树皮裂成一格一格的，像一张旧地图。两百年前它就在这里的说法，没人反驳。' },
            ]);
          }
        },
      });
    }

    /* boat in the harbor — a quiet spot after the festival */
    boat() {
      if (!G.save.flag('finished')) {
        G.dialog.show([
          { name: '码头工人', text: '要去最南边的海岬？那得等入夜后、圣火点过才开船。你先去卫城看看热闹吧。' },
        ]);
        return;
      }
      G.dialog.show([
        { name: '码头工人', text: '圣火点过了，今天的活儿也完了。往海上看，比雷埃夫斯的船一盏一盏地亮起来。' },
        { name: '旅行手账', text: '风从萨罗尼克湾吹过来，带着咸味。这座城，今晚很安静。' },
      ]);
    }

    /* generic photo interaction: a "viewpoint" spot */
    photoSpot(id, x, y, label) {
      const spec = (G.photo && G.photo.spec(id)) || {};
      this.addEntity({
        x, y: y - 6, baseY: y - 6,
        draw: (c) => {
          // a little viewfinder stand
          A.r(c, x - 3, y - 2, 6, 4, P.bronzeDark);
          A.r(c, x - 7, y - 8, 14, 6, P.marbleMid);
          A.r(c, x - 6, y - 7, 12, 1, P.marbleHi);
        },
      });
      this.addInteract({
        x, y, r: 30, label,
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

    /* the market trader where oil is spent */
    marketTrade() {
      const oil = G.save.data.oil || 0;
      if (oil <= 0) {
        G.dialog.show([
          { name: '摊主', text: '没有油，就没有话头。城西那片橄榄园，去捡一篮来吧。' },
        ]);
        return;
      }
      const makeRow = (obj) => {
        const bought = G.save.flag(obj.flag);
        return { obj, bought, text: obj.label + (bought ? ' · 已有' : ' · ' + obj.cost + ' 瓶油') };
      };
      const rows = [
        makeRow({ flag: 'oilLamp', cost: 1, label: '一盏小铜油灯 · 照亮家里窗台', give: 'oilLamp' }),
        makeRow({ flag: 'oilAmphora', cost: 2, label: '一只有纹饰的油罐 · 手账会记下一页', give: 'oilAmphora' }),
        makeRow({ flag: 'oilWreath', cost: 3, label: '一枚橄榄枝环 · 挂在院门寓意平安', give: 'oilWreath' }),
      ];
      G.choice.show(rows.map((r) => {
        return { text: r.text + (r.bought ? '（已换）' : '') };
      }).concat([{ text: '先不换了 · 再说' }]), {
        title: '蒙纳斯提拉奇 · 一筐油能换些什么？',
        onPick: (i) => {
          if (i === rows.length) return;
          const r = rows[i];
          if (r.bought) {
            G.dialog.show([{ name: '摊主', text: '这份早换给你了，拿好别弄丢。' }]);
            return;
          }
          const cost = r.obj.cost;
          if (!G.save.spendOil(cost)) {
            G.dialog.show([{ name: '摊主', text: '油不够。还差 ' + (cost - G.save.data.oil) + ' 瓶。' }]);
            return;
          }
          G.save.flag(r.obj.give, true);
          G.audio.sfx('confirm');
          G.ui.toast('换来「' + r.obj.label.split(' · ')[0] + '」 · 剩 ' + G.save.data.oil + ' 瓶油', 'good', 2800);
          G.dialog.show([
            { name: '摊主', text: '油是好东西。这物件你收好，是亚特兰提斯老手艺，别处买不着。' },
            { name: '旅行手账', text: '一坛油换回一件旧物件。这城里的买卖，闻起来都是橄榄的清香。' },
          ]);
        },
      });
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

    updateAmbient(dt) {
      // wind-blown dust
      if (Math.random() < dt * 1.9) {
        const x = this.cam.x + G.rand(-40, G.W + 40);
        const y = this.cam.y + G.rand(0, G.H);
        G.fx.add({
          x, y, vx: G.rand(4, 12), vy: G.rand(-3, 3),
          life: G.rand(1.4, 2.8), size: 1, color: 'rgba(240,226,190,.32)',
          grav: 0, glow: false,
        });
      }
      // seagulls over the harbour
      if (Math.random() < dt * 1.2) {
        G.fx.add({
          x: 240 + G.rand(-40, 220), y: 1320 + G.rand(-30, 20),
          vx: G.rand(4, 10), vy: G.rand(-6, 2),
          life: G.rand(1.4, 2.6), size: 1, color: 'rgba(240,240,232,.8)',
          grav: 0, glow: false,
        });
      }
    }

    /* ============================================================
       parchment map
       ============================================================ */
    drawMap(ctx) {
      const mx = 96, my = 34, mw = 450, mh = 296;
      const X = (wx) => mx + (wx / this.w) * mw;
      const Y = (wy) => my + (wy / this.h) * mh;
      ctx.save();
      ctx.fillStyle = 'rgba(10,8,6,.86)';
      ctx.fillRect(0, 0, 640, 360);
      // parchment
      ctx.fillStyle = '#e9dcbc';
      ctx.fillRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.save();
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 180; i++) {
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
      G.text(ctx, '雅典 · 卫城地图', mx - 2, my - 7, { size: 11, color: '#3d2d1c', weight: 'bold' });
      G.text(ctx, 'M 关闭', mx + mw - 32, my - 7, { size: 7, color: '#7d684c' });
      // watermark
      ctx.save();
      ctx.globalAlpha = 0.05;
      G.text(ctx, '雅', mx + mw / 2, my + mh / 2 + 40, { size: 128, color: '#6b2e22', align: 'center' });
      ctx.restore();

      // ---- the Saronic gulf ----
      ctx.fillStyle = '#bcd2d2';
      ctx.beginPath();
      ctx.moveTo(X(0), Y(1412));
      ctx.quadraticCurveTo(X(260), Y(1388), X(520), Y(1436));
      ctx.lineTo(X(520), Y(this.h));
      ctx.lineTo(X(0), Y(this.h));
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.strokeStyle = 'rgba(70,120,140,.5)'; ctx.lineWidth = 1;
      for (let wx = 30; wx < 500; wx += 34) {
        const wy = 1436 + (wx % 68 === 0 ? 6 : 0);
        ctx.beginPath();
        ctx.moveTo(X(wx), Y(wy));
        ctx.quadraticCurveTo(X(wx + 8), Y(wy - 3), X(wx + 16), Y(wy));
        ctx.stroke();
      }
      ctx.restore();
      G.text(ctx, '萨罗尼克湾', X(180), Y(1470), { size: 6, color: '#40646e', align: 'center' });

      // ---- districts and groves ----
      ctx.fillStyle = 'rgba(140,110,70,.12)';
      ctx.fillRect(X(1140), Y(940), X(1720) - X(1140), Y(1300) - Y(940));
      ctx.fillStyle = 'rgba(110,130,85,.2)';
      ctx.beginPath();
      ctx.ellipse(X(360), Y(1120), X(240) - X(0), Y(190) - Y(0), 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.ellipse(X(1840), Y(700), X(200) - X(0), Y(150) - Y(0), 0, 0, Math.PI * 2); ctx.fill();
      // olive tree symbols in the grove
      ctx.fillStyle = '#5d6b3e';
      for (const [ox, oy] of [[520, 1160], [590, 1108], [660, 1176], [730, 1120], [470, 1240], [640, 1258]]) {
        ctx.beginPath(); ctx.arc(X(ox), Y(oy), 3, 0, Math.PI * 2); ctx.fill();
      }

      // ---- roads: ink outline then pale ribbon ----
      function ribbon(x1, y1, x2, y2, w) {
        ctx.strokeStyle = 'rgba(90,70,42,.55)'; ctx.lineWidth = (w || 6) + 2;
        ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
        ctx.strokeStyle = '#efe4c6'; ctx.lineWidth = w || 6;
        ctx.beginPath(); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke();
      }
      ribbon(1080, 1420, 1080, 820, 7);
      ribbon(540, 1035, 1520, 1035, 5);
      ribbon(1080, 1010, 1440, 1150, 4);
      ribbon(1260, 1060, 1660, 1060, 4);
      ribbon(900, 830, 1040, 1010, 4);

      // ---- the Acropolis rock ----
      ctx.fillStyle = '#d8c9a3';
      ctx.beginPath();
      ctx.ellipse(X(1100), Y(770), X(250) - X(0), Y(128) - Y(0), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a7550'; ctx.lineWidth = 1;
      ctx.stroke();
      // contour hatching
      ctx.save();
      ctx.strokeStyle = 'rgba(122,100,64,.45)';
      for (let r = 0.35; r < 1; r += 0.2) {
        ctx.beginPath();
        ctx.ellipse(X(1100), Y(770), (X(250) - X(0)) * r, (Y(128) - Y(0)) * r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      // the Parthenon glyph
      ctx.fillStyle = '#8a3b2c';
      ctx.fillRect(X(1100) - 7, Y(742) - 4, 14, 8);
      ctx.fillStyle = '#f0e2c0';
      for (let i = 0; i < 5; i++) ctx.fillRect(X(1100) - 6 + i * 3, Y(742) - 3, 1, 5);
      // the Propylaea glyph
      ctx.fillStyle = '#8a7550';
      ctx.fillRect(X(1090) - 5, Y(818) - 3, 10, 5);

      // ---- landmark labels, staggered ----
      const label = (wx, wy, text, dx, dy, hot) => {
        const px = X(wx), py = Y(wy);
        if (hot) {
          ctx.strokeStyle = '#8a2f22'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, 6 + Math.sin(this.time * 3) * 1.5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = hot ? '#8a2f22' : '#4a3a26';
        ctx.beginPath(); ctx.arc(px, py, hot ? 3.2 : 2, 0, Math.PI * 2); ctx.fill();
        G.text(ctx, text, px + dx, py + dy, {
          size: 6.4, color: '#3d2d1c', outline: 'rgba(238,226,196,.85)', outlineWidth: 2.4,
        });
      };
      label(1100, 742, '帕特农', -58, 2);
      label(1090, 818, '山门', 18, 10, true);
      label(880, 792, '剧场', -26, 12);
      label(650, 1010, '古市集', -34, 2);
      label(545, 920, '火神庙', -34, 2);
      label(1280, 1098, '普拉卡', 10, 12);
      label(1490, 1172, '宙斯庙', 10, 10);
      label(1372, 1160, '拱门', -24, -6);
      label(1580, 1012, '宪法广场', -50, -6);
      label(1820, 800, '吕卡维多斯', 10, 2);
      label(320, 1424, '比雷埃夫斯', 10, -6);
      label(1010, 1120, '市集', -22, 14);
      label(1100, 1404, '迪皮隆门', 10, 12);
      label(760, 1300, '卫城大道', -60, 2);

      // ---- you are here ----
      const px = X(this.player.x), py = Y(this.player.y);
      let chipX = px + 6, chipY = py + 4;
      if (chipX > mx + mw - 40) chipX = px - 36;
      if (chipY > my + mh - 12) chipY = py - 14;
      ctx.fillStyle = 'rgba(238,226,196,.92)';
      ctx.fillRect(chipX, chipY, 32, 9);
      ctx.fillStyle = '#b03a26';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b03a26'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
      G.text(ctx, '你在这里', chipX + 2, chipY + 7, { size: 6, color: '#7d2f22' });

      // ---- compass and scale ----
      const cxp = mx + mw - 26, cyp = my + mh - 30;
      ctx.save();
      ctx.strokeStyle = '#7d684c'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cxp, cyp, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cxp, cyp - 12); ctx.lineTo(cxp + 3, cyp + 1); ctx.lineTo(cxp, cyp - 3);
      ctx.lineTo(cxp - 3, cyp + 1); ctx.closePath();
      ctx.fillStyle = '#8a3b2c'; ctx.fill();
      G.text(ctx, 'N', cxp, cyp - 15, { size: 6, color: '#5f4529', align: 'center', weight: 'bold' });
      ctx.restore();
      // scale bar
      ctx.fillStyle = '#5f4529';
      ctx.fillRect(mx + 10, my + mh - 24, 40, 2);
      ctx.fillRect(mx + 10, my + mh - 27, 2, 6);
      ctx.fillRect(mx + 48, my + mh - 27, 2, 6);
      G.text(ctx, '500 米', mx + 16, my + mh - 16, { size: 6, color: '#6b5636' });

      // ---- footer ----
      G.text(ctx, '泛雅典娜大道 · 北行至卫城', mx + 8, my + mh + 15, { size: 7, color: '#6b5636' });
      G.text(ctx, '卫城 · 雅典', mx + mw - 56, my + mh + 15, { size: 7, color: '#6b5636' });
      ctx.restore();
    }

    drawScreen(ctx) {
      if (this.mapOpen) { this.drawMap(ctx); return; }
      const g = ctx.createRadialGradient(320, 175, 150, 320, 180, 380);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(8,5,3,.3)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
    }
  }

  G.AthensScene = AthensScene;
})();
