/* Original vector painting with local atmospheric animation. No image API. */
(function () {
  'use strict';
  const title = document.getElementById('title');
  if (!title) return;
  const world = document.createElement('div');
  world.className = 'title-poster-world';
  world.setAttribute('aria-hidden', 'true');
  const wash = document.createElement('div');
  wash.className = 'title-poster-wash';
  wash.style.backgroundImage = 'radial-gradient(ellipse at 76% 35%, #99d6d0, transparent 55%)';
  const orbit = document.createElement('div');
  orbit.className = 'title-atlas-orbit';
  const frame = document.createElement('div');
  frame.className = 'title-poster-frame';
  const image = document.createElement('img');
  image.className = 'title-poster-image';
  image.src = 'assets/title/realm-redrawn.svg';
  image.alt = '';
  image.decoding = 'async';
  frame.append(image);
  world.append(wash, orbit, frame);
  title.prepend(world);
  image.addEventListener('load', () => { title.dataset.posterReady = 'true'; });
  image.addEventListener('error', () => {
    title.classList.add('poster-unavailable');
    console.warn('Redrawn title illustration could not load; using procedural title background.');
  });
  const mist = document.createElement('div');
  mist.className = 'title-mist';
  mist.setAttribute('aria-hidden', 'true');
  const motes = document.createElement('div');
  motes.className = 'title-motes';
  motes.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 28; i++) {
    const mote = document.createElement('i');
    mote.style.cssText = '--x:' + (36 + (i * 37 % 63)) + '%;--y:' + (12 + (i * 23 % 82)) + '%;--size:' + (2 + i % 3) + 'px;--duration:' + (7 + i % 8) + 's;--delay:-' + (i * .73) + 's';
    motes.append(mote);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'title-motion-toggle';
  toggle.id = 'title-motion-toggle';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function sync(paused) {
    title.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = preference.matches ? '静态画面 · 跟随系统' : (paused ? '播放动态 ◇' : '暂停动态 ◇');
    toggle.disabled = preference.matches;
  }
  // Title shortcuts listen on window; keep focused motion controls local.
  window.addEventListener('keydown', (event) => {
    if (document.activeElement !== toggle || !['Enter', ' ', 'Spacebar'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.repeat && !toggle.disabled) toggle.click();
  }, true);
  toggle.addEventListener('click', () => sync(!title.classList.contains('motion-paused')));
  preference.addEventListener('change', () => sync(preference.matches));
  sync(preference.matches);
  title.append(mist, motes, toggle);
})();
