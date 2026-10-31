/* ============================================================
   A · 美术/关卡  关 4：修复台（来源判断 → 结尾反转）
   ------------------------------------------------------------
   这一关有两个玩法：
     repair_bench.evidence  三条线索各接一张来源卡（有一条要留白）
     repair_bench.relic     R-07 待处置：系统判它是"错误混入"（反转）

   第二个交互点在 evidence 做完之后才出现（when.done），
   因为反转要建立在"你会看来源了"之后 —— 顺序就是意义。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'repair_bench',

  title: '修复台',
  sub: '来源判断',

  size: { w: 640, h: 890 },
  spawn: { x: 320, y: 848 },
  camera: { lookAhead: 42 },
  clock: '11:50',
  ambient: 'palace',
  background: '#120f0d',

  vars: {
    evidenceDone: 0,     /* 三条线索接完 = 1 */
    verdictR07: '',      /* 空 = 未判 · fusion = 改判历史融合 · stripped/erased = 错判 */
    crackCount: 0,       /* 层面说错一次 = 桌上多一道折痕（0..4） */
    stampUnfounded: 0,   /* 1 = 盖过「未成立」—— 诱饵留白留对了 */
  },

  ground: [
    { painter: 'hall.court', x: 0, y: 380, w: 640, h: 510, opt: {} },
  ],

  solids: [
    { x: 12, y: 300, w: 616, h: 96 },
  ],

  props: [
    { painter: 'hall.palace', x: 320, baseY: 392, opt: { w: 380, wallH: 26, roofH: 24, nameKey: 'nodes.repair_bench.name' } },
    { painter: 'hall.bench', x: 320, baseY: 800, opt: { w: 300 } },
    { painter: 'wumen.lantern', x: 86, baseY: 660, opt: {} },
    { painter: 'hall.relic', x: 566, baseY: 830, opt: { s: 18 } },
    { painter: 'hall.bench', x: 96, baseY: 430, opt: {} },
    { painter: 'hall.bench', x: 544, baseY: 430, opt: {} },
    { painter: 'hall.trees', x: 70, baseY: 520, opt: { n: 2 } },
    { painter: 'hall.trees', x: 570, baseY: 520, opt: { n: 2 } },
    { painter: 'wumen.lantern', x: 96, baseY: 470, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 470, opt: {} },
  ],

  lights: [
    { x: 320, y: 740, r: 130, color: '#ffcf86', a: 0.20 },
    { x: 86, y: 640, r: 60, color: '#ffcf86', a: 0.16 },
  ],

  npcs: [],

  spots: [
    {
      id: 'repair_bench.evidence',
      x: 320, y: 800, r: 86,
      labelKey: 'ui.hud.interact',
      puzzle: 'repair_bench.evidence',
      when: { notDone: ['repair_bench.evidence'] },
    },
    {
      /* 反转：R-07 那件带外来构件的钟。要先会看来源，才轮到它。 */
      id: 'repair_bench.relic',
      x: 468, y: 838, r: 62,
      labelKey: 'ui.hud.interact',
      puzzle: 'repair_bench.relic',
      when: { done: ['repair_bench.evidence'] },
    },
    {
      id: 'bench.look_cards',
      x: 190, y: 762, r: 44,
      labelKey: 'ui.hud.look',
      inspect: 'obj_bench_cards',
    },
    {
      id: 'bench.look_stamp',
      x: 248, y: 786, r: 40,
      labelKey: 'ui.hud.look',
      inspect: 'obj_bench_stamp',
    },
    {
      id: 'bench.look_clock',
      x: 566, y: 780, r: 46,
      labelKey: 'ui.hud.look',
      inspect: 'obj_bench_clock',
    },
  ],

  marker: { x: 320, y: 800, when: { notDone: ['repair_bench.evidence'] } },

  next: 'creator',
});
