#!/usr/bin/env node
/* ============================================================
   六关玩法走查（纯 node，不需要浏览器）
   ------------------------------------------------------------
   为什么有这个文件：
   本机跑不起 CDP（沙箱挡命名管道，见 docs/冲刺4小时.md），
   但玩法的"对不对"不能靠肉眼。所以这里搭一个假的 DOM 壳：
     · 真的加载 js/str.js（读 data/script.json）
     · 真的加载 js/mod.js（复用它的 api / pass / done / test）
     · 真的加载 data/maps/*.js 与 js/mods/*.js
     · 只把 G.dialog / G.ui / G.save / G.scene 换成记账版
   然后按"玩家会怎么答"把每一关的每条分支跑一遍。

   它证明的是：数据键齐、判定分支对、vars/flag 按设计落下、
   通关与失败不会互相干扰。
   它不证明：画面好看、手感、真实浏览器里的输入。

   用法：node tools/level-sim.mjs
   ============================================================ */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import vm from 'node:vm';

const root = resolve(process.cwd());
const read = (rel) => readFileSync(resolve(root, rel), 'utf8');
const SCRIPT = JSON.parse(read('data/script.json'));

const MODS = readdirSync(resolve(root, 'js/mods')).filter((f) => f.endsWith('.js') && f !== 'title-stage.js');
const MAPS = readdirSync(resolve(root, 'data/maps')).filter((f) => f.endsWith('.js'));

/* 所有 world 报出来的问题（模块加载错、openSpot 抛错、答案没用完）汇总在这里，
   最后一条断言检查它为空 —— 不能只查"刚新建、零交互"的那个 world。 */
const allProblems = [];

