/* ============================================================
   万象灵境 · 雅典—故宫 · 投影错位
   A cross-cultural digital twin sandbox: the Forbidden City
   overlaid by an Acropolis projection layer.  Chapter I prototype.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;
  const r = A.r;

  const STONE = '#d8cdb2';
  const STONE_D = '#b2a68b';
  const STONE_L = '#eee4ce';
  const SLATE = '#6e7778';
  const SLATE_D = '#454c4e';
  const BRASS = '#c79c54';
  const BRASS_D = '#87652f';
  const IVY = '#4f6b4a';

  class FusionScene extends G.WorldScene {
    constructor() {
      super({
        id: 'fusion', w: 1440, h: 1600, spawn: { x: 720, y: 1040 },
        clock: '∞', dateLabel: '融合参数不稳定', ambient: 'palace',
        lookAhead: 105, gradeStrength: 0.6,
      });
      this.title = '万象灵境 · 雅典—故宫';
      this.mapOpen = false;
      this.state = { metEvelyn: false, cn: false, en: false, repaired: false, verified: false, completed: false };
      this.introPlayed = false;
      this.introTimer = null;
      this.marker = { x: 820, y: 1050 };
      this.flash = 0;
      this.repairAge = 99;
      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    /* ============================================================
       lifecycle
       ============================================================ */
    onEnter(opts) {
      opts = opts || {};
      if (opts.skipIntro) {
        this.introPlayed = true;
        this.state.metEvelyn = true;
      }
      G.ui.location('万象灵境', '雅典—故宫 · 投影错位');
      G.ui.setHomeButton(false);
      this.clock = '∞';
      this.dateLabel = this.state.repaired ? '来源标签已校准' : '投影标签错乱';
      this.updateHud();
      this.refreshObjective();
      G.audio.ambient('palace');
      if (!this.introPlayed) {
        this.introPlayed = true;
        clearTimeout(this.introTimer);
        this.introTimer = setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show(this.introLines(), () => {
            this.state.metEvelyn = true;
            this.refreshObjective();
          });
        }, 650);
      }
    }

    exit() {
      clearTimeout(this.introTimer);
      G.ui.prompt(null);
    }

    introLines() {
      return [
        { name: '狄奥提玛', text: '欢迎来到故宫沙盘——先别急着看太和殿。看到月台上那些飘带和山墙了吗？' },
        { name: '狄奥提玛', text: '那是帕特农的投影，可系统坚持说它是“故宫原生装饰”。西侧宫墙前还浮着女像柱，标签却写着“未知”。' },
        { name: '狄奥提玛', text: '两处档案散落在宫里：太和殿东庑的故宫档案，西侧帕特农投影区的卫城档案。' },
        { name: '狄奥提玛', text: '先把它们找回来。我们要校准的是来源说明，不是拆掉故宫。' },
        { name: '旅行手账', text: '（太和殿月台上，一层半透明的希腊山墙压在金瓦上，像一张贴错位置的描图纸。）' },
      ];
    }

    evelynLines() {
      const s = this.state;
      if (!s.metEvelyn) return this.introLines();
      if (!s.cn && !s.en) return [
        { name: '狄奥提玛', text: '东边太和殿东庑是故宫档案，西边帕特农投影区是卫城档案。' },
        { name: '狄奥提玛', text: '别被那些投影吓到。先看标签，再看建筑本身。' },
      ];
      if (!s.cn) return [
        { name: '狄奥提玛', text: '卫城档案已经拿到了？很好。还差太和殿东庑的故宫档案。' },
        { name: '狄奥提玛', text: '故宫的中轴序列有它自己的礼制逻辑，不能按卫城的“入口—胜利—主神”重排。' },
      ];
      if (!s.en) return [
        { name: '狄奥提玛', text: '故宫档案有回应了。西边帕特农投影区的卫城档案还在等我们。' },
        { name: '狄奥提玛', text: '帕特农、伊瑞克提翁、胜利神庙——它们是参照层，不是被搬进故宫的实物。' },
      ];
      if (!s.repaired) return [
        { name: '狄奥提玛', text: '两份档案都齐了。去中央的来源校准台，把投影标签放回正确的位置。' },
        { name: '狄奥提玛', text: '记住：比较空间观念可以，编造直接传承不行。' },
      ];
      if (!s.completed) return [
        { name: '狄奥提玛', text: '来源标签归位了。北边的创作终端已经亮起来。' },
        { name: '狄奥提玛', text: '去吧。最后一块空白，应该由你来决定。' },
      ];
      return [
        { name: '狄奥提玛', text: '第一境已经完成。你随时可以再走一遍，或者从大门离开灵境。' },
        { name: '狄奥提玛', text: '下一次，我们从一个可辩护的对照开始，而不是从一张漂亮的融合图开始。' },
      ];
    }

    refreshObjective() {
      const s = this.state;
      if (s.completed) {
        this.objective('第一境完成 · 可回大厅，或从南门离开灵境');
        this.marker = { x: 720, y: 1520 };
      } else if (!s.metEvelyn) {
        this.objective('先和狄奥提玛确认投影标签');
        this.marker = { x: 820, y: 1050 };
      } else if (!s.cn && !s.en) {
        this.objective('寻找两份档案：故宫档案 / 卫城档案（0/2）');
        this.marker = { x: 1110, y: 1110 };
      } else if (!s.cn) {
        this.objective('去太和殿东庑取回故宫档案（1/2）');
        this.marker = { x: 1110, y: 1110 };
      } else if (!s.en) {
        this.objective('去西侧帕特农投影取回卫城档案（1/2）');
        this.marker = { x: 330, y: 1165 };
      } else if (!s.repaired) {
        this.objective('回到中央来源校准台 · 归位投影标签');
        this.marker = { x: 720, y: 548 };
      } else if (!s.verified) {
        this.objective('回到来源校准台 · 完成三条来源判断');
        this.marker = { x: 720, y: 548 };
      } else {
        this.objective('前往北侧创作终端，完成第一次造境');
        this.marker = { x: 720, y: 330 };
      }
    }

    /* ============================================================
       build
       ============================================================ */
    build() {
      this.solid(0, 0, this.w, 20);
      this.solid(0, 1580, this.w, 20);
      // canal (the bridge gap stays open)
      this.solid(20, 1258, 630, 48);
      this.solid(790, 1258, 630, 48);
      this.solid(560, 1560, 320, 40);
      // hybrid palace / side wings
      this.solid(432, 825, 576, 125);
      // west clock tower
      this.solid(278, 1132, 105, 98);
      // east observatory
      this.solid(1040, 1034, 140, 76);
      // terminal core
      this.solid(688, 552, 64, 36);
      // portal columns
      this.solid(632, 300, 38, 54);
      this.solid(770, 300, 38, 54);
      // fountain basin
      this.solid(222, 770, 96, 38);

      // south gate
      this.addEntity({
        x: 720, y: 1580, baseY: 1580,
        draw: (c) => this.drawSouthGate(c),
      });
      this.addInteract({
        x: 720, y: 1524, r: 56, label: '离开万象灵境',
        action: () => G.leaveFusion(),
      });

      // hybrid palace
      this.addEntity({
        x: 720, y: 950, baseY: 950,
        draw: (c) => this.drawPalace(c),
      });

      // west tower + archive
      this.addEntity({
        x: 330, y: 1230, baseY: 1230,
        draw: (c) => this.drawAcropolisProjection(c),
      });
      this.addInteract({
        x: 330, y: 1250, r: 46, label: '查看卫城档案',
        action: () => this.takeArchive('en'),
      });

      // east observatory + archive
      this.addEntity({
        x: 1110, y: 1110, baseY: 1110,
        draw: (c) => this.drawObservatory(c),
      });
      this.addInteract({
        x: 1110, y: 1148, r: 50, label: '查看故宫档案',
        action: () => this.takeArchive('cn'),
      });

      // terminal
      this.addEntity({
        x: 720, y: 620, baseY: 620,
        draw: (c) => this.drawTerminal(c),
      });
      this.addInteract({
        x: 720, y: 636, r: 64, label: '校准投影来源',
        action: () => this.useTerminal(),
      });

      // north creation portal
      this.addEntity({
        x: 720, y: 370, baseY: 370,
        draw: (c) => this.drawPortal(c),
      });
      this.addInteract({
        x: 720, y: 386, r: 58, label: '走进创作终端',
        action: () => this.enterPortal(),
      });

      // Evelyn
      this.evelyn = this.addNPC({
        x: 820, y: 1080, name: '狄奥提玛', quest: true, wander: 0,
        palette: {
          robe: '#e6ddca', robeDark: '#b9ad96', robeLight: '#f4eddc',
          trim: '#4f7f9f', hatType: 'none', hair: '#3d2b24',
          skin: '#e4b28d', bag: '#6d5a45', scarf: '#4f7f9f',
        },
        getLines: () => this.evelynLines(),
        onTalk: () => {
          this.state.metEvelyn = true;
          this.refreshObjective();
        },
      });

      // a handful of people in the fused square
      const tourist = {
        robe: '#c9a13e', robeDark: '#96742a', robeLight: '#e0bd5d',
        trim: '#7c4d2a', hatType: 'cap', hat: '#b54a38', bag: '#3f5a6b',
      };
      const visitor = {
        robe: '#526e80', robeDark: '#374c5b', robeLight: '#7392a1',
        trim: '#d8b26a', hatType: 'none', bag: '#76543a',
      };
      this.addNPC({
        x: 540, y: 1200, name: '看展的人', wander: 0, palette: visitor,
        lines: [{ name: '看展的人', text: '太和殿屋顶上怎么浮着一座希腊神庙的山墙？标签还写“故宫原生”。' }],
      });
      this.addNPC({
        x: 930, y: 1190, name: '迷路的游客', wander: 0, palette: tourist,
        lines: [{ name: '迷路的游客', text: '我明明买的是故宫的票，怎么一抬头看见了帕特农的柱子？' }],
      });
      this.addNPC({
        x: 480, y: 1030, name: '修复员', wander: 0,
        palette: { robe: '#345d6b', robeDark: '#22414b', robeLight: '#4b7d8c', trim: '#d9b269', hatType: 'cap', hat: '#d9b269', bag: '#5b4127' },
        lines: [{ name: '修复员', text: '先别改故宫本体。等来源校准台把投影标签归位。' }],
      });

      // west fountain
      this.addEntity({
        x: 270, y: 810, baseY: 810,
        draw: (c) => this.drawFountain(c, 270, 810),
      });
      // east red wall / moon gate fragment
      this.addEntity({
        x: 1260, y: 930, baseY: 930,
        draw: (c) => this.drawRedWall(c, 1260, 930),
      });
      this.solid(1190, 842, 140, 90);

      // trees and topiary
      for (const [tx, ty, size] of [[150, 690, 1.15], [150, 860, 1.0], [150, 1000, 1.1], [1280, 690, 1.0], [1280, 820, 1.2], [1290, 1190, 1.0]]) {
        this.addEntity({ x: tx, y: ty, baseY: ty, draw: (c) => A.pine(c, tx, ty, size) });
      }
      for (const [tx, ty, size] of [[430, 620, 1.0], [1010, 620, 1.05], [560, 300, .9], [880, 300, .9]]) {
        this.addEntity({ x: tx, y: ty, baseY: ty, draw: (c) => A.tree(c, tx, ty, size) });
      }

      // Victorian lamps
      for (const [lx, ly] of [[606, 1160], [834, 1160], [606, 720], [834, 720], [460, 300], [980, 300]]) {
        this.addEntity({ x: lx, y: ly, baseY: ly, draw: (c) => this.drawLamp(c, lx, ly) });
      }

      // low hedges at the edges of the lawns
      this.addEntity({
        x: 430, y: 660, baseY: 660,
        draw: (c) => this.drawHedge(c, 430, 660, 150, 16),
      });
      this.addEntity({
        x: 1010, y: 660, baseY: 660,
        draw: (c) => this.drawHedge(c, 1010, 660, 150, 16),
      });

      // a pair of stone planters on the forecourt
      this.addEntity({
        x: 548, y: 1018, baseY: 1018,
        draw: (c) => this.drawPlanter(c, 548, 1018),
      });
      this.addEntity({
        x: 892, y: 1018, baseY: 1018,
        draw: (c) => this.drawPlanter(c, 892, 1018),
      });
      this.solid(530, 1002, 36, 18);
      this.solid(874, 1002, 36, 18);
      // direction signs to the two archives
      this.addEntity({
        x: 604, y: 1128, baseY: 1128,
        draw: (c) => this.drawWaySign(c, 604, 1128, '← 卫城档案'),
      });
      this.addEntity({
        x: 836, y: 1128, baseY: 1128,
        draw: (c) => this.drawWaySign(c, 836, 1128, '故宫档案 →'),
      });

      // two small statues at the lawn edges
      this.addEntity({
        x: 468, y: 1120, baseY: 1120,
        draw: (c) => this.drawStatue(c, 468, 1120, 1),
      });
      this.addEntity({
        x: 972, y: 1120, baseY: 1120,
        draw: (c) => this.drawStatue(c, 972, 1120, -1),
      });
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      c.fillStyle = '#17120e';
      c.fillRect(0, 0, this.w, this.h);

      // base paving: warm Beijing stone plus a colder London edge
      A.paving(c, 20, 20, 1400, 1560, '#c9bfa3', '#b4a98d', 21, 12);
      c.save();
      c.globalAlpha = 0.12;
      c.fillStyle = '#69706d';
      c.fillRect(20, 20, 1400, 220);
      c.fillStyle = '#8d3a2b';
      c.fillRect(20, 1240, 1400, 40);
      c.restore();

      // formal lawns (left = English parterre, right = Chinese garden)
      this.lawn(c, 82, 600, 342, 550, 2);
      this.lawn(c, 1016, 600, 342, 550, 5);

      // central marble axis
      A.paving(c, 646, 300, 148, 1260, '#ddd3bb', '#c7bca2', 9, 10);
      c.fillStyle = 'rgba(139,106,47,.45)';
      c.fillRect(650, 300, 1, 1260);
      c.fillRect(789, 300, 1, 1260);
      for (let y = 380; y < 1510; y += 124) {
        c.save();
        c.translate(720, y);
        c.strokeStyle = 'rgba(139,106,47,.28)';
        c.strokeRect(-11, -11, 22, 22);
        c.beginPath(); c.arc(0, 0, 7, 0, G.TAU); c.stroke();
        c.restore();
      }

      // cross axis in front of the palace
      A.paving(c, 300, 1070, 840, 90, '#d8ceb6', '#c3b79b', 13, 10);

      // palace forecourt: hybrid checker / red carpet line
      A.paving(c, 416, 950, 608, 120, '#d4c9af', '#beb397', 31, 10);
      c.save();
      c.globalAlpha = 0.2;
      c.fillStyle = '#8d3a2b';
      c.fillRect(646, 950, 148, 120);
      c.restore();

      // terminal circular plaza
      c.save();
      c.beginPath(); c.arc(720, 560, 184, 0, G.TAU);
      c.fillStyle = '#d8ceb6'; c.fill();
      c.strokeStyle = '#b5a98e'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(720, 560, 150, 0, G.TAU);
      c.strokeStyle = 'rgba(199,156,84,.65)'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(720, 560, 108, 0, G.TAU);
      c.strokeStyle = 'rgba(63,127,134,.38)'; c.lineWidth = 1; c.stroke();
      for (let i = 0; i < 16; i++) {
        const a = i * G.TAU / 16;
        c.beginPath();
        c.moveTo(720 + Math.cos(a) * 112, 560 + Math.sin(a) * 112);
        c.lineTo(720 + Math.cos(a) * 146, 560 + Math.sin(a) * 146);
        c.strokeStyle = i % 4 ? 'rgba(139,106,47,.2)' : 'rgba(63,127,134,.28)';
        c.stroke();
      }
      c.restore();

      // north garden
      this.lawn(c, 430, 220, 580, 190, 8);
      A.paving(c, 646, 220, 148, 120, '#d0c5aa', '#bbb095', 4, 9);

      // canal bed and banks
      c.fillStyle = '#1d3030';
      c.fillRect(20, 1258, 1400, 48);
      c.fillStyle = '#8fbfb0';
      c.fillRect(20, 1256, 1400, 2);
      c.fillStyle = '#a99d83';
      c.fillRect(20, 1304, 1400, 3);
      for (let x = 24; x < 1420; x += 9) {
        c.fillStyle = 'rgba(230,221,198,.4)';
        c.fillRect(x, 1253, 5, 2);
      }

      // lawn borders / clipped hedges
      c.fillStyle = '#3e5036';
      c.fillRect(76, 594, 354, 8);
      c.fillRect(1010, 594, 354, 8);
      c.fillRect(76, 1146, 354, 8);
      c.fillRect(1010, 1146, 354, 8);
      c.fillRect(76, 594, 8, 560);
      c.fillRect(422, 594, 8, 560);
      c.fillRect(1010, 594, 8, 560);
      c.fillRect(1356, 594, 8, 560);
      for (let x = 92; x < 416; x += 28) {
        c.fillStyle = 'rgba(30,44,25,.22)';
        c.fillRect(x, 598, 11, 6);
      }

      // gravel paths through the parterres
      A.paving(c, 118, 760, 270, 28, '#d2c6a9', '#bdb08f', 18, 8);
      A.paving(c, 118, 900, 270, 24, '#d2c6a9', '#bdb08f', 22, 8);
      A.paving(c, 1060, 760, 250, 24, '#d2c6a9', '#bdb08f', 26, 8);
      A.paving(c, 1060, 900, 250, 28, '#d2c6a9', '#bdb08f', 14, 8);

      // flower beds
      for (const [fx, fy, fw, fh, col] of [
        [150, 820, 34, 16, '#a44538'], [350, 950, 28, 14, '#d7c08b'],
        [1080, 820, 30, 14, '#a44538'], [1230, 950, 36, 16, '#d7c08b'],
      ]) {
        c.fillStyle = '#6d7e4c'; c.fillRect(fx, fy, fw, fh);
        c.fillStyle = col;
        for (let i = 0; i < fw; i += 5) c.fillRect(fx + i + 1, fy + 3 + (i % 3), 2, 2);
      }

      // inlaid brass stars at the terminal
      c.save();
      c.translate(720, 560);
      c.strokeStyle = 'rgba(199,156,84,.5)'; c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * G.TAU / 8 - Math.PI / 2;
        const rr = i % 2 ? 34 : 78;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath(); c.stroke();
      c.restore();
    }

    lawn(c, x, y, w, h, seed) {
      c.fillStyle = '#62784d'; c.fillRect(x, y, w, h);
      c.save();
      c.globalAlpha = 0.18;
      for (let yy = y + 4; yy < y + h; yy += 7) {
        c.fillStyle = ((yy / 7) | 0) % 2 ? '#526a43' : '#71885a';
        c.fillRect(x, yy, w, 2);
      }
      c.restore();
      // geometric gravel ribbons
      c.save();
      c.globalAlpha = 0.65;
      c.strokeStyle = '#c9bd9f'; c.lineWidth = 5;
      c.beginPath();
      c.moveTo(x + 24, y + h - 30);
      c.lineTo(x + w / 2, y + 42);
      c.lineTo(x + w - 24, y + h - 30);
      c.stroke();
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x + 24, y + 70);
      c.lineTo(x + w - 24, y + h - 50);
      c.stroke();
      c.restore();
      // scattered flowers
      for (let i = 0; i < 34; i++) {
        const fx = x + 10 + G.hash(i, seed, 5) * (w - 20);
        const fy = y + 10 + G.hash(i, seed, 9) * (h - 20);
        c.fillStyle = G.hash(i, seed, 2) < .5 ? 'rgba(232,208,163,.4)' : 'rgba(165,69,56,.38)';
        c.fillRect(fx, fy, 1, 1);
      }
    }

    drawGroundExtras(ctx) {
      // canal
      A.water(ctx, 20, 1262, 1400, 40, this.time, 7);
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#c9e2d2';
      for (let i = 0; i < 16; i++) {
        const x = 60 + ((this.time * (8 + i) + i * 87) % 1320);
        ctx.fillRect(x, 1274 + (i % 4) * 6, 7, 1);
      }
      ctx.restore();
      // bridge
      A.bridge(ctx, 720, 1285, 140, {});
      // mist line on the water
      ctx.save();
      const mg = ctx.createLinearGradient(0, 1256, 0, 1312);
      mg.addColorStop(0, 'rgba(186,220,213,0)');
      mg.addColorStop(.48, 'rgba(186,220,213,.18)');
      mg.addColorStop(1, 'rgba(186,220,213,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(20, 1254, 1400, 62);
      ctx.restore();
    }

    drawForeground(ctx) {
      this.drawGlitch(ctx);
    }

    /* ============================================================
       architecture
       ============================================================ */
    drawPalace(c) {
      const x = 720, base = 950;
      A.shadow(c, x, base, 610, 6, 0.34);
      // stone platform
      r(c, x - 312, base - 18, 624, 18, STONE_D);
      r(c, x - 306, base - 20, 612, 4, STONE_L);
      r(c, x - 300, base - 2, 600, 3, '#8f826b');
      // central steps
      for (let i = 0; i < 5; i++) {
        r(c, x - 46 + i * 3, base + i * 2, 92 - i * 6, 2, i % 2 ? STONE : STONE_D);
      }

      if (this.state.repaired) {
        // the projection lifts: the real Chinese side halls are revealed underneath
        this.drawChineseWings(c, x, base);
        r(c, x - 160, base - 186, 142, 12, 'rgba(27,28,24,.72)');
        G.text(c, '卫城参照层 · 已校准', x - 89, base - 177, { size: 6, color: '#c9d6c9', align: 'center' });
      } else {
      // Acropolis projection wings (semi-transparent; the Chinese palace itself is unchanged)
      c.save();
      c.globalAlpha = 0.6;
      for (const side of [-1, 1]) {
        const wx = x + side * 210, ww = 172;
        r(c, wx - ww / 2, base - 126, ww, 108, STONE_D);
        r(c, wx - ww / 2 + 3, base - 123, ww - 6, 102, STONE);
        // rusticated base
        r(c, wx - ww / 2, base - 38, ww, 38, '#c4b79c');
        for (let yy = base - 34; yy < base - 8; yy += 9) {
          r(c, wx - ww / 2 + 2, yy, ww - 4, 1, 'rgba(75,65,49,.22)');
        }
        // pilasters
        for (const px of [wx - ww / 2 + 8, wx - ww / 6, wx + ww / 6, wx + ww / 2 - 8]) {
          r(c, px - 2, base - 121, 5, 90, '#b9ad91');
          r(c, px - 1, base - 121, 2, 90, '#e6dcc5');
          r(c, px - 4, base - 122, 9, 3, '#efe5d0');
        }
        // arched windows
        for (let i = 0; i < 3; i++) {
          const ax = wx - 44 + i * 44;
          const ay = base - 104;
          r(c, ax - 11, ay, 22, 34, '#8f826b');
          r(c, ax - 9, ay + 2, 18, 30, '#5b6665');
          c.save();
          c.fillStyle = '#6f7b78';
          c.beginPath(); c.arc(ax, ay + 2, 9, Math.PI, 0); c.fill();
          c.restore();
          r(c, ax - 8, ay + 4, 16, 1, '#9caea8');
          r(c, ax - 1, ay + 2, 1, 29, '#43504f');
          r(c, ax - 7, ay + 17, 14, 1, '#43504f');
          // warm panes
          r(c, ax - 6, ay + 7, 4, 8, 'rgba(225,174,91,.28)');
        }
        // cornice + slate roof + balustrade
        r(c, wx - ww / 2 - 4, base - 130, ww + 8, 5, '#bba98c');
        c.save();
        c.fillStyle = '#596264';
        c.beginPath();
        c.moveTo(wx - ww / 2 - 10, base - 142);
        c.lineTo(wx, base - 177);
        c.lineTo(wx + ww / 2 + 10, base - 142);
        c.closePath(); c.fill();
        c.strokeStyle = '#87908b'; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(wx - ww / 2 - 5, base - 145);
        c.lineTo(wx, base - 171);
        c.lineTo(wx + ww / 2 + 5, base - 145);
        c.stroke();
        for (let i = -3; i <= 3; i++) {
          c.beginPath();
          c.moveTo(wx + i * 22, base - 145);
          c.lineTo(wx + i * 9, base - 169);
          c.strokeStyle = 'rgba(22,28,28,.35)';
          c.stroke();
        }
        // dormer windows in the slate
        for (const dx of [-ww / 4, ww / 4]) {
          r(c, wx + dx - 8, base - 156, 16, 10, '#3f4949');
          r(c, wx + dx - 6, base - 154, 12, 7, '#8d9d96');
          r(c, wx + dx - 5, base - 153, 10, 1, '#c5d3c8');
          r(c, wx + dx - 1, base - 153, 1, 6, '#596662');
        }
        c.fillStyle = '#d2b16e';
        c.fillRect(wx - 1, base - 181, 3, 7);
        c.restore();
        for (let i = 0; i <= 6; i++) {
          const bx = wx - ww / 2 + 7 + i * (ww - 14) / 6;
          r(c, bx, base - 145, 5, 9, STONE);
          r(c, bx - 1, base - 147, 7, 2, STONE_L);
        }
        // urn on the outer corner
        const ux = wx + side * (ww / 2 - 12);
        r(c, ux - 5, base - 155, 10, 3, '#a99c82');
        r(c, ux - 4, base - 163, 8, 8, '#c5b79c');
        r(c, ux - 2, base - 167, 4, 4, '#d6c8ad');
        r(c, ux - 1, base - 171, 2, 4, '#746a58');
      }
      c.restore();
      // projection tint / scan lines over the wings
      c.save();
      c.globalAlpha = 0.16;
      for (let yy = base - 176; yy < base - 12; yy += 5) {
        c.fillStyle = '#5f9ca8';
        c.fillRect(x - 304, yy, 608, 1);
      }
      c.restore();
      r(c, x - 150, base - 184, 126, 12, 'rgba(25,31,30,.72)');
      G.text(c, '卫城参照层 · 标签错乱', x - 87, base - 175, { size: 6, color: '#b9d7d2', align: 'center' });
      }

      // central Chinese hall — the Forbidden City building itself is not replaced
      A.drawHall(c, x, base - 4, 224, {
        wallH: 46, roofH: 48, double: true, name: '太和殿', bays: 5,
      });

      // translucent western portico, read as a projection over the red hall
      c.save();
      c.globalAlpha = this.state.repaired ? 0.14 : 0.55;
      for (const px of [x - 102, x - 63, x + 63, x + 102]) {
        r(c, px - 4, base - 88, 9, 88, '#b8ab8e');
        r(c, px - 3, base - 88, 5, 88, '#e4d8bf');
        r(c, px - 6, base - 91, 13, 4, '#efe5d0');
        r(c, px - 6, base - 4, 13, 4, '#a99c82');
        for (let yy = base - 78; yy < base - 12; yy += 13) {
          r(c, px - 2, yy, 1, 5, 'rgba(116,103,82,.35)');
        }
      }
      r(c, x - 112, base - 98, 224, 7, '#a99a7d');
      r(c, x - 110, base - 103, 220, 5, '#d3c5a8');
      r(c, x - 108, base - 102, 216, 1, '#f0e4cd');
      for (let i = 0; i < 12; i++) {
        r(c, x - 102 + i * 18, base - 101, 4, 3, '#8f7d60');
      }
      c.restore();

      // red lanterns between the columns
      for (const lx of [x - 83, x + 83]) {
        A.lantern(c, lx, base - 58, { h: 27, color: '#b23d2b' });
      }
      // gold sun motif above the roof ridge
      A.glow(c, x, base - 150, 28, 'rgba(255,203,111,.24)', .4);
      c.strokeStyle = 'rgba(240,205,132,.7)'; c.lineWidth = 1;
      c.beginPath(); c.arc(x, base - 150, 11, 0, G.TAU); c.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i * G.TAU / 8;
        c.beginPath();
        c.moveTo(x + Math.cos(a) * 13, base - 150 + Math.sin(a) * 13);
        c.lineTo(x + Math.cos(a) * 18, base - 150 + Math.sin(a) * 18);
        c.stroke();
      }
    }

    drawChineseWings(c, x, base) {
      // after calibration, the Acropolis projection is lifted and the palace returns
      for (const side of [-1, 1]) {
        const wx = x + side * 205;
        A.drawHall(c, wx, base - 2, 140, {
          wallH: 30, roofH: 28, name: side < 0 ? '西庑' : '东庑', bays: 3,
        });
        // a low red wall and gold beam connect the side hall to the central hall
        const sx = side < 0 ? wx + 82 : wx - 82;
        r(c, sx - 20, base - 24, 40, 12, '#9a3a2b');
        r(c, sx - 20, base - 24, 40, 2, '#d8b26a');
        for (let i = 0; i < 3; i++) r(c, sx - 15 + i * 9, base - 20, 5, 6, '#6b241b');
        // warm window light
        A.glow(c, wx, base - 24, 40, 'rgba(255,201,120,.1)', .35);
      }
    }

    drawAcropolisProjection(c) {
      const x = 330, base = 1230;
      A.shadow(c, x, base, 150, 5, 0.28);
      c.save();
      c.globalAlpha = this.state.repaired ? 0.46 : 0.82;
      // stepped marble base
      for (let i = 0; i < 3; i++) {
        r(c, x - 68 + i * 3, base - 16 + i * 4, 136 - i * 6, 5, i % 2 ? STONE_L : STONE);
      }
      // six Doric columns
      for (let i = 0; i < 6; i++) {
        const cx = x - 54 + i * 22;
        r(c, cx - 4, base - 112, 9, 96, '#d7cbb0');
        r(c, cx - 3, base - 112, 5, 96, '#efe5cf');
        r(c, cx - 6, base - 114, 13, 4, '#b9ac91');
        r(c, cx - 6, base - 20, 13, 5, '#b9ac91');
        r(c, cx - 3, base - 108, 1, 84, 'rgba(139,108,64,.22)');
      }
      // entablature: architrave + triglyph/metope band
      r(c, x - 64, base - 128, 128, 8, '#c7b99e');
      r(c, x - 62, base - 136, 124, 8, '#e2d7bf');
      for (let i = 0; i < 8; i++) {
        r(c, x - 58 + i * 16, base - 135, 7, 6, i % 2 ? '#7c9ca6' : '#c79c54');
      }
      // pediment
      c.save();
      c.fillStyle = '#d9cdb5';
      c.beginPath();
      c.moveTo(x - 70, base - 138);
      c.lineTo(x, base - 178);
      c.lineTo(x + 70, base - 138);
      c.closePath(); c.fill();
      c.strokeStyle = '#a8987a'; c.lineWidth = 1; c.stroke();
      c.fillStyle = 'rgba(79,127,159,.25)';
      c.beginPath();
      c.moveTo(x - 59, base - 139);
      c.lineTo(x, base - 170);
      c.lineTo(x + 59, base - 139);
      c.closePath(); c.fill();
      // small Athena / Nike roundel
      c.strokeStyle = '#c79c54';
      c.beginPath(); c.arc(x, base - 153, 9, 0, G.TAU); c.stroke();
      c.beginPath(); c.moveTo(x, base - 159); c.lineTo(x + 5, base - 151); c.lineTo(x - 5, base - 151); c.closePath(); c.stroke();
      c.restore();
      // roof edge
      r(c, x - 76, base - 180, 152, 3, '#b9ac91');
      // projection scanlines / blue tint
      c.globalAlpha = 0.18;
      for (let yy = base - 176; yy < base - 10; yy += 5) {
        c.fillStyle = '#6fa3ad';
        c.fillRect(x - 74, yy, 148, 1);
      }
      c.globalAlpha = 1;
      // Caryatid porch to the right
      c.globalAlpha = 0.76;
      r(c, x + 70, base - 54, 60, 8, '#cbbfa5');
      r(c, x + 84, base - 96, 32, 7, '#e2d7bf');
      for (let i = 0; i < 3; i++) {
        const cx = x + 78 + i * 17;
        r(c, cx - 3, base - 58, 7, 34, '#e7dcc6');
        r(c, cx - 5, base - 64, 11, 7, '#efe5d0');
        c.fillStyle = '#d8cbb2';
        c.beginPath(); c.arc(cx, base - 68, 4, 0, G.TAU); c.fill();
        r(c, cx - 2, base - 58, 4, 2, '#b9ac91');
      }
      r(c, x + 70, base - 98, 60, 4, '#b9ac91');
      c.globalAlpha = 1;
      c.restore();
      // olive tree projection
      A.tree(c, x - 92, base - 2, 0.8, { color: '#6f7f5d' });
      // label
      r(c, x - 55, base - 204, 110, 14, '#241d1a');
      c.strokeStyle = 'rgba(120,180,178,.55)';
      c.strokeRect(x - 54.5, base - 203.5, 109, 13);
      G.text(c, this.state.repaired ? 'ΠΑΡΘΕΝΩΝ · 参照层已校准' : 'ΠΑΡΘΕΝΩΝ · 卫城投影', x, base - 194, { size: 7, color: '#dfe9df', align: 'center' });
      // archive vitrine (physical, not projection)
      this.drawVitrine(c, x, base + 12, '卫城档案', '#8ea9ad');
    }

    drawObservatory(c) {
      const x = 1110, base = 1110;
      A.shadow(c, x, base, 170, 5, .32);
      // stone terrace
      r(c, x - 84, base - 18, 168, 18, STONE_D);
      r(c, x - 80, base - 20, 160, 4, STONE_L);
      // open red pavilion
      A.drawHall(c, x, base - 6, 138, { wallH: 30, roofH: 36, name: '太和殿东庑', bays: 3 });
      // sundial in front
      A.sundial(c, x - 32, base + 10);
      // archive vitrine
      this.drawVitrine(c, x + 36, base + 13, '故宫档案', '#c7a05a');
      // small red banner
      A.r(c, x - 72, base - 92, 9, 34, '#8e3023');
      A.r(c, x - 70, base - 90, 5, 30, '#b14430');
      for (let i = 0; i < 3; i++) A.r(c, x - 69, base - 82 + i * 8, 3, 1, '#e5c27a');
    }

    drawVitrine(c, x, base, label, accent) {
      // a little glass display case with an archive token inside
      A.shadow(c, x, base, 54, 3, .24);
      r(c, x - 22, base - 30, 44, 29, '#46382a');
      r(c, x - 20, base - 28, 40, 26, 'rgba(178,215,209,.18)');
      r(c, x - 20, base - 28, 40, 1, '#c8e0d6');
      r(c, x - 19, base - 27, 1, 24, 'rgba(220,242,232,.38)');
      r(c, x + 18, base - 27, 1, 24, 'rgba(220,242,232,.25)');
      r(c, x - 13, base - 20, 26, 3, accent);
      r(c, x - 8, base - 16, 16, 9, '#e7ddc2');
      r(c, x - 4, base - 14, 8, 1, '#8b6a3f');
      r(c, x - 4, base - 11, 6, 1, '#8b6a3f');
      r(c, x - 22, base - 3, 44, 3, '#342619');
      G.text(c, label, x, base + 12, { size: 7, color: '#f0d9ae', align: 'center', outline: 'rgba(20,14,9,.85)', outlineWidth: 2 });
    }

    drawTerminal(c) {
      const x = 720, base = 620;
      const ready = this.state.cn && this.state.en;
      const repaired = this.state.repaired;
      // dais
      A.shadow(c, x, base, 190, 7, .28);
      r(c, x - 104, base - 16, 208, 16, STONE_D);
      r(c, x - 98, base - 20, 196, 5, STONE_L);
      c.save();
      c.translate(x, base - 8);
      c.strokeStyle = 'rgba(139,106,47,.48)'; c.lineWidth = 1;
      for (const rr of [34, 56, 84]) {
        c.beginPath(); c.ellipse(0, 0, rr, rr * .22, 0, 0, G.TAU); c.stroke();
      }
      c.restore();
      // side archive pedestals
      for (const [sx, key, col] of [[x - 58, 'cn', '#c79c54'], [x + 58, 'en', '#6d9a9c']]) {
        r(c, sx - 15, base - 34, 30, 18, '#4a3a2a');
        r(c, sx - 12, base - 31, 24, 13, this.state[key] ? col : '#3b332b');
        r(c, sx - 9, base - 46, 18, 14, 'rgba(196,226,216,.15)');
        r(c, sx - 8, base - 45, 16, 1, 'rgba(225,242,232,.5)');
        if (this.state[key]) {
          A.glow(c, sx, base - 39, 28, col === '#c79c54' ? 'rgba(240,196,106,.28)' : 'rgba(110,190,183,.28)', .5);
          G.text(c, key === 'cn' ? '故宫' : '卫城', sx, base - 51, { size: 6, color: '#f0d9ae', align: 'center' });
        }
      }
      // central brass gyroscope
      const cy = base - 92;
      A.glow(c, x, cy, ready ? 86 : 46, repaired ? 'rgba(255,211,126,.3)' : (ready ? 'rgba(106,196,185,.22)' : 'rgba(130,180,180,.1)'), .5);
      c.save();
      c.translate(x, cy);
      for (let i = 0; i < 3; i++) {
        c.save();
        c.rotate(this.time * (i % 2 ? -.22 : .3) + i * .8);
        c.strokeStyle = repaired ? 'rgba(247,218,154,.85)' : 'rgba(199,156,84,.55)';
        c.lineWidth = 1;
        c.beginPath(); c.ellipse(0, 0, 42 - i * 8, 16 + i * 7, i * .7, 0, G.TAU); c.stroke();
        c.restore();
      }
      // glass orb
      const orb = c.createRadialGradient(-4, -6, 2, 0, 0, 18);
      orb.addColorStop(0, repaired ? '#fff4cc' : '#d5ede6');
      orb.addColorStop(.42, repaired ? '#e8bb69' : '#7ab6ae');
      orb.addColorStop(1, 'rgba(38,70,68,.25)');
      c.fillStyle = orb;
      c.beginPath(); c.arc(0, 0, 17, 0, G.TAU); c.fill();
      c.strokeStyle = repaired ? '#f2d38e' : 'rgba(168,214,205,.7)';
      c.beginPath(); c.arc(0, 0, 17, 0, G.TAU); c.stroke();
      c.fillStyle = 'rgba(255,247,222,.8)';
      c.fillRect(-6, -8, 3, 2);
      c.restore();
      // central column and title
      r(c, x - 3, cy + 16, 6, 54, '#4b3a29');
      r(c, x - 5, cy + 64, 10, 5, BRASS_D);
      r(c, x - 19, base - 56, 38, 9, '#2c2117');
      G.text(c, repaired ? '来源已校准' : (ready ? '等待校准' : '来源校准台'), x, base - 49, { size: 7, color: repaired ? '#f5d692' : '#e4d4b3', align: 'center' });
      // floating rings of light when ready
      if (ready) {
        c.save();
        c.globalAlpha = .35 + Math.sin(this.time * 2) * .1;
        c.strokeStyle = repaired ? '#f0cf86' : '#7ac3b7';
        c.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
          c.beginPath();
          c.ellipse(x, cy + 4, 58 + i * 14, 16 + i * 6, this.time * .2 + i, 0, G.TAU);
          c.stroke();
        }
        c.restore();
      }
    }

    drawPortal(c) {
      const x = 720, base = 370;
      const active = this.state.repaired;
      A.shadow(c, x, base, 210, 6, .3);
      // steps
      for (let i = 0; i < 4; i++) r(c, x - 74 + i * 3, base + i * 2, 148 - i * 6, 2, i % 2 ? STONE : STONE_D);
      // columns / jambs
      for (const sx of [x - 86, x + 86]) {
        r(c, sx - 13, base - 122, 26, 122, '#9f927a');
        r(c, sx - 10, base - 120, 20, 118, '#d4c7aa');
        r(c, sx - 12, base - 124, 24, 4, '#efe5d0');
        r(c, sx - 9, base - 4, 18, 4, '#8d8068');
        for (let i = 0; i < 3; i++) r(c, sx - 9, base - 96 + i * 26, 18, 2, 'rgba(113,95,68,.25)');
      }
      // moon gate / arch
      c.save();
      c.beginPath();
      c.arc(x, base - 120, 86, Math.PI, 0);
      c.lineTo(x + 86, base - 4);
      c.lineTo(x - 86, base - 4);
      c.closePath();
      c.fillStyle = '#413528'; c.fill();
      c.strokeStyle = BRASS; c.lineWidth = 2; c.stroke();
      const pg = c.createRadialGradient(x, base - 84, 8, x, base - 84, 80);
      pg.addColorStop(0, active ? 'rgba(255,241,194,.9)' : 'rgba(86,140,134,.24)');
      pg.addColorStop(.5, active ? 'rgba(222,176,94,.35)' : 'rgba(67,111,108,.16)');
      pg.addColorStop(1, 'rgba(20,27,25,0)');
      c.fillStyle = pg;
      c.beginPath(); c.arc(x, base - 84, 78, 0, G.TAU); c.fill();
      c.restore();
      // western pediment above the moon gate
      c.save();
      c.fillStyle = '#cbbda1';
      c.beginPath();
      c.moveTo(x - 112, base - 210);
      c.lineTo(x, base - 252);
      c.lineTo(x + 112, base - 210);
      c.closePath(); c.fill();
      c.strokeStyle = '#8c7b5e'; c.stroke();
      c.fillStyle = '#a9997b';
      c.beginPath();
      c.moveTo(x - 96, base - 211);
      c.lineTo(x, base - 242);
      c.lineTo(x + 96, base - 211);
      c.closePath(); c.fill();
      c.restore();
      // gold sun in the pediment
      A.glow(c, x, base - 226, 20, 'rgba(255,205,118,.18)', .4);
      c.strokeStyle = BRASS; c.lineWidth = 1;
      c.beginPath(); c.arc(x, base - 226, 10, 0, G.TAU); c.stroke();
      // plaque
      r(c, x - 39, base - 204, 78, 14, '#2b2117');
      c.strokeStyle = 'rgba(216,178,106,.6)'; c.strokeRect(x - 38.5, base - 203.5, 77, 13);
      G.text(c, '创作终端', x, base - 193, { size: 7, color: active ? '#f5d692' : '#a9997e', align: 'center' });
      // approach path glow
      if (active) {
        A.glow(c, x, base - 76, 70, 'rgba(240,196,106,.16)', .35);
      }
    }

    drawSouthGate(c) {
      A.drawGate(c, 720, 1580, 300, {
        wallH: 42, roofH: 50, double: true, arches: 3, name: '午门',
      });
      // Victorian lamps flanking the Chinese gate
      this.drawLamp(c, 558, 1550, 1.1);
      this.drawLamp(c, 882, 1550, 1.1);
      // a small brass plate at the threshold
      A.r(c, 690, 1550, 60, 7, '#2a2118');
      G.text(c, 'NEXUS  ·  ATHENS / GUGONG', 720, 1556, { size: 5, color: '#cda865', align: 'center' });
    }

    drawFountain(c, x, base) {
      A.shadow(c, x, base, 116, 5, .28);
      c.save();
      c.fillStyle = '#b6aa8e';
      c.beginPath(); c.ellipse(x, base - 20, 52, 24, 0, 0, G.TAU); c.fill();
      c.fillStyle = '#7e9c92';
      c.beginPath(); c.ellipse(x, base - 21, 44, 18, 0, 0, G.TAU); c.fill();
      c.fillStyle = 'rgba(212,235,222,.5)';
      c.beginPath(); c.ellipse(x, base - 25, 34, 11, 0, 0, G.TAU); c.fill();
      c.restore();
      // tiered centre
      r(c, x - 9, base - 54, 18, 30, '#c2b69a');
      r(c, x - 15, base - 58, 30, 5, '#d9ceb5');
      r(c, x - 22, base - 70, 44, 8, '#c8bca0');
      r(c, x - 18, base - 74, 36, 3, '#e9dfc8');
      // water jets
      c.save();
      c.strokeStyle = 'rgba(196,231,224,.5)'; c.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = i * G.TAU / 6 + this.time * .3;
        c.beginPath();
        c.moveTo(x, base - 76);
        c.quadraticCurveTo(x + Math.cos(a) * 20, base - 102, x + Math.cos(a) * 34, base - 78);
        c.stroke();
      }
      c.restore();
      A.glow(c, x, base - 82, 28, 'rgba(186,229,221,.14)', .4);
    }

    drawRedWall(c, x, base) {
      // a Chinese wall fragment embedded in the western garden
      A.shadow(c, x, base, 150, 4, .25);
      r(c, x - 70, base - 92, 140, 92, '#8f3325');
      r(c, x - 67, base - 89, 134, 86, '#aa4432');
      for (let xx = x - 60; xx < x + 60; xx += 22) {
        r(c, xx, base - 84, 1, 78, 'rgba(77,26,18,.28)');
        r(c, xx + 1, base - 80, 1, 1, 'rgba(238,190,121,.25)');
      }
      // golden eave
      r(c, x - 82, base - 100, 164, 9, '#7f5327');
      r(c, x - 78, base - 104, 156, 6, '#c58a36');
      r(c, x - 70, base - 108, 140, 5, '#dda94a');
      for (let xx = x - 72; xx < x + 70; xx += 9) r(c, xx, base - 109, 5, 2, '#f0c870');
      // moon gate
      c.save();
      c.fillStyle = '#2b1a12';
      c.beginPath(); c.arc(x, base - 36, 25, 0, G.TAU); c.fill();
      c.strokeStyle = '#d8b26a'; c.lineWidth = 1;
      c.beginPath(); c.arc(x, base - 36, 25, 0, G.TAU); c.stroke();
      c.restore();
      G.text(c, '月洞', x, base - 12, { size: 6, color: '#e6c78e', align: 'center' });
    }

    drawPlanter(c, x, base) {
      A.shadow(c, x, base, 38, 3, .22);
      r(c, x - 18, base - 24, 36, 22, '#8f836c');
      r(c, x - 15, base - 22, 30, 19, '#b3a58a');
      r(c, x - 17, base - 27, 34, 4, '#d1c5ab');
      r(c, x - 12, base - 21, 24, 2, '#6f634f');
      // clipped cypress
      r(c, x - 2, base - 54, 4, 30, '#4d5f3d');
      for (let i = 0; i < 4; i++) {
        const ww = 18 - i * 3;
        r(c, x - ww / 2, base - 46 - i * 8, ww, 5, i % 2 ? '#587247' : '#49613c');
      }
      r(c, x - 3, base - 64, 6, 6, '#63794c');
      // flowers at the base
      for (const [dx, col] of [[-11, '#a94b3d'], [10, '#d5b877'], [-16, '#d5b877']]) {
        r(c, x + dx, base - 20, 2, 2, col);
      }
      G.text(c, 'NEXUS', x, base + 8, { size: 5, color: '#d6c6a5', align: 'center' });
    }

    drawWaySign(c, x, base, label) {
      A.shadow(c, x, base, 50, 2, .22);
      r(c, x - 1, base - 34, 3, 34, '#4a3220');
      r(c, x - 24, base - 50, 48, 15, '#332317');
      r(c, x - 22, base - 48, 44, 11, '#6d4a2c');
      r(c, x - 21, base - 47, 42, 1, '#b68a50');
      G.text(c, label, x, base - 39, { size: 5, color: '#f0d8a8', align: 'center' });
    }

    drawStatue(c, x, base, flip) {
      const s = flip || 1;
      A.shadow(c, x, base, 28, 3, .24);
      r(c, x - 16, base - 30, 32, 30, '#a99c82');
      r(c, x - 13, base - 27, 26, 25, '#d4c8ae');
      r(c, x - 15, base - 33, 30, 4, '#e6dcc5');
      // classical robed figure
      r(c, x - 8, base - 58, 16, 27, '#eee5d2');
      r(c, x - 6, base - 55, 12, 22, '#d9cdb5');
      r(c, x - 9, base - 64, 18, 8, '#e8dfca');
      c.fillStyle = '#d6c8ac';
      c.beginPath(); c.arc(x, base - 68, 6, 0, G.TAU); c.fill();
      r(c, x - 4, base - 72, 8, 3, '#8c7a5d');
      r(c, x + s * 8, base - 56, 3, 22, '#e2d7c0');
      r(c, x - 10, base - 48, 5, 17, '#e2d7c0');
      r(c, x - 17, base - 58, 12, 3, '#b8a78a');
      G.text(c, 'NEXUS', x, base + 12, { size: 5, color: '#d8c5a3', align: 'center' });
    }

    drawLamp(c, x, base, scale) {
      const s = scale || 1;
      A.shadow(c, x, base, 18 * s, 2, .22);
      r(c, x - 2 * s, base - 48 * s, 4 * s, 46 * s, '#30302b');
      r(c, x - 5 * s, base - 2, 10 * s, 2, '#23231f');
      r(c, x - 7 * s, base - 56 * s, 14 * s, 8 * s, '#b89755');
      r(c, x - 5 * s, base - 55 * s, 10 * s, 6 * s, 'rgba(255,221,143,.7)');
      r(c, x - 2 * s, base - 60 * s, 4 * s, 2, '#e8ca85');
      A.glow(c, x, base - 54 * s, 24 * s, 'rgba(255,196,103,.2)', .4);
    }

    drawHedge(c, x, base, w, h) {
      A.shadow(c, x, base, w, 2, .18);
      r(c, x - w / 2, base - h, w, h, '#3f5336');
      r(c, x - w / 2, base - h, w, 3, '#587047');
      for (let i = 0; i < w; i += 7) {
        r(c, x - w / 2 + i, base - h + 3, 4, 2, '#6d8355');
        r(c, x - w / 2 + i + 3, base - 4, 2, 3, '#526a43');
      }
    }

    /* ============================================================
       glitch / screen
       ============================================================ */
    drawGlitch(ctx) {
      if (this.state.repaired && this.time - this.repairAge > 4) return;
      const fade = this.state.repaired ? Math.max(0, 1 - (this.time - this.repairAge) / 1.2) : 1;
      const items = [
        { x: 548, y: 820, type: 'column' },
        { x: 900, y: 810, type: 'eave' },
        { x: 720, y: 800, type: 'clock' },
        { x: 490, y: 965, type: 'roof' },
        { x: 950, y: 990, type: 'window' },
      ];
      ctx.save();
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const a = (0.2 + Math.sin(this.time * 1.4 + i) * 0.06) * fade;
        const ox = Math.sin(this.time * .9 + i) * 6;
        ctx.globalAlpha = a;
        ctx.strokeStyle = i % 2 ? '#8dcfc5' : '#f0cf91';
        ctx.lineWidth = 1.5;
        if (it.type === 'column') {
          for (let yy = it.y - 60; yy < it.y + 30; yy += 4) {
            ctx.strokeRect(it.x + ox, yy, 13, 3);
          }
          ctx.beginPath(); ctx.moveTo(it.x + ox + 2, it.y - 64); ctx.lineTo(it.x + ox + 9, it.y - 76); ctx.stroke();
        } else if (it.type === 'eave') {
          for (let k = 0; k < 5; k++) {
            ctx.beginPath();
            ctx.moveTo(it.x + ox - 44 + k * 8, it.y + k * 4);
            ctx.lineTo(it.x + ox + 44 - k * 8, it.y + k * 4);
            ctx.stroke();
          }
        } else if (it.type === 'clock') {
          ctx.beginPath(); ctx.arc(it.x + ox, it.y, 28, 0, G.TAU); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(it.x + ox, it.y); ctx.lineTo(it.x + ox + 11, it.y - 12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(it.x + ox, it.y); ctx.lineTo(it.x + ox - 5, it.y + 15); ctx.stroke();
        } else if (it.type === 'roof') {
          ctx.beginPath();
          ctx.moveTo(it.x + ox - 50, it.y);
          ctx.lineTo(it.x + ox, it.y - 40);
          ctx.lineTo(it.x + ox + 50, it.y);
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(it.x + ox - 42, it.y + 7); ctx.lineTo(it.x + ox, it.y - 27); ctx.lineTo(it.x + ox + 42, it.y + 7); ctx.stroke();
        } else {
          ctx.strokeRect(it.x + ox, it.y - 30, 42, 42);
          ctx.beginPath(); ctx.moveTo(it.x + ox + 21, it.y - 30); ctx.lineTo(it.x + ox + 21, it.y + 12); ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawScreen(ctx) {
      // drifting mist from the canal
      const mistY = 1262 - this.cam.y;
      ctx.save();
      const mg = ctx.createLinearGradient(0, mistY - 50, 0, mistY + 80);
      mg.addColorStop(0, 'rgba(186,218,211,0)');
      mg.addColorStop(.5, this.state.repaired ? 'rgba(240,209,141,.06)' : 'rgba(186,218,211,.12)');
      mg.addColorStop(1, 'rgba(186,218,211,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(0, mistY - 50, G.W, 130);
      ctx.restore();

      // cross-cultural light: cool while unstable, warm once the labels are calibrated
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const wg = ctx.createLinearGradient(0, 0, G.W, G.H);
      if (this.state.repaired) {
        wg.addColorStop(0, 'rgba(255,214,143,.12)');
        wg.addColorStop(.6, 'rgba(255,190,102,.05)');
        wg.addColorStop(1, 'rgba(155,58,43,.06)');
      } else {
        wg.addColorStop(0, 'rgba(92,151,169,.16)');
        wg.addColorStop(.55, 'rgba(240,197,115,.06)');
        wg.addColorStop(1, 'rgba(155,58,43,.1)');
      }
      ctx.fillStyle = wg;
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.restore();

      // a visible calibration pulse at the nexus / plaza
      if (this.state.repaired) {
        const age = this.time - this.repairAge;
        if (age < 3.2) {
          const cx = 720 - this.cam.x;
          const cy = 560 - this.cam.y;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(0, 0.45 - age * 0.13);
          ctx.strokeStyle = '#f5d295';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy, 30 + age * 150, 0, G.TAU); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, 16 + age * 110, 0, G.TAU); ctx.stroke();
          ctx.restore();
        }
        // long warm light shafts from the terminal
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#ffd99a';
        ctx.beginPath();
        ctx.moveTo(720 - this.cam.x, 560 - this.cam.y);
        ctx.lineTo(-80, G.H);
        ctx.lineTo(190, G.H);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(720 - this.cam.x, 560 - this.cam.y);
        ctx.lineTo(G.W - 190, G.H);
        ctx.lineTo(G.W + 80, G.H);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // unstable scanline ripples
      if (!this.state.repaired) {
        ctx.save();
        ctx.globalAlpha = .12;
        for (let i = 0; i < 4; i++) {
          const y = (this.time * 26 + i * 71) % G.H;
          ctx.fillStyle = i % 2 ? '#8cd2c4' : '#e7b96d';
          ctx.fillRect(0, y, G.W, 1);
        }
        ctx.restore();
      }

      // repair flash
      if (this.flash > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,225,164,' + (this.flash * .22) + ')';
        ctx.fillRect(0, 0, G.W, G.H);
        ctx.restore();
      }

      // vignette
      const vg = ctx.createRadialGradient(320, 170, 150, 320, 180, 390);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(8,6,4,.34)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, G.W, G.H);
    }

    updateAmbient(dt) {
      this.flash = Math.max(0, this.flash - dt * 1.4);
      if (Math.random() < dt * 2.4) {
        const x = this.cam.x + G.rand(0, G.W);
        const y = this.cam.y + G.rand(0, G.H);
        G.fx.add({
          x, y, vx: G.rand(-3, 5), vy: G.rand(-9, -2),
          life: G.rand(1.8, 3.6), size: 1,
          color: this.state.repaired ? 'rgba(248,214,151,.45)' : 'rgba(167,218,207,.38)',
          grav: -1, glow: false,
        });
      }
      if (!this.state.repaired && Math.random() < dt * 1.1) {
        const p = G.pick([[560, 760], [940, 700], [1030, 960], [390, 930]]);
        G.fx.add({
          x: p[0] + G.rand(-20, 20), y: p[1] + G.rand(-20, 20),
          vx: G.rand(-8, 8), vy: G.rand(-16, -4),
          life: G.rand(.3, .8), size: 1, color: 'rgba(119,207,197,.45)', glow: true,
        });
      }
    }

    /* ============================================================
       interactions
       ============================================================ */
    takeArchive(kind) {
      if (G.dialog.active || G.difficulty.active) return;
      if (G.archiveGame && G.archiveGame.active) return;
      if (!G.archiveGame) { this.collectArchive(kind); return; }
      const n = kind === 'cn' ? '榫卯合拢' : '回纹凿刻';
      const already = !!this.state[kind];
      G.dialog.ask({
        name: '旅行手账',
        text: already
          ? '「' + n + '」已经收进档案夹。要再挑战一次吗？（可无限次玩）'
          : '档案封在一道非遗小游戏后面。是否现在挑战「' + n + '」？',
        options: [{ label: '是', value: true }, { label: '否', value: false }],
      }, (ok) => {
        if (ok) {
          if (G.difficulty) {
            G.difficulty.open(kind, (diff) => {
              if (!this.state[kind]) G.archiveGame.open(kind, diff, () => this.collectArchive(kind));
              else G.archiveGame.open(kind, diff);
            });
          } else {
            G.archiveGame.open(kind, 'hard', () => {
              if (!this.state[kind]) this.collectArchive(kind);
            });
          }
        } else {
          G.dialog.show([{ name: '旅行手账', text: '好，那先不打扰。档案随时可以再来挑战。' }]);
        }
      });
    }

    collectArchive(kind) {
      if (this.state[kind]) return;
      this.state[kind] = true;
      G.audio.sfx('pickup');
      G.fx.burst(kind === 'cn' ? 1110 : 330, 1120, 26, { min: 10, max: 50, color: kind === 'cn' ? '#efc777' : '#8cd4c8', life: .9 });
      const lines = kind === 'cn' ? [
        { name: '故宫档案 · 中轴简图', text: '合上最后一道榫卯，档案匣打开了。中国传统木结构建筑营造技艺，靠榫与卯的咬合让木构不用一钉。' },
        { name: '故宫档案 · 中轴简图', text: '图上标着午门—太和殿—乾清宫的序列。每一道门阙都在提醒你：正在进入中心。' },
        { name: '狄奥提玛', text: '这是故宫自己的空间叙事。它和卫城的“入口—胜利—主神”不是同一套秩序。' },
        { name: '旅行手账', text: '（你把故宫档案收进档案夹。）' },
      ] : [
        { name: '卫城档案 · 帕特农与女像柱', text: '最后一道石纹凿成，档案匣打开了。提诺斯的大理石雕刻技艺，把石头的纹理、接缝与光影一起留在建筑上。' },
        { name: '卫城档案 · 帕特农与女像柱', text: '档案里有帕特农东山墙、伊瑞克提翁女像柱，还有一件舞乐图瓶画器盖的线图。' },
        { name: '狄奥提玛', text: '这些是参照层，不是被搬进故宫的实物。我们要标清来源，而不是让它们冒充故宫原生。' },
        { name: '旅行手账', text: '（你把卫城档案收进档案夹。）' },
      ];
      G.unlock(kind === 'cn' ? 'sundial' : 'coxclock');
      G.unlock(kind === 'cn' ? 'ich_mortise' : 'ich_marble');
      G.dialog.show(lines, () => this.refreshObjective());
      this.refreshObjective();
    }

    useTerminal() {
      if (G.dialog.active || G.cinema.active) return;
      const s = this.state;
      if (!s.cn || !s.en) {
        G.dialog.show([
          { name: '来源校准台', text: '两个档案槽还空着。故宫档案与卫城档案，需要同时放入。' },
          { name: '狄奥提玛', text: '别急。先让两套材料都到这里来。' },
        ]);
        return;
      }
      if (s.repaired) {
        if (!s.verified) {
          if (G.sourceQuiz && !G.sourceQuiz.active) {
            G.sourceQuiz.open(() => this.verifySources());
          }
          return;
        }
        G.dialog.show([
          { name: '来源校准台', text: '三条来源判断都已完成。创作终端已开启。' },
        ]);
        return;
      }
      G.audio.sfx('confirm');
      G.cinema.play([
        { text: '来源校准 · 标签归位', sub: 'SOURCE CALIBRATION · RESTORE THE LABEL', ms: 1600 },
        { text: '系统误标：帕特农山墙', sub: '不是故宫原生装饰，是卫城参照层', ms: 1900 },
        { text: '可合理对照：宴乐图像', sub: '舞乐图瓶画 × 韩熙载夜宴图', ms: 1900 },
        { text: '传播有中介，不等于直接相连', sub: '靖远银盘 · 隋墓骆驼 · 不等于这两件作品', ms: 2100 },
      ], () => this.finishRepair());
    }

    finishRepair() {
      if (this.state.repaired) return;
      this.state.repaired = true;
      this.repairAge = this.time;
      this.flash = 1;
      this.dateLabel = '来源标签已校准';
      this.updateHud();
      G.fx.shake(3, .55);
      G.fx.burst(720, 560, 60, { min: 20, max: 110, color: '#f4d08a', life: 1.2 });
      G.unlock('nexus');
      this.refreshObjective();
      G.ui.toast('投影退去 · 故宫显现 · 请完成来源判断', 'good', 3600);
      this.saveProgress();
    }

    enterPortal() {
      if (G.dialog.active || G.cinema.active) return;
      if (!this.state.repaired) {
        G.dialog.show([
          { name: '创作终端', text: '终端没有亮。它还在等待一次来源校准。' },
          { name: '狄奥提玛', text: '先去中央的来源校准台，把两份档案和投影标签放回正确的位置。' },
        ]);
        return;
      }
      if (!this.state.verified) {
        G.dialog.show([
          { name: '创作终端', text: '来源校准已完成，但来源判断还是空的。' },
          { name: '狄奥提玛', text: '回校准台，把那三条来源卡看完。否则我们只是在造一张漂亮的错图。' },
        ]);
        return;
      }
      if (this.state.completed) {
        G.dialog.show([
          { name: '创作终端', text: '门后是你刚刚完成的第一块融合区域。它安静地亮着，等你下一次动手。' },
        ]);
        return;
      }
      this.state.completed = true;
      G.audio.sfx('confirm');
      this.refreshObjective();
      G.cinema.play([
        { text: '第一境 · 投影错位', sub: 'THE NEXUS ATLAS · ATHENS / GUGONG', ms: 1700 },
        { text: '故宫没有被替换', sub: '你只是把卫城参照层放回了说明卡里', ms: 2000 },
        { text: '创作终端已点亮', sub: '下一次，换你来造境', ms: 1900 },
      ], () => {
        this.saveProgress();
        G.dialog.show([
          { name: '狄奥提玛', text: '这一次，你不只是修好了灵境，也为它添上了自己的故事。' },
          { name: '狄奥提玛', text: '现在，让下一位来客走进你的世界吧。' },
          { name: '旅行手账', text: '（第一境完成。神武门出口已点亮，南门可以离开灵境，按 H 可以回大厅。）' },
        ], () => G.ui.toast('第一境完成 · 蓝图已保存', 'good', 3200));
      });
    }

    verifySources() {
      if (this.state.verified) return;
      this.state.verified = true;
      G.unlock('sourcecard');
      this.refreshObjective();
      G.audio.sfx('success');
      G.ui.toast('来源判断完成 · 创作终端已开启', 'good', 3200);
    }

    saveProgress() {
      G.save.flag('fusionDone', true);
      G.save.persist();
    }

    /* ============================================================
       map
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

    draw(ctx) {
      if (this.mapOpen) {
        this.drawMap(ctx);
        return;
      }
      super.draw(ctx);
    }

    drawMap(ctx) {
      ctx.fillStyle = '#0b0907';
      ctx.fillRect(0, 0, G.W, G.H);
      const mx = 108, my = 34, mw = 424, mh = 292;
      const paper = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
      paper.addColorStop(0, '#e9dcc0');
      paper.addColorStop(.55, '#ddceb0');
      paper.addColorStop(1, '#cfc09f');
      ctx.fillStyle = paper;
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = '#8b6c40'; ctx.lineWidth = 2;
      ctx.strokeRect(mx + 2, my + 2, mw - 4, mh - 4);
      ctx.strokeStyle = 'rgba(139,108,64,.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(mx + 8, my + 8, mw - 16, mh - 16);

      G.text(ctx, '万象灵境 · 雅典—故宫', mx + 18, my + 30, { size: 13, color: '#4a3421', weight: 'bold' });
      G.text(ctx, 'ATHENS / GUGONG · PROJECTION LAYER  ·  档案 ' + ((this.state.cn ? 1 : 0) + (this.state.en ? 1 : 0)) + '/2', mx + 19, my + 42, { size: 6, color: '#8b6c40' });
      G.text(ctx, 'M / 点击关闭', mx + mw - 18, my + 28, { size: 7, color: '#7a5b35', align: 'right' });

      // centered square plan
      const bx = mx + 40, by = my + 58, bp = 196;
      // lawns
      ctx.fillStyle = 'rgba(91,116,75,.32)';
      ctx.fillRect(bx + 16, by + 56, 34, 92);
      ctx.fillRect(bx + bp - 50, by + 56, 34, 92);
      // central axis
      ctx.strokeStyle = 'rgba(156,111,50,.55)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + bp / 2, by + 10); ctx.lineTo(bx + bp / 2, by + bp - 8); ctx.stroke();
      // canal / bridge
      ctx.fillStyle = 'rgba(63,127,134,.28)';
      ctx.fillRect(bx + 12, by + 150, bp - 24, 12);
      ctx.strokeStyle = 'rgba(244,238,224,.85)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(bx + bp / 2 - 12, by + 152); ctx.lineTo(bx + bp / 2 + 12, by + 152); ctx.stroke();
      // palace
      ctx.fillStyle = '#a94935'; ctx.fillRect(bx + bp / 2 - 46, by + 78, 92, 26);
      ctx.fillStyle = '#d4a34e'; ctx.fillRect(bx + bp / 2 - 52, by + 74, 104, 5);
      G.text(ctx, '太和殿', bx + bp / 2, by + 95, { size: 7, color: '#fff0cc', align: 'center' });
      // clock tower (west)
      ctx.fillStyle = '#7f8580'; ctx.fillRect(bx + 18, by + 62, 18, 46);
      ctx.fillStyle = '#5b6566'; ctx.beginPath(); ctx.moveTo(bx + 15, by + 62); ctx.lineTo(bx + 27, by + 44); ctx.lineTo(bx + 40, by + 62); ctx.fill();
      ctx.strokeStyle = '#c79c54'; ctx.beginPath(); ctx.arc(bx + 27, by + 74, 7, 0, G.TAU); ctx.stroke();
      // observatory (east)
      ctx.fillStyle = '#a94935'; ctx.fillRect(bx + bp - 44, by + 62, 26, 42);
      ctx.fillStyle = '#d4a34e'; ctx.fillRect(bx + bp - 49, by + 58, 36, 6);
      // terminal
      ctx.strokeStyle = '#9b7338'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx + bp / 2, by + 36, 17, 0, G.TAU); ctx.stroke();
      ctx.fillStyle = this.state.repaired ? '#e4bb71' : '#8ebbb2';
      ctx.beginPath(); ctx.arc(bx + bp / 2, by + 36, 5, 0, G.TAU); ctx.fill();
      // creation portal (north, top)
      ctx.strokeStyle = '#c79c54'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx + bp / 2, by + 12, 9, Math.PI, 0); ctx.stroke();
      // labels — placed outside the plan so nothing overlaps
      G.text(ctx, '帕特农投影 · 卫城档案', bx + 8, by + 120, { size: 7, color: '#4d3825' });
      G.text(ctx, '太和殿东庑 · 故宫档案', bx + bp + 8, by + 120, { size: 7, color: '#4d3825', align: 'right' });
      G.text(ctx, '创作终端', bx + bp / 2, by + 2, { size: 7, color: '#4d3825', align: 'center' });
      G.text(ctx, '来源校准台', bx + bp / 2, by + 64, { size: 7, color: '#4d3825', align: 'center' });
      G.text(ctx, '御路 · 金水河', bx + bp / 2, by + 180, { size: 7, color: '#4d3825', align: 'center' });

      // right-hand archive checklist
      const lx = bx + bp + 34;
      ctx.strokeStyle = 'rgba(139,108,64,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx - 10, by + 26); ctx.lineTo(lx - 10, by + 164); ctx.stroke();
      G.text(ctx, '档案清单', lx, by + 26, { size: 7, color: '#6b4d2e' });
      const rows = [
        ['故宫档案', this.state.cn],
        ['卫城档案', this.state.en],
        ['来源校准', this.state.repaired],
        ['来源判断', this.state.verified],
      ];
      rows.forEach(([label, done], i) => {
        const yy = by + 48 + i * 26;
        ctx.strokeStyle = done ? '#9b7338' : 'rgba(118,94,63,.6)';
        ctx.beginPath(); ctx.arc(lx + 4, yy - 2, 4, 0, G.TAU); ctx.stroke();
        if (done) {
          ctx.fillStyle = '#9b7338';
          ctx.beginPath(); ctx.arc(lx + 4, yy - 2, 2, 0, G.TAU); ctx.fill();
        }
        G.text(ctx, label, lx + 14, yy, { size: 7, color: done ? '#5d4327' : '#806a4b' });
      });
      G.text(ctx, this.state.completed ? '第一境 · 完成' : '第一境 · 校准中', lx, by + 136, {
        size: 7, color: this.state.completed ? '#9b7338' : '#806a4b',
      });
      // compass
      ctx.strokeStyle = 'rgba(139,108,64,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(lx + 20, by + 172, 11, 0, G.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx + 20, by + 162); ctx.lineTo(lx + 16, by + 174); ctx.lineTo(lx + 20, by + 170); ctx.lineTo(lx + 24, by + 174); ctx.closePath();
      ctx.fillStyle = 'rgba(139,108,64,.7)'; ctx.fill();
      G.text(ctx, '北', lx + 20, by + 190, { size: 6, color: '#6b4d2e', align: 'center' });

      // player
      const ppx = Math.max(bx + 12, Math.min(bx + bp - 12, bx + (this.player.x / this.w) * bp));
      const ppy = Math.max(by + 12, Math.min(by + bp - 12, by + (this.player.y / this.h) * bp));
      ctx.fillStyle = '#a33c2b';
      ctx.beginPath(); ctx.arc(ppx, ppy, 4, 0, G.TAU); ctx.fill();
      ctx.strokeStyle = '#fff0ce'; ctx.lineWidth = 1; ctx.stroke();
      if (this.marker) {
        const tx = Math.max(bx + 12, Math.min(bx + bp - 12, bx + (this.marker.x / this.w) * bp));
        const ty = Math.max(by + 12, Math.min(by + bp - 12, by + (this.marker.y / this.h) * bp));
        ctx.strokeStyle = '#9b7338'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(tx, ty, 7 + Math.sin(this.time * 3) * 2, 0, G.TAU); ctx.stroke();
        ctx.fillStyle = '#9b7338';
        ctx.fillRect(tx - 2, ty - 2, 4, 4);
      }

      // legend
      ctx.fillStyle = 'rgba(78,56,35,.7)';
      ctx.fillRect(mx + 18, my + mh - 30, mw - 36, 1);
      G.text(ctx, '● 当前位置', mx + 22, my + mh - 16, { size: 7, color: '#6b2a1f' });
      G.text(ctx, '○ 目标', mx + 96, my + mh - 16, { size: 7, color: '#9b7338' });
      G.text(ctx, '▲ 北', mx + mw - 22, my + mh - 16, { size: 7, color: '#6b4d2e', align: 'right' });
    }
  }

  G.FusionScene = FusionScene;
})();
