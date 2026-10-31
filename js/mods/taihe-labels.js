/* ============================================================
   C · 玩法  关 2：太和殿月台 · 三块说明牌归位
   ------------------------------------------------------------
   文案全在 data/script.json 的 puzzles["taihe.labels"]：
     plaques[3]   每块自带 ask（问句）与 options（挪 / 留）
                  p1/p2 是被盖错位置的外来标签，p3 是故宫自己的、不该动
     glitchLine   第一次误标之后的那句"标签乱了"
     wrongPlaced  挪错之后的对话
     success      归位之后的收束

   判定：q.correct 的牌子要"挪"，不 correct 的牌子要"留"。
   选错 → 画面出现乱码痕迹（labelGlitch=1，且不清零）→ 可以重试。
   这一关考的是看，不是猜；带着乱码也能通关，只是看得见自己错过。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'taihe.labels';
  const seg = function (k) { return 'puzzles.' + KEY + '.' + k; };

  function giveCard(id) {
    if (typeof G.mod.giveCard === 'function') G.mod.giveCard(id);
  }

  G.mod.puzzle(KEY, {
    summary: '三块说明牌：该挪的挪，该留的留；挪错会在画面上留下乱码',

    open: function (api) {
      const pz = G.str.puzzle(KEY) || {};
      const plaques = pz.plaques || [];
      let i = 0;
      let glitched = !!api.vars.labelGlitch;

      function finish() {
        api.dialog(seg('success'), function () {
          api.setVar('labelsDone', plaques.length);
          giveCard('sc_sequence');
          api.pass({ labels: plaques.length, glitched: glitched });
        });
      }

      function step() {
        if (i >= plaques.length) { finish(); return; }
        const q = plaques[i];
        const opts = (q.options || []).map(function (o) {
          return { label: o.label || o.id, value: o.id };
        });

        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: q.ask || '',
          options: opts,
        }, function (v) {
          const ok = q.correct ? v === 'move' : v === 'stay';
          if (ok) {
            i += 1;
            api.setVar('labelsDone', i);
            step();
            return;
          }

          /* 误标：痕迹留在世界里，不扣分，但不清零 */
          const first = !glitched;
          glitched = true;
          api.setVar('labelGlitch', 1);
          if (api.scene && api.scene.repaint) api.scene.repaint();
          api.dialog(seg('wrongPlaced'), function () {
            if (first) {
              api.dialog(seg('glitchLine'), function () {
                api.toast(G.str.get(seg('wrongHint')), 'warn');
                step();
              });
              return;
            }
            api.toast(G.str.get(seg('wrongHint')), 'warn');
            step();
          });
        });
      }

      api.dialog(seg('open'), function () {
        api.dialog(seg('layerReveal'), step);
      });
    },
  });
})();
