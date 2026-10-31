/* ============================================================
   雅典 · 圣火 — pixel art library
   All art is drawn procedurally on a 640x360 canvas.
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = (G.art = {});
  const INK = '#17110e';

  A.pal = {
    ink: INK,
    marble: '#e5dcc6', marbleHi: '#f4eeda', marbleMid: '#d2c7ab',
    marbleDark: '#b6aa8d', marbleShade: '#968a70',
    stone: '#cfc3a6', stoneDark: '#8f8267',
    terra: '#a8503a', terraDark: '#7d382a', terraHi: '#c2694c',
    bronze: '#a8763c', bronzeDark: '#6f4a24', bronzeHi: '#d8a85c',
    gold: '#d8b26a', goldHi: '#f4dda0', goldDark: '#8f682f',
    olive: '#6a7a45', oliveDark: '#4a5730', oliveHi: '#879a5a',
    cypress: '#37502f', cypressDark: '#243620', cypressHi: '#4e6c3f',
    azure: '#3a6f8f', azureDeep: '#24495f', azureHi: '#6fa5bd',
    wine: '#7d2f28', wineDark: '#55201b',
    hair: '#2a1d14', skin: '#e0b088', skinDark: '#bd8c66',
    white: '#efe9d8', black: '#1a1614',
    sand: '#c9b489', sandDark: '#a8926a',
    grass: '#6d7c4e', grassDark: '#4f5c37', grassHi: '#8a9a63',
    night: '#0b1026',
  };

  const ACTOR_DEFAULT = {
    robe: '#efe6d0', robeDark: '#c9bb9d', robeLight: '#fbf5e6',
    trim: '#a8763c', pants: '#3a3630', shoe: '#4a3222',
    skin: '#e0b088', skinShade: '#bd8c66', hair: '#2a1d14',
    hat: '#7d2f28', bag: '#8a5a33', eye: '#241a14', hatType: 'none',
    scarf: null,
  };

  A.actorPalettes = {
    player: { robe: '#f0e7d2', robeDark: '#c6b896', robeLight: '#fffdf6', trim: '#b07c3e', scarf: '#c9a557' },
    priest: { robe: '#d9cdb4', robeDark: '#a99c81', robeLight: '#f1e8d2', trim: '#8f682f', hatType: 'laurel', hair: '#b9b1a2', skin: '#c9976c' },
    guard: { robe: '#7d2f28', robeDark: '#55201b', robeLight: '#a04a3c', trim: '#d8b26a', hatType: 'helmet', hat: '#c9b98f', scarf: '#d8b26a' },
    tourist: { robe: '#3a6f8f', robeDark: '#24495f', robeLight: '#5b8dab', trim: '#e0c78f', hatType: 'cap', hat: '#b54a38', bag: '#3f5a6b' },
    tourist2: { robe: '#b45a45', robeDark: '#833a2c', robeLight: '#cf7860', trim: '#e8c78f', hatType: 'none', bag: '#76543a' },
    auntie: { robe: '#8d3d55', robeDark: '#68273c', robeLight: '#ad5870', trim: '#e3b980', hatType: 'none', scarf: '#d8b26a' },
    child: { robe: '#4f7f9f', robeDark: '#345c76', robeLight: '#6fa3c4', trim: '#f0d083', hatType: 'cap', hat: '#e1b34d', bag: '#7a5131' },
    vendor: { robe: '#6f5240', robeDark: '#4a3528', robeLight: '#8f6c52', trim: '#c99b5d', hatType: 'straw', bag: '#7a5131' },
    worker: { robe: '#345d6b', robeDark: '#22414b', robeLight: '#4b7d8c', trim: '#d9b269', hatType: 'petasos', hat: '#d9b269', bag: '#5b4127' },
    guide: { robe: '#7a3c33', robeDark: '#552720', robeLight: '#975348', trim: '#e3c183', hatType: 'none', scarf: '#dfc48d' },
    kore: { robe: '#e7ddc6', robeDark: '#b8ab8d', robeLight: '#f6efdd', trim: '#a8763c', hatType: 'none', hair: '#3b2a1a' },
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

  /* pale marble / limestone paving */
  A.paving = function (ctx, x, y, w, h, base, alt, seed, tile) {
    tile = tile || 16;
    r(ctx, x, y, w, h, base || A.pal.marbleMid);
    ctx.save();
    const slab = tile * 2;
    for (let yy = 0; yy < h; yy += slab) {
      for (let xx = 0; xx < w; xx += slab) {
        const n = G.hash(x + xx, y + yy, (seed || 3) + 5);
        ctx.globalAlpha = 0.06 + n * 0.06;
        ctx.fillStyle = n < 0.5 ? (alt || A.pal.marble) : '#efe7d2';
        ctx.fillRect(x + xx, y + yy, Math.min(slab, w - xx), Math.min(slab, h - yy));
      }
    }
    ctx.globalAlpha = 0.1;
    for (let yy = 0; yy < h; yy += tile) {
      for (let xx = 0; xx < w; xx += tile) {
        const n = G.hash(x + xx, y + yy, seed || 3);
        if (n < 0.14) {
          ctx.fillStyle = alt || A.pal.marble;
          ctx.fillRect(x + xx + 1, y + yy + 1, tile - 1, tile - 1);
        } else if (n > 0.88) {
          ctx.fillStyle = '#f2ecda';
          ctx.fillRect(x + xx + 1, y + yy + 1, tile - 1, 1);
        }
      }
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#16110c';
    for (let yy = 0; yy < h; yy += tile) ctx.fillRect(x, y + yy, w, 1);
    for (let xx = 0; xx < w; xx += tile) ctx.fillRect(x + xx, y, 1, h);
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
    if (p.hatType === 'laurel') {
      r(ctx, x - 5, top - 2, 10, 2, '#c9a557');
      r(ctx, x - 5, top - 2, 3, 1, '#e0c07a');
      r(ctx, x + 2, top - 2, 3, 1, '#e0c07a');
    } else if (p.hatType === 'helmet') {
      r(ctx, x - 5, top - 3, 10, 3, p.hat);
      r(ctx, x - 5, top - 4, 10, 1, '#8f3a2b');
      r(ctx, x - 1, top - 6, 2, 3, '#8f3a2b');
    } else if (p.hatType === 'petasos') {
      r(ctx, x - 6, top - 2, 12, 2, p.hat);
      r(ctx, x - 2, top - 5, 4, 3, p.hat);
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
    } else if (o.accessory === 'torch') {
      r(ctx, x + 3, top + 1, 1, 12, '#7d5b36');
      r(ctx, x + 2, top - 1, 4, 2, '#b06a2c');
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

    // body outline + chiton
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
      r(ctx, x - 3, top + 5, 1, 1, '#c98f68');
      r(ctx, x + 2, top + 5, 1, 1, '#c98f68');
    } else {
      r(ctx, x - 4, top + 2, 8, 6, p.hair);
      r(ctx, x - 2, top + 7, 4, 1, p.skinShade);
      r(ctx, x - 3, top + 8, 6, 5, p.bag);
      r(ctx, x - 3, top + 8, 6, 1, '#a87845');
    }

    // headwear
    if (p.hatType === 'laurel') {
      r(ctx, x - 5, top - 2, 10, 2, '#c9a557');
      r(ctx, x - 5, top - 2, 3, 1, '#e0c07a');
      r(ctx, x + 2, top - 2, 3, 1, '#e0c07a');
      r(ctx, x - 1, top - 3, 2, 1, '#d8b26a');
    } else if (p.hatType === 'helmet') {
      r(ctx, x - 5, top - 3, 10, 3, p.hat);
      r(ctx, x - 5, top - 4, 10, 1, '#8f3a2b');
      r(ctx, x - 1, top - 7, 2, 4, '#8f3a2b');
      r(ctx, x - 4, top + 1, 1, 2, p.hat);
      r(ctx, x + 3, top + 1, 1, 2, p.hat);
    } else if (p.hatType === 'petasos') {
      r(ctx, x - 6, top - 2, 12, 2, p.hat);
      r(ctx, x - 1, top - 5, 2, 3, p.hat);
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
    } else if (opt.accessory === 'torch') {
      r(ctx, x + 6, top + 1, 1, 13, '#7d5b36');
      r(ctx, x + 5, top - 1, 4, 2, '#b06a2c');
      r(ctx, x + 6, top - 3, 2, 2, '#ffd479');
    } else if (opt.accessory === 'basket') {
      r(ctx, x - 7, top + 10, 5, 5, '#c9a05a');
      r(ctx, x - 7, top + 10, 5, 1, '#8f6a32');
    }
    ctx.restore();
  };

  /* ------------------------------------------------------------
     greek architecture
     ------------------------------------------------------------ */
  const spriteCache = new Map();

  /* one fluted column, y is the base line */
  function column(c, x, baseY, h, w, opt) {
    opt = opt || {};
    const mar = opt.color || A.pal.marble;
    const lit = opt.lit || A.pal.marbleHi;
    const dark = opt.dark || A.pal.marbleShade;
    w = Math.max(3, Math.round(w || 6));
    h = Math.max(4, Math.round(h || 30));
    const half = w / 2;
    const left = Math.round(x - half);
    // base
    r(c, left - 1, baseY - 2, w + 2, 2, dark);
    r(c, left, baseY - 3, w, 1, lit);
    // shaft
    const shaftTop = baseY - h + 4;
    r(c, left, shaftTop, w, h - 7, mar);
    r(c, left, shaftTop, 1, h - 7, lit);
    r(c, left + w - 1, shaftTop, 1, h - 7, dark);
    // flutes
    c.save();
    c.globalAlpha = 0.22;
    c.fillStyle = dark;
    for (let i = 2; i < w - 1; i += 2) c.fillRect(left + i, shaftTop + 1, 1, h - 9);
    c.restore();
    // capital
    r(c, left - 1, baseY - h + 1, w + 2, 2, mar);
    r(c, left - 2, baseY - h, w + 4, 2, lit);
    r(c, left - 1, baseY - h - 1, w + 2, 1, dark);
    r(c, left - 2, baseY - h, w + 4, 1, '#f6f0dd');
  }
  A.column = column;

  function kore(c, x, baseY, h, opt) {
    opt = opt || {};
    const robe = opt.color || A.pal.marble;
    const dark = A.pal.marbleShade;
    const s = Math.max(0.7, h / 30);
    r(c, x - 3 * s, baseY - 2, 6 * s, 2, dark);
    r(c, x - 2.5 * s, baseY - h, 5 * s, h - 2, robe);
    r(c, x - 2.5 * s, baseY - h, 1 * s, h - 2, A.pal.marbleHi);
    r(c, x + 1.5 * s, baseY - h, 1 * s, h - 2, dark);
    // drapery folds
    c.save(); c.globalAlpha = 0.3; c.fillStyle = dark;
    for (let yy = baseY - h + 5 * s; yy < baseY - 3; yy += 4) c.fillRect(x - 2 * s, yy, 4 * s, 1);
    c.restore();
    // head
    r(c, x - 2 * s, baseY - h - 4 * s, 4 * s, 4 * s, A.pal.marbleHi);
    r(c, x - 1.5 * s, baseY - h - 4.5 * s, 3 * s, 1, A.pal.hair);
    r(c, x - 2.4 * s, baseY - h - 2 * s, 4.8 * s, 6 * s, robe);
  }

  /* column count + pitch for a temple facade */
  function facadeColumns(w, opt) {
    const cw = opt.columnW || 6;
    const n = opt.columns || Math.max(3, Math.round(w / 20));
    const pitch = n > 1 ? (w - cw) / (n - 1) : 0;
    return { n, cw, pitch };
  }

  A.templeSprite = function (w, opts) {
    opts = Object.assign({
      columnH: 34, columnW: 6, columns: 0, steps: 3, entH: 10, pedH: 13,
      pediment: true, ruined: false, caryatid: false, name: '', color: null,
      brokenFrom: -1,
    }, opts || {});
    const key = 'temple|' + w + '|' + JSON.stringify(opts);
    if (spriteCache.has(key)) return spriteCache.get(key);
    const padX = 46;
    const stepH = 3;
    const stairH = opts.steps * stepH;
    const bodyH = opts.columnH + opts.entH + (opts.pediment ? opts.pedH : 0);
    const ch = Math.ceil(stairH + bodyH + 40);
    const cw = Math.ceil(w + padX * 2);
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    const cx = Math.round(cw / 2);
    const base = ch - 12;

    // crepidoma (stepped platform)
    for (let i = 0; i < opts.steps; i++) {
      const sw = w + 18 - i * 6;
      const sy = base - i * stepH;
      r(c, cx - sw / 2, sy - stepH, sw, stepH, i === opts.steps - 1 ? A.pal.marble : A.pal.marbleMid);
      r(c, cx - sw / 2, sy - stepH, sw, 1, A.pal.marbleHi);
      r(c, cx - sw / 2, sy - 1, sw, 1, A.pal.marbleShade);
    }
    const stylo = base - stairH;

    // colonnade
    const f = facadeColumns(w, opts);
    const colTop = stylo - opts.columnH;
    for (let i = 0; i < f.n; i++) {
      const px = cx - w / 2 + f.cw / 2 + i * f.pitch;
      let hh = opts.columnH;
      let skip = false;
      if (opts.ruined) {
        const n = G.hash(i, 3, Math.round(w));
        if (n < 0.28) skip = true;
        else if (n < 0.6) hh = Math.round(opts.columnH * (0.35 + n * 0.75));
      }
      if (opts.brokenFrom >= 0 && i >= opts.brokenFrom) { if (i % 2 === 0) skip = true; else hh = Math.round(opts.columnH * 0.5); }
      if (opts.caryatid) kore(c, px, stylo, opts.columnH - 2, { color: opts.color });
      else if (!skip) column(c, px, stylo, hh, f.cw, { color: opts.color });
      // broken stump top
      if (opts.ruined && !skip && hh < opts.columnH) r(c, px - f.cw / 2, stylo - hh - 1, f.cw, 2, A.pal.marbleShade);
    }
    // back wall between columns
    r(c, cx - w / 2 + f.cw, colTop + 2, Math.max(0, w - f.cw * 2), opts.columnH - 6, '#6d6552');
    c.save(); c.globalAlpha = 0.5;
    r(c, cx - w / 2 + f.cw, colTop + 2, Math.max(0, w - f.cw * 2), opts.columnH - 6, '#7d735d');
    c.restore();

    // entablature: architrave, frieze, cornice
    const entTop = colTop - opts.entH;
    r(c, cx - w / 2 - 4, entTop, w + 8, opts.entH, A.pal.marble);
    r(c, cx - w / 2 - 4, entTop, w + 8, 3, A.pal.marbleHi);
    // frieze: triglyphs and metopes
    c.save();
    for (let i = 0; i < f.n; i++) {
      const gx = cx - w / 2 + f.cw / 2 + i * f.pitch - (f.pitch - f.cw > 8 ? 2 : 0);
      c.fillStyle = A.pal.marbleShade;
      c.fillRect(Math.round(gx - 2), entTop + 3, 3, opts.entH - 5);
      c.fillStyle = A.pal.marbleDark;
      c.fillRect(Math.round(gx - 1), entTop + 4, 1, opts.entH - 6);
    }
    c.restore();
    r(c, cx - w / 2 - 5, entTop + opts.entH - 2, w + 10, 2, A.pal.marbleHi);
    r(c, cx - w / 2 - 5, entTop + opts.entH, w + 10, 1, A.pal.marbleShade);

    // pediment
    if (opts.pediment) {
      const pBase = entTop - 1;
      const halfW = w / 2 + 6;
      for (let i = 0; i < opts.pedH; i++) {
        const t = i / opts.pedH;
        const hw = halfW * (1 - t);
        const y = pBase - i;
        r(c, cx - hw, y, hw * 2, 1, i % 4 === 0 ? A.pal.marbleMid : A.pal.marble);
      }
      // tympanum recess
      c.save(); c.globalAlpha = 0.35;
      r(c, cx - halfW * 0.72, pBase - opts.pedH * 0.55, halfW * 1.44, opts.pedH * 0.55 - 1, A.pal.marbleShade);
      c.restore();
      // raking cornice
      c.save();
      c.globalAlpha = 0.85;
      c.strokeStyle = A.pal.marbleHi; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx - halfW, pBase); c.lineTo(cx, pBase - opts.pedH); c.lineTo(cx + halfW, pBase); c.stroke();
      c.restore();
      // acroterion
      r(c, cx - 1, pBase - opts.pedH - 3, 2, 3, A.pal.bronze);
      // pediment figures
      if (!opts.ruined) {
        for (const [fx, fh] of [[-0.5, 3], [-0.2, 4], [0.15, 4], [0.45, 3]]) {
          r(c, cx + fx * halfW - 1, pBase - opts.pedH * 0.5 - fh + 2, 2, fh, A.pal.marbleHi);
        }
      }
      if (opts.name) {
        G.text(c, opts.name, cx, pBase - opts.pedH * 0.34, {
          size: 6, color: '#7d7058', align: 'center', weight: 'bold',
        });
      }
    }

    const spr = { cv, ax: cx, ay: base };
    spriteCache.set(key, spr);
    return spr;
  };

  A.drawTemple = function (ctx, x, baseY, w, opts) {
    opts = opts || {};
    const s = A.templeSprite(w, opts);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#20140d';
    ctx.beginPath();
    ctx.ellipse(x + 8, baseY - 2, w * 0.6, 7, 0, 0, G.TAU);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(s.cv, Math.round(x - s.ax), Math.round(baseY - s.ay));
  };

  /* the Propylaea — wide gate with central portico */
  A.gateSprite = function (w, opts) {
    opts = Object.assign({ wallH: 34, roofH: 20, columns: 6, name: '山门', step: true }, opts || {});
    const key = 'gate|' + w + '|' + JSON.stringify(opts);
    if (spriteCache.has(key)) return spriteCache.get(key);
    const padX = 50;
    const ch = opts.wallH + opts.roofH + 48;
    const cw = Math.ceil(w + padX * 2);
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d');
    const cx = cw / 2, base = ch - 10;
    // steps
    for (let i = 0; i < 3; i++) {
      const sw = w + 26 - i * 6;
      r(c, cx - sw / 2, base - i * 3 - 3, sw, 3, A.pal.marbleMid);
      r(c, cx - sw / 2, base - i * 3 - 3, sw, 1, A.pal.marble);
    }
    const stylo = base - 9;
    // side walls / wings
    const wingW = Math.round(w * 0.3);
    for (const side of [-1, 1]) {
      const wx = cx + side * (w / 2 - wingW / 2);
      r(c, wx - wingW / 2, stylo - opts.wallH, wingW, opts.wallH, '#6d6552');
      r(c, wx - wingW / 2, stylo - opts.wallH, wingW, 2, A.pal.marble);
      r(c, wx - wingW / 2, stylo - 2, wingW, 2, A.pal.marbleShade);
    }
    // central colonnade over a dark doorway
    r(c, cx - 22, stylo - opts.wallH + 6, 44, opts.wallH - 6, '#2a241b');
    r(c, cx - 18, stylo - opts.wallH + 10, 36, opts.wallH - 10, '#14100c');
    const n = 4;
    for (let i = 0; i < n; i++) {
      const px = cx - 30 + i * 20;
      column(c, px, stylo, opts.wallH + 6, 6, {});
    }
    // entablature + low pediment
    r(c, cx - w / 2 - 2, stylo - opts.wallH - 10, w + 4, 10, A.pal.marble);
    r(c, cx - w / 2 - 2, stylo - opts.wallH - 10, w + 4, 2, A.pal.marbleHi);
    const halfW = w / 2 + 8;
    for (let i = 0; i < opts.roofH; i++) {
      const t = i / opts.roofH;
      const hw = halfW * (1 - t);
      r(c, cx - hw, stylo - opts.wallH - 10 - i, hw * 2, 1, i % 3 === 0 ? A.pal.marbleMid : A.pal.marble);
    }
    if (opts.name) {
      const pw = 54;
      r(c, cx - pw / 2, stylo - opts.wallH - 8, pw, 7, '#2e2a20');
      G.text(c, opts.name, cx, stylo - opts.wallH - 2, { size: 6, color: '#e8d9b6', align: 'center', weight: 'bold' });
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
    ctx.beginPath(); ctx.ellipse(x + 10, baseY - 2, w * 0.58, 8, 0, 0, G.TAU); ctx.fill();
    ctx.restore();
    ctx.drawImage(s.cv, Math.round(x - s.ax), Math.round(baseY - s.ay));
  };

  /* low marble parapet, horizontal run */
  A.wallH = function (ctx, x1, x2, baseY, h, opts) {
    opts = opts || {};
    const w = x2 - x1;
    const col = opts.color || A.pal.marbleMid;
    r(ctx, x1, baseY - h, w, h, col);
    r(ctx, x1, baseY - h, w, 1, A.pal.marble);
    r(ctx, x1, baseY - 2, w, 2, A.pal.marbleShade);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = A.pal.marbleShade;
    for (let xx = x1 + 6; xx < x2; xx += 12) ctx.fillRect(xx, baseY - h + 2, 1, h - 4);
    ctx.restore();
  };

  /* low marble parapet, vertical run */
  A.wallV = function (ctx, x, y1, y2, w, opts) {
    opts = opts || {};
    const h = y2 - y1;
    const col = opts.color || A.pal.marbleMid;
    r(ctx, x, y1, w, h, col);
    r(ctx, x, y1, 1, h, A.pal.marble);
    r(ctx, x + w - 1, y1, 1, h, A.pal.marbleShade);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = A.pal.marbleShade;
    for (let yy = y1 + 6; yy < y2; yy += 12) ctx.fillRect(x + 2, yy, w - 4, 1);
    ctx.restore();
  };

  /* roman arch (Hadrian's Gate) */
  A.arch = function (ctx, x, baseY, w, h, opt) {
    opt = opt || {};
    const col = opt.color || A.pal.marble;
    const dark = A.pal.marbleShade;
    A.shadow(ctx, x, baseY, w + 6, 3, 0.26);
    // base
    r(ctx, x - w / 2, baseY - 4, w, 4, A.pal.marbleMid);
    // piers
    for (const side of [-1, 1]) {
      const px = x + side * (w / 2 - 8);
      r(ctx, px - 6, baseY - h, 12, h - 4, col);
      r(ctx, px - 6, baseY - h, 12, 2, A.pal.marbleHi);
      r(ctx, px - 6, baseY - h, 1, h - 4, '#f4eeda');
      r(ctx, px + 5, baseY - h, 1, h - 4, dark);
      r(ctx, px - 7, baseY - 5, 14, 2, dark);
    }
    // arch
    const arcR = w / 2 - 8;
    const arcY = baseY - h + 12;
    for (let a = 0; a <= Math.PI; a += 0.06) {
      const px = x + Math.cos(a) * arcR;
      const py = arcY - Math.sin(a) * arcR * 0.62;
      r(ctx, px - 1, py, 3, 3, col);
    }
    r(ctx, x - arcR, arcY - 2, arcR * 2, 3, A.pal.marbleHi);
  };

  /* theatre — semicircular seating */
  A.theater = function (ctx, x, baseY, rad, opt) {
    opt = opt || {};
    A.shadow(ctx, x, baseY, rad * 2, 3, 0.24);
    // cavea rows
    for (let ring = 4; ring >= 0; ring--) {
      const rr = rad * (0.5 + ring * 0.12);
      ctx.save();
      ctx.fillStyle = ring % 2 ? '#c4b79a' : '#d3c7aa';
      ctx.beginPath();
      ctx.ellipse(x, baseY - 4, rr, rr * 0.34, 0, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }
    // orchestra
    r(ctx, x - rad * 0.22, baseY - 5, rad * 0.44, 3, '#cbbf9f');
    // scene building
    r(ctx, x - rad * 0.34, baseY - 22, rad * 0.68, 18, '#8f8468');
    r(ctx, x - rad * 0.34, baseY - 22, rad * 0.68, 2, A.pal.marble);
    for (let i = 0; i < 4; i++) r(ctx, x - rad * 0.26 + i * rad * 0.18, baseY - 18, 3, 10, '#5c5340');
  };

  /* stoa — long colonnade with shallow roof */
  A.stoa = function (ctx, x, baseY, w, opt) {
    opt = opt || {};
    const h = opt.h || 24;
    A.shadow(ctx, x, baseY, w, 3, 0.2);
    r(ctx, x - w / 2, baseY - 5, w, 5, A.pal.marbleMid);
    const n = Math.max(3, Math.round(w / 16));
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + 6 + i * (w - 12) / (n - 1);
      column(ctx, px, baseY - 5, h, 5, {});
    }
    r(ctx, x - w / 2 - 3, baseY - h - 8, w + 6, 8, A.pal.marble);
    r(ctx, x - w / 2 - 3, baseY - h - 8, w + 6, 2, A.pal.marbleHi);
    // tiled roof
    r(ctx, x - w / 2 - 6, baseY - h - 11, w + 12, 3, A.pal.terra);
    r(ctx, x - w / 2 - 6, baseY - h - 11, w + 12, 1, A.pal.terraHi);
    r(ctx, x - w / 2 - 2, baseY - h - 14, w + 4, 3, A.pal.terraDark);
    // back wall
    r(ctx, x - w / 2 + 6, baseY - h - 4, w - 12, h - 1, '#6f6652');
    ctx.save(); ctx.globalAlpha = 0.4;
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + 6 + i * (w - 12) / (n - 1);
      ctx.fillStyle = '#4c4536'; ctx.fillRect(Math.round(px) + 2, baseY - h - 3, 2, h - 2);
    }
    ctx.restore();
  };

  /* the Parthenon, the icon of the Acropolis */
  A.parthenon = function (ctx, x, baseY, s, opt) {
    s = s || 1;
    const w = 230 * s;
    A.drawTemple(ctx, x, baseY, w, {
      columnH: 46 * s, columnW: 7 * s, columns: 8, steps: 3,
      entH: 13, pedH: 18, name: 'ΠΑΡΘΕΝΩΝ',
    });
  };

  /* Erechtheion with the porch of the Caryatids */
  A.caryatidPorch = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 70 * s, 3, 0.22);
    r(ctx, x - 34 * s, baseY - 5, 68 * s, 5, A.pal.marbleMid);
    for (let i = 0; i < 6; i++) {
      const px = x - 27 * s + i * 10 * s;
      kore(ctx, px, baseY - 5, 30 * s, {});
    }
    r(ctx, x - 38 * s, baseY - 40 * s, 76 * s, 7 * s, A.pal.marble);
    r(ctx, x - 38 * s, baseY - 40 * s, 76 * s, 2 * s, A.pal.marbleHi);
    for (let i = 0; i < 40 * s; i++) {
      const t = i / (40 * s);
      const hw = 38 * s * (1 - t * 0.9);
      r(ctx, x - hw, baseY - 40 * s - i, hw * 2, 1, i % 3 === 0 ? A.pal.marbleMid : A.pal.marble);
    }
  };

  /* temple of Olympian Zeus — the surviving colossal columns */
  A.templeOfZeus = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 120 * s, 4, 0.24);
    for (let i = 0; i < 4; i++) {
      r(ctx, x - 62 * s, baseY - i * 3, 124 * s, 3, i % 2 ? A.pal.marbleMid : A.pal.marble);
    }
    const xs = [-46, -28, -8, 14, 34, 50];
    xs.forEach((ox, i) => {
      const hh = (i === 2 || i === 4) ? 66 : (i === 0 || i === 5 ? 54 : 40);
      column(ctx, x + ox * s, baseY - 12, hh * s, 9 * s, {});
      if (hh > 50) r(ctx, x + ox * s - 6 * s, baseY - 12 - hh * s, 12 * s, 4 * s, A.pal.marbleHi);
    });
    // fallen drum
    r(ctx, x + 22 * s, baseY - 9, 16 * s, 8 * s, A.pal.marbleMid);
    r(ctx, x + 22 * s, baseY - 9, 16 * s, 2 * s, A.pal.marble);
    // scattered blocks
    r(ctx, x - 58 * s, baseY - 6, 12 * s, 5 * s, A.pal.marbleDark);
    r(ctx, x + 44 * s, baseY - 5, 9 * s, 4 * s, A.pal.marbleDark);
  };

  /* temple of Poseidon on the cliff at Sounion */
  A.templeOfPoseidon = function (ctx, x, baseY, s) {
    s = s || 1;
    // cliff
    for (let i = 0; i < 30 * s; i++) {
      const ww = (70 - i * 1.6) * s;
      r(ctx, x - ww, baseY - i, ww * 2, 1, i % 5 === 0 ? '#7d6c52' : '#8d7c60');
    }
    A.drawTemple(ctx, x, baseY - 26 * s, 92 * s, {
      columnH: 26 * s, columnW: 6 * s, columns: 6, steps: 2, entH: 10, pedH: 12,
      ruined: true,
    });
    // sea below
    A.sea(ctx, x - 220 * s, baseY + 2, 440 * s, 30 * s, 0, 5);
  };

  /* Hephaisteion in the Agora */
  A.hephaisteion = function (ctx, x, baseY, s) {
    s = s || 1;
    A.drawTemple(ctx, x, baseY, 120 * s, {
      columnH: 30 * s, columnW: 6 * s, columns: 6, steps: 2, entH: 10, pedH: 12, name: '',
    });
  };

  /* Athena Promachos — a gilded bronze statue */
  A.athenaStatue = function (ctx, x, baseY, s, t) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 28 * s, 3, 0.34);
    // stepped pedestal
    A.r(ctx, x - 14 * s, baseY - 3 * s, 28 * s, 3 * s, A.pal.marbleDark);
    A.r(ctx, x - 11 * s, baseY - 7 * s, 22 * s, 4 * s, A.pal.marbleMid);
    A.r(ctx, x - 11 * s, baseY - 7 * s, 22 * s, 1 * s, A.pal.marble);
    A.r(ctx, x - 8 * s, baseY - 10 * s, 16 * s, 3 * s, A.pal.marble);
    const foot = baseY - 10 * s;
    const gold = '#b8924e', lit = '#e0bd74', dark = '#7d5c2c', deep = '#5a4120';
    // robe: trapezoid, 8 wide at the waist and 16 at the hem
    for (let i = 0; i < 30 * s; i++) {
      const t01 = i / (30 * s);
      const ww = (8 + t01 * 8) * s;
      A.r(ctx, x - ww / 2, foot - i, ww, 1, i % 6 === 0 ? deep : gold);
    }
    // vertical drapery folds
    for (const fx of [-0.28, 0, 0.28]) {
      for (let i = 2; i < 30 * s; i += 3) {
        const t01 = i / (30 * s);
        const ww = (8 + t01 * 8) * s;
        A.r(ctx, x + fx * ww, foot - i, 1, 2, dark);
      }
    }
    // belt
    A.r(ctx, x - 4 * s, foot - 17 * s, 8 * s, 2 * s, dark);
    // torso
    A.r(ctx, x - 4 * s, foot - 26 * s, 8 * s, 9 * s, gold);
    A.r(ctx, x - 4 * s, foot - 26 * s, 2 * s, 9 * s, lit);
    A.r(ctx, x + 2 * s, foot - 26 * s, 2 * s, 9 * s, dark);
    // shoulders and arms
    A.r(ctx, x - 7 * s, foot - 26 * s, 3 * s, 8 * s, dark);
    A.r(ctx, x + 4 * s, foot - 26 * s, 3 * s, 8 * s, dark);
    A.r(ctx, x - 7 * s, foot - 18 * s, 3 * s, 2 * s, lit);
    A.r(ctx, x + 4 * s, foot - 18 * s, 3 * s, 2 * s, lit);
    // neck and head
    A.r(ctx, x - 2 * s, foot - 29 * s, 4 * s, 3 * s, lit);
    A.r(ctx, x - 3 * s, foot - 36 * s, 6 * s, 7 * s, lit);
    A.r(ctx, x + 1 * s, foot - 36 * s, 2 * s, 7 * s, gold);
    // crested helmet
    A.r(ctx, x - 4 * s, foot - 39 * s, 8 * s, 4 * s, gold);
    A.r(ctx, x - 4 * s, foot - 39 * s, 8 * s, 1 * s, lit);
    A.r(ctx, x - 1 * s, foot - 43 * s, 2 * s, 5 * s, '#8f3a2b');
    A.r(ctx, x - 2 * s, foot - 41 * s, 4 * s, 2 * s, '#a8452f');
    // spear in the right hand
    A.r(ctx, x - 9 * s, foot - 44 * s, 1 * s, 36 * s, '#d8c9a2');
    A.r(ctx, x - 10 * s, foot - 47 * s, 3 * s, 4 * s, '#efe6cf');
    //round shield on the left
    ctx.save();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(x + 8 * s, foot - 15 * s, 6 * s, 0, G.TAU); ctx.fill();
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.arc(x + 8 * s, foot - 15 * s, 4.5 * s, 0, G.TAU); ctx.fill();
    ctx.fillStyle = lit;
    ctx.beginPath(); ctx.arc(x + 8 * s, foot - 15 * s, 1.6 * s, 0, G.TAU); ctx.fill();
    ctx.restore();
    A.glow(ctx, x, foot - 20 * s, 34 * s, 'rgba(255,200,110,.14)', 0.6);
  };

  /* a fallen column drum */
  A.columnDrum = function (ctx, x, baseY, len, opt) {
    opt = opt || {};
    const s = opt.s || 1;
    len = (len || 22) * s;
    A.shadow(ctx, x, baseY, len + 4, 3, 0.26);
    A.r(ctx, x - len / 2, baseY - 8 * s, len, 8 * s, A.pal.marbleMid);
    A.r(ctx, x - len / 2, baseY - 8 * s, len, 2 * s, A.pal.marble);
    A.r(ctx, x - len / 2, baseY - 2 * s, len, 2 * s, A.pal.marbleShade);
    // end face with flutes
    ctx.save();
    ctx.fillStyle = A.pal.marbleDark;
    ctx.beginPath(); ctx.ellipse(x - len / 2 + 1, baseY - 4 * s, 2, 4 * s, 0, 0, G.TAU); ctx.fill();
    ctx.restore();
    for (let i = -len / 2 + 3; i < len / 2 - 2; i += 4) A.r(ctx, x + i, baseY - 7 * s, 1, 5 * s, 'rgba(150,138,112,.5)');
  };

  /* loose rubble blocks and potsherds */
  A.rubble = function (ctx, x, baseY, s) {
    s = s || 1;
    A.r(ctx, x - 7 * s, baseY - 4 * s, 6 * s, 4 * s, A.pal.marbleDark);
    A.r(ctx, x - 7 * s, baseY - 4 * s, 6 * s, 1 * s, A.pal.marble);
    A.r(ctx, x, baseY - 3 * s, 4 * s, 3 * s, A.pal.marbleShade);
    A.r(ctx, x + 4 * s, baseY - 2 * s, 3 * s, 2 * s, '#a8503a');
  };

  /* a laurel / myrtle bush */
  A.bush = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 18 * s, 2, 0.2);
    const blobs = [[0, -8, 9], [-6, -5, 6], [6, -6, 6], [-2, -12, 6]];
    for (let i = 0; i < blobs.length; i++) {
      const [bx, by, br] = blobs[i];
      A.r(ctx, x + bx * s - br * s / 2, baseY + by * s, br * s, br * s * 0.7, i % 2 ? A.pal.olive : A.pal.oliveDark);
    }
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#9aa86a';
    for (let i = 0; i < 8; i++) {
      const h = G.hash(x + i, baseY, 9);
      ctx.fillRect(x + Math.round((h - 0.5) * 14 * s), baseY - 6 * s - Math.round(h * 8 * s), 1, 1);
    }
    ctx.restore();
  };


  /* ------------------------------------------------------------
     nature & props
     ------------------------------------------------------------ */
  A.oliveTree = function (ctx, x, baseY, size, opt) {
    opt = opt || {};
    size = size || 1;
    const p = opt.autumn ? ['#8f7a3a', '#a89044', '#6f5c2a'] : [A.pal.olive, A.pal.oliveHi, A.pal.oliveDark];
    A.shadow(ctx, x, baseY, 26 * size, 3, 0.24);
    // gnarled trunk
    r(ctx, x - 2 * size, baseY - 14 * size, 4 * size, 14 * size, '#6b5236');
    r(ctx, x - 3 * size, baseY - 10 * size, 2 * size, 6 * size, '#5a432c');
    r(ctx, x + 2 * size, baseY - 12 * size, 2 * size, 8 * size, '#7d6242');
    const blobs = [
      [0, -26, 16], [-11, -20, 11], [11, -21, 11], [-6, -32, 10], [8, -31, 9], [0, -36, 8],
    ];
    for (let i = 0; i < blobs.length; i++) {
      const [bx, by, br] = blobs[i];
      const col = p[i % p.length];
      r(ctx, x + bx * size - br * size / 2, baseY + by * size, br * size, br * size * 0.66, col);
      if (i % 2 === 0) r(ctx, x + bx * size - br * size / 2 + 2, baseY + by * size - 2, br * size - 5, 2, p[1]);
    }
    // silver-green leaf flecks
    ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#a8b579';
    for (let i = 0; i < 26; i++) {
      const h = G.hash(x + i, baseY, 3);
      ctx.fillRect(x + Math.round((h - 0.5) * 32 * size), baseY - 18 * size - Math.round(h * 18 * size), 1, 1);
    }
    ctx.restore();
    // terracotta pot at the foot sometimes
    if (opt.pot) {
      r(ctx, x - 6 * size, baseY - 6 * size, 12 * size, 6 * size, A.pal.terra);
      r(ctx, x - 7 * size, baseY - 7 * size, 14 * size, 2 * size, A.pal.terraHi);
    }
  };

  A.cypress = function (ctx, x, baseY, size) {
    size = size || 1;
    A.shadow(ctx, x, baseY, 10 * size, 2, 0.24);
    r(ctx, x - 1, baseY - 6 * size, 2, 6 * size, '#4a3a26');
    for (let i = 0; i < 26 * size; i++) {
      const t = i / (26 * size);
      const hw = (5 * size) * (1 - t) + 1;
      r(ctx, x - hw, baseY - 6 * size - i, hw * 2, 1, i % 4 === 0 ? A.pal.cypressDark : (i % 4 === 2 ? A.pal.cypressHi : A.pal.cypress));
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

  A.palm = function (ctx, x, baseY, size, t) {
    size = size || 1;
    A.shadow(ctx, x, baseY, 12 * size, 2, 0.22);
    r(ctx, x - 1, baseY - 30 * size, 2, 30 * size, '#6b5236');
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.42;
      ctx.save();
      ctx.strokeStyle = i % 2 ? '#4e6c3f' : '#5f8149';
      ctx.lineWidth = 2 * size;
      const sway = Math.sin((t || 0) * 1.2 + i) * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, baseY - 30 * size);
      ctx.quadraticCurveTo(x + Math.cos(a) * 10 * size + sway, baseY - 34 * size, x + Math.cos(a) * 16 * size + sway, baseY - 30 * size + Math.sin(a) * 6 * size);
      ctx.stroke();
      ctx.restore();
    }
  };

  A.amphora = function (ctx, x, baseY, opt) {
    opt = opt || {};
    const col = opt.color || A.pal.terra;
    const s = opt.s || 1;
    A.shadow(ctx, x, baseY, 10 * s, 2, 0.24);
    r(ctx, x - 4 * s, baseY - 4 * s, 8 * s, 4 * s, A.pal.terraDark);
    r(ctx, x - 3 * s, baseY - 10 * s, 6 * s, 7 * s, col);
    r(ctx, x - 2 * s, baseY - 12 * s, 4 * s, 3 * s, col);
    r(ctx, x - 3 * s, baseY - 11 * s, 1 * s, 4 * s, '#2a1a12');
    r(ctx, x + 2 * s, baseY - 11 * s, 1 * s, 4 * s, '#2a1a12');
    r(ctx, x - 2 * s, baseY - 13 * s, 4 * s, 1 * s, A.pal.terraHi);
    // black figure band
    r(ctx, x - 3 * s, baseY - 8 * s, 6 * s, 2 * s, '#2a1a12');
  };

  A.brazier = function (ctx, x, baseY, lit, t) {
    A.shadow(ctx, x, baseY, 20, 2, 0.3);
    // tripod legs
    for (const dx of [-6, 0, 6]) {
      r(ctx, x + dx - 1, baseY - 8, 2, 8, A.pal.bronzeDark);
    }
    // bowl
    r(ctx, x - 8, baseY - 14, 16, 7, A.pal.bronzeDark);
    r(ctx, x - 7, baseY - 14, 14, 5, A.pal.bronze);
    r(ctx, x - 8, baseY - 15, 16, 2, A.pal.bronzeHi);
    r(ctx, x - 9, baseY - 12, 1, 4, A.pal.bronzeHi);
    r(ctx, x + 8, baseY - 12, 1, 4, A.pal.bronzeHi);
    if (lit) {
      A.glow(ctx, x, baseY - 18, 40 + Math.sin((t || 0) * 7) * 4, 'rgba(255,168,60,.5)', 0.55);
      for (let i = 0; i < 5; i++) {
        const f = 3 + G.hash(i, 2, 7) * 6;
        const fx = x - 5 + i * 3 + Math.sin((t || 0) * 9 + i) * 1.2;
        r(ctx, fx, baseY - 16 - f, 2, f, i % 2 ? '#ffb347' : '#ffd479');
      }
      r(ctx, x - 4, baseY - 18, 8, 3, '#fff3c4');
    } else {
      r(ctx, x - 5, baseY - 16, 10, 2, '#3a2a1c');
    }
  };

  A.tripod = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 12, 2, 0.24);
    for (const dx of [-4, 0, 4]) r(ctx, x + dx - 1, baseY - 10, 2, 10, A.pal.bronzeDark);
    r(ctx, x - 6, baseY - 16, 12, 6, A.pal.bronze);
    r(ctx, x - 7, baseY - 17, 14, 2, A.pal.bronzeHi);
    r(ctx, x - 6, baseY - 11, 12, 1, A.pal.bronzeDark);
  };

  A.laurel = function (ctx, x, baseY, h) {
    h = h || 14;
    r(ctx, x - 1, baseY - h, 2, h, '#5a432c');
    for (let i = 0; i < 6; i++) {
      const yy = baseY - h + i * 2;
      const side = i % 2 ? 1 : -1;
      r(ctx, x + side * 2 - 1, yy, 3, 1, A.pal.oliveHi);
    }
  };

  A.sign = function (ctx, x, baseY, text, opt) {
    opt = opt || {};
    const w = opt.w || 52, h = opt.h || 16;
    r(ctx, x - 1, baseY - 20, 2, 20, '#5a432c');
    r(ctx, x - w / 2, baseY - 36, w, h, '#6d5a3c');
    r(ctx, x - w / 2 + 1, baseY - 35, w - 2, h - 2, '#e3d7bb');
    ctx.strokeStyle = '#8f7a52'; ctx.strokeRect(x - w / 2 + 0.5, baseY - 35.5, w - 1, h - 1);
    G.text(ctx, text, x, baseY - 36 + h / 2 + 3, { size: opt.size || 7, color: '#4a3a26', align: 'center', weight: 'bold' });
  };

  A.bench = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 20, 2, 0.22);
    r(ctx, x - 9, baseY - 2, 2, 2, A.pal.marbleDark);
    r(ctx, x + 7, baseY - 2, 2, 2, A.pal.marbleDark);
    r(ctx, x - 9, baseY - 6, 18, 4, A.pal.marble);
    r(ctx, x - 9, baseY - 6, 18, 1, A.pal.marbleHi);
  };

  A.rock = function (ctx, x, baseY, s) {
    s = s || 1;
    A.shadow(ctx, x, baseY, 18 * s, 2, 0.25);
    r(ctx, x - 8 * s, baseY - 14 * s, 14 * s, 14 * s, '#b3a88b');
    r(ctx, x - 5 * s, baseY - 20 * s, 8 * s, 10 * s, '#c9bfa2');
    r(ctx, x + 2 * s, baseY - 16 * s, 7 * s, 9 * s, '#9c9174');
    r(ctx, x - 6 * s, baseY - 11 * s, 3 * s, 5 * s, '#7d7259');
    r(ctx, x - 3 * s, baseY - 19 * s, 2 * s, 2 * s, '#ded5ba');
  };

  A.well = function (ctx, x, baseY) {
    A.shadow(ctx, x, baseY, 18, 2, 0.26);
    r(ctx, x - 8, baseY - 8, 16, 8, A.pal.marbleMid);
    r(ctx, x - 7, baseY - 9, 14, 2, A.pal.marble);
    r(ctx, x - 5, baseY - 8, 10, 3, '#2a4a4a');
    for (let i = 0; i < 4; i++) r(ctx, x - 8 + i * 4, baseY - 6, 1, 4, A.pal.marbleDark);
  };

  A.altar = function (ctx, x, baseY, lit, t) {
    A.shadow(ctx, x, baseY, 26, 3, 0.26);
    r(ctx, x - 12, baseY - 10, 24, 10, A.pal.marbleMid);
    r(ctx, x - 12, baseY - 10, 24, 2, A.pal.marbleHi);
    r(ctx, x - 14, baseY - 12, 28, 3, A.pal.marble);
    r(ctx, x - 10, baseY - 3, 20, 2, A.pal.marbleDark);
    if (lit) {
      A.glow(ctx, x, baseY - 20, 46, 'rgba(255,170,70,.5)', 0.5);
      for (let i = 0; i < 4; i++) {
        const f = 4 + Math.sin((t || 0) * 6 + i) * 2 + i;
        r(ctx, x - 6 + i * 4, baseY - 14 - f, 2, f, i % 2 ? '#ffb347' : '#ffd479');
      }
    }
  };

  A.lamp = function (ctx, x, baseY, night, opt) {
    opt = opt || {};
    r(ctx, x - 1, baseY - 26, 2, 26, '#5a4a32');
    r(ctx, x - 4, baseY - 29, 8, 4, '#5a4a32');
    r(ctx, x - 3, baseY - 28, 6, 3, night ? '#ffdca0' : '#d9c9a6');
    if (night) A.glow(ctx, x, baseY - 27, 26, 'rgba(255,180,90,.5)', 0.4);
    if (opt.cloth) {
      r(ctx, x - 3, baseY - 34, 6, 5, A.pal.terra);
      r(ctx, x - 3, baseY - 34, 6, 1, A.pal.terraHi);
    }
  };

  A.bridge = function (ctx, cx, y, w, opt) {
    opt = opt || {};
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#0d2426';
    ctx.beginPath();
    ctx.ellipse(cx, y + 2, w / 2 + 5, 16, 0, 0, G.TAU);
    ctx.fill();
    ctx.restore();
    r(ctx, cx - w / 2, y - 12, w, 24, A.pal.marbleDark);
    r(ctx, cx - w / 2, y - 11, w, 22, A.pal.marble);
    for (let i = 0; i < w; i += 7) r(ctx, cx - w / 2 + i, y - 11, 1, 22, A.pal.marbleDark);
    r(ctx, cx - w / 2, y - 12, w, 2, '#f0e9d7');
    r(ctx, cx - w / 2, y + 11, w, 2, A.pal.stoneDark);
    // low parapet
    for (let i = 0; i <= w; i += 8) {
      const px = cx - w / 2 + i;
      r(ctx, px, y - 15, 2, 5, A.pal.marble);
      r(ctx, px, y + 9, 2, 5, A.pal.marble);
    }
  };

  A.water = function (ctx, x, y, w, h, t, seed) {
    r(ctx, x, y, w, h, A.pal.azureDeep);
    r(ctx, x, y + 1, w, h - 2, A.pal.azure);
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = A.pal.azureHi;
    for (let yy = y + 3; yy < y + h - 2; yy += 7) {
      const off = Math.sin((t || 0) * 1.2 + yy * 0.3 + (seed || 0)) * 5;
      for (let xx = x + 4; xx < x + w - 4; xx += 22) ctx.fillRect(xx + off, yy, 10, 1);
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#8fbfb4';
    ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = '#16363f';
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.restore();
  };

  A.sea = function (ctx, x, y, w, h, t, seed) {
    r(ctx, x, y, w, h, '#1f4557');
    ctx.save();
    for (let yy = y + 2; yy < y + h; yy += 4) {
      ctx.globalAlpha = 0.2 + G.hash(yy, 2, 3) * 0.12;
      ctx.fillStyle = '#6fa5bd';
      const off = Math.sin((t || 0) * 0.9 + yy * 0.4 + (seed || 0)) * 8;
      ctx.fillRect(x + 6 + off, yy, w * 0.3, 1);
      ctx.fillRect(x + w * 0.55 - off, yy, Math.min(w * 0.35, w - 20), 1);
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#cfe6ea';
    ctx.fillRect(x, y, w, 1);
    ctx.restore();
  };

  /* ------------------------------------------------------------
     living things
     ------------------------------------------------------------ */
  A.cat = function (ctx, x, y, t, opt) {
    opt = opt || {};
    const orange = opt.color || '#c58448';
    const bob = Math.sin((t || 0) * 2.4) * 0.8;
    A.shadow(ctx, x, y, 12, 2, 0.25);
    r(ctx, x - 6, y - 8 + bob, 10, 6, orange);
    r(ctx, x - 5, y - 9 + bob, 7, 2, '#e2b070');
    r(ctx, x + 3, y - 13 + bob, 7, 7, orange);
    r(ctx, x + 4, y - 12 + bob, 5, 4, '#e2b070');
    r(ctx, x + 3, y - 14 + bob, 2, 2, orange);
    r(ctx, x + 8, y - 14 + bob, 2, 2, orange);
    r(ctx, x + 5, y - 11 + bob, 1, 1, '#2b2118');
    r(ctx, x + 8, y - 11 + bob, 1, 1, '#2b2118');
    r(ctx, x + 7, y - 9 + bob, 1, 1, '#b86a56');
    ctx.strokeStyle = orange;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 5 + bob);
    ctx.quadraticCurveTo(x - 12, y - 8, x - 10 + Math.sin((t || 0) * 2) * 2, y - 13);
    ctx.stroke();
    r(ctx, x - 4, y - 3, 2, 3, orange);
    r(ctx, x + 1, y - 3, 2, 3, orange);
  };

  A.seagull = function (ctx, x, y, t, seed) {
    const fly = Math.sin((t || 0) * 2 + (seed || 0)) * 1.4;
    const flap = Math.sin((t || 0) * 8 + (seed || 0)) > 0;
    r(ctx, x - 1, y - 2 + fly, 3, 2, '#f2f0e8');
    r(ctx, x, y - 3 + fly, 1, 1, '#e8d8a8');
    if (flap) {
      r(ctx, x - 5, y - 3 + fly, 4, 1, '#e6e4dc');
      r(ctx, x + 3, y - 3 + fly, 4, 1, '#e6e4dc');
    } else {
      r(ctx, x - 4, y - 1 + fly, 3, 1, '#e6e4dc');
      r(ctx, x + 2, y - 1 + fly, 3, 1, '#e6e4dc');
    }
  };

  A.goat = function (ctx, x, y, t) {
    const bob = Math.sin((t || 0) * 1.6) * 0.6;
    A.shadow(ctx, x, y, 14, 2, 0.24);
    r(ctx, x - 6, y - 8 + bob, 11, 5, '#d9cfbb');
    r(ctx, x + 4, y - 10 + bob, 5, 5, '#e6ddc8');
    r(ctx, x + 5, y - 12 + bob, 2, 2, '#c9bfa8');
    r(ctx, x + 8, y - 9 + bob, 1, 1, '#3a3228');
    for (const dx of [-5, -1, 2, 5]) r(ctx, x + dx, y - 3, 1, 3, '#8f8570');
  };

  A.flag = function (ctx, x, baseY, t, color) {
    r(ctx, x, baseY - 26, 1, 26, '#7d6a4a');
    const wav = Math.sin((t || 0) * 3) * 1.5;
    r(ctx, x + 1, baseY - 26 + wav, 12, 7, color || A.pal.terra);
    r(ctx, x + 1, baseY - 26 + wav, 12, 1, '#e8d9b6');
  };

  /* ------------------------------------------------------------
     light / grade
     ------------------------------------------------------------ */
  A.dayGrade = function (ctx, t, strength) {
    strength = strength == null ? 1 : strength;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, 'rgba(255,206,140,' + (0.18 * strength) + ')');
    g.addColorStop(0.42, 'rgba(255,190,120,' + (0.05 * strength) + ')');
    g.addColorStop(0.72, 'rgba(70,90,110,' + (0.03 * strength) + ')');
    g.addColorStop(1, 'rgba(20,44,64,' + (0.14 * strength) + ')');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 640, 360);
    ctx.restore();
    A.glow(ctx, 100, 4, 190, 'rgba(255,224,170,.09)', 0.7 * strength);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.04 * strength;
    ctx.fillStyle = '#ffe9bd';
    ctx.beginPath();
    ctx.moveTo(-40, 0); ctx.lineTo(240, 0); ctx.lineTo(540, 360); ctx.lineTo(300, 360);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.026 * strength;
    ctx.beginPath();
    ctx.moveTo(200, 0); ctx.lineTo(330, 0); ctx.lineTo(620, 360); ctx.lineTo(480, 360);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bg = ctx.createLinearGradient(0, 220, 0, 360);
    bg.addColorStop(0, 'rgba(255,190,110,0)');
    bg.addColorStop(1, 'rgba(255,176,96,' + (0.045 * strength) + ')');
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

  A.crowd = function (ctx, x, y, n, t, seed) {
    for (let i = 0; i < n; i++) {
      const h = G.hash(i, 0, seed || 5);
      const px = x + (h - 0.5) * 130;
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

  /* ------------------------------------------------------------
     mini acropolis for the Athens map
     ------------------------------------------------------------ */
  A.miniAcropolis = function (ctx, x, baseY, w, h) {
    // the rock, darker than the marble so the temples read against it
    for (let i = 0; i < h; i++) {
      const t = i / h;
      const ww = w * (0.7 + t * 0.44) + (G.hash(i, 3, 7) - 0.5) * 6;
      const col = i % 12 === 0 ? '#4f4837' : (i % 4 === 0 ? '#5f5744' : '#6d6450');
      r(ctx, x - ww / 2, baseY - i, ww, 1, col);
      // scrub and shadow on the cliff
      if (i % 9 === 3) {
        ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = G.hash(i, 5, 9) > 0.5 ? '#7a8a55' : '#4a4433';
        for (let xx = x - ww / 2 + 10; xx < x + ww / 2 - 10; xx += 22) {
          ctx.fillRect(xx + (G.hash(i, xx, 11) * 10) | 0, baseY - i, 6, 2);
        }
        ctx.restore();
      }
    }
    // dark silhouette edge and rocky foot
    r(ctx, x - w * 0.62, baseY, w * 1.24, 5, '#4f4837');
    ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#1d1710';
    ctx.beginPath(); ctx.ellipse(x, baseY + 5, w * 0.62, 10, 0, 0, G.TAU); ctx.fill();
    ctx.restore();
    const top = baseY - h;
    // retaining wall with merlons along the rim
    r(ctx, x - w * 0.58, top + 8, w * 1.16, 7, '#a99c7e');
    r(ctx, x - w * 0.58, top + 8, w * 1.16, 2, '#cfc3a6');
    for (let xx = x - w * 0.58; xx < x + w * 0.58; xx += 10) {
      r(ctx, xx, top + 3, 5, 5, '#b3a684');
      r(ctx, xx, top + 3, 5, 1, '#d2c7ab');
    }
    // Parthenon
    A.drawTemple(ctx, x + 8, top + 2, 78, {
      columnH: 17, columnW: 4, columns: 6, steps: 2, entH: 5, pedH: 6, name: '',
    });
    // Propylaea at the west edge
    A.drawGate(ctx, x - w * 0.44, top + 8, 44, { wallH: 12, roofH: 7, name: '' });
    // Erechtheion
    A.caryatidPorch(ctx, x + w * 0.34, top + 4, 0.34);
    // theatre on the south slope
    A.theater(ctx, x + w * 0.32, baseY - 6, 24);
    // olive trees
    A.oliveTree(ctx, x - w * 0.5, baseY - 8, 0.5);
    A.oliveTree(ctx, x + w * 0.5, baseY - 6, 0.45);
  };
})();
