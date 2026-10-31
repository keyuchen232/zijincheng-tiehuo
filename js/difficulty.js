/* ============================================================
   万象灵境 · 非遗小游戏难度选择
   简易 / 困难 / 地狱：决定回合数、方向数和是否限时
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;

  const DIFFS = [
    { key: 'easy', name: '简易', desc: '不需要限时，方向更简单' },
    { key: 'hard', name: '困难', desc: '更多回合、更多方向' },
    { key: 'hell', name: '地狱', desc: '回合最长，还限时' },
  ];

  G.difficulty = {
    active: false,
    kind: 'cn',
    onPick: null,

    init() {
      G.$('#diff-back').addEventListener('click', () => this.back());
      DIFFS.forEach((d) => {
        const b = document.createElement('button');
        b.className = 'diff-btn';
        b.innerHTML = '<b>' + d.name + '</b><small>' + d.desc + '</small>';
        b.addEventListener('click', () => this.pick(d.key));
        G.$('#diff-btns').appendChild(b);
      });
    },

    reset() {
      this.active = false;
      this.onPick = null;
      if (G.$('#difficulty')) G.hide(G.$('#difficulty'));
    },

    open(kind, onPick) {
      if (this.active) return;
      this.kind = kind;
      this.onPick = onPick || null;
      this.active = true;
      G.overlayDepth++;
      G.ui.prompt(null);
      if (kind === 'cn') {
        G.$('#diff-kicker').textContent = '非遗 · 中国传统木结构营造技艺';
        G.$('#diff-title').textContent = '榫卯合拢 · 选择难度';
        G.$('.diff-sub').textContent = '难度决定回合数和方向数，地狱模式限时。';
      } else if (kind === 'en') {
        G.$('#diff-kicker').textContent = '非遗 · 提诺斯大理石雕刻技艺';
        G.$('#diff-title').textContent = '回纹凿刻 · 选择难度';
        G.$('.diff-sub').textContent = '难度决定回纹组数和步数，地狱模式限时。';
      } else {
        G.$('#diff-kicker').textContent = '非遗 · 打铁花';
        G.$('#diff-title').textContent = '打铁花 · 选择难度';
        G.$('.diff-sub').textContent = '难度越高，勺数越少、铁水烧得越快、要砸得更准。';
      }
      G.show(G.$('#difficulty'));
      G.audio.sfx('page');
    },

    pick(key) {
      if (!this.active) return;
      this.active = false;
      G.hide(G.$('#difficulty'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.audio.sfx('page');
      const cb = this.onPick;
      this.onPick = null;
      if (cb) setTimeout(() => cb(key), 60);
    },

    back() {
      if (!this.active) return;
      this.active = false;
      G.hide(G.$('#difficulty'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      this.onPick = null;
      G.audio.sfx('page');
    },

    key(code) {
      if (!this.active) return;
      if (code === 'Escape') { this.back(); return; }
      const n = parseInt(code.replace('Digit', ''), 10);
      if (n >= 1 && n <= 3) this.pick(DIFFS[n - 1].key);
    },
  };
})();
