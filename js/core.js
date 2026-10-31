/* ============================================================
   紫禁城 · 铁火 — core
   ============================================================ */
(function () {
  'use strict';
  const G = (window.G = window.G || {});

  G.W = 640;
  G.H = 360;
  G.TAU = Math.PI * 2;
  G.VERSION = '1.0.0';

  /* ---------------- math / utils ---------------- */
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  G.randInt = (a, b) => Math.floor(G.rand(a, b + 1));
  G.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  G.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  G.approach = (v, target, step) => (v < target ? Math.min(v + step, target) : Math.max(v - step, target));
  G.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  G.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  G.hash = function (x, y, seed) {
    let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (seed || 0) * 1442695040;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
  };
  G.chance = (p) => Math.random() < p;
  G.pad = (n, len) => String(n).padStart(len || 2, '0');
  G.fmtMoney = (n) => '¥' + n;

  G.dateInfo = function (d) {
    const week = ['日', '一', '二', '三', '四', '五', '六'];
    return {
      y: d.getFullYear(),
      m: d.getMonth() + 1,
      d: d.getDate(),
      w: week[d.getDay()],
      key: d.getFullYear() + '-' + G.pad(d.getMonth() + 1) + '-' + G.pad(d.getDate()),
      closed: d.getDay() === 1,
      cn: (d.getMonth() + 1) + '月' + d.getDate() + '日',
      short: G.pad(d.getMonth() + 1) + '.' + G.pad(d.getDate()),
    };
  };
  G.startOfToday = function () {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };
  G.addDays = function (d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  G.season = function (d) {
    const m = d.getMonth() + 1;
    return m >= 4 && m <= 10 ? 'peak' : 'off';
  };

  G.CONFIG = {
    ticketPeak: 60,
    ticketOff: 40,
    addonPrice: 10,
    bookDays: 7,
  };

  /* ---------------- input ---------------- */
  const relevant = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'KeyE', 'KeyJ', 'KeyQ', 'ShiftLeft', 'ShiftRight', 'Escape', 'Enter', 'Tab',
  ]);
  const input = (G.input = {
    down: Object.create(null),
    pressed: Object.create(null),
    released: Object.create(null),
    anyPressedAt: 0,
    init() {
      window.addEventListener('keydown', (e) => {
        const t = e.target;
        const typing = !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable));
        if (!typing && relevant.has(e.code)) e.preventDefault();
        if (typing) return; // 输入框里打字不触发游戏热键
        if (e.repeat) return;
        this.down[e.code] = true;
        this.pressed[e.code] = true;
        this.anyPressedAt = performance.now();
        if (G.onKeyDown) G.onKeyDown(e.code, e);
      }, { passive: false });
      window.addEventListener('keyup', (e) => {
        this.down[e.code] = false;
        this.released[e.code] = true;
        if (G.onKeyUp) G.onKeyUp(e.code, e);
      });
      window.addEventListener('blur', () => { this.down = Object.create(null); });
    },
    isDown(...codes) { return codes.some((c) => !!this.down[c]); },
    wasPressed(code) { return !!this.pressed[code]; },
    clearPressed() { this.pressed = Object.create(null); },
    endFrame() { this.pressed = Object.create(null); this.released = Object.create(null); },
    axis() {
      let x = 0, y = 0;
      if (this.isDown('KeyA', 'ArrowLeft')) x -= 1;
      if (this.isDown('KeyD', 'ArrowRight')) x += 1;
      if (this.isDown('KeyW', 'ArrowUp')) y -= 1;
      if (this.isDown('KeyS', 'ArrowDown')) y += 1;
      if (x && y) { const k = Math.SQRT1_2; x *= k; y *= k; }
      return { x, y };
    },
    virtual(code, isDown) {
      if (isDown) {
        if (!this.down[code]) this.pressed[code] = true;
        this.down[code] = true;
      } else {
        this.down[code] = false;
      }
    },
  });

  /* ---------------- save ---------------- */
  const KEY = 'zijincheng.tiehuo.save.v1';
  function defaultSave() {
    return {
      v: 1,
      at: Date.now(),
      flags: {
        entered: false, metZhao: false,
        iron: false, charcoal: false, ladle: false,
        night: false, finished: false,
      },
      codex: [],
      flavors: [],
      best: 0,
      plays: 0,
      sound: true,
      scene: 'beijing',
    };
  }
  G.save = {
    data: defaultSave(),
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const d = JSON.parse(raw);
        if (!d || d.v !== 1) return false;
        this.data = Object.assign(defaultSave(), d);
        this.data.flags = Object.assign(defaultSave().flags, d.flags || {});
        // drop fields left behind by the old reservation flow
        delete this.data.booking;
        delete this.data.name;
        delete this.data.flags.booked;
        return true;
      } catch (e) { return false; }
    },
    persist() {
      try {
        this.data.at = Date.now();
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch (e) { /* storage may be unavailable */ }
    },
    reset(keepBest) {
      const best = keepBest ? this.data.best : 0;
      this.data = defaultSave();
      this.data.best = best;
      this.persist();
    },
    exists() {
      try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
    },
    flag(k, v) {
      if (v === undefined) return !!this.data.flags[k];
      this.data.flags[k] = !!v;
      this.persist();
      return v;
    },
    collect(k) { this.data.flags[k] = true; this.persist(); },
    addCodex(id) {
      if (!this.data.codex.includes(id)) { this.data.codex.push(id); this.persist(); return true; }
      return false;
    },
    // 结局/抉择记录（卫城圣火的三条处理方式等）；旧存档没有 flavors 字段时补上
    addFlavor(k) {
      if (!Array.isArray(this.data.flavors)) this.data.flavors = [];
      if (!this.data.flavors.includes(k)) { this.data.flavors.push(k); this.persist(); }
      return k;
    },
  };

  /* ---------------- DOM helpers ---------------- */
  G.$ = (sel, root) => (root || document).querySelector(sel);
  G.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  G.show = (el) => { if (el) el.classList.remove('hidden'); };
  G.hide = (el) => { if (el) el.classList.add('hidden'); };
  G.ui = {
    hud: null,
    promptEl: null,
    init() {
      this.hud = G.$('#hud');
      this.promptEl = G.$('#prompt');
    },
    showHud(v) { this.hud.classList.toggle('hidden', !v); },
    location(main, sub) {
      G.$('#loc-main').textContent = main;
      G.$('#loc-sub').textContent = sub;
      const seal = G.$('#loc-seal');
      if (seal) seal.textContent = main.indexOf('家') >= 0 ? '家' : (main.indexOf('万象') >= 0 ? '境' : (main.indexOf('故宫') >= 0 ? '宫' : '京'));
    },
    objective(text) { G.$('#objective').textContent = text; },
    clock(time, date) {
      G.$('#clock').textContent = time;
      G.$('#daylabel').textContent = date;
    },
    prompt(text) {
      if (!text) { this.promptEl.classList.add('hidden'); return; }
      G.$('#prompt-text').textContent = text;
      this.promptEl.classList.remove('hidden');
    },
    setHomeButton(home) {
      const btn = G.$('#btn-home');
      if (!btn) return;
      btn.textContent = home ? '出' : '家';
      btn.title = home ? '离开大厅（H）' : '回家（H）';
      btn.setAttribute('aria-label', home ? '离开大厅' : '回家');
      btn.classList.toggle('home-active', !!home);
    },

    toast(text, kind, ms) {
      const wrap = G.$('#toasts');
      const el = document.createElement('div');
      el.className = 'toast' + (kind ? ' ' + kind : '');
      el.textContent = text;
      wrap.appendChild(el);
      setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms || 2400);
    },
  };

  /* ---------------- dialog ---------------- */
  G.dialog = {
    active: false,
    queue: [],
    idx: 0,
    full: '',
    shown: 0,
    typing: false,
    timer: null,
    onDone: null,
    el: null,
    init() {
      this.el = G.$('#dialog');
      const self = this;
      this.el.addEventListener('click', () => self.advance());
      G.$('#dlg-next').addEventListener('click', (e) => { e.stopPropagation(); self.advance(); });
    },
    show(lines, onDone) {
      if (typeof lines === 'string') lines = [{ text: lines }];
      this.queue = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
      this.idx = 0;
      this.onDone = onDone || null;
      this.active = true;
      this.el.classList.remove('hidden');
      G.ui.prompt(null);
      this.render();
    },
    ask(opts, cb) {
      // opts: { name, text, options:[{label, value(chosen)}, ...] }
      this.onPick = cb || null;
      this.show([{
        name: opts.name,
        text: opts.text,
        _opts: opts.options || [{ label: '是', value: true }, { label: '否', value: false }],
      }]);
    },
    render() {
      this.clearOptions();
      const line = this.queue[this.idx];
      if (!line) { this.close(); return; }
      this.el.classList.toggle('narrator', !!line.narrator);
      G.$('#dlg-name').textContent = line.name || (line.narrator ? '手记' : '旅人');
      const target = line.text || '';
      this.full = target;
      this.shown = 0;
      this.typing = true;
      const p = G.$('#dlg-text');
      p.textContent = '';
      G.$('#dlg-next').classList.remove('blink');
      clearInterval(this.timer);
      const speed = line.speed || 22;
      this.timer = setInterval(() => {
        this.shown += 1;
        p.textContent = target.slice(0, this.shown);
        if (this.shown >= target.length) this.finishType();
      }, speed);
      if (G.audio) G.audio.sfx('blip');
    },
    finishType() {
      clearInterval(this.timer);
      this.timer = null;
      this.typing = false;
      G.$('#dlg-text').textContent = this.full;
      const line = this.queue[this.idx];
      if (line && line._opts) this.buildOptions(line);
      else G.$('#dlg-next').classList.add('blink');
    },
    clearOptions() {
      const box = G.$('#dlg-options');
      if (box) { box.innerHTML = ''; box.classList.add('hidden'); }
    },
    buildOptions(line) {
      const box = G.$('#dlg-options');
      box.innerHTML = '';
      G.$('#dlg-next').classList.remove('blink');
      const self = this;
      (line._opts || []).forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = o.label;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          self.pick(o.value);
        });
        box.appendChild(b);
      });
      box.classList.remove('hidden');
    },
    pick(value) {
      const cb = this.onPick;
      this.onPick = null;
      this.optionValue = value;
      this.close();
      if (cb) setTimeout(() => cb(value), 20);
    },
    advance() {
      if (!this.active) return;
      const line = this.queue[this.idx];
      if (line && line._opts) return;
      if (this.typing) { this.finishType(); G.input.clearPressed(); return; }
      this.idx += 1;
      G.input.clearPressed();
      if (this.idx >= this.queue.length) this.close();
      else this.render();
    },
    close() {
      clearInterval(this.timer);
      this.timer = null;
      this.active = false;
      this.typing = false;
      this.clearOptions();
      this.el.classList.add('hidden');
      const cb = this.onDone;
      this.onDone = null;
      G.input.clearPressed();
      if (cb) setTimeout(cb, 30);
    },
    skip(holdPick) {
      // holdPick：若遇到带选项的对话且未作答，用 holdPick(value) 代替；否则跳过
      let guard = 0;
      while (this.active && guard++ < 40) {
        const line = this.queue[this.idx];
        if (line && line._opts) {
          if (holdPick) { this.pick(holdPick); return; }
          this.finishType();
          return;
        }
        this.finishType();
        this.advance();
      }
    },
  };

  /* ---------------- dialogue choice ---------------- */
  G.choice = {
    active: false,
    onPick: null,
    choiceWaiting: false,
    _hover: -1,
    el: null,
    optionEls: [],
    init() {
      this.el = G.$('#choice');
      // 选项是 show() 时动态生成的，必须在容器上做事件委托，否则用鼠标点选项没有任何反应
      const body = G.$('#choice-body') || this.el;
      body.addEventListener('click', (e) => {
        const opt = e.target && e.target.closest ? e.target.closest('.choice-opt') : null;
        if (!opt) return;
        e.preventDefault();
        this.pick(parseInt(opt.dataset.i, 10));
      });
      body.addEventListener('mouseover', (e) => {
        const opt = e.target && e.target.closest ? e.target.closest('.choice-opt') : null;
        if (!opt) return;
        const idx = parseInt(opt.dataset.i, 10);
        if (idx === this._hover) return;
        this._hover = idx;
        const els = G.$$('#choice .choice-opt');
        els.forEach((x, i) => x.classList.toggle('sel', i === idx));
      });
      G.$('#choice').addEventListener('click', (e) => { if (e.target.id === 'choice') G.audio.sfx('error'); });
    },
    show(lines, opts) {
      lines = lines || [];
      this.onPick = (opts && opts.onPick) || null;
      this.onClose = (opts && opts.onClose) || null;
      const askEl = G.$('#choice-ask');
      askEl.innerHTML = (opts && opts.title) || '你偏要向哪个方向走？';
      G.$('#choice-body').innerHTML = '';
      const body = G.$('#choice-body');
      lines.forEach((l, i) => {
        const el = document.createElement('button');
        el.className = 'choice-opt' + (i === 0 ? ' sel' : '');
        el.dataset.i = String(i);
        el.innerHTML = '<span></span>' + l.text;
        el.setAttribute('aria-label', l.text);
        body.appendChild(el);
      });
      this.optionEls = G.$$('#choice .choice-opt');
      this._hover = 0;
      this.choiceWaiting = true;
      this.active = true;
      G.overlayDepth++;
      G.show(this.el);
      G.ui.prompt(null);
      G.audio.sfx('page');
    },
    move(d) {
      if (!this.active) return;
      const n = this.optionEls.length;
      if (!n) return;
      this._hover = (this._hover + d + n) % n;
      this.optionEls.forEach((o, i) => o.classList.toggle('sel', i === this._hover));
      G.audio.sfx('blip');
    },
    pick(i) {
      if (!this.active) return;
      const n = this.optionEls.length;
      const idx = i == null ? this._hover : i;
      if (idx < 0 || idx >= n) return;
      const cb = this.onPick;
      G.audio.sfx('confirm');
      this._picked = true;
      this.close();
      if (cb) setTimeout(() => cb(idx), 30);
    },
    close() {
      if (!this.active) return;
      this.active = false;
      this.choiceWaiting = false;
      const cb = this.onPick;
      const onClose = this.onClose;
      this.onPick = null;
      this.onClose = null;
      G.hide(this.el);
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.input.clearPressed();
      if (onClose && !this._picked) onClose();
      this._picked = false;
    },
  };

  /* ---------------- cinema titles ---------------- */
  G.cinema = {
    active: false,
    el: null,
    init() { this.el = G.$('#cinema'); },
    play(lines, onDone) {
      if (typeof lines === 'string') lines = [{ text: lines }];
      this.active = true;
      this.el.classList.remove('hidden');
      let i = 0;
      const self = this;
      const step = () => {
        if (i >= lines.length) {
          self.el.classList.add('hidden');
          self.active = false;
          if (onDone) onDone();
          return;
        }
        const l = lines[i++];
        G.$('#cine-line').textContent = l.text || '';
        G.$('#cine-sub').textContent = l.sub || '';
        setTimeout(step, l.ms || 1900);
      };
      step();
    },
  };

  /* ---------------- fade / scene ---------------- */
  G.fade = {
    el: null,
    busy: false,
    init() { this.el = G.$('#fade'); },
    to(fn, hold) {
      if (this.busy) { fn && fn(); return; }
      this.busy = true;
      this.el.classList.add('on');
      setTimeout(() => {
        try { fn && fn(); } catch (e) { console.error(e); }
        setTimeout(() => {
          this.el.classList.remove('on');
          this.busy = false;
        }, 90);
      }, hold || 430);
    },
  };

  G.scene = null;
  G.overlayDepth = 0;
  G.setScene = function (scene, opts) {
    opts = opts || {};
    if (G.scene && G.scene.exit) G.scene.exit();
    G.fx.clear();
    G.fx.shakeT = 0;
    G.scene = scene;
    G.sceneName = opts.name || (scene && scene.id) || '';
    if (scene && scene.enter) scene.enter(opts);
    G.save.data.scene = G.sceneName;
    G.save.persist();
  };
  G.isWorldPaused = function () {
    return G.overlayDepth > 0 || G.dialog.active || G.cinema.active || G.fade.busy ||
      (G.minigame && G.minigame.active) || (G.titleActive !== false);
  };

  /* ---------------- particles / screen effects ---------------- */
  G.fx = {
    parts: [],
    shakeT: 0,
    shakeAmt: 0,
    ox: 0,
    oy: 0,
    add(p) {
      if (this.parts.length > 1400) this.parts.splice(0, 200);
      p.life = p.life || 1;
      p.max = p.life;
      p.size = p.size || 1;
      p.vx = p.vx || 0;
      p.vy = p.vy || 0;
      p.grav = p.grav || 0;
      p.drag = p.drag == null ? 1 : p.drag;
      p.screen = !!p.screen;
      p.glow = p.glow !== false;
      this.parts.push(p);
      return p;
    },
    burst(x, y, n, opt) {
      opt = opt || {};
      for (let i = 0; i < n; i++) {
        const a = G.rand(0, G.TAU);
        const sp = G.rand(opt.min || 12, opt.max || 80);
        this.add({
          x, y,
          vx: Math.cos(a) * sp + (opt.vx || 0),
          vy: Math.sin(a) * sp * (opt.flat ? 0.45 : 1) + (opt.vy || 0),
          life: G.rand(opt.lifeMin || 0.35, opt.lifeMax || 1.1),
          size: G.rand(opt.sizeMin || 1, opt.sizeMax || 2.4),
          color: G.pick(opt.colors || ['#ffd479', '#ff9d3c', '#f7e2a1', '#e05b25']),
          grav: opt.grav == null ? 60 : opt.grav,
          drag: opt.drag == null ? 0.985 : opt.drag,
          screen: !!opt.screen,
          glow: true,
        });
      }
    },
    update(dt) {
      const arr = this.parts;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life -= dt;
        if (p.life <= 0) { arr.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      if (this.shakeT > 0) {
        this.shakeT -= dt;
        const a = this.shakeAmt * Math.max(0, this.shakeT / 0.4);
        this.ox = G.rand(-a, a);
        this.oy = G.rand(-a, a);
      } else { this.ox = 0; this.oy = 0; }
    },
    shake(amount, time) {
      this.shakeAmt = Math.max(this.shakeAmt, amount);
      this.shakeT = Math.max(this.shakeT, time || 0.4);
    },
    draw(ctx, cam) {
      const ox = cam ? -cam.x : 0, oy = cam ? -cam.y : 0;
      ctx.save();
      for (const p of this.parts) {
        const a = G.clamp(p.life / p.max, 0, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        const s = Math.max(1, p.size * (0.4 + a * 0.6));
        if (p.glow) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillRect(Math.round(p.x + (p.screen ? 0 : ox)) - s / 2, Math.round(p.y + (p.screen ? 0 : oy)) - s / 2, s, s);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.fillRect(Math.round(p.x + (p.screen ? 0 : ox)) - s / 2, Math.round(p.y + (p.screen ? 0 : oy)) - s / 2, s, s);
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    },
    clear() { this.parts.length = 0; },
  };

  /* ---------------- audio ---------------- */
  G.audio = {
    ctx: null,
    master: null,
    enabled: true,
    ambientTimer: null,
    mode: 'city',
    noiseBuf: null,
    init() {
      if (this.ctx) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.enabled ? 0.34 : 0;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 0.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      } catch (e) { this.ctx = null; }
    },
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    setEnabled(v) {
      this.enabled = v;
      G.save.data.sound = v;
      G.save.persist();
      if (this.master) this.master.gain.setTargetAtTime(v ? 0.34 : 0, this.ctx.currentTime, 0.05);
      const btn = G.$('#btn-sound');
      if (btn) btn.textContent = v ? '♪' : '×';
    },
    tone(freq, dur, type, vol, slideTo, delay) {
      if (!this.ctx || !this.enabled) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol == null ? 0.12 : vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    noise(dur, vol, freq, q, delay) {
      if (!this.ctx || !this.enabled || !this.noiseBuf) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 0.8;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol == null ? 0.14 : vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t0); src.stop(t0 + dur + 0.02);
    },
    sfx(name) {
      if (!this.ctx || !this.enabled) return;
      switch (name) {
        case 'step': this.noise(0.07, 0.035, 240, 1.4); break;
        case 'blip': this.tone(620, 0.06, 'square', 0.025); break;
        case 'confirm': this.tone(523, 0.1, 'triangle', 0.09); this.tone(784, 0.16, 'triangle', 0.07, null, 0.08); break;
        case 'page': this.noise(0.11, 0.05, 2400, 1.2); break;
        case 'success':
          [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.08, null, i * 0.1));
          break;
        case 'error': this.tone(150, 0.18, 'sawtooth', 0.06, 100); break;
        case 'pickup': this.tone(880, 0.1, 'triangle', 0.07); this.tone(1318, 0.22, 'triangle', 0.05, null, 0.07); break;
        case 'whoosh': this.noise(0.32, 0.13, 900, 0.6); this.tone(240, 0.3, 'sine', 0.05, 90); break;
        case 'boom':
          this.noise(0.55, 0.28, 140, 0.5); this.tone(64, 0.5, 'sine', 0.2, 36);
          break;
        case 'crackle':
          for (let i = 0; i < 5; i++) this.noise(0.05, 0.05, G.rand(1800, 5200), 1.8, i * 0.035);
          break;
        case 'gong': this.tone(110, 1.4, 'sine', 0.16, 80); this.tone(164, 1.1, 'sine', 0.06); break;
        case 'cheer': this.noise(0.9, 0.07, 1200, 0.4); break;
        default: break;
      }
    },
    ambient(mode) {
      if (this.mode === mode && this.ambientTimer) return;
      this.mode = mode;
      clearInterval(this.ambientTimer);
      if (!this.ctx) return;
      const scale = mode === 'night' ? [220, 261.6, 293.7, 329.6, 392] :
        mode === 'palace' ? [196, 233.1, 261.6, 311.1, 349.2] : [174.6, 220, 261.6, 349.2, 392];
      let i = 0;
      const tick = () => {
        if (!this.enabled) return;
        const f = scale[i % scale.length] * (i % 7 === 5 ? 2 : 1);
        this.tone(f, 2.8, 'sine', 0.018, null, 0);
        if (i % 4 === 0) this.tone(f / 2, 3.6, 'sine', 0.012);
        if (mode === 'night' && i % 8 === 3) this.tone(f * 2, 1.8, 'triangle', 0.008);
        i++;
      };
      tick();
      this.ambientTimer = setInterval(tick, 2600);
    },
  };

  /* ---------------- text / canvas helpers ---------------- */
  G.text = function (ctx, str, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font = (opt.weight || '') + ' ' + (opt.size || 10) + 'px ' + (opt.font || '"Microsoft YaHei","PingFang SC",sans-serif');
    ctx.textAlign = opt.align || 'left';
    ctx.textBaseline = opt.baseline || 'alphabetic';
    if (opt.alpha != null) ctx.globalAlpha = opt.alpha;
    if (opt.outline) {
      ctx.lineWidth = opt.outlineWidth || 3;
      ctx.strokeStyle = opt.outline;
      ctx.lineJoin = 'round';
      ctx.strokeText(str, Math.round(x), Math.round(y));
    }
    ctx.fillStyle = opt.color || '#f2e5cd';
    ctx.fillText(str, Math.round(x), Math.round(y));
    ctx.restore();
  };
  G.rect = function (ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  /* ---------------- minimap-ish helpers ---------------- */
  G.angleTo = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

  G.ready = function (fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 1);
    else window.addEventListener('DOMContentLoaded', fn);
  };

  /* ---------------- touch controls ---------------- */
  G.initTouch = function () {
    const touch = G.$('#touch');
    if (!touch) return;
    const coarse = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    if (coarse) touch.classList.remove('hidden');
    G.$$('#touch [data-key]').forEach((btn) => {
      const code = btn.getAttribute('data-key');
      const press = (e) => {
        e.preventDefault();
        G.audio.resume();
        G.input.virtual(code, true);
        if (G.onKeyDown) G.onKeyDown(code, { code });
        btn.classList.add('on');
      };
      const release = (e) => { e.preventDefault(); G.input.virtual(code, false); btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });
  };
})();
