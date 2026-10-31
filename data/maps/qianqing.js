/* ============================================================
   A · 美术/关卡  关 3：乾清宫 · 承重实验
   ------------------------------------------------------------
   左边一排石柱（女像柱），右边一排木柱（故宫）。
   玩法在 js/mods/qianqing-loadtest.js：选材料 + 选连接方式 → 加载。
   柱子只是"看得见的材料特性"，判断全在文案里。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'qianqing',

  title: '乾清宫',
  sub: '承重实验',

  size: { w: 640, h: 810 },
  spawn: { x: 320, y: 770 },
  camera: { lookAhead: 44 },
  clock: '10:40',
  ambient: 'palace',
  background: '#151210',

  vars: {
    stoneMethod: '',   /* stone 柱最后用了哪种连接 */
    woodMethod: '',    /* wood 柱最后用了哪种连接 */
    tested: 0,         /* 已经成功的材料数 */
    sag: 0,            /* 0..1 塌陷进度：只作用在 sagSide 那组柱子上 */
    sagSide: '',       /* 'stone' | 'wood' —— 这次塌的是哪一边 */
    crack: 0,          /* 1 = 柱身上留着裂纹（塌过就留，不清零） */
    dust: 0,           /* 1 = 正在起土 */
  },

  ground: [
    { painter: 'hall.court', x: 0, y: 380, w: 640, h: 430, opt: {} },
  ],

  solids: [
    { x: 12, y: 250, w: 616, h: 116 },
  ],

  props: [
    { painter: 'hall.palace', x: 320, baseY: 336, opt: { w: 470, wallH: 32, roofH: 30, nameKey: 'nodes.qianqing.name' } },
    { painter: 'hall.columns', x: 196, baseY: 620, opt: { style: 'stone', n: 3, gap: 46, h: 132 } },
    { painter: 'hall.columns', x: 444, baseY: 620, opt: { style: 'wood', n: 3, gap: 46, h: 132 } },
    { painter: 'hall.rock', x: 88, baseY: 760, opt: { s: 20 } },
    { painter: 'hall.rock', x: 552, baseY: 760, opt: { s: 20 } },
  ],

  lights: [
    { x: 320, y: 470, r: 120, color: '#ffcf86', a: 0.14 },
  ],

  npcs: [],

  spots: [
    {
      id: 'qianqing.loadtest',
      x: 320, y: 700, r: 78,
      labelKey: 'ui.hud.interact',
      puzzle: 'qianqing.loadtest',
      when: { notDone: ['qianqing.loadtest'] },
    },
    {
      id: 'qianqing.look_stone',
      x: 196, y: 640, r: 48,
      labelKey: 'ui.hud.look',
      inspect: 'obj_qianqing_caryatid',
    },
    {
      id: 'qianqing.look_wood',
      x: 444, y: 640, r: 48,
      labelKey: 'ui.hud.look',
      inspect: 'obj_qianqing_woodcol',
    },
  ],

  marker: { x: 320, y: 700, when: { notDone: ['qianqing.loadtest'] } },

  next: 'repair_bench',
});
