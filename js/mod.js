/* ============================================================
   万象灵境 · 模块注册表（G.mod）
   ------------------------------------------------------------
   这个文件是「并行分工」的中枢。四个人各写自己的文件，
   谁都不改这个文件，靠注册表在运行时拼起来。

   五种登记物（kind）：
     map      地图 + 坐标 + 碰撞 + 交互点      —— A 美术/关卡
     painter  画笔函数（画地面 / 画物件 / 画人） —— A 美术
     puzzle   一个可交互玩法（小游戏 / 判断）     —— C 交互
     cutscene 一段过场演出（开场 / 转场 / 结局）  —— C 演出（文字找 B、立绘找 A）
     flow     跨节点的流程钩子（可留空）          —— C 交互

   登记方式（各人只管在自己的文件里调一次）：
     G.mod.register({ kind:'painter', id:'wumen.gate', draw:function(ctx,prop,scene){} });
     G.mod.register({ kind:'puzzle',  id:'wumen.registration', open:function(api){} });
     G.mod.register({ kind:'cutscene', id:'wumen.intro', steps:[...] });
     G.mod.register({ kind:'map',     id:'wumen', ... });

   玩法与美术之间只有一个通道：scene.vars。
   C 改 scene.vars，A 的画笔读 scene.vars —— 双方不互相引用。
   ============================================================ */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  if (G.mod) return;

  const reg = { map: {}, painter: {}, puzzle: {}, cutscene: {}, flow: {} };
  const problems = [];

  function warn(msg) {
    if (problems.indexOf(msg) < 0) problems.push(msg);
    if (window.console) console.warn('[mod] ' + msg);
  }

  const mod = {
    booted: false,
    ready: null,
    problems: problems,

    /* ---------------- 登记 ---------------- */
    register: function (spec) {
      if (!spec || !spec.kind || !spec.id) {
        warn('register 需要 kind 与 id：' + JSON.stringify(spec && spec.id));
        return null;
      }
      const bin = reg[spec.kind];
      if (!bin) { warn('未知 kind：' + spec.kind); return null; }
      if (bin[spec.id]) {
        warn('重复登记 ' + spec.kind + ':' + spec.id + '（后一个覆盖前一个）');
      }
      bin[spec.id] = spec;
      return spec;
    },
    map: function (spec) { return mod.register(Object.assign({ kind: 'map' }, spec)); },
    painter: function (id, draw) { return mod.register({ kind: 'painter', id: id, draw: draw }); },
    puzzle: function (id, spec) { return mod.register(Object.assign({ kind: 'puzzle', id: id }, spec)); },
    cutscene: function (id, spec) { return mod.register(Object.assign({ kind: 'cutscene', id: id }, spec)); },
    has: function (kind, id) { return !!(reg[kind] && reg[kind][id]); },
    get: function (kind, id) { return (reg[kind] || {})[id]; },
    list: function (kind) { return Object.keys(reg[kind] || {}); },

    /* 播一段过场（js/cut.js 提供放映机；没加载就当没有，直接回调） */
    cut: function (id, done) {
      if (G.cut && G.cut.play) return G.cut.play(id, done);
      if (window.console) console.warn('[mod] 缺少 js/cut.js，跳过过场 ' + id);
      if (done) done();
      return null;
    },

    /* ---------------- 进度 ---------------- */
    /* 交互点完成状态存在 G.save.data.flags 里，key 前缀 spot.
       core.js 的 load() 会保留未知 flag，所以不需要改存档结构。 */
    done: function (spotId) {
      G.save.flag('spot.' + spotId, true);
      return spotId;
    },
    isDone: function (spotId) { return G.save.flag('spot.' + spotId); },
    clear: function (spotId) { G.save.flag('spot.' + spotId, false); },

    /* 条件判断。只用数据，不用 eval，避免文案里写出可执行字符串。
       when: { done:['a'], notDone:['b'], flag:{ x:true } }  —— 三者同时满足才通过 */
    test: function (when) {
      if (!when) return true;
      if (when.done && !when.done.every(function (i) { return mod.isDone(i); })) return false;
      if (when.notDone && when.notDone.some(function (i) { return mod.isDone(i); })) return false;
      if (when.flag) {
        for (const k in when.flag) {
          if (!!G.save.flag(k) !== !!when.flag[k]) return false;
        }
      }
      return true;
    },

    /* ---------------- 美术 ---------------- */
    paint: function (id, ctx, prop, scene) {
      const p = reg.painter[id];
      if (!p) { warn('缺少画笔：' + id); return; }
      try { p.draw(ctx, prop || {}, scene); } catch (e) { warn('画笔报错 ' + id + '：' + e.message); }
    },

    /* ---------------- 文案 ---------------- */
    object: function (objId) {
      const list = G.str.all('objects');
      for (let i = 0; i < list.length; i++) if (list[i].id === objId) return list[i];
      return null;
    },

    /* 通用「看一眼」：任何物件都能用，C 不需要为它写模块。
       在 map 的 spot 里写 { inspect:'obj_wumen_gate' } 即可。 */
    inspect: function (objId, api) {
      const o = mod.object(objId);
      if (!o) { warn('缺少物件文案：' + objId); return false; }
      const lines = [];
      if (o.desc) lines.push({ narrator: true, text: o.desc });
      (o.interact || []).forEach(function (row) {
        const ch = G.str.who(row.who || 'narrator');
        if (row.who === 'narrator' || !row.who) lines.push({ narrator: true, text: row.text });
        else lines.push({ name: ch.name || row.who, text: row.text });
      });
      if (!lines.length) lines.push({ narrator: true, text: o.name || objId });
      G.dialog.show(lines, function () { if (api && api.release) api.release(); });
      return true;
    },

    /* ---------------- 开一个交互点 ---------------- */
    openSpot: function (spot, scene) {
      const api = mod.api(spot, scene);

      if (spot.inspect) {
        mod.inspect(spot.inspect, api);
        return;
      }

      const pid = spot.puzzle || spot.id;
      const p = reg.puzzle[pid];
      if (!p) {
        warn('缺少玩法模块：' + pid);
        G.ui.toast('玩法未接入：' + pid, 'bad', 2200);
        api.release();
        return;
      }
      try {
        p.open(api);
      } catch (e) {
        warn('玩法报错 ' + pid + '：' + e.message);
        if (window.console) console.error(e);
        api.release();
      }
    },

    /* ---------------- 给 C 用的 API ---------------- */
    api: function (spot, scene) {
      const closed = { v: false };
      const api = {
        spot: spot,
        scene: scene,
        map: scene && scene.map,
        str: G.str,
        ui: G.ui,
        vars: (scene && scene.vars) || {},

        sfx: function (name) { if (G.audio) G.audio.sfx(name); },
        toast: function (text, kind) { G.ui.toast(text, kind || '', 2000); },
        setVar: function (k, v) {
          if (!scene || !scene.vars) return;
          if (scene.setVar) scene.setVar(k, v, spot);
          else scene.vars[k] = v;
        },

        dialog: function (key, done) {
          const lines = G.str.dialog(key);
          if (!lines.length) { if (done) done(); return; }
          G.dialog.show(lines, done);
        },
        cinema: function (key, done) {
          const lines = G.str.seg(key).map(function (r) { return { text: r.text, sub: r.sub || '', ms: r.ms || 1900 }; });
          if (!lines.length) { if (done) done(); return; }
          G.cinema.play(lines, done);
        },
        /* 播一段过场，播完再继续（过场自己会锁住世界） */
        cut: function (id, done) {
          if (G.cut && G.cut.play) { G.cut.play(id, done); return; }
          if (done) done();
        },
        /* 从 puzzles.<key> 直接生成一次选项问答 */
        ask: function (puzzleKey, cb) {
          const pz = G.str.puzzle(puzzleKey);
          const opts = G.str.options('puzzles.' + puzzleKey + '.options');
          G.dialog.ask({
            name: (G.str.who('diotima').name || '狄奥提玛'),
            text: pz.prompt || '',
            options: opts,
          }, cb);
        },
        /* 让画面变灰/锁输入的遮罩交给 core 的 overlayDepth 统一管理 */
        overlay: function (el) {
          if (closed.v) return el;
          closed.v = true;
          G.overlayDepth = (G.overlayDepth || 0) + 1;
          api._overlayEl = el || null;
          if (el && el.classList) el.classList.remove('hidden');
          return el;
        },
        release: function () {
          if (!closed.v) return;
          closed.v = false;
          G.overlayDepth = Math.max(0, (G.overlayDepth || 1) - 1);
          if (api._overlayEl && api._overlayEl.classList) api._overlayEl.classList.add('hidden');
        },
        pass: function (result) {
          api.release();
          mod.done(spot.id);
          if (scene && scene.onSpotSolved) scene.onSpotSolved(spot, result || {});
          if (G.save.persist) G.save.persist();
        },
        fail: function (reasonKey) {
          api.release();
          if (reasonKey) api.toast(G.str.get(reasonKey), 'warn');
        },
      };
      /* 注意：打开时【不】自动锁输入。
         G.dialog / G.cinema 本身就会让 G.isWorldPaused() 为真（core.js:493），
         自己再加一层 overlayDepth 会让「失败后可重试」的模块忘记解锁而软锁。
         只有 C 要弹自定义 DOM 面板时才调 api.overlay(el)。 */
      return api;
    },

    /* ---------------- 地图加载与切场景 ---------------- */
    go: function (mapId, opts) {
      const map = reg.map[mapId];
      if (!map) { warn('未登记地图：' + mapId); G.ui.toast('地图未登记：' + mapId, 'bad', 2200); return null; }
      if (!G.StageScene) { warn('缺少 js/stage.js，无法建场景'); return null; }
      const scene = new G.StageScene(map, opts || {});
      if (G.titleActive) {
        G.titleActive = false;
        if (G.$) G.hide(G.$('#title'));
      }
      G.setScene(scene, { name: mapId });
      return scene;
    },

    /* ---------------- 启动自检 ---------------- */
    check: function () {
      const self = this;
      Object.keys(reg.map).forEach(function (mid) {
        const map = reg.map[mid];
        (map.ground || []).forEach(function (l) { if (!reg.painter[l.painter]) warn('地图 ' + mid + ' 引用了不存在的画笔 ' + l.painter); });
        (map.props || []).forEach(function (l) { if (!reg.painter[l.painter]) warn('地图 ' + mid + ' 引用了不存在的画笔 ' + l.painter); });
        (map.spots || []).forEach(function (s) {
          if (s.puzzle && !reg.puzzle[s.puzzle]) warn('地图 ' + mid + ' 的交互点 ' + s.id + ' 引用了不存在的玩法 ' + s.puzzle);
          if (s.inspect && !self.object(s.inspect)) warn('地图 ' + mid + ' 的交互点 ' + s.id + ' 引用了不存在的物件 ' + s.inspect);
        });
      });
      Object.keys(reg.cutscene).forEach(function (cid) {
        const cut = reg.cutscene[cid];
        (cut.steps || []).forEach(function (s) {
          if (s.key && G.str && !G.str.has(s.key)) warn('过场 ' + cid + ' 引用了不存在的文案 ' + s.key);
          if (s.subKey && G.str && !G.str.has(s.subKey)) warn('过场 ' + cid + ' 引用了不存在的文案 ' + s.subKey);
          if (s.who && s.t === 'portrait' && !reg.painter['portrait.' + s.who]) {
            /* 只是提醒：立绘没画也能播，只是少一张画 */
            warn('过场 ' + cid + ' 要的立绘还没画：portrait.' + s.who);
          }
        });
      });
      return problems.slice();
    },

    report: function () {
      return {
        maps: Object.keys(reg.map),
        painters: Object.keys(reg.painter),
        puzzles: Object.keys(reg.puzzle),
        cutscenes: Object.keys(reg.cutscene),
        flows: Object.keys(reg.flow),
        problems: problems.slice(),
      };
    },

    boot: function (opts) {
      if (this.booted) return this.ready;
      this.booted = true;
      const self = this;
      this.ready = G.str.ready.then(function () {
        self.check();
        const r = self.report();
        if (window.console) {
          console.log('[mod] 地图 ' + r.maps.length + ' · 画笔 ' + r.painters.length +
            ' · 玩法 ' + r.puzzles.length + ' · 问题 ' + r.problems.length);
          r.problems.forEach(function (p) { console.warn('[mod] ✗ ' + p); });
        }
        let start = (opts && opts.map) || null;
        let cutId = (opts && opts.cut) || null;
        try {
          const q = new URLSearchParams(window.location.search);
          if (q.get('map')) start = q.get('map');
          if (q.get('cut')) cutId = q.get('cut');
        } catch (e) { /* 老浏览器忽略 */ }

        /* ?cut=wumen.intro 单独看一段过场，不用跑关（C 调节奏用） */
        if (cutId) {
          if (G.cut && G.cut.play) G.cut.play(cutId, null);
          return r;
        }
        /* ?map= 直接进关：跳过开场，省得每次刷新都看一遍 */
        if (start) {
          if (G.fade && G.fade.to) G.fade.to(function () { self.go(start); }, 120);
          else self.go(start);
          return r;
        }
        /* 开场动画：没看过就播一次。
           播完直接落地午门——原来停在标题页，玩家还得再点一次
           「进入万象灵境」，演示时那一下很像游戏已经结束了。
           已经看过开场的人（cut.opening 已置位）才停在标题页。 */
        if (reg.cutscene.opening && G.cut && G.cut.play && !G.cut.seen('opening')) {
          G.cut.play('opening', function () {
            if (G.fade && G.fade.to) G.fade.to(function () { self.go('wumen'); }, 140);
            else self.go('wumen');
          });
        }
        return r;
      });
      return this.ready;
    },
  };

  G.mod = mod;
})();
