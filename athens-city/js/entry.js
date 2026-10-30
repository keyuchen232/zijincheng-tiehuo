/* ============================================================
   雅典 · 圣火 — Propylaea entrance check
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const $ = G.$;

  G.security = {
    active: false,
    timers: [],
    entered: false,

    start() {
      if (this.active) return;
      this.active = true;
      this.entered = false;
      G.overlayDepth++;
      G.ui.prompt(null);
      G.show($('#security'));
      $('#sec-sub').textContent = '请出示证件，随身物品过一下安检';
      $('#sec-id-text').textContent = '旅行者 · 本人证件';
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
        btn.textContent = '安检通过 · 登上卫城';
        $('#sec-progress-fill').style.width = '100%';
        $('#sec-sub').textContent = '安检通过。请从山门门洞上山，祝您参观愉快。';
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
      btn.textContent = '安检通过 · 登上卫城';
      $('#sec-sub').textContent = '安检通过。请从山门门洞上山，祝您参观愉快。';
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
        G.save.flag('entered', true);
        G.save.persist();
        if (G.enterAcropolis) G.enterAcropolis();
      }, 520);
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = $('#sec-enter');
    if (btn) btn.addEventListener('click', () => G.security.enter());
  });
})();
