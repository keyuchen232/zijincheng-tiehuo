/* ============================================================
   js/cut.js —— 过场演出引擎（开场动画 / 章节过场 / 结局）
   ------------------------------------------------------------
   设计目标：让「导演」不写绘图代码也能排练一段过场。
   一段过场是一个 steps 数组，每一步是一个时间块：

     { t:'fade',    to:1, ms:600, color:'#08070a' }
     { t:'bars',    on:true, ms:400 }
     { t:'title',   key:'ui.title.big', sub:'...', ms:2200 }
     { t:'card',    who:'diotima', key:'nodes.wumen.enter.0', ms:1900 }
     { t:'portrait',who:'diotima', on:true }
     { t:'flash',   color:'#fff', ms:180 }
     { t:'shake',   ms:320, amp:6 }
     { t:'zoom',    v:1.06, ms:1200 }
     { t:'sfx',     name:'gong' }
     { t:'wait',    ms:300 }
     { t:'clear' }

   三条边界：
   1. 只管「演出」。不判定输赢、不写存档、不改场景。
   2. 文字一律走 G.str.get(key)，不在这里写死中文。
   3. 立绘一律走 A 登记的 painter 'portrait.<角色id>'，
      引擎只负责把它贴到屏幕左边/右边。

   跳过：空格 / 回车 / Esc / 点击。第一次跳过当前步，
   700ms 内再按一次跳过整段（评奖演示很有用）。
   ============================================================ */
