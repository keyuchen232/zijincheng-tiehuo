/* ============================================================
   C · 玩法  关 3：乾清宫 · 承重实验
   ------------------------------------------------------------
   文案在 puzzles["qianqing.loadtest"]：
     materials[2]  stone（女像柱/大理石）· wood（故宫/木），各带 ask
     methods[3]    tenon 榫卯 · dowel 铅灌铁销 · dry 直接叠压，各带 option
     outcome[material][method] = { ok, lines[] }
     conclusion    第一次成功之后的"不是谁更先进"
     allDone       两种材料都站住之后的收束

   判定完全由 outcome 决定（石吃铅灌/直接叠压，木吃榫卯）。
   失败不是弹窗，是那根柱子真的往下沉、起土、裂开 —— sag / dust / crack
   由 js/art/halls.js 的 hall.columns 读；塌完复位，裂纹留着。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.mod) return;

  const KEY = 'qianqing.loadtest';
  const seg = function (k) { return 'puzzles.' + KEY + '.' + k; };

  function giveCard(id) {
    if (typeof G.mod.giveCard === 'function') G.mod.giveCard(id);
  }

  /* 数据里的 { who, text } 转成 G.dialog.show 认的 { name|narrator, text } */
  function toLines(rows) {
    return (rows || []).map(function (r) {
      if (!r || !r.who || r.who === 'narrator') {
        return { narrator: true, text: (r && r.text) || '' };
      }
      return { name: G.str.who(r.who).name || r.who, text: r.text || '' };
    });
  }

  G.mod.puzzle(KEY, {
    summary: '选材料 + 选连接方式，然后加载；选错那根柱子会先塌给你看',

    open: function (api) {
      const pz = G.str.puzzle(KEY) || {};
      const mats = pz.materials || [];
      const mets = pz.methods || [];
      let i = 0;
      let told = false;
      let sagRun = 0;
      function stopSag() { sagRun += 1; api.setVar('sag', 0); api.setVar('dust', 0); }

      /* 塌陷：四档下沉 + 起土，1.8 秒后复位，裂纹留在柱身上 */
      function sag(material) {
        stopSag();
        const run = sagRun;
        api.setVar('sagSide', material);
        api.setVar(material === 'wood' ? 'crackWood' : 'crackStone', 1);
        [0.25, 0.5, 0.75, 1].forEach(function (v, k) {
          setTimeout(function () {
            if (run !== sagRun) return;
            api.setVar('sag', v);
            api.setVar('dust', 1);
          }, k * 150);
        });
        setTimeout(function () {
          if (run !== sagRun) return;
          api.setVar('sag', 0);
          api.setVar('dust', 0);
          api.setVar('crack', 1);
        }, 1800);
      }

      function finish() {
        G.dialog.show(toLines(pz.allDone), function () {
          api.setVar('tested', mats.length);
          giveCard('sc_boundary');
          api.pass({ stone: api.vars.stoneMethod || '', wood: api.vars.woodMethod || '' });
        });
      }

      function advance() {
        i += 1;
        api.setVar('tested', i);
        round();
      }

      function round() {
        if (i >= mats.length) { finish(); return; }
        const m = mats[i];
        const opts = mets.map(function (mt) {
          return { label: mt.option || mt.label || mt.id, value: mt.id };
        });

        G.dialog.ask({
          name: G.str.who('diotima').name,
          text: m.ask || '',
          options: opts,
        }, function (v) {
          const oc = ((pz.outcome || {})[m.id] || {})[v];
          if (!oc) { round(); return; }

          stopSag();
          api.setVar('sagSide', '');
          if (!oc.ok) sag(m.id);
          else api.setVar(m.id === 'wood' ? 'woodMethod' : 'stoneMethod', v);
          G.dialog.show(toLines(oc.lines), function () {
            if (!oc.ok) {
              api.toast(G.str.get(seg('hint')), 'warn');
              round();                       /* 塌了再来，不 pass */
              return;
            }
            api.setVar(m.id === 'wood' ? 'woodMethod' : 'stoneMethod', v);
            if (!told && (pz.conclusion || []).length) {
              told = true;
              G.dialog.show(toLines(pz.conclusion), advance);
              return;
            }
            advance();
          });
        });
      }

      G.dialog.show(toLines(pz.open), round);
    },
  });
})();