/* ---------------- 一次干净的世界 ---------------- */
function makeWorld() {
  const state = {
    lines: [],          /* 所有显示过的对白/文本 */
    options: [],        /* 所有选项按钮文字 */
    toasts: [],
    texts: [],          /* G.text 画过的所有字符串 */
    answers: [],        /* 预先排好的答案队列 */
    passes: [],
    goes: [],           /* G.mod.go 被调用的目标地图 */
    fails: [],
    flags: Object.create(null),
    problems: [],
  };

  const sandbox = Object.create(null);
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.console = {
    log() {},
    warn(m) { state.problems.push(String(m)); },
    error(m) { state.problems.push(String(m)); },
  };
  /* 玩法里的"塌一下再回来"用 setTimeout 写：这里直接同步跑完，结果才可断言 */
  sandbox.setTimeout = (fn) => { if (typeof fn === 'function') fn(); return 0; };
  sandbox.clearTimeout = () => {};
  sandbox.document = {
    readyState: 'complete',
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  sandbox.window.WXL_SCRIPT = SCRIPT;

  vm.createContext(sandbox);
  const run = (rel) => vm.runInContext(read(rel), sandbox, { filename: rel });

  /* 记账用的 G 支撑件（先于 mod.js 装好，mod.js 只用到调用期） */
  const G = sandbox;
  G.G = undefined;

  run('js/str.js');
  run('js/mod.js');

  const g = sandbox.G;
  g.save = {
    data: { flags: state.flags },
    flag(k, v) {
      if (v === undefined) return !!state.flags[k];
      state.flags[k] = !!v;
      return !!v;
    },
    persist() {},
  };
  g.ui = {
    toast(text, kind) { state.toasts.push({ text: String(text), kind: kind || '' }); },
    location() {},
    objective() {},
  };
  const push = (s) => { state.lines.push(String(s)); };
  g.dialog = {
    show(lines, done) {
      (lines || []).forEach((l) => push((l && (l.text || l.sub)) || ''));
      if (done) done();
    },
    ask(spec, cb) {
      const o = spec || {};
      push(o.text || '');
      const opts = o.options || [];
      opts.forEach((x) => state.options.push(String((x && x.label) || '')));
      if (!state.answers.length) {
        throw new Error('答案用完了：' + (o.text || '').slice(0, 40));
      }
      cb(state.answers.shift());
    },
  };
  g.scene = null;
  g.overlayDepth = 0;
  g.StageScene = undefined;

  /* 画文字的真实实现走 canvas；这里只记账，用来断言"画面上没有未填的占位符" */
  g.text = function (ctx, s) { state.texts.push(String(s)); };

  /* G.mod.go 在真实环境里会 new G.StageScene(...)，这里没有渲染器：
     换成只记账的版本，断言就能看到"有没有被送回上一关"。 */
  g.mod.go = function (mapId) { state.goes.push(mapId); };

  MAPS.forEach((f) => run('data/maps/' + f));
  MODS.forEach((f) => run('js/mods/' + f));

  /* 加载期的问题（模块抛错、warn）现在就算账 */
  state.problems.forEach((p) => allProblems.push('加载：' + p));

  return { sandbox, g, state };
}

/* ---------------- 跑一段交互 ---------------- */
function play(world, mapId, spotId, answers, opts) {
  const { g, state } = world;
  opts = opts || {};
  const map = g.mod.get('map', mapId);
  if (!map) throw new Error('没有这张地图：' + mapId);
  const spot = (map.spots || []).filter((s) => s.id === spotId)[0];
  if (!spot) throw new Error(mapId + ' 里没有这个交互点：' + spotId);

  const scene = {
    map,
    vars: Object.assign({}, opts.vars || (opts.scene && opts.scene.vars) || map.vars),
    screenPainters: [],
    repaint() {},
    onSpotSolved(s, result) { state.passes.push({ spot: s.id, result: result || {} }); },
  };
  if (opts.signed) state.flags['creator.signed'] = true;
  state.answers = answers.slice();
  state.lines = [];
  state.options = [];
  const before = state.problems.length;
  try {
    g.mod.openSpot(spot, scene);
  } catch (e) {
    state.problems.push('openSpot 抛错：' + e.message);
  }
  if (state.answers.length) {
    state.problems.push(spotId + '：还有 ' + state.answers.length + ' 个答案没用上（分支没走到）');
  }
  state.problems.slice(before).forEach((p) => allProblems.push(mapId + '/' + p));
  return scene;
}

/* ---------------- 断言 ---------------- */
let failed = 0;
const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  if (!cond) failed += 1;
}
function noMissing(world, name) {
  const bad = world.state.lines
    .concat(world.state.options)
    .concat(world.state.toasts.map((t) => t.text))
    .filter((s) => s.indexOf('⟪') >= 0);
  check(name + ' · 没有缺文案（⟪key⟫）', bad.length === 0, bad.slice(0, 3).join(' | '));
}

/* ============================================================
   关 1 · 午门：选原点
   ============================================================ */
{
  const w = makeWorld();
  const sc = play(w, 'wumen', 'wumen.origin', ['A']);
  check('关1 · 选 A 通过', w.state.passes.length === 1 && w.state.passes[0].spot === 'wumen.origin');
  check('关1 · 选 A 后 gridDx=0', sc.vars.gridDx === 0, 'gridDx=' + sc.vars.gridDx);
  check('关1 · 选 A 后两套网格都不偏', sc.vars.gridBoth === 0 && !sc.vars.seamShift);
  check('关1 · 发第一张来源卡 sc_axis', w.state.flags['card.sc_axis'] === true);
  noMissing(w, '关1/A');
}
{
  const w = makeWorld();
  const sc = play(w, 'wumen', 'wumen.origin', ['B']);
  check('关1 · 选 B 不通过，画面回到选之前', sc.vars.gridDx === 18 && sc.vars.gridBoth === 0 && w.state.passes.length === 0,
    'gridDx=' + sc.vars.gridDx + ' gridBoth=' + sc.vars.gridBoth + ' pass=' + w.state.passes.length);
  const sc2 = play(w, 'wumen', 'wumen.origin', ['A']);
  check('关1 · 选 B 之后还能重选 A 过关', w.state.passes.length === 1 && sc2.vars.gridDx === 0);
  noMissing(w, '关1/B');
}
{
  const w = makeWorld();
  const sc = play(w, 'wumen', 'wumen.origin', ['C', 'seam']);
  check('关1 · 选 C 但读对了砖缝 → 通过', w.state.passes.length === 1);
  check('关1 · 选 C 留下痕迹 seamShift/nailShift', sc.vars.seamShift === 1 && sc.vars.nailShift === 1);
  check('关1 · 选 C 后故宫被拖走 gridBoth=-18', sc.vars.gridBoth === -18, 'gridBoth=' + sc.vars.gridBoth);
  noMissing(w, '关1/C 对');
}
{
  const w = makeWorld();
  const sc = play(w, 'wumen', 'wumen.origin', ['C', 'ok']);
  check('关1 · 选 C 读错 → 复位未对齐、不通过', sc.vars.gridDx === 18 && !sc.vars.seamShift && !sc.vars.nailShift && w.state.passes.length === 0,
    JSON.stringify({ dx: sc.vars.gridDx, seam: sc.vars.seamShift, nail: sc.vars.nailShift }));
  const sc2 = play(w, 'wumen', 'wumen.origin', ['A']);
  check('关1 · 复位后重选 A 才通过', w.state.passes.length === 1 && w.state.passes[0].result.choice === 'A', 'pass=' + w.state.passes.length);
  noMissing(w, '关1/C 错');
}

