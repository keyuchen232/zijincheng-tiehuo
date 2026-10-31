/* ============================================================
   A · 美术/关卡  创造模式：造境台（中西合璧）
   ------------------------------------------------------------
   两张展台分列左右：左边三件中式（红墙 / 金瓦殿 / 月洞门），
   右边三件希式（多立克柱廊 / 三角山墙 / 女像柱廊）。
   中央是空的造境台 —— 玩法把玩家选的件排上去（scene.vars.picked）。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'create',
  title: '造境台',
  sub: '中西合璧',

  size: { w: 640, h: 1120 },
  spawn: { x: 320, y: 1010 },
  camera: { lookAhead: 34 },
  clock: '∞',
  ambient: 'palace',
  background: '#171310',

  vars: {
    picked: [],
    blend: 0,
    harmony: false,
  },

  ground: [
    { painter: 'create.plaza', x: 0, y: 0, w: 640, h: 1120, opt: {} },
  ],

  solids: [
    { x: 0, y: 0, w: 640, h: 20 },
    { x: 0, y: 1086, w: 640, h: 34 },
    { x: 0, y: 0, w: 20, h: 1120 },
    { x: 620, y: 0, w: 20, h: 1120 },
    /* 两侧展台 */
    { x: 24, y: 250, w: 176, h: 720 },
    { x: 440, y: 250, w: 176, h: 720 },
  ],

  props: [
    /* 左侧展台：中式 */
    { painter: 'create.piece', x: 112, baseY: 420, opt: { kind: 'cn.wall' } },
    { painter: 'create.piece', x: 112, baseY: 620, opt: { kind: 'cn.hall' } },
    { painter: 'create.piece', x: 112, baseY: 820, opt: { kind: 'cn.gate' } },
    /* 右侧展台：希式 */
    { painter: 'create.piece', x: 528, baseY: 420, opt: { kind: 'gr.colonnade' } },
    { painter: 'create.piece', x: 528, baseY: 620, opt: { kind: 'gr.pediment' } },
    { painter: 'create.piece', x: 528, baseY: 820, opt: { kind: 'gr.caryatid' } },
    /* 中央造境台 */
    { painter: 'create.stage', x: 320, baseY: 866, opt: {} },
    /* 匾与灯 */
    { painter: 'create.plaque', x: 320, baseY: 196, opt: { text: '造 境 台' } },
    { painter: 'create.lantern', x: 236, baseY: 960, opt: {} },
    { painter: 'create.lantern', x: 404, baseY: 960, opt: {} },
  ],

  lights: [
    { x: 236, y: 940, r: 60, color: '#ffcf86', a: 0.2 },
    { x: 404, y: 940, r: 60, color: '#ffcf86', a: 0.2 },
    { x: 320, y: 840, r: 90, color: '#ffd79a', a: 0.16 },
  ],

  npcs: [],

  spots: [
    {
      id: 'create.stage',
      x: 320, y: 930, r: 92,
      label: '走到造境台前 · 挑选构件',
      puzzle: 'create.pick',
    },
    {
      id: 'create.note',
      x: 320, y: 1080, r: 34,
      label: '看造境台说明',
      puzzle: 'create.readme',
    },
  ],
});
