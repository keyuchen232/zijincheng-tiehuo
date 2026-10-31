/* ============================================================
   紫禁城 · 铁火 — 午门入园安检
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const $ = G.$;

  G.security = {
    active: false,
    timers: [],
    entered: false,
    mode: 'palace', // 'palace'（午门→故宫）或 'acropolis'（卫城山门→卫城）

    start(mode) {
      if (this.active) return;
      this.mode = mode === 'acropolis' ? 'acropolis' : 'palace';
      this.active = true;
      this.entered = false;
      G.overlayDepth++;
      G.ui.prompt(null);
      G.show($('#security'));
      const acro = this.mode === 'acropolis';
      const badge = document.querySelector('.sec-badge');
      if (badge) badge.textContent = acro ? '卫城山门 · 观众入口' : '午门 · 观众入口';
      $('#sec-sub').textContent = acro ? '请出示证件，随身物品过一下安检' : '请出示身份证件，配合随身行李安检';
      $('#sec-id-text').textContent = acro ? '旅行者 · 通行证' : '旅行者 · 本人证件';
      G.$$('.sec-row').forEach((row) => {
        row.classList.remove('on', 'done');
        row.querySelector('em').textContent = '等待';
      });
      $('#sec-progress-fill').style.width = '0%';
      const btn = $('#sec-enter');
      btn.disabled = true;
      btn.textContent = '安检中…';
      this.timers.forEach((t) => clearTimeout(t));
      this.timers = [];
      this.runStep(0);
    },

    runStep(i) {
      const rows = G.$$('.sec-row');
      if (i >= rows.length) {
        const btn = $('#sec-enter');
        btn.disabled = false;
        btn.textContent = '安检通过 · 进入故宫';
        $('#sec-progress-fill').style.width = '100%';
        $('#sec-sub').textContent = this.mode === 'acropolis'
          ? '安检通过。沿石阶向前，就是卫城山顶。'
          : '安检通过。请从午门门洞入院，祝您参观愉快。';
        $('#sec-enter').textContent = this.mode === 'acropolis' ? '安检通过 · 进入卫城' : '安检通过 · 进入故宫';
        G.audio.sfx('success');
        return;
      }
      const row = rows[i];
      row.classList.add('on');
      row.querySelector('em').textContent = '核验中';
      G.audio.sfx('blip');
      this.timers.push(setTimeout(() => {
        row.classList.remove('on');
        row.classList.add('done');
        row.querySelector('em').textContent = '通过';
        $('#sec-progress-fill').style.width = ((i + 1) / rows.length * 100) + '%';
        G.audio.sfx('blip');
        this.timers.push(setTimeout(() => this.runStep(i + 1), 280));
      }, 760));
    },

    finish() {
      this.timers.forEach((t) => clearTimeout(t));
      this.timers = [];
      G.$$('.sec-row').forEach((row) => {
        row.classList.remove('on');
        row.classList.add('done');
        row.querySelector('em').textContent = '通过';
      });
      $('#sec-progress-fill').style.width = '100%';
      const btn = $('#sec-enter');
      btn.disabled = false;
      btn.textContent = this.mode === 'acropolis' ? '安检通过 · 进入卫城' : '安检通过 · 进入故宫';
      $('#sec-sub').textContent = this.mode === 'acropolis'
        ? '安检通过。沿石阶向前，就是卫城山顶。'
        : '安检通过。请从午门门洞入院，祝您参观愉快。';
    },

    enter() {
      if (this.entered) return;
      this.entered = true;
      const btn = $('#sec-enter');
      btn.disabled = true;
      btn.textContent = '正在开闸…';
      G.audio.sfx('gong');
      setTimeout(() => {
        G.hide($('#security'));
        this.active = false;
        this.timers.forEach((t) => clearTimeout(t));
        this.timers = [];
        G.overlayDepth = Math.max(0, G.overlayDepth - 1);
        if (this.mode === 'acropolis') {
          G.save.flag('acropolisEntered', true);
          G.save.persist();
          if (G.enterAcropolis) G.enterAcropolis();
        } else {
          G.save.flag('entered', true);
          G.save.persist();
          if (G.enterPalace) G.enterPalace();
        }
      }, 520);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = $('#sec-enter');
    if (btn) btn.addEventListener('click', () => G.security.enter());
  });
})();
