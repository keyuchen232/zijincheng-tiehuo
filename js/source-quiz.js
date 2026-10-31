/* ============================================================
   万象灵境 · 来源判断
   Three source-card questions.  Correct answers are not about
   "winning", but about keeping comparison and transmission apart.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;

  const QUESTIONS = [
    {
      q: '帕特农山墙投影被系统标成了“故宫原生装饰”。应该怎么处理？',
      sub: '选一张来源卡，决定这条标签的命运。',
      options: [
        { t: '把投影删掉，假装它从未出现', ok: false, why: '删除投影会抹掉对照材料；要纠正的是标签，不是差异。' },
        { t: '保留“故宫原生”标签，因为系统已经这么写了', ok: false, why: '系统误标不能当作史料。' },
        { t: '改为“卫城参照层”，保留投影并注明来源', ok: true },
      ],
    },
    {
      q: '舞乐图瓶画与《韩熙载夜宴图》可以建立哪种关系？',
      sub: '这是本作的核心对照，但“可比较”不等于“有传播”。',
      options: [
        { t: '卫城瓶画直接传入了五代中国绘画', ok: false, why: '没有证据支持这条直接传播链。' },
        { t: '比较“饮酒—奏乐—共宴”的功能关系，不声称直接传播', ok: true },
        { t: '两件作品完全无关，不能放在同一张卡上', ok: false, why: '“没有直接传播”不等于“不能做功能比较”。' },
      ],
    },
    {
      q: '靖远鎏金银盘、隋墓骆驼上的酒神图像，能证明什么？',
      sub: '有传播，但有中介；这是本作最重要的边界。',
      options: [
        { t: '证明帕特农的瓶画进入了故宫', ok: false, why: '间接传播证据不能简化成“帕特农某物进了故宫”。' },
        { t: '说明希腊罗马—拜占庭艺术曾进入中国，但不等于这两件作品直接相连', ok: true },
        { t: '说明中国与希腊之间完全没有交流', ok: false, why: '银盘和骆驼图像恰好说明有交流，只是有中介。' },
      ],
    },
  ];

  G.sourceQuiz = {
    active: false,
    idx: 0,
    onDone: null,
    locked: false,

    init() {
      G.$('#sq-close').addEventListener('click', () => this.close(false));
    },

    reset() {
      this.active = false;
      this.onDone = null;
      this.locked = false;
      if (G.$('#source-quiz')) G.hide(G.$('#source-quiz'));
    },

    open(onDone) {
      if (this.active) return;
      this.active = true;
      this.idx = 0;
      this.locked = false;
      this.onDone = onDone || null;
      G.overlayDepth++;
      G.ui.prompt(null);
      G.show(G.$('#source-quiz'));
      G.audio.sfx('page');
      this.render();
    },

    render() {
      const q = QUESTIONS[this.idx];
      if (!q) { this.complete(); return; }
      G.$('#sq-q').textContent = q.q;
      G.$('#sq-sub').textContent = q.sub;
      G.$('#sq-feedback').textContent = '';
      const box = G.$('#sq-options');
      box.innerHTML = '';
      q.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'sq-option';
        b.textContent = (i + 1) + ' · ' + opt.t;
        b.addEventListener('click', () => this.answer(i, b));
        box.appendChild(b);
      });
    },

    answer(i, el) {
      if (!this.active || this.locked) return;
      const q = QUESTIONS[this.idx];
      const opt = q.options[i];
      if (opt.ok) {
        this.locked = true;
        el.classList.add('right');
        G.$('#sq-feedback').textContent = '来源卡已校对：比较层面成立。';
        G.audio.sfx('pickup');
        setTimeout(() => {
          this.locked = false;
          this.idx++;
          if (this.idx >= QUESTIONS.length) this.complete();
          else this.render();
        }, 700);
      } else {
        el.classList.add('wrong');
        G.$('#sq-feedback').textContent = opt.why || '再想想：这条来源卡越界了。';
        G.audio.sfx('page');
        setTimeout(() => el.classList.remove('wrong'), 700);
      }
    },

    key(code) {
      if (!this.active) return;
      if (code === 'Escape') { this.close(false); return; }
      const n = parseInt(code.replace('Digit', ''), 10);
      if (n >= 1 && n <= 3) {
        const btns = G.$$('#sq-options .sq-option');
        if (btns[n - 1]) btns[n - 1].click();
      }
    },

    complete() {
      if (!this.active) return;
      this.active = false;
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.hide(G.$('#source-quiz'));
      const cb = this.onDone;
      this.onDone = null;
      if (cb) setTimeout(cb, 90);
    },

    forceComplete() {
      if (!this.active) return;
      this.idx = QUESTIONS.length;
      this.complete();
    },

    close(success) {
      if (!this.active) return;
      this.active = false;
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.hide(G.$('#source-quiz'));
      this.onDone = null;
    },
  };
})();
