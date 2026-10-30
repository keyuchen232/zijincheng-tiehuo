/* ============================================================
   雅典 · 圣火 — 白昼日晷谜题 + 拍立得相机
   A daytime "align the sundial shadow" puzzle and the photo
   flash used by the travel-journal camera. Both are drawn on
   the main canvas and driven from the frame loop.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const $ = G.$;

  /* ============================================================
     嗖——拍立得 : 快门闪光 + 一张照片
     G.photo.snap() 记录一张到手账，并播放闪光、快门声。
     G.photo.count() 已拍数量。
     ============================================================ */
  let flashT = 0;
  let flashW = 0;
  const PHOTO_SPOTS = {
    athens: {
      id: 'athens', title: '泛雅典娜大道', blurb: '街道向南铺开，卫城像个白帽子压在城的北面。',
      main: '雅', palTop: '#9fae6d', palBot: '#c9bc94',
    },
    piraeus: {
      id: 'piraeus', title: '比雷埃夫斯港', blurb: '船在风里轻轻晃，浪尖上有几点银白的光。',
      main: '比', palTop: '#7fb0c8', palBot: '#c9bc94',
    },
    lycabettus: {
      id: 'lycabettus', title: '吕卡维多斯山顶', blurb: '整个白色城市摊在脚下，一直漫到萨罗尼克湾。',
      main: '吕', palTop: '#9fae6d', palBot: '#8d7c60',
    },
    plaka: {
      id: 'plaka', title: '普拉卡巷口', blurb: '白墙、九重葛、窄巷，柠檬树从院墙里探出枝头。',
      main: '普', palTop: '#c48a9a', palBot: '#e6dcc4',
    },
    parthenon: {
      id: 'parthenon', title: '帕特农门前', blurb: '八根柱子立成一片，山花里刻着雅典娜的诞生。',
      main: '帕', palTop: '#e5dcc6', palBot: '#8d7c60',
    },
    erechtheion: {
      id: 'erechtheion', title: '少女柱长廊', blurb: '六位少女用头顶着屋檐，雨落下来时她们先接着。',
      main: '厄', palTop: '#e5dcc6', palBot: '#8d7c60',
    },
    altar: {
      id: 'altar', title: '雅典娜祭坛', blurb: '北缘的祭坛，正对着帕特农的西山墙。圣火就是从这里点起来的。',
      main: '祭', palTop: '#3a6f8f', palBot: '#8d7c60',
    },
    sounion: {
      id: 'sounion', title: '苏尼翁角峭壁', blurb: '波塞冬神庙立在崖边，海在天际线上烧成一片金红。',
      main: '波', palTop: '#e08a4c', palBot: '#7b5d40',
    },
    home: {
      id: 'home', title: '自家庭院', blurb: '马赛克海豚在夕阳里发亮，猫趴在它旁边打盹。',
      main: '家', palTop: '#3a6f8f', palBot: '#d9cfb8',
    },
  };
  G.photo = {
    spots: PHOTO_SPOTS,
    spec(id) {
      return PHOTO_SPOTS[id] || null;
    },
    snap(id) {
      if (G.save.hasPhoto(id)) return false;
      G.save.addPhoto(id);
      flashW = 1;
      flashT = 0.5;
      G.audio.sfx('pickup');
      G.audio.noise && G.audio.noise(0.08, 0.1, 3600, 1.6);
      const spec = PHOTO_SPOTS[id] || { title: '相片', blurb: '一封陌生而明亮的时刻。' };
      G.ui.toast('咔嚓 · 手账藏品 +1「' + spec.title + '」', 'good', 2800);
      G.fx.burst(320, 180, 14, {
        colors: ['rgba(255,255,255,.8)', 'rgba(255,232,180,.7)'], min: 40, max: 90,
        lifeMin: 0.2, lifeMax: 0.5, sizeMin: 1, sizeMax: 2, flat: true, screen: true,
      });
      return true;
    },
    unlockedCount() {
      return G.save.data.photos.length;
    },
    all() {
      return G.save.data.photos;
    },
    tick(dt) {
      if (flashT > 0) flashT -= dt;
      if (flashW > 0.02) flashW = Math.max(0, flashW - dt * 5);
    },
    draw(ctx) {
      if (flashW <= 0.02) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, flashW);
      ctx.fillStyle = '#fffbe8';
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.restore();
      // a stark white frame, like a fresh polaroid
      if (flashW > 0.5) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(24, 18, G.W - 48, G.H - 36);
        ctx.restore();
      }
    },
  };

  /* ============================================================
     日晷 · align the shadow to the carved hour groove
     G.sundial — a daytime skill puzzle. Rotate the dial hand
     (左/右) so its shadow lies on the highlighted groove, then
     press 空格/E. Six rounds; closeness scores.
     ============================================================ */
  const ROUNDS = 6;
  const GROOVE_ANGLES = [-0.9, -0.45, 0, 0.45, 0.9]; // relative to noon
  const TOL = 0.5;
  const IDEAL = 0.34;

  class SundialGame {
    constructor() {
      this.active = false;
      this.finished = false;
      this.phase = 'ready';
      this.t = 0;
      this.round = 0;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.best = 0;
      this.angle = 0;
      this.target = 0;
      this.msgTimer = null;
      this.settle = 0;
      this.parts = [];
      this.bannerTimer = null;
      this.initDOM();
    }

    initDOM() {
      $('#pd-enter').addEventListener('click', () => this.action());
      $('#pd-retry').addEventListener('click', () => this.retry());
      $('#pd-exit').addEventListener('click', () => this.exit());
      G.$('#puzzle').addEventListener('click', (e) => { if (e.target.id === 'puzzle') G.audio.sfx('error'); });
    }

    start(opts) {
      opts = opts || {};
      this.callbacks = opts;
      this.active = true;
      this.finished = false;
      this.phase = 'ready';
      this.round = 0;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.perfect = 0;
      this.best = G.save.data.obeliskBest || 0;
      this.t = 0;
      this.settle = 0;
      this.parts.length = 0;
      if (opts.title) G.$('#pd-ask').textContent = opts.title;
      G.ui.showHud(false);
      G.ui.prompt(null);
      G.show($('#puzzle'));
      G.hide($('#pd-result'));
      G.overlayDepth++;
      G.fx.clear();
      G.audio.ambient('palace');
      G.audio.sfx('gong');
      if (opts.hint) this.setHint(opts.hint);
      else this.setHint('左 / 右 转动表针 · 空格 锁定');
      setTimeout(() => {
        if (!this.active) return;
        this.nextRound();
      }, 100);
    }

    action() {
      if (!this.active || this.finished) return;
      if (this.phase === 'aim') this.lockAngle();
    }

    key(code) {
      if (!this.active) return false;
      if (this.contextMenu) { if (code === 'Escape') { this.exit(); return true; } return false; }
      if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'ArrowUp') {
        if (this.phase === 'aim') { this.action(); return true; }
      }
      if (this.phase === 'aim') {
        if (code === 'ArrowLeft' || code === 'KeyA') this.angle -= 1.9 * 0.32;
        else if (code === 'ArrowRight' || code === 'KeyD') this.angle += 1.9 * 0.32;
        this.angle = ((this.angle + Math.PI) % (Math.PI * 2)) - Math.PI;
      }
      return true;
    }

    nextRound() {
      this.round++;
      if (this.round > ROUNDS) { this.finish(); return; }
      this.phase = 'aim';
      // pick a groove not immediately matching where the player starts moving from
      const i = G.randInt(0, GROOVE_ANGLES.length - 1);
      this.target = GROOVE_ANGLES[i];
      // start the hand at a deliberately wrong angle
      let start = this.target + G.rand(-2.2, 2.2);
      if (Math.abs(start - this.target) < 0.4) start += 1.4;
      this.angle = ((start + Math.PI) % (Math.PI * 2)) - Math.PI;
      G.show($('#pd-enter'));
      this.setHint('圆 · 滑动表针，让影子落在金环里 · 第 ' + this.round + ' / ' + ROUNDS + ' 环');
      G.audio.sfx('blip');
    }

    lockAngle() {
      const diff = Math.abs(this.angle - this.target);
      const wdiff = Math.min(diff, Math.PI * 2 - diff);
      const score = G.clamp(1 - wdiff / TOL, 0, 1);
      const perfect = wdiff <= IDEAL;
      if (perfect) this.perfect++;
      const hit = score > 0.2;
      if (hit) { this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); }
      else this.combo = 0;
      const base = 150 + score * 460;
      const mult = 1 + Math.min(this.combo, 5) * 0.12;
      const gain = Math.round(base * mult);
      this.score += gain;
      this.comboNow = this.combo;
      this.lastScore = gain;
      this.settle = 1.1;
      this.ringR = 0;
      this.ringT = 0;
      this.hitAngle = this.angle;
      this.lastPerfect = perfect;
      this.lastHit = hit;
      G.audio.sfx(perfect ? 'cheer' : hit ? 'confirm' : 'error');
      if (perfect) this.banner('影 到 · 完美');
      else if (score > 0.66) this.banner('接得稳');
      else if (hit) this.banner('偏了一点');
      else this.banner('脱 靶');
      G.hide($('#pd-enter'));
      this.phase = 'settle';
      $('#pd-score').textContent = this.score.toLocaleString('zh-CN');
    }

    finish() {
      if (this.finished) return;
      this.finished = true;
      this.phase = 'over';
      const stars = this.score >= 5200 ? 3 : this.score >= 3200 ? 2 : this.score >= 1500 ? 1 : 0;
      const title = stars === 3 ? '日影正中' : stars === 2 ? '守着好时辰' : stars === 1 ? '漏了一两环' : '影子飘走了';
      const line = stars === 3 ? '整个上午的表针，都被你一根根送回了刻度上。' :
        stars === 2 ? '石头上的影子终于立住了，能对上墙根那道光。' :
          stars === 1 ? '有几环还是滑过去了，再练练，手会稳。' :
            '影子一次都没站住。老赫说，看日影要像看火，眼睛和手要慢慢来。';
      const best = Math.max(this.best, this.score);
      G.save.data.obeliskBest = best;
      G.save.persist();
      this.best = best;
      $('#pd-res-title').textContent = title;
      $('#pd-res-stars').textContent = '★★★☆☆☆'.slice(3 - stars, 6 - stars);
      $('#pd-res-score').textContent = this.score.toLocaleString('zh-CN');
      $('#pd-res-perfect').textContent = this.perfect;
      $('#pd-res-combo').textContent = this.maxCombo;
      $('#pd-res-best').textContent = best.toLocaleString('zh-CN');
      $('#pd-res-line').textContent = line;
      G.show($('#pd-result'));
      if (this.callbacks && this.callbacks.onScore) this.callbacks.onScore(this.score, best);
      if (this.callbacks && this.callbacks.onComplete) {
        setTimeout(() => { if (this.callbacks && this.callbacks.onComplete) this.callbacks.onComplete(best); }, 900);
      }
      G.audio.sfx('gong');
    }

    retry() {
      this.best = Math.max(this.best, G.save.data.obeliskBest || 0);
      this.active = true;
      this.finished = false;
      this.round = 0;
      this.score = 0;
      this.combo = 0; this.maxCombo = 0; this.perfect = 0;
      G.hide($('#pd-result'));
      setTimeout(() => { if (this.active) this.nextRound(); }, 80);
      this.setHint('日影重来 · 再校一轮');
    }

    exit() {
      if (!this.active) return;
      this.active = false;
      this.finished = false;
      G.hide($('#puzzle'));
      G.hide($('#pd-result'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.input.clearPressed();
      G.ui.showHud(true);
      if (this.callbacks && this.callbacks.onExit) this.callbacks.onExit(this.score);
    }

    setHint(html) {
      const el = $('#pd-hint');
      if (el) el.innerHTML = html;
    }
    banner(text) {
      const el = $('#pd-msg');
      el.textContent = text;
      el.classList.add('show');
      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => el.classList.remove('show'), 720);
    }

    update(dt) {
      this.t += dt;
      G.photo.tick(dt);
      this.updateParts(dt);
      if (this.phase === 'settle') {
        this.settle -= dt;
        this.ringT += dt / 0.4;
        this.ringR = G.clamp(this.ringT, 0, 1);
        if (this.settle <= 0) { this.nextRound(); return; }
      }
      return this;
    }

    updateParts(dt) {
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.life -= dt;
        if (p.life <= 0) { this.parts.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.imageSmoothingEnabled = false;
      // day sky
      const g = ctx.createLinearGradient(0, 0, 0, 360);
      g.addColorStop(0, '#bfe2e6');
      g.addColorStop(0.55, '#f2e6c6');
      g.addColorStop(1, '#e6c58f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);

      // sun
      A.glow(ctx, 500, 86, 70, 'rgba(255,220,140,.5)', 0.7);
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath(); ctx.arc(500, 86, 26, 0, G.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,190,.9)';
      ctx.beginPath(); ctx.arc(494, 82, 9, 0, G.TAU); ctx.fill();

      // a distant pale city along the horizon
      ctx.fillStyle = 'rgba(220,200,160,.55)';
      for (let i = 0; i < 26; i++) {
        const x = i * 27 - 20;
        const h = 10 + G.hash(i, 1, 7) * 20;
        ctx.fillRect(x, 246 - h, 22, h);
      }
      ctx.fillStyle = 'rgba(240,224,184,.5)';
      ctx.fillRect(0, 246, 640, 2);

      // ground / courtyard
      const gg = ctx.createLinearGradient(0, 250, 0, 360);
      gg.addColorStop(0, '#d6c9a6'); gg.addColorStop(1, '#b8a97f');
      ctx.fillStyle = gg;
      ctx.fillRect(0, 250, 640, 110);

      // the sundial on its pedestal
      const cx = 320, cy = 260, R = 78;
      ctx.fillStyle = '#8a7a58';
      ctx.fillRect(cx - 60, cy + R - 6, 120, 16);
      ctx.fillStyle = '#ca3f2a';
      ctx.fillRect(cx - 40, cy + R + 2, 80, 28);
      ctx.fillStyle = 'rgba(90,70,42,.3)';
      ctx.fillRect(cx - 40, cy + R + 22, 80, 6);

      // stone dial face (mild matte)
      ctx.fillStyle = 'rgba(26,20,14,.28)';
      ctx.beginPath(); ctx.arc(cx + 2, cy + 2, R, 0, G.TAU); ctx.fill();
      const dg = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
      dg.addColorStop(0, '#efe5c6'); dg.addColorStop(1, '#d3c195');
      ctx.fillStyle = dg;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, G.TAU); ctx.fill();
      ctx.strokeStyle = '#6e5b36'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, G.TAU); ctx.stroke();

      // carved hour grooves
      for (const a of GROOVE_ANGLES) {
        const ang = -Math.PI / 2 + a;
        const x1 = cx + Math.cos(ang) * (R - 12);
        const y1 = cy + Math.sin(ang) * (R - 12);
        const x2 = cx + Math.cos(ang) * (R - 5);
        const y2 = cy + Math.sin(ang) * (R - 5);
        const isTarget = this.phase === 'aim' && Math.abs(a - this.target) < 0.001;
        ctx.strokeStyle = isTarget ? '#8a2f22' : 'rgba(110,91,54,.55)';
        ctx.lineWidth = isTarget ? 3 : 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        if (isTarget) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,214,120,.85)';
          ctx.lineWidth = 1;
          const pulse = 1 + Math.sin(this.t * 5) * 0.1;
          ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * (R - 9), cy + Math.sin(ang) * (R - 9), 8 * pulse, 0, G.TAU); ctx.stroke();
          ctx.restore();
        }
      }

      // the gnomon (bronze) pointing up (north) + shadow hand opposite
      ctx.strokeStyle = '#8a6a34'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - R + 8); ctx.stroke();
      // shadow wedge cast by the hour hand
      const sa = -Math.PI / 2 + this.angle;
      const hx = cx + Math.cos(sa) * (R - 20);
      const hy = cy + Math.sin(sa) * (R - 20);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#3a3224';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.restore();
      // hour hand tip
      ctx.fillStyle = '#b3442c';
      ctx.beginPath(); ctx.arc(hx, hy, 4, 0, G.TAU); ctx.fill();

      // settle feedback
      if (this.phase === 'settle') {
        const hx2 = cx + Math.cos(-Math.PI / 2 + this.hitAngle) * (R - 20);
        const hy2 = cy + Math.sin(-Math.PI / 2 + this.hitAngle) * (R - 20);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - this.ringT);
        ctx.strokeStyle = this.lastPerfect ? '#ffe9a8' : this.lastHit ? '#ffd479' : '#e05b25';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hx2, hy2, 6 + this.ringR * 22, 0, G.TAU); ctx.stroke();
        ctx.restore();
      }

      this.drawParts(ctx);

      // vignette
      const vg = ctx.createRadialGradient(320, 180, 160, 320, 180, 380);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,25,8,.3)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 640, 360);
    }

    drawParts(ctx) {
      for (const p of this.parts) {
        const a = G.clamp(p.life / p.max, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        ctx.restore();
      }
    }

    addSpark(x, y, n) {
      for (let i = 0; i < (n || 10); i++) {
        const a = G.rand(0, G.TAU), s = G.rand(10, 60);
        this.parts.push({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20,
          life: G.rand(0.4, 0.9), max: 0.9, size: G.rand(1, 2),
          color: G.pick(['#ffe9a8', '#ffd479', '#fff3c4']), grav: 40,
        });
      }
    }
  }

  G.sundial = new SundialGame();
  G.SundialGame = SundialGame;
})();
