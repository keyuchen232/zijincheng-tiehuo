/* ============================================================
   万象灵境 · 非遗档案小游戏
   - 中方：榫卯合拢（旋转榫头，对准卯口）
   - 外方：回纹凿刻（按顺序点击卫城回纹）
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;

  const DIRS = [
    { dx: 0, dy: -1, ch: '↑' },
    { dx: 1, dy: 0, ch: '→' },
    { dx: 0, dy: 1, ch: '↓' },
    { dx: -1, dy: 0, ch: '←' },
  ];

  // 难度配置：回合数 / 方向数 / 回纹步数 / 限时
  const DIFF = {
    easy: { key: 'easy', name: '简易', cn: { rounds: 3, dirs: 2 }, en: { rounds: 1, steps: 3 }, time: 0 },
    hard: { key: 'hard', name: '困难', cn: { rounds: 4, dirs: 4 }, en: { rounds: 2, steps: 5 }, time: 0 },
    hell: { key: 'hell', name: '地狱', cn: { rounds: 5, dirs: 4 }, en: { rounds: 3, steps: 5 }, time: { cn: 60, en: 45 } },
  };

  G.archiveGame = {
    active: false,
    kind: 'cn',
    stage: 0,
    total: 3,
    done: false,
    onDone: null,
    raf: 0,
    last: 0,
    canvas: null,
    ctx: null,
    // 榫卯
    cnAngle: 0,
    cnTarget: 0,
    cnSolved: 0,
    // 回纹
    enSeq: [],
    enIndex: 0,
    enSolved: 0,
    // feedback
    hitFlash: 0,
    missFlash: 0,
    // 难度
    diff: 'hard',
    timeLeft: 0,
    diffCfg: DIFF.hard,

    init() {
      this.canvas = G.$('#ag-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      this.canvas.addEventListener('pointerdown', (e) => this.pointer(e));
      G.$('#ag-close').addEventListener('click', () => this.close(false));
      G.$('#ag-rotate').addEventListener('click', () => this.rotate());
      G.$('#ag-insert').addEventListener('click', () => this.insert());
    },

    reset() {
      cancelAnimationFrame(this.raf);
      this.active = false;
      this.done = false;
      this.onDone = null;
      if (this.canvas) G.hide(G.$('#archive-game'));
    },

    open(kind, diff, onDone) {
      if (this.active) return;
      this.kind = kind;
      this.diff = diff || 'hard';
      this.diffCfg = DIFF[this.diff] || DIFF.hard;
      this.stage = 0;
      this.total = this.diffCfg[kind].rounds;
      this.done = false;
      this.onDone = onDone || null;
      this.hitFlash = 0;
      this.missFlash = 0;
      this.timeLeft = this.diffCfg.time ? this.diffCfg.time[kind] || this.diffCfg.time : 0;
      if (kind === 'cn') {
        this.cnSolved = 0;
        this.nextTenon();
      } else {
        this.enSolved = 0;
        this.nextMeander();
      }
      this.active = true;
      G.overlayDepth++;
      G.ui.prompt(null);
      G.$('#ag-kicker').textContent = kind === 'cn' ? '非遗 · 中国传统木结构营造技艺' : '非遗 · 提诺斯大理石雕刻技艺';
      G.$('#ag-title').textContent = kind === 'cn' ? '榫卯合拢' : '回纹凿刻';
      const cf = this.diffCfg;
      G.$('#ag-sub').textContent = '难度：' + this.diffCfg.name + '。' + (kind === 'cn'
        ? '旋转榫头，对准卯口插入。共 ' + cf.cn.rounds + ' 回合。'
        : '照着回纹顺序凿刻，共 ' + cf.en.rounds + ' 组、每组 ' + cf.en.steps + ' 步。') + (this.timeLeft ? '限时 ' + this.timeLeft + ' 秒。' : '无计时。');
      G.$('#ag-hint').textContent = (kind === 'cn' ? '← / → 旋转 · 空格插入' : '按顺序点击方向 · 或按方向键') + (this.timeLeft ? ' · 剩余 ' + Math.ceil(this.timeLeft) + 's' : '');
      G.$('#ag-controls').classList.toggle('hidden', kind !== 'cn');
      this.updateProgress();
      G.show(G.$('#archive-game'));
      G.audio.sfx('page');
      this.last = performance.now();
      this.raf = requestAnimationFrame((t) => this.loop(t));
    },

    updateProgress() {
      G.$('#ag-progress').textContent = this.stage + ' / ' + this.total;
    },

    nextTenon() {
      this.cnAngle = 0;
      // 简易只出现横向卯口；困难 / 地狱任意方向
      if (this.diffCfg.cn.dirs === 2) {
        this.cnTarget = [0, 2][Math.random() < 0.5 ? 0 : 1];
      } else {
        this.cnTarget = Math.floor(Math.random() * 4);
      }
    },

    nextMeander() {
      const len = this.diffCfg.en.steps + (this.diffCfg.en.steps > 4 ? Math.min(this.enSolved, 1) : 0);
      this.enSeq = [];
      let prev = -1;
      for (let i = 0; i < len; i++) {
        let d = Math.floor(Math.random() * 4);
        if (d === prev) d = (d + 1) % 4;
        this.enSeq.push(d);
        prev = d;
      }
      this.enIndex = 0;
    },

    rotate() {
      if (!this.active || this.kind !== 'cn' || this.done) return;
      this.cnAngle = (this.cnAngle + 1) % 4;
      G.audio.sfx('page');
    },

    insert() {
      if (!this.active || this.kind !== 'cn' || this.done) return;
      if (this.cnAngle === this.cnTarget) {
        this.stage++;
        this.cnSolved++;
        this.hitFlash = 1;
        G.audio.sfx('pickup');
        this.updateProgress();
        if (this.stage >= this.total) this.finish();
        else this.nextTenon();
      } else {
        this.missFlash = 1;
        G.audio.sfx('page');
        G.fx.shake(1.5, 0.16);
      }
    },

    enInput(dir) {
      if (!this.active || this.kind !== 'en' || this.done) return;
      if (dir === this.enSeq[this.enIndex]) {
        this.enIndex++;
        this.hitFlash = 0.55;
        G.audio.sfx('page');
        if (this.enIndex >= this.enSeq.length) {
          this.stage++;
          this.enSolved++;
          this.hitFlash = 1;
          G.audio.sfx('pickup');
          this.updateProgress();
          if (this.stage >= this.total) this.finish();
          else this.nextMeander();
        }
      } else {
        this.enIndex = 0;
        this.missFlash = 1;
        G.audio.sfx('page');
        G.fx.shake(1.5, 0.16);
      }
    },

    finish() {
      this.done = true;
      G.$('#ag-hint').textContent = this.kind === 'cn' ? '榫卯合拢 · 档案解锁' : '回纹完成 · 档案解锁';
      G.audio.sfx('success');
      setTimeout(() => { if (this.active) this.close(true); }, 650);
    },

    forceComplete() {
      if (!this.active) return;
      this.stage = this.total;
      this.done = true;
      this.updateProgress();
      this.close(true);
    },

    lose() {
      if (!this.active || this.done) return;
      this.done = true;
      G.audio.sfx('page');
      G.$('#ag-hint').textContent = '时间到 · 挑战失败';
      const a = this;
      setTimeout(() => {
        if (a.active) {
          a.close(false);
          G.ui.toast('挑战失败，再试一次', 'warn', 2600);
        }
      }, 600);
    },

    pointer(e) {
      if (!this.active || this.done) return;
      e.preventDefault();
      if (this.kind === 'cn') {
        this.rotate();
        return;
      }
      // 把屏幕坐标换算成画布逻辑坐标（520×230），再按“最近的箭头”判定，
      // 让点击和画面上画出来的 ↑↓←→ 大箭头一一对应，避免点偏或点空白误触。
      const r = this.canvas.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 520;
      const py = ((e.clientY - r.top) / r.height) * 230;
      this.enHit(px, py);
    },

    enHit(px, py) {
      // 底部回纹卡片只是“显示”当前进度，不作为输入区
      if (py > 200) return;
      // 与 drawMeander 里画出来的箭头中心完全一致
      const pts = [
        { dir: 0, x: 260, y: 52 },   // ↑
        { dir: 1, x: 496, y: 120 },  // →
        { dir: 2, x: 260, y: 194 },  // ↓
        { dir: 3, x: 24, y: 120 },   // ←
      ];
      let bd = null, bdD = 1e9;
      for (const p of pts) {
        const d = Math.hypot(px - p.x, py - p.y);
        if (d < bdD) { bdD = d; bd = p; }
      }
      // 只有点在箭头附近才算输入；点在中间石板上则忽略，避免误触
      if (bd && bdD <= 46) this.enInput(bd.dir);
    },

    key(code) {
      if (!this.active) return;
      if (code === 'Escape') { this.close(false); return; }
      if (this.kind === 'cn') {
        if (code === 'ArrowLeft' || code === 'KeyA') this.rotate();
        if (code === 'ArrowRight' || code === 'KeyD') this.rotate();
        if (code === 'Space' || code === 'Enter' || code === 'KeyE') this.insert();
      } else {
        if (code === 'ArrowUp' || code === 'KeyW') this.enInput(0);
        if (code === 'ArrowRight' || code === 'KeyD') this.enInput(1);
        if (code === 'ArrowDown' || code === 'KeyS') this.enInput(2);
        if (code === 'ArrowLeft' || code === 'KeyA') this.enInput(3);
      }
    },

    close(success) {
      if (!this.active) return;
      cancelAnimationFrame(this.raf);
      this.active = false;
      G.hide(G.$('#archive-game'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      const cb = this.onDone;
      this.onDone = null;
      if (success && cb) setTimeout(cb, 80);
    },

    loop(t) {
      if (!this.active) return;
      const dt = Math.min(0.05, (t - this.last) / 1000 || 0.016);
      this.last = t;
      this.hitFlash = Math.max(0, this.hitFlash - dt * 2);
      this.missFlash = Math.max(0, this.missFlash - dt * 2);
      if (this.timeLeft > 0) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.lose(); }
      }
      this.draw();
      this.raf = requestAnimationFrame((tt) => this.loop(tt));
    },

    draw() {
      const c = this.ctx;
      if (!c) return;
      c.clearRect(0, 0, 520, 230);
      const bg = c.createLinearGradient(0, 0, 0, 230);
      bg.addColorStop(0, '#15110e');
      bg.addColorStop(1, this.kind === 'cn' ? '#2a1c13' : '#20262a');
      c.fillStyle = bg;
      c.fillRect(0, 0, 520, 230);
      c.strokeStyle = 'rgba(216,178,106,.16)';
      c.strokeRect(5.5, 5.5, 509, 219);
      // pips
      for (let i = 0; i < this.total; i++) {
        c.fillStyle = i < this.stage ? '#d8b26a' : 'rgba(216,178,106,.2)';
        c.fillRect(240 - this.total * 12 + i * 24, 18, 16, 3);
      }
      // 地狱限时进度条
      if (this.timeLeft > 0) {
        const maxT = this.diffCfg.time ? this.diffCfg.time[this.kind] || this.diffCfg.time : 1;
        const p = Math.max(0, Math.min(1, this.timeLeft / maxT));
        c.fillStyle = 'rgba(216,178,106,.14)';
        c.fillRect(452, 12, 56, 11);
        c.fillStyle = p > 0.3 ? '#b9833f' : '#9b3a2b';
        c.fillRect(452 + Math.round((1 - p) * 56), 12, Math.round(p * 56), 11);
        G.text(c, Math.ceil(this.timeLeft) + 's', 480, 10, { size: 5, color: '#e0c9a0', align: 'center' });
      }
      if (this.kind === 'cn') this.drawTenon(c);
      else this.drawMeander(c);
      if (this.hitFlash > 0) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(255,216,142,' + (this.hitFlash * .11) + ')';
        c.fillRect(0, 0, 520, 230);
        c.restore();
      }
      if (this.missFlash > 0) {
        c.save();
        c.strokeStyle = 'rgba(190,75,55,' + (this.missFlash * .8) + ')';
        c.lineWidth = 2;
        c.strokeRect(1, 1, 518, 228);
        c.restore();
      }
      if (this.done) {
        c.fillStyle = 'rgba(8,6,4,.58)';
        c.fillRect(0, 88, 520, 54);
        G.text(c, this.kind === 'cn' ? '榫 卯 合 拢' : '回 纹 完 成', 260, 115, {
          size: 13, color: '#f5d99a', align: 'center', weight: 'bold',
        });
        G.text(c, this.kind === 'cn' ? '中国传统木结构营造技艺' : '提诺斯大理石雕刻技艺', 260, 133, {
          size: 6, color: '#c9b38b', align: 'center',
        });
      }
    },

    drawTenon(c) {
      // two wooden blocks: mortise on the left, rotatable tenon on the right
      const beamY = 102, block = 64;
      c.fillStyle = '#4b3020';
      c.fillRect(54, beamY - 8, 412, 10);
      c.fillStyle = '#6b4529';
      c.fillRect(54, beamY - 6, 412, 5);
      // mortise block
      const mx = 200, my = 132;
      c.fillStyle = '#8a5b35';
      c.fillRect(mx - block / 2, my - block / 2, block, block);
      c.fillStyle = '#b78951';
      c.fillRect(mx - block / 2 + 3, my - block / 2 + 3, block - 6, block - 6);
      // notch in target direction
      c.save();
      c.translate(mx, my);
      c.rotate(this.cnTarget * Math.PI / 2);
      c.fillStyle = '#1b110b';
      c.fillRect(block / 2 - 2, -11, 18, 22);
      c.strokeStyle = 'rgba(216,178,106,.8)';
      c.strokeRect(block / 2 - 1.5, -10.5, 17, 21);
      c.restore();
      // tenon block
      const tx = 340;
      c.save();
      c.translate(tx, my);
      c.rotate(this.cnAngle * Math.PI / 2);
      c.fillStyle = '#8a5b35';
      c.fillRect(-block / 2, -block / 2, block, block);
      c.fillStyle = '#c18f56';
      c.fillRect(-block / 2 + 3, -block / 2 + 3, block - 6, block - 6);
      c.fillStyle = '#7a4b2b';
      c.fillRect(block / 2 - 2, -11, 18, 22);
      c.fillStyle = '#d2a266';
      c.fillRect(block / 2, -8, 14, 4);
      c.strokeStyle = 'rgba(240,205,132,.65)';
      c.strokeRect(block / 2 + .5, -10.5, 17, 21);
      c.restore();
      C_text(c, '卯口', mx, my + block / 2 + 18, '#d8b26a');
      C_text(c, '榫头', tx, my + block / 2 + 18, '#d8b26a');
      G.text(c, DIRS[this.cnTarget].ch, mx, my - block / 2 - 9, { size: 10, color: '#d8b26a', align: 'center' });
      G.text(c, '转到同向', mx, my - block / 2 - 20, { size: 6, color: '#8d7c63', align: 'center' });
      // marks
      c.strokeStyle = 'rgba(216,178,106,.28)';
      c.setLineDash([3, 5]);
      c.beginPath(); c.moveTo(mx + block / 2 + 20, my); c.lineTo(tx - block / 2 - 20, my); c.stroke();
      c.setLineDash([]);
      C_text(c, '旋转榫头，凸榫对准凹槽后插入', 260, 205, '#8d7c63');
    },

    drawMeander(c) {
      // a marble plaque with a sequence of Greek key moves
      c.fillStyle = '#c9c0ab';
      c.fillRect(76, 70, 368, 118);
      c.fillStyle = '#ddd4bf';
      c.fillRect(80, 74, 360, 110);
      c.strokeStyle = 'rgba(92,84,70,.25)';
      for (let yy = 88; yy < 180; yy += 9) {
        c.beginPath(); c.moveTo(84, yy); c.lineTo(436, yy); c.stroke();
      }
      // carved path preview (dim) and completed (gold)
      const startX = 116, startY = 162;
      let x = startX, y = startY;
      for (let i = 0; i < this.enSeq.length; i++) {
        const d = DIRS[this.enSeq[i]];
        const nx = x + d.dx * 30, ny = y + d.dy * 30;
        c.strokeStyle = i < this.enIndex ? '#c79c54' : 'rgba(95,83,64,.3)';
        c.lineWidth = i < this.enIndex ? 3 : 1.5;
        c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
        if (i === this.enIndex && !this.done) {
          c.strokeStyle = 'rgba(216,178,106,.9)';
          c.lineWidth = 1;
          c.beginPath(); c.arc(nx, ny, 5, 0, G.TAU); c.stroke();
        }
        x = nx; y = ny;
      }
      // sequence cards
      const cardW = 44, gap = 8;
      const totalW = this.enSeq.length * cardW + (this.enSeq.length - 1) * gap;
      let sx = 260 - totalW / 2;
      for (let i = 0; i < this.enSeq.length; i++) {
        c.fillStyle = i < this.enIndex ? 'rgba(199,156,84,.18)' : 'rgba(30,36,38,.55)';
        c.fillRect(sx, 204, cardW, 22);
        c.strokeStyle = i === this.enIndex ? '#d8b26a' : 'rgba(216,178,106,.22)';
        c.strokeRect(sx + .5, 204.5, cardW - 1, 21);
        G.text(c, DIRS[this.enSeq[i]].ch, sx + cardW / 2, 219, {
          size: 9, color: i < this.enIndex ? '#c79c54' : '#d9c9ad', align: 'center',
        });
        sx += cardW + gap;
      }
      // 四个方向点击区：热点圈与箭头一一对应（画在哪，点在哪）
      const zones = [
        { d: 0, x: 260, y: 52, ch: '↑' },
        { d: 1, x: 496, y: 120, ch: '→' },
        { d: 2, x: 260, y: 194, ch: '↓' },
        { d: 3, x: 24, y: 120, ch: '←' },
      ];
      for (const z of zones) {
        const current = this.enSeq[this.enIndex] === z.d && !this.done;
        c.strokeStyle = current ? 'rgba(224,178,94,.95)' : 'rgba(111,163,157,.4)';
        c.lineWidth = current ? 2.5 : 1.2;
        c.beginPath(); c.arc(z.x, z.y, 20, 0, G.TAU); c.stroke();
        c.lineWidth = 1;
        G.text(c, z.ch, z.x, z.y + 5, { size: 17, color: current ? '#ffdf9e' : 'rgba(216,178,106,.85)', align: 'center', weight: 'bold' });
      }
      C_text(c, '照着回纹顺序，点击外圈的 ↑ ↓ ← →', 260, 24, '#8d7c63');
    },
  };

  function C_text(c, text, x, y, color) {
    G.text(c, text, x, y, { size: 9, color, align: 'center' });
  }
})();
