/* ============================================================
   data/cuts/opening.js —— 开场动画
   ------------------------------------------------------------
   什么时候播：G.mod.boot() 发现这段没看过，就在标题页播一次。
   想重看：清存档，或控制台 G.save.flag('cut.opening', false)。
   想改节奏：只改 steps 里的 ms 和顺序，不用碰任何渲染代码。
   ============================================================ */
G.mod.register({
  kind: 'cutscene',
  id: 'opening',

  steps: [
    /* 1. 起：把标题画面压暗（不是纯黑，能看见云与城），缓推镜头 + 黑边 */
    { t: 'fade', to: 0.45, ms: 0, color: '#08070a' },
    { t: 'zoom', v: 1.05, ms: 2200 },
    { t: 'bars', on: true, ms: 400 },
    { t: 'wait', ms: 200 },

    /* 2. 第一口气：把这个世界的一句话讲完 */
    { t: 'card', key: 'cuts.opening.0', ms: 1500 },
    { t: 'wait', ms: 120 },
    { t: 'card', key: 'cuts.opening.1', ms: 1600 },
    { t: 'wait', ms: 120 },
    { t: 'card', key: 'cuts.opening.2', ms: 1600 },

    /* 3. 错位的一瞬：震屏 + 白闪 + 一行系统错报 */
    { t: 'shake', ms: 260, amp: 6 },
    { t: 'flash', color: '#dfe7ea', ms: 180 },
    { t: 'card', key: 'cuts.opening.3', subKey: 'cuts.opening.3sub', ms: 1500 },

    /* 4. 收：亮出标题 */
    { t: 'clear' },
    { t: 'wait', ms: 200 },
    { t: 'title', key: 'cuts.opening.title', subKey: 'cuts.opening.sub', ms: 1800 },

    /* 5. 光进来，黑边退场 */
    { t: 'bars', on: false, ms: 400 },
    { t: 'fade', to: 0, ms: 500 },
    { t: 'wait', ms: 200 }
  ]
});
