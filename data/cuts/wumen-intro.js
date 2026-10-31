/* ============================================================
   data/cuts/wumen-intro.js —— 进入午门关之前的过场
   ------------------------------------------------------------
   演示「过场怎么用三方的产物」：
   · 文字  ← B：data/script.json 里的 cuts.wumen_intro.* / nodes.wumen.enter.*
   · 立绘  ← A：js/art/*.js 里登记的 painter 'portrait.diotima'
              （没画也不崩，引擎会跳过去，只是少一张画）
   · 节奏  ← C：就是这个 steps 数组
   ============================================================ */
G.mod.register({
  kind: 'cutscene',
  id: 'wumen.intro',

  steps: [
    { t: 'fade', to: 1, ms: 420, color: '#08070a' },
    { t: 'bars', on: true, ms: 300 },

    /* 她先开口，然后才看得见她 */
    { t: 'card', key: 'cuts.wumen_intro.0', ms: 1500 },
    { t: 'portrait', who: 'diotima', on: true, side: 'left', ms: 340 },
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.1', ms: 2400 },

    /* 地上那层灰绿的线，肉眼可见地对不上 */
    { t: 'shake', ms: 260, amp: 4 },
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.2', ms: 2600 },

    /* 玩家自己的一句：短、轻、别抢戏 */
    { t: 'card', who: 'player', key: 'cuts.wumen_intro.3', ms: 1800 },

    { t: 'clear' },
    { t: 'bars', on: false, ms: 320 },
    { t: 'fade', to: 0, ms: 520 }
  ]
});
