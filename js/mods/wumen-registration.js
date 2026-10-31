/* ============================================================
   C · 玩法  关 1「原点之争」
   ------------------------------------------------------------
   玩法模块的契约只有一条：
       { open: function (api) { ... } }
   然后从 api 里拿一切，不许 require、不许改别的文件。

   这个关卡的教学点：
   · 选 A（午门门洞中心）= 故宫不动，投影平移过去 —— 对
   · 选 B / C = 为了"看起来对齐"，让故宫挪了 —— 错
   视觉后果由 A 的画笔读 scene.vars 表现，C 只管改变量。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'wumen.registration';

  G.mod.puzzle(KEY, {
    summary: '关 1：三选一选原点。选错会让故宫网格被拖走；可重试。',

    open: function (api) {
      const scene = api.scene;

      /* 一次问答。选项文案全部来自 script.json，本文件没有一个汉字。 */
      api.ask(KEY, function (choice) {
        const outcome = 'puzzles.' + KEY + '.outcome.' + choice;

        if (choice === 'A') {
          /* 对齐：只有投影移过去，故宫一格不动 */
          api.setVar('gridDx', 0);
          if (scene && scene.repaint) scene.repaint();
          api.dialog(outcome, function () {
            api.pass({ choice: choice, dx: 0 });
          });
          return;
        }

        /* 选错：两套网格被一起拖动 —— 故宫被挪了，但看起来"更齐" */
        api.setVar('gridBoth', 18);
        if (scene && scene.repaint) scene.repaint();
        api.dialog(outcome, function () {
          api.setVar('gridBoth', 0);
          if (scene && scene.repaint) scene.repaint();
          api.toast(G.str.get('ui.toast.again'), 'warn');
          /* 不调 pass：交互点仍然存在，可以再来一次 */
        });
      });
    },
  });
})();
