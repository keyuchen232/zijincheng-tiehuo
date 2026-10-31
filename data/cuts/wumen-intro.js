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
    { t: 'fade', to: 1, ms: 320, color: '#08070a' },
    { t: 'bars', on: true, ms: 240 },

    /* 她先开口，然后才看得见她 */
    { t: 'card', key: 'cuts.wumen_intro.0', ms: 900 },
    { t: 'portrait', who: 'diotima', on: true, side: 'left', ms: 240 },
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.1', ms: 1400 },

    /* 地上那层灰绿的线，肉眼可见地对不上 */
    { t: 'shake', ms: 220, amp: 4 },
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.2', ms: 2200 },

    /* 玩家自己的一句：短、轻、别抢戏 */
    { t: 'card', who: 'player', key: 'cuts.wumen_intro.3', ms: 1100 },

    /* 她收尾：先把「这不是错」说清楚，否则玩家会把「分开」当成正确答案。
       这两句是主题的支点（见 docs/冲刺4小时.md §1），别删。 */
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.4', ms: 1300 },
    { t: 'card', who: 'diotima', key: 'cuts.wumen_intro.5', ms: 1400 },

    { t: 'clear' },
    { t: 'bars', on: false, ms: 320 },
    { t: 'fade', to: 0, ms: 420 }
  ]
});