/* ============================================================
   关 2 · 太和殿：三块牌子归位
   ============================================================ */
const plaques = (SCRIPT.puzzles['taihe.labels'] || {}).plaques || [];
const goodLabels = plaques.map((q) => (q.correct ? 'move' : 'stay'));
const badFirst = plaques.map((q) => (q.correct ? 'stay' : 'move'));
{
  const w = makeWorld();
  const sc = play(w, 'taihe', 'taihe.labels', goodLabels);
  check('关2 · 三块都对 → 通过', w.state.passes.length === 1);
  check('关2 · labelsDone 记满', sc.vars.labelsDone === plaques.length, 'labelsDone=' + sc.vars.labelsDone);
  check('关2 · 没有乱码痕迹', !sc.vars.labelGlitch);
  check('关2 · 发 sc_sequence', w.state.flags['card.sc_sequence'] === true);
  noMissing(w, '关2/全对');
}
{
  const w = makeWorld();
  const sc = play(w, 'taihe', 'taihe.labels', [badFirst[0]].concat(goodLabels));
  check('关2 · 挪错一块 → 留下乱码痕迹', sc.vars.labelGlitch === 1);
  check('关2 · 挪错之后还能接着通关', w.state.passes.length === 1);
  noMissing(w, '关2/挪错');
}

/* ============================================================
   关 3 · 乾清宫：承重实验
   ============================================================ */
const lt = SCRIPT.puzzles['qianqing.loadtest'] || {};
const mats = lt.materials || [];
const methods = lt.methods || [];
const okMethod = (matId) => {
  const row = (lt.outcome || {})[matId] || {};
  for (let i = 0; i < methods.length; i += 1) {
    if (row[methods[i].id] && row[methods[i].id].ok) return methods[i].id;
  }
  return null;
};
const badMethod = (matId) => {
  const row = (lt.outcome || {})[matId] || {};
  for (let i = 0; i < methods.length; i += 1) {
    if (row[methods[i].id] && !row[methods[i].id].ok) return methods[i].id;
  }
  return null;
};
{
  const w = makeWorld();
  const answers = mats.map((m) => okMethod(m.id));
  const sc = play(w, 'qianqing', 'qianqing.loadtest', answers);
  check('关3 · 两种材料都用对的连接 → 通过', w.state.passes.length === 1);
  check('关3 · tested 记满', sc.vars.tested === mats.length, 'tested=' + sc.vars.tested);
  check('关3 · 没有塌过（不复位）', sc.vars.sag === 0 && sc.vars.crack === 0,
    'sag=' + sc.vars.sag + ' crack=' + sc.vars.crack);
  check('关3 · 发 sc_boundary', w.state.flags['card.sc_boundary'] === true);
  noMissing(w, '关3/全对');
}
{
  const w = makeWorld();
  const first = mats[0].id;
  const answers = [badMethod(first), okMethod(first)].concat(
    mats.slice(1).map((m) => okMethod(m.id)),
  );
  const sc = play(w, 'qianqing', 'qianqing.loadtest', answers);
  check('关3 · 塌过一次 → 柱上留裂纹', sc.vars.crack === 1, 'crack=' + sc.vars.crack);
  check('关3 · 塌完复位（sag 归零、不残留土）', sc.vars.sag === 0 && sc.vars.dust === 0);
  check('关3 · 塌过也还能通关', w.state.passes.length === 1);
  noMissing(w, '关3/塌');
}

