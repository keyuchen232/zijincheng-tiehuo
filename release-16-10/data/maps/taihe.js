/* ============================================================
   A · 美术/关卡  关 2：太和殿 · 月台（空间说明校准）
   ------------------------------------------------------------
   这一关要让玩家"走三折台阶、抬头看殿身"，再把写错的说明牌
   放回它们该在的位置。走法就是内容：台阶改不了，牌子能改。

   交互点：
     taihe.labels  三块牌子归位（C 的玩法）
     taihe.keep    主动选择"这条关系我要不要带走"（C 的玩法）
     look_*        通用"看一眼"，文案取 script.json 的 objects.*
   ============================================================ */
G.mod.register({
  kind: 'map',
  id: 'taihe',

  title: '太和殿',
  sub: '月台',

  size: { w: 640, h: 780 },
  spawn: { x: 320, y: 736 },
  camera: { lookAhead: 44 },
  clock: '09:10',
  ambient: 'palace',
  background: '#171310',

  vars: {
    keepSteps: '',       /* keep / note / drop —— 玩家对"保留关系"的选择 */
    labelsDone: 0,       /* 已经归位的牌子数 */
    layerStones: 0,      /* 1 = 石作层打开：栏杆下的浮雕与台基石雕看得清楚 */
    layerImages: 1,      /* 0 = 图像层关掉：卫城投影整层不画 */
    layerLabels: 1,      /* 0 = 标签层关掉：说明牌与匾额名字都不写 */
    labelGlitch: 0,      /* 1 = 挪错过的牌子上留着乱码（不清零，带着也能通关） */
  },

  ground: [
    { painter: 'hall.marble', x: 0, y: 380, w: 640, h: 400, opt: {} },
  ],

  solids: [
    { x: 12, y: 246, w: 616, h: 124 },   /* 殿身与台基：不可穿过 */
  ],

  props: [
    { painter: 'hall.palace', x: 320, baseY: 330, opt: { w: 520, wallH: 36, roofH: 34, double: true, nameKey: 'nodes.taihe.name' } },
    { painter: 'hall.terrace', x: 320, baseY: 470, opt: { w: 560 } },
    { painter: 'hall.labelplates', x: 320, baseY: 470, opt: {
      at: [
        { dx: -120, dy: -34 },
        { dx: 0, dy: -42 },
        { dx: 120, dy: -34 },
      ],
    } },
    { painter: 'wumen.lantern', x: 92, baseY: 560, opt: {} },
    { painter: 'wumen.lantern', x: 548, baseY: 560, opt: {} },
    /* 三块图层石：踩上去开或关一层，本身不挡通关（optional） */
    { painter: 'hall.layerstone', x: 214, baseY: 706, opt: { layer: 'stones' } },
    { painter: 'hall.layerstone', x: 320, baseY: 726, opt: { layer: 'images' } },
    { painter: 'hall.layerstone', x: 426, baseY: 706, opt: { layer: 'labels' } },
  ],

  lights: [
    { x: 92, y: 540, r: 68, color: '#ffcf86', a: 0.20 },
    { x: 548, y: 540, r: 68, color: '#ffcf86', a: 0.20 },
  ],

  npcs: [],

  spots: [
    {
      id: 'taihe.labels',
      x: 320, y: 520, r: 70,
      labelKey: 'ui.hud.interact',
      puzzle: 'taihe.labels',
      when: { notDone: ['taihe.labels'] },
    },
    {
      id: 'taihe.keep',
      x: 150, y: 660, r: 54,
      labelKey: 'ui.hud.interact',
      puzzle: 'taihe.keep',
      when: { notDone: ['taihe.keep'] },
    },
    {
      id: 'taihe.look_steps',
      x: 512, y: 600, r: 46,
      labelKey: 'ui.hud.look',
      inspect: 'obj_taihe_steps',
    },
    {
      id: 'taihe.look_railing',
      x: 128, y: 486, r: 44,
      labelKey: 'ui.hud.look',
      inspect: 'obj_taihe_railing',
    },
    {
      id: 'taihe.look_archive',
      x: 430, y: 432, r: 44,
      labelKey: 'ui.hud.look',
      inspect: 'obj_taihe_archive',
    },
    {
      id: 'taihe.look_plaque',
      x: 320, y: 384, r: 40,
      labelKey: 'ui.hud.look',
      inspect: 'obj_taihe_plaque',
    },
    /* 三块图层石：不挡通关，随时可以来回踩 */
    {
      id: 'taihe.layer.stones',
      x: 214, y: 700, r: 34,
      labelKey: 'ui.hud.layer',
      puzzle: 'taihe.layer.stones',
      optional: true,
    },
    {
      id: 'taihe.layer.images',
      x: 320, y: 720, r: 34,
      labelKey: 'ui.hud.layer',
      puzzle: 'taihe.layer.images',
      optional: true,
    },
    {
      id: 'taihe.layer.labels',
      x: 426, y: 700, r: 34,
      labelKey: 'ui.hud.layer',
      puzzle: 'taihe.layer.labels',
      optional: true,
    },
  ],

  marker: { x: 320, y: 520, when: { notDone: ['taihe.labels'] } },

  next: 'qianqing',
});
