/* ============================================================
   C · 玩法  关 2「标签归位」之后的保留选择
   ------------------------------------------------------------
   主题里「主动选择保留」这一步，必须是一个操作，不能是一句台词。

   玩家刚刚亲手验证过：从门洞到月台，三段台阶、一次抬头，
   视线是被安排好的。现在问他：这处关系，你要不要写进自己的造境规则。

   三个选项都算通过 —— 这里没有标准答案，也不打分：
   · keep 写进规则（后续关卡与出口会读 keep.steps）
   · note 先记下待核
   · drop 不要（狄奥提玛只提醒一句，不惩罚）

   契约：{ open: function (api) { ... } }
   文案在 data/script.json 的 puzzles["taihe.keep"] 下。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'taihe.keep';

  G.mod.puzzle(KEY, {
    summary: '关 2 收尾：要不要把「走近—抬头」这处空间关系写进造境规则。三项皆可，不打分。',

    open: function (api) {
      const scene = api.scene;

      function repaint() {
        if (scene && scene.repaint) scene.repaint();
      }

      api.dialog('puzzles.' + KEY + '.body', function () {
        api.ask(KEY, function (choice) {
          api.dialog('puzzles.' + KEY + '.outcome.' + choice, function () {
            api.setVar('keepSteps', choice);
            G.save.flag('keep.steps', choice);
            G.save.persist();
            repaint();
            if (choice === 'keep') api.toast(G.str.get('ui.toast.kept'), 'ok');
            api.pass({ choice: choice });
          });
        });
      });
    },
  });
})();
