/* ============================================================
   C · 玩法  关 4：修复台 · 证据配对
   ------------------------------------------------------------
   四条线索，每条两问：
     第一问  这条线索接到哪张来源卡上（或者：留白，盖「未成立」）
     第二问  这条比较，比的是哪一层（功能 / 空间 / 层面越界）

   设计意图（docs/关卡设计-v1.0-落地版.md §4 关 4）：
     · 卡接错   → 直接重来，不问层面（先看对，再想清楚）
     · 层面错   → 桌上多一道折痕（crackCount + 1），可以重来
     · 诱饵留白 → 盖「未成立」印章（stampUnfounded = 1）
   三样痕迹都由 js/art/halls.js 的 hall.bench 画出来，不弹窗。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'repair_bench.evidence';
  const seg = function (k) { return 'puzzles.' + KEY + '.' + k; };
  const CARD_IDS = ['sc_sequence', 'sc_banquet', 'sc_boundary', 'sc_axis'];

  function giveCard(id) {
    if (typeof G.mod.giveCard === 'function') G.mod.giveCard(id);
  }

  G.mod.puzzle(KEY, {
    summary: '四条线索：先接卡，再说清楚比的是哪一层；诱饵必须留白',

    open: function (api) {
      const pz = G.str.puzzle(KEY) || {};
      const clues = pz.clues || [];
      const all = G.str.all('sourceCards') || [];
      const cards = CARD_IDS.map(function (id) {
        for (let k = 0; k < all.length; k += 1) {
          if (all[k] && all[k].id === id) return all[k];
        }
        return null;
      }).filter(Boolean);

      let i = 0;

      function cardOptions() {
        const opts = cards.map(function (c) {
          return { label: c.name || c.id, value: c.id };
        });
        opts.push({ label: pz.blankLabel || '', value: '' });
        return opts;
      }

      function finish() {
        api.dialog(seg('success'), function () {
          api.setVar('evidenceDone', 1);
          giveCard('sc_banquet');
          api.pass({ links: clues.length });
        });
      }

      function next() {
        i += 1;
        round();
      }

      function okBait(c) {
        /* 诱饵答对：留白才算对，盖章，不追层面 */
        api.setVar('stampUnfounded', 1);
        if (typeof G.mod.stamp === 'function') G.mod.stamp('unfounded');
        api.dialog(seg('baitLeftBlank'), next);
        void c;
      }

      function askLayer(c) {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: pz.layerAsk || '',
          options: (pz.layerOptions || []).map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          if (v === c.answerLayer) {
            next();
            return;
          }
          /* 层面错：桌上多一道折痕 */
          api.setVar('crackCount', (api.vars.crackCount || 0) + 1);
          api.dialog(seg('wrongLayer'), function () {
            api.toast(c.explain || G.str.get('ui.toast.wrong'), 'warn');
            round();                      /* 这条重来 */
          });
        });
      }

      function round() {
        if (i >= clues.length) { finish(); return; }
        const c = clues[i];
        const want = c.isBait ? '' : (c.answerCard || '');

        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: c.ask || '',
          options: cardOptions(),
        }, function (v) {
          if (v !== want) {
            const branch = c.isBait ? 'baitLinked' : 'wrongLink';
            api.dialog(seg(branch), function () {
              api.toast(c.explain || G.str.get('ui.toast.wrong'), 'warn');
              round();                    /* 卡没接对，不问层面 */
            });
            return;
          }
          if (c.isBait) { okBait(c); return; }
          askLayer(c);
        });
      }

      api.dialog(seg('open'), round);
    },
  });
})();
