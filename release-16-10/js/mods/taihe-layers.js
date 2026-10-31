/* ============================================================
   C · 玩法  关 2 的三个图层石
   ------------------------------------------------------------
   三块石头分别管一层：石作 / 图像 / 标签。
   踩上去就是开或关 —— 没有对错，只有看见看不见。

   这三个 spot 在地图上标了 optional: true，所以不挡通关（P1 才强制）。
   每块石头的文案在 puzzles["taihe.layer.<id>"] 的 on / off 里。

   vars 命名：图层石 id 'stones' → layerStones，'images' → layerImages，
   'labels' → layerLabels。画笔（js/art/halls.js）读的就是这三个。

   为什么三次登记写成字面量、不用 forEach 拼 id：
   tools/check-modules.mjs 是静态对账，它只认 `G.mod.puzzle('字面量'`；
   循环里拼出来的 id 会被判成「地图引用了未登记的玩法」。
   宁可多写两行，也不让对账工具失灵。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const PREFIX = 'taihe.layer.';

  /* id: 地图 spot 用的名字 · varName: 对应的 scene.vars 键 · labelIndex: 取哪一层的中文名 */
  function layerSpec(id, varName, labelIndex) {
    return {
      summary: '关 2 图层石：' + id,

      open: function (api) {
        const on = !api.vars[varName];
        api.setVar(varName, on ? 1 : 0);
        if (api.scene && api.scene.repaint) api.scene.repaint();

        const pz = G.str.puzzle('taihe.labels') || {};
        const layer = (pz.layers || [])[labelIndex] || {};
        api.toast(G.str.get(on ? 'ui.toast.layerOn' : 'ui.toast.layerOff', {
          layer: layer.label || '',
        }), on ? 'ok' : '');

        api.dialog('puzzles.' + PREFIX + id + '.' + (on ? 'on' : 'off'), function () {
          api.pass({ layer: id, on: on });
        });
      },
    };
  }

  G.mod.puzzle('taihe.layer.stones', layerSpec('stones', 'layerStones', 0));
  G.mod.puzzle('taihe.layer.images', layerSpec('images', 'layerImages', 1));
  G.mod.puzzle('taihe.layer.labels', layerSpec('labels', 'layerLabels', 2));
})();
