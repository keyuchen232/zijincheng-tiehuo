/* ============================================================
   紫禁城 · 铁火 — 打铁花 timing game
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const $ = G.$;

  const THROWS = 6;
  const IDEAL_LO = 0.52, IDEAL_HI = 0.84;

  class TiehuaGame {
    constructor() {
      this.active = false;
      this.finished = false;
      this.phase = 'ready';
      this.time = 0;
      this.parts = [];
      this.rings = [];
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.throwsLeft = THROWS;
      this.power = 0;
      this.powerDir = 1;
      this.heat = 0.5;
      this.aimT = 0;
      this.target = { x: 430, y: 150 };
      this.reticle = { x: 430, y: 150 };
      this.flight = 0;
      this.impactPoint = { x: 430, y: 150 };
      this.startPoint = { x: 244, y: 300 };
      this.flash = 0;
      this.shake = 0;
      this.settleT = 0;
      this.impactGlow = 0;
      this.impactAt = { x: 430, y: 150 };
      this.messageTimer = null;
      this.preview = true;
      this.best = 0;
      this.startedAt = 0;
      this.lastResult = null;
      this.bgStars = [];
      for (let i = 0; i < 100; i++) {
        this.bgStars.push({
          x: G.hash(i, 1, 9) * 640,
          y: G.hash(i, 2, 9) * 240,
          a: 0.2 + G.hash(i, 3, 9) * 0.7,
          s: G.hash(i, 4, 9) < 0.15 ? 2 : 1,
          tw: G.hash(i, 5, 9) * 6,
        });
      }
      this.initDOM();
    }

    initDOM() {
      const trigger = (e) => {
        if (!this.active) return;
        if (e.target.closest('button')) return;
        if (this.finished) return;
        e.preventDefault();
        this.action();
      };
      G.$('#game').addEventListener('pointerdown', trigger);
      G.$('#mg-result').addEventListener('click', (e) => e.stopPropagation());
      $('#res-retry').addEventListener('click', () => this.retry());
      $('#res-exit').addEventListener('click', () => this.exit());
    }

    start(opts) {
      opts = opts || {};
      this.callbacks = opts;
      this.active = true;
      this.finished = false;
      this.best = G.save.data.best || 0;
      this.reset();
      G.ui.showHud(false);
      G.ui.prompt(null);
      G.show($('#mg-hud'));
      G.hide($('#mg-result'));
      G.audio.ambient('night');
      G.audio.sfx('gong');
      G.fx.clear();
      this.banner('第 一 勺');
      this.setHint('按 <kbd>空格</kbd> 起炉 · 让铁水烧到最亮');
      this.phase = 'ready';
      this.startedAt = performance.now();
    }

    reset() {
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.throwsLeft = THROWS;
      this.power = 0;
      this.powerDir = 1;
      this.heat = 0.5;
      this.aimT = 0;
      this.phase = 'ready';
      this.finished = false;
      this.flight = 0;
      this.flash = 0;
      this.shake = 0;
      this.impactGlow = 0;
      this.parts.length = 0;
      this.rings.length = 0;
      this.settleT = 0;
      this.lastResult = null;
      this.updateHUD();
      this.updatePips();
      this.showMeter(false);
      this.hideResult();
      G.show($('#mg-hud'));
      this.target = { x: 430, y: 150 };
      this.reticle = { x: 430, y: 150 };
    }

    retry() {
      this.best = Math.max(this.best, G.save.data.best || 0);
      this.reset();
      this.phase = 'ready';
      this.setHint('按 <kbd>空格</kbd> 起炉 · 再打一场');
      this.banner('再 来 一 场');
      G.audio.sfx('gong');
    }

    exit() {
      if (!this.active) return;
      this.active = false;
      this.finished = false;
      this.parts.length = 0;
      this.rings.length = 0;
      G.hide($('#mg-hud'));
      G.hide($('#mg-result'));
      G.ui.showHud(true);
      G.input.clearPressed();
      if (this.callbacks && this.callbacks.onExit) {
        this.callbacks.onExit(this.score, { maxCombo: this.maxCombo, perfect: this.perfect });
      }
    }

    key(code) {
      if (!this.active || this.finished) return false;
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        this.action();
        return true;
      }
      return false;
    }

    action() {
      if (!this.active || this.finished) return;
      if (this.phase === 'ready') {
        this.startPower();
      } else if (this.phase === 'power') {
        this.lockPower();
      } else if (this.phase === 'aim') {
        this.throwIron();
      }
    }

    startPower() {
      this.phase = 'power';
      this.power = 0;
      this.powerDir = 1;
      this.showMeter(true);
      $('#mg-meter-label').textContent = '火 力';
      this.setHint('在金色区间按下 <kbd>空格</kbd> · 稳住手腕');
      G.audio.sfx('whoosh');
    }

    lockPower() {
      const p = this.power;
      const inZone = p >= IDEAL_LO && p <= IDEAL_HI;
      this.heat = inZone ? 0.75 + 0.25 * (1 - Math.abs(p - 0.68) / 0.16) : 0.35;
      this.heat = G.clamp(this.heat, 0.25, 1);
      this.banner(inZone ? (this.heat > 0.92 ? '火候正好' : '火候不错') : '火候偏了');
      G.audio.sfx(inZone ? 'confirm' : 'error');
      if (inZone) {
        for (let i = 0; i < 10; i++) {
          this.addPart({
            x: 110 + G.rand(-12, 12), y: 280 + G.rand(-10, 10),
            vx: G.rand(-30, 30), vy: G.rand(-60, -20),
            life: G.rand(0.3, 0.8), size: G.rand(1, 2),
            color: G.pick(['#ffd479', '#ff9d3c']), grav: -20, type: 'spark',
          });
        }
      }
      this.phase = 'aim';
      this.aimT = 0;
      this.showMeter(false);
      this.newTarget();
      this.setHint('对准花心 · 按下 <kbd>空格</kbd> 泼铁');
    }

    newTarget() {
      this.target = {
        x: 372 + G.rand(0, 116),
        y: 106 + G.rand(0, 98),
        r: 25,
        born: this.time,
      };
      this.reticle = { x: 430, y: 150 };
    }

    updateAimReticle() {
      const cx = 434, cy = 153;
      this.reticle.x = cx + Math.sin(this.aimT * 1.75) * 68;
      this.reticle.y = cy + Math.sin(this.aimT * 2.34 + 1.3) * 46;
    }

    throwIron() {
      const d = Math.hypot(this.reticle.x - this.target.x, this.reticle.y - this.target.y);
      this.lastDist = d;
      this.impactPoint = { x: this.reticle.x, y: this.reticle.y };
      this.phase = 'flight';
      this.flight = 0;
      this.showMeter(false);
      this.setHint('铁水出手 · 看好了');
      G.audio.sfx('whoosh');
      this.scoreThrow(d);
    }

    scoreThrow(dist) {
      const acc = G.clamp(1 - dist / 78, 0, 1);
      const perfect = dist <= 14;
      if (perfect) this.perfect++;
      const hit = acc > 0.18;
      if (hit) {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
      } else {
        this.combo = 0;
      }
      const base = 150 + acc * 460 + this.heat * 160;
      const mult = 1 + Math.min(this.combo, 5) * 0.12;
      const gain = Math.round(base * mult);
      this.score += gain;
      this.updateHUD();
      this.updatePips();
      this.pendingScore = { gain, acc, perfect, hit, dist };
      if (perfect) this.banner('完 美');
      else if (dist < 34) this.banner('漂 亮');
      else if (hit) this.banner('擦 边');
      else this.banner('脱 靶');
      if (perfect) G.audio.sfx('cheer');
    }

    impact() {
      const p = this.impactPoint;
      const ps = this.pendingScore || { acc: 0.5, perfect: false, gain: 0 };
      this.shake = 10 + ps.acc * 8;
      this.flash = 0.7 + ps.acc * 0.3;
      this.impactGlow = 1;
      this.impactAt = { x: p.x, y: p.y };
      G.audio.sfx('boom');
      G.audio.sfx('crackle');
      if (ps.acc > 0.4) G.audio.sfx('cheer');
      // dense white-hot core
      for (let i = 0; i < 46; i++) {
        const a = G.rand(0, G.TAU);
        const sp = G.rand(10, 70);
        this.addPart({
          x: p.x + G.rand(-5, 5), y: p.y + G.rand(-5, 5),
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: G.rand(0.3, 0.9), size: G.rand(2.5, 5),
          color: G.pick(['#fff9de', '#fff0b0', '#ffd479']),
          grav: 30, drag: 0.95, type: 'spark', streak: false,
        });
      }
      // radiating iron sparks
      const n = 200 + Math.round(ps.acc * 160);
      for (let i = 0; i < n; i++) {
        const a = G.rand(-Math.PI * 0.98, Math.PI * 0.02);
        const sp = G.rand(35, 190) * (0.55 + ps.acc);
        this.addPart({
          x: p.x + G.rand(-5, 5), y: p.y + G.rand(-5, 5),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: G.rand(0.6, 1.9),
          size: G.rand(1.2, 3.4),
          color: G.pick(['#fff3c4', '#ffd479', '#ff9d3c', '#ff5e1a', '#e84516']),
          grav: 170, drag: 0.988, type: 'spark', streak: true,
        });
      }
      // heavy molten drops
      for (let i = 0; i < 36; i++) {
        const a = G.rand(-Math.PI, 0);
        const sp = G.rand(25, 100);
        this.addPart({
          x: p.x + G.rand(-12, 12), y: p.y + G.rand(-8, 8),
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: G.rand(1.2, 2.4), size: G.rand(2.5, 4.5),
          color: G.pick(['#ff8a2a', '#ffb347', '#ff5a1a']),
          grav: 250, drag: 0.99, type: 'spark', streak: true,
        });
      }
      // embers drifting down
      for (let i = 0; i < 40; i++) {
        this.addPart({
          x: p.x + G.rand(-60, 90), y: p.y + G.rand(-60, 10),
          vx: G.rand(-14, 14), vy: G.rand(-2, 26),
          life: G.rand(1.4, 3), size: G.rand(1, 2.2),
          color: G.pick(['#ffcf7a', '#ff8840']), grav: 18, type: 'spark',
        });
      }
      // smoke
      for (let i = 0; i < 22; i++) {
        this.addPart({
          x: p.x + G.rand(-30, 30), y: p.y + G.rand(-12, 12),
          vx: G.rand(-8, 8), vy: G.rand(-18, -4),
          life: G.rand(1, 2.4), size: G.rand(3, 8),
          color: 'rgba(70,55,50,.35)', grav: -6, type: 'smoke',
        });
      }
      this.rings.push({ x: p.x, y: p.y, r: 6, max: 92, life: 0.85, maxLife: 0.85 });
      this.rings.push({ x: p.x, y: p.y, r: 2, max: 52, life: 0.55, maxLife: 0.55 });
      this.rings.push({ x: p.x, y: p.y, r: 2, max: 30, life: 0.35, maxLife: 0.35 });
      if (ps.acc > 0.25) this.addFloatingText(p.x, p.y - 34, '+' + (ps.gain || 0), '#ffe2a1');
      this.phase = 'settle';
      this.settleT = 1.35;
    }

    nextThrow() {
      this.throwsLeft--;
      this.updatePips();
      if (this.throwsLeft <= 0) {
        this.finish();
        return;
      }
      this.phase = 'ready';
      this.setHint('按 <kbd>空格</kbd> 起炉 · 还剩 ' + this.throwsLeft + ' 勺铁水');
      this.banner('再 来');
    }

    finish() {
      if (this.finished) return;
      this.finished = true;
      this.showMeter(false);
      this.setHint('');
      const stars = this.score >= 6000 ? 3 : this.score >= 3800 ? 2 : this.score >= 1800 ? 1 : 0;
      const title = stars === 3 ? '铁树银花不夜天' : stars === 2 ? '火树银花' : stars === 1 ? '铁水初绽' : '再添一把火';
      const line = stars === 3 ? '铁水击上万点花棚，整座紫禁城都被烧成了金色。' :
        stars === 2 ? '火星像一场倒着下的雨，落在红墙与人群之间。' :
          stars === 1 ? '第一勺铁水已经飞起来了，再稳一点，花会开得更大。' :
            '铁水凉得有点快。老赵说，别急，再来一炉。';
      const best = Math.max(this.best, this.score);
      G.save.data.best = best;
      G.save.data.plays = (G.save.data.plays || 0) + 1;
      G.save.persist();
      this.best = best;
      this.lastResult = { stars, title, line, best };
      $('#res-title').textContent = title;
      $('#res-stars').textContent = '★★★☆☆☆'.slice(3 - stars, 6 - stars);
      $('#res-score').textContent = this.score.toLocaleString('zh-CN');
      $('#res-combo').textContent = this.maxCombo;
      $('#res-perfect').textContent = this.perfect;
      $('#res-best').textContent = best.toLocaleString('zh-CN');
      $('#res-line').textContent = line;
      G.show($('#mg-result'));
      G.hide($('#mg-hud'));
      G.audio.sfx('gong');
      if (this.callbacks && this.callbacks.onScore) this.callbacks.onScore(this.score, best);
      // celebratory finale sparks
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (!this.active) return;
          const x = 300 + i * 70, y = 80 + i * 10;
          for (let k = 0; k < 70; k++) {
            const a = G.rand(0, G.TAU), sp = G.rand(30, 180);
            this.addPart({
              x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              life: G.rand(0.5, 1.6), size: G.rand(1, 2.4),
              color: G.pick(['#ffd479', '#ff9d3c', '#fff3c4']), grav: 90, type: 'spark', streak: true,
            });
          }
          G.audio.sfx('crackle');
        }, 380 + i * 320);
      }
    }

    /* ---------------- HUD ---------------- */
    setHint(html) { $('#mg-hint').innerHTML = html; }
    showMeter(v) { $('#mg-meter').classList.toggle('show', v); }
    banner(text) {
      const el = $('#mg-message');
      el.textContent = text;
      el.classList.add('show');
      clearTimeout(this.messageTimer);
      this.messageTimer = setTimeout(() => el.classList.remove('show'), 760);
    }
    updateHUD() {
      $('#mg-score').textContent = this.score.toLocaleString('zh-CN');
      const c = $('#mg-combo');
      if (this.combo >= 2) { c.classList.remove('hidden'); $('#mg-combo-n').textContent = this.combo; }
      else c.classList.add('hidden');
    }
    updatePips() {
      const wrap = $('#mg-pips');
      if (!wrap) return;
      if (wrap.children.length !== THROWS) {
        wrap.innerHTML = '';
        for (let i = 0; i < THROWS; i++) wrap.appendChild(document.createElement('i'));
      }
      Array.from(wrap.children).forEach((el, i) => el.classList.toggle('on', i < this.throwsLeft));
    }
    hideResult() { G.hide($('#mg-result')); }

    /* ---------------- particles ---------------- */
    addPart(p) {
      if (this.parts.length > 1600) this.parts.splice(0, 200);
      p.life = p.life || 1; p.max = p.life;
      p.size = p.size || 1; p.vx = p.vx || 0; p.vy = p.vy || 0;
      p.grav = p.grav || 0; p.drag = p.drag == null ? 1 : p.drag;
      p.type = p.type || 'spark';
      this.parts.push(p);
    }
    addFloatingText(x, y, text, color) {
      this.parts.push({ x, y, vx: 0, vy: -22, life: 1.3, max: 1.3, size: 1, color, grav: 0, type: 'text', text });
    }
    updateParts(dt) {
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.life -= dt;
        if (p.life <= 0) { this.parts.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.life -= dt;
        r.r = G.lerp(r.r, r.max, 1 - Math.exp(-6 * dt));
        if (r.life <= 0) this.rings.splice(i, 1);
      }
    }

    /* ---------------- update ---------------- */
    update(dt) {
      this.time += dt;
      this.updateParts(dt);
      this.flash = Math.max(0, this.flash - dt * 2.3);
      this.shake = Math.max(0, this.shake - dt * 18);
      this.impactGlow = Math.max(0, this.impactGlow - dt * 1.35);
      if (this.finished) {
        if (Math.random() < dt * 2) this.ambientEmber();
        return;
      }
      if (this.phase === 'power') {
        this.power += dt * 1.32 * this.powerDir;
        if (this.power >= 1) { this.power = 1; this.powerDir = -1; }
        if (this.power <= 0) { this.power = 0; this.powerDir = 1; }
        const needle = $('#mg-needle');
        if (needle) needle.style.left = (this.power * 100) + '%';
      } else if (this.phase === 'aim') {
        this.aimT += dt;
        this.updateAimReticle();
      } else if (this.phase === 'flight') {
        this.flight += dt / 0.55;
        if (this.flight >= 1) { this.flight = 1; this.impact(); }
        else {
          const pos = this.projectilePos(this.flight);
          for (let i = 0; i < 2; i++) {
            this.addPart({
              x: pos.x + G.rand(-2, 2), y: pos.y + G.rand(-2, 2),
              vx: G.rand(-14, 14), vy: G.rand(-14, 6),
              life: G.rand(0.2, 0.5), size: G.rand(1, 2),
              color: G.pick(['#ffd479', '#ff9d3c', '#fff0b8']), grav: 10, type: 'spark',
            });
          }
        }
      } else if (this.phase === 'settle') {
        this.settleT -= dt;
        if (this.settleT <= 0) this.nextThrow();
      }
      if (Math.random() < dt * 5) this.ambientEmber();
    }

    ambientEmber() {
      this.addPart({
        x: 105 + G.rand(-26, 20), y: 286 + G.rand(-8, 8),
        vx: G.rand(-10, 10), vy: G.rand(-40, -12),
        life: G.rand(0.6, 1.6), size: G.rand(1, 2),
        color: G.pick(['#ffb347', '#ff7a29', '#ffd479']), grav: -8, type: 'spark',
      });
    }

    projectilePos(t) {
      const s = this.startPoint, e = this.impactPoint;
      const cx = (s.x + e.x) / 2 + 12, cy = Math.min(s.y, e.y) - 96;
      const mt = 1 - t;
      return {
        x: mt * mt * s.x + 2 * mt * t * cx + t * t * e.x,
        y: mt * mt * s.y + 2 * mt * t * cy + t * t * e.y,
      };
    }

    /* ---------------- draw ---------------- */
    draw(ctx) {
      if (!this.active) return;
      ctx.imageSmoothingEnabled = false;
      const sx = this.shake ? G.rand(-this.shake, this.shake) * 0.5 : 0;
      const sy = this.shake ? G.rand(-this.shake, this.shake) * 0.5 : 0;
      ctx.save();
      ctx.translate(Math.round(sx), Math.round(sy));
      this.drawSky(ctx);
      this.drawBackdrop(ctx);
      this.drawFlowerFrame(ctx);
      this.drawGround(ctx);
      this.drawFurnace(ctx);
      this.drawPerformers(ctx);
      this.drawCrowd(ctx);
      if (this.phase === 'aim') this.drawAim(ctx);
      this.drawParticles(ctx);
      this.drawForeground(ctx);
      ctx.restore();
      if (this.flash > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,170,80,' + (this.flash * 0.2) + ')';
        ctx.fillRect(0, 0, 640, 360);
        ctx.restore();
      }
    }

    drawSky(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 300);
      g.addColorStop(0, '#070d1c');
      g.addColorStop(0.55, '#131126');
      g.addColorStop(1, '#2b1a20');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
      for (const s of this.bgStars) {
        const tw = 0.55 + 0.45 * Math.sin(this.time * 1.2 + s.tw);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.s > 1 ? '#ffe9b8' : '#dfe6ff';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.s, s.s);
      }
      ctx.globalAlpha = 1;
      // moon
      A.glow(ctx, 546, 58, 62, 'rgba(236,215,160,.22)', 0.55);
      ctx.fillStyle = '#f0e3bf';
      ctx.beginPath(); ctx.arc(546, 58, 17, 0, G.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(205,190,150,.55)';
      ctx.beginPath(); ctx.arc(552, 53, 4, 0, G.TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(541, 64, 2.5, 0, G.TAU); ctx.fill();
      // thin clouds
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#7e8db3';
      for (let i = 0; i < 3; i++) {
        const y = 82 + i * 34;
        const off = (this.time * 4 + i * 120) % 900 - 150;
        ctx.fillRect(off, y, 240, 2);
        ctx.fillRect(off + 60, y + 3, 180, 1);
      }
      ctx.restore();
    }

    drawBackdrop(ctx) {
      // distant city silhouette
      ctx.fillStyle = '#0a0c15';
      ctx.fillRect(0, 208, 640, 92);
      // skyline towers left
      const towers = [[18, 168, 30], [52, 150, 20], [82, 176, 26], [118, 160, 18], [148, 184, 34]];
      for (const [x, y, w] of towers) {
        ctx.fillRect(x, y, w, 208 - y);
        ctx.fillStyle = 'rgba(216,190,120,.18)';
        for (let yy = y + 4; yy < 204; yy += 8) ctx.fillRect(x + 3, yy, 2, 2);
        ctx.fillStyle = '#0a0c15';
      }
      // distant palace roofs
      ctx.fillStyle = '#100d14';
      for (let i = 0; i < 4; i++) {
        const x = 300 + i * 84;
        ctx.fillRect(x, 178 + i * 3, 72, 10);
        ctx.beginPath();
        ctx.moveTo(x - 8, 178 + i * 3);
        ctx.lineTo(x + 36, 162 + i * 3);
        ctx.lineTo(x + 80, 178 + i * 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(216,178,106,.18)';
        ctx.stroke();
      }
      // 神武门 wall
      ctx.fillStyle = '#2a1417';
      ctx.fillRect(0, 212, 640, 88);
      const wallGrad = ctx.createLinearGradient(0, 214, 0, 300);
      wallGrad.addColorStop(0, '#4a1e20');
      wallGrad.addColorStop(0.5, '#351a1d');
      wallGrad.addColorStop(1, '#1c0f10');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 214, 640, 80);
      ctx.fillStyle = 'rgba(216,178,106,.24)';
      ctx.fillRect(0, 212, 640, 1);
      // wall bricks
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#080506';
      for (let y = 222; y < 300; y += 7) ctx.fillRect(0, y, 640, 1);
      for (let y = 222; y < 300; y += 14) {
        for (let x = (y % 28 === 0 ? 0 : 14); x < 640; x += 28) ctx.fillRect(x, y, 1, 7);
      }
      ctx.restore();
      // gate silhouette
      ctx.fillStyle = '#160b0c';
      ctx.fillRect(516, 206, 74, 94);
      ctx.fillStyle = '#3a1a1b';
      ctx.fillRect(522, 232, 62, 68);
      ctx.beginPath();
      ctx.arc(553, 232, 31, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#0d0708';
      ctx.fillRect(538, 244, 30, 56);
      // gate doors with gold studs
      ctx.fillStyle = '#3b1a13';
      ctx.fillRect(548, 252, 11, 48);
      ctx.fillStyle = '#d8b26a';
      for (let yy = 257; yy < 296; yy += 7) ctx.fillRect(551, yy, 1, 1);
      // 神武门 gate tower silhouette
      ctx.fillStyle = '#1c0f12';
      ctx.fillRect(474, 178, 112, 36);
      ctx.fillStyle = '#2b171a';
      ctx.fillRect(480, 184, 100, 27);
      ctx.fillStyle = '#0e090b';
      for (let i = 0; i < 4; i++) ctx.fillRect(490 + i * 22, 190, 10, 14);
      ctx.fillStyle = 'rgba(255,190,100,.22)';
      ctx.fillRect(493 + (this.time * 2 % 22 | 0), 194, 3, 6);
      ctx.fillStyle = 'rgba(216,178,106,.3)';
      ctx.fillRect(474, 177, 112, 1);
      // double roof, with gold rim
      for (const [ry, rw] of [[177, 72], [162, 50]]) {
        ctx.fillStyle = '#0c090c';
        ctx.beginPath();
        ctx.moveTo(553 - rw, ry);
        ctx.lineTo(553, ry - 17);
        ctx.lineTo(553 + rw, ry);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,187,104,.3)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(232,187,104,.2)';
        ctx.fillRect(553 - rw, ry - 1, rw * 2, 1);
      }
      // name board and lanterns
      ctx.fillStyle = '#17100c';
      ctx.fillRect(531, 198, 44, 11);
      ctx.strokeStyle = 'rgba(216,178,106,.42)';
      ctx.strokeRect(531.5, 198.5, 43, 10);
      G.text(ctx, '神武门', 553, 207, { size: 6, color: '#e8c88e', align: 'center' });
      for (const lx of [300, 340, 610, 632]) {
        A.glow(ctx, lx, 228, 30, 'rgba(255,140,50,.45)', 0.35);
        ctx.fillStyle = '#d45637';
        ctx.fillRect(lx - 4, 222, 8, 9);
        ctx.fillStyle = '#ffd479';
        ctx.fillRect(lx - 2, 225, 4, 3);
      }
      // paper charms hanging from the flower frame
      for (const [lx, ly] of [[372, 92], [500, 92], [378, 152], [502, 152]]) {
        ctx.fillStyle = '#7d3324';
        ctx.fillRect(lx, ly, 5, 11);
        ctx.fillStyle = '#e1bd74';
        ctx.fillRect(lx + 1, ly + 2, 3, 1);
        ctx.fillRect(lx + 1, ly + 5, 1, 4);
      }
      // drifting haze from the furnace
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const hz = ctx.createRadialGradient(140, 260, 10, 140, 260, 220);
      hz.addColorStop(0, 'rgba(255,130,45,.12)');
      hz.addColorStop(1, 'rgba(255,130,45,0)');
      ctx.fillStyle = hz;
      ctx.fillRect(0, 120, 420, 240);
      ctx.restore();
    }

    drawFlowerFrame(ctx) {
      // willow branches backdrop
      ctx.save();
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 26; i++) {
        const x = 352 + G.hash(i, 2, 5) * 170;
        ctx.strokeStyle = i % 3 === 0 ? '#4b4a2f' : '#3d3a28';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 70 + G.hash(i, 4, 6) * 30);
        ctx.quadraticCurveTo(x + 10, 140, x - 6, 220 + G.hash(i, 8, 7) * 50);
        ctx.stroke();
      }
      ctx.restore();
      // frame posts
      const posts = [[356, 74, 208], [510, 74, 208]];
      for (const [x, y, h] of posts) {
        A.r(ctx, x, y, 7, h, '#3a2418');
        A.r(ctx, x + 1, y, 2, h, '#5b3a24');
        A.r(ctx, x + 5, y, 1, h, '#1e130d');
        // footing
        A.r(ctx, x - 4, y + h - 8, 15, 8, '#241811');
      }
      // crossbars
      for (const y of [88, 150, 212]) {
        A.r(ctx, 350, y, 174, 6, '#4a2e1d');
        A.r(ctx, 350, y, 174, 2, '#6b452a');
        A.r(ctx, 350, y + 5, 174, 1, '#24160f');
      }
      // diagonal braces
      ctx.strokeStyle = '#4d3020';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(360, 214); ctx.lineTo(410, 150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(506, 214); ctx.lineTo(456, 150); ctx.stroke();
      // hanging target board
      const t = this.target;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 3.2);
      A.glow(ctx, t.x, t.y, 48 + pulse * 8, 'rgba(255,170,60,.28)', 0.4);
      ctx.fillStyle = '#2b1a12';
      ctx.beginPath(); ctx.arc(t.x, t.y, 33, 0, G.TAU); ctx.fill();
      ctx.fillStyle = '#8a6638';
      ctx.beginPath(); ctx.arc(t.x, t.y, 30, 0, G.TAU); ctx.fill();
      ctx.strokeStyle = '#e2b15c';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(t.x, t.y, 29, 0, G.TAU); ctx.stroke();
      ctx.strokeStyle = '#f3d28a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(t.x, t.y, 23, 0, G.TAU); ctx.stroke();
      ctx.strokeStyle = '#b85c32';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(t.x, t.y, 16, 0, G.TAU); ctx.stroke();
      ctx.fillStyle = '#b3402c';
      ctx.beginPath(); ctx.arc(t.x, t.y, 8, 0, G.TAU); ctx.fill();
      ctx.fillStyle = '#ffe2a1';
      ctx.beginPath(); ctx.arc(t.x, t.y, 3.5, 0, G.TAU); ctx.fill();
      if (this.phase === 'aim') {
        ctx.strokeStyle = 'rgba(255,226,161,' + (0.4 + pulse * 0.5) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(t.x, t.y, 38 + pulse * 4, 0, G.TAU); ctx.stroke();
      }
      // ropes
      ctx.strokeStyle = '#7a5a37'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(t.x - 18, t.y - 26); ctx.lineTo(t.x - 12, 214); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t.x + 18, t.y - 26); ctx.lineTo(t.x + 12, 214); ctx.stroke();
      // small decorative boards
      for (const [bx, by] of [[386, 190], [482, 120]]) {
        ctx.fillStyle = '#5b4027';
        ctx.beginPath(); ctx.arc(bx, by, 9, 0, G.TAU); ctx.fill();
        ctx.strokeStyle = '#a37c48';
        ctx.stroke();
      }
    }

    drawGround(ctx) {
      // ground
      const g = ctx.createLinearGradient(0, 290, 0, 360);
      g.addColorStop(0, '#1f1714');
      g.addColorStop(1, '#0f0b09');
      ctx.fillStyle = g;
      ctx.fillRect(0, 292, 640, 68);
      // stone tiles
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#7a6650';
      for (let y = 296; y < 360; y += 9) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke(); }
      for (let x = 0; x < 640; x += 26) { ctx.beginPath(); ctx.moveTo(x, 292); ctx.lineTo(x - 14, 360); ctx.stroke(); }
      ctx.restore();
      // warm reflections
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(80, 300, 200, 360);
      grad.addColorStop(0, 'rgba(255,130,40,.28)');
      grad.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(62, 310); ctx.lineTo(165, 310); ctx.lineTo(210, 360); ctx.lineTo(30, 360);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    drawFurnace(ctx) {
      // base
      A.r(ctx, 52, 272, 92, 34, '#2b211a');
      A.r(ctx, 56, 266, 84, 12, '#4a3524');
      A.r(ctx, 58, 264, 80, 4, '#74502f');
      // crucible
      A.r(ctx, 78, 244, 46, 26, '#3c2c20');
      A.r(ctx, 80, 242, 42, 6, '#6b4b2b');
      A.glow(ctx, 101, 250, 44, 'rgba(255,120,30,.5)', 0.55);
      ctx.fillStyle = '#ff9d3c';
      ctx.beginPath(); ctx.ellipse(101, 248, 18, 5, 0, 0, G.TAU); ctx.fill();
      ctx.fillStyle = '#ffe0a0';
      ctx.beginPath(); ctx.ellipse(101, 247, 11, 3, 0, 0, G.TAU); ctx.fill();
      // fire
      for (let i = 0; i < 5; i++) {
        const fx = 88 + i * 7;
        const fh = 9 + Math.sin(this.time * 8 + i) * 5;
        ctx.fillStyle = i % 2 ? '#ff8a2a' : '#ffc154';
        ctx.beginPath();
        ctx.moveTo(fx, 248);
        ctx.quadraticCurveTo(fx + 4, 248 - fh, fx + 7, 248);
        ctx.fill();
      }
      // bellows
      A.r(ctx, 36, 284, 20, 12, '#3d2b1c');
      A.r(ctx, 40, 280, 12, 5, '#5a3c25');
      A.r(ctx, 58, 286, 20, 3, '#241a12');
      // pipe
      A.r(ctx, 66, 258, 6, 10, '#2a2018');
      A.r(ctx, 68, 254, 3, 8, '#4a3826');
    }

    drawPerformers(ctx) {
      // 老赵 watching
      A.drawActor(ctx, 158, 330, {
        dir: 'right', frame: 0, time: this.time, scale: 2.05,
        palette: A.actorPalettes.zhao,
      });
      // player throwing
      const p = this.playerPose();
      A.drawActor(ctx, 224, 332, {
        dir: 'right', frame: 0, time: this.time, scale: 2.15,
        palette: A.actorPalettes.player,
      });
      // ladle
      const hx = 238, hy = 300;
      const ang = p.angle;
      const len = 50;
      const tx = hx + Math.cos(ang) * len, ty = hy + Math.sin(ang) * len;
      ctx.strokeStyle = '#7d5b36';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = '#4b3522';
      ctx.beginPath(); ctx.ellipse(tx, ty, 6, 4, ang, 0, G.TAU); ctx.fill();
      if (this.phase === 'flight') {
        A.glow(ctx, tx, ty, 18, 'rgba(255,160,50,.5)', 0.5);
      }
      // hands
      ctx.fillStyle = '#e8b58d';
      ctx.fillRect(hx - 2, hy - 2, 4, 4);
    }

    playerPose() {
      if (this.phase === 'flight') {
        return { angle: -0.9 + this.flight * 0.4 };
      }
      if (this.phase === 'power') {
        return { angle: -0.55 + Math.sin(this.time * 4) * 0.05 };
      }
      if (this.phase === 'aim') {
        return { angle: -0.25 + Math.sin(this.aimT * 1.75) * 0.12 };
      }
      return { angle: -0.45 };
    }

    drawCrowd(ctx) {
      // silhouette crowd along bottom
      ctx.fillStyle = '#080606';
      for (let i = 0; i < 34; i++) {
        const x = i * 20 + (i % 3) * 3;
        const h = 15 + (G.hash(i, 1, 11) * 12);
        const bob = Math.sin(this.time * 2 + i * 0.7) * 0.7;
        ctx.fillRect(x, 356 - h + bob, 8, h + 6);
        ctx.beginPath();
        ctx.arc(x + 4, 356 - h - 2 + bob, 4.2, 0, G.TAU);
        ctx.fill();
      }
      // phone screens / camera flashes
      for (let i = 0; i < 7; i++) {
        const phase = (this.time * 0.7 + i * 0.31) % 1;
        if (phase < 0.1) {
          const x = 52 + i * 86;
          A.glow(ctx, x, 326, 18, 'rgba(220,235,255,.5)', 0.5);
          ctx.fillStyle = '#dfeaff';
          ctx.fillRect(x - 3, 320, 6, 9);
        }
      }
      // foreground heads (very near)
      ctx.fillStyle = '#050404';
      for (let i = 0; i < 5; i++) {
        const x = 60 + i * 138;
        ctx.beginPath(); ctx.arc(x, 372, 12 + (i % 2) * 3, 0, G.TAU); ctx.fill();
      }
    }

    drawAim(ctx) {
      const t = this.target;
      const r = this.reticle;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 5);
      // dotted preview arc
      ctx.save();
      ctx.globalAlpha = 0.35;
      for (let i = 1; i < 18; i++) {
        const tt = i / 18;
        const p = this.previewPoint(tt);
        ctx.fillStyle = i % 2 ? '#ffd479' : '#fff3c4';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      ctx.restore();
      // target ring
      ctx.save();
      ctx.strokeStyle = 'rgba(255,206,115,' + (0.45 + pulse * 0.45) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(t.x, t.y, 25 + pulse * 3, 0, G.TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,206,115,.25)';
      ctx.beginPath(); ctx.arc(t.x, t.y, 33, 0, G.TAU); ctx.stroke();
      ctx.restore();
      // crosshair
      const near = Math.hypot(r.x - t.x, r.y - t.y) < 22;
      const col = near ? '#7ff0dc' : '#ffe2a1';
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(r.x, r.y, 9, 0, G.TAU); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r.x - 14, r.y); ctx.lineTo(r.x - 5, r.y);
      ctx.moveTo(r.x + 5, r.y); ctx.lineTo(r.x + 14, r.y);
      ctx.moveTo(r.x, r.y - 14); ctx.lineTo(r.x, r.y - 5);
      ctx.moveTo(r.x, r.y + 5); ctx.lineTo(r.x, r.y + 14);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillRect(r.x - 1, r.y - 1, 2, 2);
      ctx.restore();
      // connection from ladle
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#ffd479';
      ctx.beginPath(); ctx.moveTo(232, 300); ctx.lineTo(r.x, r.y); ctx.stroke();
      ctx.restore();
    }

    previewPoint(t) {
      const s = { x: 238, y: 300 };
      const e = this.reticle;
      const cx = (s.x + e.x) / 2 + 12, cy = Math.min(s.y, e.y) - 96;
      const mt = 1 - t;
      return {
        x: mt * mt * s.x + 2 * mt * t * cx + t * t * e.x,
        y: mt * mt * s.y + 2 * mt * t * cy + t * t * e.y,
      };
    }

    drawParticles(ctx) {
      // afterglow of the iron burst
      if (this.impactGlow > 0.01) {
        const a = this.impactGlow;
        const gx = this.impactAt.x, gy = this.impactAt.y;
        A.glow(ctx, gx, gy, 58 + (1 - a) * 32, 'rgba(255,150,50,.5)', a * 0.55);
        A.glow(ctx, gx, gy, 22, 'rgba(255,236,164,.65)', a * 0.45);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.4;
        ctx.strokeStyle = '#ffbf58';
        ctx.lineWidth = 1;
        for (let i = 0; i < 11; i++) {
          const ang = (i / 11) * G.TAU + this.time * 0.16;
          const inner = 7;
          const outer = 24 + (1 - a) * 44 + (i % 3) * 8;
          ctx.beginPath();
          ctx.moveTo(gx + Math.cos(ang) * inner, gy + Math.sin(ang) * inner);
          ctx.lineTo(gx + Math.cos(ang) * outer, gy + Math.sin(ang) * outer);
          ctx.stroke();
        }
        ctx.restore();
      }
      // rings
      for (const r of this.rings) {
        const a = G.clamp(r.life / r.maxLife, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.6;
        ctx.strokeStyle = '#ffbd63';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, G.TAU); ctx.stroke();
        ctx.restore();
      }
      // smoke first
      for (const p of this.parts) {
        if (p.type !== 'smoke') continue;
        const a = G.clamp(p.life / p.max, 0, 1);
        ctx.save();
        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.4 - a * 0.4), 0, G.TAU); ctx.fill();
        ctx.restore();
      }
      // sparks
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.parts) {
        if (p.type === 'smoke') continue;
        if (p.type === 'text') {
          const a = G.clamp(p.life / p.max, 0, 1);
          G.text(ctx, p.text, p.x, p.y, {
            size: 9, color: p.color, align: 'center', weight: 'bold',
            outline: 'rgba(30,10,0,.7)', outlineWidth: 3, alpha: a,
          });
          continue;
        }
        const a = G.clamp(p.life / p.max, 0, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        if (p.streak) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, p.size * 0.7);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.028, p.y - p.vy * 0.028);
          ctx.stroke();
          ctx.fillStyle = '#fff6d8';
          ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, p.size * 0.7), Math.max(1, p.size * 0.7));
        } else {
          const s = Math.max(1, p.size * (0.4 + a * 0.7));
          ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
        }
      }
      ctx.restore();
      // flight projectile
      if (this.phase === 'flight') {
        const pos = this.projectilePos(this.flight);
        A.glow(ctx, pos.x, pos.y, 30, 'rgba(255,170,60,.7)', 0.6);
        ctx.fillStyle = '#fff5d0';
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 3, 0, G.TAU); ctx.fill();
        ctx.fillStyle = '#ffb347';
        ctx.beginPath(); ctx.arc(pos.x - 2, pos.y - 1, 5, 0, G.TAU); ctx.fill();
      }
    }

    drawForeground(ctx) {
      // warm firelight on the courtyard floor
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const warm = ctx.createLinearGradient(0, 250, 0, 360);
      warm.addColorStop(0, 'rgba(255,120,40,0)');
      warm.addColorStop(1, 'rgba(255,120,40,.09)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 250, 640, 110);
      ctx.restore();
      // subtle vignette
      const g = ctx.createRadialGradient(320, 170, 130, 320, 180, 360);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.5)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
    }
  }

  G.minigame = new TiehuaGame();
})();
