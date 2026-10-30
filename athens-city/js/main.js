/* ============================================================
   雅典 · 圣火 — boot, title, scenes, UI glue
   ============================================================ */
(function () {
  'use strict';
  const G = window.G;
  const A = G.art;
  const $ = G.$;

  /* ============================================================
     codex data
     ============================================================ */
  G.CODEX_DATA = {
    axis: { title: '泛雅典娜大道', sub: 'PANATHENAIC WAY', text: '从凯拉米克斯的迪皮隆门出发，穿过古市集，一路爬上卫城。泛雅典娜节的队伍就走在这条路上，把新织的长袍献给雅典娜。' },
    acropolis: { title: '雅典卫城', sub: 'THE ACROPOLIS', text: '希腊语意为「高处的城邦」。公元前五世纪重建，帕特农神庙、厄瑞克忒翁神庙与山门至今仍立在山顶，是雅典最醒目的轮廓。' },
    parthenon: { title: '帕特农神庙', sub: 'THE PARTHENON', text: '公元前 447 年起建，供奉雅典娜·帕特诺斯。八根柱子迎向东升的太阳，山花里刻着她诞生的故事。整座神庙没有一根绝对的直线。' },
    erechtheion: { title: '厄瑞克忒翁神庙', sub: 'THE ERECHTHEION', text: '传说雅典娜与波塞冬在这里争当城市的守护神。南廊的六位少女雕像用头顶着屋檐，雨落下来的时候，她们先接着。' },
    propylaea: { title: '卫城山门', sub: 'THE PROPYLAEA', text: '卫城唯一的入口，建在西坡的陡处。中间是宽大的门廊，两侧各有一座翼廊——从这道门进去，才算真正上了卫城。' },
    nike: { title: '雅典娜·尼刻神庙', sub: 'TEMPLE OF ATHENA NIKE', text: '供奉胜利女神尼刻的小神庙，立在山门南翼的堡台上。传说尼刻没有翅膀，好让胜利永远留在雅典。' },
    promachos: { title: '雅典娜·普罗马霍斯', sub: 'ATHENA PROMACHOS', text: '「先锋雅典娜」的巨型铜像，从前站在卫城正中。盾与长矛在阳光下能远远望见，据说水手拿它当航标。' },
    altar: { title: '雅典娜祭坛', sub: 'ALTAR OF ATHENA', text: '卫城北缘的祭坛，正对着帕特农神庙的西山墙。泛雅典娜节的火，就是从这里点起来的。' },
    theater: { title: '狄俄尼索斯剧场', sub: 'THEATRE OF DIONYSUS', text: '卫城南坡上的露天剧场，可容一万七千人。悲剧与喜剧都从这里的酒神节里长出来。' },
    agora: { title: '古市集', sub: 'ANCIENT AGORA', text: '阿塔罗斯柱廊长达一百多米，是雅典人买卖、闲谈、听哲学的地方。苏格拉底常在这一带的柱廊下跟人辩到天黑。' },
    hephaisteion: { title: '赫淮斯托斯神庙', sub: 'THE HEPHAISTEION', text: '希腊保存得最完整的一座古神庙，供奉火与锻造之神赫淮斯托斯。它比帕特农小，却几乎没塌过。' },
    zeus: { title: '奥林匹亚宙斯神庙', sub: 'TEMPLE OF OLYMPIAN ZEUS', text: '曾经有一百零四根科林斯柱，如今只剩十五根立着。倒下的一根，还躺在原地，像睡着的巨兽。' },
    hadrian: { title: '哈德良拱门', sub: "HADRIAN'S ARCH", text: '公元二世纪的罗马拱门，一面写着「这里是雅典，忒修斯的旧城」，另一面写着「这里是哈德良的新城」。' },
    syntagma: { title: '宪法广场', sub: 'SYNTAGMA', text: '议会大厦前的无名战士纪念碑下，两名穿白色短裙的卫兵每整点换岗。广场的名字来自 1843 年在这里颁布的宪法。' },
    plaka: { title: '普拉卡老城', sub: 'PLAKA', text: '卫城北坡下的老街区。白墙、九重葛、窄巷，柠檬树从院墙里探出来。巷子尽头有一家开了很久的铜匠铺。' },
    monastiraki: { title: '蒙纳斯提拉奇', sub: 'MONASTIRAKI', text: '跳蚤市场摊开在教堂脚下：旧铜器、唱片、橄榄木勺，还有一筐一筐的干无花果。' },
    lycabettus: { title: '吕卡维多斯山', sub: 'MOUNT LYCABETTUS', text: '雅典最高的点。山下的城市摊开成一片白，远处是比雷埃夫斯港和萨罗尼克湾。' },
    piraeus: { title: '比雷埃夫斯港', sub: 'PIRAEUS', text: '雅典的港口。古时候，橄榄油和陶器从这里运往整个地中海；今天是希腊最忙的客货运港口。' },
    olive: { title: '橄榄树', sub: 'THE OLIVE TREE', text: '雅典娜把橄榄树送给这座城市。银灰的叶子在风里翻过来，像一片安静的海。它耐旱、长寿，也榨得出最好的油。' },
    museum: { title: '卫城博物馆', sub: 'ACROPOLIS MUSEUM', text: '玻璃地板下是两千年前的街区地基，头顶是同样尺寸的帕特农柱廊。真品与复制品隔着玻璃对望。' },
    sacredfire: { title: '圣火', sub: 'THE SACRED FIRE', text: '在希腊，火是神的、也是人的。奥林匹亚的采火、泛雅典娜节的火炬，都由橄榄木与松脂点起。火熄了可以再点，人聚起来却不容易。' },
    cat: { title: '卫城的猫', sub: 'ACROPOLIS CATS', text: '卫城和大理石之间生活着一群猫。它们白天在柱影里睡觉，太阳落山后，就成了这山顶上最从容的居民。' },
    craftbench: { title: '家 · 铜匠台', sub: 'BRONZE BENCH', text: '靠窗的铜匠台立着一只小铁砧，旁边是锤子、钳子和一排黄铜模具。以后可以在这里拆解、拼合材料，制作新的物件。' },
    repairbench: { title: '家 · 修复台', sub: 'RESTORATION BENCH', text: '修复台有一盏带放大镜的铜灯、竹镊、毛笔、鱼鳔胶和金粉。碎陶可以沿着裂缝补上金线，旧木器可以重新打磨。' },
    sundial: { title: '日晷 · 校日', sub: 'THE SUNDIAL', text: '一块刻着时辰的石盘。影子长的时候是清晨，短的时候是正午。匠人们就靠它一次次校回一整个上午。' },
    oil: { title: '橄榄油 · 以物易物', sub: 'THE OLIVE ECONOMY', text: '一棵橄榄树，能喂饱一家、照亮一晚、换回一半家当。雅典的土话里，把“油”也叫做“流动的家当”。' },
    oilLamp: { title: '小铜油灯', sub: 'OIL LAMP', text: '一盏巴掌大的铜灯，灯芯捻得细细的。夜里能照亮窗台一小片，猫常蹲在那片光里。' },
    oilAmphora: { title: '有纹饰的油罐', sub: 'PAINTED AMPHORA', text: '红绘的黑陶罐，画着一条海豚和几圈浪纹。摊主说，这是亚特兰提斯老手艺，别处买不着。' },
    oilWreath: { title: '橄榄枝环', sub: 'OLIVE WREATH', text: '一圈编紧的橄榄枝，挂在院门上，门口就有一份平平安安的味道。' },
  };

  /* ============================================================
     codex UI
     ============================================================ */
  const codex = {
    open: false,
    tab: 'palace',
    init() {
      $('#btn-codex').addEventListener('click', () => this.toggle());
      $('#codex-close').addEventListener('click', () => this.close());
      G.$$('.drawer-tabs button').forEach((b) => {
        b.addEventListener('click', () => {
          this.tab = b.dataset.tab;
          G.$$('.drawer-tabs button').forEach((x) => x.classList.toggle('on', x === b));
          this.render();
          G.audio.sfx('page');
        });
      });
    },
    toggle() {
      if (this.open) this.close();
      else this.show();
    },
    show() {
      if (this.open) return;
      this.open = true;
      G.overlayDepth++;
      G.input.clearPressed();
      G.show($('#codex'));
      this.render();
      G.audio.sfx('page');
    },
    close() {
      if (!this.open) return;
      this.open = false;
      G.hide($('#codex'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.input.clearPressed();
    },
    render() {
      const body = $('#codex-body');
      body.innerHTML = '';
      if (this.tab === 'palace') {
        for (const id of Object.keys(G.CODEX_DATA)) {
          const d = G.CODEX_DATA[id];
          const unlocked = G.save.data.codex.includes(id);
          const el = document.createElement('div');
          el.className = 'codex-item' + (unlocked ? '' : ' locked');
          el.innerHTML = '<h3>' + (unlocked ? d.title : '未解锁') + '<small>' + (unlocked ? d.sub : '???') + '</small></h3>' +
            '<p>' + (unlocked ? d.text : '在旅途中找到这处地方，手账会自动记下它。') + '</p>';
          body.appendChild(el);
        }
      } else if (this.tab === 'gallery') {
        // photo-journal + oil economy showcase
        const specCodes = {
          oil: 'oil', oilLamp: 'oilLamp', oilAmphora: 'oilAmphora', oilWreath: 'oilWreath',
        };
        const intro = document.createElement('div');
        intro.className = 'codex-item';
        intro.innerHTML = '<h3>我的藏品<small>GALLERY</small></h3><p>一路上的光影、橄榄油换来的旧物件，都收在这里。</p>';
        body.appendChild(intro);
        // photos
        for (const id of Object.keys(G.photo.spots || {})) {
          const sp = G.photo.spots[id];
          const have = G.save.hasPhoto(id);
          const el = document.createElement('div');
          el.className = 'codex-item' + (have ? '' : ' locked');
          el.innerHTML = '<h3>' + (have ? ('◍ ' + sp.title) : '未拍摄') + '<small>' + (have ? '已留影' : '???') + '</small></h3>' +
            '<p>' + (have ? sp.blurb : '在对应的机位按 E 拍下一张。') + '</p>';
          body.appendChild(el);
        }
        // economy goods
        const row = document.createElement('div');
        row.className = 'codex-item';
        const hasOilLamp = G.save.flag('oilLamp');
        const hasAmphora = G.save.flag('oilAmphora');
        const hasWreath = G.save.flag('oilWreath');
        row.innerHTML = '<h3>现行油量<small>OLIVE OIL</small></h3><p>陶瓶里还有 ' + (G.save.data.oil || 0) + ' 瓶橄榄油。可以去蒙纳斯提拉奇市集换东西。</p>';
        body.appendChild(row);
        const goods = [
          ['小铜油灯', hasOilLamp, 'oilLamp'],
          ['有纹饰的油罐', hasAmphora, 'oilAmphora'],
          ['橄榄枝环', hasWreath, 'oilWreath'],
        ];
        for (const [name, owned, code] of goods) {
          const g = document.createElement('div');
          g.className = 'codex-item' + (owned ? '' : ' locked');
          g.innerHTML = '<h3>' + (owned ? name : '未换得') + '<small>' + (owned ? '已入手' : '???') + '</small></h3>' +
            '<p>' + (owned ? (G.CODEX_DATA[code] ? G.CODEX_DATA[code].text : '') || '一件从市集换来的小物件。' : '在蒙纳斯提拉奇市集用橄榄油换取。') + '</p>';
          body.appendChild(g);
        }
      } else {
        const f = G.save.data.flags;
        const rows = [
          ['已经上山', f.entered ? '是' : '否'],
          ['找到老赫', f.metHephaistos ? '是' : '否'],
          ['圣火材料', ['olive', 'resin', 'brazier'].filter((k) => f[k]).length + ' / 3'],
          ['看过圣火', f.finished ? '是' : '否'],
          ['日晷最佳', (G.save.data.obeliskBest || 0).toLocaleString('zh-CN') + ' 分'],
          ['圣火最佳', (G.save.data.best || 0).toLocaleString('zh-CN') + ' 分'],
          ['挑战次数', String(G.save.data.plays || 0)],
          ['图鉴收集', G.save.data.codex.filter((id) => G.CODEX_DATA[id]).length + ' / ' + Object.keys(G.CODEX_DATA).length],
        ];
        const intro = document.createElement('div');
        intro.className = 'codex-item';
        intro.innerHTML = '<h3>旅行手账<small>TRAVEL NOTES</small></h3><p>从迪皮隆门到卫城山顶，一页一页，把这一程走成一条线。</p>';
        body.appendChild(intro);
        for (const [k, v] of rows) {
          const r = document.createElement('div');
          r.className = 'trip-row';
          r.innerHTML = '<span>' + k + '</span><b>' + v + '</b>';
          body.appendChild(r);
        }
      }
    },
  };

  /* ============================================================
     pause menu
     ============================================================ */
  const menu = {
    open: false,
    init() {
      $('#btn-menu').addEventListener('click', () => this.show());
      $('#menu-resume').addEventListener('click', () => this.close());
      $('#menu-sound').addEventListener('click', () => { G.toggleSound(); this.sync(); });
      $('#menu-reset').addEventListener('click', () => {
        G.confirm('重新开始？', '当前进度、图鉴与最佳成绩都会被清除。', () => {
          G.save.reset(false);
          location.reload();
        });
      });
      G.$('#menu').addEventListener('click', (e) => { if (e.target.id === 'menu') this.close(); });
    },
    show() {
      if (this.open) return;
      if (G.dialog.active || G.security.active) return;
      this.open = true;
      G.overlayDepth++;
      G.show($('#menu'));
      this.sync();
      G.audio.sfx('page');
    },
    close() {
      if (!this.open) return;
      this.open = false;
      G.hide($('#menu'));
      G.overlayDepth = Math.max(0, G.overlayDepth - 1);
      G.input.clearPressed();
    },
    sync() {
      $('#menu-sound span').textContent = '声音：' + (G.audio.enabled ? '开' : '关');
    },
  };

  G.confirm = function (title, text, onYes, onNo) {
    const el = $('#confirm');
    if (!el) return;
    $('#confirm-title').textContent = title || '确定吗？';
    $('#confirm-text').textContent = text || '';
    this._confirmYes = onYes || null;
    this._confirmNo = onNo || null;
    this.confirmOpen = true;
    G.overlayDepth++;
    G.show(el);
    G.input.clearPressed();
    G.audio.sfx('page');
  };
  G.closeConfirm = function (yes) {
    if (!G.confirmOpen) return;
    G.confirmOpen = false;
    G.hide($('#confirm'));
    G.overlayDepth = Math.max(0, G.overlayDepth - 1);
    G.input.clearPressed();
    const cb = yes ? this._confirmYes : this._confirmNo;
    this._confirmYes = null;
    this._confirmNo = null;
    if (cb) setTimeout(cb, 20);
  };

  G.toggleSound = function () {
    if (!G.audio.ctx) G.audio.init();
    G.audio.setEnabled(!G.audio.enabled);
    G.audio.resume();
    const btn = $('#btn-sound');
    if (btn) btn.textContent = G.audio.enabled ? '♪' : '×';
    menu.sync();
    if (G.audio.enabled) G.audio.sfx('confirm');
  };

  G.unlock = function (id) {
    if (!G.CODEX_DATA[id]) return false;
    if (G.save.addCodex(id)) {
      G.ui.toast('图鉴 +1 · ' + G.CODEX_DATA[id].title, 'good', 2200);
      G.audio.sfx('pickup');
      return true;
    }
    return false;
  };

  /* ============================================================
     title background
     ============================================================ */
  const titleArt = {
    t: 0,
    draw(ctx) {
      const t = this.t;
      const g = ctx.createLinearGradient(0, 0, 0, 360);
      g.addColorStop(0, '#070b18');
      g.addColorStop(0.48, '#191323');
      g.addColorStop(0.75, '#2b1820');
      g.addColorStop(1, '#100b0b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 640, 360);
      // stars
      for (let i = 0; i < 90; i++) {
        const x = G.hash(i, 1, 91) * 640;
        const y = G.hash(i, 2, 92) * 230;
        const a = 0.2 + G.hash(i, 3, 93) * 0.7;
        const tw = 0.6 + 0.4 * Math.sin(t * 1.2 + i);
        ctx.globalAlpha = a * tw;
        ctx.fillStyle = '#e7e9ff';
        ctx.fillRect(Math.round(x), Math.round(y), G.hash(i, 4, 94) > 0.9 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
      // moon
      A.glow(ctx, 512, 62, 70, 'rgba(230,205,150,.18)', 0.6);
      ctx.fillStyle = '#f1e4c1';
      ctx.beginPath(); ctx.arc(512, 62, 18, 0, G.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(205,190,150,.5)';
      ctx.beginPath(); ctx.arc(518, 57, 4, 0, G.TAU); ctx.fill();
      // distant white city
      ctx.fillStyle = '#0b0c15';
      for (let i = 0; i < 26; i++) {
        const x = i * 26;
        const h = 6 + G.hash(i, 5, 95) * 16;
        ctx.fillRect(x, 270 - h, 22, h);
        if (i % 4 === 0) {
          ctx.fillStyle = 'rgba(216,178,106,.14)';
          ctx.fillRect(x + 5, 270 - h + 4, 1, 1);
          ctx.fillStyle = '#0b0c15';
        }
      }
      // the Acropolis rock
      ctx.fillStyle = '#0a0b12';
      ctx.beginPath();
      ctx.moveTo(150, 288);
      ctx.quadraticCurveTo(330, 214, 560, 268);
      ctx.lineTo(640, 292);
      ctx.lineTo(640, 340);
      ctx.lineTo(120, 340);
      ctx.closePath();
      ctx.fill();
      // Parthenon silhouette on top
      const px = 400, pbase = 238, pw = 210;
      for (let i = 0; i < 3; i++) {
        const sw = pw + 16 - i * 6;
        A.r(ctx, px - sw / 2, pbase - i * 3 - 3, sw, 3, '#0f121c');
      }
      const stylo = pbase - 9, colH = 58;
      for (let i = 0; i < 8; i++) {
        const cx = px - pw / 2 + 5 + i * (pw - 10) / 7;
        A.r(ctx, cx - 3, stylo - colH, 7, colH, '#0f121c');
        A.r(ctx, cx - 3, stylo - colH, 1, colH, '#2b3244');
      }
      A.r(ctx, px - pw / 2 - 4, stylo - colH - 11, pw + 8, 11, '#0f121c');
      const half = pw / 2 + 8;
      for (let i = 0; i < 16; i++) {
        const hw = half * (1 - i / 16);
        A.r(ctx, px - hw, stylo - colH - 11 - i, hw * 2, 1, i === 15 ? '#2b3244' : '#0f121c');
      }
      // faint warm rim light on the columns
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) {
        const cx = px - pw / 2 + 5 + i * (pw - 10) / 7;
        A.glow(ctx, cx, stylo - 20, 22, 'rgba(255,170,90,.16)', 0.3);
      }
      ctx.restore();
      // the altar fire
      const ox = 300, oy = 300;
      ctx.fillStyle = '#0d0908';
      ctx.fillRect(ox - 16, oy - 8, 32, 12);
      ctx.fillStyle = '#3b2616';
      ctx.fillRect(ox - 12, oy - 12, 24, 8);
      ctx.fillStyle = '#ff9d3c';
      ctx.fillRect(ox - 7, oy - 10, 14, 3);
      A.glow(ctx, ox, oy - 8, 100 + Math.sin(t * 7) * 8, 'rgba(255,132,40,.5)', 0.55);
      A.glow(ctx, ox, oy, 44, 'rgba(255,236,160,.7)', 0.7);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let f = 0; f < 3; f++) {
        const fx = ox + (f - 1) * 40;
        const fy = oy + f * 5;
        for (let i = 0; i < 110; i++) {
          const cycle = (t * (0.36 + f * 0.03) + G.hash(i + f * 120, 1, 71)) % 1;
          const ang = -Math.PI / 2 + (G.hash(i + f * 120, 2, 72) - 0.5) * (1.85 - f * 0.18);
          const sp = 64 + G.hash(i + f * 120, 3, 73) * 190;
          const x = fx + Math.cos(ang) * sp * cycle * 1.7;
          const y = fy + Math.sin(ang) * sp * cycle + 300 * cycle * cycle;
          const a = (1 - cycle) * (0.35 + G.hash(i + f * 120, 4, 74) * 0.65);
          ctx.globalAlpha = a;
          ctx.fillStyle = G.hash(i + f * 120, 5, 75) > 0.55 ? '#ffd479' : (G.hash(i + f * 120, 6, 76) > 0.5 ? '#ff9d3c' : '#fff3c4');
          const s = G.hash(i + f * 120, 7, 77) > 0.82 ? 2 : 1;
          ctx.fillRect(Math.round(x), Math.round(y), s, s);
          if (s > 1) {
            ctx.globalAlpha = a * 0.35;
            ctx.fillRect(Math.round(x - Math.cos(ang) * 5), Math.round(y - Math.sin(ang) * 5), 1, 1);
          }
        }
      }
      ctx.restore();
      // ground glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createLinearGradient(0, 330, 0, 360);
      rg.addColorStop(0, 'rgba(255,130,40,.28)');
      rg.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(220, 330, 360, 30);
      ctx.restore();
      // crowd silhouette
      ctx.fillStyle = '#070606';
      for (let i = 0; i < 30; i++) {
        const x = 300 + i * 12;
        const h = 12 + G.hash(i, 7, 97) * 14;
        ctx.fillRect(x, 352 - h, 7, h + 8);
        ctx.beginPath(); ctx.arc(x + 3, 352 - h - 2, 4, 0, G.TAU); ctx.fill();
      }
      // vignette
      const vg = ctx.createRadialGradient(340, 170, 150, 340, 180, 390);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 640, 360);
    },
  };

  /* ============================================================
     scene entry helpers
     ============================================================ */
  G.enterAthens = function (spawn) {
    G.titleActive = false;
    G.hide($('#title'));
    const hud = $('#hud');
    if (hud) hud.classList.remove('map-open');
    G.ui.showHud(true);
    G.ui.setHomeButton(false);
    if (!G.athensScene) G.athensScene = new G.AthensScene();
    G.setScene(G.athensScene, { spawn: spawn || { x: 1100, y: 1240 } });
  };

  G.enterAcropolis = function (spawn) {
    G.titleActive = false;
    G.hide($('#title'));
    const hud = $('#hud');
    if (hud) hud.classList.remove('map-open');
    G.ui.showHud(true);
    G.ui.setHomeButton(false);
    if (!G.acropolisScene) G.acropolisScene = new G.AcropolisScene();
    G.setScene(G.acropolisScene, { spawn: spawn || { x: 750, y: 1300 } });
  };

  /* ============================================================
     home hall
     ============================================================ */
  G.homeReturn = null;
  G.goHome = function () {
    if (!G.scene || G.scene.id === 'home' || G.fade.busy) return;
    if (G.dialog.active || G.security.active || G.cinema.active || (G.minigame && G.minigame.active) || G.scene.mapOpen) return;
    const sc = G.scene;
    G.homeReturn = { scene: sc, x: sc.player.x, y: sc.player.y, dir: sc.player.dir };
    G.fade.to(() => {
      if (!G.homeScene) G.homeScene = new G.HomeScene();
      G.setScene(G.homeScene, { spawn: { x: 450, y: 420 } });
      G.ui.setHomeButton(true);
      G.ui.toast('回到家了 · 看看新打好的工作台', 'good', 2400);
    }, 360);
  };
  G.leaveHome = function () {
    if (!G.scene || G.scene.id !== 'home' || G.fade.busy || G.dialog.active) return;
    const ret = G.homeReturn;
    G.fade.to(() => {
      if (ret && ret.scene) {
        G.setScene(ret.scene, { spawn: { x: ret.x, y: ret.y } });
        ret.scene.player.dir = ret.dir || 'up';
      } else {
        G.enterAthens({ x: 1100, y: 1240 });
      }
      G.homeReturn = null;
      G.ui.setHomeButton(false);
    }, 360);
  };
  G.toggleHome = function () {
    if (G.scene && G.scene.id === 'home') G.leaveHome();
    else G.goHome();
  };

  function startNewGame() {
    G.audio.init();
    G.audio.setEnabled(G.save.data.sound !== false);
    G.save.reset(true);
    G.save.data.flags.introSeen = false;
    G.save.persist();
    G.fade.to(() => {
      G.enterAthens({ x: 1100, y: 1240 });
      G.unlock('axis');
      G.ui.toast('沿泛雅典娜大道向北 · 卫城山门入园', 'good', 3600);
    }, 520);
  }

  function continueGame() {
    if (!G.save.load()) { G.ui.toast('没有找到存档', 'bad'); return; }
    G.audio.init();
    G.audio.setEnabled(G.save.data.sound !== false);
    const f = G.save.data.flags;
    if (G.save.data.scene === 'home') {
      G.fade.to(() => {
        if (!G.homeScene) G.homeScene = new G.HomeScene();
        G.setScene(G.homeScene, { spawn: { x: 450, y: 420 } });
        G.ui.setHomeButton(true);
        G.ui.toast('回到家了', 'good', 2000);
      }, 520);
      return;
    }
    G.fade.to(() => {
      if (f.night || f.finished) {
        G.enterAcropolis({ x: 750, y: 640 });
      } else if (f.entered) {
        let spawn = { x: 750, y: 1300 };
        if (f.metHephaistos) spawn = { x: 750, y: 640 };
        G.enterAcropolis(spawn);
      } else {
        G.enterAthens({ x: 1100, y: 1240 });
      }
      G.ui.toast('继续旅程', 'good', 2000);
    }, 520);
  }

  /* ============================================================
     title init
     ============================================================ */
  const title = {
    active: true,
    init() {
      $('#btn-start').addEventListener('click', () => {
        if (G.save.exists()) {
          G.confirm('开始新旅程？', '当前进度与图鉴会被覆盖，最佳成绩会保留。', () => startNewGame());
          return;
        }
        startNewGame();
      });
      $('#btn-continue').addEventListener('click', () => continueGame());
      const has = G.save.exists();
      const btn = $('#btn-continue');
      btn.disabled = !has;
      if (!has) btn.querySelector('small').textContent = 'NO JOURNEY';
    },
  };

  /* ============================================================
     global keys
     ============================================================ */
  G.onKeyDown = function (code) {
    if (G.audio.ctx) G.audio.resume();
    if (G.confirmOpen) {
      if (code === 'Escape') G.closeConfirm(false);
      else if (code === 'Enter') G.closeConfirm(true);
      return;
    }
    if (G.titleActive) {
      if (code === 'Enter' || code === 'Space') {
        if (G.save.exists()) continueGame(); else startNewGame();
      }
      return;
    }
    if (G.security && G.security.active) return;
    if (menu.open) {
      if (code === 'Escape') menu.close();
      return;
    }
    if (G.scene && G.scene.mapOpen) {
      if (code === 'Escape' || code === 'KeyM') G.scene.toggleMap(false);
      return;
    }
    if (codex.open) {
      if (code === 'Escape' || code === 'KeyJ') codex.close();
      return;
    }
    if (G.choice && G.choice.active) {
      if (code === 'Escape') { G.choice.close(); return; }
      if (code === 'ArrowUp' || code === 'KeyW') { G.choice.move(-1); return; }
      if (code === 'ArrowDown' || code === 'KeyS') { G.choice.move(1); return; }
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') { G.choice.pick(); return; }
      return;
    }
    if (G.sundial && G.sundial.active) {
      G.sundial.key(code);
      return;
    }
    if (G.dialog.active) {
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') G.dialog.advance();
      return;
    }
    if (G.cinema.active) return;
    if (G.minigame && G.minigame.active) {
      G.minigame.key(code);
      return;
    }
    if (code === 'KeyH') { G.toggleHome(); return; }
    if (code === 'Escape') { menu.show(); return; }
    if (code === 'KeyJ') { codex.show(); return; }
  };

  /* ============================================================
     boot
     ============================================================ */
  G.ready(function () {
    G.titleActive = true;
    const canvas = $('#game');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    G.ctx = ctx;

    G.ui.init();
    G.dialog.init();
    G.cinema.init();
    G.fade.init();
    G.input.init();
    G.initTouch();
    if (G.choice) G.choice.init();
    codex.init();
    menu.init();

    $('#confirm-yes').addEventListener('click', () => G.closeConfirm(true));
    $('#confirm-no').addEventListener('click', () => G.closeConfirm(false));
    $('#confirm').addEventListener('click', (e) => { if (e.target.id === 'confirm') G.closeConfirm(false); });
    $('#btn-home').addEventListener('click', () => G.toggleHome());

    G.hide($('#choice'));
    G.hide($('#puzzle'));
    G.hide($('#pd-result'));

    const hasSave = G.save.load();
    G.audio.enabled = G.save.data.sound !== false;
    const soundBtn = $('#btn-sound');
    if (soundBtn) soundBtn.textContent = G.audio.enabled ? '♪' : '×';
    title.init();

    const bootAudio = () => {
      if (!G.audio.ctx) {
        G.audio.init();
        G.audio.setEnabled(G.save.data.sound !== false);
      }
      G.audio.resume();
      window.removeEventListener('pointerdown', bootAudio);
      window.removeEventListener('keydown', bootAudio);
    };
    window.addEventListener('pointerdown', bootAudio);
    window.addEventListener('keydown', bootAudio);

    // debug helpers used for screenshots / QA
    function resetUI() {
      G.hide($('#security'));
      G.hide($('#mg-result'));
      G.hide($('#mg-hud'));
      G.hide($('#codex'));
      G.hide($('#menu'));
      G.hide($('#cinema'));
      G.hide($('#confirm'));
      G.hide($('#choice'));
      G.hide($('#puzzle'));
      G.hide($('#pd-result'));
      if (G.choice) { G.choice.active = false; G.choice.choiceWaiting = false; }
      if (G.sundial) { G.sundial.active = false; G.sundial.finished = false; }
      G.confirmOpen = false;
      G.hide($('#title'));
      G.security.active = false;
      if (G.security.timers) { G.security.timers.forEach((t) => clearTimeout(t)); G.security.timers = []; }
      if (G.minigame) {
        G.minigame.active = false;
        G.minigame.finished = false;
        G.minigame.parts.length = 0;
      }
      if (G.dialog.active) {
        clearInterval(G.dialog.timer);
        G.dialog.active = false;
        G.dialog.el.classList.add('hidden');
      }
      G.cinema.active = false;
      G.overlayDepth = 0;
      G.titleActive = false;
      if ($('#hud')) $('#hud').classList.remove('map-open');
      if (G.scene) G.scene.mapOpen = false;
      G.ui.setHomeButton(false);
      G.homeReturn = null;
      G.ui.showHud(true);
      G.input.clearPressed();
    }
    G.debug = {
      reset: resetUI,
      title() {
        resetUI();
        G.titleActive = true;
        G.ui.showHud(false);
        G.hide($('#title'));
        G.show($('#title'));
      },
      athens(x, y) {
        resetUI();
        G.save.data.flags.introSeen = true;
        G.enterAthens({ x: x || 1100, y: y || 1240 });
      },
      home() {
        resetUI();
        G.save.data.flags.homeIntroSeen = true;
        if (!G.homeScene) G.homeScene = new G.HomeScene();
        G.setScene(G.homeScene, { spawn: { x: 450, y: 420 } });
        G.ui.setHomeButton(true);
      },
      acropolis(x, y) {
        resetUI();
        G.save.flag('entered', true);
        G.save.data.flags.acropolisIntroSeen = true;
        G.enterAcropolis({ x: x || 750, y: y || 1300 });
      },
      security() {
        resetUI();
        G.enterAthens({ x: 1100, y: 900 });
        G.security.start();
        setTimeout(() => G.security.finish(), 1200);
      },
      night() {
        resetUI();
        G.save.flag('entered', true);
        G.save.flag('metHephaistos', true);
        G.save.flag('olive', true);
        G.save.flag('resin', true);
        G.save.flag('brazier', true);
        G.save.flag('night', true);
        G.enterAcropolis({ x: 750, y: 640 });
      },
      minigame(mode) {
        resetUI();
        G.save.flag('entered', true);
        G.save.flag('night', true);
        if (!G.acropolisScene) G.acropolisScene = new G.AcropolisScene();
        G.setScene(G.acropolisScene, { spawn: { x: 750, y: 640 } });
        G.acropolisScene.night = true;
        G.acropolisScene.refreshNight();
        G.minigame.start({});
        if (mode === 'echo') {
          setTimeout(() => {
            G.minigame.phase = 'echo';
            G.minigame.input = [];
            G.minigame.setHint('重复祭司的顺序 · 按 1/2/3（A/S/D）');
            G.minigame.updatePips();
          }, 300);
        } else if (mode === 'play') {
          setTimeout(() => {
            G.minigame.phase = 'play';
            G.minigame.playback = G.minigame.seq.slice();
            G.minigame.slots = [];
            G.minigame.updatePips();
            G.minigame.setHint('记住祭司点灯的顺序');
          }, 300);
        } else if (mode === 'result') {
          setTimeout(() => {
            G.minigame.score = 6480;
            G.minigame.maxCombo = 5;
            G.minigame.perfect = 3;
            G.minigame.throwsLeft = 0;
            G.minigame.finish();
          }, 300);
        } else {
          setTimeout(() => {
            G.minigame.phase = 'echo';
            G.minigame.input = [];
            G.minigame.updatePips();
            G.minigame.setHint('重复祭司的顺序 · 按 1/2/3（A/S/D）');
          }, 300);
        }
      },
      result() { this.minigame('result'); },
      sundial(mode) {
        resetUI();
        G.save.flag('entered', true);
        G.save.data.flags.night = false;
        G.save.persist();
        G.enterAcropolis({ x: 1080, y: 612 });
        G.acropolisScene.doPuzzle();
        setTimeout(() => {
          if (G.dialog.active) G.dialog.skip();
        }, 200);
        if (mode === 'result') {
          setTimeout(() => {
            if (G.dialog.active) G.dialog.skip();
            if (G.sundial && !G.sundial.active) {
              G.sundial.active = true;
            }
          }, 500);
          setTimeout(() => {
            if (!G.sundial || !G.sundial.active) return;
            G.sundial.score = 5200;
            G.sundial.perfect = 4;
            G.sundial.finish();
          }, 900);
        }
      },
      choice(n) {
        resetUI();
        G.save.flag('entered', true);
        G.save.flag('metHephaistos', true);
        G.save.flag('olive', true);
        G.save.flag('resin', true);
        G.save.flag('brazier', true);
        G.save.flag('night', false);
        G.save.data.flavor = [];
        G.save.persist();
        G.enterAcropolis({ x: 750, y: 640 });
        setTimeout(() => {
          const sc = G.scene;
          if (!sc || typeof sc.chooseHowToLight !== 'function') return;
          sc._choosing = false;
          sc.chooseHowToLight();
          if (n != null && G.choice && G.choice.active) G.choice.pick(Number(n));
        }, 300);
      },
      setFlags(obj) {
        Object.assign(G.save.data.flags, obj);
        G.save.persist();
      },
      state() { return JSON.parse(JSON.stringify(G.save.data)); },
    };

    window.addEventListener('beforeunload', () => G.save.persist());
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.save.persist(); });

    G.ui.showHud(false);
    G.ui.setHomeButton(false);
    G.hide($('#security'));
    G.hide($('#mg-hud'));
    G.hide($('#mg-result'));
    G.hide($('#codex'));
    G.hide($('#menu'));
    $('#mg-zone').style.left = '52%';
    $('#mg-zone').style.width = '32%';
    if (!hasSave) {
      G.save.data.sound = true;
    }

    let last = performance.now();
    let titleT = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (!isFinite(dt) || dt < 0) dt = 0.016;
      dt = Math.min(dt, 0.05);
      if (G.titleActive) {
        titleT += dt;
        titleArt.t = titleT;
        titleArt.draw(ctx);
      } else if (G.sundial && G.sundial.active) {
        G.sundial.update(dt);
        G.sundial.draw(ctx);
      } else if (G.minigame && G.minigame.active) {
        G.minigame.update(dt);
        G.minigame.draw(ctx);
      } else if (G.scene) {
        G.scene.update(dt);
        G.scene.draw(ctx);
      }
      if (G.photo) { G.photo.tick(dt); G.photo.draw(ctx); }
      G.input.endFrame();
    }
    requestAnimationFrame(frame);

    if (hasSave) {
      $('#btn-continue').disabled = false;
      $('#btn-continue').querySelector('small').textContent = 'CONTINUE';
    }
  });
})();
