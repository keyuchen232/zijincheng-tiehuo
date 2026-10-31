/* ============================================================
   C · 玩法  关 1「原点之争」
   ------------------------------------------------------------
   契约只有一条：{ open: function (api) { ... } }
   然后从 api 里拿一切，不许 require、不许改别的文件。
   本文件不出现任何中文：所有玩家可见文字都来自 data/script.json。

   三段动作（对应 docs/关卡设计-v1.0-落地版.md §4 关 1）：
     1 看    两套网格叠在一起，先不动它
     2 选原点 A / B / C
     3 后果   A 通过；B 故宫被整体拖走；C 看起来最整齐，但要过第二问

   视觉后果全部由 A 的画笔读 scene.vars 表现，这里只管改变量。
   ground 层的画笔要 repaint() 才会重画，props 层每帧重画。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'wumen.registration';
  const seg = function (k) { return 'puzzles.' + KEY + '.' + k; };

  /* 来源卡：journal.js 提供了 G.mod.giveCard，没有就跳过（不阻塞通关） */
  function giveCard(id) {
    if (typeof G.mod.giveCard === 'function') G.mod.giveCard(id);
  }

  /* 把 vars 写回"未校准"的初始状态，并重烘焙 ground 层 */
  function realign(api, dx) {
    api.setVar('gridDx', dx);
    api.setVar('gridBoth', 0);
    api.setVar('seamShift', 0);
    api.setVar('nailShift', 0);
    api.setVar('terraceGap', 0);
    if (api.scene && api.scene.repaint) api.scene.repaint();
  }

  G.mod.puzzle(KEY, {
    summary: '关 1：三选一选原点。选错会让故宫被拖走；可重试。',

    open: function (api) {
      const scene = api.scene;
      if (scene) scene.screenPainters = ['wumen.silent'];

      /* 静帧：压暗画面 1.2 秒，逼玩家先看，再问 */
      function silent(then) {
        api.setVar('view', 'silent');
        setTimeout(function () {
          api.setVar('view', '');
          then();
        }, 1200);
      }

      function askSeam() {
        const seam = G.str.puzzle(KEY).seam || {};
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: seam.prompt || '',
          options: (seam.options || []).map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          if (v === 'seam') {
            api.dialog(seg('seam.right'), function () {
              giveCard('sc_axis');
              api.pass({ choice: 'C', via: 'seam' });
            });
            return;
          }
          /* 答错：退回未对齐，可以重选，不重复发卡 */
          api.dialog(seg('seam.wrong'), function () {
            realign(api, 18);
            api.toast(G.str.get('ui.toast.again'), 'warn');
          });
        });
      }

      function choose() {
        api.ask(KEY, function (choice) {
          const outcome = seg('outcome.' + choice);

          if (choice === 'A') {
            realign(api, 0);
            api.dialog(outcome, function () {
              giveCard('sc_axis');
              api.pass({ choice: 'A', dx: 0 });
            });
            return;
          }

          if (choice === 'B') {
            /* 两套一起滑：故宫被挪了，砖缝乱了 */
            api.setVar('gridDx', 18);
            api.setVar('gridBoth', 14);
            api.setVar('terraceGap', 1);
            if (scene && scene.repaint) scene.repaint();
            api.dialog(outcome, function () {
              realign(api, 18);
              api.toast(G.str.get('ui.toast.again'), 'warn');
            });
            return;
          }

          /* C：网格严丝合缝，但故宫整体被拖走 */
          api.setVar('gridDx', 0);
          api.setVar('gridBoth', -18);
          api.setVar('seamShift', 1);
          api.setVar('nailShift', 1);
          if (scene && scene.repaint) scene.repaint();
          api.dialog(outcome, function () {
            silent(askSeam);
          });
        });
      }

      api.dialog(seg('open'), choose);
    },
  });
})();
