/* ============================================================
   A · 美术  立绘画笔（过场用）
   ------------------------------------------------------------
   过场里的 { t:'portrait', who:'diotima' } 会去找 painter 'portrait.<who>'。
   画布固定 240 × 360，**原点 = 脚底中心**（js/cut.js 的 _paint 会
   translate 到 (width/2, height-12)），所以往上画就是负 y。

   画法约定和别处一样：纯函数、只画、不读存档、不弹窗、不写文字。
   立绘是"人"，不是"界面"，所以不画边框、不画名牌。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const INK = '#241d19';
  const GOLD = '216,178,106';

  function robe(ctx) {
    /* 希顿长袍：从脚踝到头肩，右深左浅 */
    ctx.beginPath();
    ctx.moveTo(-52, -6);
    ctx.quadraticCurveTo(-58, -96, -40, -168);
    ctx.quadraticCurveTo(-30, -212, -20, -226);
    ctx.lineTo(22, -226);
    ctx.quadraticCurveTo(32, -208, 42, -166);
    ctx.quadraticCurveTo(56, -92, 50, -6);
    ctx.quadraticCurveTo(0, 6, -52, -6);
    ctx.closePath();
    ctx.fillStyle = '#e9e1d0';
    ctx.fill();

    /* 右半边的暗部，让袍子有体积 */
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(14, -232);
    ctx.quadraticCurveTo(40, -150, 52, -4);
    ctx.lineTo(64, -4);
    ctx.lineTo(64, -232);
    ctx.closePath();
    ctx.fillStyle = 'rgba(176,158,132,0.55)';
    ctx.fill();
    /* 布褶 */
    ctx.strokeStyle = 'rgba(150,132,108,0.5)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const x = -34 + i * 17;
      ctx.beginPath();
      ctx.moveTo(x, -20);
      ctx.quadraticCurveTo(x + 3, -110, x - 2, -196);
      ctx.stroke();
    }
    ctx.restore();
  }

  function himation(ctx) {
    /* 希玛纯：深青披巾，从左肩斜到右胯 */
    ctx.beginPath();
    ctx.moveTo(-24, -228);
    ctx.quadraticCurveTo(-48, -198, -46, -150);
    ctx.quadraticCurveTo(-40, -96, 6, -74);
    ctx.quadraticCurveTo(34, -66, 52, -74);
    ctx.quadraticCurveTo(44, -140, 20, -206);
    ctx.quadraticCurveTo(6, -232, -24, -228);
    ctx.closePath();
    ctx.fillStyle = '#31485c';
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(20,34,46,0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-40 + i * 6, -196);
      ctx.quadraticCurveTo(-10 + i * 10, -140, 40, -110 + i * 12);
      ctx.stroke();
    }
    ctx.restore();

    /* 披巾边缘一道金线 */
    ctx.beginPath();
    ctx.moveTo(-24, -228);
    ctx.quadraticCurveTo(-48, -198, -46, -150);
    ctx.quadraticCurveTo(-40, -96, 6, -74);
    ctx.strokeStyle = 'rgba(' + GOLD + ',0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function head(ctx) {
    /* 脖子 */
    ctx.beginPath();
    ctx.moveTo(-10, -230);
    ctx.lineTo(10, -230);
    ctx.lineTo(9, -246);
    ctx.lineTo(-9, -246);
    ctx.closePath();
    ctx.fillStyle = '#c9a37c';
    ctx.fill();

    /* 后发：盘髻 + 两侧卷发 */
    ctx.beginPath();
    ctx.moveTo(-26, -262);
    ctx.quadraticCurveTo(-30, -296, -6, -302);
    ctx.quadraticCurveTo(20, -304, 27, -282);
    ctx.quadraticCurveTo(30, -266, 22, -256);
    ctx.quadraticCurveTo(14, -276, -4, -278);
    ctx.quadraticCurveTo(-18, -280, -26, -262);
    ctx.closePath();
    ctx.fillStyle = INK;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-2, -318, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    /* 脸 */
    ctx.beginPath();
    ctx.moveTo(-19, -286);
    ctx.quadraticCurveTo(-21, -258, -8, -246);
    ctx.quadraticCurveTo(2, -240, 12, -248);
    ctx.quadraticCurveTo(22, -260, 19, -284);
    ctx.quadraticCurveTo(6, -296, -19, -286);
    ctx.closePath();
    ctx.fillStyle = '#dcbb92';
    ctx.fill();

    /* 眉、眼、唇：简笔，别画太细（像素风里会糊） */
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, -276);
    ctx.lineTo(-3, -274);
    ctx.moveTo(4, -274);
    ctx.lineTo(13, -276);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-7, -270, 3.4, 2.2, 0, 0, Math.PI * 2);
    ctx.ellipse(8, -270, 3.4, 2.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-2, -258);
    ctx.quadraticCurveTo(3, -255, 8, -258);
    ctx.strokeStyle = '#a9705f';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    /* 前额的深色发际 */
    ctx.beginPath();
    ctx.moveTo(-19, -286);
    ctx.quadraticCurveTo(-4, -298, 19, -284);
    ctx.quadraticCurveTo(6, -292, -8, -290);
    ctx.closePath();
    ctx.fillStyle = INK;
    ctx.fill();

    /* 金发带 */
    ctx.beginPath();
    ctx.moveTo(-20, -292);
    ctx.quadraticCurveTo(0, -303, 21, -289);
    ctx.strokeStyle = 'rgba(' + GOLD + ',0.95)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function scroll(ctx) {
    /* 左手握卷轴：几卷纸 + 一道系带 */
    ctx.save();
    ctx.translate(-46, -150);
    ctx.rotate(-0.22);
    ctx.fillStyle = '#f2e7cf';
    ctx.fillRect(-6, -34, 13, 68);
    ctx.fillStyle = '#e0d0ad';
    ctx.fillRect(-6, -34, 13, 8);
    ctx.fillRect(-6, 26, 13, 8);
    ctx.strokeStyle = 'rgba(150,120,80,0.6)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(7, -14);
    ctx.stroke();
    ctx.restore();

    /* 握卷轴的手 */
    ctx.beginPath();
    ctx.ellipse(-44, -158, 10, 12, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d6b189';
    ctx.fill();
  }

  function arm(ctx) {
    /* 右手：从披巾里伸出来，轻轻提着布边 */
    ctx.beginPath();
    ctx.moveTo(26, -212);
    ctx.quadraticCurveTo(46, -178, 40, -142);
    ctx.quadraticCurveTo(38, -124, 30, -122);
    ctx.strokeStyle = '#dcbb92';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(29, -118, 9, 11, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d6b189';
    ctx.fill();
  }

  G.mod.painter('portrait.diotima', function (ctx, prop) {
    const w = (prop && prop.w) || 240;
    const h = (prop && prop.h) || 360;

    /* 地面的一小圈暖光：让人物不像贴在空气里 */
    const g = ctx.createRadialGradient(0, -20, 6, 0, -20, 120);
    g.addColorStop(0, 'rgba(' + GOLD + ',0.22)');
    g.addColorStop(1, 'rgba(' + GOLD + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -18, 96, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -4, 52, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    robe(ctx);
    arm(ctx);
    himation(ctx);
    scroll(ctx);
    head(ctx);

    /* 头顶一点边缘光，和游戏里的金色时刻一致 */
    ctx.beginPath();
    ctx.moveTo(-22, -286);
    ctx.quadraticCurveTo(-4, -306, 20, -286);
    ctx.strokeStyle = 'rgba(' + GOLD + ',0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 画布比画的实际高度略高，留白由 CSS 的 drop-shadow 收住 */
    void w; void h;
  });
})();
