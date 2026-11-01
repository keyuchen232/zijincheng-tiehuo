/* ============================================================
   标题页：主入口 / 旧线收纳 / 文案同步
   ------------------------------------------------------------
   为什么不写在 js/main.js 里：main.js 与 upstream 有 400 多行差异，
   任何一行都可能变成合并冲突。所以入口用事件委托写在这里，
   主按钮 id 见 index.html 的 #btn-stage。

   · 点「进入万象灵境」= G.mod.go('wumen')：go() 自己会关掉标题页、
     建场景、播进场的过场（wumen.intro）。
   · 「旧线」菜单已经整体下线：标题页只保留主入口、继续、创造模式、
     支线·打铁花与退出。
   · 标题文案的真源是 data/script.json 的 ui.title，这里是同步器；
     index.html 里写的是同样的兜底文字（首屏不闪）。
   ============================================================ */
(function () {
  'use strict';

  const KEYS = {
    eyebrow: 'ui.title.eyebrow',
    logo: 'ui.title.logo',
    sub: 'ui.title.subtitle',
    foot: 'ui.title.footer',
  };

  function node(id) { return document.getElementById(id); }

  function txt(key) {
    const G = window.G;
    if (!G || !G.str || typeof G.str.has !== 'function' || !G.str.has(key)) return '';
    if (typeof G.str.get !== 'function') return '';
    const v = G.str.get(key);
    /* 缺 key 时 G.str 返回 ⟪key⟫，别把那个显示出来 */
    return (typeof v === 'string' && v.indexOf('⟪') !== 0) ? v : '';
  }

  function setText(id, v) {
    const el = node(id);
    if (el && v) el.textContent = v;
  }

  /* 标题页文案以文案表为准；长标题前后各半，沿用原来的两种字色 */
  function syncCopy() {
    setText('title-eyebrow', txt(KEYS.eyebrow));
    setText('title-sub', txt(KEYS.sub));
    setText('title-foot', txt(KEYS.foot));
    const logo = txt(KEYS.logo);
    if (logo) {
      const cut = Math.ceil(logo.length / 2);
      setText('title-main', logo.slice(0, cut));
      setText('title-fire', logo.slice(cut));
      setText('title-seal-name', logo);
    }
  }

  /* 主按钮先开「六关」列表，玩家自己挑一关（之前直接丢进午门，玩家不知道还有别的关） */
  function enter() {
    const G = window.G;
    if (!G) return;
    if (G.audio && G.audio.sfx) G.audio.sfx('blip');
    if (typeof G.openLevels === 'function') { G.openLevels(); return; }
    if (!G.mod || typeof G.mod.go !== 'function') {
      if (G.ui && G.ui.toast) G.ui.toast('模块化系统没有加载：请检查 index.html 末尾的脚本', 'bad', 2400);
      return;
    }
    G.mod.go('wumen');
  }

  document.addEventListener('click', function (e) {
    let el = e.target;
    while (el && el !== document) {
      if (el.id === 'btn-stage') {
        if (e.preventDefault) e.preventDefault();
        enter();
        return;
      }
      if (el.id === 'btn-legacy-disabled') {
        if (e.preventDefault) e.preventDefault();
        toggleLegacy();
        return;
      }
      el = el.parentNode;
    }
  });

  /* 标题页上按回车也进主线（省得演示时点偏） */
  window.addEventListener('keydown', function (e) {
    const G = window.G;
    if (!G || G.titleActive === false || G.creationOpen) return;
    if (e.key !== 'Enter' && e.key !== 'NumpadEnter') return;
    const t = G.$ && G.$('#title');
    if (!t || t.classList.contains('hidden')) return;
    enter();
  });

  const G0 = window.G;
  if (G0 && G0.str && G0.str.ready && typeof G0.str.ready.then === 'function') {
    G0.str.ready.then(syncCopy).catch(function () { /* 文案没加载时保留静态兜底 */ });
  } else {
    document.addEventListener('DOMContentLoaded', syncCopy);
  }
})();
