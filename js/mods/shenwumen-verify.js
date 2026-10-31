/* ============================================================
   C · 玩法  关 6：神武门 · 出门之前
   ------------------------------------------------------------
   这里有两道门禁，都不是弹窗，是"门亮不亮"：

     1 方案签没签字  —— 读的是跨场景的 flag `creator.signed`
        （御花园写、神武门读；没签就回御花园，地图上留了 back 点）
     2 两处线索看没看 —— 读 clueARead / clueBRead
        没看全就配对，她会直接拒绝：凭印象配出来的撑不住一扇门

   配对 → 门亮（doorLit=1，由 hall.door 画出来）→ 三句话。
   三句话不打分：说清楚就行，"我还没想好"也是一种说法。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'shenwumen.verify';
  const seg = function (k) { return 'puzzles.' + KEY + '.' + k; };
  const VARS_FOR = { borrow: 'saidBorrow', keep: 'saidKeep', new: 'saidNew' };

  function toLines(rows) {
    return (rows || []).map(function (r) {
      if (!r || !r.who || r.who === 'narrator') {
        return { narrator: true, text: (r && r.text) || '' };
      }
      return { name: G.str.who(r.who).name || r.who, text: r.text || '' };
    });
  }

  G.mod.puzzle(KEY, {
    summary: '门认三样东西：签过字的方案、看全的线索、说得清的三句话',

    open: function (api) {
      const pz = G.str.puzzle(KEY) || {};
      const show = pz.showcase || {};
      const items = show.items || [];

      function signed() {
        return !!(G.save && G.save.flag && G.save.flag('creator.signed'));
      }

      function showcase() {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: show.prompt || '',
          options: [{ label: show.goLabel || '', value: 'go' }],
        }, function () { say(0); });
      }

      function say(i) {
        if (i >= items.length) {
          G.dialog.show(toLines(show.done), function () {
            api.pass({ said: items.length, keepWhat: api.vars.keepWhat || '' });
          });
          return;
        }
        const it = items[i];
        const ask = G.str.get(seg('showcase.askFmt'), { label: it.label || '' });
        G.dialog.ask({
          name: G.str.who('player').name || 'player',
          text: ask,
          options: [
            { label: it.example || '', value: 'said' },
            { label: show.todoLabel || '', value: 'todo' },
          ],
        }, function (v) {
          api.setVar(VARS_FOR[it.id] || ('said_' + it.id), v === 'said' ? (it.example || '') : 'todo');
          say(i + 1);
        });
      }

      function pair() {
        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: G.str.get(seg('clueFmt'), {
            a: (pz.clueA && pz.clueA.text) || '',
            b: (pz.clueB && pz.clueB.text) || '',
          }),
          options: (pz.matchOptions || []).map(function (o) {
            return { label: o.label || o.id, value: o.id };
          }),
        }, function (v) {
          if (v !== 'match') {
            api.dialog(seg('matchWrong'), function () { pair(); });
            return;
          }
          api.dialog(seg('matchCorrect'), function () {
            api.setVar('doorLit', 1);
            if (api.scene && api.scene.repaint) api.scene.repaint();
            api.dialog(seg('doorOpen'), showcase);
          });
        });
      }

      if (!signed()) {
        api.setVar('doorLit', 0);
        api.dialog(seg('doorDark'));
        return;
      }
      if (!api.vars.clueARead || !api.vars.clueBRead) {
        api.dialog(seg('needClues'));
        return;
      }

      api.dialog(seg('open'), pair);
    },
  });

  /* ---------------- 两处线索 ----------------
     看的时候顺手把 vars.clueXRead 打开：画笔（hall.clue）会从暗变亮，
     配对的地方也据此判断"你到底看没看过"。
     两次登记写成字面量：tools/check-modules.mjs 只认字面量 id。 */
  function clueSpec(varName, obj) {
    return {
      summary: '关 6 的线索：看完记在 vars 上',

      open: function (api) {
        const o = G.mod.object(obj) || {};
        const lines = [];
        if (o.desc) lines.push({ narrator: true, text: o.desc });
        (o.interact || []).forEach(function (row) {
          if (!row.who || row.who === 'narrator') lines.push({ narrator: true, text: row.text });
          else lines.push({ name: G.str.who(row.who).name || row.who, text: row.text });
        });

        api.setVar(varName, 1);
        if (api.scene && api.scene.repaint) api.scene.repaint();
        G.dialog.show(lines, function () {
          api.pass({ clue: obj });
        });
      },
    };
  }

  G.mod.puzzle('shenwumen.clue_a', clueSpec('clueARead', 'obj_shenwumen_clue_a'));
  G.mod.puzzle('shenwumen.clue_b', clueSpec('clueBRead', 'obj_shenwumen_clue_b'));
})();
