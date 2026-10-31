/* ============================================================
   紫禁城 · 铁火 — pixel art library
   All art is drawn procedurally on a 640x360 canvas.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = (G.art = {});
  const INK = '#17110e';

  A.pal = {
    ink: INK,
    roofA: '#cf8f38', roofB: '#b5742a', roofC: '#e3ac4e', roofEdge: '#6e3d1d',
    roofRidge: '#5b3218', roofGold: '#f0cd84',
    wall: '#9a3a2b', wallDark: '#6b241b', wallLight: '#b94b36',
    stone: '#cfc5aa', stoneMid: '#b3a88d', stoneDark: '#8d8168',
    marble: '#ddd6c1', marbleDark: '#b2a991',
    wood: '#5a3822', woodDark: '#392315', woodLight: '#8a5a34',
    gold: '#d8b26a', goldHi: '#f4dda0', goldDark: '#8f682f',
    teal: '#3f9188', tealDark: '#245f5a', tealHi: '#6fc4b6',
    red: '#a33c2b', redDark: '#70261c', redHi: '#c8573c',
    gray: '#7a7368', grayDark: '#4f4a43', grayLight: '#a39a8b',
    grass: '#5f7447', grassDark: '#455733', grassLight: '#7d9258',
    water: '#2f6b6d', waterDark: '#1e4a50', waterLight: '#5b9b96',
    night: '#0b1026', skin: '#e8b58d', skinDark: '#c88f68',
    hair: '#261b16', white: '#efe9d8', black: '#1a1614',
  };

  const ACTOR_DEFAULT = {
    robe: '#2f7f78', robeDark: '#1f5955', robeLight: '#4da79c',
    trim: '#e0b05a', pants: '#2a3038', shoe: '#442a1b',
    skin: '#e8b58d', skinShade: '#c88f68', hair: '#261b16',
    hat: '#1b1a1c', bag: '#8a5a33', eye: '#201614', hatType: 'ming',
    scarf: null,
  };

  A.actorPalettes = {
    player: { robe: '#2f8e84', robeDark: '#1b5a55', robeLight: '#62c8b9', trim: '#edc36d', scarf: '#e2b76b' },
    guard: { robe: '#9c3a2b', robeDark: '#6f241a', robeLight: '#bd5138', trim: '#e7c27a', hatType: 'ming', hat: '#171719', scarf: '#d8b26a' },
    zhao: { robe: '#4b3828', robeDark: '#2f2118', robeLight: '#6f5238', trim: '#b98b52', hatType: 'none', hair: '#9b948a', skin: '#c99265', bag: '#6b4a2c' },
    tourist: { robe: '#c9a13e', robeDark: '#96742a', robeLight: '#e0bd5d', trim: '#7c4d2a', hatType: 'cap', hat: '#b54a38', bag: '#3f5a6b' },
    tourist2: { robe: '#b45a45', robeDark: '#833a2c', robeLight: '#cf7860', trim: '#e8c78f', hatType: 'none', bag: '#76543a' },
    auntie: { robe: '#8d3d55', robeDark: '#68273c', robeLight: '#ad5870', trim: '#e3b980', hatType: 'none', scarf: '#d8b26a' },
    child: { robe: '#4f7f9f', robeDark: '#345c76', robeLight: '#6fa3c4', trim: '#f0d083', hatType: 'cap', hat: '#e1b34d', bag: '#7a5131' },
    vendor: { robe: '#6f5240', robeDark: '#4a3528', robeLight: '#8f6c52', trim: '#c99b5d', hatType: 'straw', bag: '#7a5131' },
    worker: { robe: '#345d6b', robeDark: '#22414b', robeLight: '#4b7d8c', trim: '#d9b269', hatType: 'cap', hat: '#d9b269', bag: '#5b4127' },
    guide: { robe: '#7a3c33', robeDark: '#552720', robeLight: '#975348', trim: '#e3c183', hatType: 'none', scarf: '#dfc48d' },
  };

  /* ------------------------------------------------------------
     primitives
     ------------------------------------------------------------ */
  function r(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  A.r = r;

  A.shadow = function (ctx, x, y, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 0.32 : alpha;
    ctx.fillStyle = '#0a0705';
    const ww = Math.max(2, Math.round(w));
    ctx.fillRect(Math.round(x - ww / 2), Math.round(y - 1), ww, 1);
    ctx.fillRect(Math.round(x - ww / 2 + 1), Math.round(y), ww - 2, 1);
    if (h) ctx.fillRect(Math.round(x - ww / 2 + 2), Math.round(y + 1), ww - 4, 1);
    ctx.restore();
  };

  A.dither = function (ctx, x, y, w, h, c, density, seed) {
    ctx.fillStyle = c;
    density = density == null ? 0.18 : density;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        if (G.hash(x + xx, y + yy, seed || 7) < density) ctx.fillRect(x + xx, y + yy, 1, 1);
      }
    }
  };

  A.paving = function (ctx, x, y, w, h, base, alt, seed, tile) {
    tile = tile || 12;
    r(ctx, x, y, w, h, base);
    ctx.save();
    // large slabs read as stone rather than a checkerboard
    const slab = tile * 3;
    for (let yy = 0; yy < h; yy += slab) {
      for (let xx = 0; xx < w; xx += slab) {
        const n = G.hash(x + xx, y + yy, (seed || 3) + 5);
        ctx.globalAlpha = 0.05 + n * 0.05;
        ctx.fillStyle = n < 0.5 ? alt : '#e8ddc4';
        ctx.fillRect(x + xx, y + yy, Math.min(slab, w - xx), Math.min(slab, h - yy));
      }
    }
    ctx.globalAlpha = 0.12;
    for (let yy = 0; yy < h; yy += tile) {
      for (let xx = 0; xx < w; xx += tile) {
        const n = G.hash(x + xx, y + yy, seed || 3);
        if (n < 0.16) {
          ctx.fillStyle = alt;
          ctx.fillRect(x + xx + 1, y + yy + 1, tile - 1, tile - 1);
        } else if (n > 0.86) {
          ctx.fillStyle = '#efe6d1';
          ctx.fillRect(x + xx + 1, y + yy + 1, tile - 1, 1);
        }
      }
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = '#16110c';
    for (let yy = 0; yy < h; yy += tile) ctx.fillRect(x, y + yy, w, 1);
    for (let xx = 0; xx < w; xx += tile) ctx.fillRect(x + xx, y, 1, h);
    ctx.globalAlpha = 0.12;
    for (let yy = 0; yy < h; yy += slab) ctx.fillRect(x, y + yy, w, 1);
    for (let xx = 0; xx < w; xx += slab) ctx.fillRect(x + xx, y, 1, h);
    ctx.restore();
  };

  A.glow = function (ctx, x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(0.4, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha == null ? 0.4 : alpha;
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  };

  /* ------------------------------------------------------------
     characters
     ------------------------------------------------------------ */
  function drawActorSide(ctx, x, y, top, frame, moving, p, o) {
    const step = moving ? (frame === 1 ? 1 : frame === 2 ? -1 : 0) : 0;
    // legs
    r(ctx, x - 2 + step, top + 15, 2, 3, p.pants);
    r(ctx, x + 1 - step, top + 15, 2, 3, p.pants);
    r(ctx, x - 3 + step, top + 17, 3, 2, p.shoe);
    r(ctx, x + 1 - step, top + 17, 4, 2, p.shoe);
    // back arm
    r(ctx, x - 1, top + 9, 2, 4, p.robeDark);
    // body
    r(ctx, x - 3, top + 8, 7, 7, p.robeDark);
    r(ctx, x - 3, top + 8, 6, 6, p.robe);
    r(ctx, x - 3, top + 12, 6, 1, p.trim);
    // bag on back
    r(ctx, x - 5, top + 9, 2, 5, p.bag);
    // head
    r(ctx, x - 4, top - 1, 9, 10, p.hair);
    r(ctx, x - 3, top + 2, 7, 6, p.skin);
    r(ctx, x - 4, top - 1, 9, 3, p.hair);
    r(ctx, x - 4, top + 2, 2, 4, p.hair);
    // face
    r(ctx, x - 1, top + 4, 1, 1, p.eye);
    r(ctx, x + 3, top + 4, 1, 2, p.skinShade);
    r(ctx, x + 1, top + 6, 2, 1, p.skinShade);
    // hat
    if (p.hatType === 'ming') {
      r(ctx, x - 4, top - 3, 8, 3, p.hat);
      r(ctx, x - 6, top - 1, 2, 1, p.hat);
      r(ctx, x + 3, top - 2, 4, 1, p.hat);
    } else if (p.hatType === 'cap') {
      r(ctx, x - 4, top - 2, 8, 2, p.hat);
      r(ctx, x - 5, top, 4, 1, p.hat);
    } else if (p.hatType === 'straw') {
      r(ctx, x - 7, top - 1, 14, 2, '#c9a05a');
      r(ctx, x - 3, top - 5, 6, 4, '#d8b26a');
    }
    // front hand
    r(ctx, x + 1, top + 12, 2, 2, p.skin);
    if (o.accessory === 'spear') {
      r(ctx, x + 4, top - 6, 1, 24, '#5a3a24');
      r(ctx, x + 3, top - 8, 3, 3, '#c8c3b2');
    } else if (o.accessory === 'ladle') {
      r(ctx, x + 3, top + 1, 1, 12, '#7d5b36');
      r(ctx, x + 2, top - 1, 4, 2, '#5a452c');
    }
    if (p.scarf) r(ctx, x - 2, top + 7, 5, 1, p.scarf);
  }

  A.drawActor = function (ctx, x, y, opt) {
    opt = opt || {};
    const p = Object.assign({}, ACTOR_DEFAULT, opt.palette || {});
    const dir = opt.dir || 'down';
    const moving = !!opt.moving;
    const frame = opt.frame || 0;
    const t = opt.time || 0;
    const scale = opt.scale || 1;
    x = Math.round(x);
    y = Math.round(y);
    const bob = moving ? (frame === 1 ? 0 : 1) : (Math.sin(t * 1.9 + (opt.phase || 0)) > 0.3 ? 0 : 1);
    const top = y - 19 + bob;

    ctx.save();
    if (opt.alpha != null) ctx.globalAlpha = opt.alpha;
    if (scale !== 1) {
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    A.shadow(ctx, x, y, moving ? 10 : 9, 2, 0.3);

    if (dir === 'left') {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.translate(-x, 0);
      drawActorSide(ctx, x, y, top, frame, moving, p, opt);
      ctx.restore();
      return;
    }
    if (dir === 'right') {
      drawActorSide(ctx, x, y, top, frame, moving, p, opt);
      ctx.restore();
      return;
    }

    const step = moving ? (frame === 1 ? 1 : frame === 2 ? -1 : 0) : 0;
    // legs
    r(ctx, x - 3 + step, top + 15, 2, 3, p.pants);
    r(ctx, x + 1 - step, top + 15, 2, 3, p.pants);
    r(ctx, x - 4 + step, top + 17, 3, 2, p.shoe);
    r(ctx, x + 1 - step, top + 17, 4, 2, p.shoe);

    // body outline + robe
    r(ctx, x - 4, top + 7, 9, 9, INK);
    r(ctx, x - 4, top + 8, 8, 7, p.robeDark);
    r(ctx, x - 3, top + 8, 7, 6, p.robe);
    r(ctx, x + 2, top + 9, 2, 5, p.robeDark);
    r(ctx, x - 3, top + 12, 7, 1, p.trim);
    r(ctx, x - 3, top + 13, 7, 1, p.robeDark);
    r(ctx, x - 1, top + 8, 3, 1, p.trim);

    // arms
    const armSwing = moving ? (frame === 1 ? 1 : -1) : 0;
    r(ctx, x - 6, top + 9 + armSwing, 2, 4, p.robeDark);
    r(ctx, x + 5, top + 9 - armSwing, 2, 4, p.robeDark);
    r(ctx, x - 6, top + 13 + armSwing, 2, 2, p.skin);
    r(ctx, x + 5, top + 13 - armSwing, 2, 2, p.skin);

    // head
    r(ctx, x - 5, top - 1, 10, 10, INK);
    r(ctx, x - 4, top, 8, 8, p.skin);
    r(ctx, x - 4, top, 8, 3, p.hair);
    r(ctx, x - 4, top + 1, 2, 5, p.hair);
    r(ctx, x + 3, top + 1, 1, 4, p.hair);
    // face / eyes
    if (dir === 'down') {
      r(ctx, x - 2, top + 4, 1, 1, p.eye);
      r(ctx, x + 1, top + 4, 1, 1, p.eye);
      r(ctx, x - 1, top + 6, 2, 1, p.skinShade);
      r(ctx, x - 3, top + 5, 1, 1, '#d99c78');
      r(ctx, x + 2, top + 5, 1, 1, '#d99c78');
    } else {
      // back of head
      r(ctx, x - 4, top + 2, 8, 6, p.hair);
      r(ctx, x - 2, top + 7, 4, 1, p.skinShade);
      // backpack
      r(ctx, x - 3, top + 8, 6, 5, p.bag);
      r(ctx, x - 3, top + 8, 6, 1, '#a87845');
    }

    // hat / hair
    if (p.hatType === 'ming') {
      r(ctx, x - 4, top - 3, 8, 3, p.hat);
      r(ctx, x - 5, top - 2, 1, 1, p.hat);
      r(ctx, x + 4, top - 2, 1, 1, p.hat);
      r(ctx, x - 3, top - 2, 6, 1, '#3a3438');
      if (dir === 'down') {
        r(ctx, x - 5, top, 2, 1, p.hat);
        r(ctx, x + 3, top, 2, 1, p.hat);
      }
    } else if (p.hatType === 'cap') {
      r(ctx, x - 5, top - 2, 10, 2, p.hat);
      r(ctx, x - 5, top, 4, 1, p.hat);
      r(ctx, x + 1, top - 1, 3, 1, '#ffffff');
    } else if (p.hatType === 'straw') {
      r(ctx, x - 7, top - 1, 14, 2, '#c9a05a');
      r(ctx, x - 4, top - 5, 8, 4, '#d8b26a');
      r(ctx, x - 4, top - 5, 8, 1, '#e7c78a');
    } else {
      r(ctx, x - 2, top - 3, 4, 3, p.hair);
      r(ctx, x - 1, top - 2, 2, 2, '#3b2a22');
    }

    if (p.scarf) {
      r(ctx, x - 3, top + 7, 7, 1, p.scarf);
      r(ctx, x + 2, top + 8, 1, 3, p.scarf);
    }

    // accessory
    if (opt.accessory === 'spear') {
      r(ctx, x + 6, top - 8, 1, 25, '#64432a');
      r(ctx, x + 5, top - 10, 3, 3, '#cfc9b7');
      r(ctx, x + 6, top - 12, 1, 2, '#b2a993');
    } else if (opt.accessory === 'ladle') {
      r(ctx, x + 6, top + 1, 1, 13, '#7d5b36');
      r(ctx, x + 5, top - 1, 4, 2, '#5a452c');
    } else if (opt.accessory === 'broom') {
      r(ctx, x - 7, top + 3, 1, 16, '#7d5b36');
      r(ctx, x - 9, top + 17, 5, 2, '#c9a05a');
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------
     roofs & halls
     ------------------------------------------------------------ */
  const spriteCache = new Map();

  function roof(c, cx, baseY, halfW, h, pal, opts) {
    opts = opts || {};
    pal = pal || {};
    h = Math.max(2, Math.round(h || 2));
    halfW = Math.max(4, Math.round(halfW || 4));
    const cA = pal.roofA || A.pal.roofA;
    const cB = pal.roofB || A.pal.roofB;
    const cC = pal.roofC || A.pal.roofC;
    const cEdge = pal.roofEdge || A.pal.roofEdge;
    // under-eave shadow
    c.fillStyle = 'rgba(20,10,5,.35)';
    c.fillRect(cx - halfW, baseY, halfW * 2, 2);
    const rows = [];
    for (let i = 0; i < h; i++) {
      const t = i / Math.max(1, h - 1);
      const half = Math.round(halfW * (1 - 0.62 * Math.pow(t, 0.78)));
      const y = baseY - h + i;
      rows.push([half, y]);
      c.fillStyle = i < 2 ? cEdge : (i % 5 === 0 ? cC : (i % 5 === 2 ? cB : cA));
      c.fillRect(cx - half, y, half * 2, 1);
    }
    // tile ribs and glaze highlights
    c.save();
    c.globalAlpha = 0.28;
    for (let i = 2; i < h; i++) {
      const half = rows[i][0], y = rows[i][1];
      for (let xx = -half + ((i % 2) ? 3 : 0); xx < half; xx += 5) {
        c.fillStyle = (i % 5 === 0) ? '#6b3c1c' : '#7d4a20';
        c.fillRect(cx + xx, y, 1, 1);
      }
    }
    c.globalAlpha = 0.18;
    for (let i = 4; i < h; i += 4) {
      const half = rows[i][0], y = rows[i][1];
      c.fillStyle = '#ffe0a0';
      c.fillRect(cx - half + 3, y, half * 2 - 6, 1);
    }
    c.restore();
    // eaves and upturned tips
    const w0 = rows[0][0];
    c.fillStyle = cEdge;
    c.fillRect(cx - w0, baseY - 2, w0 * 2, 2);
    c.fillRect(cx - w0 - 3, baseY - 4, 3, 2);
    c.fillRect(cx + w0, baseY - 4, 3, 2);
    c.fillRect(cx - w0 - 5, baseY - 6, 2, 2);
    c.fillRect(cx + w0 + 3, baseY - 6, 2, 2);
    c.fillStyle = A.pal.goldDark;
    c.fillRect(cx - w0, baseY - 3, w0 * 2, 1);
    c.fillStyle = 'rgba(255,236,180,.35)';
    c.fillRect(cx - w0 + 2, baseY - h + 3, w0 * 2 - 4, 1);
    // inner eave line and soft shadow
    c.fillStyle = 'rgba(255,220,150,.18)';
    c.fillRect(cx - w0 + 6, baseY - 5, w0 * 2 - 12, 1);
    c.fillStyle = 'rgba(30,14,7,.28)';
    c.fillRect(cx - w0, baseY + 2, w0 * 2, 2);
    // ridge
    const topHalf = rows[h - 1][0];
    c.fillStyle = A.pal.roofRidge;
    c.fillRect(cx - Math.max(4, topHalf), baseY - h - 1, Math.max(8, topHalf * 2), 2);
    c.fillStyle = A.pal.roofGold;
    c.fillRect(cx - Math.max(3, topHalf - 1), baseY - h - 2, Math.max(6, (topHalf - 1) * 2), 1);
    // ridge ornaments (small pixel beasts)
    const orn = opts.ornaments == null ? 3 : opts.ornaments;
    for (let i = 0; i < orn; i++) {
      const ox = cx - topHalf + 2 + i * 3;
      c.fillStyle = A.pal.roofRidge;
      c.fillRect(ox, baseY - h - 3 - (i === 0 ? 1 : 0), 1, 2);
      c.fillStyle = A.pal.goldDark;
      c.fillRect(ox, baseY - h - 4, 1, 1);
    }
    // gable end caps
    for (const sx of [-1, 1]) {
      const ex = cx + sx * (topHalf + 1);
      c.fillStyle = A.pal.roofRidge;
      c.fillRect(ex, baseY - h - 1, 2, 3);
      c.fillStyle = A.pal.roofGold;
      c.fillRect(ex, baseY - h - 2, 2, 1);
    }
    // corner bells
    c.fillStyle = A.pal.goldDark;
    c.fillRect(cx - w0 - 4, baseY - 3, 1, 1);
    c.fillRect(cx + w0 + 3, baseY - 3, 1, 1);
  }

  A.roof = roof;

  function hallWall(c, cx, baseY, w, wallH, opts) {
    const x = cx - w / 2;
    const top = baseY - wallH;
    r(c, x, top, w, wallH, A.pal.wallDark);
    r(c, x, top + 1, w, wallH - 4, A.pal.wall);
    // brick texture
    c.save();
    c.globalAlpha = 0.13;
    for (let yy = 3; yy < wallH - 2; yy += 4) {
      c.fillStyle = '#2d100b';
      c.fillRect(x, top + yy, w, 1);
    }
    c.restore();
    // side faces and eave shadow give the wall volume
    c.save();
    c.globalAlpha = 0.2;
    c.fillStyle = '#1d0a07';
    c.fillRect(x, top, 4, wallH);
    c.fillRect(x + w - Math.max(4, w * 0.08), top, Math.max(4, w * 0.08), wallH);
    c.restore();
    const eaveShadow = c.createLinearGradient(0, top, 0, top + 14);
    eaveShadow.addColorStop(0, 'rgba(28,10,6,.42)');
    eaveShadow.addColorStop(1, 'rgba(28,10,6,0)');
    c.fillStyle = eaveShadow;
    c.fillRect(x, top, w, 14);
    // top beam and bottom trim
    r(c, x, top, w, 2, A.pal.gold);
    r(c, x, top + 2, w, 1, A.pal.goldDark);
    r(c, x, top + wallH - 3, w, 2, A.pal.wallDark);
    r(c, x, top + wallH - 1, w, 1, A.pal.stoneDark);

    const bays = opts.bays || Math.max(3, Math.round(w / 38));
    const bw = w / bays;
    for (let i = 0; i < bays; i++) {
      const bx = x + i * bw;
      // columns with a thin lit edge
      r(c, bx, top + 3, 3, wallH - 7, A.pal.wallDark);
      r(c, bx + 1, top + 3, 1, wallH - 7, '#c76045');
      if (i === bays - 1) {
        r(c, bx + bw - 3, top + 3, 3, wallH - 7, A.pal.wallDark);
        r(c, bx + bw - 2, top + 3, 1, wallH - 7, '#c76045');
      }
      const mid = bx + bw / 2;
      const central = Math.abs(i - (bays - 1) / 2) < 0.6;
      const doorW = Math.min(central ? 18 : 10, bw * 0.52);
      const doorH = Math.round(wallH * (central ? 0.62 : 0.5));
      // window lattice
      const wx = mid - doorW / 2, wy = top + 5;
      r(c, wx, wy, doorW, doorH, '#4a1c15');
      r(c, wx + 1, wy + 1, doorW - 2, doorH - 2, '#6b2c20');
      c.save();
      c.globalAlpha = 0.75;
      c.fillStyle = A.pal.goldDark;
      for (let gx = wx + 2; gx < wx + doorW - 1; gx += 4) c.fillRect(gx, wy + 1, 1, doorH - 2);
      for (let gy = wy + 2; gy < wy + doorH - 1; gy += 4) c.fillRect(wx + 1, gy, doorW - 2, 1);
      c.restore();
      // gold studs
      if (central && doorW > 14) {
        c.fillStyle = A.pal.gold;
        for (let sy = wy + 3; sy < wy + doorH - 2; sy += 5) {
          for (let sx = wx + 3; sx < wx + doorW - 2; sx += 5) c.fillRect(sx, sy, 1, 1);
        }
      }
    }
    // plaque
    if (opts.name) {
      const pw = Math.min(w * 0.34, 46), ph = 12;
      const px = cx - pw / 2, py = top + 3;
      r(c, px, py, pw, ph, '#17120e');
      r(c, px + 1, py + 1, pw - 2, ph - 2, '#2c2419');
      c.strokeStyle = A.pal.gold; c.lineWidth = 1;
      c.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      G.text(c, opts.name, cx, py + 9, { size: 7, color: '#e9c878', align: 'center', weight: 'bold' });
    }
  }

  function platform(c, cx, baseY, w, opts) {
    opts = opts || {};
    const pw = w + (opts.platformPad == null ? 24 : opts.platformPad);
    const ph = opts.platformH || 9;
    const x = cx - pw / 2, y = baseY - ph;
    c.fillStyle = 'rgba(16,12,8,.35)';
    c.fillRect(cx - pw / 2, baseY, pw, 3);
    r(c, x, y, pw, ph, A.pal.stoneDark);
    r(c, x, y, pw, ph - 2, A.pal.marbleDark);
    r(c, x, y, pw, 2, A.pal.marble);
    // railing
    c.save();
    for (let xx = x + 2; xx < x + pw - 2; xx += 7) {
      r(c, xx, y - 4, 1, 4, A.pal.marble);
      r(c, xx, y - 4, 3, 1, A.pal.marble);
    }
    c.restore();
    // stairs
    const sw = opts.stairW || 30;
    for (let i = 0; i < 4; i++) {
      r(c, cx - sw / 2 + i, y + i * 2 + 1, sw - i * 2, 2, i % 2 ? A.pal.marble : A.pal.marbleDark);
    }
    // carved ramp
    r(c, cx - 3, y + 2, 6, ph - 1, A.pal.marble);
    c.save();
    c.globalAlpha = 0.55;
    c.fillStyle = A.pal.goldDark;
    c.fillRect(cx - 1, y + 3, 1, 2);
    c.fillRect(cx, y + 5, 1, 1);
    c.restore();
  }

  A.hallSprite = function (w, opts) {
    opts = Object.assign({ wallH: 28, roofH: 22, double: false, name: '', bays: 0, platform: true }, opts || {});
    const key = 'hall|' + w + '|' + JSON.stringify(opts);
    if (spriteCache.has(key)) return spriteCache.get(key);
    const padX = 46;
    const cw = Math.ceil(w + padX * 2);
    const ch = Math.ceil(opts.wallH + opts.roofH + (opts.double ? 34 : 0) + 52);
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const cx = Math.round(cw / 2), base = ch - 12;
    if (opts.platform !== false) platform(c, cx, base, w, opts);
    const wallBase = base - (opts.platform === false ? 0 : 9);
    const wallTop = wallBase - opts.wallH;
    hallWall(c, cx, wallBase, w, opts.wallH, opts);
    // painted bracket set (斗拱) beneath the eaves
    c.fillStyle = 'rgba(35,14,9,.35)';
    c.fillRect(cx - w / 2, wallTop + 2, w, 2);
    for (let xx = cx - w / 2 + 2; xx < cx + w / 2 - 2; xx += 8) {
      c.fillStyle = (xx / 8 | 0) % 2 ? A.pal.tealDark : A.pal.goldDark;
      c.fillRect(xx, wallTop + 4, 4, 2);
      c.fillStyle = A.pal.gold;
      c.fillRect(xx + 1, wallTop + 3, 2, 1);
    }
    c.fillStyle = A.pal.gold;
    c.fillRect(cx - w / 2, wallTop + 6, w, 1);
    if (opts.double) {
      // lower eave
      roof(c, cx, wallTop + 15, w / 2 + 17, opts.roofH * 0.56, opts.roofPal, opts);
      // upper storey band
      const uw = w * 0.86;
      r(c, cx - uw / 2, wallTop - 3, uw, 15, A.pal.wall);
      r(c, cx - uw / 2, wallTop - 3, uw, 1, A.pal.gold);
      for (let xx = cx - uw / 2 + 4; xx < cx + uw / 2; xx += 12) r(c, xx, wallTop - 1, 2, 10, A.pal.wallDark);
      // upper roof
      roof(c, cx, wallTop + 1, w / 2 + 10, opts.roofH * 0.86, opts.roofPal, opts);
    } else {
      roof(c, cx, wallTop + 2, w / 2 + 13, opts.roofH, opts.roofPal, opts);
    }
    // red lanterns under the eaves of the larger halls
    if (w >= 150 && opts.lanterns !== false) {
      for (const side of [-1, 1]) {
        const lx = cx + side * (w / 2 - 11);
        c.fillStyle = A.pal.goldDark;
        c.fillRect(lx, wallTop + 9, 1, 7);
        c.fillStyle = '#b3402c';
        c.fillRect(lx - 3, wallTop + 16, 7, 8);
        c.fillStyle = '#d45637';
        c.fillRect(lx - 2, wallTop + 17, 5, 6);
        c.fillStyle = '#ffd479';
        c.fillRect(lx - 1, wallTop + 19, 3, 2);
        c.fillStyle = A.pal.gold;
        c.fillRect(lx - 3, wallTop + 16, 7, 1);
        c.fillRect(lx - 3, wallTop + 23, 7, 1);
      }
    }
    const spr = { cv, ax: cx, ay: base };
    spriteCache.set(key, spr);
    return spr;
  };

  A.drawHall = function (ctx, x, baseY, w, opts) {
    const s = A.hallSprite(w, opts);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#20140d';
    ctx.beginPath();
    ctx.ellipse(x + 9, baseY - 2, w * 0.58, 7, 0, 0, G.TAU);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(s.cv, Math.round(x - s.ax), Math.round(baseY - s.ay));
  };

  /* ------------------------------------------------------------
     gates / walls
     ------------------------------------------------------------ */
  A.gateSprite = function (w, opts) {
    opts = Object.assign({ wallH: 48, roofH: 24, double: true, arches: 3, name: '', portrait: false }, opts || {});
    const key = 'gate|' + w + '|' + JSON.stringify(opts);
    if (spriteCache.has(key)) return spriteCache.get(key);
    const padX = 54;
    const cw = w + padX * 2;
    const ch = opts.wallH + opts.roofH + 80;
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d');
    const cx = cw / 2, base = ch - 10;
    const wallTop = base - opts.wallH;
    // stone terrace and steps
    r(c, cx - w / 2 - 20, base - 1, w + 40, 5, 'rgba(20,13,9,.28)');
    r(c, cx - w / 2 - 16, base - 7, w + 32, 7, A.pal.stoneDark);
    r(c, cx - w / 2 - 15, base - 8, w + 30, 2, A.pal.marble);
    for (let xx = cx - w / 2 - 13; xx < cx + w / 2 + 12; xx += 8) {
      r(c, xx, base - 10, 1, 4, A.pal.marble);
    }
    for (let i = 0; i < 4; i++) {
      r(c, cx - 20 + i * 2, base + i * 2, 40 - i * 4, 2, i % 2 ? A.pal.marble : A.pal.marbleDark);
    }
    // wall
    r(c, cx - w / 2, wallTop, w, opts.wallH, A.pal.wallDark);
    r(c, cx - w / 2, wallTop + 2, w, opts.wallH - 4, A.pal.wall);
    c.save();
    c.globalAlpha = 0.14;
    for (let yy = 4; yy < opts.wallH; yy += 5) { c.fillStyle = '#2a0d09'; c.fillRect(cx - w / 2, wallTop + yy, w, 1); }
    c.restore();
    // crenellations
    for (let xx = cx - w / 2 + 2; xx < cx + w / 2 - 4; xx += 12) {
      r(c, xx, wallTop - 5, 7, 5, A.pal.wall);
      r(c, xx, wallTop - 5, 7, 2, A.pal.wallLight);
      r(c, xx + 6, wallTop - 5, 1, 5, A.pal.wallDark);
    }
    r(c, cx - w / 2, wallTop + 1, w, 2, A.pal.goldDark);
    // arches
    const arches = opts.arches;
    const centralW = Math.min(34, w * 0.16);
    for (let i = 0; i < arches; i++) {
      const off = i - (arches - 1) / 2;
      const aw = i === Math.floor(arches / 2) ? centralW : centralW * 0.62;
      const ah = i === Math.floor(arches / 2) ? opts.wallH * 0.6 : opts.wallH * 0.46;
      const ax = cx + off * (w / arches) - aw / 2;
      const ay = base - ah - 4;
      const central = i === Math.floor(arches / 2);
      r(c, ax, ay, aw, ah, '#2a1610');
      r(c, ax + 2, ay + 2, aw - 4, ah - 2, '#140d0b');
      r(c, ax, ay, aw, 2, '#3d2118');
      if (central) {
        // the central doorway is open: a warm glimpse of the courtyard
        r(c, ax + 3, ay + 4, aw - 6, ah - 6, '#3b1a12');
        r(c, ax + 4, ay + 5, aw - 8, ah - 8, '#5c2a18');
        r(c, ax + aw - 9, ay + 6, 5, ah - 8, '#7a3b24');
        r(c, ax + aw - 8, ay + 8, 3, 2, '#d8b26a');
        r(c, ax + aw - 8, ay + 15, 3, 1, '#b98d4f');
      } else {
        // closed timber doors with gold studs
        r(c, ax + 3, ay + 3, aw - 6, ah - 4, '#4a1d15');
        r(c, ax + 4, ay + 4, (aw - 8) / 2 - 1, ah - 6, '#6b2c20');
        r(c, ax + aw / 2 + 1, ay + 4, (aw - 8) / 2 - 1, ah - 6, '#61281d');
        c.fillStyle = A.pal.gold;
        for (let sy = ay + 7; sy < ay + ah - 5; sy += 5) {
          c.fillRect(ax + 5, sy, 1, 1);
          c.fillRect(ax + aw - 6, sy, 1, 1);
        }
      }
      // gold arch surround and stone frame
      r(c, ax - 2, ay, 2, ah, A.pal.stoneMid);
      r(c, ax + aw, ay, 2, ah, A.pal.stoneMid);
      r(c, ax - 2, ay - 2, aw + 4, 2, A.pal.stone);
      r(c, ax - 1, ay + 1, 1, ah - 1, 'rgba(216,178,106,.5)');
      r(c, ax + aw, ay + 1, 1, ah - 1, 'rgba(216,178,106,.5)');
    }
    // red pilasters, gold wall base and lanterns flanking the gate
    for (const px of [cx - w * 0.32, cx + w * 0.32]) {
      r(c, px - 1, wallTop + 3, 3, opts.wallH - 7, A.pal.wallDark);
      r(c, px, wallTop + 3, 1, opts.wallH - 7, '#c2684b');
      r(c, px - 2, wallTop + 2, 5, 2, A.pal.goldDark);
    }
    r(c, cx - w / 2, base - 3, w, 2, A.pal.goldDark);
    for (const side of [-1, 1]) {
      const lx = cx + side * (centralW / 2 + 26);
      r(c, lx, base - 33, 1, 8, A.pal.goldDark);
      r(c, lx - 3, base - 26, 7, 8, '#b3402c');
      r(c, lx - 2, base - 25, 5, 6, '#d45637');
      r(c, lx - 1, base - 23, 3, 2, '#ffd479');
      r(c, lx - 3, base - 26, 7, 1, A.pal.gold);
      r(c, lx - 3, base - 18, 7, 1, A.pal.gold);
    }
    // portrait
    if (opts.portrait) {
      const px = cx - 7, py = wallTop + 7;
      r(c, px - 2, py - 2, 18, 22, A.pal.goldDark);
      r(c, px, py, 14, 18, '#7a2e23');
      r(c, px + 2, py + 2, 10, 14, '#c9a36c');
      r(c, px + 4, py + 4, 6, 5, '#5e3b2a');
      r(c, px + 3, py + 10, 8, 6, '#5b5f63');
    }
    // name plaque
    if (opts.name) {
      const pw = Math.min(w * 0.3, 56);
      const px = cx - pw / 2, py = wallTop + 4;
      r(c, px, py, pw, 13, '#201912');
      c.strokeStyle = A.pal.gold; c.strokeRect(px + 0.5, py + 0.5, pw - 1, 12);
      G.text(c, opts.name, cx, py + 10, { size: 8, color: '#edcd87', align: 'center', weight: 'bold' });
    }
    // tower
    const tw = Math.min(w * 0.62, 124);
    const tBase = wallTop - 4;
    const tTop = tBase - 20;
    r(c, cx - tw / 2, tTop, tw, 20, A.pal.wallDark);
    r(c, cx - tw / 2, tTop + 1, tw, 16, A.pal.wall);
    for (let xx = cx - tw / 2 + 5; xx < cx + tw / 2 - 3; xx += 11) {
      r(c, xx, tTop + 5, 5, 7, '#4d1c14');
      r(c, xx + 1, tTop + 6, 3, 5, '#75342a');
    }
    r(c, cx - tw / 2, tTop, tw, 1, A.pal.gold);
    if (opts.double) {
      roof(c, cx, tTop + 2, tw / 2 + 13, opts.roofH * 0.6, opts.roofPal, opts);
      roof(c, cx, tTop - 12, tw / 2 + 7, opts.roofH * 0.9, opts.roofPal, opts);
    } else {
      roof(c, cx, tTop - 2, tw / 2 + 12, opts.roofH, opts.roofPal, opts);
    }
    const spr = { cv, ax: cx, ay: base };
    spriteCache.set(key, spr);
    return spr;
  };

  A.drawGate = function (ctx, x, baseY, w, opts) {
    const s = A.gateSprite(w, opts);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#1c120c';
    ctx.beginPath();
    ctx.ellipse(x + 10, baseY - 2, w * 0.58, 8, 0, 0, G.TAU);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(s.cv, Math.round(x - s.ax), Math.round(baseY - s.ay));
  };

  A.wallH = function (ctx, x1, x2, baseY, h, opts) {
    opts = opts || {};
    const w = x2 - x1;
    r(ctx, x1, baseY - h, w, h, A.pal.wallDark);
    r(ctx, x1, baseY - h + 2, w, h - 4, opts.color || A.pal.wall);
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let yy = 3; yy < h; yy += 5) { ctx.fillStyle = '#2a0c08'; ctx.fillRect(x1, baseY - h + yy, w, 1); }
    ctx.restore();
    // crenellations
    for (let xx = x1 + 1; xx < x2 - 5; xx += 10) {
      r(ctx, xx, baseY - h - 5, 6, 5, opts.color || A.pal.wall);
      r(ctx, xx, baseY - h - 5, 6, 2, A.pal.wallLight);
    }
    r(ctx, x1, baseY - h, w, 1, A.pal.goldDark);
    r(ctx, x1, baseY - 3, w, 2, A.pal.wallDark);
  };

  A.wallV = function (ctx, x, y1, y2, w, opts) {
    opts = opts || {};
    r(ctx, x, y1, w, y2 - y1, A.pal.wallDark);
    r(ctx, x + 1, y1, w - 2, y2 - y1, opts.color || A.pal.wall);
    for (let yy = y1 + 2; yy < y2 - 4; yy += 10) {
      r(ctx, x - 3, yy, w + 6, 4, A.pal.wall);
      r(ctx, x - 3, yy, w + 6, 1, A.pal.wallLight);
    }
    r(ctx, x, y1, 1, y2 - y1, A.pal.goldDark);
  };

  /* ------------------------------------------------------------
     props
     ------------------------------------------------------------ */
  A.tree = function (ctx, x, baseY, size, opt) {
    opt = opt || {};
    size = size || 1;
    const p = opt.autumn ? ['#a8642c', '#c47a31', '#8c4d22'] : ['#4f6b3a', '#628048', '#3c552d'];
    A.shadow(ctx, x, baseY, 20 * size, 3 * size, 0.25);
    r(ctx, x - 2 * size, baseY - 14 * size, 3 * size, 14 * size, '#5a3a22');
    r(ctx, x + 2 * size, baseY - 10 * size, 2 * size, 10 * size, '#4a2e1a');
    const blobs = [
      [0, -22, 13], [-8, -17, 9], [9, -18, 9], [-4, -29, 9], [7, -28, 8],
    ];
    for (let i = 0; i < blobs.length; i++) {
      const [bx, by, br] = blobs[i];
      const col = p[i % p.length];
      r(ctx, x + bx * size - br * size / 2, baseY + by * size, br * size, br * size * 0.62, col);
      if (i % 2 === 0) r(ctx, x + bx * size - br * size / 2 + 2, baseY + by * size - 2, br * size - 5, 2, p[1]);
    }
    if (opt.leaf !== false) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = p[2];
      for (let yy = 0; yy < 22; yy += 3) {
        const xx = Math.round(Math.sin(yy * 1.7) * 12);
        ctx.fillRect(x + xx, baseY - 24 * size + yy * size, 2, 1);
      }
      ctx.restore();
    }
  };

  A.pine = function (ctx, x, baseY, size) {
    size = size || 1;
    A.shadow(ctx, x, baseY, 16 * size, 2, 0.25);
    r(ctx, x - 1, baseY - 9 * size, 2, 9 * size, '#4b301c');
    for (let i = 0; i < 4; i++) {
      const yy = baseY - 8 * size - i * 6 * size;
      const ww = (16 - i * 3) * size;
      r(ctx, x - ww / 2, yy, ww, 4 * size, i % 2 ? '#2e4a30' : '#375737');
      r(ctx, x - ww / 2 + 2, yy, ww - 4, 1, '#4f7145');
    }
  };

  A.willow = function (ctx, x, baseY, size, t) {
    size = size || 1;
    t = t || 0;
    A.shadow(ctx, x, baseY, 22 * size, 2, 0.22);
    r(ctx, x - 2, baseY - 16 * size, 3, 16 * size, '#5a4028');
    for (let i = 0; i < 7; i++) {
      const ox = (i - 3) * 4 * size;
      const len = (10 + (i % 3) * 4) * size;
      const sway = Math.sin(t * 1.4 + i) * 1.5;
      ctx.strokeStyle = i % 2 ? '#5e7b43' : '#728d4f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + ox, baseY - 26 * size);
      ctx.quadraticCurveTo(x + ox + 4 + sway, baseY - 18 * size, x + ox + 2 + sway, baseY - 26 * size + len);
      ctx.stroke();
    }
    r(ctx, x - 13 * size, baseY - 30 * size, 26 * size, 7 * size, '#587340');
    r(ctx, x - 9 * size, baseY - 33 * size, 18 * size, 5 * size, '#68874a');
  };

  A.lantern = function (ctx, x, baseY, opt) {
    opt = opt || {};
    const h = opt.h || 26;
    r(ctx, x - 1, baseY - h, 2, h, '#3c2a1a');
    r(ctx, x - 4, baseY - h - 1, 8, 2, '#3c2a1a');
    const ly = baseY - h + 4;
    if (opt.night) A.glow(ctx, x, ly + 4, 19, 'rgba(255,142,54,.5)', 0.42);
    r(ctx, x - 5, ly, 10, 9, '#b3402c');
    r(ctx, x - 4, ly + 1, 8, 7, '#d45637');
    r(ctx, x - 5, ly, 10, 1, '#e3b45d');
    r(ctx, x - 5, ly + 8, 10, 1, '#e3b45d');
    r(ctx, x - 1, ly + 9, 2, 3, '#d8b26a');
    if (opt.night) { r(ctx, x - 2, ly + 3, 4, 2, '#ffe1a0'); }
  };

  A.lion = function (ctx, x, baseY, flip) {
    const s = flip ? -1 : 1;
    A.shadow(ctx, x, baseY, 18, 2, 0.3);
    r(ctx, x - 8, baseY - 7, 16, 7, A.pal.stoneDark);
    r(ctx, x - 7, baseY - 8, 14, 2, A.pal.stone);
    // body
    r(ctx, x - 6, baseY - 17, 10, 10, '#9a7a3c');
    r(ctx, x - 5, baseY - 18, 8, 3, '#b8924a');
    // head
    r(ctx, x + 1 * s, baseY - 23, 7, 7, '#b8924a');
    r(ctx, x + 2 * s, baseY - 22, 5, 5, '#d2ad60');
    r(ctx, x + 4 * s, baseY - 20, 1, 1, '#2f2112');
    r(ctx, x + 6 * s, baseY - 19, 2, 2, '#8a6a32');
    // mane
    for (let i = 0; i < 5; i++) r(ctx, x - 2 + i * 2, baseY - 24 + (i % 2), 2, 2, '#6f5226');
    // legs / tail
    r(ctx, x - 5, baseY - 9, 2, 2, '#6f5226');
    r(ctx, x - 1, baseY - 9, 2, 2, '#6f5226');
    r(ctx, x - 7, baseY - 15, 2, 6, '#8a6a32');
  };

  A.vat = function (ctx, x, baseY, opt) {
    opt = opt || {};
    A.shadow(ctx, x, baseY, 16, 2, 0.3);
    r(ctx, x - 8, baseY - 4, 16, 4, '#4e3a26');
    r(ctx, x - 7, baseY - 12, 14, 9, '#6b5330');
    r(ctx, x - 7, baseY - 12, 14, 1, '#c39a4b');
    r(ctx, x - 7, baseY - 5, 14, 1, '#3f2e1c');
    r(ctx, x - 6, baseY - 15, 12, 3, '#8a6a3a');
    r(ctx, x - 6, baseY - 15, 12, 1, '#d0a95a');
    if (opt.water) r(ctx, x - 5, baseY - 15, 10, 1, '#3f7b74');
    r(ctx, x - 8, baseY - 10, 1, 3, '#c39a4b');
    r(ctx, x + 7, baseY - 10, 1, 3, '#c39a4b');
  };

  A.sundial = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 14, 2, 0.28);
    r(ctx, x - 6, baseY - 6, 12, 6, A.pal.stoneDark);
    r(ctx, x - 5, baseY - 8, 10, 2, A.pal.marble);
    r(ctx, x - 8, baseY - 14, 16, 6, A.pal.marble);
    r(ctx, x - 8, baseY - 14, 16, 1, '#efe8d5');
    r(ctx, x - 1, baseY - 18, 1, 5, '#6b6a5f');
    r(ctx, x + 1, baseY - 17, 3, 1, '#6b6a5f');
  };

  A.crane = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 12, 1, 0.25);
    r(ctx, x - 4, baseY - 4, 8, 4, '#5a4a2c');
    r(ctx, x - 1, baseY - 13, 2, 9, '#6d5a32');
    r(ctx, x - 3, baseY - 15, 6, 3, '#8a743c');
    r(ctx, x + 3, baseY - 16, 3, 2, '#8a743c');
    r(ctx, x + 6, baseY - 17, 2, 1, '#b08c46');
    r(ctx, x - 1, baseY - 18, 2, 1, '#b08c46');
    r(ctx, x - 5, baseY - 10, 4, 2, '#6d5a32');
  };

  A.sign = function (ctx, x, baseY, text, opt) {
    opt = opt || {};
    const w = opt.w || 44, h = opt.h || 15;
    r(ctx, x - 1, baseY - 20, 2, 20, '#4d3420');
    r(ctx, x - w / 2, baseY - 36, w, h, '#3b2a1c');
    r(ctx, x - w / 2 + 1, baseY - 35, w - 2, h - 2, '#5a4128');
    ctx.strokeStyle = '#9b7a48'; ctx.strokeRect(x - w / 2 + 0.5, baseY - 35.5, w - 1, h - 1);
    G.text(ctx, text, x, baseY - 36 + h / 2 + 3, { size: opt.size || 7, color: '#e6cf9e', align: 'center' });
  };

  A.bench = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 18, 2, 0.22);
    r(ctx, x - 8, baseY - 5, 16, 2, '#7a5230');
    r(ctx, x - 8, baseY - 9, 16, 2, '#8d6138');
    r(ctx, x - 7, baseY - 4, 2, 4, '#3f2b1a');
    r(ctx, x + 5, baseY - 4, 2, 4, '#3f2b1a');
  };

  A.rock = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 18 * s, 2, 0.25);
    r(ctx, x - 8 * s, baseY - 14 * s, 14 * s, 14 * s, '#6f6e63');
    r(ctx, x - 5 * s, baseY - 20 * s, 8 * s, 10 * s, '#85857a');
    r(ctx, x + 2 * s, baseY - 16 * s, 7 * s, 9 * s, '#5f5e55');
    r(ctx, x - 6 * s, baseY - 11 * s, 3 * s, 5 * s, '#4b4a43');
    r(ctx, x - 3 * s, baseY - 19 * s, 2 * s, 2 * s, '#a3a294');
  };

  A.bridge = function (ctx, cx, y, w, opt) {
    opt = opt || {};
    // shadow and arch reflection on the water
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#0d2426';
    ctx.beginPath();
    ctx.ellipse(cx, y + 2, w / 2 + 5, 19, 0, 0, G.TAU);
    ctx.fill();
    ctx.restore();
    r(ctx, cx - w / 2, y - 14, w, 28, A.pal.marbleDark);
    r(ctx, cx - w / 2, y - 13, w, 26, A.pal.marble);
    // weathered joints
    for (let i = 0; i < w; i += 7) r(ctx, cx - w / 2 + i, y - 13, 1, 26, A.pal.marbleDark);
    r(ctx, cx - w / 2, y - 14, w, 2, '#f0e9d7');
    r(ctx, cx - w / 2, y + 13, w, 2, A.pal.stoneDark);
    // central carved slab
    r(ctx, cx - 2, y - 12, 4, 24, '#e8dfc9');
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = A.pal.goldDark;
    for (let yy = y - 9; yy < y + 10; yy += 4) ctx.fillRect(cx - 1, yy, 2, 1);
    ctx.restore();
    // balustrades, posts and little lion finials
    for (let i = 0; i <= w; i += 8) {
      const px = cx - w / 2 + i;
      r(ctx, px, y - 17, 2, 7, A.pal.marble);
      r(ctx, px, y + 10, 2, 7, A.pal.marble);
      r(ctx, px - 1, y - 18, 4, 1, A.pal.marbleDark);
      r(ctx, px - 1, y + 17, 4, 1, A.pal.marbleDark);
    }
    r(ctx, cx - w / 2, y - 18, w, 1, A.pal.marble);
    r(ctx, cx - w / 2, y + 17, w, 1, A.pal.marble);
    // shallow water highlights at either side
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#8bc0b4';
    ctx.fillRect(cx - w / 2 - 6, y - 8, 4, 1);
    ctx.fillRect(cx + w / 2 + 2, y + 5, 4, 1);
    ctx.restore();
  };

  A.water = function (ctx, x, y, w, h, t, seed) {
    r(ctx, x, y, w, h, A.pal.waterDark);
    r(ctx, x, y + 1, w, h - 2, A.pal.water);
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = A.pal.waterLight;
    for (let yy = y + 3; yy < y + h - 2; yy += 7) {
      const off = Math.sin((t || 0) * 1.2 + yy * 0.3 + (seed || 0)) * 5;
      for (let xx = x + 4; xx < x + w - 4; xx += 22) {
        ctx.fillRect(xx + off, yy, 10, 1);
      }
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#8fbfb4';
    ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = '#1a3c3f';
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.restore();
  };

  /* ------------------------------------------------------------
     Beijing-specific buildings
     ------------------------------------------------------------ */
  A.hutong = function (ctx, x, baseY, w, opt) {
    opt = opt || {};
    const h = opt.h || 18;
    A.shadow(ctx, x, baseY, w + 4, 2, 0.22);
    // courtyard wall
    r(ctx, x - w / 2 - 3, baseY - 6, w + 6, 6, '#8d8579');
    r(ctx, x - w / 2 - 3, baseY - 6, w + 6, 1, '#a8a094');
    // gray house
    r(ctx, x - w / 2, baseY - h, w, h, '#9c9486');
    r(ctx, x - w / 2, baseY - h, w, 2, '#b5ac9c');
    r(ctx, x - w / 2, baseY - 2, w, 2, '#6e675c');
    // door / window
    const dw = Math.min(10, w * 0.24);
    r(ctx, x - dw / 2, baseY - h + 5, dw, h - 7, '#7d3a28');
    r(ctx, x - dw / 2 + 1, baseY - h + 6, dw - 2, h - 9, '#9a4a33');
    csmallWindow(ctx, x - w / 2 + 5, baseY - h + 5, 7, 6);
    csmallWindow(ctx, x + w / 2 - 12, baseY - h + 5, 7, 6);
    // stepped gray roof
    const rw = w + 8, rh = 8;
    for (let i = 0; i < rh; i++) {
      const t = i / (rh - 1);
      const hw = Math.round(rw / 2 * (1 - 0.45 * t));
      r(ctx, x - hw, baseY - h - rh + i, hw * 2, 1, i % 3 === 0 ? '#5b5a55' : '#6e6d67');
    }
    r(ctx, x - rw / 2, baseY - h - 2, rw, 1, '#4a4945');
    r(ctx, x - rw / 2, baseY - h - rh - 1, rw * 0.5, 1, '#3f3e3a');
    // roof ridge
    r(ctx, x - rw / 2 + 3, baseY - h - rh - 1, rw - 6, 1, '#45443f');
    // tree behind
    if (opt.tree) A.tree(ctx, x + w / 2 + 8, baseY - 2, 0.7);
  };

  function csmallWindow(ctx, x, y, w, h) {
    r(ctx, x, y, w, h, '#4a2a1c');
    r(ctx, x + 1, y + 1, w - 2, h - 2, '#c9b98f');
    ctx.fillStyle = '#5a3b27';
    for (let i = 1; i < w - 1; i += 2) ctx.fillRect(x + i, y + 1, 1, h - 2);
  }

  A.modernTower = function (ctx, x, baseY, w, h, opt) {
    opt = opt || {};
    const col = opt.color || '#3c4650';
    A.shadow(ctx, x, baseY, w + 4, 3, 0.3);
    r(ctx, x - w / 2, baseY - h, w, h, col);
    r(ctx, x - w / 2, baseY - h, w, 2, '#5c6873');
    r(ctx, x + w / 2 - 3, baseY - h, 3, h, '#2c343b');
    // windows
    const cols = Math.max(2, Math.floor(w / 6));
    const rows = Math.max(2, Math.floor(h / 8));
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const lit = G.hash(x + i, baseY + j, 11) < 0.32;
        ctx.fillStyle = lit ? (opt.night ? '#e8c36a' : '#8c9aa3') : '#2a3239';
        ctx.fillRect(Math.round(x - w / 2 + 3 + i * (w - 6) / cols), Math.round(baseY - h + 5 + j * (h - 10) / rows), Math.max(1, Math.floor((w - 8) / cols) - 1), 2);
      }
    }
    if (opt.antenna) {
      r(ctx, x - 1, baseY - h - 14, 2, 14, '#555');
      r(ctx, x - 3, baseY - h - 8, 6, 1, '#555');
      if (opt.night) r(ctx, x - 1, baseY - h - 15, 2, 1, '#ff5a3c');
    }
  };

  A.cctv = function (ctx, x, baseY, s, night) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 44 * s, 3, 0.28);
    // two leaning legs
    for (let i = 0; i < 26; i++) {
      const off = Math.round(i * 0.28);
      r(ctx, x - 16 + off, baseY - i * 2 - 2, 9, 2, i % 4 === 0 ? '#4c5862' : '#3d4954');
      r(ctx, x + 8 - off, baseY - i * 2 - 2, 9, 2, i % 4 === 0 ? '#424e58' : '#333e48');
    }
    r(ctx, x - 1, baseY - 52, 22, 9, '#3d4954');
    r(ctx, x - 1, baseY - 52, 22, 2, '#5d6a75');
    for (let i = 0; i < 5; i++) r(ctx, x + 2 + i * 4, baseY - 49, 2, 4, night ? '#e5c36f' : '#7e8b95');
    // lattice
    ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = '#7f8b94'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 16 + i * 3, baseY);
      ctx.lineTo(x - 1 + i * 2, baseY - 48);
      ctx.stroke();
    }
    ctx.restore();
  };

  A.citicTower = function (ctx, x, baseY, h, night) {
    A.shadow(ctx, x, baseY, 26, 3, 0.3);
    for (let i = 0; i < h; i++) {
      const t = i / h;
      const w = Math.round(22 - t * 7);
      r(ctx, x - w / 2, baseY - i, w, 1, i % 6 === 0 ? '#59666f' : '#45525c');
      if (i % 6 === 3) r(ctx, x - w / 2 + 1, baseY - i, w - 2, 1, night ? '#d8b76f' : '#65727b');
    }
    r(ctx, x - 1, baseY - h - 12, 2, 12, '#68757e');
    if (night) r(ctx, x - 1, baseY - h - 13, 2, 1, '#ff6a4a');
    ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#9aa5ac';
    for (let i = 0; i < h; i += 8) {
      ctx.beginPath(); ctx.moveTo(x - 11 + i * 0.03, baseY - i); ctx.lineTo(x + 11 - i * 0.03, baseY - i - 5); ctx.stroke();
    }
    ctx.restore();
  };

  A.drumTower = function (ctx, x, baseY, w, name) {
    r(ctx, x - w / 2, baseY - 26, w, 26, '#8b3527');
    r(ctx, x - w / 2, baseY - 26, w, 2, '#c47a4c');
    r(ctx, x - w / 2 + 4, baseY - 20, w - 8, 16, '#6b2a1e');
    for (let i = 0; i < 3; i++) {
      r(ctx, x - w / 2 + 8 + i * (w - 16) / 2.5, baseY - 18, 6, 12, '#4a1d15');
    }
    A.roof(ctx, x, baseY - 24, w / 2 + 12, 12);
    A.sign(ctx, x - w / 2 - 10, baseY, name || '钟鼓楼', { w: 34, h: 13, size: 6 });
  };

  A.qianmen = function (ctx, x, baseY) {
    A.drawGate(ctx, x, baseY, 120, { wallH: 38, roofH: 18, double: true, arches: 1, name: '正阳门' });
  };

  A.templeOfHeaven = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 80 * s, 4, 0.25);
    // three white terraces
    r(ctx, x - 38 * s, baseY - 7 * s, 76 * s, 7 * s, A.pal.marbleDark);
    r(ctx, x - 30 * s, baseY - 12 * s, 60 * s, 6 * s, A.pal.marble);
    r(ctx, x - 22 * s, baseY - 16 * s, 44 * s, 5 * s, A.pal.marble);
    // circular body
    r(ctx, x - 16 * s, baseY - 28 * s, 32 * s, 13 * s, '#8f3629');
    r(ctx, x - 15 * s, baseY - 28 * s, 30 * s, 2, '#c47645');
    for (let i = 0; i < 6; i++) r(ctx, x - 14 * s + i * 6 * s, baseY - 26 * s, 2 * s, 10 * s, '#5f241b');
    // blue roofs
    for (let k = 0; k < 2; k++) {
      const by = baseY - 28 * s - k * 8 * s;
      const hw = (20 - k * 5) * s;
      for (let i = 0; i < 7 * s; i++) {
        const t = i / (7 * s);
        const ww = hw * (1 - 0.4 * t);
        r(ctx, x - ww, by - i, ww * 2, 1, i % 3 === 0 ? '#2b5d78' : '#367492');
      }
      r(ctx, x - 2 * s, by - 8 * s, 4 * s, 2, '#d8b26a');
    }
    r(ctx, x - 1 * s, baseY - 50 * s, 2 * s, 6 * s, '#d8b26a');
    // trees around
    A.tree(ctx, x - 52 * s, baseY, 0.8 * s);
    A.tree(ctx, x + 50 * s, baseY, 0.9 * s);
  };

  A.whitePagoda = function (ctx, x, baseY, s) {
    s = s || 1;
    // hill
    for (let i = 0; i < 20 * s; i++) {
      const ww = (46 - i * 1.4) * s;
      r(ctx, x - ww, baseY - i, ww * 2, 1, i % 4 === 0 ? '#4a6038' : '#557043');
    }
    // pagoda
    r(ctx, x - 7 * s, baseY - 42 * s, 14 * s, 14 * s, '#e5dfcc');
    r(ctx, x - 8 * s, baseY - 34 * s, 16 * s, 4 * s, '#d6cfb9');
    r(ctx, x - 5 * s, baseY - 48 * s, 10 * s, 8 * s, '#ebe6d5');
    r(ctx, x - 3 * s, baseY - 53 * s, 6 * s, 6 * s, '#f0ebdc');
    r(ctx, x - 1 * s, baseY - 58 * s, 2 * s, 6 * s, '#d8b26a');
    for (let i = 0; i < 3; i++) r(ctx, x - 4 * s + i * 3 * s, baseY - 46 * s, 2 * s, 2 * s, '#8a8579');
  };

  A.birdNest = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 58, 4, 0.25);
    // bowl
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const ww = 52 - t * 6;
      r(ctx, x - ww / 2, baseY - 20 - i * 2, ww, 2, i % 3 === 0 ? '#6e6a60' : '#56534c');
    }
    ctx.save();
    ctx.strokeStyle = '#8d887c'; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 5, baseY - 20);
      ctx.quadraticCurveTo(x + i * 2, baseY - 38, x + i * 3, baseY - 44);
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 26, baseY - 22 - i * 4);
      ctx.quadraticCurveTo(x, baseY - 40 - i * 3, x + 26, baseY - 22 - i * 4);
      ctx.stroke();
    }
    ctx.restore();
    r(ctx, x - 20, baseY - 18, 40, 2, '#3f3c37');
  };

  A.tram = function (ctx, x, baseY, t) {
    const bob = Math.sin((t || 0) * 8) * 0.4;
    A.shadow(ctx, x, baseY + 2, 62, 3, 0.25);
    // wheels
    r(ctx, x - 24, baseY - 3, 6, 3, '#1e1b18');
    r(ctx, x + 18, baseY - 3, 6, 3, '#1e1b18');
    // body
    r(ctx, x - 30, baseY - 24 + bob, 60, 22, '#7a2b21');
    r(ctx, x - 29, baseY - 23 + bob, 58, 5, '#c7a35c');
    r(ctx, x - 29, baseY - 12 + bob, 58, 7, '#5f2019');
    for (let i = 0; i < 5; i++) {
      r(ctx, x - 26 + i * 11, baseY - 20 + bob, 7, 7, '#c9b782');
      r(ctx, x - 26 + i * 11, baseY - 20 + bob, 7, 1, '#8f7d5b');
    }
    // roof
    r(ctx, x - 31, baseY - 27 + bob, 62, 3, '#4a2d1c');
    r(ctx, x - 27, baseY - 30 + bob, 54, 3, '#5c3a24');
    // bell
    r(ctx, x - 2, baseY - 33 + bob, 4, 3, '#d8b26a');
    // pantograph
    ctx.strokeStyle = '#2a2724'; ctx.beginPath(); ctx.moveTo(x + 10, baseY - 30 + bob); ctx.lineTo(x + 16, baseY - 38); ctx.stroke();
  };

  A.car = function (ctx, x, y, color, dir) {
    const s = dir === 'left' ? -1 : 1;
    A.shadow(ctx, x, y + 2, 20, 2, 0.25);
    r(ctx, x - 9, y - 7, 18, 7, color);
    r(ctx, x - 6, y - 11, 12, 5, color);
    r(ctx, x - 4, y - 10, 8, 4, '#9fb2b8');
    r(ctx, x - 8, y - 4, 2, 2, '#191715');
    r(ctx, x + 6, y - 4, 2, 2, '#191715');
    r(ctx, x + 8 * s, y - 6, 1, 1, '#ffe0a0');
  };

  A.cat = function (ctx, x, y, t, opt) {
    opt = opt || {};
    const orange = opt.color || '#c58448';
    const bob = Math.sin((t || 0) * 2.4) * 0.8;
    A.shadow(ctx, x, y, 12, 2, 0.25);
    // body
    r(ctx, x - 6, y - 8 + bob, 10, 6, orange);
    r(ctx, x - 5, y - 9 + bob, 7, 2, '#e2b070');
    // head
    r(ctx, x + 3, y - 13 + bob, 7, 7, orange);
    r(ctx, x + 4, y - 12 + bob, 5, 4, '#e2b070');
    r(ctx, x + 3, y - 14 + bob, 2, 2, orange);
    r(ctx, x + 8, y - 14 + bob, 2, 2, orange);
    r(ctx, x + 5, y - 11 + bob, 1, 1, '#2b2118');
    r(ctx, x + 8, y - 11 + bob, 1, 1, '#2b2118');
    r(ctx, x + 7, y - 9 + bob, 1, 1, '#b86a56');
    // tail
    ctx.strokeStyle = orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 5 + bob);
    ctx.quadraticCurveTo(x - 12, y - 8, x - 10 + Math.sin((t || 0) * 2) * 2, y - 13);
    ctx.stroke();
    // legs
    r(ctx, x - 4, y - 3, 2, 3, orange);
    r(ctx, x + 1, y - 3, 2, 3, orange);
  };

  A.pigeon = function (ctx, x, y, t, seed) {
    const hop = Math.sin((t || 0) * 5 + (seed || 0)) > 0.8 ? 1 : 0;
    r(ctx, x, y - 3 - hop, 3, 2, '#8d8a86');
    r(ctx, x + 2, y - 4 - hop, 1, 1, '#c9c5bd');
    r(ctx, x - 1, y - 2 - hop, 1, 1, '#5b5853');
  };

  A.subwaySign = function (ctx, x, baseY) {
    r(ctx, x - 1, baseY - 20, 2, 20, '#4b4d4c');
    r(ctx, x - 9, baseY - 30, 18, 12, '#1d5b9c');
    G.text(ctx, 'M', x, baseY - 21, { size: 8, color: '#fff', align: 'center', weight: 'bold' });
  };

  A.foodCart = function (ctx, x, baseY, opt) {
    opt = opt || {};
    A.shadow(ctx, x, baseY, 22, 2, 0.25);
    r(ctx, x - 10, baseY - 10, 20, 9, '#7a3b2a');
    r(ctx, x - 9, baseY - 9, 18, 7, '#9c4a32');
    r(ctx, x - 11, baseY - 12, 22, 2, '#c9a05a');
    r(ctx, x - 8, baseY - 1, 2, 2, '#211b16');
    r(ctx, x + 6, baseY - 1, 2, 2, '#211b16');
    // skewers
    for (let i = 0; i < 3; i++) {
      r(ctx, x - 5 + i * 4, baseY - 18, 1, 7, '#dcc59d');
      r(ctx, x - 6 + i * 4, baseY - 19, 3, 2, '#b83c28');
    }
  };

  A.streetlamp = function (ctx, x, baseY, night) {
    r(ctx, x - 1, baseY - 24, 2, 24, '#34312b');
    r(ctx, x - 4, baseY - 27, 8, 3, '#34312b');
    if (night) {
      A.glow(ctx, x, baseY - 24, 20, 'rgba(255,190,110,.5)', 0.35);
      r(ctx, x - 2, baseY - 25, 4, 2, '#ffe0a0');
    } else {
      r(ctx, x - 2, baseY - 25, 4, 2, '#d8cbaa');
    }
  };

  /* ------------------------------------------------------------
     mini forbidden city for the Beijing map
     ------------------------------------------------------------ */
  A.miniPalace = function (ctx, x, baseY, w, h) {
    // moat + outer wall
    r(ctx, x - w / 2 - 7, baseY - h - 7, w + 14, h + 14, '#2c5d60');
    r(ctx, x - w / 2 - 5, baseY - h - 5, w + 10, h + 10, '#264f52');
    r(ctx, x - w / 2, baseY - h, w, h, '#8d3326');
    r(ctx, x - w / 2 + 3, baseY - h + 3, w - 6, h - 6, '#b9ae94');
    // corner towers
    for (const [cx, cy] of [[-w / 2, -h], [w / 2, -h], [-w / 2, 0], [w / 2, 0]]) {
      A.drawHall(ctx, x + cx, baseY + cy, 30, { wallH: 9, roofH: 8, platform: false, name: '' });
    }
    // axis halls
    A.drawGate(ctx, x, baseY - 8, 64, { wallH: 25, roofH: 13, arches: 3, double: true, name: '午门' });
    A.drawHall(ctx, x, baseY - h * 0.48, 82, { wallH: 15, roofH: 13, double: true, name: '太和殿' });
    A.drawHall(ctx, x, baseY - h * 0.64, 54, { wallH: 12, roofH: 10, name: '中和殿' });
    A.drawHall(ctx, x, baseY - h * 0.78, 68, { wallH: 13, roofH: 11, double: true, name: '保和殿' });
    A.drawHall(ctx, x, baseY - h * 0.9, 58, { wallH: 10, roofH: 9, name: '乾清宫' });
    A.drawGate(ctx, x, baseY - h - 1, 52, { wallH: 18, roofH: 10, arches: 1, name: '神武门' });
  };

  /* ------------------------------------------------------------
     light / grade
     ------------------------------------------------------------ */
  A.dayGrade = function (ctx, t, strength) {
    strength = strength == null ? 1 : strength;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, 'rgba(255,196,112,' + (0.2 * strength) + ')');
    g.addColorStop(0.42, 'rgba(255,178,96,' + (0.055 * strength) + ')');
    g.addColorStop(0.72, 'rgba(57,67,74,' + (0.035 * strength) + ')');
    g.addColorStop(1, 'rgba(24,42,56,' + (0.16 * strength) + ')');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 640, 360);
    ctx.restore();
    // late-afternoon haze and soft diagonal shafts
    A.glow(ctx, 92, 4, 190, 'rgba(255,214,150,.09)', 0.7 * strength);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.04 * strength;
    ctx.fillStyle = '#ffe3ae';
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(240, 0);
    ctx.lineTo(540, 360);
    ctx.lineTo(300, 360);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.026 * strength;
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(330, 0);
    ctx.lineTo(620, 360);
    ctx.lineTo(480, 360);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bg = ctx.createLinearGradient(0, 220, 0, 360);
    bg.addColorStop(0, 'rgba(255,170,80,0)');
    bg.addColorStop(1, 'rgba(255,156,72,' + (0.045 * strength) + ')');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 220, 640, 140);
    ctx.restore();
  };

  A.nightOverlay = function (ctx, cam, lights, strength) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(7,12,32,' + (strength == null ? 0.56 : strength) + ')';
    ctx.fillRect(0, 0, G.W, G.H);
    ctx.restore();
    if (lights && lights.length) {
      for (const l of lights) {
        const sx = l.x - (cam ? cam.x : 0), sy = l.y - (cam ? cam.y : 0);
        if (sx < -l.r || sy < -l.r || sx > G.W + l.r || sy > G.H + l.r) continue;
        A.glow(ctx, sx, sy, l.r, l.color || 'rgba(255,158,70,.5)', l.a == null ? 0.4 : l.a);
      }
    }
  };

  A.warmLight = function (ctx, x, y, r, color, a) {
    A.glow(ctx, x, y, r, color || 'rgba(255,160,70,.45)', a == null ? 0.35 : a);
  };

  /* ------------------------------------------------------------
     crowd silhouettes (minigame / night plaza)
     ------------------------------------------------------------ */
  A.crowd = function (ctx, x, y, n, t, seed) {
    for (let i = 0; i < n; i++) {
      const h = G.hash(i, 0, seed || 5);
      const px = x + (h - 0.5) * 120;
      const bob = Math.sin((t || 0) * 2 + i) * 1;
      const ph = 12 + Math.floor(h * 8);
      ctx.fillStyle = '#1a1410';
      ctx.fillRect(Math.round(px), Math.round(y - ph + bob), 5, ph);
      ctx.fillRect(Math.round(px - 1), Math.round(y - ph - 4 + bob), 7, 5);
      if (i % 9 === 0) {
        ctx.fillStyle = '#ffd479';
        ctx.fillRect(Math.round(px - 2), Math.round(y - ph + 2 + bob), 1, 1);
      }
    }
  };
})();
