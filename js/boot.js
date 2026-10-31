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

  /* 演示快线（docs/关卡设计-v1.0-落地版.md §6）：
       ?demo=1  关 1 → 关 3 → 关 4 → 关 5 → 结局   （约 6–6.5 分钟）
       ?demo=2  关 1 → 关 4 → 关 5 → 结局          （约 4 分钟）
     做法是把被跳过的关卡：①把他们下面的交互点标成已完成，
     ②把上一关的 next 直接接到下一关。
     不改数据文件、不动 stage.js 的通关判定 —— 只是换一条走法。 */
  function applyDemo() {
    var G = window.G;
    if (!G || typeof URLSearchParams !== 'function') return;
    var demo = new URLSearchParams(window.location.search).get('demo');
    if (demo !== '1' && demo !== '2') return;

    var mapOf = function (id) { return G.mod.get('map', id); };
    var done = function (id) { G.mod.done(id); };

    /* 关 2 在两条演示线里都跳过 */
    done('taihe.labels');
    done('taihe.keep');
    var taihe = mapOf('taihe');
    var target = demo === '1' ? 'qianqing' : 'repair_bench';
    if (taihe) taihe.next = target;

    /* 关键：通关判定只在 spot 被解决时触发（js/stage.js 的 onSpotSolved），
       进场不判。所以只把关 2 的 spot 标成 done 是不够的 —— 玩家打完关 1
       仍会被 wumen.next 送进关 2，而关 2 的必过关点因为 when.notDone 已经
       消失，整关没有可解的点，演示线就卡在那里。
       于是把上一关也标成"已完成"，并把它的 next 直接接到目标关。 */
    done('wumen');
    var wumen = mapOf('wumen');
    if (wumen) wumen.next = target;

    /* ?demo=2 还要跳过关 3 */
    if (demo === '2') {
      done('qianqing.loadtest');
      var qianqing = mapOf('qianqing');
      if (qianqing) qianqing.next = 'repair_bench';
    }

    if (window.console) console.log('[boot] 演示快线 ?demo=' + demo);
  }

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
      applyDemo();
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
