/* ============================================================
   紫禁城 · 铁火 — inside the Palace Museum
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  const ITEMS = {
    iron: { name: '生铁块', x: 1204, y: 824, desc: '一块沉甸甸的生铁，断面泛着青灰色。' },
    charcoal: { name: '柳木炭', x: 600, y: 306, desc: '柳木烧成的炭，敲起来声音清脆。' },
    ladle: { name: '柳木勺', x: 1118, y: 1002, desc: '长柄柳木勺，勺口被铁水烫出焦痕。' },
  };

  class GugongScene extends G.WorldScene {
    constructor() {
      super({
        id: 'gugong', w: 1500, h: 1620, spawn: { x: 750, y: 1300 },
        clock: '16:20', ambient: 'palace', lookAhead: 52, gradeStrength: 0.9,
      });
      this.marker = { x: 750, y: 218 };
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
      const self = this;

      /* ---------------- perimeter walls ---------------- */
      this.solid(150, 100, 14, 1420);
      this.solid(1336, 100, 14, 1420);
      this.solid(150, 1540, 1200, 14);
      this.solid(150, 96, 1200, 12);

      /* ---------------- 午门 ---------------- */
      this.addEntity({
        x: 750, y: 1512, baseY: 1512,
        draw: (c) => {
          A.drawGate(c, 750, 1512, 300, {
            wallH: 60, roofH: 30, double: true, arches: 3, name: '午门',
          });
          A.wallH(c, 180, 570, 1512, 30);
          A.wallH(c, 930, 1320, 1512, 30);
        },
      });
      this.solid(590, 1490, 120, 24);
      this.solid(790, 1490, 120, 24);
      this.solid(180, 1490, 410, 24);
      this.solid(910, 1490, 410, 24);
      this.addInteract({
        x: 750, y: 1472, r: 40, label: '回望午门',
        action: () => {
          if (G.unlock) G.unlock('wumen');
          G.dialog.show([
            { name: '午门', text: '午门平面呈“凹”字形，两翼各有一座重檐攒尖亭，合称五凤楼。' },
            { name: '旅行手账', text: '从这个门洞进来，就算真的进宫了。' },
          ]);
        },
      });

      /* ---------------- 内金水河 ---------------- */
      this.addInteract({
        x: 900, y: 1338, r: 34, label: '内金水桥',
        action: () => {
          if (G.unlock) G.unlock('jinshui');
          G.dialog.show([
            { name: '内金水桥', text: '内金水河自西北流入，蜿蜒向东。河上五座汉白玉桥，中间的御路桥只供帝王通行。' },
            { name: '旅行手账', text: '水声很轻。桥面的汉白玉被磨得发亮。' },
          ]);
        },
      });
      // five marble bridges
      for (const bx of [590, 670, 750, 830, 910]) {
        this.addEntity({
          x: bx, y: 1360, baseY: 1300,
          draw: (c) => A.bridge(c, bx, 1340, 26),
        });
      }
      // river is impassable except on the five bridges
      let riverX = 384;
      for (const bx of [590, 670, 750, 830, 910]) {
        const left = bx - 13, right = bx + 13;
        if (left > riverX) this.solid(riverX, 1318, left - riverX, 44);
        riverX = right;
      }
      this.solid(riverX, 1318, 1120 - riverX, 44);

      /* ---------------- 太和门 ---------------- */
      this.addBuilding(750, 1238, (c) => {
        A.drawGate(c, 750, 1238, 232, {
          wallH: 42, roofH: 24, double: true, arches: 3, name: '太和门',
        });
      });
      this.solid(610, 1218, 90, 20);
      this.solid(800, 1218, 90, 20);
      this.addEntity({ x: 584, y: 1248, baseY: 1248, draw: (c) => A.lion(c, 584, 1248, false) });
      this.addEntity({ x: 916, y: 1248, baseY: 1248, draw: (c) => A.lion(c, 916, 1248, true) });
      this.solid(572, 1240, 24, 8);
      this.solid(904, 1240, 24, 8);

      /* ---------------- 太和殿 ---------------- */
      this.addBuilding(750, 1040, (c) => {
        A.drawHall(c, 750, 1040, 300, {
          wallH: 40, roofH: 34, double: true, name: '太和殿', bays: 7, platformPad: 56, stairW: 52,
          openDoor: true,
        });
      });
      this.solid(570, 995, 144, 45);
      this.solid(786, 995, 144, 45);
      this.addInteract({
        x: 940, y: 1090, r: 40, label: '太和殿 · 金銮殿',
        action: () => {
          if (G.unlock) G.unlock('taihe');
          G.dialog.show([
            { name: '太和殿', text: '俗称金銮殿，重檐庑殿顶，面阔十一间。明清两代的登基、大婚、册立等大典都在这里举行。' },
            { name: '太和殿', text: '屋脊上排着十只脊兽，是紫禁城里唯一用满十只的建筑。' },
            { name: '旅行手账', text: '站在广场中央，人小得像一粒沙。' },
          ]);
        },
      });
      // 铜狮 / 大缸 / 日晷 / 嘉量
      this.addEntity({ x: 548, y: 1120, baseY: 1120, draw: (c) => A.lion(c, 548, 1120, false) });
      this.addEntity({ x: 952, y: 1120, baseY: 1120, draw: (c) => A.lion(c, 952, 1120, true) });
      this.solid(536, 1112, 24, 8);
      this.solid(940, 1112, 24, 8);
      this.addEntity({ x: 500, y: 1090, baseY: 1090, draw: (c) => A.vat(c, 500, 1090, { water: true }) });
      this.addEntity({ x: 1000, y: 1090, baseY: 1090, draw: (c) => A.vat(c, 1000, 1090, { water: true }) });
      this.addEntity({ x: 1004, y: 1160, baseY: 1160, draw: (c) => A.sundial(c, 1004, 1160) });
      this.addEntity({ x: 496, y: 1160, baseY: 1160, draw: (c) => A.rock(c, 496, 1160, 0.8) });
      this.addEntity({ x: 660, y: 1070, baseY: 1070, draw: (c) => A.crane(c, 660, 1070) });
      this.addEntity({ x: 840, y: 1070, baseY: 1070, draw: (c) => A.crane(c, 840, 1070) });

      /* ---------------- side wings: 庑房 ---------------- */
      this.addWing(438, 790, 1180);
      this.addWing(1062, 790, 1180);
      // a handful of visitors give the courtyard its scale
      const visitors = [
        [648, 1160, 'tourist2', 'left'], [842, 1184, 'tourist', 'right'],
        [612, 966, 'auntie', 'right'], [902, 936, 'child', 'left'],
        [560, 1064, 'tourist', 'down'], [948, 1072, 'tourist2', 'up'],
        [690, 1260, 'worker', 'down'], [810, 1276, 'tourist', 'up'],
        [560, 1000, 'auntie', 'right'], [940, 1000, 'tourist', 'left'],
        [624, 882, 'child', 'up'], [878, 880, 'tourist2', 'down'],
      ];
      for (const [vx, vy, pal, dir] of visitors) {
        this.addEntity({
          x: vx, y: vy, baseY: vy,
          draw: (c) => A.drawActor(c, vx, vy, {
            dir, time: this.time + vx * 0.01, scale: 1.15,
            palette: A.actorPalettes[pal], moving: false,
          }),
        });
      }
      // clipped yew hedges and benches along the wings
      for (const [tx, ty] of [[506, 900], [994, 900], [506, 1140], [994, 1140]]) {
        this.addEntity({ x: tx, y: ty, baseY: ty, draw: (c) => A.pine(c, tx, ty, 0.72) });
        this.solid(tx - 3, ty - 4, 6, 4);
      }
      this.addEntity({ x: 560, y: 1210, baseY: 1210, draw: (c) => A.bench(c, 560, 1210) });
      this.addEntity({ x: 940, y: 1210, baseY: 1210, draw: (c) => A.bench(c, 940, 1210) });
      // cypress clusters and bronze burners frame the great courtyard
      for (const [tx, ty, s] of [[530, 872, 1.1], [970, 872, 1.1], [530, 1118, 1.0], [970, 1118, 1.0], [500, 700, 0.9], [1000, 700, 0.9]]) {
        this.addEntity({ x: tx, y: ty, baseY: ty, draw: (c) => A.pine(c, tx, ty, s) });
        this.solid(tx - 4, ty - 5, 8, 5);
      }
      // bronze incense burners
      for (const bx of [620, 880]) {
        this.addEntity({
          x: bx, y: 1168, baseY: 1168,
          draw: (c) => {
            A.shadow(c, bx, 1168, 24, 3, 0.28);
            A.r(c, bx - 9, 1158, 18, 8, '#5b4a2a');
            A.r(c, bx - 8, 1157, 16, 2, '#b08a46');
            A.r(c, bx - 10, 1150, 20, 2, '#8a6a3a');
            A.r(c, bx - 7, 1146, 14, 4, '#6b5330');
            A.r(c, bx - 5, 1144, 10, 2, '#c39a4b');
          },
        });
        this.solid(bx - 10, 1160, 20, 8);
      }
      // ceremonial banner poles at the edges of the great courtyard
      for (const [bx, by] of [[500, 980], [1000, 980], [500, 1185], [1000, 1185]]) {
        this.addEntity({ x: bx, y: by, baseY: by, draw: (c) => this.drawBanner(c, bx, by) });
      }
      // butterflies in the garden
      for (const [bx, by, hue] of [[600, 276, '#d9a35b'], [690, 322, '#e7c9a0'], [820, 300, '#c97f74']]) {
        this.addEntity({
          x: bx, y: by, baseY: by,
          draw: (c) => {
            const ox = Math.sin(this.time * 1.7 + bx) * 12;
            const oy = Math.cos(this.time * 2.1 + by) * 7;
            const flap = Math.sin(this.time * 11 + bx) > 0 ? 1 : 0;
            A.r(c, bx + ox, by + oy, 1, 1, '#3b2a1a');
            A.r(c, bx + ox - 2, by + oy - flap, 2, 1, hue);
            A.r(c, bx + ox + 1, by + oy - flap, 2, 1, hue);
          },
        });
      }
      // a string of small lanterns over the axis
      this.addEntity({
        x: 750, y: 1190, baseY: 1190,
        draw: (c) => {
          c.strokeStyle = 'rgba(67,44,24,.55)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(650, 1160); c.quadraticCurveTo(750, 1178, 850, 1160); c.stroke();
          for (let i = 0; i < 7; i++) {
            const t = i / 6;
            const lx = 650 + t * 200;
            const ly = 1160 + Math.sin(t * Math.PI) * 12;
            A.r(c, lx - 1, ly, 1, 4, '#d8b26a');
            A.r(c, lx - 3, ly + 4, 6, 6, '#b3402c');
            A.r(c, lx - 2, ly + 5, 4, 4, '#e05b37');
            A.r(c, lx - 1, ly + 9, 2, 2, '#e8c178');
          }
        },
      });
      // a few more visitors at the edges of the square
      const moreVisitors = [
        [600, 842, 'tourist', 'right'], [900, 842, 'auntie', 'left'],
        [620, 1120, 'child', 'up'], [880, 1120, 'tourist2', 'down'],
        [710, 1178, 'guide', 'right'], [790, 1188, 'tourist', 'left'],
      ];
      for (const [vx, vy, pal, dir] of moreVisitors) {
        this.addEntity({
          x: vx, y: vy, baseY: vy,
          draw: (c) => A.drawActor(c, vx, vy, {
            dir, time: this.time + vx * 0.013, scale: 1.14,
            palette: A.actorPalettes[pal], moving: false,
          }),
        });
      }

      /* ---------------- 中和殿 / 保和殿 ---------------- */
      this.addBuilding(750, 872, (c) => {
        A.drawHall(c, 750, 872, 116, { wallH: 26, roofH: 24, name: '中和殿', platformPad: 26 });
      });
      this.solid(690, 848, 120, 26);
      this.addInteract({
        x: 860, y: 884, r: 34, label: '中和殿',
        action: () => G.dialog.show([
          { name: '中和殿', text: '方形攒尖顶，是皇帝去太和殿大典前稍作休息、接受执事官员行礼的地方。' },
        ]),
      });
      this.addBuilding(750, 772, (c) => {
        A.drawHall(c, 750, 772, 196, {
          wallH: 32, roofH: 28, double: true, name: '保和殿', platformPad: 38,
          openDoor: true,
        });
      });
      this.solid(640, 744, 74, 30);
      this.solid(786, 744, 74, 30);
      this.addInteract({
        x: 900, y: 790, r: 34, label: '保和殿',
        action: () => {
          if (G.unlock) G.unlock('baohe');
          G.dialog.show([
            { name: '保和殿', text: '明代册立皇后、皇太子在此更衣。清代殿试的“殿试”也在这里举行，前三名即状元、榜眼、探花。' },
          ]);
        },
      });

      /* ---------------- 乾清门 ---------------- */
      this.addBuilding(750, 664, (c) => {
        A.drawGate(c, 750, 664, 210, {
          wallH: 38, roofH: 22, double: true, arches: 3, name: '乾清门',
        });
      });
      this.solid(618, 646, 86, 18);
      this.solid(796, 646, 86, 18);

      /* ---------------- 乾清宫 / 交泰殿 / 坤宁宫 ---------------- */
      this.addBuilding(750, 574, (c) => {
        A.drawHall(c, 750, 574, 236, {
          wallH: 34, roofH: 28, double: true, name: '乾清宫', platformPad: 40,
          openDoor: true,
        });
      });
      this.solid(610, 544, 104, 32);
      this.solid(786, 544, 104, 32);
      this.addInteract({
        x: 940, y: 600, r: 40, label: '乾清宫',
        action: () => {
          if (G.unlock) G.unlock('qianqing');
          G.dialog.show([
            { name: '乾清宫', text: '内廷正殿。明清十六位皇帝曾在此居住、处理政务。殿内高悬“正大光明”匾。' },
            { name: '乾清宫', text: '清代雍正以后，皇帝移居养心殿，这里仍是举行内廷典礼的地方。' },
          ]);
        },
      });
      this.addBuilding(750, 490, (c) => {
        A.drawHall(c, 750, 490, 96, { wallH: 22, roofH: 21, name: '交泰殿', platformPad: 22 });
      });
      this.solid(700, 468, 100, 24);
      this.addBuilding(750, 406, (c) => {
        A.drawHall(c, 750, 406, 190, {
          wallH: 30, roofH: 26, double: true, name: '坤宁宫', platformPad: 34,
          openDoor: true,
        });
      });
      this.solid(644, 380, 70, 28);
      this.solid(786, 380, 70, 28);
      this.addInteract({
        x: 910, y: 420, r: 34, label: '坤宁宫',
        action: () => G.dialog.show([
          { name: '坤宁宫', text: '明代皇后寝宫。清代改为祭神场所，皇帝大婚的洞房也设在这里。' },
        ]),
      });

      /* ---------------- 御花园 ---------------- */
      this.addBuilding(750, 302, (c) => this.pavilion(c, 750, 302, 1.25));
      this.solid(714, 292, 72, 12);
      this.addEntity({ x: 610, y: 318, baseY: 318, draw: (c) => A.rock(c, 610, 318, 1.2) });
      this.solid(598, 306, 24, 12);
      this.addEntity({ x: 882, y: 330, baseY: 330, draw: (c) => this.pavilion(c, 882, 330, 0.8) });
      this.solid(858, 322, 48, 10);
      // trees in the garden
      const gy = [[540, 350], [570, 270], [660, 360], [700, 250], [810, 260], [840, 360], [920, 300], [500, 300]];
      gy.forEach(([x, y], i) => {
        if (i % 3 === 0) {
          this.addEntity({ x, y, baseY: y, draw: (c) => A.pine(c, x, y, 0.75) });
        } else {
          this.addEntity({ x, y, baseY: y, draw: (c) => A.tree(c, x, y, 0.95, { autumn: i === 5 }) });
        }
        this.solid(x - 3, y - 4, 6, 4);
      });
      this.addInteract({
        x: 640, y: 380, r: 40, label: '御花园',
        action: () => {
          if (G.unlock) G.unlock('yuhuayuan');
          G.dialog.show([
            { name: '御花园', text: '明永乐年间建，原名宫后苑。古柏、太湖石、万春亭与千秋亭藏在红墙之间。' },
            { name: '旅行手账', text: '宫里的树比人老得多。它们看过太多场日落。' },
          ]);
        },
      });

      /* ---------------- 宫猫 ---------------- */
      this.addEntity({
        x: 878, y: 286, baseY: 286,
        draw: (c) => A.cat(c, 878, 286, this.time, { color: '#c58448' }),
      });
      this.addInteract({
        x: 878, y: 292, r: 28, label: '摸摸宫猫',
        action: () => {
          if (G.unlock) G.unlock('cat');
          G.audio.sfx('pickup');
          G.dialog.show([
            { name: '宫猫', text: '（它眯起眼，尾巴扫过你的裤脚。脖子上挂着一块小小的铜牌。）' },
            { name: '旅行手账', text: '故宫的猫。它们才是这里真正的主人。' },
          ]);
        },
      });

      /* ---------------- 神武门 ---------------- */
      this.addBuilding(750, 152, (c) => {
        A.drawGate(c, 750, 152, 282, {
          wallH: 52, roofH: 27, double: true, arches: 3, name: '神武门',
        });
      });
      this.solid(608, 132, 284, 22);
      this.addInteract({
        x: 750, y: 178, r: 34, label: '神武门',
        action: () => {
          if (G.unlock) G.unlock('shenwumen');
          G.dialog.show([
            { name: '神武门', text: '紫禁城北门，原名玄武门。清代为避康熙帝玄烨名讳，改称神武门。' },
            { name: '旅行手账', text: '出了这道门就是景山。今晚，先在这里看铁花。' },
          ]);
        },
      });

      /* ---------------- side halls ---------------- */
      this.sideHall(330, 1230, 142, '武英殿', 'wuying', '清代设武英殿修书处，曾在此编纂《四库全书》。');
      this.sideHall(1170, 1230, 142, '文华殿', 'wenhua', '明代太子讲学之所，清代经筵典礼在此举行。');
      this.sideHall(304, 820, 140, '慈宁宫', 'cining', '明清太后居所。孝庄文皇后曾在此居住。');
      this.sideHall(304, 590, 140, '寿康宫', 'shoukang', '清代太后、太妃的居所，乾隆生母崇庆皇太后曾居于此。');
      this.sideHall(1196, 812, 150, '珍宝馆', 'zhenbao', '宁寿宫区域，收藏金银器、珠宝、玉石盆景等宫廷珍宝。');
      this.sideHall(304, 380, 140, '钟表馆', 'zhongbiao', '奉先殿区域，收藏十八至二十世纪的中外宫廷钟表。');
      this.sideHall(1138, 560, 130, '东六宫', 'dongliugong', '景仁宫、承乾宫、钟粹宫等六座宫院，明清后妃居所。');
      this.sideHall(304, 250, 130, '西六宫', 'xiliugong', '永寿宫、翊坤宫、储秀宫等六座宫院。');

      /* ---------------- 箭亭 ---------------- */
      this.addBuilding(1100, 986, (c) => {
        A.drawHall(c, 1100, 986, 104, { wallH: 24, roofH: 22, name: '箭亭', platformPad: 24 });
      });
      this.solid(1042, 962, 116, 24);
      this.addInteract({
        x: 1100, y: 1010, r: 36, label: '箭亭',
        action: () => {
          if (G.unlock) G.unlock('jianting');
          G.dialog.show([
            { name: '箭亭', text: '清代皇帝和皇子练习骑射的地方。乾隆曾在此阅骑射，并立碑告诫后世不忘满洲根本。' },
            { name: '旅行手账', text: '木勺就靠在箭亭的廊柱边。老赵说，这是打铁花用的。' },
          ]);
        },
      });

      /* ---------------- 大缸 / 灯 ---------------- */
      for (const [x, y] of [[520, 700], [980, 700], [520, 1230], [980, 1230]]) {
        this.addEntity({ x, y, baseY: y, draw: (c) => A.vat(c, x, y) });
        this.solid(x - 8, y - 5, 16, 5);
      }
      for (let y = 1180; y >= 240; y -= 120) {
        for (const x of [690, 810]) {
          if (Math.abs(y - 1040) < 60 || Math.abs(y - 574) < 50) continue;
          this.addEntity({
            x, y, baseY: y,
            draw: (c) => A.lantern(c, x, y, { h: 34, night: this.night }),
          });
        }
      }
      for (let i = 0; i < 10; i++) {
        const x = 520 + (i % 5) * 110;
        const y = 480 + Math.floor(i / 5) * 70;
        this.addEntity({ x, y, baseY: y, draw: (c) => A.streetlamp(c, x, y, this.night) });
      }

      /* ---------------- NPCs ---------------- */
      this.zhao = this.addNPC({
        x: 750, y: 232, name: '老赵', palette: A.actorPalettes.zhao,
        dir: 'down', quest: true, wander: false,
        getLines: () => this.zhaoLines(),
        onTalk: () => this.onZhaoTalk(),
      });
      this.addNPC({
        x: 870, y: 1110, name: '讲解员', palette: A.actorPalettes.guide,
        dir: 'left', quest: false, wander: true,
        lines: [
          { name: '讲解员', text: '太和殿广场可以容纳上万人。你注意看地面的砖，横七竖八，这叫“金砖墁地”。' },
          { name: '讲解员', text: '其实不是金子做的，是苏州御窑烧的细料方砖，敲起来有金石声。' },
        ],
      });
      this.addNPC({
        x: 640, y: 1288, name: '拍照的游客', palette: A.actorPalettes.tourist2,
        dir: 'right', quest: false, wander: true,
        lines: [
          { name: '拍照的游客', text: '帮我拍一张？要能把桥和午门都拍进去。' },
          { name: '拍照的游客', text: '谢谢！你这相机不错，是来拍打铁花的吧？' },
        ],
      });
      this.addNPC({
        x: 900, y: 320, name: '园林工人', palette: A.actorPalettes.worker,
        dir: 'left', quest: false, wander: true,
        lines: [
          { name: '园林工人', text: '御花园的柏树，最老的有六百多年了。' },
          { name: '园林工人', text: '晚上北边广场有打铁花，你可得去瞧瞧。那铁水一泼，半边天都是亮的。' },
        ],
      });
      this.addNPC({
        x: 1240, y: 880, name: '看展的人', palette: A.actorPalettes.auntie,
        dir: 'down', quest: false, wander: true,
        lines: [
          { name: '看展的人', text: '珍宝馆里的金嵌珍珠天球仪，看一眼就值回票价。' },
        ],
      });

      /* ---------------- collectibles ---------------- */
      for (const key of Object.keys(ITEMS)) {
        const it = ITEMS[key];
        const ent = this.addEntity({
          x: it.x, y: it.y, baseY: it.y,
          draw: (c) => {
            if (!G.save.flag('metZhao') || G.save.flag(key)) return;
            const bob = Math.sin(this.time * 3 + it.x) * 2;
            A.glow(c, it.x, it.y - 10, 16, 'rgba(255,190,80,.55)', 0.4);
            if (key === 'iron') {
              A.r(c, it.x - 5, it.y - 10 + bob, 10, 6, '#6d7377');
              A.r(c, it.x - 4, it.y - 12 + bob, 7, 4, '#8d969a');
              A.r(c, it.x - 2, it.y - 11 + bob, 2, 2, '#b9c2c4');
            } else if (key === 'charcoal') {
              for (let i = 0; i < 4; i++) A.r(c, it.x - 5 + i * 3, it.y - 8 - (i % 2) * 3 + bob, 3, 5, i % 2 ? '#3a312b' : '#4a4038');
            } else {
              A.r(c, it.x - 1, it.y - 14 + bob, 2, 12, '#8a5f34');
              A.r(c, it.x - 4, it.y - 16 + bob, 7, 4, '#6b4727');
            }
            G.text(c, '!', it.x, it.y - 22 + bob, { size: 8, color: '#ffd479', align: 'center', weight: 'bold' });
          },
        });
        this.addInteract({
          x: it.x, y: it.y, r: 30, label: '拾取 ' + it.name,
          condition: () => G.save.flag('metZhao') && !G.save.flag(key),
          action: () => this.collectItem(key),
        });
      }

      /* ---------------- night crowd ---------------- */
      const spectators = [
        [596, 318, 'tourist2', 'right'], [632, 336, 'auntie', 'up'],
        [676, 326, 'child', 'right'], [824, 330, 'tourist', 'left'],
        [868, 316, 'tourist2', 'up'], [906, 338, 'worker', 'left'],
        [560, 286, 'tourist', 'right'], [950, 292, 'guide', 'left'],
      ];
      this.crowdEnt = this.addEntity({
        x: 750, y: 300, baseY: 300,
        draw: (c) => {
          if (!this.night) return;
          for (let i = 0; i < spectators.length; i++) {
            const [sx, sy, pal, dir] = spectators[i];
            A.drawActor(c, sx, sy, {
              dir, time: this.time + i, scale: 1.15,
              palette: A.actorPalettes[pal], moving: false,
            });
          }
        },
      });

      G.save.persist();
    }

    addWing(x, y1, y2) {
      this.addEntity({
        x, y: y2, baseY: y2,
        draw: (c) => this.drawWing(c, x, y1, y2),
      });
      this.solid(x - 30, y1, 60, y2 - y1);
    }

    drawBanner(c, x, baseY) {
      A.shadow(c, x, baseY, 16, 2, 0.25);
      A.r(c, x - 5, baseY - 4, 10, 4, P.stoneDark);
      A.r(c, x - 1, baseY - 92, 3, 90, '#4b2d1b');
      A.r(c, x, baseY - 92, 1, 90, '#8a5a34');
      A.r(c, x - 7, baseY - 94, 15, 2, P.goldDark);
      // hanging red banner
      A.r(c, x - 8, baseY - 88, 17, 50, '#6d2419');
      A.r(c, x - 7, baseY - 87, 15, 48, '#923727');
      A.r(c, x - 7, baseY - 87, 15, 2, '#d8b26a');
      A.r(c, x - 7, baseY - 41, 15, 2, '#d8b26a');
      A.r(c, x - 6, baseY - 84, 1, 41, 'rgba(236,197,124,.4)');
      for (let i = 0; i < 3; i++) {
        A.r(c, x - 3, baseY - 76 + i * 11, 6, 1, '#e4c27b');
        A.r(c, x - 1, baseY - 78 + i * 11, 2, 2, '#e4c27b');
      }
    }

    drawWing(c, x, y1, y2) {
      const w = 56;
      // shadow / base
      A.r(c, x - w / 2 - 4, y1, w + 8, y2 - y1, 'rgba(35,22,14,.25)');
      // gold roof seen from above
      A.r(c, x - w / 2, y1, w, y2 - y1, '#7a451f');
      A.r(c, x - w / 2 + 2, y1, w - 4, y2 - y1, '#b5742a');
      for (let yy = y1; yy < y2; yy += 4) {
        A.r(c, x - w / 2 + 2, yy, w - 4, 1, yy % 12 === 0 ? '#d99b42' : '#c98a36');
      }
      for (let xx = x - w / 2 + 6; xx < x + w / 2 - 4; xx += 7) {
        A.r(c, xx, y1, 1, y2 - y1, 'rgba(90,50,20,.35)');
      }
      // ridge and edge caps
      A.r(c, x - 2, y1, 4, y2 - y1, '#6e3d1d');
      A.r(c, x - 1, y1 + 2, 2, y2 - y1 - 4, '#e3b35a');
      A.r(c, x - w / 2, y1, 1, y2 - y1, '#5b3218');
      A.r(c, x + w / 2 - 1, y1, 1, y2 - y1, '#5b3218');
      // red wall and columns glimpsed beneath the long eave
      A.r(c, x - w / 2 - 3, y1 + 2, 3, y2 - y1 - 4, P.wallDark);
      A.r(c, x + w / 2, y1 + 2, 3, y2 - y1 - 4, P.wallDark);
      for (let yy = y1 + 6; yy < y2 - 4; yy += 16) {
        A.r(c, x - w / 2 - 3, yy, 3, 2, P.wall);
        A.r(c, x + w / 2, yy, 3, 2, P.wall);
      }
      // red festival banners along the corridor
      for (let yy = y1 + 26; yy < y2 - 20; yy += 58) {
        A.r(c, x - w / 2 - 5, yy, 2, 10, '#8e3225');
        A.r(c, x - w / 2 - 4, yy + 1, 1, 8, '#b34632');
        A.r(c, x + w / 2 + 3, yy, 2, 10, '#8e3225');
        A.r(c, x + w / 2 + 4, yy + 1, 1, 8, '#b34632');
      }
      // red columns glimpsed at the ends
      A.r(c, x - w / 2 + 3, y2 - 8, w - 6, 8, P.wallDark);
      A.r(c, x - w / 2 + 4, y2 - 7, w - 8, 5, P.wall);
      for (let xx = x - w / 2 + 6; xx < x + w / 2 - 4; xx += 9) A.r(c, xx, y2 - 6, 2, 4, P.redDark);
    }

    sideHall(x, y, w, name, codex, text) {
      this.addBuilding(x, y, (c) => {
        A.drawHall(c, x, y, w, { wallH: 26, roofH: 22, name, platformPad: 28 });
        if (name === '珍宝馆') {
          A.sign(c, x + w / 2 + 24, y + 2, '珍宝馆', { w: 38, h: 13, size: 6 });
        }
      });
      this.solid(x - w / 2 - 8, y - 22, w + 16, 22);
      this.addInteract({
        x, y: y + 18, r: 34, label: name,
        action: () => {
          if (G.unlock) G.unlock(codex);
          G.dialog.show([{ name, text }]);
        },
      });
    }

    pavilion(c, x, baseY, s) {
      s = s || 1;
      A.shadow(c, x, baseY, 42 * s, 3, 0.25);
      A.r(c, x - 28 * s, baseY - 6 * s, 56 * s, 6 * s, P.stoneDark);
      A.r(c, x - 26 * s, baseY - 8 * s, 52 * s, 3 * s, P.marble);
      for (let i = 0; i < 4; i++) {
        A.r(c, x - 20 * s + i * 13 * s, baseY - 26 * s, 3 * s, 18 * s, P.redDark);
        A.r(c, x - 20 * s + i * 13 * s, baseY - 26 * s, 3 * s, 2 * s, P.gold);
      }
      A.r(c, x - 23 * s, baseY - 29 * s, 46 * s, 4 * s, P.red);
      A.r(c, x - 23 * s, baseY - 29 * s, 46 * s, 1, P.gold);
      for (let i = 0; i < 5; i++) {
        const ww = (30 - i * 4) * s;
        A.r(c, x - ww, baseY - 33 * s - i * 2 * s, ww * 2, 2 * s, i % 2 ? '#2f6c6b' : '#3d8580');
      }
      A.r(c, x - 1, baseY - 45 * s, 2, 5 * s, P.gold);
    }

    /* ============================================================
       lifecycle
       ============================================================ */
    onEnter(opts) {
      G.ui.location('故宫博物院', '紫禁城');
      this.night = G.save.flag('night') || G.save.flag('finished');
      this.refreshNight();
      this.clock = this.night ? '19:40' : '16:20';
      this.updateHud();
      this.refreshObjective();
      G.audio.ambient(this.night ? 'night' : 'palace');
      if (!G.save.flag('palaceIntroSeen')) {
        G.save.data.flags.palaceIntroSeen = true;
        G.save.persist();
        setTimeout(() => {
          if (G.scene !== this || this.night) return;
          G.dialog.show([
            { name: '旅行手账', narrator: true, text: '刷证入宫。红墙在两侧合拢，脚下的石板被六百年的脚步磨得发亮。' },
            { name: '旅行手账', narrator: true, text: '太和殿的屋脊上，脊兽排成一列，望着中轴线。' },
            { name: '旅行手账', text: '先去北边的神武门。听说打铁花的匠人老赵在那儿。' },
          ]);
        }, 700);
      }
    }

    updateHud() {
      const d = G.dateInfo(new Date());
      G.ui.clock(this.clock, d.cn + (this.night ? ' · 夜' : ' · 晴'));
    }

    collectedCount() {
      return ['iron', 'charcoal', 'ladle'].filter((k) => G.save.flag(k)).length;
    }

    refreshObjective() {
      const f = G.save.data.flags;
      if (f.finished) this.objective('旅程完成 · 夜游故宫，可再找老赵打一场');
      else if (this.night) this.objective('到神武门广场，看一场打铁花');
      else if (this.collectedCount() >= 3) this.objective('材料齐了 · 回神武门交给老赵');
      else if (f.metZhao) this.objective('替老赵寻找材料 (' + this.collectedCount() + '/3)');
      else this.objective('穿过中轴线，去神武门找打铁花的匠人');
      this.updateMarker();
    }

    /* ============================================================
       quest
       ============================================================ */
    zhaoLines() {
      const f = G.save.data.flags;
      if (f.finished) return [
        { name: '老赵', text: '铁花会冷，今晚不会。你要是还想打，炉子一直热着。' },
        { name: '老赵', text: '记住，手腕要稳，心要静。铁水不骗人。' },
      ];
      if (this.night) return [
        { name: '老赵', text: '站远些。第一勺，敬这六百年的红墙。' },
        { name: '老赵', text: '看好了——铁水要打成雨，落下来才是花。' },
      ];
      if (this.collectedCount() >= 3) return [
        { name: '老赵', text: '生铁、柳炭、柳木勺，齐了。' },
        { name: '老赵', text: '日头还高，铁花要等天黑。你在宫里再转转，我去起炉。' },
        { name: '旅行手账', text: '（天色一点点暗下来，红墙像被余烬烤过。）' },
      ];
      if (f.metZhao) {
        const left = ['iron', 'charcoal', 'ladle'].filter((k) => !f[k]).map((k) => ITEMS[k].name);
        return [
          { name: '老赵', text: '还差 ' + left.join('、') + '。' },
          { name: '老赵', text: '生铁在珍宝馆前，柳炭在御花园，柳木勺在箭亭。' },
        ];
      }
      return [
        { name: '老赵', text: '你是来看打铁花的吧？我姓赵，打了四十年铁。' },
        { name: '老赵', text: '铁水要烧到一千六百度。生铁、柳炭、柳木勺，一样不能少。' },
        { name: '老赵', text: '帮我把三样东西找来：珍宝馆前的生铁、御花园的柳炭、箭亭的柳木勺。' },
        { name: '老赵', text: '铁花这东西，烧到几成、打得多高，都有讲究。不放心就按 T 问守境人。' },
        { name: '旅行手账', text: '好。等材料齐了，就能看一场真正的打铁花。' },
      ];
    }

    onZhaoTalk() {
      const f = G.save.data.flags;
      if (f.finished) {
        if (this.night) this.startMinigame();
        return;
      }
      if (this.night) {
        this.startMinigame();
        return;
      }
      if (!f.metZhao) {
        G.save.flag('metZhao', true);
        this.refreshObjective();
        G.ui.toast('新任务 · 寻找三样材料', 'good', 2800);
      } else if (this.collectedCount() >= 3 && !f.night) {
        this.beginNight();
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
        setTimeout(() => G.ui.toast('材料齐了 · 回神武门找老赵', 'good', 3200), 500);
      }
    }

    beginNight() {
      if (this._nighting) return;
      this._nighting = true;
      G.audio.sfx('gong');
      G.cinema.play([
        { text: '日 落', sub: 'SUNSET OVER THE AXIS', ms: 1800 },
        { text: '入 夜', sub: 'THE IRON FLOWERS ARE COMING', ms: 2100 },
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
        G.ui.toast('入夜了 · 神武门广场亮起了炉火', 'good', 3200);
        setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show([
            { name: '老赵', text: '炉子起好了。铁水正红。' },
            { name: '老赵', text: '过来，我教你打第一勺。' },
          ], () => this.startMinigame());
        }, 900);
      });
    }

    startMinigame() {
      if (!G.minigame) return;
      if (G.minigame.active) return;
      const launch = (diff) => G.minigame.start({
        diff,
        onScore: (score, best) => {
          G.save.data.best = Math.max(G.save.data.best, best);
          G.save.persist();
        },
        onExit: (score, stats) => {
          if (!G.save.flag('finished')) {
            G.save.flag('finished', true);
            G.save.flag('night', true);
            if (G.unlock) G.unlock('tiehua');
            G.save.persist();
            this.refreshObjective();
            this.updateMarker();
            setTimeout(() => {
              if (G.scene !== this) return;
              G.cinema.play([
                { text: '铁 树 银 花', sub: 'A NIGHT TO REMEMBER', ms: 2200 },
                { text: '旅 程 完 成', sub: 'THANKS FOR WALKING THE AXIS', ms: 2200 },
              ], () => {
                G.dialog.show([
                  { name: '老赵', text: '铁花落下来，像一场倒着下的雨。' },
                  { name: '老赵', text: '这手艺传了几百年，靠的就是有人愿意抬头看。' },
                  { name: '旅行手账', text: '今晚的风很轻。红墙、金瓦、铁火，都留在了手账的最后一页。' },
                ]);
              });
            }, 700);
          }
          G.audio.ambient('night');
          this.refreshObjective();
          this.updateMarker();
        },
      });
      // 先确认是否现在挑战，再选难度；选择“否”则继续自由探索
      G.dialog.ask({
        name: '老赵',
        text: G.save.flag('finished')
          ? '炉子还旺着。要不要再来一场打铁花？（可无限次玩）'
          : '炉子烧旺了，铁水正亮。现在来一场打铁花？',
        options: [{ label: '是', value: true }, { label: '否', value: false }],
      }, (ok) => {
        if (ok) {
          if (G.difficulty) G.difficulty.open('tiehua', launch);
          else launch('hard');
        } else {
          G.dialog.show([{ name: '老赵', text: '好，你先随意逛逛。想打的时候，随时来找我。' }]);
        }
      });
    }

    /* ============================================================
       night setup
       ============================================================ */
    refreshNight() {
      this.lights = [];
      if (!this.night) {
        for (const e of this.entities) if (e.lantern) e.night = false;
        return;
      }
      // 广场两侧的松树与陈设，把中轴两边的空地填住
      for (const [tx, ty, sz] of [[300, 1240, .95], [1200, 1240, .95], [300, 1000, .9], [1200, 1000, .9], [300, 820, .9], [1200, 820, .9], [300, 640, .9], [1200, 640, .9], [300, 460, .85], [1200, 460, .85]]) {
        this.addEntity({ x: tx, y: ty, baseY: ty, draw: (c) => A.pine(c, tx, ty, sz) });
      }
      for (const [vx, vy] of [[560, 1300], [940, 1300], [560, 900], [940, 900], [560, 480], [940, 480]]) {
        this.addEntity({ x: vx, y: vy, baseY: vy, draw: (c) => A.vat(c, vx, vy, { water: true }) });
      }
      for (const [sx2, sy2, txt] of [[430, 1318, '太和门广场'], [1070, 1318, '太和殿广场']]) {
        this.addEntity({ x: sx2, y: sy2, baseY: sy2, draw: (c) => A.sign(c, sx2, sy2, txt, { w: 60 }) });
      }
      // 广场上的鸽子与一位看殿的游客
      for (const [px, py, seed] of [[700, 1146, 1], [800, 1162, 2], [764, 1186, 3]]) {
        this.addEntity({ x: px, y: py, baseY: py, draw: (c) => A.pigeon(c, px, py, this.time, seed) });
      }
      this.addNPC({
        x: 620, y: 1160, name: '游客', wander: 0,
        palette: { robe: '#4f7f9f', robeDark: '#345c76', robeLight: '#6fa3c4', trim: '#f0d083', hatType: 'cap', hat: '#e1b34d', bag: '#7a5131' },
        lines: [{ name: '游客', text: '太和殿前这块广场，比照片里大得多。' }],
      });

      const lampSpots = [
        [690, 1180], [810, 1180], [690, 1060], [810, 1060], [690, 940], [810, 940],
        [690, 820], [810, 820], [690, 700], [810, 700], [690, 580], [810, 580],
        [690, 460], [810, 460], [690, 340], [810, 340], [690, 220], [810, 220],
        [560, 1540], [940, 1540], [300, 1300], [1200, 1300],
      ];
      for (const [x, y] of lampSpots) {
        this.addLight(x, y - 12, 21, 'rgba(255,164,72,.6)', 0.55);
      }
      // warm halls and gateways
      this.addLight(750, 1500, 40, 'rgba(255,140,60,.45)', 0.38);
      this.addLight(750, 560, 90, 'rgba(255,150,60,.28)', 0.3);
      this.addLight(750, 406, 70, 'rgba(255,150,60,.24)', 0.28);
      this.addLight(750, 1040, 110, 'rgba(255,150,60,.24)', 0.26);
      this.addLight(750, 235, 80, 'rgba(255,140,50,.4)', 0.38);
      this.addLight(750, 330, 44, 'rgba(255,180,90,.34)', 0.35);
      this.addLight(600, 320, 30, 'rgba(255,180,90,.3)', 0.3);
      this.addLight(900, 320, 30, 'rgba(255,180,90,.3)', 0.3);
    }

    toggleMap(force) {
      this.mapOpen = force == null ? !this.mapOpen : !!force;
      G.audio.sfx('page');
      const hud = G.$('#hud');
      if (hud) hud.classList.toggle('map-open', this.mapOpen);
      if (this.mapOpen) { this.player.moving = false; G.ui.prompt(null); }
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
      if (!f.metZhao || this.collectedCount() >= 3 || this.night) {
        this.marker = { x: 750, y: 206 };
        return;
      }
      let best = null, bd = Infinity;
      for (const key of ['iron', 'charcoal', 'ladle']) {
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
      // warm stone base with large, uneven slabs
      c.fillStyle = '#bcae90';
      c.fillRect(0, 0, this.w, this.h);
      A.paving(c, 166, 106, 1168, 1432, '#bdaf91', '#af9f80', 4, 22);

      // broad color washes across the courtyards
      for (let i = 0; i < 34; i++) {
        const x = 180 + G.hash(i, 11, 61) * 1140;
        const y = 120 + G.hash(i, 12, 62) * 1400;
        const w = 80 + G.hash(i, 13, 63) * 220;
        const h = 45 + G.hash(i, 14, 64) * 150;
        const warm = G.hash(i, 15, 65) > 0.5;
        c.fillStyle = warm ? 'rgba(236,217,181,.05)' : 'rgba(83,71,53,.045)';
        c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, G.TAU); c.fill();
      }

      // central imperial way, with stone borders and a carved median
      A.paving(c, 668, 108, 164, 1420, '#cdbf9f', '#bfb090', 7, 18);
      // 石界：线条放轻，只留下浅浅一道，不抢砖面
      c.fillStyle = 'rgba(116,96,65,.16)';
      c.fillRect(668, 108, 1, 1420);
      c.fillRect(831, 108, 1, 1420);
      c.fillStyle = 'rgba(238,223,190,.12)';
      c.fillRect(670, 108, 1, 1420);
      c.fillRect(829, 108, 1, 1420);
      // carved imperial slab
      c.fillStyle = '#d9caab';
      c.fillRect(736, 108, 28, 1420);
      c.fillStyle = 'rgba(151,126,82,.18)';
      c.fillRect(736, 108, 1, 1420);
      c.fillRect(763, 108, 1, 1420);
      for (let y = 170; y < 1460; y += 82) {
        // leave the hall footprints clear
        if ((y > 330 && y < 460) || (y > 650 && y < 800) || (y > 1150 && y < 1280)) continue;
        c.strokeStyle = 'rgba(139,110,64,.24)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(750, y);
        c.lineTo(754, y + 6);
        c.lineTo(750, y + 12);
        c.lineTo(746, y + 6);
        c.closePath();
        c.stroke();
        c.fillStyle = 'rgba(232,205,146,.25)';
        c.fillRect(749, y + 5, 2, 2);
      }

      // cross paths
      A.paving(c, 166, 1028, 1168, 60, '#c7b998', '#b8a988', 8, 18);
      A.paving(c, 166, 598, 1168, 48, '#c7b998', '#b8a988', 9, 18);
      A.paving(c, 166, 388, 1168, 40, '#c7b998', '#b8a988', 10, 18);
      A.paving(c, 166, 228, 1168, 76, '#b9ab8c', '#aa9a7b', 11, 18);
      for (const [y, h] of [[1028, 60], [598, 48], [388, 40], [228, 76]]) {
        c.fillStyle = 'rgba(112,92,64,.1)';
        c.fillRect(166, y, 1168, 1);
        c.fillRect(166, y + h - 1, 1168, 1);
      }
      // side walkways
      A.paving(c, 516, 180, 68, 1320, '#c2b492', '#b2a383', 12, 18);
      A.paving(c, 916, 180, 68, 1320, '#c2b492', '#b2a383', 13, 18);
      A.paving(c, 166, 816, 1168, 36, '#c2b28f', '#b2a282', 14, 18);
      A.paving(c, 166, 468, 1168, 34, '#c2b28f', '#b2a282', 15, 18);
      A.paving(c, 166, 318, 1168, 30, '#c2b28f', '#b2a282', 16, 18);

      // garden ground and its pale gravel walk
      A.paving(c, 420, 180, 660, 160, '#748354', '#66764a', 17, 18);
      A.paving(c, 510, 206, 480, 116, '#a9a077', '#999069', 31, 18);
      c.strokeStyle = 'rgba(84,75,48,.28)';
      c.strokeRect(514, 210, 472, 108);
      // 神武门 forecourt — the fire show happens here
      A.paving(c, 628, 184, 244, 152, '#c4b594', '#b3a281', 23, 16);
      c.strokeStyle = 'rgba(112,95,68,.4)';
      c.lineWidth = 2;
      c.strokeRect(632, 188, 236, 144);
      c.strokeStyle = 'rgba(242,225,190,.28)';
      c.strokeRect(636, 192, 228, 136);
      for (let i = 0; i < 34; i++) {
        const x = 430 + G.hash(i, 3, 41) * 640;
        const y = 190 + G.hash(i, 7, 42) * 140;
        c.fillStyle = 'rgba(40,50,30,.16)';
        c.beginPath(); c.ellipse(x, y, 12, 4, 0, 0, G.TAU); c.fill();
      }
      // moss and grass along the edges
      for (let i = 0; i < 70; i++) {
        const x = 180 + G.hash(i, 21, 71) * 1130;
        const y = 130 + G.hash(i, 22, 72) * 1360;
        if (G.hash(i, 23, 73) > 0.55) continue;
        c.fillStyle = 'rgba(88,103,64,.28)';
        c.fillRect(x, y, 2 + (G.hash(i, 24, 74) * 4 | 0), 1);
      }

      // river bed / water (animated layer on top)
      c.fillStyle = '#7b7058';
      c.fillRect(380, 1318, 740, 44);
      c.fillStyle = '#254f52';
      c.fillRect(384, 1322, 732, 36);
      c.fillStyle = '#1e4448';
      c.fillRect(384, 1354, 732, 3);
      // stone banks
      c.fillStyle = '#d5c9aa';
      c.fillRect(380, 1314, 740, 4);
      c.fillRect(380, 1360, 740, 4);
      c.fillStyle = 'rgba(120,102,74,.35)';
      c.fillRect(380, 1318, 740, 1);
      c.fillRect(380, 1359, 740, 1);
      // lily pads and a little pink bloom
      for (let i = 0; i < 18; i++) {
        const lx = 400 + G.hash(i, 41, 91) * 690;
        const ly = 1326 + G.hash(i, 42, 92) * 27;
        c.fillStyle = i % 3 === 0 ? 'rgba(77,115,74,.7)' : 'rgba(57,94,67,.6)';
        c.beginPath(); c.ellipse(lx, ly, 4, 2, 0, 0, G.TAU); c.fill();
        if (i % 5 === 0) {
          c.fillStyle = '#d88f8d';
          c.fillRect(lx, ly - 1, 1, 1);
        }
      }
      // flower beds at the garden edge
      for (let i = 0; i < 26; i++) {
        const fx = 430 + G.hash(i, 43, 93) * 630;
        const fy = 332 + G.hash(i, 44, 94) * 8;
        c.fillStyle = G.pick(['#b65a62', '#d8a14c', '#e0d0a4']);
        c.fillRect(fx, fy, 1, 1);
        c.fillStyle = 'rgba(63,83,48,.6)';
        c.fillRect(fx, fy + 1, 1, 1);
      }

      // fine cracks and joints
      for (let i = 0; i < 30; i++) {
        const x = 190 + G.hash(i, 31, 81) * 1100;
        const y = 120 + G.hash(i, 32, 82) * 1400;
        c.strokeStyle = 'rgba(84,70,50,.12)';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 5, y + 2);
        c.lineTo(x + 9, y - 1);
        c.stroke();
      }

      // long shadows of the perimeter walls
      const wg = c.createLinearGradient(166, 0, 200, 0);
      wg.addColorStop(0, 'rgba(50,30,20,.20)');
      wg.addColorStop(1, 'rgba(50,30,20,0)');
      c.fillStyle = wg;
      c.fillRect(166, 100, 34, 1440);
      const wg2 = c.createLinearGradient(1334, 0, 1300, 0);
      wg2.addColorStop(0, 'rgba(50,30,20,.20)');
      wg2.addColorStop(1, 'rgba(50,30,20,0)');
      c.fillStyle = wg2;
      c.fillRect(1300, 100, 34, 1440);
    }

    drawGroundExtras(ctx) {
      // marble bollards and chains along the entrance courtyard
      for (const bx of [676, 824]) {
        ctx.strokeStyle = 'rgba(71,56,38,.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, 1242);
        for (let i = 1; i <= 3; i++) {
          ctx.quadraticCurveTo(bx, 1242 + i * 24 - 9, bx, 1242 + i * 24);
        }
        ctx.stroke();
        for (let i = 0; i <= 3; i++) {
          const py = 1242 + i * 24;
          A.r(ctx, bx - 2, py - 8, 5, 9, '#d2c6ac');
          A.r(ctx, bx - 1, py - 10, 3, 3, '#e6dcc5');
          A.r(ctx, bx - 2, py + 1, 5, 1, '#8e8168');
          A.r(ctx, bx - 1, py - 6, 1, 4, 'rgba(255,247,224,.45)');
        }
      }
      // carved stone medallions on the imperial way
      for (const my of [1098, 906, 702, 510]) {
        ctx.save();
        ctx.translate(750, my);
        ctx.strokeStyle = 'rgba(135,107,65,.32)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -12, 24, 24);
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, G.TAU); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0);
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = 'rgba(195,158,92,.24)';
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }
      // animated river
      if (!this._river) this._river = 0;
      A.water(ctx, 384, 1322, 732, 36, this.time, 3);
      // shimmering highlights
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#d9f1e5';
      for (let i = 0; i < 12; i++) {
        const x = 400 + ((this.time * 12 + i * 62) % 700);
        ctx.fillRect(x, 1330 + (i % 3) * 6, 20, 1);
      }
      ctx.restore();
      // koi drifting under the bridges
      for (let i = 0; i < 5; i++) {
        const fx = 430 + ((this.time * (7 + i * 2) + i * 130) % 640);
        const fy = 1332 + (i % 3) * 7 + Math.sin(this.time * 1.6 + i) * 2;
        ctx.fillStyle = i % 2 ? '#d78a4a' : '#e6dcc5';
        ctx.fillRect(Math.round(fx), Math.round(fy), 4, 2);
        ctx.fillRect(Math.round(fx - 2), Math.round(fy + (i % 2)), 2, 1);
        ctx.fillStyle = 'rgba(255,240,210,.55)';
        ctx.fillRect(Math.round(fx + 3), Math.round(fy), 1, 1);
      }

      // perimeter walls (vertical) under characters
      this.drawSideWall(ctx, 158, 110, 1420, 16);
      this.drawSideWall(ctx, 1330, 110, 1420, 16);
      // wall top
      A.wallH(ctx, 158, 1346, 110, 16);
      // corner towers
      this.cornerTower(ctx, 166, 112);
      this.cornerTower(ctx, 1334, 112);
      this.cornerTower(ctx, 166, 1520);
      this.cornerTower(ctx, 1334, 1520);
    }

    drawSideWall(ctx, x, y, h, w) {
      A.r(ctx, x, y, w, h, P.wallDark);
      A.r(ctx, x + 1, y, w - 2, h, P.wall);
      for (let yy = y + 4; yy < y + h; yy += 14) {
        A.r(ctx, x - 2, yy, w + 4, 3, P.wallLight);
        A.r(ctx, x - 2, yy + 2, w + 4, 1, P.wallDark);
      }
      A.r(ctx, x, y, 1, h, P.goldDark);
      A.r(ctx, x + w - 1, y, 1, h, P.wallDark);
    }

    cornerTower(ctx, x, y) {
      A.drawHall(ctx, x, y, 38, { wallH: 14, roofH: 12, platform: false, name: '' });
    }

    /* ============================================================
       ambient / draw
       ============================================================ */
    updateAmbient(dt) {
      if (this.night) {
        if (Math.random() < dt * 4) {
          G.fx.add({
            x: 650 + G.rand(-70, 70), y: 230 + G.rand(-10, 30),
            vx: G.rand(-8, 8), vy: G.rand(-22, -6),
            life: G.rand(0.7, 1.8), size: 1,
            color: G.pick(['#ffb347', '#ff7a29', '#ffd479']),
            grav: -4, glow: true,
          });
        }
        if (Math.random() < dt * 1.2) {
          G.fx.add({
            x: this.player.x + G.rand(-40, 40), y: this.player.y - G.rand(0, 30),
            vx: G.rand(-3, 3), vy: G.rand(-8, -2),
            life: G.rand(1, 2), size: 1, color: 'rgba(180,190,150,.5)', grav: -2, glow: false,
          });
        }
      } else {
        if (Math.random() < dt * 1.5) {
          const x = 480 + G.rand(0, 540), y = 200 + G.rand(0, 120);
          G.fx.add({
            x, y, vx: G.rand(-8, 8), vy: G.rand(2, 9),
            life: G.rand(1.6, 2.8), size: 1,
            color: G.pick(['#c9a25a', '#a88445', '#e0c286']), grav: 2, glow: false,
          });
        }
        // incense smoke from the bronze burners
        if (Math.random() < dt * 2.2) {
          const bx = G.pick([620, 880]);
          G.fx.add({
            x: bx + G.rand(-2, 2), y: 1142 + G.rand(-2, 2),
            vx: G.rand(-3, 5), vy: G.rand(-16, -8),
            life: G.rand(1.6, 3.2), size: G.rand(1, 2),
            color: 'rgba(205,194,169,.24)', grav: -2, glow: false,
          });
        }
        // drifting petals near the garden
        if (Math.random() < dt * 1.1) {
          G.fx.add({
            x: 700 + G.rand(-220, 220), y: 280 + G.rand(-60, 60),
            vx: G.rand(4, 14), vy: G.rand(3, 8),
            life: G.rand(2, 3.6), size: 1,
            color: G.pick(['#d9a8a2', '#e8c6ad', '#c77f79']), grav: -1, glow: false,
          });
        }
      }
    }

    drawGugongMap(ctx) {
      const mx = 190, my = 40, mw = 260, mh = 286;
      const X = (wx) => mx + (wx / this.w) * mw;
      const Y = (wy) => my + (wy / this.h) * mh;
      ctx.save();
      ctx.fillStyle = 'rgba(10,8,6,.84)';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#e9d9b8';
      ctx.fillRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.save();
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 160; i++) {
        const px = mx - 10 + G.hash(i, 1, 301) * (mw + 20);
        const py = my - 18 + G.hash(i, 2, 302) * (mh + 36);
        ctx.fillStyle = G.hash(i, 3, 303) > 0.5 ? '#a68b5f' : '#fff5dd';
        ctx.fillRect(px, py, 1, 1);
      }
      ctx.restore();
      ctx.strokeStyle = '#5f4529'; ctx.lineWidth = 2;
      ctx.strokeRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.strokeStyle = '#b08a55'; ctx.lineWidth = 1;
      ctx.strokeRect(mx - 9.5, my - 17.5, mw + 19, mh + 35);
      G.text(ctx, '故宫导览图', mx - 2, my - 7, { size: 11, color: '#3d2d1c', weight: 'bold' });
      G.text(ctx, 'M 关闭', mx + mw - 32, my - 7, { size: 7, color: '#7d684c' });
      ctx.save();
      ctx.globalAlpha = 0.05;
      G.text(ctx, '宫', mx + mw / 2, my + mh / 2 + 44, { size: 132, color: '#6b2e22', align: 'center', font: '"KaiTi","STKaiti",serif' });
      ctx.restore();
      // grounds
      ctx.fillStyle = 'rgba(138,111,73,.13)';
      ctx.fillRect(X(170), Y(110), X(1330) - X(170), Y(1530) - Y(110));
      ctx.fillStyle = 'rgba(105,130,82,.3)';
      ctx.fillRect(X(420), Y(180), X(1080) - X(420), Y(340) - Y(180));
      // river
      ctx.fillStyle = '#7fa9a3';
      ctx.fillRect(X(380), Y(1318), X(1120) - X(380), Y(1362) - Y(1318));
      for (const bx of [590, 670, 750, 830, 910]) {
        ctx.fillStyle = '#f1e3c6';
        ctx.fillRect(X(bx - 13), Y(1318), 3, Y(1362) - Y(1318));
      }
      // walls
      ctx.fillStyle = '#9a3a2b';
      ctx.fillRect(X(158), Y(110), 3, Y(1530) - Y(110));
      ctx.fillRect(X(1330), Y(110), 3, Y(1530) - Y(110));
      ctx.fillRect(X(158), Y(110), X(1330) - X(158), 3);
      ctx.fillRect(X(158), Y(1520), X(1330) - X(158), 3);
      // side wings
      ctx.fillStyle = '#c98a4a';
      ctx.fillRect(X(502), Y(790), 5, Y(1180) - Y(790));
      ctx.fillRect(X(1000), Y(790), 5, Y(1180) - Y(790));
      // halls
      const halls = [
        [750, 1512, 300, 60], [750, 1238, 232, 42],
        [750, 1040, 300, 40], [750, 872, 116, 26],
        [750, 772, 196, 32], [750, 664, 210, 38],
        [750, 574, 236, 34], [750, 406, 190, 30],
        [750, 152, 282, 52],
      ];
      for (const [hx, hy, hw] of halls) {
        ctx.fillStyle = '#c58a3a';
        ctx.fillRect(X(hx - hw / 2), Y(hy) - 4, X(hx + hw / 2) - X(hx - hw / 2), 4);
        ctx.fillStyle = '#9a3a2b';
        ctx.fillRect(X(hx - hw / 2), Y(hy), X(hx + hw / 2) - X(hx - hw / 2), 3);
      }
      // garden pavilion and side halls
      ctx.fillStyle = '#5f8f86';
      ctx.fillRect(X(736), Y(290), 8, 6);
      for (const [sx, sy] of [[304, 820], [1196, 812], [304, 590], [1138, 560], [304, 380], [1100, 986]]) {
        ctx.fillStyle = '#c58a3a';
        ctx.fillRect(X(sx) - 6, Y(sy) - 3, 12, 3);
      }
      // labels
      const labels = [
        [750, 1460, '午门'], [750, 1190, '太和门'], [750, 990, '太和殿'],
        [750, 620, '乾清宫'], [750, 350, '御花园'], [750, 200, '神武门'],
        [580, 1240, '金水桥'], [1180, 860, '珍宝馆'], [1100, 1040, '箭亭'],
        [400, 900, '武英殿'], [1180, 700, '东六宫'],
      ];
      for (const [lx, ly, name] of labels) {
        G.text(ctx, name, X(lx), Y(ly), {
          size: 7, color: '#4a3826', align: 'center', outline: 'rgba(247,235,208,.9)', outlineWidth: 3,
        });
      }
      // player
      const px = X(this.player.x), py = Y(this.player.y);
      const pulse = 4 + Math.sin(this.time * 4) * 2;
      ctx.strokeStyle = 'rgba(163,74,54,.45)';
      ctx.beginPath(); ctx.arc(px, py, pulse + 3, 0, G.TAU); ctx.stroke();
      ctx.fillStyle = '#a34a36';
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, G.TAU); ctx.fill();
      // objective
      if (this.marker) {
        const ox = X(this.marker.x), oy = Y(this.marker.y);
        ctx.fillStyle = '#b3402c';
        ctx.beginPath(); ctx.moveTo(ox, oy - 6); ctx.lineTo(ox + 3, oy - 3); ctx.lineTo(ox, oy); ctx.lineTo(ox - 3, oy - 3); ctx.closePath(); ctx.fill();
      }
      G.text(ctx, '● 当前位置', mx - 2, my + mh + 14, { size: 6, color: '#a34a36' });
      G.text(ctx, '◆ 目的地', mx + 58, my + mh + 14, { size: 6, color: '#b3402c' });
      G.text(ctx, '北 ↑', mx + mw - 26, my + mh + 14, { size: 6, color: '#7d684c' });
      ctx.fillStyle = 'rgba(163,60,43,.78)';
      ctx.fillRect(mx + mw - 24, my + mh - 24, 17, 17);
      ctx.strokeStyle = 'rgba(245,226,190,.7)'; ctx.lineWidth = 1;
      ctx.strokeRect(mx + mw - 23.5, my + mh - 23.5, 16, 16);
      G.text(ctx, '图', mx + mw - 15, my + mh - 11, { size: 8, color: '#f6e6c8', align: 'center' });
      ctx.strokeStyle = '#8a6a3d'; ctx.lineWidth = 1;
      for (const [cx2, cy2, dx, dy] of [[mx - 14, my - 22, 1, 1], [mx + mw + 14, my - 22, -1, 1], [mx - 14, my + mh + 22, 1, -1], [mx + mw + 14, my + mh + 22, -1, -1]]) {
        ctx.beginPath();
        ctx.moveTo(cx2 + dx * 8, cy2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 + dy * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawScreen(ctx) {
      if (this.mapOpen) { this.drawGugongMap(ctx); return; }
      // foreground shade helps the lower gate roof read as an eave overhead
      const fg = ctx.createLinearGradient(0, 292, 0, 360);
      fg.addColorStop(0, 'rgba(20,13,9,0)');
      fg.addColorStop(1, 'rgba(20,13,9,.34)');
      ctx.fillStyle = fg;
      ctx.fillRect(0, 292, 640, 68);
      if (!this.night) return;
      // the traveller carries a little light through the dark courtyard
      const sx = this.player.x - this.cam.x;
      const sy = this.player.y - this.cam.y;
      A.glow(ctx, sx, sy - 8, 36, 'rgba(255,196,124,.4)', 0.55);
      A.glow(ctx, sx, sy + 1, 18, 'rgba(255,220,160,.3)', 0.6);
      // moon glow at top corners
      A.glow(ctx, 580, 50, 60, 'rgba(150,180,255,.10)', 0.5);
    }
  }

  G.GugongScene = GugongScene;
  G.GUGONG_ITEMS = ITEMS;
})();
