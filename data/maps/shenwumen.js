/* ============================================================
   A · 美术/关卡  关 6：神武门 · 规则化失败（出口只认你写的规则）
   ------------------------------------------------------------
   玩法 shenwumen.verify：
     配对两条线索 → 门亮 → 出门之前说清三件事（借鉴 / 保留 / 新造）
   通关后播 exitCut 'ending'，然后停在这里（next: null）。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'shenwumen',

  title: '神武门',
  sub: '出口',

  size: { w: 640, h: 690 },
  spawn: { x: 320, y: 650 },
  camera: { lookAhead: 46 },
  clock: '16:40',
  ambient: 'palace',
  background: '#171310',

  vars: {
    doorLit: 0,          /* 门亮了没有 */
    clueARead: 0,        /* 檐下那组斗拱看过了 */
    clueBRead: 0,        /* 柱廊第六位少女看过了 */
    saidBorrow: '',      /* 我借鉴了什么 */
    saidKeep: '',        /* 我保留了什么 */
    saidNew: '',         /* 我新造了什么 */
  },

  ground: [
    { painter: 'hall.marble', x: 0, y: 380, w: 640, h: 310, opt: {} },
  ],

  solids: [
    { x: 12, y: 260, w: 616, h: 130 },
  ],

  props: [
    { painter: 'hall.door', x: 320, baseY: 420, opt: { w: 620, wallH: 74, roofH: 40, arches: 3, nameKey: 'nodes.shenwumen.name' } },
    { painter: 'wumen.plaque', x: 320, baseY: 268, opt: { textKey: 'nodes.shenwumen.plaque' } },
    { painter: 'wumen.lantern', x: 96, baseY: 520, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 520, opt: {} },
    /* 两处线索：看过之后自己会亮，没看过是暗的 */
    { painter: 'hall.clue', x: 176, baseY: 534, opt: { read: 'a' } },
    { painter: 'hall.clue', x: 464, baseY: 534, opt: { read: 'b' } },
    { painter: 'hall.trees', x: 66, baseY: 470, opt: { n: 2 } },
    { painter: 'hall.trees', x: 574, baseY: 470, opt: { n: 2 } },
    { painter: 'hall.rock', x: 110, baseY: 560, opt: { s: 1.1 } },
    { painter: 'hall.rock', x: 530, baseY: 560, opt: { s: 1.1 } },
    { painter: 'wumen.lantern', x: 92, baseY: 500, opt: {} },
    { painter: 'wumen.lantern', x: 548, baseY: 500, opt: {} },
  ],

  lights: [
    { x: 96, y: 500, r: 68, color: '#ffcf86', a: 0.20 },
    { x: 544, y: 500, r: 68, color: '#ffcf86', a: 0.20 },
  ],

  npcs: [],

  spots: [
    {
      id: 'shenwumen.verify',
      x: 320, y: 500, r: 78,
      labelKey: 'ui.hud.interact',
      puzzle: 'shenwumen.verify',
      when: { notDone: ['shenwumen.verify'] },
    },
    {
      /* 门不亮就回头：这个点只在「方案没签」时出现 */
      id: 'shenwumen.back',
      x: 320, y: 640, r: 40,
      labelKey: 'ui.hud.interact',
      puzzle: 'shenwumen.back',
      optional: true,
      when: { flag: { 'creator.signed': false } },
    },
    {
      id: 'shenwumen.clue_a',
      x: 176, y: 520, r: 40,
      labelKey: 'ui.hud.clue',
      labelObj: 'obj_shenwumen_clue_a',
      puzzle: 'shenwumen.clue_a',
      when: { notDone: ['shenwumen.clue_a'] },
    },
    {
      id: 'shenwumen.clue_b',
      x: 464, y: 520, r: 40,
      labelKey: 'ui.hud.clue',
      labelObj: 'obj_shenwumen_clue_b',
      puzzle: 'shenwumen.clue_b',
      when: { notDone: ['shenwumen.clue_b'] },
    },
    {
      id: 'shenwumen.look_door',
      x: 512, y: 470, r: 44,
      labelKey: 'ui.hud.look',
      inspect: 'obj_shenwumen_door',
    },
  ],

  marker: { x: 320, y: 500, when: { notDone: ['shenwumen.verify'] } },

  exitCut: 'ending',
  next: null,
});
