/* ============================================================
   A · 美术/关卡  示例地图：午门（关 1 · 原点之争）
   ------------------------------------------------------------
   这份文件就是「地图」的全部定义：尺寸、出生点、碰撞、
   摆件坐标、交互点坐标、灯光、镜头。
   画笔在 js/art/wumen.js，玩法在 js/mods/wumen-registration.js。

   分工铁律：
     · 本文件只被 A 改
     · 里面的 painter 名字必须和 js/art/wumen.js 里登记的一致
     · 里面的 puzzle  名字必须和 js/mods/*.js   里登记的一致
     · C 想改画面，只能改 scene.vars（见下方 vars），不能改这里的坐标

   坐标约定：x 为水平（0=左），y 为纵向（0=最上，越大越靠南/越靠近镜头）。
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'wumen',

  /* 无 script.json 时的兜底显示名 */
  title: '午门',
  sub: '原点之争',
  enterTip: '向北走到午门门洞前，按 E 查看叠印的网格',

  /* 进场过场（C 在 data/cuts/wumen-intro.js 里排练）。
     写了这一行，进场就不播 nodes.wumen.enter 的对话了，改播过场。 */
  enterCut: 'wumen.intro',

  size: { w: 640, h: 750 },
  spawn: { x: 320, y: 710 },
  camera: { lookAhead: 46 },
  clock: '08:30',
  ambient: 'palace',
  background: '#171310',

  /* 给 C 的初始变量。画笔读它们，玩法改它们 —— 这是美术与玩法的唯一接口。 */
  vars: {
    gridDx: 18,      /* 卫城投影网格相对故宫网格的错位（像素）。0 = 已对齐 */
    gridBoth: 0,     /* 选错原点时，两套网格一起被拖走的距离 */
    seamShift: 0,    /* 1 = 中轴砖缝被拖歪，横缝左右错位（关 1 选 C 的痕迹） */
    nailShift: 0,    /* 1 = 门钉间距被拉开（同一处痕迹，另一处证据） */
    terraceGap: 0,   /* 1 = 月台与殿身之间裂开四像素（关 1 选 B 的痕迹） */
    view: '',        /* 'silent' = 压暗静帧，逼玩家先看清楚再动手 */
  },

  /* ---------- 地面（烘焙到离屏画布，不参与每帧排序）---------- */
  ground: [
    { painter: 'wumen.plaza', x: 0, y: 430, w: 640, h: 320, opt: {} },
    { painter: 'wumen.grid', x: 0, y: 0, w: 640, h: 750, opt: {} },
  ],

  /* ---------- 碰撞 ---------- */
  solids: [
    { x: 12, y: 262, w: 616, h: 148 },   /* 城门墙体：整段不可穿过 */
  ],

  /* ---------- 摆件（参与 baseY 遮挡排序）---------- */
  props: [
    /* 远景投影层：帕特农柱廊站在午门屋脊后面。
       放在 gate 之前 = 先画 = 在门后面；baseY 与门相同，地平线一致。 */
    { painter: 'wumen.far', x: 320, baseY: 420, opt: {} },
    { painter: 'wumen.gate', x: 320, baseY: 420, opt: { w: 660 } },
    { painter: 'wumen.plaque', x: 320, baseY: 268, opt: { textKey: 'nodes.wumen.plaque' } },
    /* 门前：台阶 + 石狮 + 华表 + 铜缸，把广场压满 */
    { painter: 'wumen.steps', x: 320, baseY: 428, opt: { w: 190 } },
    { painter: 'wumen.lion', x: 150, baseY: 470, opt: { flip: false } },
    { painter: 'wumen.lion', x: 490, baseY: 470, opt: { flip: true } },
    { painter: 'wumen.huabiao', x: 112, baseY: 476, opt: {} },
    { painter: 'wumen.huabiao', x: 528, baseY: 476, opt: {} },
    { painter: 'wumen.vat', x: 210, baseY: 512, opt: {} },
    { painter: 'wumen.vat', x: 430, baseY: 512, opt: {} },
    /* 两侧松树与廊灯 */
    { painter: 'wumen.tree', x: 74, baseY: 640, opt: { kind: 'pine', s: 0.8 } },
    { painter: 'wumen.tree', x: 566, baseY: 640, opt: { kind: 'pine', s: 0.8 } },
    { painter: 'wumen.tree', x: 74, baseY: 830, opt: { kind: 'tree', s: 0.85 } },
    { painter: 'wumen.tree', x: 566, baseY: 830, opt: { kind: 'tree', s: 0.85 } },
    { painter: 'wumen.tree', x: 74, baseY: 1020, opt: { kind: 'pine', s: 0.9 } },
    { painter: 'wumen.tree', x: 566, baseY: 1020, opt: { kind: 'pine', s: 0.9 } },
    { painter: 'wumen.lantern', x: 96, baseY: 520, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 520, opt: {} },
    { painter: 'wumen.lantern', x: 96, baseY: 760, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 760, opt: {} },
    { painter: 'wumen.lantern', x: 96, baseY: 940, opt: {} },
    { painter: 'wumen.lantern', x: 544, baseY: 940, opt: {} },
    /* 告示牌与人群 */
    { painter: 'wumen.sign', x: 190, baseY: 566, opt: { text: '午門 · 广场', w: 58 } },
    { painter: 'wumen.sign', x: 450, baseY: 566, opt: { text: '入園請出示證件', w: 72 } },
    { painter: 'wumen.crowd', x: 320, baseY: 610, opt: { n: 7, seed: 3 } },
    { painter: 'wumen.crowd', x: 236, baseY: 900, opt: { n: 5, seed: 7 } },
  ],

  lights: [
    { x: 96, y: 500, r: 70, color: '#ffcf86', a: 0.22 },
    { x: 544, y: 500, r: 70, color: '#ffcf86', a: 0.22 },
  ],

  /* ---------- 人物 ---------- */
  npcs: [],

  /* ---------- 交互点 ----------
     inspect: 走通用「看一眼」，文案取 script.json 的 objects.<id>
     puzzle : 走 C 的玩法模块
     when   : 条件，满足才出现（见 js/mod.js 的 test）                */
  spots: [
    {
      id: 'wumen.origin',
      x: 320, y: 486, r: 68,
      labelKey: 'ui.hud.interact',
      puzzle: 'wumen.registration',
      when: { notDone: ['wumen.origin'] },
    },
    {
      id: 'wumen.look_grid',
      x: 150, y: 700, r: 46,
      labelKey: 'ui.hud.look',
      inspect: 'obj_wumen_grid',
    },
    {
      id: 'wumen.look_gate',
      x: 500, y: 470, r: 44,
      labelKey: 'ui.hud.look',
      inspect: 'obj_wumen_gate',
    },
  ],

  marker: { x: 320, y: 470, when: { notDone: ['wumen.origin'] } },

  /* 下一关：太和殿月台（关 2） */
  next: 'taihe',
});
