/* Modern Athenian doctoral supervisor. Feet-centered 240 x 360 portrait API. */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;
  G.mod.painter('portrait.diotima', function (ctx, prop) {
    function poly(points, color) {
      ctx.beginPath(); points.forEach(function(p,i){ if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]); });
      ctx.closePath();ctx.fillStyle=color;ctx.fill();
    }
    function ellipse(x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
    ctx.save();
    ellipse(0,-3,43,7,'rgba(0,0,0,.28)');
    /* Separate trouser legs and low, flat shoes. */
    poly([[-32,-145],[-3,-145],[-5,-13],[-31,-13]],'#26303d');
    poly([[3,-145],[32,-145],[34,-13],[8,-13]],'#202936');
    ctx.fillStyle='#414d5c';ctx.fillRect(-26,-135,3,111);ctx.fillRect(12,-135,3,111);
    poly([[-32,-17],[-6,-17],[-4,-3],[-40,-3],[-40,-9]],'#171c24');
    poly([[8,-17],[33,-17],[43,-8],[43,-3],[7,-3]],'#171c24');
    /* Light blouse under a tailored navy blazer. */
    ctx.fillStyle='#d2ac91';ctx.fillRect(-10,-245,20,24);
    poly([[-20,-230],[20,-230],[30,-143],[-29,-143]],'#ebe8df');
    poly([[-13,-229],[-32,-231],[-49,-216],[-40,-137],[-5,-137],[-10,-191]],'#29384d');
    poly([[13,-229],[32,-231],[48,-215],[41,-137],[5,-137],[11,-191]],'#233046');
    poly([[-15,-230],[-29,-214],[-18,-204],[-24,-194],[-6,-165]],'#4c5a6d');
    poly([[15,-230],[28,-214],[18,-204],[24,-194],[6,-165]],'#435268');
    poly([[-10,-231],[0,-218],[-8,-207],[-17,-225]],'#faf7f0');
    poly([[10,-231],[0,-218],[8,-207],[17,-225]],'#faf7f0');
    ctx.fillStyle='#85909a';ctx.fillRect(3,-164,3,3);ctx.fillRect(3,-150,3,3);
    /* Sleeves, research folder and a relaxed hand. */
    poly([[-35,-225],[-48,-216],[-56,-159],[-43,-154],[-31,-204]],'#29384d');
    poly([[35,-225],[48,-215],[54,-166],[41,-161],[29,-204]],'#233046');
    poly([[-58,-190],[-25,-197],[-15,-142],[-50,-135]],'#667d80');
    poly([[-54,-187],[-28,-192],[-27,-186],[-53,-181]],'#d9ded7');
    ctx.strokeStyle='#b4c2bf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-49,-174);ctx.lineTo(-30,-178);ctx.moveTo(-47,-167);ctx.lineTo(-28,-171);ctx.stroke();
    ellipse(-43,-153,8,10,'#d7b295');ellipse(45,-156,7,10,'#d7b295');
    /* Shoulder-length chestnut hair, a few silver strands, mature face. */
    ellipse(0,-274,31,43,'#48352f');
    poly([[-29,-277],[-30,-237],[-18,-231],[-18,-264]],'#48352f');
    poly([[19,-274],[30,-278],[32,-239],[20,-233]],'#48352f');
    ellipse(0,-272,22,30,'#dbb79b');
    poly([[-24,-282],[-20,-301],[0,-311],[24,-298],[25,-280],[10,-292],[-8,-289]],'#584036');
    ctx.strokeStyle='#a99b91';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-299);ctx.lineTo(-24,-282);ctx.moveTo(17,-300);ctx.lineTo(23,-284);ctx.stroke();
    /* Restrained eyes and rectangular spectacles remain legible in map scale. */
    ctx.strokeStyle='#282a30';ctx.lineWidth=2;
    ctx.strokeRect(-19,-280,16,11);ctx.strokeRect(3,-280,16,11);
    ctx.beginPath();ctx.moveTo(-3,-275);ctx.lineTo(3,-275);ctx.stroke();
    ellipse(-11,-274,2,2,'#302723');ellipse(11,-274,2,2,'#302723');
    ctx.strokeStyle='#a57f69';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(1,-270);ctx.lineTo(3,-261);ctx.lineTo(-1,-260);ctx.moveTo(-8,-252);ctx.quadraticCurveTo(0,-248,8,-252);ctx.moveTo(-18,-265);ctx.lineTo(-14,-263);ctx.moveTo(14,-263);ctx.lineTo(18,-265);ctx.stroke();
    ctx.restore();
    void prop;
  });
})();
