/* ============================================================
   紫禁城 · 铁火 — boot, title, scenes, UI glue
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
    axis: { title: '北京中轴线', sub: 'THE CENTRAL AXIS', text: '南起永定门，北至钟鼓楼，全长约 7.8 公里。北京城的重要建筑沿这条线左右对称展开，2024 年列入《世界遗产名录》。' },
    tiananmen: { title: '天安门', sub: 'TIANANMEN', text: '明清皇城正门，原名承天门。城楼为重檐歇山顶，五阙券门。门前立华表与石狮。' },
    zhengyangmen: { title: '正阳门', sub: 'ZHENGYANGMEN', text: '北京内城正南门，俗称前门。城楼、箭楼与瓮城构成完整的防御体系，是中轴线南段的地标。' },
    gugong: { title: '故宫博物院', sub: 'THE PALACE MUSEUM', text: '旧称紫禁城，明永乐十八年（1420）建成。现存规模最大、保存最完整的木结构宫殿建筑群，藏品超过 186 万件。' },
    wumen: { title: '午门', sub: 'MERIDIAN GATE', text: '紫禁城正门，平面呈凹字形，两翼各有一座重檐攒尖亭，合称五凤楼。明清时期也是颁诏、献俘的场所。' },
    jinshui: { title: '内金水桥', sub: 'GOLDEN WATER BRIDGES', text: '内金水河自西北流入宫城，河上五座汉白玉桥。中间的御路桥供帝王通行，两侧为王公桥、品级桥。' },
    taihe: { title: '太和殿', sub: 'HALL OF SUPREME HARMONY', text: '俗称金銮殿，重檐庑殿顶，面阔十一间。明清两代登基、大婚、册立等大典在此举行。屋脊上有十只脊兽，为紫禁城孤例。' },
    baohe: { title: '保和殿', sub: 'HALL OF PRESERVING HARMONY', text: '明代册立皇后、皇太子在此更衣。清代殿试在此举行，前三名即状元、榜眼、探花。' },
    qianqing: { title: '乾清宫', sub: 'PALACE OF HEAVENLY PURITY', text: '内廷正殿。明清十六位皇帝曾在此居住、处理政务，殿内高悬“正大光明”匾。' },
    yuhuayuan: { title: '御花园', sub: 'IMPERIAL GARDEN', text: '明永乐年间建，原名宫后苑。古柏、太湖石、万春亭与千秋亭藏在红墙之间，是紫禁城最北端的园林。' },
    shenwumen: { title: '神武门', sub: 'GATE OF DIVINE MIGHT', text: '紫禁城北门，原名玄武门。清代为避康熙帝玄烨名讳改称神武门。旧时每日晨钟暮鼓，由这里传遍宫城。' },
    zhenbao: { title: '珍宝馆', sub: 'TREASURES GALLERY', text: '位于宁寿宫区域，展出金银器、珠宝、玉石盆景、金嵌珍珠天球仪等宫廷珍宝。' },
    jianting: { title: '箭亭', sub: 'ARCHERY PAVILION', text: '清代皇帝及皇子练习骑射的场所。乾隆曾在此阅骑射，并立碑告诫后世不忘满洲根本。' },
    wuying: { title: '武英殿', sub: 'HALL OF MARTIAL VALOR', text: '清代设武英殿修书处，曾在此编纂《四库全书》。今天这里是故宫的陶瓷馆。' },
    wenhua: { title: '文华殿', sub: 'HALL OF LITERARY GLORY', text: '明代太子讲学之所，清代经筵典礼在此举行。今天这里是故宫的书画馆。' },
    cining: { title: '慈宁宫', sub: 'PALACE OF COMPASSIONATE TRANQUILITY', text: '明清太后居所。孝庄文皇后曾在此居住，今天这里陈列着雕塑文物。' },
    shoukang: { title: '寿康宫', sub: 'PALACE OF LONGEVITY AND HEALTH', text: '清代太后、太妃的居所。乾隆生母崇庆皇太后曾在此居住，宫院格局保存完整。' },
    zhongbiao: { title: '钟表馆', sub: 'CLOCKS GALLERY', text: '位于奉先殿区域，收藏十八至二十世纪的中外宫廷钟表，机械人偶与转花水法令人称奇。' },
    dongliugong: { title: '东六宫', sub: 'SIX EASTERN PALACES', text: '景仁宫、承乾宫、钟粹宫等六座宫院，明清两代后妃的居所，也是今天故宫展馆集中的区域。' },
    xiliugong: { title: '西六宫', sub: 'SIX WESTERN PALACES', text: '永寿宫、翊坤宫、储秀宫等六座宫院。慈禧太后曾长期居住在储秀宫。' },
    beihai: { title: '北海白塔', sub: 'WHITE DAGOBA', text: '顺治八年（1651）在琼华岛建白塔。塔身如雪，倒映在太液池中，是北京城最温柔的一处轮廓。' },
    tiantan: { title: '天坛祈年殿', sub: 'TEMPLE OF HEAVEN', text: '三重蓝琉璃瓦，圆形攒尖顶，不用大梁长檩，全靠榫卯与斗拱托起。明清皇帝在此祭天祈谷。' },
    birdnest: { title: '鸟巢', sub: 'NATIONAL STADIUM', text: '2008 年北京奥运会主体育场。钢结构编织成巢，可容纳约九万名观众。' },
    cbd: { title: '国贸 CBD', sub: 'CENTRAL BUSINESS DISTRICT', text: '玻璃幕墙、中国尊与央视大楼。老北京的天际线在这里突然拔高，是这座城市另一种速度。' },
    hutong: { title: '北京胡同', sub: 'HUTONGS', text: '灰瓦、砖墙、门墩儿，胡同串起了北京人的日常。南锣鼓巷、大栅栏都还留着旧城的肌理。' },
    wangfujing: { title: '王府井', sub: 'WANGFUJING', text: '北京最热闹的商业街之一。从老字号到百货大楼，这里装着几代人的城市记忆。' },
    jingshan: { title: '景山万春亭', sub: 'JINGSHAN', text: '景山是中轴线的制高点。站在万春亭上，能看见整座紫禁城的屋脊。' },
    tiehua: { title: '打铁花', sub: 'MOLTEN IRON FIREWORKS', text: '以熔化的铁水击打柳木勺，铁水飞溅成花。流传于晋豫等地，是国家级非物质文化遗产。铁水温度可达一千六百度。' },
    cat: { title: '故宫猫', sub: 'PALACE CATS', text: '故宫里生活着一群“宫猫”。它们大多是被收编的流浪猫，有自己的名字和档案，也被观众称作紫禁城真正的主人。' },
    craftbench: { title: '大厅 · 合成台', sub: 'CRAFTING BENCH', text: '靠窗的合成台铺着墨绿毡垫，台面上摆着黄铜齿轮、玻璃瓶和配方卡。以后可以在这里拆解、拼合材料，制作新的物件。' },
    repairbench: { title: '大厅 · 修复台', sub: 'RESTORATION BENCH', text: '修复台有一盏带放大镜的铜灯、竹镊、毛笔、鱼鳔胶和金粉。碎瓷可以沿着裂缝补上金线，旧木器可以重新打磨。' },
    fusion: { title: '万象灵境 · 雅典—故宫', sub: 'THE NEXUS ATLAS', text: '一座正在研发中的故宫数字沙盘。雅典卫城的建筑与考古数据包被接入同一套坐标系统后，故宫建筑本身没有被替换，但投影与来源标签发生了错位。' },
    sundial: { title: '故宫档案 · 中轴简图', sub: 'GUGONG AXIS DOSSIER', text: '午门—太和殿—乾清宫的简化中轴图。故宫用层层门阙与月台陈设提示“正在进入中心”，这是它自己的礼制叙事，不能按卫城的“入口—胜利—主神”序列重排。' },
    coxclock: { title: '卫城档案 · 帕特农与女像柱', sub: 'ACROPOLIS DOSSIER', text: '帕特农东山墙、伊瑞克提翁女像柱与舞乐图瓶画器盖的线图。它们是卫城参照层，不是被搬进故宫的实物；档案要标清来源，而不是让投影冒充故宫原生。' },
    sourcecard: { title: '来源卡 · 宴乐对照', sub: 'SOURCE CARD · FEAST & MUSIC', text: '卫城舞乐图瓶画与《韩熙载夜宴图》可以比较“饮酒—奏乐—共宴”如何组织社会关系；但靖远鎏金银盘、隋墓骆驼上的酒神图像只证明传播有中介，不证明这两件作品直接相连。' },
    ich_mortise: { title: '非遗 · 榫卯营造', sub: 'MORTISE & TENON', text: '中国传统木结构建筑营造技艺以榫卯咬合构件，不用钉子也能让木构层层受力。2009 年列入联合国教科文组织人类非物质文化遗产代表作名录。' },
    ich_marble: { title: '非遗 · 提诺斯大理石', sub: 'TINIAN MARBLE CRAFT', text: '希腊提诺斯岛的大理石雕刻技艺，从采石、开料到凿刻、打磨，把石头的纹理与建筑构件接合在一起。2015 年列入联合国教科文组织人类非物质文化遗产代表作名录。' },
    nexus: { title: '来源校准台', sub: 'SOURCE CALIBRATION', text: '故宫沙盘中央的校准装置。两份档案同时放入后，它比对空间关系与来源说明，把投影标签放回正确位置，而不是删除差异或改造故宫本体。' },
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
      } else {
        const f = G.save.data.flags;
        const rows = [
          ['已经入宫', f.entered ? '是' : '否'],
          ['找到老赵', f.metZhao ? '是' : '否'],
          ['打铁花材料', ['iron', 'charcoal', 'ladle'].filter((k) => f[k]).length + ' / 3'],
          ['看过打铁花', f.finished ? '是' : '否'],
          ['入园方式', '午门 · 安检入园'],
          ['打铁花最佳', (G.save.data.best || 0).toLocaleString('zh-CN') + ' 分'],
          ['挑战次数', String(G.save.data.plays || 0)],
          ['图鉴收集', G.save.data.codex.filter((id) => G.CODEX_DATA[id]).length + ' / ' + Object.keys(G.CODEX_DATA).length],
        ];
        const intro = document.createElement('div');
        intro.className = 'codex-item';
        intro.innerHTML = '<h3>旅行手账<small>TRAVEL NOTES</small></h3><p>从永定门到钟鼓楼，一页一页，把北京走成一条线。</p>';
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
      // sky
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
      // distant ridge of city roofs
      ctx.fillStyle = '#0b0c15';
      for (let i = 0; i < 26; i++) {
        const x = i * 26;
        const h = 6 + G.hash(i, 5, 95) * 16;
        ctx.fillRect(x, 264 - h, 22, h);
        if (i % 4 === 0) {
          ctx.fillStyle = 'rgba(216,178,106,.14)';
          ctx.fillRect(x + 5, 264 - h + 4, 1, 1);
          ctx.fillStyle = '#0b0c15';
        }
      }
      // palace
      A.drawHall(ctx, 300, 330, 130, { wallH: 28, roofH: 24, double: true, name: '' });
      A.drawGate(ctx, 500, 352, 320, {
        wallH: 62, roofH: 32, double: true, arches: 3, name: '神武门',
      });
      // tint to silhouette
      ctx.fillStyle = 'rgba(7,9,20,.42)';
      ctx.fillRect(0, 0, 640, 360);
      // illuminated edges and roof glints
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        const x = 360 + i * 45;
        A.glow(ctx, x, 286, 30, 'rgba(255,144,54,.25)', 0.22);
      }
      for (let i = 0; i < 9; i++) {
        const x = 410 + i * 22;
        A.glow(ctx, x, 236, 18, 'rgba(255,184,92,.18)', 0.25);
        ctx.fillStyle = 'rgba(255,206,120,.28)';
        ctx.fillRect(x, 235, 12, 1);
      }
      ctx.restore();
      // lanterns on wall
      for (const lx of [342, 382, 620]) {
        A.glow(ctx, lx, 292, 26, 'rgba(255,150,60,.5)', 0.4);
        ctx.fillStyle = '#d45637';
        ctx.fillRect(lx - 4, 286, 8, 9);
        ctx.fillStyle = '#ffd479';
        ctx.fillRect(lx - 2, 289, 4, 3);
      }
      // crowd silhouette
      ctx.fillStyle = '#070606';
      for (let i = 0; i < 30; i++) {
        const x = 300 + i * 12;
        const h = 12 + G.hash(i, 7, 97) * 14;
        ctx.fillRect(x, 352 - h, 7, h + 8);
        ctx.beginPath(); ctx.arc(x + 3, 352 - h - 2, 4, 0, G.TAU); ctx.fill();
      }
      // furnace at the wall, molten iron thrown into the night
      const ox = 432, oy = 327;
      ctx.fillStyle = '#0d0908';
      ctx.fillRect(ox - 18, oy - 8, 36, 12);
      ctx.fillStyle = '#3b2616';
      ctx.fillRect(ox - 14, oy - 12, 28, 8);
      ctx.fillStyle = '#ff9d3c';
      ctx.fillRect(ox - 8, oy - 10, 16, 3);
      A.glow(ctx, ox, oy - 8, 100 + Math.sin(t * 7) * 8, 'rgba(255,132,40,.5)', 0.55);
      A.glow(ctx, ox, oy, 44, 'rgba(255,236,160,.7)', 0.7);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let f = 0; f < 3; f++) {
        const fx = ox + (f - 1) * 44;
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
      // ground glow reflection
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createLinearGradient(0, 330, 0, 360);
      rg.addColorStop(0, 'rgba(255,130,40,.28)');
      rg.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(300, 330, 340, 30);
      ctx.restore();
      // foreground vignette
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
  G.enterBeijing = function (spawn) {
    G.titleActive = false;
    G.hide($('#title'));
    const hud = $('#hud');
    if (hud) hud.classList.remove('map-open');
    G.ui.showHud(true);
    G.ui.setHomeButton(false);
    if (!G.beijingScene) G.beijingScene = new G.BeijingScene();
    G.setScene(G.beijingScene, { spawn: spawn || { x: 1100, y: 1200 } });
  };

  G.enterPalace = function (spawn) {
    G.titleActive = false;
    G.hide($('#title'));
    const hud = $('#hud');
    if (hud) hud.classList.remove('map-open');
    G.ui.showHud(true);
    G.ui.setHomeButton(false);
    if (!G.gugongScene) G.gugongScene = new G.GugongScene();
    G.setScene(G.gugongScene, { spawn: spawn || { x: 750, y: 1300 } });
  };

  G.enterFusion = function (opts) {
    opts = opts || {};
    G.titleActive = false;
    G.hide($('#title'));
    const hud = $('#hud');
    if (hud) hud.classList.remove('map-open');
    G.ui.showHud(true);
    G.ui.setHomeButton(false);
    if (!G.fusionScene) G.fusionScene = new G.FusionScene();
    G.setScene(G.fusionScene, { spawn: opts.spawn || { x: 720, y: 1040 }, skipIntro: !!opts.skipIntro });
  };
  G.leaveFusion = function () {
    if (!G.scene || G.scene.id !== 'fusion' || G.fade.busy) return;
    G.fade.to(() => {
      if (G.scene && G.scene.exit) G.scene.exit();
      G.scene = null;
      G.sceneName = '';
      G.titleActive = true;
      G.ui.showHud(false);
      G.ui.setHomeButton(false);
      G.$('#hud').classList.remove('map-open');
      G.show($('#title'));
    }, 430);
  };

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
     plugin: 同境异笔（独立页面 · iframe 隔离 · 不进主线）
     ============================================================ */
  G.artDemoOpen = false;
  G.ART_DEMO_SRC = 'art-demo/index.html';
  G.openArtDemo = function () {
    if (G.artDemoOpen) return;
    G.artDemoOpen = true;
    const frame = $('#artdemo-frame');
    if (frame && frame.dataset.loaded !== '1') {
      frame.src = G.ART_DEMO_SRC;
      frame.dataset.loaded = '1';
    }
    G.show($('#artdemo'));
    G.input.clearPressed();
    try { if (frame) frame.focus(); } catch (e) { /* ignore */ }
  };
  G.closeArtDemo = function () {
    if (!G.artDemoOpen) return;
    G.artDemoOpen = false;
    G.hide($('#artdemo'));
    G.input.clearPressed();
    try { const c = $('#game'); if (c && c.focus) c.focus(); } catch (e) { /* ignore */ }
  };

  /* ============================================================
     home hall
     ============================================================ */
  G.homeReturn = null;
  G.goHome = function () {
    if (!G.scene || G.scene.id === 'home' || G.fade.busy) return;
    if (G.dialog.active || G.security.active || G.cinema.active || (G.minigame && G.minigame.active) || (G.minigameGreek && G.minigameGreek.active) || G.scene.mapOpen) return;
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
        G.enterBeijing({ x: 1100, y: 1200 });
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
      G.enterBeijing({ x: 1100, y: 1200 });
      G.unlock('axis');
      G.ui.toast('沿着中轴线向北 · 午门入园', 'good', 3600);
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
        G.enterPalace({ x: 650, y: 300 });
      } else if (f.entered) {
        let spawn = { x: 750, y: 1300 };
        if (f.metZhao) spawn = { x: 750, y: 380 };
        G.enterPalace(spawn);
      } else {
        G.enterBeijing({ x: 1100, y: 1200 });
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
    if (G.artDemoOpen) {
      if (code === 'Escape') G.closeArtDemo();
      return;
    }
    // title
    if (G.titleActive) {
      if (code === 'Enter' || code === 'Space') {
        if (G.save.exists()) continueGame(); else startNewGame();
      }
      return;
    }
    // modal layers
    if (G.difficulty && G.difficulty.active) {
      G.difficulty.key(code);
      return;
    }
    if (G.archiveGame && G.archiveGame.active) {
      G.archiveGame.key(code);
      return;
    }
    if (G.sourceQuiz && G.sourceQuiz.active) {
      G.sourceQuiz.key(code);
      return;
    }
    if (G.security && G.security.active) return;
    if (menu.open) {
      if (code === 'Escape') menu.close();
      return;
    }
    if (G.scene && G.scene.mapOpen) {
      if (code === 'Escape' || code === 'KeyM') {
        G.scene.toggleMap(false);
        // consume the key so the scene update doesn't toggle it straight back open
        G.input.clearPressed();
      }
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
    if (G.minigameGreek && G.minigameGreek.active) {
      G.minigameGreek.key(code);
      return;
    }
    if (G.minigame && G.minigame.active) {
      G.minigame.key(code);
      return;
    }
    if (code === 'KeyH') { G.toggleHome(); return; }
    if (code === 'Escape') { menu.show(); return; }
    if (code === 'KeyJ') { codex.show(); return; }
    // E / movement handled by the world
  };

  /* ============================================================
     boot
     ============================================================ */
  G.ready(function () {
    G.titleActive = true;
    const canvas = $('#game');
    const ctx = canvas.getContext('2d');
    // render at 2x backing resolution while keeping the 640x360 logical world:
    // canvas text and cached building plaques stay sharp when the stage is scaled up.
    const RENDER_SCALE = 2;
    canvas.width = G.W * RENDER_SCALE;
    canvas.height = G.H * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);
    ctx.imageSmoothingEnabled = false;
    G.renderScale = RENDER_SCALE;
    G.ctx = ctx;

    G.ui.init();
    G.dialog.init();
    G.cinema.init();
    if (G.archiveGame) G.archiveGame.init();
    if (G.difficulty) G.difficulty.init();
    if (G.sourceQuiz) G.sourceQuiz.init();
    if (G.choice) G.choice.init();
    G.fade.init();
    G.input.init();
    G.initTouch();
    codex.init();
    menu.init();

    $('#confirm-yes').addEventListener('click', () => G.closeConfirm(true));
    $('#confirm-no').addEventListener('click', () => G.closeConfirm(false));
    $('#confirm').addEventListener('click', (e) => { if (e.target.id === 'confirm') G.closeConfirm(false); });
    $('#btn-home').addEventListener('click', () => G.toggleHome());
    $('#btn-fusion').addEventListener('click', () => G.enterFusion());
    $('#btn-athens').addEventListener('click', () => G.enterAthens());
    $('#btn-artdemo').addEventListener('click', () => G.openArtDemo());
    const menuArt = $('#menu-artdemo');
    if (menuArt) menuArt.addEventListener('click', () => { menu.close(); G.openArtDemo(); });
    $('#artdemo-close').addEventListener('click', () => G.closeArtDemo());
    // tapping / clicking the map canvas closes the map (touch-friendly)
    $('#game').addEventListener('pointerdown', () => {
      if (G.scene && G.scene.mapOpen) {
        G.scene.toggleMap(false);
        G.input.clearPressed();
      }
    });

    const hasSave = G.save.load();
    G.audio.enabled = G.save.data.sound !== false;
    const soundBtn = $('#btn-sound');
    if (soundBtn) soundBtn.textContent = G.audio.enabled ? '♪' : '×';
    title.init();

    // share link: index.html?mode=fusion jumps straight into the Athens–Gugong chapter
    try {
      if (new URLSearchParams(window.location.search).get('mode') === 'fusion') {
        setTimeout(() => { if (G.titleActive) G.enterFusion(); }, 260);
      }
    } catch (e) { /* ignore */ }

    // first user gesture unlocks AudioContext
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
      if (G.archiveGame) G.archiveGame.reset();
      if (G.difficulty) G.difficulty.reset();
      if (G.sourceQuiz) G.sourceQuiz.reset();
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
      beijing(x, y) {
        resetUI();
        G.save.data.flags.introSeen = true;
        G.enterBeijing({ x: x || 1100, y: y || 1200 });
      },
      fusion(skipIntro) {
        resetUI();
        G.enterFusion({ skipIntro: skipIntro !== false });
      },
      home() {
        resetUI();
        G.save.data.flags.homeIntroSeen = true;
        if (!G.homeScene) G.homeScene = new G.HomeScene();
        G.setScene(G.homeScene, { spawn: { x: 450, y: 420 } });
        G.ui.setHomeButton(true);
      },
      gugong(x, y) {
        resetUI();
        G.save.flag('entered', true);
        G.save.data.flags.palaceIntroSeen = true;
        G.enterPalace({ x: x || 750, y: y || 1300 });
      },
      security() {
        resetUI();
        G.enterBeijing({ x: 1100, y: 900 });
        G.security.start();
        setTimeout(() => G.security.finish(), 1200);
      },
      night() {
        resetUI();
        G.save.flag('entered', true);
        G.save.flag('metZhao', true);
        G.save.flag('iron', true);
        G.save.flag('charcoal', true);
        G.save.flag('ladle', true);
        G.save.flag('night', true);
        G.enterPalace({ x: 650, y: 300 });
      },
      minigame(mode) {
        resetUI();
        G.save.flag('entered', true);
        G.save.flag('night', true);
        if (!G.gugongScene) G.gugongScene = new G.GugongScene();
        G.setScene(G.gugongScene, { spawn: { x: 750, y: 300 } });
        G.gugongScene.night = true;
        G.gugongScene.refreshNight();
        G.minigame.start({});
        if (mode === 'power') {
          setTimeout(() => {
            G.minigame.phase = 'power';
            G.minigame.power = 0.68;
            G.minigame.showMeter(true);
            G.minigame.setHint('在金色区间按下 <kbd>空格</kbd> · 稳住手腕');
            $('#mg-needle').style.left = '68%';
          }, 100);
        } else if (mode === 'aim') {
          setTimeout(() => {
            G.minigame.phase = 'aim';
            G.minigame.showMeter(false);
            G.minigame.newTarget();
            G.minigame.target = { x: 430, y: 150, r: 25 };
            G.minigame.aimT = 1.3;
            G.minigame.updateAimReticle();
            G.minigame.setHint('对准花心 · 按下 <kbd>空格</kbd> 泼铁');
          }, 100);
        } else if (mode === 'result') {
          setTimeout(() => {
            G.minigame.score = 6480;
            G.minigame.maxCombo = 5;
            G.minigame.perfect = 3;
            G.minigame.throwsLeft = 0;
            G.minigame.finish();
          }, 120);
        } else if (mode === 'impact') {
          setTimeout(() => {
            G.minigame.phase = 'aim';
            G.minigame.target = { x: 430, y: 150, r: 25 };
            G.minigame.impactPoint = { x: 430, y: 150 };
            G.minigame.pendingScore = { gain: 1180, acc: 0.96, perfect: true, hit: true, dist: 5 };
            G.minigame.score = 1180;
            G.minigame.combo = 1;
            G.minigame.maxCombo = 1;
            G.minigame.perfect = 1;
            G.minigame.throwsLeft = 5;
            G.minigame.phase = 'flight';
            G.minigame.flight = 1;
            G.minigame.impact();
            G.minigame.banner('完 美');
            G.minigame.updateHUD();
            G.minigame.updatePips();
          }, 120);
        }
      },
      result() { this.minigame('result'); },
      setFlags(obj) {
        Object.assign(G.save.data.flags, obj);
        G.save.persist();
      },
      state() { return JSON.parse(JSON.stringify(G.save.data)); },
    };

    // auto-save on hide
    window.addEventListener('beforeunload', () => G.save.persist());
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.save.persist(); });

    // initial UI
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
      // keep title clean for first-time visitors
      G.save.data.sound = true;
    }

    // main loop
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
      } else if (G.minigameGreek && G.minigameGreek.active) {
        G.minigameGreek.update(dt);
        G.minigameGreek.draw(ctx);
      } else if (G.minigame && G.minigame.active) {
        G.minigame.update(dt);
        G.minigame.draw(ctx);
      } else if (G.scene) {
        G.scene.update(dt);
        G.scene.draw(ctx);
      }
      G.input.endFrame();
    }
    requestAnimationFrame(frame);

    // unlock the first codex page quietly
    if (hasSave) {
      $('#btn-continue').disabled = false;
      $('#btn-continue').querySelector('small').textContent = 'CONTINUE';
    }
  });
})();
