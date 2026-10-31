/* ============================================================
   万象灵境 — 模块化接线入口（boot）

   这个文件存在的唯一目的：让「模块化」这套东西不需要改动
   js/main.js 就能启动。

   之前是在 js/main.js 的 title.init() 后面插一行 G.mod.boot()，
   但 upstream/main 已经把 main.js 大改了 400 多行，那一行会变成
   合并冲突。现在改成在 index.html 末尾多加载一个文件，
   js/main.js 保持和 upstream 完全一致 —— 零冲突。

   加载顺序（见 index.html 末尾）：
     js/str.js  js/mod.js  js/stage.js  js/cut.js
     js/art/*.js  data/maps/*.js
     js/mods/*.js  data/cuts/*.js
     → js/boot.js ← 最后一行

   G.mod.boot() 自己会做：
     1. 等文案表 data/script.json 就绪；
     2. 自检所有「地图 / 画笔 / 玩法 / 过场 / 文案」的引用是否齐全；
     3. 无参数时：若存在 cutscene.opening 且没看过，就播开场动画；
     4. ?map=wumen 直接进关（跳过开场）；
     5. ?cut=opening 只播过场，便于单独审片。
   ============================================================ */
(function () {
  'use strict';

  function start() {
    var G = window.G;
    if (!G) {
      console.error('[boot] window.G 不存在：js/core.js 没加载？');
      return;
    }
    if (!G.mod || typeof G.mod.boot !== 'function') {
      // 没有 js/mod.js 时不要报错，让旧线（打铁花 / 雅典）照常运行
      console.warn('[boot] 没有 G.mod.boot()，跳过模块化启动；旧线不受影响。');
      return;
    }
    try {
      G.mod.boot();
    } catch (err) {
      // 模块化出问题不能拖垮整个游戏：打一行红字，回到旧标题页
      console.error('[boot] G.mod.boot() 失败：', err);
    }
  }

  // window.load 在所有 <script> 执行完、main.js 的 init 也跑完之后触发。
  if (document.readyState === 'complete') {
    setTimeout(start, 0);
  } else {
    window.addEventListener('load', start, { once: true });
  }
})();
