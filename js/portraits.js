/* ============================================================
   万象灵境 — character portraits (review build)
   主角「小砚」与导师「狄奥提玛」的半身立绘 / 标题页小人，全部程序化像素绘制。
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
     导师 · 狄奥提玛 — 半身立绘  (160 × 200 virtual grid)
     ============================================================ */
  function drawMentor(c, t) {
    const s = MENTOR;
    // Same integer rectangles / scanline ellipses as drawHero.
    E(c, 80, 62, 32, 43, s.hairDeep);
    R(c, 48, 58, 14, 51, s.hairDeep);
    R(c, 98, 58, 14, 51, s.hairDeep);
    R(c, 51, 69, 6, 36, s.hair);
    R(c, 104, 66, 5, 39, s.hair);
    R(c, 72, 94, 16, 23, s.skinShade);
    R(c, 75, 96, 10, 15, s.skin);
    E(c, 80, 68, 25, 33, s.skin);
    E(c, 55, 72, 3, 6, s.skinShade);
    E(c, 105, 72, 3, 6, s.skinShade);
    R(c, 58, 62, 3, 17, s.skinShade);
    R(c, 99, 62, 3, 17, s.skinShade);
    Ehalf(c, 80, 51, 33, 31, s.hair, 'top');
    R(c, 49, 43, 9, 19, s.hair);
    R(c, 55, 39, 17, 12, s.hair);
    R(c, 67, 35, 14, 10, s.hair);
    R(c, 81, 36, 13, 9, s.hair);
    R(c, 93, 42, 10, 12, s.hair);
    R(c, 102, 49, 9, 18, s.hair);
    R(c, 57, 32, 13, 3, s.hairHi);
    R(c, 91, 35, 9, 3, s.hairHi);
    // Silver at both temples follows a visibly stepped pixel contour.
    R(c, 58, 39, 2, 10, '#b9b1a8');
    R(c, 55, 49, 2, 17, '#b9b1a8');
    R(c, 100, 42, 2, 10, '#b9b1a8');
    R(c, 104, 52, 2, 19, '#b9b1a8');
    R(c, 62, 59, 14, 2, s.hairDeep);
    R(c, 85, 59, 14, 2, s.hairDeep);
    E(c, 69, 70, 6, 3, s.shirt);
    E(c, 91, 70, 6, 3, s.shirt);
    R(c, 68, 68, 3, 4, s.eye);
    R(c, 90, 68, 3, 4, s.eye);
    // Frames are four one-pixel bars, never stroked half-pixel edges.
    for (const gx of [60, 83]) {
      R(c, gx, 64, 17, 1, s.frame);
      R(c, gx, 75, 17, 1, s.frame);
      R(c, gx, 65, 1, 10, s.frame);
      R(c, gx + 16, 65, 1, 10, s.frame);
    }
    R(c, 77, 68, 6, 1, s.frame);
    R(c, 56, 65, 4, 1, s.frame);
    R(c, 100, 65, 4, 1, s.frame);
    R(c, 80, 74, 2, 8, s.skinShade);
    R(c, 78, 81, 5, 2, s.skinShade);
    R(c, 70, 90, 5, 1, '#a66d5a');
    R(c, 75, 91, 10, 1, '#a66d5a');
    R(c, 85, 90, 5, 1, '#a66d5a');
    R(c, 61, 80, 5, 1, s.skinShade);
    R(c, 94, 80, 5, 1, s.skinShade);
    // Stepped shoulders, navy blazer, open light blouse and lapels.
    E(c, 80, 147, 57, 34, s.coat);
    R(c, 23, 147, 114, 53, s.coat);
    R(c, 23, 148, 8, 52, s.coatShade);
    R(c, 129, 148, 8, 52, s.coatShade);
    R(c, 66, 109, 28, 91, s.shirtShade);
    R(c, 73, 114, 14, 86, s.shirt);
    for (let i = 0; i < 8; i++) {
      R(c, 54 + i * 2, 114 + i * 6, 9, 6, s.coatHi);
      R(c, 97 - i * 2, 114 + i * 6, 9, 6, s.coatHi);
    }
    R(c, 67, 109, 7, 7, s.shirt);
    R(c, 71, 116, 6, 6, s.shirt);
    R(c, 86, 109, 7, 7, s.shirt);
    R(c, 83, 116, 6, 6, s.shirt);
    R(c, 80, 136, 2, 2, '#a7a6a0');
    R(c, 80, 149, 2, 2, '#a7a6a0');
    R(c, 36, 141, 3, 52, s.coatHi);
    R(c, 121, 141, 3, 52, s.coatShade);
    // Research folder, paper edge, label and hands.
    R(c, 51, 158, 58, 42, '#4b646a');
    R(c, 55, 155, 50, 7, '#d9ded7');
    R(c, 54, 163, 52, 37, '#667d80');
    R(c, 58, 166, 2, 34, '#819595');
    R(c, 65, 172, 30, 2, '#d9ded7');
    R(c, 65, 179, 24, 2, '#b4c2bf');
    R(c, 65, 185, 28, 2, '#b4c2bf');
    E(c, 51, 181, 7, 10, s.skin);
    E(c, 109, 181, 7, 10, s.skin);
    R(c, 46, 187, 10, 2, s.skinShade);
    R(c, 104, 187, 10, 2, s.skinShade);
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
    // Separate navy trouser legs and flat shoes.
    R(c, 14, 48, 5, 12, s.coatShade);
    R(c, 22, 48, 5, 12, s.coatShade);
    R(c, 14, 49, 1, 9, s.coatHi);
    R(c, 22, 49, 1, 9, s.coatHi);
    R(c, 12, 59, 8, 3, '#171c24');
    R(c, 21, 59, 8, 3, '#171c24');
    // body
    R(c, 11, 30, 18, 20, s.coat);
    R(c, 12, 31, 2, 18, s.coatHi);
    R(c, 26, 31, 2, 18, s.coatShade);
    // Open light blouse.
    R(c, 17, 30, 6, 12, s.shirt);
    R(c, 19, 30, 2, 3, s.skinShade);
    R(c, 19, 35, 1, 1, s.shirtShade);
    // lapels
    R(c, 15, 31, 2, 10, s.coatShade);
    R(c, 23, 31, 2, 10, s.coatShade);
    // arms
    R(c, 8, 32, 4, 13, s.coat);
    R(c, 28, 32, 4, 13, s.coat);
    R(c, 8, 43, 4, 6, s.skin);
    R(c, 28, 43, 4, 6, s.skin);
    // Research folder with a pale paper edge.
    R(c, 12, 40, 16, 12, '#4b646a');
    R(c, 13, 39, 14, 2, '#d9ded7');
    R(c, 14, 42, 12, 9, '#667d80');
    R(c, 16, 44, 8, 1, '#d9ded7');
    R(c, 16, 47, 6, 1, '#b4c2bf');
    R(c, 9, 43, 3, 5, s.skin);
    R(c, 28, 43, 3, 5, s.skin);
    // neck + head
    R(c, 18, 27, 4, 3, s.skinShade);
    R(c, 12, 13, 16, 15, s.hairDeep);
    R(c, 13, 14, 14, 13, s.skin);
    // Shoulder-length chestnut hair, stepped fringe and silver temples.
    R(c, 11, 12, 18, 5, s.hair);
    R(c, 14, 10, 12, 3, s.hair);
    R(c, 10, 16, 3, 14, s.hairDeep);
    R(c, 27, 16, 3, 14, s.hairDeep);
    R(c, 11, 16, 2, 12, s.hair);
    R(c, 27, 16, 2, 12, s.hair);
    R(c, 13, 16, 5, 2, s.hair);
    R(c, 23, 16, 4, 3, s.hair);
    R(c, 15, 12, 6, 1, s.hairHi);
    R(c, 12, 17, 1, 7, '#b9b1a8');
    R(c, 27, 18, 1, 7, '#b9b1a8');
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