/* ============================================================
   关 4 · 修复台：线索 → 来源卡 → 层面
   ============================================================ */
const ev = SCRIPT.puzzles['repair_bench.evidence'] || {};
const clues = ev.clues || [];
const answerFor = (c) => (c.isBait ? [''] : [c.answerCard, c.answerLayer]);
const evAnswers = [].concat(...clues.map(answerFor));
{
  const w = makeWorld();
  const sc = play(w, 'repair_bench', 'repair_bench.evidence', evAnswers.slice());
  check('关4 · 全部接对 → 通过', w.state.passes.length === 1);
  check('关4 · evidenceDone=1', sc.vars.evidenceDone === 1);
  check('关4 · 诱饵留白 → 盖「未成立」', sc.vars.stampUnfounded === 1 && w.state.flags['stamp.unfounded'] === true);
  check('关4 · 层面没出错 → 桌上没有折痕', sc.vars.crackCount === 0, 'crackCount=' + sc.vars.crackCount);
  check('关4 · 发 sc_banquet', w.state.flags['card.sc_banquet'] === true);
  noMissing(w, '关4/全对');
}
{
  /* 第一条非诱饵线索：卡接对、层面说错 */
  const idx = clues.findIndex((c) => !c.isBait);
  const right = clues[idx];
  const wrongLayer = (ev.layerOptions || []).filter((o) => o.id !== right.answerLayer)[0];
  const answers = [right.answerCard, wrongLayer.id, right.answerCard, right.answerLayer]
    .concat(evAnswers.slice(2));
  const w = makeWorld();
  const sc = play(w, 'repair_bench', 'repair_bench.evidence', answers);
  check('关4 · 层面说错一次 → 桌上多一道折痕', sc.vars.crackCount === 1, 'crackCount=' + sc.vars.crackCount);
  check('关4 · 层面说错也还能接对通关', w.state.passes.length === 1);
  noMissing(w, '关4/层面错');
}
{
  /* 诱饵被硬接上：应该拒绝，然后改留白 */
  const baitIdx = clues.findIndex((c) => c.isBait);
  const answers = [];
  clues.forEach((c, i) => {
    if (i === baitIdx) {
      answers.push(c.answerCard);   /* 错：把诱饵接上 */
      answers.push('');             /* 改留白 */
      return;
    }
    answerFor(c).forEach((a) => answers.push(a));
  });
  const w = makeWorld();
  const sc = play(w, 'repair_bench', 'repair_bench.evidence', answers);
  check('关4 · 把诱饵接上会被拒，改留白才过', sc.vars.stampUnfounded === 1 && w.state.passes.length === 1);
  noMissing(w, '关4/诱饵');
}
{
  const w = makeWorld();
  const sc = play(w, 'repair_bench', 'repair_bench.relic', ['B']);
  check('关4 · R-07 改判成历史融合才算通过', sc.vars.verdictR07 === 'fusion', 'verdictR07=' + sc.vars.verdictR07);
  check('关4 · 判定落地一次', w.state.passes.length === 1);
  noMissing(w, '关4/R-07');
}

/* ============================================================
   关 5 · 御花园：审方案
   ============================================================ */
