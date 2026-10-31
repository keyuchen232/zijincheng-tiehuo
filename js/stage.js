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
      this.bounds = map.bounds || null;
      this.vars = {};
      this.feedback = [];
      this._continue = null;
      this._objectiveText = '';
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

      /* 未签署也会完成审核点；返回或读旧档时，允许再次审核而非直接送回出口。 */
      this._reviewAgain = map.id === 'creator' && G.mod.isDone('creator.review') && !G.save.flag('creator.signed');

      /* 线索完成旗标会跨刷新保留，配对门禁读的场景变量也要一并恢复。 */
      if (map.id === 'shenwumen') {
        if (G.mod.isDone('shenwumen.clue_a')) self.vars.clueARead = 1;
        if (G.mod.isDone('shenwumen.clue_b')) self.vars.clueBRead = 1;
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
        /* 标签模板可能带 {name}（ui.hud.look = 「观察 {name}」），
           name 取 objects 里那一条的 name；玩法点用 labelObj 指明取哪一条，
           取不到就留空，不显示花括号。 */
        const objId = s.inspect || s.labelObj;
        const obj = objId ? G.mod.object(objId) : null;
        const lv = { name: (obj && obj.name) || s.name || '' };
        self.addInteract({
          _spot: s,
          x: s.x,
          y: s.y,
          r: s.r || 42,
          /* 兜底也用文案表里的「查看」：js 里不许有中文（铁律③） */
          label: !self.needsReview(s) && !G.mod.test(s.when) && !!s.puzzle && !s.optional && self.canContinue()
            ? G.str.get('ui.buttons.continue')
            : (G.str.has(s.labelKey || '') ? G.str.get(s.labelKey, lv)
              : (s.label || G.str.get('ui.hud.interact'))),
          condition: function () {
            return G.mod.test(s.when) || !!self.followUp(s) || (!!s.puzzle && !s.optional && self.canContinue());
          },
          action: function () {
            if (self.needsReview(s)) { G.mod.openSpot(s, self); return; }
            if (self._continue && !!s.puzzle && !s.optional) { self.continueStage(); return; }
            const follow = self.followUp(s);
            if (follow) G.mod.openSpot(follow, self);
            else if (!!s.puzzle && !s.optional && self.canContinue()) {
              self.onSpotSolved(s);
              self.continueStage();
            }
            else G.mod.openSpot(s, self);
          },
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

    needsReview(spot) {
      return this._reviewAgain && spot.id === 'creator.review' && !G.save.flag('creator.signed');
    }

    /* 标签归位与保留选择属于同一次体验，旧存档也可从原位置接着完成。 */
    followUp(spot) {
      if (this.map.id !== 'taihe' || spot.id !== 'taihe.labels' || !G.mod.isDone(spot.id)) return null;
      return (this.map.spots || []).find(function (s) {
        return s.id === 'taihe.keep' && !G.mod.isDone(s.id);
      }) || null;
    }

    /* 目标随完成旗标刷新；只指向可用的必需交互点。 */
    update(dt) {
      super.update(dt);
      this.refreshObjective();
    }

    refreshObjective() {
      const spots = this.map.spots || [];
      let next = spots.find(function (s) {
        return s.puzzle && !s.optional && !G.mod.isDone(s.id) && G.mod.test(s.when);
      });
      if (this._reviewAgain) {
        next = spots.find((s) => this.needsReview(s)) || next;
      }
      /* 神武门先补齐线索，再验证出口。 */
      if (this.map.id === 'shenwumen') {
        next = spots.find(function (s) {
          return (s.id === 'shenwumen.clue_a' || s.id === 'shenwumen.clue_b') && !G.mod.isDone(s.id);
        }) || next;
      }
      if (this.map.id === 'taihe' && next && next.id === 'taihe.keep') {
        next = spots.find(function (s) { return s.id === 'taihe.labels'; }) || next;
      }
      const names = {
        'wumen.origin': '校准网格', 'taihe.labels': G.mod.isDone('taihe.labels') ? '选择台阶关系的保留方式' : '整理说明牌',
        'taihe.keep': '选择台阶关系的保留方式', 'qianqing.loadtest': '继续承重实验',
        'repair_bench.evidence': '核对证据卡', 'repair_bench.relic': '判断右侧藏品',
        'creator.review': '审核造境方案', 'shenwumen.verify': '验证出口',
        'shenwumen.clue_a': '阅读左侧线索', 'shenwumen.clue_b': '阅读右侧线索',
      };
      if (this._continue) next = this._continue.spot;
      if (!next) return;
      this.interactables.forEach((it) => {
        if (!it._spot || !it._spot.puzzle || it._spot.optional) return;
        if (this._continue) it.label = '按 E ' + (this.map.next ? '继续下一关' : '查看结局');
        else if (this.followUp(it._spot)) it.label = '按 E 选择台阶关系的保留方式';
      });
      const horizontal = next.x < this.w * 0.4 ? '左侧' : next.x > this.w * 0.6 ? '右侧' : '中央';
      const vertical = next.y < this.player.y - 28 ? '前方' : next.y > this.player.y + 28 ? '后方' : '附近';
      const text = (this._continue ? '结果已留在场景中；' : '') + '到' + horizontal + vertical + '按 E ' +
        (this._continue ? (this.map.next ? '继续下一关' : '查看结局') : (names[next.id] || '互动'));
      if (text !== this._objectiveText) { this._objectiveText = text; this.objective(text); }
    }

    /* ---------------- 通关判定 ---------------- */
    canContinue() {
      if (!this.map.next && !this.map.exitCut) return false;
      const needed = (this.map.spots || []).filter(function (s) { return !!s.puzzle && !s.optional; });
      return needed.length > 0 && needed.every(function (s) { return G.mod.isDone(s.id); });
    }

    onSpotSolved(spot) {
      if (spot.id === 'creator.review') this._reviewAgain = false;
      const follow = this.followUp(spot);
      if (follow) { this.refreshObjective(); return; }
      /* optional: true 的 spot 不参与通关门槛 ——
         关 2 的三块图层石随时可踩、可来回切，但不踩也能过关（P1 才强制）。 */
      const needed = (this.map.spots || []).filter(function (s) {
        return !!s.puzzle && !s.optional;
      });
      const allDone = needed.every(function (s) { return G.mod.isDone(s.id); });
      if (!allDone) { this.refreshObjective(); return; }
      if (this._continue) return;
      G.mod.done(this.map.id);
      this._continue = { spot: spot };
      this.refreshObjective();
    }

    /* 没有延时回调或输入锁；结果停留到玩家主动按 E。 */
    continueStage() {
      if (!this._continue || this._continuing) return;
      this._continuing = true;
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
      this.drawFeedback(ctx);
    }

    /* 只记录实际变化的重要状态；每个 key 独立存放，装饰变量不会覆盖结果。 */
    recordFeedback(k, before, v, spot) {
      if (before === v) return;
      let text = '';
      let bad = false;
      const n = Number(v);
      const side = this.vars.sagSide === 'wood' ? '木柱' : this.vars.sagSide === 'stone' ? '石柱' : '柱体';
      switch (this.map.id + ':' + k) {
        case 'wumen:gridDx':
          text = n === 0 ? '青色投影线已对齐金色故宫线' : '青色投影线与金色故宫线仍有错位'; bad = n !== 0; break;
        case 'wumen:gridBoth':
          text = n === 0 ? '故宫参照线已回到门洞中心' : '故宫参照线被拖离门洞中心，需核对原点'; bad = n !== 0; break;
        case 'taihe:labelsDone': text = '说明牌已核对 ' + v + ' / 3 块'; break;
        case 'taihe:labelGlitch': text = n ? '误标留下了乱码痕迹' : '乱码痕迹已清除'; bad = !!n; break;
        case 'taihe:keepSteps':
          text = { keep: '台阶关系已写入保留规则', note: '台阶关系已记为待核', drop: '台阶关系未纳入保留规则' }[v] || ''; break;
        case 'qianqing:sag': text = n ? side + '正在下沉（' + Math.round(n * 100) + '%）' : '柱体下沉量已归零'; bad = n > 0; break;
        case 'qianqing:crack': text = n ? '柱身留下裂纹' : '柱身裂纹已清除'; bad = !!n; break;
        case 'qianqing:stoneMethod': text = '石柱连接方式已记录：' + ({ dowel: '铅灌铁销', dry: '直接叠压', tenon: '榫卯' }[v] || v); break;
        case 'qianqing:woodMethod': text = '木柱连接方式已记录：' + ({ dowel: '铅灌铁销', dry: '直接叠压', tenon: '榫卯' }[v] || v); break;
        case 'repair_bench:stampUnfounded': text = n ? '证据台已盖「未成立」印章' : '「未成立」印章已清除'; break;
        case 'repair_bench:crackCount': text = '比较层面有误，证据台折痕增至 ' + v + ' 道'; bad = true; break;
        case 'repair_bench:evidenceDone': text = n ? '证据核对已完成，右侧藏品可判断' : '证据核对已重置'; break;
        case 'repair_bench:verdictR07':
          text = { fusion: '藏品已改判为历史融合，保留全件', stripped: '错判：藏品外来构件被拆除', erased: '错判：藏品外来说明被抹除', '': '错误处理已撤回，藏品恢复待判' }[v] || '';
          bad = v === 'stripped' || v === 'erased'; break;
        case 'creator:planSigned': text = n ? '造境方案已签署' : '方案签署状态已撤销'; bad = !n; break;
        case 'shenwumen:doorLit': text = n ? '出口门洞已亮起暖光' : '出口门洞已熄灭'; bad = !n; break;
        case 'shenwumen:clueARead': text = n ? '左侧线索已读亮' : '左侧线索已重置'; break;
        case 'shenwumen:clueBRead': text = n ? '右侧线索已读亮' : '右侧线索已重置'; break;
      }
      if (!text) return;
      const old = this.feedback.findIndex(function (f) { return f.key === k; });
      if (old >= 0) this.feedback.splice(old, 1);
      this.feedback.push({ key: k, text: text, bad: bad, spot: spot, time: this.time });
    }

    drawFeedback(ctx) {
      if (!this.feedback.length) return;
      ctx.save();
      /* 画在原有 screenPainters 之后，不改变原画笔与世界坐标。 */
      this.feedback.forEach((f, i) => {
        if (!f.spot) return;
        const x = f.spot.x - Math.round(this.cam.x) - (G.fx.ox || 0);
        const y = f.spot.y - Math.round(this.cam.y) - (G.fx.oy || 0);
        const wave = (Math.sin((this.time - f.time) * 3) + 1) / 2;
        ctx.strokeStyle = f.bad ? '#f3977c' : '#ffd479';
        ctx.globalAlpha = 0.3 + wave * 0.4;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 18 + wave * 10 + (i % 2) * 4, 0, Math.PI * 2); ctx.stroke();
        /* 网格用参照线揭示相对/共同移动；其它变化在物件方向加引线。 */
        if (f.key === 'gridDx' || f.key === 'gridBoth') {
          const both = this.vars.gridBoth || 0;
          ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(x, y - 90); ctx.lineTo(x, y - 30); ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(x + both, y - 90); ctx.lineTo(x + both, y - 30);
          ctx.moveTo(x + both + (this.vars.gridDx || 0), y - 90); ctx.lineTo(x + both + (this.vars.gridDx || 0), y - 30); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y - 64); ctx.lineTo(x + 14, y - 74); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      const rows = this.feedback.slice(-6);
      const width = Math.min(G.W - 24, 520);
      ctx.fillStyle = 'rgba(16,12,9,.9)'; ctx.fillRect((G.W - width) / 2, 28, width, 10 + rows.length * 17);
      rows.forEach(function (f, i) {
        G.text(ctx, f.text, G.W / 2, 42 + i * 17, { size: 10, align: 'center', color: f.bad ? '#f3977c' : '#ffe2a1' });
      });
      ctx.restore();
    }

    /* ---------------- 给玩法模块的便捷接口 ---------------- */
    setVar(k, v, spot) {
      const before = this.vars[k];
      this.vars[k] = v;
      this.recordFeedback(k, before, v, spot);
      return v;
    }
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
