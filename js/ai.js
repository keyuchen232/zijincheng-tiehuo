/* ============================================================
   守境人 · 考据台
   - 在线：走 OpenAI 兼容接口（奇绩算力 api.openai-next.com）
   - 离线：本地考据卡检索，保证断网也能演示
   - 规则：只答有依据的；没有依据就说“此处无考据支撑”
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;

  /* 场景锚点：用来告诉 AI「玩家此刻在哪、最近是什么」 */
  const POIS = {
    beijing: [['正阳门', 1100, 1200], ['前门大街', 1100, 1280], ['天安门', 1100, 1000], ['午门', 1100, 880], ['景山', 1100, 700], ['北海白塔', 500, 620], ['天坛', 1500, 1300]],
    gugong: [['午门', 750, 1300], ['内金水桥', 750, 1160], ['太和门', 750, 1080], ['太和殿', 750, 880], ['乾清宫', 750, 650], ['御花园', 750, 400], ['神武门', 750, 200], ['珍宝馆', 990, 380], ['箭亭', 990, 560]],
    fusion: [['午门', 720, 1300], ['中央来源校准台', 720, 700], ['太和殿东庑', 1100, 900], ['帕特农投影', 330, 1250], ['创作终端', 720, 1050], ['狄奥提玛', 820, 1080]],
    home: [['大厅', 560, 700], ['合成台', 480, 520], ['修复台', 660, 520]],
    athens: [['雅典城', 540, 1400], ['卫城方向', 540, 900]],
    acropolis: [['卫城山门', 720, 1300], ['帕特农神庙', 720, 900], ['伊瑞克提翁神庙', 940, 1000], ['圣火台', 720, 700]],
  };

  const CONFIG = (window.WXL_AI && typeof window.WXL_AI === 'object') ? window.WXL_AI : {};
  const BASE = String(CONFIG.base || 'https://api.openai-next.com/v1').replace(/\/+$/, '');
  const MODELS = (Array.isArray(CONFIG.models) && CONFIG.models.length)
    ? CONFIG.models : ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'qwen-plus', 'deepseek-chat'];
  const keyOf = () => {
    try {
      // 演示便利：?ai=<key> 或 ?ai_key=<key> 可临时接入，并记到本机
      let qpKey = '';
      try {
        const sp = new URLSearchParams(location.search);
        qpKey = String(sp.get('ai') || sp.get('ai_key') || '').trim();
        const qpModel = String(sp.get('ai_model') || '').trim();
        if (qpKey) localStorage.setItem('wxl.ai.key', qpKey);
        if (qpModel) localStorage.setItem('wxl.ai.model', qpModel);
      } catch (e) { /* noop */ }
      return String(localStorage.getItem('wxl.ai.key') || CONFIG.key || qpKey || '').trim();
    } catch (e) { return String(CONFIG.key || ''); }
  };
  const modelList = () => {
    let extra = '';
    try { extra = String(localStorage.getItem('wxl.ai.model') || '').trim(); } catch (e) { /* noop */ }
    return extra ? [extra].concat(MODELS.filter((m) => m !== extra)) : MODELS;
  };

  const SUGGESTIONS = {
    beijing: ['中轴线为什么是一条线？', '“门—院—殿”是什么次序？', '《考工记》怎么说都城？'],
    gugong: ['太和殿为什么等级最高？', '午门的五凤楼是什么？', '内金水桥为什么是五座？'],
    fusion: ['这里为什么会有帕特农的投影？', '“来源校准”在纠正什么？', '故宫和卫城能怎么比较？'],
    home: ['合成台和修复台有什么讲究？', '民间木作与宫廷木作差在哪？'],
    athens: ['卫城山门为什么朝那个方向？', '帕特农和故宫能比较什么？'],
    acropolis: ['女像柱为什么能承重？', '多立克柱式有什么特点？', '圣火在仪式里是什么位置？'],
  };

  /* 离线题库：没有 AI 或断网时也能考；答案位置故意打散 */
  const QUIZ_OFFLINE = [
    { card: 'axis', q: '北京中轴线的北端起点是哪儿？', options: ['正阳门', '钟鼓楼', '永定门'], answer: 1, explain: '中轴线北起钟鼓楼、南至永定门，全长约 7.8 公里。' },
    { card: 'gugong', q: '紫禁城始建于哪一年？', options: ['明永乐四年（1406）', '清康熙三十四年（1695）', '明正统元年（1436）'], answer: 0, explain: '永乐四年动工，永乐十八年（1420）建成。' },
    { card: 'axis-order', q: '紫禁城的正门是哪一座？', options: ['神武门', '太和门', '午门'], answer: 2, explain: '午门是紫禁城正门，城台呈凹字形，上建五凤楼。' },
    { card: 'kaogong', q: '“匠人营国”这段理想都城的话，出自哪部典籍？', options: ['《园冶》', '《周礼·考工记》', '《营造法式》'], answer: 1, explain: '《考工记》记方九里、旁三门、九经九纬、左祖右社、面朝后市。' },
    { card: 'taihe', q: '现存太和殿是哪个时期重建的？', options: ['清康熙三十四年（1695）', '明永乐十八年（1420）', '清乾隆十年（1745）'], answer: 0, explain: '现存太和殿为康熙三十四年重建，重檐庑殿顶。' },
    { card: 'wumen', q: '午门城台是什么形状？', options: ['方形', '凸字形', '凹字形'], answer: 2, explain: '午门城台呈凹字形，上建五座楼阁，合称五凤楼。' },
    { card: 'jinshui', q: '太和门前五座汉白玉桥横跨哪条河？', options: ['内金水河', '筒子河', '永定河'], answer: 0, explain: '内金水河自西向东流过太和门，中间一座为御路桥。' },
    { card: 'yuan', q: '《园冶》的作者是谁？', options: ['李渔', '计成', '沈括'], answer: 1, explain: '明·计成著《园冶》，讲“巧于因借，精在体宜”。' },
    { card: 'sunmao', q: '榫卯的典型特点是什么？', options: ['用铁钉钉牢', '用胶粘合', '凹凸咬合、不用钉铆'], answer: 2, explain: '榫卯靠构件凹凸咬合，木构的韧性来自节点。' },
    { card: 'tiehua', q: '打铁花的铁水温度大约是多少？', options: ['约 1600℃', '约 600℃', '约 3000℃'], answer: 0, explain: '铁水约 1600℃，现实中要严格防护，游戏里是安全版本。' },
    { card: 'parthenon', q: '帕特农神庙正面采用的是哪种柱式？', options: ['爱奥尼柱式', '多立克柱式', '科林斯柱式'], answer: 1, explain: '帕特农使用多立克柱式，正面八柱，前 447—前 432 年建成。' },
    { card: 'symmetria', q: '“τάξις καὶ συμμετρία καὶ τὸ ὡρισμένον”出自哪里？', options: ['亚里士多德《形而上学》', '柏拉图《理想国》', '维特鲁威《建筑十书》'], answer: 0, explain: '出自亚里士多德《形而上学》Μ 卷第 3 章，意为秩序、相称、限定。' },
    { card: 'fusion-boundary', q: '故宫与雅典卫城之间是什么关系？', options: ['帕特农是故宫的前身', '没有直接建筑传承，只可比较空间观念', '故宫仿建了帕特农'], answer: 1, explain: '两者没有直接传承；比较空间观念与图像功能可以，编造传承不行。' },
    { card: 'beijing-inheritance', q: '明北京城的轴线与元大都的关系是？', options: ['完全新建，与元大都无关', '照搬长安城的里坊制', '沿用部分旧轴线并重新规划'], answer: 2, explain: '永乐营建既沿用元代旧轴线，也做了新的规划。' },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 上下文 ---------- */
  function sceneId() { return (G.scene && G.scene.id) || 'beijing'; }

  function nearestPois(n) {
    const list = POIS[sceneId()] || POIS.beijing;
    const p = (G.scene && G.scene.player) || { x: 0, y: 0 };
    return list
      .map(([name, x, y]) => ({ name, d: Math.hypot(p.x - x, p.y - y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, n || 3);
  }

  function placeLabel() {
    const names = { beijing: '北京 · 中轴线', gugong: '紫禁城', fusion: '万象灵境 · 沙盘', home: '家 · 大厅', athens: '雅典城', acropolis: '卫城' };
    return names[sceneId()] || (G.sceneName || '未知之地');
  }

  function codexTitles() {
    const ids = (G.save && G.save.data && G.save.data.codex) || [];
    const data = G.CODEX_DATA || {};
    return ids.filter((id) => data[id]).map((id) => data[id].title).slice(0, 6);
  }

  function systemPrompt() {
    const cards = (G.KB || []).map((k) => `【${k.id}】${k.title}（${k.source}）：${k.text}`).join('\n');
    return [
      '你是像素游戏《紫禁城 · 铁火》里的“守境人”，回答玩家关于北京中轴线、紫禁城、雅典卫城、非遗技艺与游戏设定的问题。',
      '规则：',
      '1. 只依据下面“考据卡”回答；考据卡里没有依据时，第一句必须写“此处无考据支撑”，然后只给一句可核对的邻近常识或提示玩家去找哪处线索，不要编造细节。',
      '2. 回答不超过 90 字，尽量口语；引用时在句末用（考据：卡片标题）标出依据。',
      '3. 严格区分“比较”与“传承”：不得声称故宫与卫城之间存在直接建筑传承；间接传播只能说明交流，不能证明实物进入。',
      '4. 语气像守境人：平静、克制，不用感叹号，不客套。',
      '考据卡：',
      cards,
      '玩家位置：' + placeLabel() + '；最近的地标：' + nearestPois(3).map((p) => p.name).join('、') + '。',
      '玩家已解锁的图鉴：' + (codexTitles().join('、') || '暂无') + '。',
    ].join('\n');
  }

  /* ---------- 本地检索（离线降级） ---------- */
  function scoreCard(k, q) {
    let s = 0;
    for (const w of (k.keywords || [])) if (q.includes(w)) s += w.length >= 2 ? 2 : 1;
    if (k.title && q.includes(k.title)) s += 3;
    return s;
  }

  function localAnswer(q) {
    const qq = q.toLowerCase();
    const scored = (G.KB || []).map((k) => ({ k, s: scoreCard(k, qq) })).sort((a, b) => b.s - a.s);
    const best = scored[0];
    if (best && best.s >= 2) {
      const k = best.k;
      return { answer: k.text + '（考据：' + k.title + '）', sources: [k], refused: false };
    }
    const nearby = nearestPois(3).map((p) => p.name).join('、');
    return {
      answer: '此处无考据支撑。此刻你在' + placeLabel() + '，最近的是' + nearby + '；可以问一问它们各自的来历，或者去别处再看看。',
      sources: [], refused: true,
    };
  }

  /* ---------- 远程调用 ---------- */
  async function remoteAnswer(q) {
    const key = keyOf();
    if (!key) throw new Error('no-key');
    const body = {
      messages: [
        { role: 'system', content: systemPrompt() },
        { role: 'user', content: q },
      ],
      temperature: 0.3,
      max_tokens: 300,
    };
    const attempt = (model) => new Promise((resolve, reject) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => { try { ctl.abort(); } catch (e) { /* noop */ } reject(new Error('timeout')); }, 12000);
      fetch(BASE + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify(Object.assign({ model }, body)),
        signal: ctl.signal,
      }).then(async (res) => {
        if (res.status === 401 || res.status === 403) throw new Error('auth-failed');
        if (!res.ok) throw new Error('http-' + res.status);
        const data = await res.json();
        const text = ((data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
        if (!text) throw new Error('empty');
        return { text, model };
      }).then((v) => { clearTimeout(timer); resolve(v); },
        (e) => { clearTimeout(timer); reject(e); });
    });
    // 并发竞速：哪个模型先给出有效回答就用哪个，避免单模型抖动拖慢演示
    let winner = null;
    try {
      winner = await Promise.any(modelList().map(attempt));
    } catch (agg) {
      const errs = (agg && agg.errors) || [];
      if (errs.some((e) => e && e.message === 'auth-failed')) throw new Error('auth-failed');
      throw new Error('models-failed');
    }
    const text = winner.text;
    const refused = text.includes('无考据支撑');
    return { answer: text, sources: sourcesFor(q + text), refused, model: winner.model };
  }

  function sourcesFor(text) {
    const t = String(text || '');
    return (G.KB || [])
      .map((k) => ({ k, s: scoreCard(k, t) + (t.includes(k.title) ? 4 : 0) }))
      .filter((x) => x.s >= 2)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.k);
  }

  /* ---------- UI ---------- */
  G.ai = {
    open: false,
    busy: false,
    init() {
      if (this.el) return;
      const wrap = document.createElement('section');
      wrap.id = 'ai-panel';
      wrap.className = 'ai-panel hidden';
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      wrap.setAttribute('aria-label', '守境人 · 考据台');
      wrap.innerHTML = '' +
        '<div class="ai-card">' +
        '  <div class="ai-head">' +
        '    <span class="ai-seal">考</span>' +
        '    <span class="ai-title">守境人 · 考据台</span>' +
        '    <span class="ai-count" id="ai-count">考据 0/' + ((G.KB || []).length) + '</span>' +
        '    <span class="ai-mode" id="ai-mode">离线考据</span>' +
        '    <button class="ai-close" id="ai-close" type="button">返回探索</button>' +
        '  </div>' +
        '  <p class="ai-place" id="ai-place"></p>' +
        '  <div class="ai-chips" id="ai-chips"></div>' +
        '  <div class="ai-quiz hidden" id="ai-quiz"></div>' +
        '  <div class="ai-input">' +
        '    <textarea id="ai-q" rows="2" maxlength="160" placeholder="问问这座城……（Enter 发问，Shift+Enter 换行）"></textarea>' +
        '    <button id="ai-send" type="button">问</button>' +
        '  </div>' +
        '  <div class="ai-log" id="ai-log"></div>' +
        '  <p class="ai-note">只回答有考据支撑的问题；说不清时会直接说“此处无考据支撑”。</p>' +
        '</div>';
      document.body.appendChild(wrap);
      this.el = wrap;
      this.log = wrap.querySelector('#ai-log');
      this.q = wrap.querySelector('#ai-q');
      this.mode = wrap.querySelector('#ai-mode');
      wrap.querySelector('#ai-close').addEventListener('click', () => this.close());
      wrap.querySelector('#ai-send').addEventListener('click', () => this.submit());
      this.q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submit(); }
        if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        e.stopPropagation();
      });
      wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) this.close(); });
      this.syncMode();
    },
    syncMode() {
      if (!this.mode) return;
      const on = !!keyOf();
      this.mode.textContent = on ? ('已接入 AI' + (this.model ? ' · ' + this.model : '')) : '离线考据 · 无密钥';
      this.mode.classList.toggle('online', on);
    },
    show() {
      if (this.open) return;
      this.init();
      this.open = true;
      G.overlayDepth++;
      G.input.clearPressed();
      this.el.classList.remove('hidden');
      this.el.querySelector('#ai-place').textContent = '此刻在：' + placeLabel() + ' · ' + nearestPois(3).map((p) => p.name).join(' / ');
      this.renderChips();
      this.syncMode();
      this.syncCount();
      setTimeout(() => this.q.focus(), 30);
      G.audio.sfx && G.audio.sfx('page');
    },
    close() {
      if (!this.open) return;
      this.open = false;
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.input.clearPressed();
      this.el.classList.add('hidden');
    },
    toggle() { if (this.open) this.close(); else this.show(); },
    renderChips() {
      const chips = (SUGGESTIONS[sceneId()] || SUGGESTIONS.beijing).slice(0, 3);
      const box = this.el.querySelector('#ai-chips');
      box.innerHTML = '';
      for (const c of chips) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ai-chip';
        b.textContent = c;
        b.addEventListener('click', () => { this.q.value = c; this.submit(); });
        box.appendChild(b);
      }
      const quiz = document.createElement('button');
      quiz.type = 'button';
      quiz.className = 'ai-chip ai-chip-quiz';
      quiz.textContent = '考考我';
      quiz.addEventListener('click', () => this.startQuiz());
      box.appendChild(quiz);
    },

    /* ---------- 考据问答 ---------- */
    async startQuiz() {
      if (this.quizLive) return;
      this.quizLive = true;
      this.el.querySelector('.ai-input').classList.add('hidden');
      this.el.querySelector('#ai-chips').classList.add('hidden');
      this.addBubble('a', '好。我出一题，你选一个。不会就点「看答案」，我把出处摊开。');
      let quiz = null;
      if (keyOf()) {
        try { quiz = await this.remoteQuiz(); } catch (e) { quiz = null; }
      }
      if (!quiz) {
        quiz = this.offlineQuiz();
        if (this.mode && keyOf()) { this.mode.textContent = 'AI 不可用 · 离线考据'; this.mode.classList.remove('online'); }
      }
      this.quiz = quiz;
      this.renderQuiz(quiz);
    },
    async remoteQuiz() {
      const cards = G.KB || [];
      if (!cards.length) return null;
      const card = cards[Math.floor(Math.random() * cards.length)];
      const sys = '你是考据出题人。只依据给定考据卡，出 1 道 3 选 1 的单项选择题，考察卡里的具体事实（时间、地点、构件、出处）。' +
        '严格输出 JSON，不要多余文字：{"q":"题干","options":["A","B","C"],"answer":0,"explain":"不超过 60 字的解释"}';
      const user = '考据卡：' + card.title + '。' + card.text;
      const key = keyOf();
      const body = { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], temperature: 0.5, max_tokens: 260 };
      for (const model of modelList()) {
        try {
          const ctl = new AbortController();
          const timer = setTimeout(() => { try { ctl.abort(); } catch (e) { /* noop */ } }, 12000);
          let res;
          try {
            res = await fetch(BASE + '/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
              body: JSON.stringify(Object.assign({ model }, body)),
              signal: ctl.signal,
            });
          } finally { clearTimeout(timer); }
          if (!res.ok) continue;
          const data = await res.json();
          const raw = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '');
          const m = raw.match(/\{[\s\S]*\}/);
          if (!m) continue;
          const q = JSON.parse(m[0]);
          if (!q || typeof q.q !== 'string' || !Array.isArray(q.options) || q.options.length !== 3) continue;
          const idx = Number(q.answer);
          if (!(idx >= 0 && idx < 3)) continue;
          const clean = (t) => String(t).replace(/^\s*[A-Ca-c][.、:：)）]\s*/, '').trim();
          const opts = q.options.map(clean);
          return { q: String(q.q), options: opts, answer: idx, explain: String(q.explain || ''), card, source: 'AI 出题 · ' + card.title };
        } catch (e) { /* next model */ }
      }
      return null;
    },
    offlineQuiz() {
      const bank = QUIZ_OFFLINE;
      const pick = bank[Math.floor(Math.random() * bank.length)];
      const card = (G.KB || []).find((k) => k.id === pick.card) || null;
      return { q: pick.q, options: pick.options, answer: pick.answer, explain: pick.explain, card, source: '离线题 · ' + (card ? card.title : '') };
    },
    renderQuiz(quiz) {
      const box = this.el.querySelector('#ai-quiz');
      box.innerHTML = '';
      box.classList.remove('hidden');
      const qEl = document.createElement('p');
      qEl.className = 'ai-quiz-q';
      qEl.textContent = quiz.q;
      box.appendChild(qEl);
      const opts = document.createElement('div');
      opts.className = 'ai-quiz-opts';
      quiz.options.forEach((text, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ai-quiz-opt';
        b.textContent = String.fromCharCode(65 + i) + ' · ' + text;
        b.addEventListener('click', () => this.answerQuiz(i, false));
        opts.appendChild(b);
      });
      box.appendChild(opts);
      const hint = document.createElement('p');
      hint.className = 'ai-quiz-hint';
      hint.textContent = '不会就点「看答案」；选完会告诉你出处。';
      box.appendChild(hint);
      const acts = document.createElement('div');
      acts.className = 'ai-quiz-acts';
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'ai-quiz-btn';
      reveal.textContent = '看答案';
      reveal.addEventListener('click', () => this.answerQuiz(this.quiz.answer, true));
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'ai-quiz-btn';
      again.textContent = '再来一题';
      again.addEventListener('click', () => this.nextQuiz());
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'ai-quiz-btn ai-quiz-back';
      back.textContent = '回到提问';
      back.addEventListener('click', () => this.exitQuiz());
      acts.append(reveal, again, back);
      box.appendChild(acts);
    },
    answerQuiz(i, revealed) {
      const quiz = this.quiz;
      if (!quiz || quiz._done) return;
      quiz._done = true;
      const box = this.el.querySelector('#ai-quiz');
      const opts = [...box.querySelectorAll('.ai-quiz-opt')];
      const ok = i === quiz.answer;
      opts.forEach((b, j) => {
        b.disabled = true;
        if (j === quiz.answer) b.classList.add('is-right');
        if (j === i && !ok) b.classList.add('is-wrong');
      });
      const res = document.createElement('p');
      res.className = 'ai-quiz-result ' + (ok ? 'ok' : 'bad');
      res.textContent = (revealed ? '答案是：' : (ok ? '答对了。' : '答错了。')) + quiz.explain;
      box.appendChild(res);
      this.addNotice(quiz.source || '');
      if (quiz.card) { this.addSources([quiz.card]); this.recordSources([quiz.card]); }
    },
    nextQuiz() {
      const box = this.el.querySelector('#ai-quiz');
      box.innerHTML = '';
      this.quiz = null;
      this.startQuiz();
    },
    exitQuiz() {
      this.quizLive = false;
      this.quiz = null;
      const box = this.el.querySelector('#ai-quiz');
      box.classList.add('hidden');
      box.innerHTML = '';
      this.el.querySelector('.ai-input').classList.remove('hidden');
      this.el.querySelector('#ai-chips').classList.remove('hidden');
      this.q.focus();
    },
    ask(text) { this.q.value = text; this.submit(); },
    recordSources(cards) {
      if (!cards || !cards.length || !G.save) return;
      const d = G.save.data;
      if (!Array.isArray(d.kbSeen)) d.kbSeen = [];
      for (const k of cards) {
        if (d.kbSeen.includes(k.id)) continue;
        d.kbSeen.push(k.id);
        G.save.persist();
        G.ui && G.ui.toast('考据收录 · 《' + k.title + '》（' + d.kbSeen.length + '/' + (G.KB || []).length + '）', 'good', 2400);
      }
      this.syncCount();
    },
    syncCount() {
      const el = this.el && this.el.querySelector('#ai-count');
      if (!el) return;
      const n = (G.save && Array.isArray(G.save.data.kbSeen)) ? G.save.data.kbSeen.length : 0;
      el.textContent = '考据 ' + n + '/' + (G.KB || []).length;
    },
    async submit() {
      const q = (this.q.value || '').trim();
      if (!q || this.busy) return;
      this.busy = true;
      this.q.value = '';
      this.addBubble('q', q);
      const thinking = this.addBubble('a', '守境人正在翻考据卡……', true);
      let result = null;
      try {
        result = await remoteAnswer(q);
      } catch (e) {
        const why = (e && (e.message === 'no-key' || e.message === 'auth-failed')) ? '未接入密钥，改用本地考据卡' : '服务未就绪，改用本地考据卡';
        if (e && e.message === 'auth-failed') this.mode.textContent = '密钥无效 · 离线考据';
        result = localAnswer(q);
        result.notice = why;
      }
      if (result.model) { this.model = result.model; this.syncMode(); }
      thinking.remove();
      this.addBubble('a', result.answer);
      if (result.notice) this.addNotice(result.notice);
      if (result.sources && result.sources.length) { this.addSources(result.sources); this.recordSources(result.sources); }
      if (result.refused && result.sources && result.sources.length) this.addNotice('已标注来源，可点开核对。');
      this.busy = false;
      this.log.scrollTop = this.log.scrollHeight;
    },
    addBubble(kind, text, thinking) {
      const el = document.createElement('div');
      el.className = 'ai-bubble ' + (kind === 'q' ? 'ai-bubble-q' : 'ai-bubble-a') + (thinking ? ' ai-thinking' : '');
      el.innerHTML = '<span class="ai-who">' + (kind === 'q' ? '你' : '守境人') + '</span><p>' + esc(text) + '</p>';
      this.log.appendChild(el);
      this.log.scrollTop = this.log.scrollHeight;
      return el;
    },
    addNotice(text) {
      const el = document.createElement('p');
      el.className = 'ai-notice';
      el.textContent = text;
      this.log.appendChild(el);
    },
    addSources(cards) {
      const box = document.createElement('div');
      box.className = 'ai-sources';
      for (const k of cards) {
        const det = document.createElement('details');
        det.className = 'ai-source';
        det.innerHTML = '<summary>考据 · ' + esc(k.title) + '</summary><p>' + esc(k.text) + '</p>' +
          '<p class="ai-src-src">出处：' + esc(k.source) + '</p>' +
          (k.url ? '<a href="' + esc(k.url) + '" target="_blank" rel="noopener">核对原文</a>' : '');
        box.appendChild(det);
      }
      this.log.appendChild(box);
    },
  };
})();
