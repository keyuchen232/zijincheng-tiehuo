/* ============================================================
   雅典 · 圣火 — 引雷 · 循光 (sequence / memory game)
   Replaces the old bellows+aim torch pitch. At night, the
   priests light three bronze porch lights in a short sequence;
   the player must repeat it on the same three lamps.
   Keeps the G.minigame interface used by acropolis.js and the
   result HUD ids, so the rest of the game is untouched.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const $ = G.$;

  const ROUNDS = 6;
  const LAMPS = 3;                      // three porch lights
  const PILL = [
    { x: 300, fy: 150, nameLR: 'keypower' /* left  */ },
    { x: 360, fy: 150, nameLR: 'keyaim'   /* center */ },
    { x: 420, fy: 150, nameLR: 'keyflight'/* right  */ },
  ];

  class SacredFireGame {
    constructor() {
      this.active = false;
      this.finished = false;
      this.phase = 'ready';
      this.time = 0;
      this.round = 0;
      this.seq = [];            // the sequence the priests light
      this.playback = [];       // copy being replayed
      this.slots = [];          // lit slots during playback
      this.input = [];          // player inputs
      this.thrones = [1, 2, 3]; // lamp indices used
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.throwsLeft = ROUNDS;
      this.hintT = 0;
      this.pulse = [0, 0, 0];   // per-lamp brightness
      this.flash = 0;
      this.messageTimer = null;
      this.best = 0;
      this.ripples = [];
      this.parts = [];
      this.clickHint = '1 · 2 · 3';
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
        // tap on the left/centre/right third of the canvas == the three lamps
        const rect = G.$('#game').getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        // lamps sit at x 300 / 360 / 420 (midpoints 330 & 390 → thirds)
        const idx = nx < 330 / 640 ? 0 : nx < 390 / 640 ? 1 : 2;
        this.pressLamp(idx);
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
      this.banner('第 一 巡');
      this.setHint('看祭司点燃三盏灯 · 记住顺序');
      this.phase = 'ready';
      this.prepareSeq();
      this.startedAt = performance.now();
      setTimeout(() => {
        if (this.active && !this.finished && this.phase === 'ready') this.playNext();
      }, 700);
    }

    reset() {
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.round = 0;
      this.throwsLeft = ROUNDS;
      this.pulse = [0, 0, 0];
      this.slots = [];
      this.phase = 'ready';
      this.finished = false;
      this.ripples.length = 0;
      this.parts.length = 0;
      this.updateHUD();
      this.updatePips();
      this.hideResult();
      G.show($('#mg-hud'));
    }

    retry() {
      this.best = Math.max(this.best, G.save.data.best || 0);
      this.reset();
      this.prepareSeq();
      this.phase = 'ready';
      this.setHint('祭司重新点灯 · 重复顺序');
      this.banner('再 来 一 巡');
      this.playNext();
      G.audio.sfx('gong');
    }

    exit() {
      if (!this.active) return;
      this.active = false;
      this.finished = false;
      this.ripples.length = 0;
      this.parts.length = 0;
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
      if (code === 'Digit1' || code === 'KeyA' || code === 'ArrowLeft') { this.pressLamp(0); return true; }
      if (code === 'Digit2' || code === 'KeyS' || code === 'ArrowDown') { this.pressLamp(1); return true; }
      if (code === 'Digit3' || code === 'KeyD' || code === 'ArrowRight') { this.pressLamp(2); return true; }
      return false;
    }

    prepareSeq() {
      // a fresh random sequence of 3 (at least one repeat so it feels like a pattern)
      this.seq = [];
      for (let i = 0; i < 3; i++) this.seq.push(G.randInt(0, LAMPS - 1));
      if (this.seq[0] === this.seq[1] && this.seq[1] === this.seq[2]) this.seq[2] = (this.seq[1] + 1) % LAMPS;
    }

    playNext() {
      this.phase = 'play';
      this.playback = this.seq.slice();
      this.slots = [];
      this.input = [];
      this.playIdx = 0;
      this.hintT = 0;
      this.updatePips();
      this.banner('记 住 顺 序');
      this.setHint('<kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> 或点击灯柱 · 先看祭司怎么点');
      setTimeout(() => {
        if (!this.active || this.finished) return;
        this.replayStep();
      }, 500);
    }

    replayStep() {
      if (!this.active || this.finished) return;
      const idx = this.playIdx;
      if (idx >= this.seq.length) {
        this.startInput();
        return;
      }
      const l = this.seq[idx];
      this.flashLamp(l, 1);
      G.audio.sfx('blip');
      this.updatePips();
      const next = () => {
        if (!this.active || this.finished) return;
        this.flashLamp(l, 0);
        this.playIdx = idx + 1;
        this.replayStep();
      };
      setTimeout(next, 460);
    }

    flashLamp(i, on) {
      this.pulse[i] = on ? 1 : 0.45;
      if (on) this.addRipple(PILL[i].x, PILL[i].fy);
    }

    startInput() {
      this.phase = 'echo';
      this.input = [];
      this.banner('轮到你 · 点燃同样的灯');
      this.setHint('按 <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd>（A/S/D），还原祭司的顺序');
      this.updatePips();
    }

    pressLamp(i) {
      if (!this.active || this.finished) return;
      if (this.phase !== 'echo') return;
      this.flashLamp(i, 1);
      G.audio.sfx('blip');
      this.input.push(i);
      this.updatePips();
      const pos = this.input.length - 1;
      if (this.input[pos] !== this.seq[pos]) {
        // mistake: finish round in a forgiving way (no penalty, repeat the round once)
        this.phase = 'settle';
        this.throwsLeft--;
        this.banner('点 错 · 再点一轮');
        G.audio.sfx('error');
        G.fx.burst(PILL[i].x, PILL[i].fy - 6, 12, {
          colors: ['#ff9d3c', '#e05b25'], min: 12, max: 40, lifeMin: 0.3, lifeMax: 0.7,
        });
        this.updatePips();
        this.settleT = 1.3;
        this.repeatRound();
        return;
      }
      if (this.input.length === this.seq.length) {
        this.roundComplete();
      }
    }

    repeatRound() {
      const next = () => {
        if (!this.active || this.finished) return;
        if (this.throwsLeft <= 0) { this.finish(); return; }
        this.playNext();
      };
      setTimeout(next, this.settleT * 1000);
    }

    roundComplete() {
      this.phase = 'settle';
      const wasPerfect = this.input.every((v, i2) => v === this.seq[i2]);
      if (wasPerfect) {
        this.perfect++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        const gain = 420 + this.combo * 40;
        this.score += gain;
        this.banner('循 光 而 过 · +' + gain);
        G.audio.sfx('cheer');
        G.fx.burst(345, 220, 26, {
          colors: ['#ffe9a8', '#ffd479', '#fff3c4'], min: 20, max: 90, lifeMin: 0.4, lifeMax: 1,
        });
        this.addRipple(PILL[this.seq[0]].x, PILL[this.seq[0]].fy, 40);
      } else {
        this.combo = 0;
        this.score += 120;
        this.banner('点了 3 盏 · 稳一点');
        G.audio.sfx('confirm');
      }
      this.throwsLeft--;
      this.updateHUD();
      this.updatePips();
      this.settleT = 1.4;
      const next = () => {
        if (!this.active || this.finished) return;
        if (this.throwsLeft <= 0 || this.round >= ROUNDS) { this.finish(); return; }
        this.prepareSeq();
        this.playNext();
      };
      setTimeout(next, this.settleT * 1000);
    }

    finish() {
      if (this.finished) return;
      this.finished = true;
      this.phase = 'over';
      this.setHint('');
      const stars = this.perfect >= 5 ? 3 : this.perfect >= 3 ? 2 : this.perfect >= 1 ? 1 : 0;
      const title = stars === 3 ? '循光入夜' : stars === 2 ? '火种燎原' : stars === 1 ? '一簇微光' : '灯还没接上';
      const line = stars === 3 ? '三盏灯连成一串火，顺着光一路点到了神庙前。' :
        stars === 2 ? '几盏灯跟着你亮起来，祭坛前的火苗先立住了一簇。' :
          stars === 1 ? '有的灯亮了，有的又矮下去。老赫说，火是记性最好的东西。' :
            '祭司点过的顺序，你一盏都没接住。火还留在灯芯里，等你再来。';
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
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (!this.active) return;
          const x = 300 + i * 70, y = 80 + i * 10;
          for (let k = 0; k < 40; k++) {
            const a = G.rand(0, G.TAU), sp = G.rand(20, 140);
            this.addPart({
              x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
              life: G.rand(0.5, 1.5), size: G.rand(1, 2.2),
              color: G.pick(['#ffd479', '#ff9d3c', '#fff3c4']), grav: 90, type: 'spark',
            });
          }
          G.audio.sfx('crackle');
        }, 400 + i * 320);
      }
    }

    /* ---------------- HUD ---------------- */
    setHint(html) { $('#mg-hint').innerHTML = html; }
    banner(text) {
      const el = $('#mg-message');
      el.textContent = text;
      el.classList.add('show');
      clearTimeout(this.messageTimer);
      this.messageTimer = setTimeout(() => el.classList.remove('show'), 760);
    }
    updateHUD() {
      $('#mg-score').textContent = this.score.toLocaleString('zh-CN');
    }
    updatePips() {
      const wrap = $('#mg-pips');
      if (!wrap) return;
      // pips = remaining rounds to complete (6)
      if (wrap.children.length !== ROUNDS) {
        wrap.innerHTML = '';
        for (let i = 0; i < ROUNDS; i++) wrap.appendChild(document.createElement('i'));
      }
      Array.from(wrap.children).forEach((el, i) => el.classList.toggle('on', i < this.throwsLeft));
    }
    hideResult() { G.hide($('#mg-result')); }

    /* ---------------- particles / ripples ---------------- */
    addPart(p) {
      if (this.parts.length > 1600) this.parts.splice(0, 200);
      p.life = p.life || 1; p.max = p.life;
      p.size = p.size || 1; p.vx = p.vx || 0; p.vy = p.vy || 0;
      p.grav = p.grav || 0; p.drag = p.drag == null ? 1 : p.drag;
      this.parts.push(p);
    }
    addRipple(x, y, r) {
      this.ripples.push({ x, y, r: 6, max: r || 90, life: 0.9, maxLife: 0.9 });
    }
    updateParts(dt) {
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.life -= dt;
        if (p.life <= 0) { this.parts.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.life -= dt;
        r.r = G.lerp(r.r, r.max, 1 - Math.exp(-6 * dt));
        if (r.life <= 0) this.ripples.splice(i, 1);
      }
    }

    /* ---------------- update ---------------- */
    update(dt) {
      this.time += dt;
      this.updateParts(dt);
      this.flash = Math.max(0, this.flash - dt * 2.3);
      for (let i = 0; i < LAMPS; i++) {
        this.pulse[i] = Math.max(0, this.pulse[i] - dt * 2.4);
      }
      if (this.finished) {
        if (Math.random() < dt * 2) this.ambientEmber();
        return;
      }
      if (Math.random() < dt * 4) this.ambientEmber();
    }

    ambientEmber() {
      this.addPart({
        x: 110 + G.rand(-20, 20), y: 300 + G.rand(-8, 8),
        vx: G.rand(-10, 10), vy: G.rand(-40, -12),
        life: G.rand(0.6, 1.6), size: G.rand(1, 2),
        color: G.pick(['#ffb347', '#ff7a29', '#ffd479']), grav: -8, type: 'spark',
      });
    }

    /* ---------------- draw ---------------- */
    draw(ctx) {
      if (!this.active) return;
      ctx.imageSmoothingEnabled = false;
      this.drawSky(ctx);
      this.drawBackdrop(ctx);
      this.drawLamps(ctx);
      this.drawGround(ctx);
      this.drawPriests(ctx);
      this.drawCrowd(ctx);
      this.drawPrompt(ctx);
      this.drawParticles(ctx);
      this.drawForeground(ctx);
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
      A.glow(ctx, 546, 58, 62, 'rgba(236,215,160,.22)', 0.55);
      ctx.fillStyle = '#f0e3bf';
      ctx.beginPath(); ctx.arc(546, 58, 17, 0, G.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(205,190,150,.55)';
      ctx.beginPath(); ctx.arc(552, 53, 4, 0, G.TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(541, 64, 2.5, 0, G.TAU); ctx.fill();
    }

    drawBackdrop(ctx) {
      // distant Athens at night
      ctx.fillStyle = '#0a0c15';
      ctx.fillRect(0, 214, 640, 64);
      for (let i = 0; i < 40; i++) {
        const x = i * 17;
        const h = 4 + G.hash(i, 5, 95) * 14;
        ctx.fillStyle = '#0d1018';
        ctx.fillRect(x, 216 - h, 15, h);
        if (i % 6 === 0) {
          ctx.fillStyle = 'rgba(255,206,120,.22)';
          ctx.fillRect(x + 5, 214 - h, 1, 1);
        }
      }
      // a low hill and the Parthenon silhouette, dark
      ctx.fillStyle = '#0e1119';
      ctx.beginPath();
      ctx.moveTo(120, 250);
      ctx.quadraticCurveTo(340, 210, 600, 238);
      ctx.lineTo(640, 258);
      ctx.lineTo(640, 300);
      ctx.lineTo(90, 300);
      ctx.closePath();
      ctx.fill();
      // the three pillars sit on that hill, lit as it goes
    }

    drawLamps(ctx) {
      const cols = ['#3a6f8f', '#8a2f22', '#4a7d52'];
      for (let i = 0; i < LAMPS; i++) {
        const p = PILL[i];
        const lit = this.pulse[i];
        const baseY = 214;
        // small temple top / pillar
        ctx.fillStyle = '#1a2029';
        ctx.fillRect(p.x - 16, 214, 32, 4);
        ctx.fillStyle = '#161b24';
        ctx.fillRect(p.x - 8, baseY, 16, 16);
        // bowl
        ctx.fillStyle = '#2a303c';
        ctx.beginPath(); ctx.arc(p.x, p.fy, 10, 0, G.TAU); ctx.fill();
        const b = G.clamp(lit, 0, 1);
        A.glow(ctx, p.x, p.fy, 44 * (0.5 + b), 'rgba(255,170,60,' + (0.18 + b * 0.3) + ')', 0.6);
        if (b > 0.05) {
          A.glow(ctx, p.x, p.fy, 18 + b * 8, 'rgba(255,236,160,.6)', 0.7);
          ctx.fillStyle = '#fff1c0';
          ctx.beginPath(); ctx.arc(p.x, p.fy, 5 + b * 2, 0, G.TAU); ctx.fill();
          ctx.fillStyle = '#ffc861';
          ctx.beginPath(); ctx.arc(p.x - 2, p.fy - 1, 2.5, 0, G.TAU); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(40,44,58,.8)';
          ctx.beginPath(); ctx.arc(p.x, p.fy, 8, 0, G.TAU); ctx.fill();
        }
        // index number label under each during echo
        if (this.phase === 'echo') {
          const on = this.input.length && this.input[this.input.length - 1] === i;
          G.text(ctx, String(i + 1) + (on ? '▸' : ''), p.x, 246, { size: 8, color: on ? '#ffe9a8' : 'rgba(220,210,180,.6)', align: 'center' });
        }
      }
    }

    drawGround(ctx) {
      const g = ctx.createLinearGradient(0, 236, 0, 360);
      g.addColorStop(0, '#2a2430');
      g.addColorStop(1, '#121016');
      ctx.fillStyle = g;
      ctx.fillRect(0, 236, 640, 124);
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = '#8f93a2';
      for (let y = 246; y < 360; y += 14) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(640, y); ctx.stroke();
      }
      for (let x = 40; x < 640; x += 56) {
        ctx.beginPath(); ctx.moveTo(x, 236); ctx.lineTo(x + 20, 360); ctx.stroke();
      }
      ctx.restore();
      // a small low altar at the centre where the player stands
      ctx.fillStyle = '#34312c';
      ctx.fillRect(315, 278, 60, 6);
      ctx.fillStyle = '#3d3a33';
      ctx.fillRect(322, 272, 46, 8);
    }

    drawPriests(ctx) {
      // the player, holding a torch, facing the lamps
      A.drawActor(ctx, 260, 316, {
        dir: 'right', frame: 0, moving: false, time: this.time,
        palette: A.actorPalettes.player, scale: 1.5, accessory: 'torch',
      });
      A.drawActor(ctx, 428, 316, {
        dir: 'left', frame: 0, moving: false, time: this.time + 1,
        palette: A.actorPalettes.priest, scale: 1.3, accessory: 'torch',
      });
      A.drawActor(ctx, 480, 322, {
        dir: 'right', frame: 0, moving: false, time: this.time + 2,
        palette: A.actorPalettes.guard, scale: 1.2, accessory: 'spear',
      });
    }

    drawCrowd(ctx) {
      A.crowd(ctx, 380, 344, 18, this.time, 5);
      A.crowd(ctx, 200, 348, 10, this.time + 1, 8);
    }

    drawPrompt(ctx) {
      if (this.phase !== 'echo') return;
      const p = [[190, 236, '1 · 左'], [310, 244, '2 · 中'], [430, 238, '3 · 右']];
      for (const [x, y, t] of p) {
        G.text(ctx, t, x, y, { size: 8, color: 'rgba(240,228,190,.75)', align: 'center' });
      }
    }

    drawParticles(ctx) {
      for (const p of this.parts) {
        const a = G.clamp(p.life / p.max, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        const s = Math.max(1, p.size * (0.4 + a * 0.6));
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
        ctx.restore();
      }
      ctx.save();
      for (const rg of this.ripples) {
        const a = G.clamp(rg.life / rg.maxLife, 0, 1);
        ctx.globalAlpha = a * 0.6;
        ctx.strokeStyle = '#ffcf7a';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, G.TAU); ctx.stroke();
      }
      ctx.restore();
    }

    drawForeground(ctx) {
      A.crowd(ctx, 120, 360, 6, this.time, 11);
      A.crowd(ctx, 560, 360, 6, this.time + 2, 12);
      const vg = ctx.createRadialGradient(340, 170, 150, 340, 180, 390);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 640, 360);
    }
  }

  G.minigame = new SacredFireGame();
})();
