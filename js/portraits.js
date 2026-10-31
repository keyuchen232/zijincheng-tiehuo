/* ============================================================
   万象灵境 — character portraits (review build)
   主角「小砚」与导师「见微」的半身立绘 / 标题页小人，全部程序化像素绘制。
   本文件供审核：先不替换游戏内走动小人。
   ============================================================ */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const P = (G.portraits = {});

  /* ---------------- palettes ---------------- */
  const HERO = {
    key: 'hero',
    name: '小砚',
    en: 'THE TRAVELER',
    role: '主角 · 万象灵境的入境者',
    note: '深色碎发，白色立领外套配朱红内衬；背包里装着旧手账，手里托着一块能显出建筑投影的平板。',
    skin: '#f3c69e', skinHi: '#ffdcb8', skinShade: '#d69c73', skinDeep: '#b97f5c',
    hair: '#2a1c18', hairHi: '#4a332a', hairDeep: '#150e0c',
    coat: '#f8f4e9', coatShade: '#ded6c3', coatDeep: '#bcb29a',
    red: '#c0452f', redHi: '#e06c4b', redDeep: '#8d2b1d',
    gold: '#e2b463', goldHi: '#f7dda2',
    strap: '#8a4c39', strapDeep: '#673325',
    pants: '#39404d', pantsShade: '#252b35',
    shoe: '#5a3a24',
    eye: '#241713', iris: '#6b4029',
    device: '#2a3038', deviceShade: '#1a1e24', screen: '#173b4c', screenHi: '#6fd3c8',
  };
  const MENTOR = {
    key: 'mentor',
    name: '狄奥提玛',
    en: 'DIOTIMA · ATHENS',
    role: '导师 · 现代雅典女性博士生导师',
    note: '成熟的雅典女性学者，栗棕齐肩发间有银丝，细框眼镜；深色西装、浅色衬衫、长裤与平底鞋，手持研究夹。',
    skin: '#f6cfa9', skinHi: '#ffe4c6', skinShade: '#dca87f', skinDeep: '#bd8560',
    hair: '#6f4a34', hairHi: '#9c6d4c', hairDeep: '#4a2f22',
    coat: '#26365c', coatShade: '#1a2742', coatHi: '#3a5282',
    shirt: '#faf6ec', shirtShade: '#ded7c7',
    blue: '#3f7ab8', blueHi: '#6ea6dd', blueDeep: '#2a5485',
    gold: '#dfb163', goldHi: '#f6dc9f',
    eye: '#241713', iris: '#8a5a2e',
    frame: '#4a3320',
    laptop: '#d7dbe0', laptopShade: '#a5acb5', laptopDeep: '#7d848d',
    screen: '#123247', screenHi: '#6fd3e0',
  };
  P.HERO = HERO;
  P.MENTOR = MENTOR;

  /* ---------------- primitives (virtual pixel grid) ---------------- */
  function R(c, x, y, w, h, col) {
    if (w <= 0 || h <= 0) return;
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  P.R = R;

  /* row-by-row ellipse — keeps the chunky pixel edge */
  function E(c, cx, cy, rx, ry, col, y0, y1) {
    c.fillStyle = col;
    const top = y0 == null ? Math.ceil(cy - ry) : y0;
    const bot = y1 == null ? Math.ceil(cy + ry) : y1;
    for (let y = top; y < bot; y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy)) + 0.5);
      if (hw > 0) c.fillRect(Math.round(cx - hw), y, hw * 2, 1);
    }
  }
  P.E = E;

  /* ellipse clipped to a vertical half (for hair caps, lash lines) */
  function Ehalf(c, cx, cy, rx, ry, col, mode) {
    const top = Math.ceil(cy - ry);
    const bot = Math.ceil(cy);
    const t = mode === 'top' ? top : bot;
    const b = mode === 'top' ? bot : Math.ceil(cy + ry);
    c.fillStyle = col;
    for (let y = t; y < b; y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy)) + 0.5);
      if (hw > 0) c.fillRect(Math.round(cx - hw), y, hw * 2, 1);
    }
  }

  /* ============================================================
     主角 · 小砚 — 半身立绘  (160 × 200 virtual grid)
     ============================================================ */
  function drawHero(c, t) {
    const s = HERO;

    /* ---- back hair ---- */
    E(c, 80, 54, 37, 34, s.hairDeep);
    R(c, 43, 52, 7, 26, s.hairDeep);
    R(c, 110, 52, 7, 26, s.hairDeep);
    // short back-lit tips
    R(c, 44, 76, 5, 6, s.hairDeep);
    R(c, 111, 76, 5, 6, s.hairDeep);

    /* ---- neck ---- */
    R(c, 72, 94, 16, 20, s.skinShade);
    R(c, 74, 94, 12, 15, s.skin);
    R(c, 74, 105, 12, 6, s.skinShade);

    /* ---- face ---- */
    E(c, 80, 70, 29, 33, s.skin);
    // jaw shadow + cheek light
    E(c, 80, 102, 20, 3, s.skinShade, 100, 103);
    E(c, 80, 92, 23, 9, s.skinHi, 62, 74);
    R(c, 56, 60, 4, 15, s.skinShade); // left temple shadow
    R(c, 101, 60, 4, 15, s.skinShade);
    // ears
    E(c, 51, 79, 4, 6, s.skin);
    E(c, 109, 79, 4, 6, s.skin);
    R(c, 48, 78, 2, 4, s.skinShade);
    R(c, 110, 78, 2, 4, s.skinShade);

    /* ---- front hair: rounded cap, tufts, swept fringe ---- */
    Ehalf(c, 80, 56, 38, 41, s.hair, 'top');
    // soft tufts that break the dome silhouette
    E(c, 60, 20, 12, 10, s.hair);
    E(c, 78, 14, 13, 10, s.hair);
    E(c, 95, 19, 12, 10, s.hair);
    E(c, 48, 32, 8, 9, s.hair);
    E(c, 108, 34, 8, 9, s.hair);
    // swept fringe
    const fringe = [[45, 9, 61], [55, 8, 57], [63, 7, 55], [70, 8, 60], [78, 7, 52], [85, 8, 62], [93, 7, 57], [100, 9, 63], [109, 6, 58]];
    for (const [fx, fw, fb] of fringe) R(c, fx, 48, fw, fb - 48, s.hair);
    // loose strands on the forehead
    R(c, 61, 55, 2, 6, s.hair);
    R(c, 96, 54, 2, 7, s.hair);
    // side locks
    R(c, 44, 46, 6, 26, s.hair);
    R(c, 110, 46, 6, 26, s.hair);
    R(c, 46, 72, 3, 6, s.hair);
    R(c, 111, 72, 3, 6, s.hair);
    // highlights
    R(c, 57, 30, 20, 4, s.hairHi);
    R(c, 88, 26, 14, 4, s.hairHi);
    R(c, 46, 44, 4, 12, s.hairHi);
    R(c, 109, 40, 4, 14, s.hairHi);
    c.save(); c.globalAlpha = 0.5;
    R(c, 61, 24, 6, 3, '#6d4b3a');
    R(c, 92, 24, 5, 3, '#6d4b3a');
    c.restore();

    /* ---- eyes ---- */
    E(c, 64, 78, 9, 10, '#fdf6ea');
    E(c, 96, 78, 9, 10, '#fdf6ea');
    E(c, 64, 79, 8, 9, s.eye);
    E(c, 96, 79, 8, 9, s.eye);
    E(c, 64, 80, 7, 8, s.iris);
    E(c, 96, 80, 7, 8, s.iris);
    E(c, 64, 81, 4, 6, s.hairDeep);
    E(c, 96, 81, 4, 6, s.hairDeep);
    R(c, 60, 84, 8, 3, '#7d4a2c');
    R(c, 92, 84, 8, 3, '#7d4a2c');
    // specular + lid
    R(c, 58, 73, 5, 4, '#ffffff');
    R(c, 90, 73, 5, 4, '#ffffff');
    R(c, 67, 83, 2, 2, '#e8b58d');
    R(c, 99, 83, 2, 2, '#e8b58d');
    R(c, 55, 69, 18, 2, s.hair);
    R(c, 87, 69, 18, 2, s.hair);
    R(c, 53, 70, 3, 2, s.hair);
    R(c, 84, 70, 3, 2, s.hair);
    R(c, 57, 89, 8, 1, s.skinShade);
    R(c, 89, 89, 8, 1, s.skinShade);

    /* ---- brows ---- */
    R(c, 56, 63, 17, 2, s.hair);
    R(c, 58, 62, 12, 1, s.hairHi);
    R(c, 87, 63, 17, 2, s.hair);
    R(c, 90, 62, 12, 1, s.hairHi);

    /* ---- nose / mouth / blush ---- */
    R(c, 78, 90, 4, 4, s.skinShade);
    R(c, 77, 93, 6, 2, s.skinShade);
    R(c, 73, 97, 14, 2, '#a8543f');
    R(c, 71, 96, 3, 2, '#a8543f');
    R(c, 86, 96, 3, 2, '#a8543f');
    R(c, 76, 99, 8, 1, s.skinShade);
    c.save(); c.globalAlpha = 0.45;
    R(c, 53, 87, 10, 4, '#ec8a70');
    R(c, 97, 87, 10, 4, '#ec8a70');
    c.restore();

    /* ---- jacket body (shoulders first, collar on top) ---- */
    E(c, 80, 150, 58, 30, s.coat);
    R(c, 22, 150, 116, 50, s.coat);
    // side shading
    R(c, 22, 150, 9, 50, s.coatShade);
    R(c, 129, 150, 9, 50, s.coatShade);
    R(c, 25, 152, 3, 48, s.coatDeep);
    R(c, 132, 152, 3, 48, s.coatDeep);
    // shoulder seams
    R(c, 32, 130, 22, 3, s.coatShade);
    R(c, 106, 130, 22, 3, s.coatShade);
    // collar
    R(c, 64, 106, 32, 6, s.coat);
    R(c, 64, 106, 32, 1, s.coatShade);
    R(c, 70, 111, 20, 4, s.red);
    R(c, 73, 115, 14, 4, s.red);
    R(c, 76, 119, 8, 4, s.red);
    R(c, 62, 106, 4, 15, s.coatShade);
    R(c, 94, 106, 4, 15, s.coatShade);
    R(c, 66, 119, 28, 3, s.coatShade);
    // centre placket
    R(c, 74, 120, 12, 80, s.red);
    R(c, 77, 122, 6, 78, s.redDeep);
    R(c, 73, 120, 2, 80, s.gold);
    R(c, 86, 120, 2, 80, s.gold);
    R(c, 77, 128, 6, 3, s.redHi);
    // jacket edges next to the placket
    R(c, 68, 122, 6, 78, s.coatShade);
    R(c, 87, 122, 6, 78, s.coatShade);
    // soft folds between strap and placket
    R(c, 55, 126, 2, 52, s.coatShade);
    R(c, 103, 126, 2, 52, s.coatShade);
    // clasps
    for (const by of [138, 158, 178]) {
      R(c, 79, by, 3, 3, s.gold);
    }
    // hem shadow
    R(c, 30, 192, 100, 8, s.coatShade);

    /* ---- backpack straps ---- */
    R(c, 38, 132, 11, 54, s.strap);
    R(c, 39, 132, 4, 54, '#a55f47');
    R(c, 111, 132, 11, 54, s.strap);
    R(c, 114, 132, 4, 54, '#a55f47');
    R(c, 38, 132, 11, 4, s.strapDeep);
    R(c, 111, 132, 11, 4, s.strapDeep);
    R(c, 41, 128, 7, 7, s.strap);
    R(c, 111, 128, 7, 7, s.strap);
    R(c, 41, 150, 5, 5, s.gold);
    R(c, 114, 150, 5, 5, s.gold);

    /* ---- hands + tablet ---- */
    c.save(); c.globalAlpha = 0.2;
    R(c, 50, 160, 60, 30, s.screenHi);
    c.restore();
    R(c, 52, 158, 56, 34, s.device);
    R(c, 55, 161, 50, 28, s.screen);
    // palace on screen
    R(c, 64, 180, 32, 6, '#8d2b1d');
    R(c, 67, 176, 26, 4, '#c0452f');
    R(c, 71, 172, 18, 4, '#e2b463');
    R(c, 75, 168, 10, 4, '#f7dda2');
    R(c, 78, 182, 6, 4, '#e2b463');
    R(c, 64, 180, 32, 1, '#f7dda2');
    // scan line
    const sy = 162 + Math.floor((t * 14) % 24);
    c.save(); c.globalAlpha = 0.75;
    R(c, 55, sy, 50, 2, '#a8f0e4');
    c.restore();
    // hands holding the edges
    R(c, 40, 160, 14, 13, s.skin);
    R(c, 40, 171, 12, 3, s.skinShade);
    R(c, 106, 160, 14, 13, s.skin);
    R(c, 109, 171, 11, 3, s.skinShade);
    R(c, 50, 162, 4, 8, s.skinHi);
    R(c, 106, 162, 4, 8, s.skinHi);

    /* ---- warm rim light ---- */
    c.save();
    c.globalAlpha = 0.2;
    R(c, 20, 130, 3, 60, '#fff3d0');
    c.restore();
  }

  /* ============================================================
     导师 · 见微 — 半身立绘  (160 × 200 virtual grid)
     ============================================================ */
  function drawMentor(c, t) {
    function poly(points, color) {
      c.beginPath(); points.forEach(function(p,i){if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});
      c.closePath();c.fillStyle=color;c.fill();
    }
    /* Shoulder-length hair, natural proportions and a calm mature expression. */
    E(c,80,62,29,42,'#48352f');
    R(c,51,59,13,50,'#48352f');R(c,96,59,13,50,'#48352f');
    R(c,72,95,16,22,'#c39b81');
    E(c,80,67,23,32,'#dbb79b');
    E(c,57,70,3,6,'#d0a88d');E(c,103,70,3,6,'#d0a88d');
    poly([[55,54],[57,32],[74,23],[94,28],[105,43],[105,60],[92,43],[75,45]],'#584036');
    c.strokeStyle='#a99b91';c.lineWidth=1.5;c.beginPath();c.moveTo(62,34);c.lineTo(57,53);c.moveTo(94,32);c.lineTo(101,49);c.stroke();
    R(c,63,59,12,2,'#594137');R(c,86,59,12,2,'#594137');
    E(c,69,69,5,2,'#f4ece0');E(c,91,69,5,2,'#f4ece0');
    R(c,68,67,3,4,'#302723');R(c,90,67,3,4,'#302723');
    c.strokeStyle='#32343b';c.lineWidth=1.3;c.strokeRect(60,63,17,12);c.strokeRect(83,63,17,12);
    c.beginPath();c.moveTo(77,68);c.lineTo(83,68);c.moveTo(56,65);c.lineTo(60,66);c.moveTo(100,66);c.lineTo(104,65);c.stroke();
    c.strokeStyle='#ae846b';c.lineWidth=1;c.beginPath();c.moveTo(80,72);c.lineTo(82,81);c.lineTo(78,82);c.moveTo(70,90);c.quadraticCurveTo(80,94,90,90);c.moveTo(60,79);c.lineTo(65,81);c.moveTo(95,81);c.lineTo(100,79);c.stroke();
    /* Tailored blazer and an open light blouse. */
    poly([[65,108],[95,108],[108,200],[52,200]],'#ebe8df');
    poly([[65,108],[47,111],[29,127],[23,200],[75,200],[73,147]],'#29384d');
    poly([[95,108],[113,111],[131,127],[137,200],[85,200],[87,147]],'#233046');
    poly([[64,108],[50,126],[62,137],[55,145],[76,181],[73,143]],'#4c5a6d');
    poly([[96,108],[110,126],[98,137],[105,145],[84,181],[87,143]],'#435268');
    poly([[72,107],[80,119],[72,130],[65,113]],'#faf7f0');
    poly([[88,107],[80,119],[88,130],[95,113]],'#faf7f0');
    R(c,80,138,2,2,'#a7a6a0');R(c,80,151,2,2,'#a7a6a0');
    /* Research folder held against the torso. */
    poly([[51,158],[107,151],[113,199],[56,200]],'#667d80');
    poly([[55,160],[104,154],[105,160],[56,166]],'#d9ded7');
    c.strokeStyle='#b4c2bf';c.lineWidth=1.5;c.beginPath();c.moveTo(63,177);c.lineTo(96,173);c.moveTo(64,183);c.lineTo(92,180);c.stroke();
    E(c,52,181,7,10,'#d7b295');E(c,109,179,7,10,'#d7b295');
    void t;
  }

  /* ------------------------------------------------------------
     public: large portrait
     x,y = top-left of the virtual 160×200 box; scale = pixel size
     ------------------------------------------------------------ */
  P.draw = function (ctx, who, x, y, scale, t) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(scale, scale);
    if (who === 'mentor') drawMentor(ctx, t || 0);
    else drawHero(ctx, t || 0);
    ctx.restore();
  };

  /* ============================================================
     标题页小人（全身，40 × 64 虚拟格）
     ============================================================ */
  function chibiHero(c, x, y, k) {
    const s = HERO;
    c.save();
    c.translate(Math.round(x), Math.round(y));
    c.scale(k, k);
    // shadow
    c.save(); c.globalAlpha = 0.22; R(c, 11, 62, 20, 2, '#2b2418'); c.restore();
    // backpack behind
    R(c, 9, 33, 4, 13, s.strapDeep);
    // legs
    R(c, 14, 50, 5, 9, s.pants);
    R(c, 21, 50, 5, 9, s.pants);
    R(c, 14, 50, 5, 2, '#4b535f');
    R(c, 13, 58, 7, 4, s.shoe);
    R(c, 20, 58, 7, 4, s.shoe);
    // body: white jacket + red centre
    R(c, 11, 30, 18, 21, s.coat);
    R(c, 12, 31, 2, 19, s.coatShade);
    R(c, 26, 31, 2, 19, s.coatShade);
    R(c, 19, 31, 2, 16, s.red);
    R(c, 18, 31, 1, 16, s.gold);
    R(c, 21, 31, 1, 16, s.gold);
    // straps
    R(c, 13, 31, 2, 17, s.strap);
    R(c, 25, 31, 2, 17, s.strap);
    // collar
    R(c, 16, 29, 8, 3, s.coat);
    R(c, 17, 30, 6, 2, s.red);
    // arms
    R(c, 8, 32, 4, 13, s.coat);
    R(c, 28, 32, 4, 13, s.coat);
    R(c, 8, 31, 4, 2, s.coatShade);
    R(c, 28, 31, 4, 2, s.coatShade);
    R(c, 8, 44, 4, 5, s.skin);
    R(c, 28, 44, 4, 5, s.skin);
    // tablet in both hands
    R(c, 12, 43, 16, 11, s.device);
    R(c, 13, 44, 14, 9, s.screen);
    R(c, 15, 50, 10, 2, s.redDeep);
    R(c, 17, 48, 6, 2, s.red);
    R(c, 19, 46, 2, 2, s.gold);
    R(c, 19, 50, 2, 2, s.goldHi);
    R(c, 13, 44, 14, 1, '#2f6277');
    R(c, 12, 43, 16, 1, s.deviceShade);
    R(c, 10, 44, 3, 5, s.skin);
    R(c, 27, 44, 3, 5, s.skin);
    // neck + head
    R(c, 18, 27, 4, 3, s.skinShade);
    R(c, 12, 13, 16, 15, s.hairDeep);
    R(c, 13, 14, 14, 14, s.skin);
    R(c, 13, 14, 14, 3, s.hair);
    R(c, 12, 12, 16, 5, s.hair);
    // bangs
    R(c, 13, 17, 4, 3, s.hair);
    R(c, 18, 16, 3, 4, s.hair);
    R(c, 23, 17, 4, 3, s.hair);
    R(c, 11, 16, 2, 8, s.hair);
    R(c, 27, 16, 2, 8, s.hair);
    // spikes
    R(c, 15, 9, 3, 3, s.hair);
    R(c, 20, 8, 3, 4, s.hair);
    R(c, 24, 11, 2, 2, s.hair);
    R(c, 16, 13, 6, 2, s.hairHi);
    R(c, 22, 14, 3, 1, s.hairHi);
    // ears
    R(c, 11, 20, 2, 3, s.skin);
    R(c, 27, 20, 2, 3, s.skin);
    // eyes + mouth
    R(c, 15, 21, 2, 3, s.eye);
    R(c, 23, 21, 2, 3, s.eye);
    R(c, 15, 21, 1, 1, '#ffffff');
    R(c, 23, 21, 1, 1, '#ffffff');
    R(c, 18, 26, 3, 1, '#a8543f');
    c.restore();
  }

  function chibiMentor(c, x, y, k) {
    const s = MENTOR;
    c.save();
    c.translate(Math.round(x), Math.round(y));
    c.scale(k, k);
    c.save(); c.globalAlpha = 0.22; R(c, 12, 62, 20, 2, '#2b2418'); c.restore();
    // legs: skirt + tights
    R(c, 13, 49, 16, 6, s.coat);
    R(c, 14, 55, 5, 6, '#2f3540');
    R(c, 22, 55, 5, 6, '#2f3540');
    R(c, 13, 59, 7, 3, '#6b4a30');
    R(c, 21, 59, 7, 3, '#6b4a30');
    // body
    R(c, 11, 30, 18, 20, s.coat);
    R(c, 12, 31, 2, 18, s.coatHi);
    R(c, 26, 31, 2, 18, s.coatShade);
    // shirt + tie
    R(c, 17, 30, 6, 12, s.shirt);
    R(c, 19, 31, 2, 10, s.blue);
    R(c, 18, 30, 4, 3, s.blueDeep);
    // lapels
    R(c, 15, 31, 2, 10, s.coatShade);
    R(c, 23, 31, 2, 10, s.coatShade);
    // arms
    R(c, 8, 32, 4, 13, s.coat);
    R(c, 28, 32, 4, 13, s.coat);
    R(c, 8, 43, 4, 6, s.skin);
    R(c, 28, 43, 4, 6, s.skin);
    // laptop
    R(c, 12, 39, 16, 9, s.laptopShade);
    R(c, 13, 40, 14, 7, s.screen);
    R(c, 15, 43, 10, 1, s.screenHi);
    R(c, 16, 41, 8, 1, s.screenHi);
    R(c, 11, 47, 18, 2, s.laptop);
    R(c, 12, 47, 16, 1, s.laptopShade);
    R(c, 9, 43, 3, 5, s.skin);
    R(c, 28, 43, 3, 5, s.skin);
    // neck + head
    R(c, 18, 27, 4, 3, s.skinShade);
    R(c, 12, 13, 16, 15, s.hairDeep);
    R(c, 13, 14, 14, 13, s.skin);
    // curly hair
    R(c, 11, 11, 18, 6, s.hair);
    E(c, 13, 16, 4, 4, s.hair);
    E(c, 20, 14, 4, 4, s.hair);
    E(c, 26, 16, 4, 4, s.hair);
    E(c, 16, 11, 4, 3, s.hair);
    E(c, 23, 11, 4, 3, s.hair);
    R(c, 14, 12, 5, 2, s.hairHi);
    R(c, 22, 10, 4, 2, s.hairHi);
    // ponytail
    E(c, 29, 20, 4, 6, s.hair);
    R(c, 28, 16, 4, 3, s.blue);
    // ears
    R(c, 11, 20, 2, 3, s.skin);
    R(c, 27, 20, 2, 3, s.skin);
    // glasses + eyes
    R(c, 14, 20, 6, 1, s.frame);
    R(c, 21, 20, 6, 1, s.frame);
    R(c, 14, 20, 1, 5, s.frame);
    R(c, 19, 20, 1, 5, s.frame);
    R(c, 21, 20, 1, 5, s.frame);
    R(c, 26, 20, 1, 5, s.frame);
    R(c, 14, 24, 6, 1, s.frame);
    R(c, 21, 24, 6, 1, s.frame);
    R(c, 15, 22, 2, 2, s.eye);
    R(c, 23, 22, 2, 2, s.eye);
    R(c, 19, 26, 2, 1, '#b05a45');
    c.restore();
  }

  P.chibi = function (ctx, who, x, y, scale) {
    if (who === 'mentor') chibiMentor(ctx, x, y, scale || 1);
    else chibiHero(ctx, x, y, scale || 1);
  };
})();