const cr = SCRIPT.puzzles['creator.review'] || {};
const plans = cr.plans || [];
const planG = plans.filter((p) => p.keepWhat === 'gugong_axis')[0];
{
  const w = makeWorld();
  const sc = play(w, 'creator', 'creator.review',
    ['gugong_axis', planG.wrongSlot, planG.wrongType, 'retag']);
  check('关5 · 指出正确的件+类型+改法 → 签字', sc.vars.planSigned === 1, 'planSigned=' + sc.vars.planSigned);
  check('关5 · 落下跨场景 flag creator.signed', w.state.flags['creator.signed'] === true);
  check('关5 · 通过', w.state.passes.length === 1);
  noMissing(w, '关5/签字');
}
{
  const w = makeWorld();
  const sc = play(w, 'creator', 'creator.review', ['gugong_axis', '']);
  check('关5 · 「都没问题」也能继续，但不算签字', w.state.passes.length === 1 && sc.vars.planSigned === 0);
  check('关5 · 没签字就不设 creator.signed', !w.state.flags['creator.signed']);
  noMissing(w, '关5/没签');
}
{
  const w = makeWorld();
  const sc = play(w, 'creator', 'creator.review',
    ['gugong_axis', planG.wrongSlot, planG.wrongType, 'drop', 'retag']);
  check('关5 · 选「删掉」被拒，改标签才过', sc.vars.planSigned === 1 && w.state.flags['creator.signed'] === true);
  noMissing(w, '关5/删掉被拒');
}
{
  const planA = plans.filter((p) => p.keepWhat === 'acropolis_axis')[0];
  const w = makeWorld();
  const sc = play(w, 'creator', 'creator.review',
    ['acropolis_axis', planA.wrongSlot, planA.wrongType, 'retag']);
  check('关5 · 换成卫城正面，方案跟着换一份', w.state.passes.length === 1 && sc.vars.keepWhat === 'acropolis_axis');
  noMissing(w, '关5/卫城');
}

/* ============================================================
   关 6 · 神武门：门认的是签字
   ============================================================ */
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.verify', []);
  check('关6 · 没签字 → 门不亮、也不进入配对', w.state.passes.length === 0 && sc.vars.doorLit === 0);
  noMissing(w, '关6/没签');
}
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.verify', [], { signed: true });
  check('关6 · 签了但线索没看全 → 拒绝配对', w.state.passes.length === 0);
  noMissing(w, '关6/没看线索');
}
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.verify',
    ['match', 'go', 'said', 'said', 'said'], { signed: true, vars: { doorLit: 0, clueARead: 1, clueBRead: 1 } });
  check('关6 · 配对成功 → 门亮', sc.vars.doorLit === 1, 'doorLit=' + sc.vars.doorLit);
  check('关6 · 三句话记下来', sc.vars.saidBorrow && sc.vars.saidKeep && sc.vars.saidNew);
  check('关6 · 通过', w.state.passes.length === 1);
  noMissing(w, '关6/出门');
}
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.verify',
    ['match', 'go', 'todo', 'todo', 'todo'], { signed: true, vars: { doorLit: 0, clueARead: 1, clueBRead: 1 } });
  check('关6 · 三句都答「还没想好」也算说清了', w.state.passes.length === 1 && sc.vars.saidBorrow === 'todo');
  noMissing(w, '关6/还没想好');
}
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.clue_a', []);
  check('关6 · 看过线索 → clueARead=1', sc.vars.clueARead === 1);
  noMissing(w, '关6/线索A');
}
{
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.clue_b', []);
  check('关6 · 看过线索 B → clueBRead=1', sc.vars.clueBRead === 1);
  noMissing(w, '关6/线索B');
}
{
  /* 没签字时门边有回程点：它不该挡住"该关的通关"（optional），
     但会真的把人送回御花园。 */
  const w = makeWorld();
  const sc = play(w, 'shenwumen', 'shenwumen.back', []);
  check('关6 · 回程点记成通过', w.state.passes.length === 1 && w.state.passes[0].result.back === true);
  check('关6 · 回程点把人送回御花园', w.state.goes.indexOf('creator') >= 0, w.state.goes.join(','));
  noMissing(w, '关6/回程');
}

