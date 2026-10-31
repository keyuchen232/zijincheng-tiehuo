/* ============================================================
   A · 美术/关卡  关 5：御花园 · 创作终端（共同造境）
   ------------------------------------------------------------
   玩法 creator.review 审的是"AI 给的方案里，哪一件的来源写错了"。
   注意它不打分：三项选择（保留 / 记下 / 放弃）都算通过，
   这里只负责把终端摆出来，让玩家有地方动手。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'creator',

  title: '御花园',
  sub: '共同造境',

  size: { w: 640, h: 930 },
  spawn: { x: 320, y: 890 },
  camera: { lookAhead: 42 },
  clock: '13:20',
  ambient: 'palace',
  background: '#141110',

  vars: {
    planSigned: 0,      /* 方案签过字 = 1 */
    keepWhat: '',       /* 玩家说"我要留住的那一条" */
  },

  ground: [
    { painter: 'hall.court', x: 0, y: 380, w: 640, h: 550, opt: {} },
  ],

  solids: [
    { x: 12, y: 250, w: 616, h: 90 },
  ],

  props: [
    { painter: 'hall.palace', x: 320, baseY: 336, opt: { w: 330, wallH: 22, roofH: 20, nameKey: 'nodes.creator.pavilion' } },
    { painter: 'hall.trees', x: 140, baseY: 640, opt: { n: 2, size: 56 } },
    { painter: 'hall.trees', x: 516, baseY: 668, opt: { n: 2, size: 52 } },
    { painter: 'hall.terminal', x: 320, baseY: 700, opt: {} },
    { painter: 'hall.rock', x: 470, baseY: 860, opt: { s: 24 } },
    { painter: 'hall.rock', x: 168, baseY: 880, opt: { s: 18 } },
    { painter: 'hall.trees', x: 70, baseY: 460, opt: { n: 2 } },
    { painter: 'hall.trees', x: 570, baseY: 460, opt: { n: 2 } },
    { painter: 'hall.bench', x: 140, baseY: 540, opt: {} },
    { painter: 'hall.bench', x: 500, baseY: 540, opt: {} },
    { painter: 'wumen.lantern', x: 96, baseY: 500, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 500, opt: {} },
  ],

  lights: [
    { x: 320, y: 640, r: 120, color: '#9fd6e0', a: 0.16 },
  ],

  npcs: [],

  spots: [
    {
      /* 没签字就一直开着：没签的方案，神武门不认，得回来重签 */
      id: 'creator.review',
      x: 320, y: 700, r: 90,
      labelKey: 'ui.hud.interact',
      puzzle: 'creator.review',
      when: { flag: { 'creator.signed': false } },
    },
    {
      id: 'creator.look_terminal',
      x: 196, y: 720, r: 46,
      labelKey: 'ui.hud.look',
      inspect: 'obj_creator_terminal',
    },
    {
      id: 'creator.look_guide',
      x: 452, y: 744, r: 46,
      labelKey: 'ui.hud.look',
      inspect: 'obj_creator_guide',
    },
  ],

  marker: { x: 320, y: 700, when: { notDone: ['creator.review'] } },

  next: 'shenwumen',
});
