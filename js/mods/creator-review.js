/* ============================================================
   C · 玩法  关 5：御花园 · 审一份方案
   ------------------------------------------------------------
   流程（docs/关卡设计-v1.0-落地版.md §4 关 5）：
     1 先选保留哪条关系（keepWhat）—— 这一步定了规则，方案才有对错
     2 方案按 keepWhat 取变体：puzzles["creator.review"].plans[i]
       每份方案自带一处违规，且看起来都挺合理
     3 指出哪一件有问题 → 说清是哪一类违规 → 选改法
       删掉 / 算我个人 会被拒（那是在抹掉证据，不是修正）
     4 签字：planSigned=1，并落下 creator.signed 这道跨场景的 flag
        —— 神武门认的是它，不是你嘴上说的

   文案全在 data/script.json，脚本里只做判断。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'creator.review';
  const base = 'puzzles.' + KEY + '.';
  const seg = function (k) { return base + k; };

  function giveCard(id) {
    if (typeof G.mod.giveCard === 'function') G.mod.giveCard(id);
  }

  G.mod.puzzle(KEY, {
    summary: '先定规则，再审方案：找出那处违规，说清类型，再选改法',

    open: function (api) {
      const pz = G.str.puzzle(KEY) || {};
      const keepOptions = pz.keepOptions || [];
      const plans = pz.plans || [];
      const violations = pz.violations || [];
      const fixOptions = pz.fixOptions || [];
      const tags = pz.tagLabels || {};
      const fmt = pz.fmt || {};

      let plan = null;

      function tagName(tag) { return tags[tag] || tag; }

      /* 方案正文：数据里的 fmt 模板 + placements 逐行拼出来 */
      function planText() {
        const head = G.str.get(seg('fmt.title'), {
          title: plan.title || '',
          oneLine: plan.oneLine || '',
        });
        const rows = (plan.placements || []).map(function (p) {
          return G.str.get(seg('fmt.placement'), {
            label: p.label || p.componentId || '',
            tag: tagName(p.tag),
          });
        });
        const why = G.str.get(seg('fmt.why'), { why: plan.why || '' });
        return [head].concat(rows).concat([why]).join('\n');
      }

      function finish(signed) {
        api.setVar('planSigned', signed ? 1 : 0);
        if (signed) {
          G.save.flag('creator.signed', true);
          if (G.save && G.save.persist) G.save.persist();
          api.toast(G.str.get('ui.toast.signed'), 'ok');
        } else {
          api.toast(G.str.get('ui.toast.notSigned'), 'warn');
        }
        api.pass({ keepWhat: api.vars.keepWhat || '', signed: !!signed });
      }

      function fix() {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: pz.fixPrompt || '',
          options: fixOptions.map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          if (v === 'drop' || v === 'self') {
            /* 删掉 / 算我个人：不是修正，是抹掉证据 */
            api.dialog(seg('wrongFix'), function () { fix(); });
            return;
          }
          api.dialog(seg('rightAccuse'), function () {
            api.dialog(seg('keepNote'), function () {
              giveCard('sc_kore');
              finish(true);
            });
          });
        });
      }

      function type() {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: pz.typePrompt || '',
          options: violations.map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          if (v !== plan.wrongType) {
            api.dialog(seg('wrongType'), function () { type(); });
            return;
          }
          fix();
        });
      }

      function accuse() {
        const opts = (plan.placements || []).map(function (p) {
          return { label: p.label || p.componentId || '', value: p.slot };
        });
        opts.push({ label: pz.noProblemLabel || '', value: '' });

        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: (pz.accusePrompt || '') + '\n' + planText(),
          options: opts,
        }, function (v) {
          if (!v) {
            /* 全签了：可以继续，但门不会认 */
            api.dialog(seg('noProblem'), function () { finish(false); });
            return;
          }
          if (v !== plan.wrongSlot) {
            api.dialog(seg('wrongAccuse'), function () { accuse(); });
            return;
          }
          type();
        });
      }

      function planStep() {
        const keepWhat = api.vars.keepWhat || '';
        plan = null;
        for (let k = 0; k < plans.length; k += 1) {
          if (plans[k] && plans[k].keepWhat === keepWhat) { plan = plans[k]; break; }
        }
        if (!plan) plan = plans[0];
        api.dialog(seg('prompt'), accuse);
      }

      function keepStep() {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: pz.keepPrompt || '',
          options: keepOptions.map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          api.setVar('keepWhat', v);
          api.dialog(seg('keepLines.' + v), planStep);
        });
      }

      api.dialog(seg('open'), keepStep);
    },
  });
})();
