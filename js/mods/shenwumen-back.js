/* ============================================================
   C · 玩法  关 6 的回程点：门不亮，往回走
   ------------------------------------------------------------
   神武门的门认 flag `creator.signed`（御花园签了才亮）。
   没签就走到这儿，地图上会出现这个点：说一句话，把人送回御花园。

   它刻意做得很小 —— 回程不是关卡，是把玩家送回该在的地方。
   地图上的 when 是 { flag: { 'creator.signed': false } }，
   签过字之后这个点自动消失。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  G.mod.puzzle('shenwumen.back', {
    summary: '门不亮时，从这里回御花园',

    open: function (api) {
      api.dialog('puzzles.shenwumen.back.line', function () {
        api.pass({ back: true });
        G.mod.go('creator');
      });
    },
  });
})();
