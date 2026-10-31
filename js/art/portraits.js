/* Modern Athenian doctoral supervisor. Feet-centered 240 x 360 portrait API. */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;
  G.mod.painter('portrait.diotima', function (ctx, prop) {
    // Local integer primitives also work when the portrait gallery is not loaded.
    function R(x, y, w, h, color) {
      if (w <= 0 || h <= 0) return;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
    function E(cx, cy, rx, ry, color) {
      for (let y = Math.ceil(cy - ry); y < Math.ceil(cy + ry); y++) {
        const dy = (y + 0.5 - cy) / ry;
        if (Math.abs(dy) > 1) continue;
        const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy)) + 0.5);
        if (hw > 0) R(cx - hw, y, hw * 2, 1, color);
      }
    }
    const s = {
      skin: '#f6cfa9', skinShade: '#dca87f',
      hair: '#6f4a34', hairHi: '#9c6d4c', hairDeep: '#4a2f22',
      coat: '#26365c', coatShade: '#1a2742', coatHi: '#3a5282',
      shirt: '#faf6ec', shirtShade: '#ded7c7', frame: '#4a3320'
    };
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    E(0, -3, 43, 5, 'rgba(0,0,0,.28)');
    // Separate long trouser legs, seams, and flat shoes at the feet anchor.
    R(-31, -145, 28, 129, s.coatShade);
    R(5, -145, 28, 129, s.coatShade);
    R(-27, -137, 3, 115, s.coatHi);
    R(10, -137, 3, 115, s.coatHi);
    R(-31, -20, 28, 7, s.coat);
    R(5, -20, 28, 7, s.coat);
    R(-35, -14, 31, 11, '#171c24');
    R(-40, -9, 36, 6, '#171c24');
    R(6, -14, 29, 11, '#171c24');
    R(6, -9, 37, 6, '#171c24');
    R(-39, -4, 35, 1, '#414d5c');
    R(6, -4, 36, 1, '#414d5c');
    // Light open blouse beneath a navy tailored blazer.
    R(-10, -245, 20, 23, s.skinShade);
    R(-6, -242, 12, 17, s.skin);
    E(0, -211, 47, 22, s.coat);
    R(-42, -213, 84, 75, s.coat);
    R(-42, -204, 7, 66, s.coatShade);
    R(35, -204, 7, 66, s.coatShade);
    R(-13, -229, 26, 89, s.shirtShade);
    R(-7, -221, 14, 81, s.shirt);
    for (let i = 0; i < 9; i++) {
      R(-26 + i * 2, -228 + i * 6, 8, 6, s.coatHi);
      R(18 - i * 2, -228 + i * 6, 8, 6, s.coatHi);
    }
    R(-12, -230, 7, 7, s.shirt);
    R(-8, -223, 6, 6, s.shirt);
    R(5, -230, 7, 7, s.shirt);
    R(2, -223, 6, 6, s.shirt);
    R(1, -181, 2, 2, '#a7a6a0');
    R(1, -168, 2, 2, '#a7a6a0');
    // Sleeves have explicit stair steps rather than diagonal canvas paths.
    R(-49, -214, 13, 29, s.coat);
    R(-53, -185, 14, 30, s.coat);
    R(-53, -181, 3, 24, s.coatHi);
    R(36, -214, 12, 29, s.coatShade);
    R(40, -185, 13, 26, s.coatShade);
    R(41, -160, 11, 4, s.shirt);
    E(46, -150, 7, 10, s.skin);
    R(42, -144, 8, 2, s.skinShade);
    // Research folder against her left arm; paper and label remain clear small.
    R(-58, -194, 35, 58, '#4b646a');
    R(-55, -197, 29, 7, '#d9ded7');
    R(-54, -187, 28, 48, '#667d80');
    R(-52, -185, 2, 44, '#819595');
    R(-47, -179, 17, 2, '#d9ded7');
    R(-47, -172, 14, 2, '#b4c2bf');
    R(-47, -165, 17, 2, '#b4c2bf');
    E(-42, -151, 8, 10, s.skin);
    R(-48, -145, 12, 2, s.skinShade);
    // Shoulder-length chestnut hair behind a mature face.
    E(0, -274, 32, 43, s.hairDeep);
    R(-32, -277, 14, 43, s.hairDeep);
    R(18, -277, 14, 43, s.hairDeep);
    R(-29, -267, 5, 30, s.hair);
    R(25, -267, 4, 30, s.hair);
    E(0, -272, 23, 31, s.skin);
    E(-23, -272, 3, 6, s.skinShade);
    E(23, -272, 3, 6, s.skinShade);
    R(-21, -280, 3, 14, s.skinShade);
    R(18, -280, 3, 14, s.skinShade);
    // Pixel cap and swept fringe, with silver at both temples.
    E(0, -296, 27, 17, s.hair);
    R(-27, -297, 9, 18, s.hair);
    R(-20, -299, 15, 13, s.hair);
    R(-7, -302, 17, 11, s.hair);
    R(9, -298, 13, 13, s.hair);
    R(21, -290, 9, 17, s.hair);
    R(-17, -306, 12, 3, s.hairHi);
    R(11, -303, 8, 3, s.hairHi);
    R(-22, -294, 2, 10, '#b9b1a8');
    R(-25, -284, 2, 16, '#b9b1a8');
    R(21, -291, 2, 10, '#b9b1a8');
    R(25, -281, 2, 15, '#b9b1a8');
    R(-17, -284, 12, 2, s.hairDeep);
    R(5, -284, 12, 2, s.hairDeep);
    // Rectangular glasses made only of integer bars.
    for (const gx of [-19, 3]) {
      R(gx, -280, 16, 1, s.frame);
      R(gx, -270, 16, 1, s.frame);
      R(gx, -279, 1, 9, s.frame);
      R(gx + 15, -279, 1, 9, s.frame);
    }
    R(-3, -276, 6, 1, s.frame);
    R(-23, -279, 4, 1, s.frame);
    R(19, -279, 4, 1, s.frame);
    R(-12, -276, 3, 4, '#241713');
    R(9, -276, 3, 4, '#241713');
    R(0, -269, 2, 8, s.skinShade);
    R(-2, -262, 5, 2, s.skinShade);
    R(-8, -253, 4, 1, '#a66d5a');
    R(-4, -252, 8, 1, '#a66d5a');
    R(4, -253, 4, 1, '#a66d5a');
    R(-17, -265, 4, 1, s.skinShade);
    R(13, -265, 4, 1, s.skinShade);
    ctx.restore();
    void prop;
  });
})();
