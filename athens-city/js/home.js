/* ============================================================
   雅典 · 圣火 — 家 · 庭院
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const P = A.pal;

  class HomeScene extends G.WorldScene {
    constructor() {
      super({
        id: 'home', w: 960, h: 620, spawn: { x: 450, y: 420 },
        clock: '17:10', ambient: 'palace', lookAhead: 60, gradeStrength: 0.5,
      });
      this.title = '家 · 庭院';
      this.marker = { x: 365, y: 300 };
      this.visitedCraft = false;
      this.visitedRepair = false;
      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    onEnter() {
      G.ui.location('家', '庭院');
      G.ui.setHomeButton(true);
      this.clock = '17:10';
      this.updateHud();
      this.refreshObjective();
      G.audio.ambient('palace');
      if (!G.save.flag('homeIntroSeen')) {
        G.save.data.flags.homeIntroSeen = true;
        G.save.persist();
        setTimeout(() => {
          if (G.scene !== this) return;
          G.dialog.show([
            { name: '旅行手账', narrator: true, text: '推开院门，地上有一圈马赛克拼的海豚，被夕阳照得发亮。' },
            { name: '旅行手账', narrator: true, text: '靠墙的两张台子一新一旧，像是等了你很久。' },
          ]);
        }, 500);
      }
    }

    exit() {
      G.ui.setHomeButton(false);
      G.ui.prompt(null);
    }

    refreshObjective() {
      if (this.visitedCraft && this.visitedRepair) {
        this.objective('两张台子都看过了 · 从大门出去，回到刚才的地方');
        this.marker = { x: 450, y: 548 };
      } else if (!this.visitedCraft) {
        this.objective('看看庭院 · 左边是铜匠台，右边是修复台');
        this.marker = { x: 365, y: 300 };
      } else {
        this.objective('铜匠台看过了 · 再去右边的修复台看看');
        this.marker = { x: 535, y: 300 };
      }
    }

    /* ============================================================
       build
       ============================================================ */
    build() {
      // room shell
      this.solid(80, 180, 800, 90);
      this.solid(80, 180, 28, 430);
      this.solid(852, 180, 28, 430);
      this.solid(80, 590, 800, 30);

      // two stations
      this.craftBench = { x: 365, y: 350 };
      this.repairBench = { x: 535, y: 350 };
      this.addEntity({
        x: 365, y: 350, baseY: 350,
        draw: (c) => this.drawCraftBench(c, 365, 350),
      });
      this.addEntity({
        x: 535, y: 350, baseY: 350,
        draw: (c) => this.drawRepairBench(c, 535, 350),
      });
      this.solid(312, 270, 106, 82);
      this.solid(482, 270, 106, 82);
      this.addInteract({
        x: 365, y: 372, r: 48, label: '使用铜匠台',
        action: () => this.useCraftBench(),
      });
      this.addInteract({
        x: 535, y: 372, r: 48, label: '使用修复台',
        action: () => this.useRepairBench(),
      });

      // amphora shelf
      this.addEntity({
        x: 180, y: 332, baseY: 332,
        draw: (c) => this.drawCabinet(c, 180, 332),
      });
      this.solid(128, 300, 105, 32);

      // low table and cushions
      this.addEntity({
        x: 696, y: 452, baseY: 452,
        draw: (c) => this.drawTeaTable(c, 696, 452),
      });
      this.solid(646, 430, 100, 24);

      // mosaic panel on a stand
      this.addEntity({
        x: 800, y: 404, baseY: 404,
        draw: (c) => this.drawScreen(c, 800, 404),
      });
      this.solid(760, 388, 80, 20);

      // potted olive
      this.addEntity({
        x: 168, y: 540, baseY: 540,
        draw: (c) => this.drawOlivePot(c, 168, 540),
      });
      this.solid(150, 528, 36, 14);

      // door
      this.addEntity({
        x: 450, y: 590, baseY: 590,
        draw: (c) => this.drawDoor(c, 450, 590),
      });
      this.addInteract({
        x: 450, y: 554, r: 52, label: '出门 · 回到刚才的地方',
        action: () => G.leaveHome(),
      });

      // cat on the rug
      this.addEntity({
        x: 560, y: 452, baseY: 452,
        draw: (c) => A.cat(c, 560, 452, this.time, { color: '#c58448' }),
      });
      this.addInteract({
        x: 560, y: 458, r: 30, label: '摸摸院子里的猫',
        action: () => {
          G.audio.sfx('pickup');
          G.dialog.show([
            { name: '猫', text: '（它把脑袋往你手心里顶，尾巴慢慢扫过马赛克地砖。）' },
            { name: '旅行手账', text: '院子里有一只猫，才算是真的住下来了。' },
          ]);
        },
      });

      // a photo spot facing the mosaic + afternoon light
      this.addInteract({
        x: 470, y: 400, r: 34, label: '给自家院子留一张影',
        action: () => {
          if (!G.save.hasPhoto('home')) {
            G.dialog.show([{ name: '旅行手账', text: '夕阳正好落在马赛克海豚上，猫躺在它旁边。就拍这一张吧。' }],
              () => { if (G.photo) G.photo.snap('home'); });
          } else {
            G.dialog.show([{ name: '猫', text: '（它换了个姿势，像是知道你已经拍过一张了。）' }]);
          }
        },
      });

      // hanging oil lamps
      for (const lx of [238, 664]) {
        this.addEntity({
          x: lx, y: 246, baseY: 246,
          draw: (c) => this.drawHangingLamp(c, lx, 246),
        });
      }

      // stacked amphorae by the shelf
      this.addEntity({
        x: 236, y: 356, baseY: 356,
        draw: (c) => {
          A.amphora(c, 224, 352, { s: 0.8 });
          A.amphora(c, 244, 354, { s: 0.7, color: '#b06a3c' });
          A.r(c, 214, 344, 16, 4, '#8f8267');
        },
      });
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      // warm stone shell
      c.fillStyle = '#1d1a15';
      c.fillRect(0, 0, this.w, this.h);
      c.fillStyle = '#4a4030';
      c.fillRect(80, 180, 800, 430);

      // marble floor slabs
      for (let y = 270; y < 600; y += 20) {
        const tone = ((y / 20) | 0) % 2;
        c.fillStyle = tone ? '#d9cfb8' : '#d1c6ad';
        c.fillRect(100, y, 760, 20);
        c.fillStyle = 'rgba(90,78,58,.22)';
        c.fillRect(100, y, 760, 1);
        c.fillStyle = 'rgba(255,250,235,.5)';
        c.fillRect(100, y + 1, 760, 1);
        // veins
        c.save();
        c.globalAlpha = 0.16;
        c.strokeStyle = '#8f8267';
        for (let x = 120 + (y % 60); x < 850; x += 110) {
          c.beginPath();
          c.moveTo(x, y + 6);
          c.lineTo(x + 26, y + 9);
          c.lineTo(x + 47, y + 7);
          c.stroke();
        }
        c.restore();
      }

      // mosaic medallion
      const mx = 470, my = 430, mr = 108;
      c.fillStyle = 'rgba(20,14,8,.25)';
      c.beginPath(); c.arc(mx + 3, my + 3, mr, 0, G.TAU); c.fill();
      c.fillStyle = '#b8a884';
      c.beginPath(); c.arc(mx, my, mr, 0, G.TAU); c.fill();
      c.fillStyle = '#8f3a2c';
      c.beginPath(); c.arc(mx, my, mr - 8, 0, G.TAU); c.fill();
      c.fillStyle = '#d8cdb2';
      c.beginPath(); c.arc(mx, my, mr - 16, 0, G.TAU); c.fill();
      c.fillStyle = '#3a6f8f';
      c.beginPath(); c.arc(mx, my, mr - 26, 0, G.TAU); c.fill();
      // wave band
      c.save();
      c.strokeStyle = '#f0ead8';
      c.lineWidth = 3;
      for (let a = 0; a < G.TAU; a += 0.5) {
        c.beginPath();
        c.arc(mx + Math.cos(a) * (mr - 21), my + Math.sin(a) * (mr - 21), 3, a, a + 0.3);
        c.stroke();
      }
      c.restore();
      // dolphin
      c.save();
      c.translate(mx, my);
      c.fillStyle = '#efe6cc';
      c.beginPath();
      c.moveTo(-34, 6);
      c.quadraticCurveTo(-6, -22, 22, -4);
      c.quadraticCurveTo(6, 2, -4, 10);
      c.quadraticCurveTo(-20, 14, -34, 6);
      c.fill();
      c.beginPath();
      c.moveTo(22, -4); c.lineTo(38, -14); c.lineTo(30, 2); c.closePath(); c.fill();
      c.restore();

      // borders
      c.fillStyle = '#3a3126';
      c.fillRect(100, 266, 760, 5);
      c.fillStyle = '#c9bd9f';
      c.fillRect(100, 270, 760, 1);
      c.fillStyle = 'rgba(20,14,8,.3)';
      c.fillRect(100, 270, 760, 10);

      // window light pools
      for (const [wx, wy, r] of [[275, 308, 118], [675, 308, 118]]) {
        const g = c.createRadialGradient(wx, wy, 8, wx, wy, r);
        g.addColorStop(0, 'rgba(255,226,164,.3)');
        g.addColorStop(0.55, 'rgba(255,210,140,.12)');
        g.addColorStop(1, 'rgba(255,196,110,0)');
        c.fillStyle = g;
        c.fillRect(wx - r, wy - r, r * 2, r * 2);
      }
    }

    drawGroundExtras(ctx) {
      // back wall
      A.r(ctx, 100, 198, 760, 72, '#43392b');
      A.r(ctx, 108, 206, 744, 56, '#d9cfb8');
      A.r(ctx, 108, 206, 744, 2, '#8f8267');
      for (const bx of [108, 286, 452, 618, 788, 850]) {
        A.r(ctx, bx, 198, 4, 72, '#5a4c38');
        A.r(ctx, bx + 1, 200, 1, 68, 'rgba(240,225,190,.3)');
      }
      // windows to a bright courtyard
      for (const wx of [218, 618]) {
        A.r(ctx, wx, 214, 92, 40, '#4a3f2e');
        A.r(ctx, wx + 4, 218, 84, 32, '#7fa8c0');
        const wg = ctx.createLinearGradient(wx + 4, 218, wx + 70, 250);
        wg.addColorStop(0, 'rgba(230,246,255,.9)');
        wg.addColorStop(1, 'rgba(160,200,215,.85)');
        ctx.fillStyle = wg;
        ctx.fillRect(wx + 5, 219, 82, 30);
        // a cypress and a wall seen through the opening
        A.r(ctx, wx + 54, 228, 6, 16, '#5a4c38');
        A.r(ctx, wx + 40, 220, 3, 28, P.cypress);
        A.r(ctx, wx + 46, 222, 3, 26, P.cypressDark);
        ctx.strokeStyle = '#4a3f2e'; ctx.lineWidth = 1;
        for (let gx = wx + 14; gx < wx + 92; gx += 13) {
          ctx.beginPath(); ctx.moveTo(gx, 219); ctx.lineTo(gx, 249); ctx.stroke();
        }
        A.r(ctx, wx - 4, 214, 4, 40, '#6b5a42');
        A.r(ctx, wx + 92, 214, 4, 40, '#6b5a42');
        A.glow(ctx, wx + 46, 234, 54, 'rgba(255,236,180,.16)', 0.45);
      }
      // a small fresco fragment
      A.r(ctx, 754, 216, 34, 44, '#e6d9bd');
      A.r(ctx, 758, 220, 26, 36, '#d8c8a6');
      A.r(ctx, 761, 226, 20, 3, '#8a3b2c');
      A.r(ctx, 764, 232, 14, 2, '#3a6f8f');
      A.r(ctx, 759, 210, 24, 6, '#4a3f2e');

      // side walls
      for (const sx of [82, 852]) {
        A.r(ctx, sx, 198, 28, 396, '#4a3f2e');
        A.r(ctx, sx + 4, 200, 20, 392, '#5a4c38');
        for (let yy = 210; yy < 580; yy += 46) {
          A.r(ctx, sx, yy, 28, 4, '#33291d');
          A.r(ctx, sx + 4, yy + 4, 20, 1, 'rgba(240,225,190,.2)');
        }
      }
      // door threshold
      A.r(ctx, 386, 584, 128, 6, '#2a2218');
      A.r(ctx, 396, 580, 108, 4, '#8a7a58');
    }

    /* ============================================================
       furniture
       ============================================================ */
    drawCraftBench(c, x, base) {
      c.save();
      c.translate(x, base);
      c.scale(0.8, 0.8);
      c.translate(-x, -base);
      A.shadow(c, x, base, 150, 4, 0.34);
      A.r(c, x - 58, base - 18, 5, 18, '#3c2f21');
      A.r(c, x + 53, base - 18, 5, 18, '#3c2f21');
      // dark timber backboard with tools
      A.r(c, x - 66, 250, 132, 84, '#43382a');
      A.r(c, x - 62, 254, 124, 76, '#5a4c38');
      A.r(c, x - 52, 260, 104, 34, '#2f5e59');
      A.r(c, x - 50, 262, 100, 30, '#3b7770');
      c.strokeStyle = 'rgba(232,201,137,.45)';
      c.strokeRect(x - 51.5, 260.5, 103, 33);
      // hanging hammers and tongs
      for (let i = 0; i < 4; i++) {
        const bx = x - 44 + i * 22;
        A.r(c, bx, 264, 1, 10, '#8c7a55');
        A.r(c, bx - 2, 274, 5, 3, i % 2 ? '#a8763c' : '#6f4a24');
      }
      A.r(c, x + 30, 266, 2, 20, '#8c7a55');
      A.r(c, x + 28, 284, 6, 2, '#a8763c');
      // anvil on the counter
      A.r(c, x - 30, 308, 26, 6, '#4a4a48');
      A.r(c, x - 40, 306, 16, 4, '#5d5d5a');
      A.r(c, x - 22, 314, 10, 5, '#3a3a38');
      // brass tools and a mould
      A.r(c, x + 4, 314, 18, 8, '#8a6a36');
      A.r(c, x + 6, 315, 14, 4, '#c8a258');
      A.r(c, x + 30, 312, 12, 10, '#6f4a2e');
      // lower shelf with ore and jars
      A.r(c, x - 60, 298, 120, 3, '#43382a');
      for (const [jx, jc] of [[x - 54, '#6f8b68'], [x - 40, '#b8874d'], [x - 26, '#4f7c83'], [x + 44, '#8f5a37']]) {
        A.r(c, jx, 300, 10, 11, '#2c1f14');
        A.r(c, jx + 1, 301, 8, 8, jc);
        A.r(c, jx + 2, 299, 6, 2, '#c9a05a');
      }
      // counter
      A.r(c, x - 72, 322, 144, 8, '#2e2216');
      A.r(c, x - 70, 324, 140, 12, '#8a6a44');
      A.r(c, x - 70, 324, 140, 2, '#c19a5e');
      A.r(c, x - 70, 334, 140, 2, '#4a3a24');
      // the brazier being made
      A.r(c, x - 54, 314, 16, 9, '#a8763c');
      A.r(c, x - 52, 313, 12, 3, '#d8a85c');
      // plaque
      A.r(c, x - 25, 254, 50, 12, '#241c12');
      c.strokeStyle = 'rgba(216,178,106,.6)'; c.strokeRect(x - 24.5, 254.5, 49, 11);
      G.text(c, '铜匠台', x, 263, { size: 8, color: '#cfe8dc', align: 'center' });
      c.restore();
    }

    drawRepairBench(c, x, base) {
      c.save();
      c.translate(x, base);
      c.scale(0.8, 0.8);
      c.translate(-x, -base);
      A.shadow(c, x, base, 150, 4, 0.34);
      A.r(c, x - 58, base - 18, 5, 18, '#3c2f21');
      A.r(c, x + 53, base - 18, 5, 18, '#3c2f21');
      // pegboard
      A.r(c, x - 66, 250, 132, 84, '#43382a');
      A.r(c, x - 62, 254, 124, 76, '#5a4c38');
      A.r(c, x - 56, 260, 112, 50, '#4a3d2a');
      for (let px = x - 50; px < x + 50; px += 12) {
        A.r(c, px, 264, 1, 42, 'rgba(216,178,106,.12)');
      }
      // brushes and clamps
      for (let i = 0; i < 4; i++) {
        const bx = x - 48 + i * 17;
        A.r(c, bx, 268, 1, 18, '#8c6136');
        A.r(c, bx - 1, 286, 3, 5, i % 2 ? '#b8a47e' : '#6a7f72');
      }
      A.r(c, x + 26, 266, 8, 12, '#5f615d');
      A.r(c, x + 28, 270, 4, 4, '#8b8d88');
      A.r(c, x + 38, 268, 10, 8, '#7a5a36');
      A.r(c, x + 40, 270, 6, 4, '#b08a52');
      // shelf with a repaired amphora and gold leaf
      A.r(c, x - 60, 298, 120, 3, '#43382a');
      A.r(c, x - 44, 289, 14, 9, '#e3dccb');
      A.r(c, x - 42, 290, 10, 6, '#f0ebdf');
      A.r(c, x - 40, 291, 2, 2, '#c49a51');
      A.r(c, x - 26, 291, 9, 8, '#a8503a');
      A.r(c, x - 24, 290, 5, 2, '#d7a85d');
      A.r(c, x + 34, 288, 14, 10, '#8a3b2c');
      A.r(c, x + 36, 290, 10, 4, '#d8b26a');
      // counter
      A.r(c, x - 72, 322, 144, 8, '#2e2216');
      A.r(c, x - 70, 324, 140, 12, '#8a6a44');
      A.r(c, x - 70, 324, 140, 2, '#c19a5e');
      A.r(c, x - 70, 334, 140, 2, '#4a3a24');
      // vice
      A.r(c, x + 48, 309, 16, 15, '#5d5f5c');
      A.r(c, x + 51, 312, 10, 4, '#8b8d88');
      A.r(c, x + 52, 320, 3, 10, '#3b3c3a');
      // pot with kintsugi seams
      A.r(c, x - 52, 312, 24, 12, '#d9d2c0');
      A.r(c, x - 50, 313, 20, 9, '#f0eadc');
      A.r(c, x - 48, 315, 16, 2, '#c9a05a');
      A.r(c, x - 44, 317, 1, 4, '#c9a05a');
      A.r(c, x - 38, 318, 1, 3, '#c9a05a');
      // tweezers, glue pot, brush
      A.r(c, x - 18, 315, 10, 1, '#b8b4a6');
      A.r(c, x - 18, 317, 8, 1, '#b8b4a6');
      A.r(c, x - 2, 313, 11, 8, '#6c7d6b');
      A.r(c, x, 311, 7, 3, '#93a58e');
      A.r(c, x + 18, 314, 2, 12, '#8a6136');
      A.r(c, x + 16, 311, 6, 3, '#c9b083');
      // magnifier lamp
      A.r(c, x - 60, 296, 2, 26, '#3a2c1c');
      c.strokeStyle = '#6b5a3b'; c.lineWidth = 1;
      c.beginPath(); c.arc(x - 62, 292, 8, 0, G.TAU); c.stroke();
      c.fillStyle = 'rgba(255,226,170,.24)';
      c.beginPath(); c.arc(x - 62, 292, 7, 0, G.TAU); c.fill();
      A.glow(c, x - 62, 292, 24, 'rgba(255,196,112,.22)', 0.45);
      // plaque
      A.r(c, x - 25, 254, 50, 12, '#241c12');
      c.strokeStyle = 'rgba(216,178,106,.6)'; c.strokeRect(x - 24.5, 254.5, 49, 11);
      G.text(c, '修复台', x, 263, { size: 8, color: '#f0d9ae', align: 'center' });
      c.restore();
    }

    drawCabinet(c, x, base) {
      A.shadow(c, x, base, 104, 3, 0.25);
      A.r(c, x - 50, base - 132, 100, 130, '#3b2f21');
      A.r(c, x - 46, base - 128, 92, 124, '#5a4c38');
      A.r(c, x - 44, base - 126, 88, 1, '#b88d54');
      for (const yy of [base - 100, base - 70, base - 40]) {
        A.r(c, x - 50, yy, 100, 2, '#33291d');
        A.r(c, x - 50, yy + 2, 100, 1, 'rgba(239,196,125,.2)');
      }
      // amphorae on the shelves
      for (let i = 0; i < 4; i++) {
        A.amphora(c, x - 32 + i * 20, base - 84, { s: 0.75, color: ['#a8503a', '#3a6f8f', '#b06a3c', '#8a3b2c'][i] });
      }
      for (let i = 0; i < 4; i++) {
        A.amphora(c, x - 32 + i * 20, base - 54, { s: 0.7, color: ['#6a6a50', '#a8503a', '#7d6a45', '#3a6f8f'][i] });
      }
      for (let i = 0; i < 4; i++) {
        A.r(c, x - 38 + i * 20, base - 38, 12, 8, ['#7c3a2b', '#43545d', '#8b6b3b', '#57412c'][i]);
      }
    }

    drawTeaTable(c, x, base) {
      A.shadow(c, x, base, 102, 3, 0.24);
      A.r(c, x - 48, base - 24, 96, 8, '#3a2c1c');
      A.r(c, x - 46, base - 22, 92, 7, '#8a6a44');
      A.r(c, x - 46, base - 22, 92, 1, '#c18f56');
      A.r(c, x - 40, base - 15, 4, 15, '#3a2c1c');
      A.r(c, x + 36, base - 15, 4, 15, '#3a2c1c');
      // amphora and cups
      A.amphora(c, x - 6, base - 24, { s: 0.8, color: '#a8503a' });
      for (const [cx, cy] of [[x - 30, base - 28], [x + 24, base - 27], [x + 8, base - 18]]) {
        A.r(c, cx, cy, 5, 4, '#d9d1bd');
        A.r(c, cx + 1, cy + 1, 3, 1, '#8c7a5a');
      }
      // olive bowl
      A.r(c, x + 34, base - 30, 10, 5, '#8a8570');
      A.r(c, x + 35, base - 30, 8, 2, '#6a7a45');
      // cushions
      A.r(c, x - 66, base - 6, 26, 10, '#7e352a');
      A.r(c, x + 42, base - 6, 26, 10, '#7e352a');
      A.r(c, x - 66, base - 6, 26, 2, '#c39255');
      A.r(c, x + 42, base - 6, 26, 2, '#c39255');
    }

    drawScreen(c, x, base) {
      A.shadow(c, x, base, 94, 3, 0.24);
      A.r(c, x - 46, base - 112, 92, 112, '#3b2f21');
      // three mosaic panels
      const cols = [['#3a6f8f', '#d9cfb2'], ['#8a3b2c', '#e0d2b4'], ['#3a6f8f', '#d9cfb2']];
      for (let i = 0; i < 3; i++) {
        const sx = x - 41 + i * 27;
        A.r(c, sx, base - 106, 22, 102, cols[i][1]);
        A.r(c, sx + 2, base - 104, 18, 98, cols[i][0]);
        // little tesserae
        c.save(); c.globalAlpha = 0.5;
        for (let yy = base - 100; yy < base - 10; yy += 4) {
          for (let xx = sx + 4; xx < sx + 18; xx += 4) {
            c.fillStyle = G.hash(xx, yy, 3) > 0.5 ? '#e8ddc0' : '#c9b98f';
            c.fillRect(xx, yy, 2, 2);
          }
        }
        c.restore();
        // a simple figure
        A.r(c, sx + 8, base - 70, 6, 2, '#f0e9d8');
        A.r(c, sx + 9, base - 84, 4, 14, '#f0e9d8');
        A.r(c, sx + 2, base - 6, 18, 2, '#6b5236');
      }
    }

    drawOlivePot(c, x, base) {
      A.shadow(c, x, base, 34, 2, 0.25);
      A.r(c, x - 12, base - 18, 24, 16, '#a8503a');
      A.r(c, x - 10, base - 20, 20, 3, '#c2694c');
      A.oliveTree(c, x, base - 14, 0.7, {});
    }

    drawDoor(c, x, base) {
      A.shadow(c, x, base, 128, 3, 0.3);
      A.r(c, x - 62, base - 92, 124, 92, '#33281c');
      A.r(c, x - 58, base - 88, 116, 88, '#5a4c38');
      // bronze-studded door
      A.r(c, x - 53, base - 82, 49, 78, '#6b5a42');
      A.r(c, x + 4, base - 82, 49, 78, '#67563f');
      for (const side of [-1, 1]) {
        const dx = x + (side === 1 ? 4 : -53);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
          A.r(c, dx + 8 + i * 10, base - 74 + j * 12, 2, 2, '#c49a57');
        }
      }
      A.r(c, x - 1, base - 80, 3, 76, '#2a1f12');
      A.r(c, x - 2, base - 88, 5, 6, '#d8b26a');
      A.r(c, x - 54, base - 84, 108, 2, '#d8b26a');
      // laurel wreath on the lintel
      A.r(c, x - 10, base - 96, 20, 2, '#6a7a45');
      for (let i = 0; i < 4; i++) A.r(c, x - 8 + i * 5, base - 98, 2, 4, '#879a5a');
      A.glow(c, x, base - 56, 64, 'rgba(255,188,103,.14)', 0.45);
      for (const side of [-1, 1]) {
        const lx = x + side * 70;
        A.r(c, lx - 3, base - 80, 6, 8, '#b3402c');
        A.r(c, lx - 2, base - 79, 4, 6, '#d45637');
        A.r(c, lx - 1, base - 72, 2, 2, '#e8c178');
      }
    }

    drawHangingLamp(c, x, base) {
      A.r(c, x, base - 58, 1, 30, '#4a3f2e');
      A.glow(c, x, base - 30, 32, 'rgba(255,162,72,.2)', 0.4);
      A.r(c, x - 6, base - 36, 12, 3, '#d8b26a');
      A.r(c, x - 7, base - 33, 14, 13, '#8a6a3a');
      A.r(c, x - 6, base - 32, 12, 11, '#c9a557');
      A.r(c, x - 5, base - 30, 10, 2, '#ffdda0');
      for (let i = -5; i <= 5; i += 5) A.r(c, x + i, base - 33, 1, 13, 'rgba(108,66,24,.45)');
      A.r(c, x - 6, base - 20, 12, 2, '#d8b26a');
      A.r(c, x - 1, base - 18, 2, 6, '#b3402c');
    }

    /* ============================================================
       interaction / ambience
       ============================================================ */
    useCraftBench() {
      G.audio.sfx('confirm');
      G.dialog.show([
        { name: '铜匠台', text: '台上立着一只小铁砧，旁边是锤子、钳子和一排黄铜模具。' },
        { name: '铜匠台', text: '这里可以把一路收集的材料敲打、拼合，做成新的物件。模具还没整理完，但台子已经能用了。' },
        { name: '旅行手账', text: '左边负责“做出来”，右边负责“修回去”。这两张台子，正好是一双手。' },
      ], () => {
        this.visitedCraft = true;
        if (G.unlock) G.unlock('craftbench');
        this.refreshObjective();
        G.ui.toast('铜匠台已整理好 · 再去右边看看修复台', 'good', 2800);
      });
    }

    useRepairBench() {
      G.audio.sfx('confirm');
      G.dialog.show([
        { name: '修复台', text: '修复台上立着一盏带放大镜的铜灯，旁边是竹镊、毛笔、鱼鳔胶和一小碟金粉。' },
        { name: '修复台', text: '碎了的陶罐可以沿着裂缝补上金线，旧木器可以重新打磨。这里负责把残缺的东西慢慢救回来。' },
        { name: '旅行手账', text: '铜匠台向前，修复台向后。一个做新的，一个留住旧的。' },
      ], () => {
        this.visitedRepair = true;
        if (G.unlock) G.unlock('repairbench');
        this.refreshObjective();
        G.ui.toast('修复台已就位 · 现在可以从大门离开庭院', 'good', 2800);
      });
    }

    updateAmbient(dt) {
      if (Math.random() < dt * 4.2) {
        const wx = G.pick([275, 675]);
        G.fx.add({
          x: wx + G.rand(-45, 45), y: 290 + G.rand(-40, 130),
          vx: G.rand(-2, 4), vy: G.rand(-4, 1),
          life: G.rand(2.2, 4.2), size: 1,
          color: G.pick(['rgba(255,226,173,.42)', 'rgba(244,214,163,.3)']),
          grav: -1, glow: false,
        });
      }
    }

    drawScreen(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [wx, spread] of [[275, 34], [675, 28]]) {
        const sx = wx - this.cam.x;
        const sy = 222 - this.cam.y;
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = '#ffe1a6';
        ctx.beginPath();
        ctx.moveTo(sx - 40, sy);
        ctx.lineTo(sx + 40, sy);
        ctx.lineTo(sx + 86 + spread, sy + 240);
        ctx.lineTo(sx - 86 - spread, sy + 240);
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

  G.HomeScene = HomeScene;
})();
