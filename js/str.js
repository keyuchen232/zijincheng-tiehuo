/* ============================================================
   万象灵境 · 文案表（G.str）
   唯一职责：把 data/script.json 里的字符串按 key 取出来。
   这个文件由架构 owner 维护，其他三人只调用、不修改。

   为什么叫 G.str 不叫 G.text：
   js/core.js:690 的 G.text 是画布绘字函数，占用中。改名避免冲突。

   加载优先级：
     1) window.WXL_SCRIPT   —— tools/build-data.mjs 生成的兜底脚本（file:// 用）
     2) fetch data/script.json —— node serve.js 环境
     3) 都没有 → 空表，所有文案显示 ⟪key⟫，游戏仍能跑，不白屏

   ============================================================ */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  if (G.str) return;

  const MISSING = [];
  const seen = Object.create(null);
  let data = null;

  function lookup(path) {
    if (!data || !path) return undefined;
    const parts = String(path).split('.');
    let o = data;
    let i = 0;
    /* 关键：关卡 / 物件的 id 自身就带点（'wumen.registration'、'obj_bench_cards' 之前的
       'puzzles.wumen.registration.prompt'），所以不能只用 '.' 逐段找。
       每走一步先试「最长的一整段 key」，再退回单段。 */
    while (i < parts.length) {
      if (o == null || typeof o !== 'object') return undefined;
      let matched = false;
      for (let j = parts.length; j > i; j--) {
        const key = parts.slice(i, j).join('.');
        if (Object.prototype.hasOwnProperty.call(o, key)) {
          o = o[key];
          i = j;
          matched = true;
          break;
        }
      }
      if (!matched) return undefined;
    }
    return o;
  }

  function note(key) {
    if (seen[key]) return;
    seen[key] = 1;
    MISSING.push(key);
    if (window.console) console.warn('[str] 缺少文案:', key);
  }

  function fill(s, vars) {
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])));
  }

  /* 取单条字符串。缺失返回 ⟪key⟫，不抛错、不返回 undefined。 */
  function get(key, vars) {
    const v = lookup(key);
    if (typeof v !== 'string') { note(key); return '⟪' + key + '⟫'; }
    return fill(v, vars);
  }

  function has(key) { return lookup(key) !== undefined; }

  /* 取一段对白：[{who,text,pause?}]，结构不对时返回空数组。 */
  function seg(key) {
    const v = lookup(key);
    if (!Array.isArray(v)) {
      if (v == null) note(key);
      return [];
    }
    return v.map(function (row) {
      if (typeof row === 'string') return { who: 'narrator', text: row };
      return row;
    });
  }

  /* 转成 G.dialog.show 能吃的形状：{name,text,narrator,speed}。
     G.dialog 认 name / narrator，不认 who（见 core.js:268）。 */
  function dialog(key) {
    return seg(key).map(function (row) {
      const who = row.who || 'narrator';
      const ch = (data && data.characters && data.characters[who]) || {};
      const out = { text: row.text || '' };
      if (who === 'narrator') out.narrator = true;
      else out.name = ch.name || who;
      if (row.speed) out.speed = row.speed;
      return out;
    });
  }

  /* 取选项数组，转成 G.dialog 选项形状：[{label, value}] */
  function options(key, opt) {
    opt = opt || {};
    const list = lookup(key);
    if (!Array.isArray(list)) { note(key); return []; }
    return list.map(function (o) {
      return {
        label: o.label || o.text || o.id || '',
        value: opt.byDesc ? o : (o.id == null ? o.value : o.id),
        desc: o.desc || '',
      };
    });
  }

  function all(section) {
    const v = lookup(section);
    return Array.isArray(v) ? v : [];
  }

  function who(id) {
    const c = lookup('characters.' + id);
    return c && typeof c === 'object' ? c : { name: id };
  }

  function node(id) { return lookup('nodes.' + id) || {}; }
  function puzzle(id) { return lookup('puzzles.' + id) || {}; }
  function missing() { return MISSING.slice(); }

  G.str = {
    ready: null,
    get: get,
    has: has,
    seg: seg,
    dialog: dialog,
    options: options,
    all: all,
    who: who,
    node: node,
    puzzle: puzzle,
    missing: missing,
    raw: function () { return data; },
  };

  function load() {
    if (window.WXL_SCRIPT) { data = window.WXL_SCRIPT; return Promise.resolve('inline'); }
    if (typeof fetch !== 'function') { data = {}; return Promise.resolve('none'); }
    return fetch('data/script.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { data = json; return 'fetch'; })
      .catch(function (err) {
        data = {};
        if (window.console) {
          console.warn('[str] 无法加载 data/script.json：', err && err.message);
          console.warn('[str] 双击 file:// 打开时请先运行 node tools/build-data.mjs');
        }
        return 'failed';
      });
  }

  G.str.ready = load().then(function (how) {
    const sections = data && typeof data === 'object' ? Object.keys(data).length : 0;
    if (window.console) console.log('[str] 文案已就绪（' + how + '，' + sections + ' 段）');
    return data;
  });
})();
