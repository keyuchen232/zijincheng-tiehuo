/* ============================================================
   紫禁城 · 铁火 — top-down world base
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;

  G.WorldScene = class WorldScene {
    constructor(opts) {
      this.id = opts.id;
      this.w = opts.w;
      this.h = opts.h;
      this.spawn = opts.spawn || { x: this.w / 2, y: this.h / 2 };
      this.player = {
        x: this.spawn.x, y: this.spawn.y, dir: 'up',
        moving: false, running: false, anim: 0, speed: 68, runSpeed: 108,
      };
      this.cam = { x: 0, y: 0 };
      this.solids = [];
      this.entities = [];
      this.npcs = [];
      this.interactables = [];
      this.lights = [];
      this.time = 0;
      this.clock = opts.clock || '08:30';
      this.dateLabel = opts.dateLabel || '';
      this.night = false;
      this.ground = null;
      this._nearest = null;
      this._promptText = '';
      this._stepTimer = 0;
      this.ambient = 'city';
      this.focusEntity = null;
      this.lookAhead = opts.lookAhead == null ? 42 : opts.lookAhead;
      this.dayGrade = opts.dayGrade !== false;
      // 画面调色强度：之前只存在于各场景的构造参数里，基类没有接住，导致永远按 1.0 满强度叠加
      this.gradeStrength = opts.gradeStrength;
    }

    /* ---------- setup helpers ---------- */
    solid(x, y, w, h) { this.solids.push({ x, y, w, h }); }
    solidRect(cx, baseY, w, d) { this.solids.push({ x: cx - w / 2, y: baseY - d, w, h: d }); }

    addEntity(e) {
      e.baseY = e.baseY == null ? e.y : e.baseY;
      this.entities.push(e);
      return e;
    }

    addBuilding(x, baseY, draw, extra) {
      return this.addEntity(Object.assign({
        x, y: baseY, baseY,
        draw: (ctx) => draw(ctx),
      }, extra || {}));
    }

    addNPC(o) {
      const npc = Object.assign({
        dir: 'down', frame: 0, moving: false, phase: Math.random() * 10,
        palette: G.art.actorPalettes.tourist, name: '游客',
        lines: ['您好。'], radius: 24, wander: 0, homeX: o.x, homeY: o.y,
        t: Math.random() * 10,
      }, o);
      this.npcs.push(npc);
      this.addEntity({
        x: npc.x, y: npc.y, baseY: npc.y,
        draw: (ctx) => {
          const bobT = this.time + npc.phase;
          G.art.drawActor(ctx, npc.x, npc.y, {
            dir: npc.dir, frame: npc.frame, moving: npc.moving, time: bobT,
            palette: npc.palette, accessory: npc.accessory, phase: npc.phase, scale: 1.26,
          });
          if (npc.quest && this.distToPlayer(npc) < 90) {
            const y = npc.y - 34 + Math.sin(bobT * 3) * 2;
            ctx.fillStyle = 'rgba(16,12,9,.72)';
            ctx.fillRect(Math.round(npc.x) - 2, Math.round(y) - 1, 5, 7);
            G.text(ctx, '!', npc.x, y + 5, { size: 8, color: '#ffd479', align: 'center', weight: 'bold' });
          }
          const close = this.distToPlayer(npc) < 56;
          if (close) {
            G.text(ctx, npc.name, npc.x, npc.y - 34, {
              size: 8, color: '#f0dfc0', align: 'center', outline: 'rgba(10,7,5,.9)', outlineWidth: 3,
            });
          }
        },
      });
      this.interactables.push({
        x: npc.x, y: npc.y, r: npc.radius + 16, label: '与' + npc.name + '交谈',
        npc, action: () => this.talkTo(npc), condition: () => true,
      });
      return npc;
    }

    addInteract(o) {
      this.interactables.push(Object.assign({ r: 34, label: '互动' }, o));
      return o;
    }

    addLight(x, y, r, color, a) {
      this.lights.push({ x, y, r, color, a });
    }

    distToPlayer(o) {
      return Math.hypot(o.x - this.player.x, o.y - this.player.y);
    }

    /* ---------- ground ---------- */
    buildGround(fn) {
      const cv = document.createElement('canvas');
      cv.width = this.w;
      cv.height = this.h;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      fn(c);
      this.ground = cv;
    }

    /* ---------- lifecycle ---------- */
    enter(opts) {
      opts = opts || {};
      if (opts.spawn) this.setPlayer(opts.spawn.x, opts.spawn.y);
      this.placeCamera(true);
      G.ui.showHud(true);
      this.updateHud();
      if (G.audio.ctx) G.audio.ambient(this.ambient);
      this.onEnter(opts);
    }

    onEnter() {}
    exit() {
      G.ui.prompt(null);
    }

    setPlayer(x, y) {
      this.player.x = x;
      this.player.y = y;
      this.player.dir = 'up';
      this.placeCamera(true);
    }

    updateHud() {
      G.ui.clock(this.clock, this.dateLabel || this.defaultDateLabel());
    }

    defaultDateLabel() {
      const d = G.dateInfo(new Date());
      return d.cn + ' · 晴';
    }

    objective(text) { G.ui.objective(text); }

    talkTo(npc) {
      if (G.dialog.active) return;
      const lines = typeof npc.getLines === 'function' ? npc.getLines() : npc.lines;
      G.dialog.show(lines, () => { if (npc.onTalk) npc.onTalk(); });
    }

    /* ---------- update ---------- */
    update(dt) {
      this.time += dt;
      if (G.isWorldPaused()) {
        this.player.moving = false;
        G.ui.prompt(null);
        this.updatePaused(dt);
        return;
      }
      this.updatePlayer(dt);
      this.updateNPCs(dt);
      this.updateInteractions();
      this.placeCamera(false, dt);
      G.fx.update(dt);
      this.updateAmbient(dt);
    }

    updatePaused(dt) {
      G.fx.update(dt);
      this.updateAmbient(dt);
    }

    updatePlayer(dt) {
      const p = this.player;
      const ax = G.input.axis();
      const running = G.input.isDown('ShiftLeft', 'ShiftRight');
      const speed = running ? p.runSpeed : p.speed;
      const moving = !!(ax.x || ax.y);
      p.moving = moving;
      p.running = running && moving;
      if (moving) {
        if (Math.abs(ax.x) > Math.abs(ax.y) + 0.1) p.dir = ax.x < 0 ? 'left' : 'right';
        else if (Math.abs(ax.y) > Math.abs(ax.x) + 0.1) p.dir = ax.y < 0 ? 'up' : 'down';
        else p.dir = ax.y < 0 ? 'up' : 'down';
        const nx = p.x + ax.x * speed * dt;
        const ny = p.y + ax.y * speed * dt;
        this.tryMove(nx, ny);
        p.anim += dt * (running ? 13 : 9);
        this._stepTimer -= dt;
        if (this._stepTimer <= 0) {
          this._stepTimer = running ? 0.21 : 0.3;
          G.audio.sfx('step');
        }
        if (Math.random() < dt * (running ? 5 : 2.5)) {
          G.fx.add({
            x: p.x + G.rand(-4, 4), y: p.y + G.rand(-1, 1),
            vx: G.rand(-6, 6), vy: G.rand(-10, -2),
            life: G.rand(0.2, 0.45), size: 1, color: 'rgba(214,198,168,.5)',
            grav: 8, glow: false,
          });
        }
      } else {
        p.anim = 0;
      }
    }

    tryMove(nx, ny) {
      const p = this.player;
      if (!this.collides(nx, p.y)) p.x = G.clamp(nx, 6, this.w - 6);
      if (!this.collides(p.x, ny)) p.y = G.clamp(ny, 10, this.h - 4);
      p.x = G.clamp(p.x, 6, this.w - 6);
      p.y = G.clamp(p.y, 10, this.h - 4);
    }

    collides(x, y) {
      const bx = x - 4, by = y - 3, bw = 8, bh = 5;
      for (const s of this.solids) {
        if (bx < s.x + s.w && bx + bw > s.x && by < s.y + s.h && by + bh > s.y) return true;
      }
      return false;
    }

    updateNPCs(dt) {
      for (const n of this.npcs) {
        n.t += dt;
        if (n.wander && !G.dialog.active) {
          const dx = n.homeX - n.x, dy = n.homeY - n.y;
          if (Math.hypot(dx, dy) > 26 || n._wait > 0) {
            if (n._wait > 0) { n._wait -= dt; n.moving = false; }
            else {
              n.x += Math.sign(dx) * 10 * dt;
              n.y += Math.sign(dy) * 10 * dt;
              n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
              n.moving = true;
              n.anim = (n.anim || 0) + dt * 6;
              n.frame = 1 + (Math.floor(n.anim) % 2);
            }
          } else {
            n.moving = false;
            n.frame = 0;
            n._wait = G.rand(1.5, 4);
          }
        } else if (!n.wander) {
          n.moving = false;
          const dx = this.player.x - n.x, dy = this.player.y - n.y;
          if (Math.hypot(dx, dy) < 70) {
            n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
          }
        }
      }
    }

    updateInteractions() {
      let best = null, bestD = Infinity;
      for (const it of this.interactables) {
        if (it.condition && !it.condition()) continue;
        const d = Math.hypot(it.x - this.player.x, it.y - this.player.y);
        if (d < (it.r || 34) && d < bestD) { best = it; bestD = d; }
      }
      this._nearest = best;
      const text = best ? best.label : '';
      if (text !== this._promptText) {
        this._promptText = text;
        G.ui.prompt(text);
      }
      if (best && G.input.wasPressed('KeyE')) {
        G.input.clearPressed();
        G.audio.sfx('confirm');
        best.action();
      }
    }

    placeCamera(snap, dt) {
      const p = this.player;
      const tx = G.clamp(p.x - G.W / 2, 0, Math.max(0, this.w - G.W));
      const ty = G.clamp(p.y - G.H / 2 - this.lookAhead, 0, Math.max(0, this.h - G.H));
      if (snap) { this.cam.x = tx; this.cam.y = ty; return; }
      const k = 1 - Math.exp(-8 * (dt || 0.016));
      this.cam.x = G.lerp(this.cam.x, tx, k);
      this.cam.y = G.lerp(this.cam.y, ty, k);
    }

    updateAmbient() {}

    /* ---------- draw ---------- */
    draw(ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#0b0907';
      ctx.fillRect(0, 0, G.W, G.H);
      const cam = this.cam;
      const cx = Math.round(cam.x) + G.fx.ox;
      const cy = Math.round(cam.y) + G.fx.oy;
      ctx.save();
      ctx.translate(-cx, -cy);
      if (this.ground) {
        ctx.drawImage(this.ground, Math.round(cam.x), Math.round(cam.y), G.W, G.H,
          Math.round(cam.x), Math.round(cam.y), G.W, G.H);
      }
      this.drawGroundExtras(ctx);
      const list = this.entities.slice();
      list.push({
        x: this.player.x, y: this.player.y, baseY: this.player.y,
        draw: (c) => this.drawPlayer(c),
      });
      list.sort((a, b) => (a.baseY - b.baseY) || ((a.x || 0) - (b.x || 0)));
      // 视口裁剪：宫殿精灵比锚点高得多（午门约 540px），墙/灯还可能在锚点下方，
      // 所以留足纵向余量；实体也可以自带 bounds（x0/y0/x1/y1）做精确裁剪。
      const padTop = 760, padBottom = 620, padX = 480;
      for (const e of list) {
        if (e.bounds) {
          const b = e.bounds;
          if (b.y1 < cam.y - 60 || b.y0 > cam.y + G.H + 60) continue;
          if (b.x1 < cam.x - 60 || b.x0 > cam.x + G.W + 60) continue;
        } else {
          if (e.baseY < cam.y - padTop || e.baseY > cam.y + G.H + padBottom) continue;
          if (e.x != null && (e.x < cam.x - padX || e.x > cam.x + G.W + padX)) continue;
        }
        e.draw(ctx);
      }
      this.drawForeground(ctx);
      ctx.restore();
      G.fx.draw(ctx, cam);
      if (this.night) G.art.nightOverlay(ctx, cam, this.lights, this.nightStrength == null ? 0.5 : this.nightStrength);
      else if (this.dayGrade) G.art.dayGrade(ctx, this.time, this.gradeStrength);
      // 屏幕级颗粒：烘焙一次、每帧一次 drawImage，给平涂区域一层手作质感
      if (G.art.grainTexture) G.art.grainTexture(ctx);
      this.drawScreen(ctx);
      if (!this.mapOpen) this.drawMarkers(ctx);
    }

    drawPlayer(ctx) {
      const p = this.player;
      const frame = p.moving ? 1 + (Math.floor(p.anim) % 2) : 0;
      G.art.drawActor(ctx, p.x, p.y, {
        dir: p.dir, frame, moving: p.moving, time: this.time,
        palette: G.art.actorPalettes.player, scale: 1.28,
      });
    }

    drawGroundExtras() {}
    drawForeground() {}
    drawScreen() {}

    drawMarkers(ctx) {
      if (!this.marker) return;
      const m = this.marker;
      if (m.condition && !m.condition()) return;
      const x = m.x - this.cam.x, y = m.y - this.cam.y + Math.sin(this.time * 3) * 3;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffd479';
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x + 4, y - 15);
      ctx.lineTo(x, y - 10);
      ctx.lineTo(x - 4, y - 15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,212,121,.18)';
      ctx.beginPath();
      ctx.arc(x, y - 15, 10 + Math.sin(this.time * 2.5) * 2, 0, G.TAU);
      ctx.fill();
      ctx.restore();
    }

    drawActorEntity(x, y, palette, opt) {
      G.art.drawActor(this._ctx || null, x, y, Object.assign({ palette, time: this.time }, opt));
    }
  };
})();