(function (G) {
  'use strict';

  const wait = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms | 0)));

  function el(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  const cut = {
    active: false,
    _chain: Promise.resolve(),
    _ui: null,
    _resolve: null,     /* 当前 _wait 的提前唤醒 */
    _skipMode: 0,       /* 0 不跳 / 1 跳这一步 / 2 跳整段 */
    _lastSkip: 0,
    _bound: false,

    /* ---------- 挂载 DOM（懒加载，只建一次） ---------- */
    _mount() {
      if (this._ui) return this._ui;
      const root = el('div', 'cut hidden');
      root.id = 'cut';
      root.setAttribute('aria-hidden', 'true');

      const veil = el('div', 'cut-veil', root);
      const barT = el('div', 'cut-bar top', root);
      const barB = el('div', 'cut-bar bot', root);

      const stage = el('div', 'cut-portrait-wrap', root);
      const cv = document.createElement('canvas');
      cv.className = 'cut-portrait';
      cv.width = 240;
      cv.height = 360;
      stage.appendChild(cv);

      const card = el('div', 'cut-card hidden', root);
      const who = el('p', 'cut-who', card);
      const text = el('p', 'cut-text', card);
      const sub = el('p', 'cut-sub', card);

      const hint = el('div', 'cut-hint', root);
      hint.textContent = '空格 / 点击 继续';

      document.body.appendChild(root);

      this._ui = { root, veil, barT, barB, stage, cv, card, who, text, sub, hint };
      return this._ui;
    },

    /* ---------- 对外：播一段过场 ---------- */
    play(id, cb) {
      const spec = (G.mod && G.mod.get) ? G.mod.get('cutscene', id) : null;
      if (!spec) {
        console.warn('[cut] 没有登记过场 ' + id + '（跳过）');
        if (cb) { try { cb(); } catch (e) { console.error(e); } }
        return Promise.resolve();
      }
      /* 串行：两段过场不会互相踩 */
      this._chain = this._chain.then(() => this._run(id, spec, cb)).catch((e) => {
        console.error('[cut] ' + id + ' 出错', e);
        if (cb) { try { cb(); } catch (e2) { console.error(e2); } }
      });
      return this._chain;
    },

    async _run(id, spec, cb) {
      if (this.active) { if (cb) cb(); return; }
      this.active = true;
      this._skipMode = 0;
      const ui = this._mount();
      G.overlayDepth = (G.overlayDepth || 0) + 1;
      ui.root.classList.remove('hidden');
      ui.root.setAttribute('aria-hidden', 'false');
      this._bind();
      try {
        this._reset(ui);
        if (spec.background) this._bg(ui, spec.background);
        const steps = spec.steps || [];
        for (let i = 0; i < steps.length; i++) {
          if (this._skipMode >= 2) break;
          await this._step(steps[i], ui);
          if (this._skipMode === 1) this._skipMode = 0;
        }
      } catch (e) {
        console.error('[cut] 播放中断 ' + id, e);
      } finally {
        this._reset(ui);
        ui.root.classList.add('hidden');
        ui.root.setAttribute('aria-hidden', 'true');
        this._unbind();
        G.overlayDepth = Math.max(0, (G.overlayDepth || 1) - 1);
        this.active = false;
        if (spec.seen !== false) G.save && G.save.flag && G.save.flag('cut.' + id, true);
        if (cb) { try { cb(); } catch (e) { console.error(e); } }
      }
    },

    _reset(ui) {
      ui.veil.style.transitionDuration = '0ms';
      ui.veil.style.opacity = '0';
      ui.veil.style.background = '#08070a';
      ui.barT.style.transitionDuration = '0ms';
      ui.barB.style.transitionDuration = '0ms';
      ui.barT.style.transform = 'translateY(-100%)';
      ui.barB.style.transform = 'translateY(100%)';
      ui.card.classList.add('hidden');
      ui.card.className = 'cut-card hidden';
      ui.who.textContent = '';
      ui.text.textContent = '';
      ui.sub.textContent = '';
      ui.stage.classList.add('hidden');
      ui.cv.style.opacity = '1';
      const canvas = document.querySelector('canvas:not(.cut-portrait)');
      if (canvas) canvas.style.transform = '';
    },

    /* ---------- 单步执行 ---------- */
    async _step(s, ui) {
      if (!s || !s.t) return;
      const ms = s.ms == null ? 0 : s.ms;

      switch (s.t) {
        case 'wait':
          await this._wait(ms);
          return;

        case 'fade': {
          ui.veil.style.background = s.color || '#08070a';
          ui.veil.style.transitionDuration = Math.max(1, ms) + 'ms';
          /* 强制重排，让 transition 生效 */
          void ui.veil.offsetWidth;
          ui.veil.style.opacity = String(s.to == null ? 1 : s.to);
          await this._wait(ms);
          return;
        }

        case 'bars': {
          const on = s.on !== false;
          ui.barT.style.transitionDuration = Math.max(1, ms) + 'ms';
          ui.barB.style.transitionDuration = Math.max(1, ms) + 'ms';
          void ui.barT.offsetWidth;
          ui.barT.style.transform = on ? 'translateY(0)' : 'translateY(-100%)';
          ui.barB.style.transform = on ? 'translateY(0)' : 'translateY(100%)';
          await this._wait(ms);
          return;
        }

        case 'card':
        case 'title': {
          const big = s.t === 'title';
          ui.card.className = 'cut-card' + (big ? ' cut-big' : '');
          ui.card.classList.remove('hidden');
          if (s.who) {
            ui.who.textContent = G.str && G.str.who ? G.str.who(s.who) : s.who;
            const c = (G.str && G.str.raw && G.str.raw().characters) || {};
            const meta = c[s.who];
            ui.who.style.color = (meta && meta.color) || '#cbb283';
            ui.who.classList.remove('hidden');
          } else {
            ui.who.textContent = '';
            ui.who.classList.add('hidden');
          }
          ui.text.textContent = this._text(s);
          ui.sub.textContent = this._text(s, 'sub');
          ui.sub.classList.toggle('hidden', !ui.sub.textContent);
          await this._wait(ms || 1900);
          if (!s.hold) ui.card.classList.add('hidden');
          return;
        }

        case 'clear':
          ui.card.classList.add('hidden');
          return;

        case 'flash': {
          const saved = ui.veil.style.background;
          ui.veil.style.background = s.color || '#ffffff';
          ui.veil.style.transitionDuration = '0ms';
          ui.veil.style.opacity = '1';
          void ui.veil.offsetWidth;
          ui.veil.style.transitionDuration = Math.max(1, ms || 180) + 'ms';
          ui.veil.style.opacity = '0';
          await this._wait(ms || 180);
          ui.veil.style.background = saved || '#08070a';
          return;
        }

        case 'sfx': {
          try {
            if (G.audio && G.audio.play) G.audio.play(s.name);
            else if (G.sfx && G.sfx.play) G.sfx.play(s.name);
          } catch (e) { /* 静音失败无所谓 */ }
          return;
        }

        case 'shake': {
          const c = document.querySelector('canvas:not(.cut-portrait)');
          if (c) {
            c.classList.add('cut-shake');
            setTimeout(() => c.classList.remove('cut-shake'), ms || 300);
          }
          await this._wait(ms || 300);
          return;
        }

        case 'zoom': {
          const c = document.querySelector('canvas:not(.cut-portrait)');
          if (c) {
            c.style.transition = 'transform ' + Math.max(1, ms) + 'ms ease-out';
            c.style.transform = 'scale(' + (s.v || 1) + ')';
          }
          await this._wait(ms);
          return;
        }

        case 'portrait': {
          const who = s.who;
          if (!who) return;
          const ok = this._paint(ui, who);
          ui.stage.classList.remove('hidden');
          if (!ok) { await this._wait(ms); return; }
          ui.stage.style.transitionDuration = Math.max(1, ms || 300) + 'ms';
          void ui.stage.offsetWidth;
          ui.stage.classList.toggle('left', s.side !== 'right');
          ui.cv.style.opacity = s.on === false ? '0' : '1';
          await this._wait(ms || 300);
          return;
        }

        case 'veil': { /* 语法糖：fade 的别名 */
          ui.veil.style.transitionDuration = Math.max(1, ms) + 'ms';
          void ui.veil.offsetWidth;
          ui.veil.style.opacity = String(s.to == null ? 1 : s.to);
          await this._wait(ms);
          return;
        }

        default:
          console.warn('[cut] 未知步骤 ' + s.t);
          return;
      }
    },

    _paint(ui, who) {
      const pid = 'portrait.' + who;
      if (!G.mod || !G.mod.has || !G.mod.has('painter', pid)) {
        console.warn('[cut] 立绘还没画：' + pid + '（跳过，不影响流程）');
        return false;
      }
      const ctx = ui.cv.getContext('2d');
      ctx.clearRect(0, 0, ui.cv.width, ui.cv.height);
      ctx.save();
      /* 原点 = 脚底中心，和游戏里 drawActor 的约定一致 */
      ctx.translate(ui.cv.width / 2, ui.cv.height - 12);
      try {
        G.mod.paint(pid, ctx, { w: ui.cv.width, h: ui.cv.height, who }, null);
      } catch (e) {
        console.warn('[cut] 立绘画坏了：' + pid, e);
      }
      ctx.restore();
      return true;
    },

    _bg(ui, color) {
      ui.root.style.background = color;
    },

    _text(s, field) {
      const key = field ? s[field + 'Key'] : s.key;
      const raw = field ? s[field] : s.text;
      if (key && G.str && G.str.get) {
        const v = G.str.get(key, s.vars);
        if (v && v.indexOf('⟪') !== 0) return v;
        return raw || '';
      }
      return raw || '';
    },

    _wait(ms) {
      const self = this;
      return new Promise((resolve) => {
        let done = false;
        const fin = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (self._resolve === fin) self._resolve = null;
          resolve();
        };
        const timer = setTimeout(fin, Math.max(0, ms | 0));
        self._resolve = fin;
      });
    },

    /* ---------- 跳过 ---------- */
    skip() {
      const now = Date.now();
      this._skipMode = (now - this._lastSkip < 700) ? 2 : 1;
      this._lastSkip = now;
      if (this._resolve) this._resolve();
    },

    _bind() {
      if (this._bound) return;
      this._bound = true;
      this._onKey = (e) => {
        if (!this.active) return;
        const k = e.code;
        if (k === 'Space' || k === 'Enter' || k === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this.skip();
        }
      };
      this._onClick = (e) => {
        if (!this.active) return;
        e.preventDefault();
        this.skip();
      };
      window.addEventListener('keydown', this._onKey, true);
      const ui = this._mount();
      ui.root.addEventListener('mousedown', this._onClick);
    },

    _unbind() {
      if (!this._bound) return;
      this._bound = false;
      window.removeEventListener('keydown', this._onKey, true);
      if (this._ui) this._ui.root.removeEventListener('mousedown', this._onClick);
    },

    /* 便利方法：这段过场看过没有 */
    seen(id) {
      return !!(G.save && G.save.isDone && G.save.isDone('cut.' + id));
    }
  };

  G.cut = cut;
})(window.G = window.G || {});
