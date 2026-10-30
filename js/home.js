/* ============================================================
   紫禁城 · 铁火 — 家 · 大厅
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
      this.title = '家 · 大厅';
      this.marker = { x: 365, y: 300 };
      this.visitedCraft = false;
      this.visitedRepair = false;
      this.build();
      this.buildGround((c) => this.paintGround(c));
    }

    onEnter() {
      G.ui.location('家', '大厅');
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
            { name: '旅行手账', narrator: true, text: '推开木门，屋里有一股旧木头和热茶的味道。' },
            { name: '旅行手账', narrator: true, text: '窗纸把午后的光滤成蜜色。靠墙的两张台子一新一旧，像是等了你很久。' },
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
        this.objective('看看大厅 · 左边是合成台，右边是修复台');
        this.marker = { x: 365, y: 300 };
      } else {
        this.objective('合成台看过了 · 再去右边的修复台看看');
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

      // two separate stations: crafting and restoration
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
        x: 365, y: 372, r: 48, label: '使用合成台',
        action: () => this.useCraftBench(),
      });
      this.addInteract({
        x: 535, y: 372, r: 48, label: '使用修复台',
        action: () => this.useRepairBench(),
      });

      // cabinet / shelf
      this.addEntity({
        x: 180, y: 332, baseY: 332,
        draw: (c) => this.drawCabinet(c, 180, 332),
      });
      this.solid(128, 300, 105, 32);

      // tea table and cushions
      this.addEntity({
        x: 696, y: 452, baseY: 452,
        draw: (c) => this.drawTeaTable(c, 696, 452),
      });
      this.solid(646, 430, 100, 24);

      // folding screen
      this.addEntity({
        x: 800, y: 404, baseY: 404,
        draw: (c) => this.drawScreen(c, 800, 404),
      });
      this.solid(760, 388, 80, 20);

      // plant
      this.addEntity({
        x: 168, y: 540, baseY: 540,
        draw: (c) => this.drawPlant(c, 168, 540),
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
        x: 560, y: 458, r: 30, label: '摸摸大厅里的猫',
        action: () => {
          G.audio.sfx('pickup');
          G.dialog.show([
            { name: '猫', text: '（它把脑袋往你手心里顶，尾巴慢慢扫过地毯。）' },
            { name: '旅行手账', text: '大厅里有一只猫，才算是真的住下来了。' },
          ]);
        },
      });

      // hanging lanterns
      for (const lx of [238, 664]) {
        this.addEntity({
          x: lx, y: 246, baseY: 246,
          draw: (c) => this.drawHangingLantern(c, lx, 246),
        });
      }

      // a few stacked books and jars by the cabinet
      this.addEntity({
        x: 236, y: 356, baseY: 356,
        draw: (c) => {
          A.r(c, 218, 344, 18, 4, '#8a3b2d');
          A.r(c, 216, 339, 22, 4, '#c7a05a');
          A.r(c, 220, 335, 16, 4, '#405c62');
          A.r(c, 244, 344, 8, 10, '#6b4a2f');
          A.r(c, 245, 341, 6, 3, '#b88b4e');
        },
      });
    }

    /* ============================================================
       ground
       ============================================================ */
    paintGround(c) {
      // dark timber shell
      c.fillStyle = '#1d130e';
      c.fillRect(0, 0, this.w, this.h);
      c.fillStyle = '#3c2719';
      c.fillRect(80, 180, 800, 430);

      // plank floor
      for (let y = 270; y < 600; y += 15) {
        const tone = ((y / 15) | 0) % 2;
        c.fillStyle = tone ? '#5c3d28' : '#553824';
        c.fillRect(100, y, 760, 15);
        c.fillStyle = 'rgba(30,18,11,.22)';
        c.fillRect(100, y, 760, 1);
        c.fillStyle = 'rgba(238,199,141,.05)';
        c.fillRect(100, y + 1, 760, 1);
        // wood grain
        c.save();
        c.globalAlpha = 0.18;
        c.strokeStyle = '#2e1b10';
        for (let x = 120 + (y % 45); x < 850; x += 90) {
          c.beginPath();
          c.moveTo(x, y + 4);
          c.lineTo(x + 24, y + 5);
          c.lineTo(x + 41, y + 4);
          c.stroke();
        }
        c.restore();
        // nails
        c.fillStyle = 'rgba(30,20,12,.55)';
        for (let x = 130 + (y % 60); x < 850; x += 120) c.fillRect(x, y + 3, 1, 1);
      }

      // edges / baseboards
      c.fillStyle = '#2e1c12';
      c.fillRect(100, 266, 760, 5);
      c.fillStyle = '#6b4529';
      c.fillRect(100, 270, 760, 1);
      c.fillStyle = 'rgba(20,12,8,.35)';
      c.fillRect(100, 270, 760, 10);

      // rug
      const rx = 302, ry = 364, rw = 300, rh = 148;
      c.fillStyle = 'rgba(20,10,7,.28)';
      c.fillRect(rx + 5, ry + 5, rw, rh);
      c.fillStyle = '#6d2a22';
      c.fillRect(rx, ry, rw, rh);
      c.fillStyle = '#84352a';
      c.fillRect(rx + 7, ry + 7, rw - 14, rh - 14);
      c.strokeStyle = 'rgba(231,197,131,.75)';
      c.lineWidth = 2;
      c.strokeRect(rx + 10, ry + 10, rw - 20, rh - 20);
      c.lineWidth = 1;
      c.strokeRect(rx + 16, ry + 16, rw - 32, rh - 32);
      c.fillStyle = 'rgba(235,201,139,.2)';
      for (let i = 0; i < 4; i++) {
        const dx = rx + 30 + i * (rw - 60) / 3;
        c.beginPath();
        c.moveTo(dx, ry + rh / 2 - 22);
        c.lineTo(dx + 14, ry + rh / 2);
        c.lineTo(dx, ry + rh / 2 + 22);
        c.lineTo(dx - 14, ry + rh / 2);
        c.closePath();
        c.fill();
      }
      c.fillStyle = 'rgba(241,214,158,.5)';
      for (let i = 0; i < 16; i++) c.fillRect(rx + 8, ry + 4 + i * 9, 2, 4);
      for (let i = 0; i < 16; i++) c.fillRect(rx + rw - 10, ry + 4 + i * 9, 2, 4);

      // window light pools on the floor
      for (const [wx, wy, r] of [[275, 308, 105], [675, 308, 105]]) {
        const g = c.createRadialGradient(wx, wy, 8, wx, wy, r);
        g.addColorStop(0, 'rgba(255,211,138,.22)');
        g.addColorStop(0.55, 'rgba(255,199,117,.09)');
        g.addColorStop(1, 'rgba(255,190,100,0)');
        c.fillStyle = g;
        c.fillRect(wx - r, wy - r, r * 2, r * 2);
      }
      // rug fringe
      c.fillStyle = 'rgba(235,205,151,.35)';
      for (let i = 0; i < 18; i++) {
        c.fillRect(rx + 4 + i * 16, ry - 4, 1, 4);
        c.fillRect(rx + 4 + i * 16, ry + rh, 1, 4);
      }
    }

    drawGroundExtras(ctx) {
      // back wall
      A.r(ctx, 100, 198, 760, 72, '#352116');
      A.r(ctx, 108, 206, 744, 56, '#d0bd9b');
      A.r(ctx, 108, 206, 744, 2, '#6b4a2e');
      for (const bx of [108, 286, 452, 618, 788, 850]) {
        A.r(ctx, bx, 198, 4, 72, '#4a2e1c');
        A.r(ctx, bx + 1, 200, 1, 68, 'rgba(226,185,119,.28)');
      }
      // window frames and warm panes
      for (const wx of [218, 618]) {
        A.r(ctx, wx, 214, 92, 40, '#3e2718');
        A.r(ctx, wx + 4, 218, 84, 32, '#e3b773');
        const wg = ctx.createLinearGradient(wx + 4, 218, wx + 70, 250);
        wg.addColorStop(0, 'rgba(255,241,190,.92)');
        wg.addColorStop(1, 'rgba(211,144,72,.88)');
        ctx.fillStyle = wg;
        ctx.fillRect(wx + 5, 219, 82, 30);
        ctx.strokeStyle = '#4a2e1c'; ctx.lineWidth = 1;
        for (let gx = wx + 14; gx < wx + 92; gx += 13) {
          ctx.beginPath(); ctx.moveTo(gx, 219); ctx.lineTo(gx, 249); ctx.stroke();
        }
        for (let gy = 229; gy < 249; gy += 10) {
          ctx.beginPath(); ctx.moveTo(wx + 5, gy); ctx.lineTo(wx + 87, gy); ctx.stroke();
        }
        A.r(ctx, wx - 4, 214, 4, 40, '#5a3822');
        A.r(ctx, wx + 92, 214, 4, 40, '#5a3822');
        A.glow(ctx, wx + 46, 234, 54, 'rgba(255,192,110,.18)', 0.45);
      }
      // a small painted scroll
      A.r(ctx, 754, 216, 34, 44, '#e6d7b8');
      A.r(ctx, 758, 220, 26, 36, '#d7c49f');
      A.r(ctx, 761, 226, 20, 3, '#6b7a5c');
      A.r(ctx, 764, 232, 14, 2, '#8e9a76');
      A.r(ctx, 759, 210, 24, 6, '#4a2e1c');

      // side walls
      for (const sx of [82, 852]) {
        A.r(ctx, sx, 198, 28, 396, '#3e2719');
        A.r(ctx, sx + 4, 200, 20, 392, '#4b3020');
        for (let yy = 210; yy < 580; yy += 46) {
          A.r(ctx, sx, yy, 28, 4, '#2c1a10');
          A.r(ctx, sx + 4, yy + 4, 20, 1, 'rgba(232,193,131,.18)');
        }
      }
      // door threshold
      A.r(ctx, 386, 584, 128, 6, '#2a1a11');
      A.r(ctx, 396, 580, 108, 4, '#6b4b2e');
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
      A.r(c, x - 58, base - 18, 5, 18, '#3c2617');
      A.r(c, x + 53, base - 18, 5, 18, '#3c2617');
      // dark timber backboard with a teal felt work panel
      A.r(c, x - 66, 250, 132, 84, '#3a2417');
      A.r(c, x - 62, 254, 124, 76, '#5a3a24');
      A.r(c, x - 52, 260, 104, 34, '#2f5e59');
      A.r(c, x - 50, 262, 100, 30, '#3b7770');
      c.strokeStyle = 'rgba(232,201,137,.45)';
      c.strokeRect(x - 51.5, 260.5, 103, 33);
      // brass gears on the felt
      for (const [gx, gy, gr] of [[x - 30, 271, 6], [x - 12, 279, 4], [x + 8, 268, 5]]) {
        c.strokeStyle = '#c8a258'; c.lineWidth = 1;
        c.beginPath(); c.arc(gx, gy, gr, 0, G.TAU); c.stroke();
        c.fillStyle = '#8a6a36';
        c.fillRect(gx - 1, gy - 1, 2, 2);
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2;
          c.fillRect(gx + Math.round(Math.cos(a) * (gr + 1)), gy + Math.round(Math.sin(a) * (gr + 1)), 1, 1);
        }
      }
      // tiny blue crystal and recipe cards
      A.r(c, x + 24, 267, 5, 6, '#6fa9b2');
      A.r(c, x + 26, 265, 2, 3, '#b5e0d8');
      A.r(c, x + 34, 270, 12, 14, '#d5c3a1');
      A.r(c, x + 36, 273, 8, 1, '#7b6a4e');
      A.r(c, x + 36, 276, 7, 1, '#7b6a4e');
      A.r(c, x + 36, 279, 8, 1, '#7b6a4e');
      // lower shelf and ingredient jars
      A.r(c, x - 60, 298, 120, 3, '#3a2417');
      for (const [jx, jc] of [[x - 54, '#6f8b68'], [x - 40, '#b8874d'], [x - 26, '#4f7c83'], [x + 44, '#8f5a37']]) {
        A.r(c, jx, 300, 10, 11, '#2c1a10');
        A.r(c, jx + 1, 301, 8, 8, jc);
        A.r(c, jx + 2, 299, 6, 2, '#c9a05a');
      }
      // counter
      A.r(c, x - 72, 322, 144, 8, '#2e1b10');
      A.r(c, x - 70, 324, 140, 12, '#8a5b35');
      A.r(c, x - 70, 324, 140, 2, '#c18f56');
      A.r(c, x - 70, 334, 140, 2, '#4a2e1c');
      // brass balance, bowls, boxes
      A.r(c, x - 56, 315, 2, 9, '#b88f4c');
      A.r(c, x - 63, 313, 16, 2, '#c8a258');
      A.r(c, x - 63, 308, 4, 5, '#7b5a2f');
      A.r(c, x - 54, 308, 4, 5, '#7b5a2f');
      A.r(c, x - 20, 315, 14, 7, '#6f4a2e');
      A.r(c, x - 18, 316, 10, 3, '#a57a44');
      A.r(c, x + 12, 313, 12, 9, '#3f6c68');
      A.r(c, x + 14, 314, 8, 6, '#6ba098');
      A.r(c, x + 34, 317, 16, 5, '#a57947');
      // teal work lamp
      A.r(c, x - 64, 292, 2, 30, '#3a2417');
      A.r(c, x - 69, 288, 11, 7, '#4f8f87');
      A.glow(c, x - 63, 294, 26, 'rgba(92,196,180,.24)', 0.5);
      // plaque
      A.r(c, x - 25, 254, 50, 12, '#24180f');
      c.strokeStyle = 'rgba(216,178,106,.6)'; c.strokeRect(x - 24.5, 254.5, 49, 11);
      G.text(c, '合成台', x, 263, { size: 8, color: '#cfe8dc', align: 'center' });
      c.restore();
    }

    drawRepairBench(c, x, base) {
      c.save();
      c.translate(x, base);
      c.scale(0.8, 0.8);
      c.translate(-x, -base);
      A.shadow(c, x, base, 150, 4, 0.34);
      A.r(c, x - 58, base - 18, 5, 18, '#3c2617');
      A.r(c, x + 53, base - 18, 5, 18, '#3c2617');
      // backboard / pegboard
      A.r(c, x - 66, 250, 132, 84, '#382317');
      A.r(c, x - 62, 254, 124, 76, '#5a3a24');
      A.r(c, x - 56, 260, 112, 50, '#4a3020');
      for (let px = x - 50; px < x + 50; px += 12) {
        A.r(c, px, 264, 1, 42, 'rgba(216,178,106,.12)');
      }
      // hanging brushes and clamps
      for (let i = 0; i < 4; i++) {
        const bx = x - 48 + i * 17;
        A.r(c, bx, 268, 1, 18, '#8c6136');
        A.r(c, bx - 1, 286, 3, 5, i % 2 ? '#b8a47e' : '#6a7f72');
      }
      A.r(c, x + 26, 266, 8, 12, '#5f615d');
      A.r(c, x + 28, 270, 4, 4, '#8b8d88');
      A.r(c, x + 38, 268, 10, 8, '#7a5a36');
      A.r(c, x + 40, 270, 6, 4, '#b08a52');
      // shelf with porcelain and gold lacquer
      A.r(c, x - 60, 298, 120, 3, '#3a2417');
      A.r(c, x - 54, 289, 16, 9, '#e3dccb');
      A.r(c, x - 52, 290, 12, 6, '#f0ebdf');
      A.r(c, x - 50, 291, 2, 2, '#c49a51');
      A.r(c, x - 36, 292, 9, 6, '#8e3d2e');
      A.r(c, x - 34, 291, 5, 2, '#d7a85d');
      A.r(c, x + 34, 288, 14, 10, '#7f3c2d');
      A.r(c, x + 36, 290, 10, 4, '#d8b26a');
      // counter
      A.r(c, x - 72, 322, 144, 8, '#2e1b10');
      A.r(c, x - 70, 324, 140, 12, '#8a5b35');
      A.r(c, x - 70, 324, 140, 2, '#c18f56');
      A.r(c, x - 70, 334, 140, 2, '#4a2e1c');
      // vice
      A.r(c, x + 48, 309, 16, 15, '#5d5f5c');
      A.r(c, x + 51, 312, 10, 4, '#8b8d88');
      A.r(c, x + 52, 320, 3, 10, '#3b3c3a');
      // porcelain bowl with kintsugi seams
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
      // warm magnifier lamp
      A.r(c, x - 60, 296, 2, 26, '#3a2417');
      c.strokeStyle = '#6b5a3b'; c.lineWidth = 1;
      c.beginPath(); c.arc(x - 62, 292, 8, 0, G.TAU); c.stroke();
      c.fillStyle = 'rgba(255,226,170,.24)';
      c.beginPath(); c.arc(x - 62, 292, 7, 0, G.TAU); c.fill();
      A.glow(c, x - 62, 292, 24, 'rgba(255,196,112,.22)', 0.45);
      // plaque
      A.r(c, x - 25, 254, 50, 12, '#24180f');
      c.strokeStyle = 'rgba(216,178,106,.6)'; c.strokeRect(x - 24.5, 254.5, 49, 11);
      G.text(c, '修复台', x, 263, { size: 8, color: '#f0d9ae', align: 'center' });
      c.restore();
    }

    drawCabinet(c, x, base) {
      A.shadow(c, x, base, 104, 3, 0.25);
      A.r(c, x - 50, base - 132, 100, 130, '#332015');
      A.r(c, x - 46, base - 128, 92, 124, '#5b3a22');
      A.r(c, x - 44, base - 126, 88, 1, '#b88d54');
      for (const yy of [base - 100, base - 70, base - 40]) {
        A.r(c, x - 50, yy, 100, 2, '#2c1a10');
        A.r(c, x - 50, yy + 2, 100, 1, 'rgba(239,196,125,.2)');
      }
      for (let i = 0; i < 4; i++) {
        A.r(c, x - 38 + i * 20, base - 96, 11, 16, ['#7f4d2d', '#405c62', '#8f3b2e', '#6e5a34'][i]);
        A.r(c, x - 36 + i * 20, base - 93, 7, 1, 'rgba(247,223,175,.45)');
      }
      for (let i = 0; i < 5; i++) {
        A.r(c, x - 40 + i * 16, base - 64, 8, 16, ['#7c3a2b', '#43545d', '#8b6b3b', '#57412c', '#6b3a34'][i]);
      }
    }

    drawTeaTable(c, x, base) {
      A.shadow(c, x, base, 102, 3, 0.24);
      A.r(c, x - 48, base - 24, 96, 8, '#3a2417');
      A.r(c, x - 46, base - 22, 92, 7, '#8a5b36');
      A.r(c, x - 46, base - 22, 92, 1, '#c18f56');
      A.r(c, x - 40, base - 15, 4, 15, '#3a2417');
      A.r(c, x + 36, base - 15, 4, 15, '#3a2417');
      // teapot
      A.r(c, x - 12, base - 31, 16, 9, '#6d7f72');
      A.r(c, x - 8, base - 34, 8, 3, '#879a8a');
      A.r(c, x + 4, base - 29, 6, 2, '#6d7f72');
      A.r(c, x - 14, base - 28, 3, 2, '#6d7f72');
      // cups
      for (const [cx, cy] of [[x - 30, base - 28], [x + 24, base - 27], [x + 6, base - 18]]) {
        A.r(c, cx, cy, 5, 4, '#d9d1bd');
        A.r(c, cx + 1, cy + 1, 3, 1, '#8c7a5a');
      }
      // cushions
      A.r(c, x - 66, base - 6, 26, 10, '#7e352a');
      A.r(c, x + 42, base - 6, 26, 10, '#7e352a');
      A.r(c, x - 66, base - 6, 26, 2, '#c39255');
      A.r(c, x + 42, base - 6, 26, 2, '#c39255');
    }

    drawScreen(c, x, base) {
      A.shadow(c, x, base, 94, 3, 0.24);
      A.r(c, x - 46, base - 112, 92, 112, '#2e1c12');
      for (let i = 0; i < 3; i++) {
        const sx = x - 41 + i * 27;
        A.r(c, sx, base - 106, 22, 102, '#c4ad86');
        A.r(c, sx + 2, base - 102, 18, 94, '#d8c7a2');
        A.r(c, sx + 4, base - 94, 14, 1, '#6d7a5c');
        A.r(c, sx + 5, base - 88, 9, 1, '#8c9a78');
        A.r(c, sx + 7, base - 80, 12, 1, '#6d7a5c');
        A.r(c, sx + 2, base - 6, 18, 2, '#6b4a2e');
      }
    }

    drawPlant(c, x, base) {
      A.shadow(c, x, base, 34, 2, 0.25);
      A.r(c, x - 12, base - 18, 24, 16, '#7a4430');
      A.r(c, x - 10, base - 20, 20, 3, '#9c5b3e');
      A.r(c, x - 1, base - 44, 2, 26, '#4b6a45');
      for (const [dx, dy, w, h] of [[-12, -50, 14, 7], [2, -58, 13, 8], [8, -44, 12, 7], [-6, -38, 10, 5]]) {
        A.r(c, x + dx, base + dy, w, h, '#4f7049');
        A.r(c, x + dx + 2, base + dy, w - 3, 2, '#6f8d5f');
      }
    }

    drawDoor(c, x, base) {
      A.shadow(c, x, base, 128, 3, 0.3);
      A.r(c, x - 62, base - 92, 124, 92, '#2b1a10');
      A.r(c, x - 58, base - 88, 116, 88, '#563522');
      A.r(c, x - 53, base - 82, 49, 78, '#6b4228');
      A.r(c, x + 4, base - 82, 49, 78, '#674026');
      for (const side of [-1, 1]) {
        const dx = x + (side === 1 ? 4 : -53);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
          A.r(c, dx + 8 + i * 10, base - 74 + j * 12, 2, 2, '#c49a57');
        }
      }
      A.r(c, x - 1, base - 80, 3, 76, '#2a1910');
      A.r(c, x - 2, base - 88, 5, 6, '#d8b26a');
      A.r(c, x - 54, base - 84, 108, 2, '#d8b26a');
      // warm light leaking around the frame
      A.glow(c, x, base - 56, 64, 'rgba(255,188,103,.14)', 0.45);
      for (const side of [-1, 1]) {
        const lx = x + side * 70;
        A.r(c, lx - 3, base - 80, 6, 8, '#b3402c');
        A.r(c, lx - 2, base - 79, 4, 6, '#d45637');
        A.r(c, lx - 1, base - 72, 2, 2, '#e8c178');
      }
    }

    drawHangingLantern(c, x, base) {
      A.r(c, x, base - 58, 1, 30, '#4a2e1c');
      A.glow(c, x, base - 30, 32, 'rgba(255,162,72,.2)', 0.4);
      A.r(c, x - 6, base - 36, 12, 3, '#d8b26a');
      A.r(c, x - 7, base - 33, 14, 13, '#9b3a2b');
      A.r(c, x - 6, base - 32, 12, 11, '#c45236');
      A.r(c, x - 5, base - 30, 10, 2, '#ffdda0');
      for (let i = -5; i <= 5; i += 5) A.r(c, x + i, base - 33, 1, 13, 'rgba(108,34,24,.45)');
      A.r(c, x - 6, base - 20, 12, 2, '#d8b26a');
      A.r(c, x - 1, base - 18, 2, 6, '#b3402c');
    }

    /* ============================================================
       interaction / ambience
       ============================================================ */
    useCraftBench() {
      G.audio.sfx('confirm');
      G.dialog.show([
        { name: '合成台', text: '靠窗的合成台。台面上铺着一块墨绿色毡垫，黄铜齿轮和玻璃小瓶排得整整齐齐。' },
        { name: '合成台', text: '这里可以把一路收集的材料拆解、拼合，做成新的物件。配方还没整理完，但台子已经能用了。' },
        { name: '旅行手账', text: '左边负责“做出来”，右边负责“修回去”。这两张台子，正好是一双手。' },
      ], () => {
        this.visitedCraft = true;
        if (G.unlock) G.unlock('craftbench');
        this.refreshObjective();
        G.ui.toast('合成台已整理好 · 再去右边看看修复台', 'good', 2800);
      });
    }

    useRepairBench() {
      G.audio.sfx('confirm');
      G.dialog.show([
        { name: '修复台', text: '修复台上立着一盏带放大镜的铜灯，旁边是竹镊、毛笔、鱼鳔胶和一小碟金粉。' },
        { name: '修复台', text: '碎了的瓷器可以沿着裂缝补上金线，旧木器可以重新打磨。这里负责把残缺的东西慢慢救回来。' },
        { name: '旅行手账', text: '合成台向前，修复台向后。一个做新的，一个留住旧的。' },
      ], () => {
        this.visitedRepair = true;
        if (G.unlock) G.unlock('repairbench');
        this.refreshObjective();
        G.ui.toast('修复台已就位 · 现在可以从大门离开大厅', 'good', 2800);
      });
    }

    updateAmbient(dt) {
      // dust drifting in the window light
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
      // shafts of amber window light
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
      // interior vignette
      const g = ctx.createRadialGradient(320, 175, 150, 320, 180, 380);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(8,5,3,.3)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
    }
  }

  G.HomeScene = HomeScene;
})();
