/* ============================================================
   紫禁城 · 铁火 — Beijing axis map
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  class BeijingScene extends G.WorldScene {
    constructor() {
      super({
        id: 'beijing', w: 2200, h: 1500, spawn: { x: 1100, y: 1200 },
        clock: '15:40', ambient: 'city', lookAhead: 40,
      });
      this.title = '北京 · 中轴线';
      this.marker = { x: 1100, y: 795 };
      this.mapOpen = false;
      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    onEnter(opts) {
      G.ui.location('北京', '中轴线');
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
            { name: '旅行手账', narrator: true, text: '北京。中轴线从南到北，穿过天安门，穿过故宫，最后落在钟鼓楼。' },
            { name: '旅行手账', narrator: true, text: '你带着一本没写完的手账。今天只有一件事——进宫。' },
            { name: '旅行手账', narrator: true, text: '听说入夜后的神武门广场，有一场打铁花。' },
            { name: '旅行手账', text: '沿着中轴线一直往北。午门是入口，记得带上身份证。' },
          ]);
        }, 600);
      }
    }

    refreshObjective() {
      const f = G.save.data.flags;
      if (f.entered && f.night) this.objective('夜游故宫 · 神武门广场');
      else if (f.entered) this.objective('已入宫 · 去找打铁花的匠人');
      else this.objective('沿着中轴线向北，到午门入园');
      this.marker = { x: 1100, y: 795 };
    }

    /* ============================================================
       build world
       ============================================================ */
    build() {
      const self = this;

      /* -------- palace model -------- */
      this.addEntity({
        x: 1100, y: 820, baseY: 820,
        draw: (c) => {
          A.miniPalace(c, 1100, 820, 400, 470);
        },
      });
      this.solid(880, 330, 440, 480);
      // big 午门 in front of the model
      this.addBuilding(1100, 830, (c) => {
        A.drawGate(c, 1100, 830, 244, {
          wallH: 56, roofH: 26, double: true, arches: 3, name: '午门',
        });
        A.wallH(c, 880, 978, 830, 26);
        A.wallH(c, 1222, 1320, 830, 26);
      });
      this.solidRect(1100, 830, 250, 22);
      this.interactables.push({
        x: 1100, y: 856, r: 52, label: '在午门安检入园',
        action: () => this.gate(),
      });
      this.addInteract({
        x: 1240, y: 846, r: 30, label: '查看故宫导览牌',
        action: () => {
          G.art && G.unlock && G.unlock('gugong');
          G.dialog.show([
            { name: '导览牌', text: '故宫博物院，旧称紫禁城。明永乐十八年建成，是世界上现存规模最大、保存最完整的木结构宫殿建筑群。' },
            { name: '导览牌', text: '参观请从午门入院，配合证件核验与行李安检。周一闭馆，法定节假日除外。' },
          ]);
        },
      });

      /* -------- 天安门 -------- */
      this.addBuilding(1100, 960, (c) => {
        A.drawGate(c, 1100, 960, 210, {
          wallH: 44, roofH: 25, double: true, arches: 5, name: '天安门', portrait: true,
        });
        // 华表
        for (const side of [-1, 1]) {
          const x = 1100 + side * 118;
          A.shadow(c, x, 966, 10, 2, 0.25);
          A.r(c, x - 5, 962, 10, 4, P.stoneDark);
          A.r(c, x - 2, 924, 4, 38, P.marble);
          A.r(c, x - 5, 936, 10, 3, P.marble);
          A.r(c, x - 6, 932, 12, 2, P.marbleDark);
          A.r(c, x - 4, 919, 8, 5, P.marble);
          A.r(c, x - 3, 916, 6, 3, P.marbleDark);
          A.r(c, x - 7, 968, 14, 2, P.stone);
        }
        // 石狮
        A.lion(c, 1018, 972, false);
        A.lion(c, 1182, 972, true);
      });
      // colliders with a passage through the central arch
      this.solid(995, 942, 85, 24);
      this.solid(1120, 942, 85, 24);
      this.addInteract({
        x: 1100, y: 978, r: 34, label: '瞻仰天安门',
        action: () => {
          if (G.unlock) G.unlock('tiananmen');
          G.dialog.show([
            { name: '天安门', text: '这里是明清两代皇城的正门，原名承天门。城楼重檐歇山顶，五阙券门。' },
            { name: '旅行手账', text: '穿过门洞，前面就是午门。从那儿进宫。' },
          ]);
        },
      });
      // red palace walls frame the approach between 天安门 and 午门
      for (const wx of [905, 1295]) {
        this.addEntity({
          x: wx, y: 958, baseY: 958,
          draw: (c) => A.wallV(c, wx, 846, 958, 14),
        });
        this.solid(wx - 3, 846, 20, 112);
        this.addEntity({ x: wx - 36, y: 922, baseY: 922, draw: (c) => A.tree(c, wx - 36, 922, 0.8, { autumn: true }) });
        this.addEntity({ x: wx + 36, y: 922, baseY: 922, draw: (c) => A.tree(c, wx + 36, 922, 0.8, { autumn: true }) });
        this.addEntity({ x: wx - 20, y: 910, baseY: 910, draw: (c) => A.lantern(c, wx - 20, 910, { h: 30 }) });
      }
      this.addInteract({
        x: 1000, y: 905, r: 36, label: '午门广场',
        action: () => G.dialog.show([
          { name: '午门广场', text: '两边的红墙一直向北延伸。古人进宫，从这里开始就要下马步行了。' },
          { name: '旅行手账', text: '前面的午门，就是入宫安检的地方。' },
        ]),
      });

      /* -------- 正阳门 -------- */
      this.addBuilding(1100, 1160, (c) => {
        A.drawGate(c, 1100, 1160, 156, {
          wallH: 38, roofH: 21, double: true, arches: 1, name: '正阳门',
        });
        A.lion(c, 1010, 1168, false);
        A.lion(c, 1190, 1168, true);
      });
      this.solid(1018, 1142, 62, 22);
      this.solid(1120, 1142, 62, 22);
      this.addInteract({
        x: 1100, y: 1180, r: 30, label: '看看正阳门',
        action: () => {
          if (G.unlock) G.unlock('zhengyangmen');
          G.dialog.show([
            { name: '正阳门', text: '前门，北京内城的正南门。城楼与箭楼之间曾有一座瓮城，是老北京最热闹的门户。' },
            { name: '旅行手账', text: '过了前门，就算真正走进北京的中轴线了。' },
          ]);
        },
      });

      /* -------- hutong west -------- */
      const hutongs = [];
      for (let gy = 0; gy < 3; gy++) {
        for (let gx = 0; gx < 5; gx++) {
          const x = 330 + gx * 104 + (gy % 2) * 16;
          const y = 1080 + gy * 86;
          hutongs.push([x, y, 72 + (gx % 2) * 12]);
        }
      }
      hutongs.forEach(([x, y, w], i) => {
        this.addBuilding(x, y, (c) => A.hutong(c, x, y, w, { h: 19, tree: i % 4 === 0 }));
        this.solid(x - w / 2, y - 14, w, 14);
        if (i % 3 === 0) {
          this.addEntity({
            x: x + 30, y: y - 16, baseY: y - 16,
            draw: (c) => A.tree(c, x + 30, y - 14, 0.82),
          });
          this.solid(x + 27, y - 19, 6, 4);
        }
      });
      this.addInteract({
        x: 500, y: 1310, r: 40, label: '走进胡同',
        action: () => {
          if (G.unlock) G.unlock('hutong');
          G.dialog.show([
            { name: '胡同', narrator: true, text: '灰瓦、砖墙、门墩儿。有人在门口择菜，自行车铃从巷子深处响过来。' },
            { name: '旅行手账', text: '北京不只有中轴线，还有这些拐来拐去的小巷。' },
          ]);
        },
      });

      /* -------- 大栅栏 shops -------- */
      const shops = [
        { x: 900, y: 1230, name: '瑞蚨祥', color: '#7d2f25' },
        { x: 980, y: 1230, name: '内联升', color: '#3e4f5a' },
        { x: 900, y: 1320, name: '张一元', color: '#4d5f3a' },
        { x: 980, y: 1320, name: '同仁堂', color: '#6b3a2a' },
      ];
      shops.forEach((s) => {
        this.addBuilding(s.x, s.y, (c) => this.shop(c, s.x, s.y, s.name, s.color, 66, 30));
        this.solid(s.x - 33, s.y - 15, 66, 15);
        this.addInteract({
          x: s.x, y: s.y + 8, r: 24, label: '逛逛' + s.name,
          action: () => G.dialog.show([
            { name: s.name, text: '老字号的门脸不大，柜台后头却藏着几百年的手艺。' },
            { name: '旅行手账', text: '先不买东西了，进宫要紧。' },
          ]),
        });
      });

      /* -------- street furniture around 前门 -------- */
      this.addEntity({
        x: 1100, y: 1332, baseY: 1100,
        draw: (c) => this.paifang(c, 1100, 1332),
      });
      this.solid(1040, 1318, 16, 18);
      this.solid(1144, 1318, 16, 18);
      this.addInteract({
        x: 1100, y: 1346, r: 40, label: '前门大街牌楼',
        action: () => G.dialog.show([
          { name: '前门大街', text: '牌楼底下是最热闹的一段。叮叮当当的有轨电车，从清末一直开到今天。' },
          { name: '旅行手账', text: '过了牌楼往北，就是正阳门。' },
        ]),
      });
      // east-side shops
      const eastShops = [
        { x: 1240, y: 1110, name: '谦祥益', color: '#5b3a2a' },
        { x: 1320, y: 1110, name: '都一处', color: '#6c3a2a' },
        { x: 1240, y: 1320, name: '老布鞋', color: '#42505a' },
        { x: 1320, y: 1320, name: '茶汤李', color: '#5a4a32' },
      ];
      eastShops.forEach((s) => {
        this.addBuilding(s.x, s.y, (c) => this.shop(c, s.x, s.y, s.name, s.color, 66, 32));
        this.solid(s.x - 33, s.y - 16, 66, 16);
      });
      // rickshaw / bicycles / bins
      this.addEntity({ x: 1010, y: 1120, baseY: 1120, draw: (c) => this.bike(c, 1010, 1120) });
      this.addEntity({ x: 1188, y: 1300, baseY: 1300, draw: (c) => this.bike(c, 1188, 1300) });
      this.addEntity({ x: 1030, y: 1074, baseY: 1074, draw: (c) => this.bin(c, 1030, 1074) });
      this.addEntity({ x: 1172, y: 1110, baseY: 1110, draw: (c) => this.bin(c, 1172, 1110) });
      for (const by of [1060, 1130, 1200, 1270]) {
        this.addEntity({ x: 1036, y: by, baseY: by, draw: (c) => this.bollard(c, 1036, by) });
        this.addEntity({ x: 1164, y: by, baseY: by, draw: (c) => this.bollard(c, 1164, by) });
      }
      // strings of red lanterns across the street
      this.addEntity({
        x: 1100, y: 1168, baseY: 1168,
        draw: (c) => this.lanternString(c, 1032, 1168, 1168, 3),
      });
      this.addEntity({
        x: 1100, y: 1080, baseY: 1080,
        draw: (c) => this.lanternString(c, 1032, 1168, 1080, 4),
      });
      this.addEntity({
        x: 1100, y: 1290, baseY: 1290,
        draw: (c) => this.lanternString(c, 1032, 1168, 1290, 4),
      });
      // planters, a rickshaw and a street cat
      for (const [px, py] of [[884, 1218], [996, 1218], [1224, 1098], [1336, 1098], [884, 1310], [996, 1310], [1224, 1310], [1336, 1310]]) {
        this.addEntity({ x: px, y: py, baseY: py, draw: (c) => this.planter(c, px, py) });
      }
      this.addEntity({ x: 1010, y: 1226, baseY: 1226, draw: (c) => this.rickshaw(c, 1010, 1226) });
      this.addEntity({ x: 1210, y: 1236, baseY: 1236, draw: (c) => A.cat(c, 1210, 1236, this.time, { color: '#b87845' }) });
      this.addInteract({
        x: 1210, y: 1242, r: 26, label: '街猫在晒太阳',
        action: () => G.dialog.show([
          { name: '街猫', text: '（它翻了个身，把肚皮摊在午后的阳光里。）' },
          { name: '旅行手账', text: '北京的时间，有时候是按一只猫的午睡来算的。' },
        ]),
      });
      // a big ginkgo turning gold by the west shops
      this.addEntity({ x: 932, y: 1082, baseY: 1082, draw: (c) => A.tree(c, 932, 1082, 1.35, { autumn: true }) });
      this.addEntity({ x: 1186, y: 1222, baseY: 1222, draw: (c) => A.tree(c, 1186, 1222, 1.15, { autumn: true }) });
      // decorative visitors
      const strollers = [
        [1176, 1130, 'tourist', 'left'], [1050, 1180, 'child', 'right'],
        [1268, 1210, 'tourist2', 'left'], [980, 1140, 'auntie', 'right'],
        [1210, 1360, 'tourist', 'up'], [1000, 1340, 'worker', 'down'],
      ];
      for (const [sx, sy, pal, dir] of strollers) {
        this.addEntity({
          x: sx, y: sy, baseY: sy,
          draw: (c) => A.drawActor(c, sx, sy, {
            dir, time: this.time + sx * 0.01, scale: 1.15,
            palette: A.actorPalettes[pal], moving: false,
          }),
        });
      }

      /* -------- 王府井 -------- */
      const wf = [
        { x: 1410, y: 1070, name: '百货大楼', color: '#6a3d2c' },
        { x: 1500, y: 1070, name: '书店', color: '#3c4f5c' },
        { x: 1590, y: 1070, name: '茶庄', color: '#56613c' },
        { x: 1410, y: 1170, name: '钟表行', color: '#4d3e56' },
        { x: 1500, y: 1170, name: '照相馆', color: '#77523a' },
        { x: 1590, y: 1170, name: '小吃店', color: '#8a3c2c' },
      ];
      wf.forEach((s) => {
        this.addBuilding(s.x, s.y, (c) => this.shop(c, s.x, s.y, s.name, s.color, 76, 34, true));
        this.solid(s.x - 38, s.y - 16, 76, 16);
      });
      this.addInteract({
        x: 1500, y: 1210, r: 38, label: '王府井步行街',
        action: () => {
          if (G.unlock) G.unlock('wangfujing');
          G.dialog.show([
            { name: '王府井', text: '北京最热闹的商业街之一。再往北走，就是故宫的东华门。' },
            { name: '旅行手账', text: '人真多。还是先去午门排队入园吧。' },
          ]);
        },
      });

      /* -------- CBD -------- */
      this.addBuilding(1790, 980, (c) => A.cctv(c, 1790, 980, 1.25, false));
      this.solid(1750, 968, 80, 12);
      this.addBuilding(1930, 1030, (c) => A.citicTower(c, 1930, 1030, 132, false));
      this.solid(1916, 1018, 28, 12);
      const towers = [
        [1640, 850, 44, 92, '#3d4a53'], [1705, 810, 52, 122, '#33414c'],
        [1840, 780, 40, 86, '#46515a'], [1990, 860, 48, 102, '#394650'],
        [1610, 1010, 38, 76, '#4b555d'], [1860, 1080, 54, 70, '#3f4a52'],
      ];
      towers.forEach(([x, y, w, h, col]) => {
        this.addBuilding(x, y, (c) => A.modernTower(c, x, y, w, h, { color: col, antenna: h > 110 }));
        this.solid(x - w / 2, y - 12, w, 12);
      });
      this.addInteract({
        x: 1780, y: 1110, r: 42, label: '仰望国贸',
        action: () => {
          if (G.unlock) G.unlock('cbd');
          G.dialog.show([
            { name: '国贸', text: '玻璃幕墙把云映成一条河。老北京的天际线在这里突然拔高。' },
            { name: '旅行手账', text: '从胡同到 CBD，只要坐几站地铁。' },
          ]);
        },
      });

      /* -------- 北海 -------- */
      this.addBuilding(520, 470, (c) => A.whitePagoda(c, 520, 470, 1.15));
      this.solid(470, 458, 100, 12);
      for (const [dx, dy] of [[470, 560], [565, 625], [625, 520]]) {
        this.addEntity({
          x: dx, y: dy, baseY: dy,
          draw: (c) => this.duck(c, dx + Math.sin(this.time * 0.3 + dx) * 12, dy + Math.cos(this.time * 0.23 + dy) * 6),
        });
      }
      this.addInteract({
        x: 700, y: 610, r: 40, label: '北海白塔',
        action: () => {
          if (G.unlock) G.unlock('beihai');
          G.dialog.show([
            { name: '北海白塔', text: '顺治八年，白塔在琼华岛上升起。塔身如雪，倒映在太液池里。' },
            { name: '旅行手账', text: '下次要租一条船，在湖上漂一个下午。' },
          ]);
        },
      });
      this.addBuilding(180, 760, (c) => {
        A.tree(c, 180, 760, 1.2);
      });

      /* -------- 景山 -------- */
      this.addEntity({
        x: 1100, y: 330, baseY: 330,
        draw: (c) => this.jingshan(c, 1100, 330),
      });
      this.solid(1010, 300, 180, 24);
      this.addInteract({
        x: 1220, y: 320, r: 36, label: '景山万春亭',
        action: () => {
          if (G.unlock) G.unlock('jingshan');
          G.dialog.show([
            { name: '景山', text: '景山是中轴线的制高点。站在万春亭上，能看见整座紫禁城的屋脊。' },
            { name: '旅行手账', text: '可惜今天要先进宫。等看完打铁花，再上来看看夜景。' },
          ]);
        },
      });

      /* -------- 钟鼓楼 -------- */
      this.addBuilding(1100, 210, (c) => A.drawHall(c, 1100, 210, 92, {
        wallH: 24, roofH: 16, double: true, name: '鼓楼', plaster: true,
      }));
      this.solid(1044, 192, 112, 16);
      this.addInteract({
        x: 1220, y: 220, r: 34, label: '钟鼓楼',
        action: () => G.dialog.show([
          { name: '钟鼓楼', text: '晨钟暮鼓，老北京的作息曾由这里的鼓声划定。' },
          { name: '旅行手账', text: '中轴线的最北端。再往北，就是另一段故事了。' },
        ]),
      });

      /* -------- 天坛 -------- */
      this.addBuilding(1580, 1300, (c) => A.templeOfHeaven(c, 1580, 1300, 1.35));
      this.solid(1510, 1288, 140, 14);
      this.addInteract({
        x: 1440, y: 1320, r: 40, label: '天坛祈年殿',
        action: () => {
          if (G.unlock) G.unlock('tiantan');
          G.dialog.show([
            { name: '天坛', text: '祈年殿三重蓝琉璃瓦，不用大梁长檩，全靠榫卯与斗拱托起。' },
            { name: '旅行手账', text: '古人把天圆地方，认认真真盖成了房子。' },
          ]);
        },
      });

      /* -------- 鸟巢 / 水立方 -------- */
      this.addBuilding(1660, 400, (c) => A.birdNest(c, 1660, 400));
      this.solid(1620, 388, 80, 12);
      this.addBuilding(1820, 390, (c) => {
        A.r(c, 1788, 342, 64, 46, '#3e6e91');
        A.r(c, 1790, 344, 60, 42, '#5b9fc9');
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) A.r(c, 1796 + i * 9, 352 + j * 9, 5, 5, '#8fc6e2');
        A.r(c, 1788, 338, 64, 5, '#7c9db5');
      });
      this.solid(1788, 378, 64, 10);
      this.addInteract({
        x: 1750, y: 430, r: 40, label: '奥林匹克公园',
        action: () => {
          if (G.unlock) G.unlock('birdnest');
          G.dialog.show([
            { name: '鸟巢', text: '二〇〇八年夏天，这里装下过整个世界的欢呼。' },
            { name: '旅行手账', text: '钢铁也能编成鸟巢。北京比想象中更爱做梦。' },
          ]);
        },
      });

      /* -------- 中关村 -------- */
      const zgc = [[360, 320, 46, 66], [430, 300, 38, 86], [530, 330, 58, 54], [620, 290, 40, 96]];
      zgc.forEach(([x, y, w, h]) => {
        this.addBuilding(x, y, (c) => A.modernTower(c, x, y, w, h, { color: '#3e4c55' }));
        this.solid(x - w / 2, y - 10, w, 10);
      });
      this.addInteract({
        x: 480, y: 380, r: 40, label: '中关村',
        action: () => G.dialog.show([
          { name: '中关村', text: '电脑、代码、创业咖啡。北京的另一种速度。' },
          { name: '旅行手账', text: '今天不想写代码，只想看铁花。' },
        ]),
      });

      /* -------- street props -------- */
      for (let y = 1050; y <= 1300; y += 66) {
        for (const x of [1022, 1178]) {
          this.addEntity({
            x, y, baseY: y,
            draw: (c) => A.tree(c, x, y, 0.72, { autumn: (y / 66) % 3 === 0 }),
          });
          this.solid(x - 3, y - 4, 6, 4);
        }
      }
      for (const [x, y] of [[950, 1100], [1250, 1100], [930, 1300], [1270, 1300]]) {
        this.addEntity({ x, y, baseY: y, draw: (c) => A.lantern(c, x, y, { h: 30 }) });
      }
      this.addEntity({
        x: 940, y: 1260, baseY: 1260,
        draw: (c) => A.foodCart(c, 940, 1260),
      });
      this.solid(928, 1252, 24, 8);
      this.addInteract({
        x: 940, y: 1274, r: 30, label: '买一串糖葫芦',
        action: () => {
          G.audio.sfx('pickup');
          G.ui.toast('糖葫芦 +1 · 酸甜的北京味儿', 'good');
          G.dialog.show([
            { name: '摊主', text: '山楂裹糖，冰糖要熬到能拉丝。来一串？' },
            { name: '旅行手账', text: '（咬了一口）好酸。但停不下来。' },
          ]);
        },
      });
      this.addEntity({
        x: 1015, y: 1185, baseY: 1185,
        draw: (c) => A.subwaySign(c, 1015, 1185),
      });
      this.addInteract({
        x: 1015, y: 1195, r: 32, label: '乘地铁 8 号线',
        action: () => this.subway(),
      });

      /* -------- cars -------- */
      const carColors = ['#b44430', '#3f5f7a', '#c7a24a', '#5b6b58', '#8a8a86'];
      for (let i = 0; i < 7; i++) {
        const lane = i % 2 === 0 ? 986 : 1005;
        const speed = i % 2 === 0 ? 26 + i * 3 : -22 - i * 2;
        const off = i * 330;
        this.addEntity({
          x: 300, y: lane, baseY: lane,
          draw: (c) => {
            const xx = ((this.time * speed + off) % 2380 + 2380) % 2380 - 90;
            A.car(c, xx, lane, carColors[i], speed < 0 ? 'left' : 'right');
          },
        });
      }

      /* -------- pigeons -------- */
      for (let i = 0; i < 12; i++) {
        const px = 1030 + (i % 6) * 26, py = 1046 + Math.floor(i / 6) * 22;
        this.addEntity({
          x: px, y: py, baseY: py,
          draw: (c) => A.pigeon(c, px + Math.sin(this.time * 0.7 + i) * 6, py, this.time, i),
        });
      }

      /* -------- NPCs -------- */
      this.addNPC({
        x: 1030, y: 1252, name: '王大爷', palette: A.actorPalettes.vendor,
        accessory: 'broom', dir: 'right', quest: true,
        getLines: () => {
          if (G.save.flag('entered')) return [
            { name: '王大爷', text: '进宫啦？好家伙，神武门那头今晚有打铁花，别错过。' },
            { name: '王大爷', text: '老赵的手艺，几十年了。你替我问声好。' },
          ];
          return [
            { name: '王大爷', text: '去故宫啊？顺着中轴线往北，过了天安门就是午门。' },
            { name: '王大爷', text: '进门前要过安检，身份证带着，大包小包都得查。' },
            { name: '王大爷', text: '听说神武门那边晚上有打铁花，你赶巧了。' },
          ];
        },
      });
      this.addNPC({
        x: 1128, y: 1080, name: '小满', palette: A.actorPalettes.tourist,
        dir: 'down', wander: true, quest: false,
        lines: [
          { name: '小满', text: '太和殿的屋脊上有十只脊兽，是宫里独一份。你进去记得抬头看。' },
          { name: '小满', text: '还有御花园的宫猫，运气好能碰上。' },
        ],
      });
      this.addNPC({
        x: 1210, y: 1040, name: '摄影师', palette: A.actorPalettes.tourist2,
        dir: 'left', quest: false,
        lines: [
          { name: '摄影师', text: '这个角度，能把天安门和午门叠在一起。中轴线最妙的地方。' },
          { name: '摄影师', text: '等黄昏吧。太阳从西边照过来，红墙会烧起来。' },
        ],
      });
      this.addNPC({
        x: 1080, y: 900, name: '执勤人员', palette: A.actorPalettes.guard,
        dir: 'down', accessory: 'spear', quest: false,
        lines: [
          { name: '执勤人员', text: '前方故宫。参观请从午门安检入园，提前准备好身份证。' },
          { name: '执勤人员', text: '大包小包都要过安检，打火机不能带进去。' },
        ],
      });
      this.addNPC({
        x: 1440, y: 1260, name: '天坛大爷', palette: A.actorPalettes.auntie,
        dir: 'right', wander: true, quest: false,
        lines: [
          { name: '天坛大爷', text: '祈年殿的蓝瓦，晴天看最漂亮。你赶上了好天气。' },
          { name: '天坛大爷', text: '不过要去故宫，得抓紧。日头落得快。' },
        ],
      });
      this.addNPC({
        x: 700, y: 740, name: '划船的人', palette: A.actorPalettes.worker,
        dir: 'down', quest: false,
        lines: [
          { name: '划船的人', text: '北海的船，划到湖心就能看见白塔的倒影。' },
          { name: '划船的人', text: '故宫？从这儿往东走，到中轴线再往北。' },
        ],
      });
    }

    /* ============================================================
       custom drawings
       ============================================================ */
    shop(c, x, baseY, name, color, w, h, modern) {
      const wallTop = baseY - h;
      A.shadow(c, x, baseY, w + 6, 2, 0.28);
      // body
      A.r(c, x - w / 2, wallTop, w, h, '#3d2c1e');
      A.r(c, x - w / 2 + 1, wallTop + 1, w - 2, h - 2, color);
      A.r(c, x - w / 2, wallTop, w, 1, '#d8b26a');
      // warm shop windows and a striped awning
      const awY = wallTop + 8;
      for (let i = 0; i < Math.ceil(w / 8); i++) {
        A.r(c, x - w / 2 + i * 8, awY, 7, 3, i % 2 ? '#d9c09a' : '#9b3a2b');
      }
      A.r(c, x - w / 2, awY + 3, w, 1, 'rgba(50,29,18,.45)');
      // ground floor: dark doorway with a warm interior
      const dw = Math.min(20, w * 0.3);
      A.r(c, x - dw / 2, baseY - h + 12, dw, h - 14, '#24170f');
      A.r(c, x - dw / 2 + 2, baseY - h + 14, dw - 4, h - 17, '#7a4a2a');
      A.r(c, x - dw / 2 + 3, baseY - h + 15, dw - 6, 4, '#d9a35c');
      A.r(c, x - dw / 2 + 4, baseY - h + 19, dw - 8, 2, 'rgba(255,203,122,.5)');
      // shop windows / shelves
      for (const side of [-1, 1]) {
        const wx = x + side * (dw / 2 + 8);
        A.r(c, wx - 8, baseY - h + 11, 14, h - 16, '#2b1d14');
        A.r(c, wx - 7, baseY - h + 12, 12, h - 18, modern ? '#8fa1a0' : '#c9b183');
        A.r(c, wx - 6, baseY - h + 14, 10, 2, '#d8b26a');
        A.r(c, wx - 6, baseY - h + 18, 10, 1, '#8a6a44');
        A.r(c, wx - 5, baseY - h + 16, 3, 3, 'rgba(255,190,104,.45)');
      }
      // traditional tiled roof / modern flat cornice
      if (modern) {
        A.r(c, x - w / 2 - 4, wallTop - 6, w + 8, 6, '#4b3a2a');
        A.r(c, x - w / 2 - 4, wallTop - 6, w + 8, 1, '#d8b26a');
        A.r(c, x - w / 2, wallTop - 2, w, 2, '#c9a05a');
      } else {
        for (let i = 0; i < 7; i++) {
          const ww = (w + 12) * (1 - i * 0.045);
          A.r(c, x - ww / 2, wallTop - 7 + i, ww, 1, i % 3 === 0 ? '#56544e' : '#6b6961');
        }
        A.r(c, x - w / 2 - 6, wallTop - 1, w + 12, 2, '#3e3327');
        A.r(c, x - w / 2 - 6, wallTop - 1, w + 12, 1, '#a68d61');
        // eave brackets
        for (let xx = x - w / 2 + 2; xx < x + w / 2; xx += 7) A.r(c, xx, wallTop + 1, 1, 3, '#d8b26a');
      }
      // hanging sign / banner
      A.r(c, x - 13, wallTop + 4, 26, 12, '#22170f');
      A.r(c, x - 12, wallTop + 5, 24, 10, '#3a2a18');
      c.strokeStyle = '#c9a05a'; c.strokeRect(x - 12.5, wallTop + 5.5, 23, 9);
      G.text(c, name.slice(0, 4), x, wallTop + 13, { size: 7, color: '#f2d9a2', align: 'center' });
      // vertical banner
      A.r(c, x + w / 2 - 9, wallTop + 18, 7, 20, '#6d251b');
      A.r(c, x + w / 2 - 8, wallTop + 19, 5, 18, '#b34632');
      A.r(c, x + w / 2 - 8, wallTop + 19, 5, 1, '#e4c17b');
      A.r(c, x + w / 2 - 8, wallTop + 36, 5, 1, '#e4c17b');
      A.r(c, x + w / 2 - 6, wallTop + 23, 1, 1, '#efd59b');
      A.r(c, x + w / 2 - 6, wallTop + 27, 1, 1, '#efd59b');
      A.r(c, x + w / 2 - 6, wallTop + 31, 1, 1, '#efd59b');
      // lanterns
      for (const side of [-1, 1]) {
        const lx = x + side * (w / 2 - 5);
        A.r(c, lx - 1, wallTop + 1, 1, 5, '#d8b26a');
        A.r(c, lx - 3, wallTop + 6, 6, 6, '#b3402c');
        A.r(c, lx - 2, wallTop + 7, 4, 4, '#d45637');
      }
    }

    paifang(c, x, baseY) {
      const half = 54;
      A.shadow(c, x, baseY, half * 2 + 10, 3, 0.3);
      // columns
      for (const side of [-1, 1]) {
        const px = x + side * half;
        A.r(c, px - 4, baseY - 58, 8, 58, '#5b241b');
        A.r(c, px - 3, baseY - 58, 3, 58, '#8f3526');
        A.r(c, px - 7, baseY - 4, 14, 4, A.pal.stone);
        A.r(c, px - 6, baseY - 44, 12, 3, '#d8b26a');
      }
      // beams
      A.r(c, x - half - 8, baseY - 54, half * 2 + 16, 6, '#3a2418');
      A.r(c, x - half - 8, baseY - 54, half * 2 + 16, 2, '#8f3526');
      A.r(c, x - half - 12, baseY - 48, half * 2 + 24, 4, '#7a2b21');
      // green/gold roof
      for (let i = 0; i < 10; i++) {
        const ww = (half * 2 + 22) * (1 - i * 0.035);
        A.r(c, x - ww / 2, baseY - 72 + i, ww, 1, i % 3 === 0 ? '#2f6c60' : (i % 3 === 1 ? '#3b8274' : '#27594f'));
      }
      A.r(c, x - half - 12, baseY - 73, half * 2 + 24, 2, '#1e4a42');
      A.r(c, x - half - 4, baseY - 75, half * 2 + 8, 2, '#d8b26a');
      // little roof ridges
      for (const side of [-1, 1]) {
        A.r(c, x + side * (half + 10), baseY - 76, 3, 6, '#d8b26a');
      }
      // plaque
      A.r(c, x - 26, baseY - 46, 52, 13, '#1f1811');
      c.strokeStyle = '#e2bd72'; c.strokeRect(x - 25.5, baseY - 45.5, 51, 12);
      G.text(c, '前门大街', x, baseY - 36, { size: 7, color: '#f0d49a', align: 'center' });
      // lanterns
      for (const side of [-1, 1]) {
        const lx = x + side * (half - 10);
        A.r(c, lx - 3, baseY - 44, 6, 8, '#c14530');
        A.r(c, lx - 2, baseY - 43, 4, 6, '#e06343');
        A.r(c, lx - 1, baseY - 36, 2, 3, '#d8b26a');
      }
    }

    duck(c, x, y) {
      c.strokeStyle = 'rgba(210,235,220,.28)';
      c.lineWidth = 1;
      c.beginPath(); c.ellipse(x, y + 2, 7, 2, 0, 0, G.TAU); c.stroke();
      A.r(c, x - 4, y - 4, 7, 4, '#d8cdb4');
      A.r(c, x - 3, y - 5, 5, 2, '#e8dfc9');
      A.r(c, x + 2, y - 7, 3, 3, '#5e7a62');
      A.r(c, x + 5, y - 6, 2, 1, '#d8a14c');
      A.r(c, x + 3, y - 7, 1, 1, '#2b2118');
      A.r(c, x - 5, y - 3, 2, 1, '#8a7a5c');
    }

    planter(c, x, baseY) {
      A.shadow(c, x, baseY, 14, 2, 0.24);
      A.r(c, x - 5, baseY - 7, 10, 7, '#8a4a32');
      A.r(c, x - 4, baseY - 9, 8, 3, '#a76043');
      A.r(c, x - 8, baseY - 17, 16, 9, '#546d42');
      A.r(c, x - 6, baseY - 20, 12, 5, '#67834e');
      A.r(c, x - 3, baseY - 22, 6, 4, '#77955a');
      for (let i = 0; i < 4; i++) {
        A.r(c, x - 5 + i * 3, baseY - 19 + (i % 2) * 3, 1, 1, i % 2 ? '#d9a14c' : '#c75f58');
      }
    }

    rickshaw(c, x, baseY) {
      A.shadow(c, x, baseY, 30, 3, 0.28);
      // wheels
      c.strokeStyle = '#2a231d'; c.lineWidth = 1;
      c.beginPath(); c.arc(x - 11, baseY - 5, 5, 0, G.TAU); c.stroke();
      c.beginPath(); c.arc(x + 11, baseY - 5, 5, 0, G.TAU); c.stroke();
      // cart
      A.r(c, x - 8, baseY - 19, 16, 8, '#5e3c27');
      A.r(c, x - 7, baseY - 18, 14, 6, '#8a5a37');
      A.r(c, x - 2, baseY - 15, 4, 4, '#c9a05a');
      // canopy
      for (let i = 0; i < 6; i++) {
        A.r(c, x - 10 + i, baseY - 26 + i, 20 - i * 2, 1, i % 2 ? '#3e4e57' : '#50646d');
      }
      A.r(c, x - 7, baseY - 20, 1, 4, '#3c2a1c');
      A.r(c, x + 6, baseY - 20, 1, 4, '#3c2a1c');
      // pull bar
      A.r(c, x + 12, baseY - 14, 7, 1, '#6b4a2e');
    }

    bike(c, x, baseY) {
      A.shadow(c, x, baseY, 22, 2, 0.22);
      c.strokeStyle = '#2b2520'; c.lineWidth = 1;
      c.beginPath(); c.arc(x - 8, baseY - 5, 5, 0, G.TAU); c.stroke();
      c.beginPath(); c.arc(x + 8, baseY - 5, 5, 0, G.TAU); c.stroke();
      c.strokeStyle = '#8a3a2a';
      c.beginPath(); c.moveTo(x - 8, baseY - 5); c.lineTo(x - 2, baseY - 13); c.lineTo(x + 7, baseY - 6); c.lineTo(x + 8, baseY - 5); c.stroke();
      c.beginPath(); c.moveTo(x - 2, baseY - 13); c.lineTo(x + 5, baseY - 13); c.stroke();
      A.r(c, x + 4, baseY - 16, 5, 1, '#2b2520');
      A.r(c, x - 4, baseY - 15, 3, 2, '#2b2520');
    }

    bin(c, x, baseY) {
      A.shadow(c, x, baseY, 10, 1, 0.2);
      A.r(c, x - 4, baseY - 9, 8, 9, '#3e4b3f');
      A.r(c, x - 3, baseY - 8, 6, 6, '#566756');
      A.r(c, x - 5, baseY - 10, 10, 2, '#2d382e');
    }

    bollard(c, x, baseY) {
      A.r(c, x - 1, baseY - 7, 3, 7, '#8d8168');
      A.r(c, x - 1, baseY - 9, 3, 2, '#b3a88d');
      A.r(c, x - 2, baseY - 1, 5, 1, '#6b6254');
    }

    lanternString(c, x1, x2, y, n) {
      const sag = 12;
      c.strokeStyle = 'rgba(60,40,24,.7)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x1, y);
      c.quadraticCurveTo((x1 + x2) / 2, y + sag * 2, x2, y);
      c.stroke();
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const lx = x1 + (x2 - x1) * t;
        const ly = y + Math.sin(t * Math.PI) * sag * 1.2;
        A.r(c, lx - 1, ly, 2, 4, '#d8b26a');
        A.r(c, lx - 4, ly + 4, 8, 8, '#b3402c');
        A.r(c, lx - 3, ly + 5, 6, 6, '#d45637');
        A.r(c, lx - 1, ly + 12, 2, 2, '#e0b05a');
      }
    }

    jingshan(c, x, baseY) {
      // mound
      for (let i = 0; i < 46; i++) {
        const t = i / 45;
        const ww = 86 * Math.sin((1 - t) * 1.35) + 20;
        A.r(c, x - ww, baseY - i, ww * 2, 1, i % 7 === 0 ? '#4d6239' : (i % 3 === 0 ? '#5b7044' : '#536a3f'));
      }
      // pavilion
      const py = baseY - 44;
      A.r(c, x - 10, py - 14, 20, 14, '#8f3527');
      A.r(c, x - 8, py - 12, 4, 11, '#5b241b');
      A.r(c, x + 3, py - 12, 4, 11, '#5b241b');
      A.r(c, x - 8, py - 14, 16, 2, '#d8b26a');
      for (let i = 0; i < 4; i++) {
        const ww = 17 - i * 3;
        A.r(c, x - ww, py - 17 - i, ww * 2, 2, i % 2 ? '#2f6c6b' : '#3d8580');
      }
      A.r(c, x - 1, py - 23, 2, 4, '#d8b26a');
      // trees
      for (const [tx, ty, s] of [[-64, -2, 0.7], [62, -6, 0.8], [-38, 12, 0.6], [40, 16, 0.55], [78, 8, 0.6]]) {
        A.tree(c, x + tx, baseY + ty, s);
      }
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      // base earth
      c.fillStyle = '#6a5943';
      c.fillRect(0, 0, this.w, this.h);
      // city block texture
      for (let y = 0; y < this.h; y += 34) {
        for (let x = 0; x < this.w; x += 34) {
          const n = G.hash(x, y, 21);
          if (n < 0.14) { c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x, y, 33, 33); }
          else if (n > 0.9) { c.fillStyle = 'rgba(255,235,200,.025)'; c.fillRect(x, y, 33, 33); }
        }
      }

      // parks / grass
      c.fillStyle = '#5c7046';
      c.fillRect(260, 1080, 590, 300); // hutong block base
      c.fillStyle = '#566a42';
      c.fillRect(1380, 1000, 300, 230); // wangfujing block
      c.fillStyle = '#5a6d46';
      c.fillRect(1370, 1150, 440, 320); // tiantan park
      c.fillStyle = '#61744a';
      c.fillRect(350, 380, 420, 390); // beihai park

      // 北海 lake
      this.paintLake(c, 400, 440, 300, 250);

      // hutong paving
      A.paving(c, 270, 1040, 570, 330, '#77695a', '#66584a', 8, 16);
      // shichahai hint
      A.paving(c, 270, 760, 300, 240, '#6f6352', '#5e5445', 9, 18);

      // 天坛 park
      A.paving(c, 1400, 1180, 360, 280, '#71805a', '#63724f', 5, 22);
      // 王府井
      A.paving(c, 1370, 1000, 320, 240, '#877762', '#786a58', 6, 14);

      // CBD plaza
      A.paving(c, 1550, 690, 500, 460, '#6a665f', '#5b5852', 12, 24);

      // palace approach / square
      A.paving(c, 960, 800, 280, 175, '#b7aa8f', '#a89b80', 4, 12);
      A.paving(c, 1000, 1020, 200, 130, '#c0b395', '#b0a286', 5, 12);
      // palace ground
      A.paving(c, 880, 320, 440, 500, '#b3a78c', '#a3977b', 7, 12);

      // roads
      this.roadH(c, 0, 970, 2200, 52, true);
      this.roadH(c, 0, 1350, 2200, 32, false);
      this.roadV(c, 820, 0, 1500, 30);
      this.roadV(c, 1380, 0, 1500, 30);
      this.roadV(c, 1680, 400, 1200, 28);

      // warm sidewalks flanking the avenue give the street depth
      A.paving(c, 790, 1022, 250, 478, '#8e795d', '#7e6a50', 31, 18);
      A.paving(c, 1160, 1022, 300, 478, '#8e795d', '#7e6a50', 32, 18);
      c.fillStyle = 'rgba(54,43,31,.35)';
      c.fillRect(1038, 1022, 12, 478);
      c.fillRect(1150, 1022, 10, 478);
      c.fillStyle = 'rgba(238,220,180,.18)';
      c.fillRect(1042, 1022, 1, 478);
      c.fillRect(1158, 1022, 1, 478);
      // dappled tree shadows and leaf litter
      for (const [sx, sy, r] of [[932, 1082, 38], [1186, 1222, 28], [1022, 1100, 20], [1178, 1100, 20]]) {
        c.save();
        c.globalAlpha = 0.13;
        c.fillStyle = '#2d2318';
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.ellipse(sx + i * 9 - 18, sy + 2 + (i % 2) * 4, r - i * 4, 5, 0, 0, G.TAU);
          c.fill();
        }
        c.restore();
      }
      for (let i = 0; i < 46; i++) {
        const lx = 800 + G.hash(i, 51, 111) * 620;
        const ly = 1030 + G.hash(i, 52, 112) * 440;
        c.fillStyle = G.pick(['rgba(184,124,54,.5)', 'rgba(205,151,62,.45)', 'rgba(139,94,44,.4)']);
        c.fillRect(lx, ly, 1, 1);
      }
      // 前门大街 + 中轴
      A.paving(c, 1050, 1022, 100, 478, '#a99a7d', '#9a8b70', 10, 12);
      // old tram rails
      c.save();
      c.globalAlpha = 0.45;
      c.fillStyle = '#5d574d';
      c.fillRect(1072, 1022, 2, 478);
      c.fillRect(1126, 1022, 2, 478);
      c.fillStyle = '#8b8272';
      c.fillRect(1072, 1022, 1, 478);
      c.fillRect(1126, 1022, 1, 478);
      c.globalAlpha = 0.18;
      for (let y = 1030; y < 1500; y += 9) c.fillRect(1070, y, 30, 1);
      c.restore();
      c.fillStyle = 'rgba(216,178,106,.5)';
      c.fillRect(1099, 1022, 2, 478);
      c.fillStyle = 'rgba(60,45,30,.25)';
      c.fillRect(1050, 1022, 2, 478);
      c.fillRect(1148, 1022, 2, 478);
      // axis promenade north
      A.paving(c, 1058, 760, 84, 220, '#b9ac90', '#a99c80', 11, 12);
      c.fillStyle = 'rgba(216,178,106,.55)';
      c.fillRect(1099, 760, 2, 210);

      // zebra crossings on 长安街
      for (const cx of [1100, 820, 1380]) {
        for (let i = 0; i < 9; i++) {
          c.fillStyle = 'rgba(232,224,205,.5)';
          c.fillRect(cx - 22 + i * 5, 970, 3, 7);
          c.fillRect(cx - 22 + i * 5, 1015, 3, 7);
        }
      }
      // lane dashes
      c.fillStyle = 'rgba(230,214,170,.4)';
      for (let x = 0; x < this.w; x += 40) {
        if (x % 80 < 20) c.fillRect(x, 994, 18, 1);
        if (x % 80 > 40) c.fillRect(x, 1003, 18, 1);
      }

      // 中轴 golden line all the way
      c.fillStyle = 'rgba(216,178,106,.55)';
      for (let y = 220; y < 1490; y += 18) c.fillRect(1099, y, 2, 9);

      // tree shadows / clusters in parks
      for (let i = 0; i < 46; i++) {
        const x = 300 + G.hash(i, 2, 31) * 500;
        const y = 1085 + G.hash(i, 8, 32) * 290;
        c.fillStyle = 'rgba(26,32,20,.14)';
        c.beginPath(); c.ellipse(x, y + 2, 10, 3, 0, 0, G.TAU); c.fill();
      }

      // road labels
      c.save();
      c.globalAlpha = 0.24;
      G.text(c, '长 安 街', 560, 1000, { size: 8, color: '#f2e4c6' });
      G.text(c, '长 安 街', 1520, 1000, { size: 8, color: '#f2e4c6' });
      G.text(c, '王府井大街', 1400, 1240, { size: 7, color: '#e9d9bd' });
      G.text(c, '南锣鼓巷', 380, 1010, { size: 7, color: '#e9d9bd' });
      c.restore();
      // axis label vertical
      c.save();
      c.translate(1110, 1450);
      c.rotate(-Math.PI / 2);
      c.globalAlpha = 0.3;
      G.text(c, '北 京 中 轴 线', 0, 0, { size: 8, color: '#f0d9ac' });
      c.restore();
    }

    paintLake(c, x, y, w, h) {
      // bank
      c.fillStyle = '#4a5c3c';
      for (let yy = 0; yy < h; yy++) {
        const t = yy / h;
        const ww = w * Math.sin(Math.PI * G.clamp(t, 0.06, 0.94)) * 0.52 + w * 0.42;
        c.fillRect(x + w / 2 - ww / 2 - 8, y + yy, ww + 16, 1);
      }
      // water
      for (let yy = 0; yy < h; yy++) {
        const t = yy / h;
        const ww = w * Math.sin(Math.PI * G.clamp(t, 0.06, 0.94)) * 0.5 + w * 0.4;
        const xx = x + w / 2 - ww / 2;
        const col = yy % 9 === 0 ? '#357478' : (yy % 5 === 0 ? '#2b6468' : '#2f6b6d');
        c.fillStyle = col;
        c.fillRect(xx, y + yy, ww, 1);
      }
      // ripples
      c.save();
      c.globalAlpha = 0.25;
      c.fillStyle = '#8bc0b4';
      for (let i = 0; i < 14; i++) {
        const yy = y + 20 + i * 16;
        c.fillRect(x + 110 + Math.sin(i) * 20, yy, 36, 1);
        c.fillRect(x + 190 + Math.cos(i) * 14, yy + 7, 22, 1);
      }
      c.restore();
      // island / shore
      c.fillStyle = '#5f7248';
      c.fillRect(x + 30, y + 10, 80, 20);
      c.fillRect(x + 200, y + h - 40, 60, 30);
      // bridge
      A.bridge(c, x + 168, y + h - 50, 30);
      // willows around
      c.fillStyle = 'rgba(40,50,30,.18)';
      for (let i = 0; i < 20; i++) {
        const xx = x + 20 + G.hash(i, 1, 13) * (w - 40);
        const yy = y + 8 + G.hash(i, 5, 14) * (h - 16);
        c.beginPath(); c.ellipse(xx, yy, 12, 4, 0, 0, G.TAU); c.fill();
      }
    }

    roadH(c, x, y, w, h, main) {
      c.fillStyle = main ? '#47423c' : '#4f4941';
      c.fillRect(x, y, w, h);
      // 沥青颗粒与轮迹：大面积道路不再是一整块灰
      for (let yy = y + 2; yy < y + h - 2; yy += 3) {
        for (let xx = x + 2; xx < x + w - 2; xx += 3) {
          const hh = G.hash(xx, yy, 41);
          if (hh < 0.3) { c.fillStyle = 'rgba(232,224,205,.055)'; c.fillRect(xx, yy, 1, 1); }
          else if (hh > 0.86) { c.fillStyle = 'rgba(12,10,8,.16)'; c.fillRect(xx, yy, 1, 1); }
        }
      }
      c.fillStyle = 'rgba(20,18,15,.22)';
      c.fillRect(x, y + (h >> 1) - 6, w, 1);
      c.fillRect(x, y + (h >> 1) + 6, w, 1);
      // 路缘：受光顶面 + 阴影投在路面上
      c.fillStyle = '#a89575';
      c.fillRect(x, y - 3, w, 3);
      c.fillRect(x, y + h, w, 3);
      c.fillStyle = 'rgba(255,240,210,.22)';
      c.fillRect(x, y - 3, w, 1);
      c.fillStyle = 'rgba(0,0,0,.16)';
      c.fillRect(x, y + h + 3, w, 2);
      c.fillStyle = 'rgba(255,255,255,.03)';
      for (let xx = 0; xx < w; xx += 22) c.fillRect(x + xx, y + 8, 10, 1);
      if (main) {
        c.fillStyle = 'rgba(220,200,150,.3)';
        c.fillRect(x, y + 25, w, 1);
      }
    }

    roadV(c, x, y, h, w) {
      c.fillStyle = '#4d4841';
      c.fillRect(x, y, w, h);
      for (let yy = y + 2; yy < y + h - 2; yy += 3) {
        for (let xx = x + 2; xx < x + w - 2; xx += 3) {
          if (G.hash(xx, yy, 42) < 0.3) { c.fillStyle = 'rgba(232,224,205,.05)'; c.fillRect(xx, yy, 1, 1); }
        }
      }
      c.fillStyle = '#9c8b6d';
      c.fillRect(x - 3, y, 3, h);
      c.fillRect(x + w, y, 3, h);
      c.fillStyle = 'rgba(255,240,210,.2)';
      c.fillRect(x - 3, y, 1, h);
      c.fillRect(x + w, y, 1, h);
    }

    /* ============================================================
       interactions
       ============================================================ */
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

    gate() {
      if (G.save.flag('entered')) {
        G.dialog.show([
          { name: '安检员', text: '您已经入宫了。北边的神武门广场今晚有打铁花。' },
        ]);
        return;
      }
      G.dialog.show([
        { name: '午门 · 安检员', text: '前方是故宫博物院。请出示身份证件，随身行李过安检。' },
        { name: '旅行手账', text: '过了这道门，就是紫禁城。' },
      ], () => {
        if (G.security) G.security.start();
      });
    }

    subway() {
      G.dialog.show([
        { name: '地铁广播', text: '开往朱辛庄方向的列车即将进站。' },
        { name: '旅行手账', text: '坐一站到天安门东，能省不少脚力。' },
      ], () => {
        G.fade.to(() => {
          this.setPlayer(1100, 1028);
          G.ui.toast('已乘地铁 8 号线 · 天安门东', 'good');
          G.audio.sfx('success');
        });
      });
    }

    /* ============================================================
       ambient
       ============================================================ */
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
      if (Math.random() < dt * 1.8) {
        const x = this.cam.x + G.rand(-40, G.W + 40);
        const y = this.cam.y + G.rand(0, G.H);
        G.fx.add({
          x, y, vx: G.rand(3, 10), vy: G.rand(-4, 4),
          life: G.rand(1.4, 2.6), size: 1, color: 'rgba(236,220,180,.35)',
          grav: 0, glow: false,
        });
      }
      // steam from the sugar-haw cart
      if (Math.random() < dt * 2.4) {
        G.fx.add({
          x: 940 + G.rand(-4, 4), y: 1238 + G.rand(-2, 2),
          vx: G.rand(-2, 3), vy: G.rand(-12, -5),
          life: G.rand(1.1, 2.2), size: G.rand(1, 2),
          color: 'rgba(226,216,196,.22)', grav: -2, glow: false,
        });
      }
      if (Math.random() < dt * 1.4) {
        const trees = [[1022, 1050], [1178, 1180], [520, 620], [700, 700]];
        const [tx, ty] = G.pick(trees);
        G.fx.add({
          x: tx + G.rand(-16, 16), y: ty - G.rand(18, 40),
          vx: G.rand(-10, 10), vy: G.rand(-4, 8),
          life: G.rand(1.5, 2.8), size: 1,
          color: G.pick(['#c08b42', '#d8a14c', '#8f6a35']),
          grav: 5, glow: false,
        });
      }
    }

    drawMap(ctx) {
      const mx = 110, my = 40, mw = 420, mh = 286;
      const X = (wx) => mx + (wx / this.w) * mw;
      const Y = (wy) => my + (wy / this.h) * mh;
      ctx.save();
      ctx.fillStyle = 'rgba(10,8,6,.84)';
      ctx.fillRect(0, 0, 640, 360);
      // a sheet of warm rice paper
      ctx.fillStyle = '#e9d9b8';
      ctx.fillRect(mx - 14, my - 22, mw + 28, mh + 44);
      ctx.save();
      ctx.globalAlpha = 0.22;
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
      // title
      G.text(ctx, '北京 · 中轴线地图', mx - 2, my - 7, { size: 11, color: '#3d2d1c', weight: 'bold' });
      G.text(ctx, 'M 关闭', mx + mw - 32, my - 7, { size: 7, color: '#7d684c' });
      // faint ink seal watermark
      ctx.save();
      ctx.globalAlpha = 0.055;
      G.text(ctx, '京', mx + mw / 2, my + mh / 2 + 38, { size: 126, color: '#6b2e22', align: 'center', font: '"KaiTi","STKaiti",serif' });
      ctx.restore();
      // districts
      ctx.fillStyle = 'rgba(138,111,73,.16)';
      ctx.fillRect(X(260), Y(1000), X(850) - X(260), Y(1400) - Y(1000));
      ctx.fillRect(X(1380), Y(1000), X(1700) - X(1380), Y(1400) - Y(1000));
      ctx.fillRect(X(1550), Y(700), X(2040) - X(1550), Y(1150) - Y(700));
      ctx.fillStyle = 'rgba(105,130,82,.24)';
      ctx.fillRect(X(330), Y(370), X(760) - X(330), Y(770) - Y(370));
      ctx.fillRect(X(1380), Y(1150), X(1780) - X(1380), Y(1450) - Y(1150));
      // roads: pale ribbons with ink edges
      function road(x, y, w, h) {
        ctx.fillStyle = '#d7c6a4';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(120,94,58,.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      }
      road(X(0), Y(970), mw, Y(1022) - Y(970));
      road(X(1050), Y(760), X(1150) - X(1050), Y(1500) - Y(760));
      ctx.fillStyle = 'rgba(120,94,58,.35)';
      ctx.fillRect(X(160), Y(200), X(2060) - X(160), 1);
      ctx.fillRect(X(240), Y(120), 1, Y(1380) - Y(120));
      ctx.fillRect(X(1940), Y(120), 1, Y(1380) - Y(120));
      // axis
      ctx.fillStyle = '#b8863f';
      ctx.fillRect(X(1099), Y(150), 2, Y(1500) - Y(150));
      ctx.fillStyle = 'rgba(184,134,63,.35)';
      ctx.fillRect(X(1095), Y(820), 10, Y(840) - Y(820));
      // moat / palace
      ctx.fillStyle = '#7fa9a3';
      ctx.fillRect(X(856), Y(300), X(1344) - X(856), Y(850) - Y(300));
      ctx.fillStyle = '#f1e3c6';
      ctx.fillRect(X(866), Y(310), X(1334) - X(866), Y(840) - Y(310));
      ctx.fillStyle = '#c98a72';
      ctx.fillRect(X(900), Y(350), X(1300) - X(900), Y(800) - Y(350));
      ctx.fillStyle = '#e8d7b7';
      ctx.fillRect(X(960), Y(390), X(1240) - X(960), Y(760) - Y(390));
      ctx.fillStyle = '#9a3a2b';
      ctx.fillRect(X(1080), Y(370), X(1120) - X(1080), 2);
      // halls
      ctx.fillStyle = '#b9793d';
      for (const hy of [430, 520, 620, 730]) {
        ctx.fillRect(X(1080), Y(hy), X(1120) - X(1080), 3);
      }
      // 北海
      ctx.fillStyle = '#7fa9a3';
      ctx.beginPath(); ctx.ellipse(X(530), Y(570), 30, 42, 0, 0, G.TAU); ctx.fill();
      ctx.fillStyle = '#f1e3c6';
      ctx.beginPath(); ctx.arc(X(525), Y(500), 4, 0, G.TAU); ctx.fill();
      // 天坛
      ctx.fillStyle = '#5f8f9e';
      ctx.beginPath(); ctx.arc(X(1580), Y(1300), 12, 0, G.TAU); ctx.fill();
      ctx.strokeStyle = '#6d8a58'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(X(1580), Y(1300), 22, 0, G.TAU); ctx.stroke();
      // 鸟巢
      ctx.strokeStyle = '#8d7959';
      ctx.beginPath(); ctx.ellipse(X(1660), Y(400), 16, 9, 0, 0, G.TAU); ctx.stroke();
      // CBD blocks
      ctx.fillStyle = '#bfa77f';
      for (const [bx, by, bw, bh] of [[1640, 850, 20, 30], [1705, 810, 24, 40], [1840, 780, 18, 28], [1930, 1030, 20, 35]]) {
        ctx.fillRect(X(bx) - bw / 2, Y(by) - bh, bw, bh);
      }
      // 天安门 / 正阳门
      ctx.fillStyle = '#a34a36';
      ctx.fillRect(X(1010), Y(950), X(1190) - X(1010), 4);
      ctx.fillRect(X(1030), Y(1150), X(1170) - X(1030), 4);
      // labels
      const labels = [
        [1100, 360, '故宫', '#6b2e22'], [1100, 190, '景山', '#4a3826'],
        [520, 660, '北海', '#3c6e6c'], [1050, 935, '天安门', '#6b2e22'],
        [955, 1205, '前门', '#6b2e22'], [1580, 1390, '天坛', '#3c6e6c'],
        [1660, 480, '鸟巢', '#5b4a33'], [1900, 1150, '国贸', '#5b4a33'],
        [1510, 1150, '王府井', '#5b4a33'], [460, 1280, '胡同', '#5b4a33'],
        [600, 940, '长安街', '#8a6f48'],
      ];
      for (const [lx, ly, name, col] of labels) {
        G.text(ctx, name, X(lx), Y(ly), {
          size: 8, color: col, align: 'center', outline: 'rgba(247,235,208,.9)', outlineWidth: 3,
        });
      }
      // player
      const px = X(this.player.x), py = Y(this.player.y);
      const pulse = 4 + Math.sin(this.time * 4) * 2;
      ctx.strokeStyle = 'rgba(163,74,54,.45)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, pulse + 3, 0, G.TAU); ctx.stroke();
      ctx.fillStyle = '#a34a36';
      ctx.beginPath(); ctx.arc(px, py, 3, 0, G.TAU); ctx.fill();
      ctx.fillStyle = '#f6e8c9';
      ctx.beginPath(); ctx.arc(px - 1, py - 1, 1, 0, G.TAU); ctx.fill();
      // objective
      const ox = X(1100), oy = Y(830);
      ctx.fillStyle = '#b3402c';
      ctx.beginPath();
      ctx.moveTo(ox, oy - 8); ctx.lineTo(ox + 5, oy - 3); ctx.lineTo(ox, oy + 2); ctx.lineTo(ox - 5, oy - 3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e4bd78'; ctx.stroke();
      // legend
      G.text(ctx, '● 当前位置', mx - 2, my + mh + 14, { size: 6, color: '#a34a36' });
      G.text(ctx, '◆ 目的地', mx + 64, my + mh + 14, { size: 6, color: '#b3402c' });
      G.text(ctx, '北 ↑', mx + mw - 28, my + mh + 14, { size: 6, color: '#7d684c' });
      // little red collector's seal
      ctx.fillStyle = 'rgba(163,60,43,.78)';
      ctx.fillRect(mx + mw - 24, my + mh - 24, 17, 17);
      ctx.strokeStyle = 'rgba(245,226,190,.7)'; ctx.lineWidth = 1;
      ctx.strokeRect(mx + mw - 23.5, my + mh - 23.5, 16, 16);
      G.text(ctx, '图', mx + mw - 15, my + mh - 11, { size: 8, color: '#f6e6c8', align: 'center' });
      // corner ticks
      ctx.strokeStyle = '#8a6a3d'; ctx.lineWidth = 1;
      for (const [cx2, cy2, dx, dy] of [[mx - 14, my - 22, 1, 1], [mx + mw + 14, my - 22, -1, 1], [mx - 14, my + mh + 22, 1, -1], [mx + mw + 14, my + mh + 22, -1, -1]]) {
        ctx.beginPath();
        ctx.moveTo(cx2 + dx * 8, cy2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 + dy * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawScreen(ctx) {
      if (this.mapOpen) { this.drawMap(ctx); return; }
      const fg = ctx.createLinearGradient(0, 300, 0, 360);
      fg.addColorStop(0, 'rgba(20,13,9,0)');
      fg.addColorStop(1, 'rgba(20,13,9,.26)');
      ctx.fillStyle = fg;
      ctx.fillRect(0, 300, 640, 60);
      // subtle top axis compass
      const p = this.player;
      const prog = G.clamp(1 - (p.y - 180) / (1320 - 180), 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = 'rgba(16,12,9,.6)';
      ctx.fillRect(276, 12, 88, 12);
      ctx.fillStyle = 'rgba(216,178,106,.25)';
      ctx.fillRect(280, 18, 80, 1);
      ctx.fillStyle = '#d8b26a';
      ctx.fillRect(280 + Math.round(prog * 78), 17, 3, 3);
      G.text(ctx, '前门', 262, 22, { size: 6, color: '#b7a78d', align: 'right' });
      G.text(ctx, '午门', 380, 22, { size: 6, color: '#b7a78d' });
      ctx.restore();
    }
  }

  G.BeijingScene = BeijingScene;
})();
