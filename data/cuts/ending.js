/* ============================================================
   data/cuts/ending.js —— 结局过场（关 6 通关后自动播）
   ------------------------------------------------------------
   文字：data/script.json 的 cuts.ending.*（r=recall · l=lines · a=afterword）
   立绘：painter 'portrait.diotima'（没画也能播，只是少一张画）
   这段的主题回扣是 v0.3 要求的最后一句，别删：
     "AI 让创作可以天马行空；对传统的理解与敬畏，让想象有值得延续的根。"
   ============================================================ */
G.mod.register({
  kind: 'cutscene',
  id: 'ending',

  steps: [
    { t: 'fade', to: 1, ms: 500, color: '#08070a' },
    { t: 'bars', on: true, ms: 320 },

    /* 先点一下"你修过什么" —— 三样东西，一样比一样难 */
    { t: 'card', key: 'cuts.ending.r0', ms: 2000 },
    { t: 'card', key: 'cuts.ending.r1', ms: 2100 },

    /* 她走进你的作品里 */
    { t: 'portrait', who: 'diotima', on: true, side: 'left', ms: 360 },
    { t: 'card', key: 'cuts.ending.l0', ms: 2200 },
    { t: 'title', key: 'cuts.ending.l1', ms: 2400 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l2', ms: 2200 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l3', ms: 1600 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l4', ms: 2300 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l5', ms: 2600 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l6', ms: 2400 },
    { t: 'card', who: 'diotima', key: 'cuts.ending.l7', ms: 2000 },

    /* 灯亮起来 —— 三句收尾，最后一句是主题 */
    { t: 'clear' },
    { t: 'card', key: 'cuts.ending.a0', ms: 2200 },
    { t: 'card', key: 'cuts.ending.a1', ms: 2200 },
    { t: 'title', key: 'cuts.ending.a2', subKey: 'ui.title.subtitle', ms: 3600 },

    { t: 'bars', on: false, ms: 340 },
    { t: 'fade', to: 0, ms: 700 }
  ]
});