/* ============================================================
   关 2 · 图层石（optional：可踩可跳，不挡通关）
   ============================================================ */
{
  const w = makeWorld();
  const sc = play(w, 'taihe', 'taihe.layer.stones', []);
  check('关2 · 踩石作层 → layerStones 翻转成 1', sc.vars.layerStones === 1, 'layerStones=' + sc.vars.layerStones);
  const sc2 = play(w, 'taihe', 'taihe.layer.stones', [], { scene: sc });
  check('关2 · 再踩一脚 → 关掉', sc2.vars.layerStones === 0, 'layerStones=' + sc2.vars.layerStones);
  noMissing(w, '关2/图层石');
}

/* ============================================================
   关 2 · 保留关系（taihe.keep：三个选项都该能过、都该落下 keepSteps）
   ============================================================ */
{
  const keepOutcome = (SCRIPT.puzzles['taihe.keep'] || {}).outcome || {};
  const keepIds = Object.keys(keepOutcome);
  check('关2 · 保留关系有三个选项', keepIds.length === 3, keepIds.join(','));
  keepIds.forEach((choiceId) => {
    const w = makeWorld();
    const sc = play(w, 'taihe', 'taihe.keep', [choiceId]);
    check('关2 · 保留关系选 ' + choiceId + ' → 通过', w.state.passes.length === 1);
    check('关2 · 保留关系选 ' + choiceId + ' → keepSteps 记下', sc.vars.keepSteps === choiceId,
      'keepSteps=' + sc.vars.keepSteps);
    noMissing(w, '关2/keep/' + choiceId);
  });
}

/* ============================================================
   结局：校准记录卡（占位符必须都填上，否则画面上会出现 {n}）
   ============================================================ */
{
  const w = makeWorld();
  const noop = function () {};
  const ctx = {
    save: noop, restore: noop, beginPath: noop, moveTo: noop, lineTo: noop,
    stroke: noop, fillRect: noop, strokeRect: noop, fillText: noop,
    globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
  };
  const scene = { w: 640, h: 900, vars: {}, screenPainters: [], repaint: noop, map: {} };
  w.state.texts = [];
  w.g.mod.openRecord();
  w.g.mod.paint('journal.record', ctx, {}, scene);
  const bad = w.state.texts.filter((s) => s.indexOf('{') >= 0 || s.indexOf('⟪') >= 0);
  check('结局记录卡画得出来（没有未填占位符）', bad.length === 0, bad.join(' | '));
  check('结局记录卡记上了走过几关', w.state.texts.some((s) => /\/\s*6/.test(s)),
    w.state.texts.slice(0, 4).join(' | '));
}

/* ============================================================
   全关卡：缺模块 / 缺文案
   ============================================================ */
{
  const w = makeWorld();
  const maps = w.g.mod.list('map');
  check('六张地图都在', maps.length === 6, maps.join(','));
  const puzzles = w.g.mod.list('puzzle');
  const need = [
    'wumen.registration', 'taihe.labels', 'taihe.keep', 'taihe.layer.stones',
    'qianqing.loadtest', 'repair_bench.evidence', 'repair_bench.relic',
    'creator.review', 'shenwumen.verify', 'shenwumen.back',
    'shenwumen.clue_a', 'shenwumen.clue_b',
  ];
  const lost = need.filter((id) => puzzles.indexOf(id) < 0);
  check('玩法都登记了', lost.length === 0, lost.join(','));
  /* 全流程所有 world 报出来的问题（不再是"刚新建那个 world 的 problems"） */
  check('全程没有模块报错', allProblems.length === 0, allProblems.slice(0, 4).join(' | '));
}

/* ---------------- 报告 ---------------- */
const bad = results.filter((r) => !r.ok);
results.forEach((r) => {
  console.log((r.ok ? '✓ ' : '✗ ') + r.name + (r.ok || !r.detail ? '' : '   ← ' + r.detail));
});
console.log('');
if (bad.length) {
  console.log('✗ 关卡走查未通过：' + bad.length + ' / ' + results.length + ' 条断言失败');
  process.exit(1);
}
console.log('✓ 关卡走查通过（' + results.length + ' 条断言）—— 关卡走查只覆盖玩法逻辑与数据键，不含画面与手感');
