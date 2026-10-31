/* ============================================================
   万象灵境 · 通用关卡场景（G.StageScene）
   ------------------------------------------------------------
   这个类不画任何东西、不写任何玩法。它只做一件事：
   把一份 map 数据 + 注册表里的画笔/玩法，拼成一个能跑的场景。

   所以：加一个新关卡 = 加一个 map 文件（A）+ 若干画笔（A）
   + 一个玩法模块（C）。没有人需要改 js/stage.js。

   map 数据结构见 docs/模块接口.md。
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.WorldScene) return;
  if (G.StageScene) return;

  G.StageScene = class StageScene extends G.WorldScene {
    constructor(map, opts) {
      opts = opts || {};
      const size = map.size || {};
      super({
        id: map.id,
        w: size.w || 640,
        h: size.h || 1120,
        spawn: opts.spawn || map.spawn || null,
        clock: map.clock,
        dateLabel: map.dateLabel,
        lookAhead: (map.camera && map.camera.lookAhead) != null ? map.camera.lookAhead : 42,
        dayGrade: map.dayGrade !== false,
      });
      this.map = map;
      this.vars = {};
      this.ambient = map.ambient || 'palace';
      this.night = !!map.night;
      this.nightStrength = map.nightStrength == null ? 0.5 : map.nightStrength;
      this.build();
    }

    /* ---------------- 从数据搭场景 ---------------- */
    build() {
      const map = this.map;
      const self = this;

      if (map.vars) {
        Object.keys(map.vars).forEach(function (k) { self.vars[k] = map.vars[k]; });
      }

      /* 地面：一次性烘焙到离屏画布，和现有场景同一套路（world.js:106） */
      this.buildGround(function (c) {
        c.imageSmoothingEnabled = false;
        c.fillStyle = map.background || '#0b0907';
        c.fillRect(0, 0, self.w, self.h);
        (map.ground || []).forEach(function (layer) {
          G.mod.paint(layer.painter, c, layer, self);
        });
      });

      /* 碰撞盒 */
      (map.solids || []).forEach(function (s) { self.solid(s.x, s.y, s.w, s.h); });

      /* 物件：参与 baseY 排序，所以站在门后面会被门遮住 */
      (map.props || []).forEach(function (p) {
        self.addEntity({
          x: p.x,
          y: p.baseY == null ? p.y : p.baseY,
          baseY: p.baseY == null ? p.y : p.baseY,
          _prop: p,
          draw: function (ctx) { G.mod.paint(p.painter, ctx, p, self); },
        });
      });

      /* 人物 */
      (map.npcs || []).forEach(function (n) {
        const baseY = n.baseY == null ? n.y : n.baseY;
        if (n.painter) {
          self.addEntity({
            x: n.x, y: baseY, baseY: baseY, _npc: n,
            draw: function (ctx) { G.mod.paint(n.painter, ctx, n, self); },
          });
          self.addInteract({
            x: n.x, y: baseY, r: n.r || 46,
            label: G.str.has(n.labelKey || 'ui.hud.talk') ? G.str.get(n.labelKey || 'ui.hud.talk') : '交谈',
            condition: function () { return G.mod.test(n.when); },
            action: function () {
              const key = n.dialogKey;
              if (!key) return;
              G.dialog.show(G.str.dialog(key));
            },
          });
        } else {
          const spec = {
            x: n.x, y: n.y,
            name: G.str.has(n.nameKey || '') ? G.str.get(n.nameKey) : (n.name || '游客'),
            radius: n.r || 24,
            wander: n.wander || 0,
            getLines: function () { return G.str.dialog(n.dialogKey); },
          };
          /* palette 不能传 undefined：world.js 的 Object.assign 会被覆盖掉默认值 */
          if (n.palette) spec.palette = n.palette;
          if (n.accessory) spec.accessory = n.accessory;
          const npc = self.addNPC(spec);
          if (n.quest) npc.quest = true;
        }
      });

      /* 交互点：inspect 走通用「看一眼」，puzzle 走 C 的玩法模块 */
      (map.spots || []).forEach(function (s) {
        self.addInteract({
          x: s.x,
          y: s.y,
          r: s.r || 42,
          label: G.str.has(s.labelKey || '') ? G.str.get(s.labelKey) : (s.label || '互动'),
          condition: function () { return G.mod.test(s.when); },
          action: function () { G.mod.openSpot(s, self); },
        });
      });

      /* 灯光 */
      (map.lights || []).forEach(function (l) {
        self.addLight(l.x, l.y, l.r || 60, l.color || '#ffcf86', l.a == null ? 0.25 : l.a);
      });

      /* 目标箭头 */
      if (map.marker) {
        this.marker = {
          x: map.marker.x, y: map.marker.y,
          condition: function () { return G.mod.test(map.marker.when); },
        };
      }

      /* 前景层：画在角色之上（屋檐、雾、扫描线） */
      if (map.foreground) {
        this._fg = map.foreground;
      }
    }

    /* ---------------- 生命周期 ---------------- */
    onEnter() {
      const id = this.map.id;
      const name = G.str.has('nodes.' + id + '.name') ? G.str.get('nodes.' + id + '.name') : (this.map.title || id);
      const sub = G.str.has('nodes.' + id + '.sub') ? G.str.get('nodes.' + id + '.sub') : (this.map.sub || '');
      G.ui.location(name, sub);

      const objKey = this.map.objectiveKey || ('nodes.' + id + '.objective');
      if (G.str.has(objKey)) this.objective(G.str.get(objKey));
      else if (this.map.objective) this.objective(this.map.objective);

      /* 进场演出只播一次。两种写法：
         map.enterCut = 'wumen.intro'  → 播过场（有画面、有立绘、可跳过）
         否则回落到 nodes.<id>.enter  → 只播对话
         过场比对话强，所以有 enterCut 就不播对话，避免同一段话说两遍。 */
      const enterKey = this.map.enterKey || ('nodes.' + id + '.enter');
      const cutId = this.map.enterCut;
      if (!G.save.flag('seen.' + id)) {
        G.save.flag('seen.' + id, true);
        if (cutId && G.mod.has('cutscene', cutId)) {
          G.mod.cut(cutId, null);
        } else if (G.str.has(enterKey)) {
          G.dialog.show(G.str.dialog(enterKey));
        }
      }
    }

    /* ---------------- 通关判定 ---------------- */
    onSpotSolved(spot) {
      const needed = (this.map.spots || []).filter(function (s) { return !!s.puzzle; });
      const allDone = needed.every(function (s) { return G.mod.isDone(s.id); });
      if (!allDone) return;

      G.mod.done(this.map.id);
      const self = this;
      const proceed = function () {
        const outId = self.map.exitCut;
        if (outId && G.mod.has('cutscene', outId)) {
          G.mod.cut(outId, function () { if (self.map.next) G.mod.go(self.map.next); });
          return;
        }
        if (self.map.next) G.mod.go(self.map.next);
      };

      const key = this.map.completeKey || ('nodes.' + this.map.id + '.done');
      if (G.str.has(key)) G.dialog.show(G.str.dialog(key), proceed);
      else proceed();
    }

    /* ---------------- 绘制扩展 ---------------- */
    drawForeground(ctx) {
      if (!this._fg) return;
      const self = this;
      this._fg.forEach(function (l) { G.mod.paint(l.painter, ctx, l, self); });
    }

    drawScreen(ctx) {
      /* 让 C 也能画全屏层（比如关 1 的错位静帧） */
      if (this.screenPainters) {
        const self = this;
        this.screenPainters.forEach(function (id) { G.mod.paint(id, ctx, {}, self); });
      }
    }

    /* ---------------- 给玩法模块的便捷接口 ---------------- */
    setVar(k, v) { this.vars[k] = v; return v; }
    getVar(k, d) { return this.vars[k] == null ? d : this.vars[k]; }

    /* 画面重烘焙（改了 vars 后想立刻更新地面时用） */
    repaint() {
      const map = this.map;
      const self = this;
      this.buildGround(function (c) {
        c.imageSmoothingEnabled = false;
        c.fillStyle = map.background || '#0b0907';
        c.fillRect(0, 0, self.w, self.h);
        (map.ground || []).forEach(function (layer) { G.mod.paint(layer.painter, c, layer, self); });
      });
    }
  };
})();
