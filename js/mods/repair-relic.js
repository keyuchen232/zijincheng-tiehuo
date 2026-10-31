/* ============================================================
   C · 玩法  关 4「修复台 · 反转」
   ------------------------------------------------------------
   这段是主题落点，不是彩蛋：

   系统把一件带外来机械构件的真实藏品判成「错误混入」。
   玩家手里有三样东西：能指认的外来部分、能指认的本土部分、
   能指认的改造关系。判定权在玩家，不在系统。

   · 选 B（改判：有据可查的历史融合，保留全件）= 对
   · 选 A（拆掉外来件）= 把交流当成污染
   · 选 C（删掉外来说明）= 把吸收藏起来，同一种错
     A / C 都不 pass，可以重来 —— 但错误分支的台词必须先播完，
     否则玩家会以为这题只是点错了按钮。

   契约与其他玩法模块一致：{ open: function (api) { ... } }
   文案全部在 data/script.json 的 puzzles.repair_bench.relic 下。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'repair_bench.relic';
  const P = 'puzzles.' + KEY;

  function hints() {
    const pz = G.str.puzzle(KEY) || {};
    return pz.hints || [];
  }

  G.mod.puzzle(KEY, {
    summary: '关 4 反转：系统判「错误混入」，玩家改判为「有据可查的历史融合」。选错可重来。',

    open: function (api) {
      const scene = api.scene;

      /* 判定改过之后，画面要跟着变（由 A 的画笔读 scene.vars.verdictR07） */
      function repaint() {
        if (scene && scene.repaint) scene.repaint();
      }

      function ask() {
        api.ask(KEY, function (choice) {
          if (choice === 'B') {
            api.dialog(P + '.outcome.B', function () {
              api.dialog(P + '.afterRight', function () {
                api.setVar('verdictR07', 'fusion');
                G.save.flag('judged.R07', 'fusion');
                G.save.flag('card.sc_guangzhong', true);
                G.save.persist();
                repaint();
                api.toast(G.str.get('ui.toast.judged'), 'ok');
                api.pass({ choice: 'B', verdict: 'fusion' });
              });
            });
            return;
          }

          /* A / C：都是错判，播完各自的后果再给一次机会 */
          api.setVar('verdictR07', choice === 'A' ? 'stripped' : 'erased');
          repaint();
          api.dialog(P + '.outcome.' + choice, function () {
            api.setVar('verdictR07', '');
            repaint();
            const h = hints();
            api.toast(h[0] || G.str.get('ui.toast.wrong'), 'warn');
            ask();
          });
        });
      }

      /* 开场：系统的判决 → 三条可指认的依据 → 玩家开口 */
      api.dialog(P + '.systemLines', function () {
        api.dialog(P + '.deepen', ask);
      });
    },
  });
})();
