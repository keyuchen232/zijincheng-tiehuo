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
      const quitBtn = $('#menu-quit');
      if (quitBtn) quitBtn.addEventListener('click', () => { this.close(); G.quitToTitle(); });
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
     title background — 万象灵境
     a bright "two civilisations, one atlas" poster: the Forbidden
     City on the left, the Acropolis on the right, a portal of
     floating voxels between them, and the two travellers standing
     on a holographic platform.
     ============================================================ */
  const titleArt = {
    t: 0,

    /* chunky pixel ellipse */
    puff(ctx, cx, cy, rx, ry, color) {
      ctx.fillStyle = color;
      const top = Math.ceil(cy - ry);
      const bot = Math.ceil(cy + ry);
      for (let y = top; y < bot; y++) {
        const dy = (y + 0.5 - cy) / ry;
        const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy)) + 0.5);
        if (hw > 0) ctx.fillRect(Math.round(cx - hw), y, hw * 2, 1);
      }
    },

    cloud(ctx, x, y, s, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      const shade = '#cfe2f1';
      this.puff(ctx, x - 26 * s, y + 4 * s, 24 * s, 10 * s, shade);
      this.puff(ctx, x + 24 * s, y + 5 * s, 26 * s, 10 * s, shade);
      this.puff(ctx, x, y + 2 * s, 32 * s, 14 * s, shade);
      this.puff(ctx, x - 18 * s, y - 2 * s, 22 * s, 13 * s, '#ffffff');
      this.puff(ctx, x + 12 * s, y - 5 * s, 24 * s, 14 * s, '#ffffff');
      this.puff(ctx, x - 2 * s, y - 10 * s, 18 * s, 12 * s, '#ffffff');
      ctx.restore();
    },

    cube(ctx, x, y, s, cols) {
      const ix = Math.round(x - s / 2);
      const iy = Math.round(y - s / 2);
      ctx.fillStyle = cols.face;
      ctx.fillRect(ix, iy, s, s);
      ctx.fillStyle = cols.top;
      ctx.fillRect(ix, iy, s, Math.max(2, Math.round(s * 0.32)));
      ctx.fillStyle = cols.side;
      ctx.fillRect(ix + s - Math.max(1, Math.round(s * 0.18)), iy + 1, Math.max(1, Math.round(s * 0.18)), s - 2);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(ix + 1, iy + 1, Math.max(1, Math.round(s * 0.3)), 1);
    },

    draw(ctx) {
      const t = this.t;
      const W = G.W, H = G.H;
      const AG = G.artGreek || A;

      /* ---------- sky ---------- */
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#7fbde5');
      sky.addColorStop(0.38, '#b7ddf2');
      sky.addColorStop(0.7, '#e6eedd');
      sky.addColorStop(1, '#f6eeda');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      /* sun */
      A.glow(ctx, 524, 62, 76, 'rgba(255,250,226,.85)', 0.32);
      ctx.fillStyle = 'rgba(255,253,243,.9)';
      ctx.beginPath(); ctx.arc(524, 62, 12, 0, G.TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.beginPath(); ctx.arc(524, 62, 19, 0, G.TAU); ctx.fill();

      /* birds */
      ctx.fillStyle = 'rgba(46,68,100,.34)';
      for (const [bx, by] of [[158, 96], [186, 80], [210, 102], [232, 88]]) {
        ctx.fillRect(bx - 3, by, 3, 1);
        ctx.fillRect(bx - 1, by - 1, 1, 1);
        ctx.fillRect(bx, by, 3, 1);
      }

      /* clouds */
      this.cloud(ctx, 104, 92, 1.0, 0.95);
      this.cloud(ctx, 430, 66, 0.8, 0.85);
      this.cloud(ctx, 586, 116, 1.05, 0.8);
      this.cloud(ctx, 262, 152, 0.8, 0.7);
      this.cloud(ctx, 34, 172, 1.3, 0.6);
      this.cloud(ctx, 620, 190, 0.95, 0.55);

      /* soft cloud shelf behind the two cities */
      ctx.save();
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 13; i++) {
        const x = -20 + i * 56;
        const y = 264 + (i % 3) * 5;
        this.puff(ctx, x, y, 40, 13, i % 2 ? '#ffffff' : '#e7f2fa');
        this.puff(ctx, x + 16, y - 6, 24, 10, '#ffffff');
      }
      ctx.restore();

      /* ---------- left: the Forbidden City ---------- */
      // low red wall running out to the left edge
      A.wallH(ctx, -14, 86, 308, 30);
      // a hall set back behind the gate
      A.drawHall(ctx, 108, 286, 150, { wallH: 24, roofH: 20, double: true, name: '' });
      // the gate itself
      A.drawGate(ctx, 152, 308, 186, { wallH: 40, roofH: 24, double: true, arches: 3, name: '' });
      // autumn trees + lanterns
      A.tree(ctx, 36, 306, 1.7, { autumn: true });
      A.tree(ctx, 244, 304, 1.1, { autumn: true });
      A.tree(ctx, 64, 290, 0.9, { autumn: true });
      for (const lx of [74, 208]) {
        ctx.fillStyle = '#8d2b1d';
        ctx.fillRect(lx - 3, 284, 6, 7);
        ctx.fillStyle = '#ffd479';
        ctx.fillRect(lx - 1, 286, 2, 3);
      }

      /* ---------- right: the Acropolis ---------- */
      // rocky mound under the marble terrace
      for (let i = 0; i < 10; i++) {
        const ww = 168 + i * 4;
        ctx.fillStyle = i % 2 ? '#a89a7c' : '#8f8267';
        ctx.fillRect(500 - ww / 2, 306 + i, ww, 1);
      }
      ctx.fillStyle = '#6f6552';
      ctx.fillRect(500 - 92, 316, 184, 2);
      // marble terrace + a couple of loose drums
      ctx.fillStyle = '#cfc3a6';
      ctx.fillRect(414, 298, 172, 9);
      ctx.fillStyle = '#e5dcc6';
      ctx.fillRect(414, 298, 172, 2);
      ctx.fillStyle = '#b6aa8d';
      ctx.fillRect(414, 305, 172, 2);
      AG.column(ctx, 426, 302, 24, 5, {});
      AG.drawTemple(ctx, 500, 300, 152, {
        columnH: 36, columnW: 6, columns: 8, steps: 3, entH: 10, pedH: 20,
        name: '', backWall: false,
      });
      AG.oliveTree(ctx, 406, 304, 0.95);
      ctx.fillStyle = '#b6aa8d';
      ctx.fillRect(548, 302, 10, 4);
      ctx.fillStyle = '#e5dcc6';
      ctx.fillRect(548, 302, 10, 1);

      /* soft contact shadows under both cities */
      ctx.save();
      const sh1 = ctx.createRadialGradient(160, 310, 10, 160, 312, 150);
      sh1.addColorStop(0, 'rgba(70,50,40,.22)');
      sh1.addColorStop(1, 'rgba(70,50,40,0)');
      ctx.fillStyle = sh1;
      ctx.fillRect(10, 296, 300, 46);
      const sh2 = ctx.createRadialGradient(500, 314, 10, 500, 316, 140);
      sh2.addColorStop(0, 'rgba(70,60,44,.2)');
      sh2.addColorStop(1, 'rgba(70,60,44,0)');
      ctx.fillStyle = sh2;
      ctx.fillRect(360, 300, 280, 46);
      ctx.restore();

      /* ---------- portal light between the cities ---------- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beam = ctx.createLinearGradient(0, 150, 0, 314);
      beam.addColorStop(0, 'rgba(150,235,245,0)');
      beam.addColorStop(0.55, 'rgba(150,235,245,.1)');
      beam.addColorStop(1, 'rgba(120,220,235,.24)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(326, 150);
      ctx.lineTo(342, 150);
      ctx.lineTo(366, 314);
      ctx.lineTo(302, 314);
      ctx.closePath();
      ctx.fill();
      A.glow(ctx, 334, 306, 72, 'rgba(120,220,235,.45)', 0.26);
      ctx.restore();

      /* floating voxels */
      const cubes = [
        [290, 208, 9, 0], [268, 184, 8, 0], [310, 196, 7, 1],
        [344, 174, 8, 1], [372, 196, 9, 2], [396, 220, 8, 2],
        [420, 238, 8, 2], [238, 228, 7, 0], [352, 212, 6, 1],
        [286, 226, 5, 1], [150, 190, 6, 2], [468, 180, 7, 1],
      ];
      const cubeCols = [
        { top: '#e06c4b', face: '#c0452f', side: '#8d2b1d' },
        { top: '#ffe9b8', face: '#e2b463', side: '#a87c36' },
        { top: '#ffffff', face: '#e6edf4', side: '#bccdda' },
      ];
      for (let i = 0; i < cubes.length; i++) {
        const [cx0, cy0, s, kind] = cubes[i];
        const bob = Math.sin(t * 1.15 + i * 1.7) * 2.4;
        const drift = Math.sin(t * 0.55 + i * 0.9) * 1.6;
        const x = cx0 + drift, y = cy0 + bob;
        if (kind === 1) A.glow(ctx, x, y, s * 3.4, 'rgba(255,226,160,.4)', 0.22);
        if (kind === 2) A.glow(ctx, x, y, s * 3.4, 'rgba(215,240,255,.4)', 0.18);
        this.cube(ctx, x, y, s, cubeCols[kind]);
      }

      /* ---------- holographic platform ---------- */
      const px = 334, py = 326, pw = 214, pd = 34;
      ctx.save();
      const glow = ctx.createRadialGradient(px, py, 10, px, py, 130);
      glow.addColorStop(0, 'rgba(120,220,235,.3)');
      glow.addColorStop(1, 'rgba(120,220,235,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px - 140, py - 90, 280, 160);
      ctx.restore();

      const A0 = [px - pw / 2, py], B0 = [px, py - pd / 2], C0 = [px + pw / 2, py], D0 = [px, py + pd / 2];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(A0[0], A0[1]);
      ctx.lineTo(B0[0], B0[1]);
      ctx.lineTo(C0[0], C0[1]);
      ctx.lineTo(D0[0], D0[1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(86,200,218,.75)';
      ctx.lineWidth = 1;
      const lerp2 = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
      for (let i = 1; i < 6; i++) {
        const k = i / 6;
        let p1 = lerp2(A0, B0, k), p2 = lerp2(D0, C0, k);
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        p1 = lerp2(A0, D0, k); p2 = lerp2(B0, C0, k);
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(120,232,244,.95)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(A0[0], A0[1]); ctx.lineTo(B0[0], B0[1]);
      ctx.lineTo(C0[0], C0[1]); ctx.lineTo(D0[0], D0[1]);
      ctx.closePath(); ctx.stroke();
      ctx.restore();

      /* ---------- the two travellers ---------- */
      if (G.portraits && G.portraits.chibi) {
        G.portraits.chibi(ctx, 'hero', 246, 226, 1.6);
        G.portraits.chibi(ctx, 'mentor', 342, 224, 1.6);
      }

      /* ---------- foreground mist + sparks ---------- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const warm = ctx.createLinearGradient(W, 0, 0, H);
      warm.addColorStop(0, 'rgba(255,214,150,.1)');
      warm.addColorStop(0.6, 'rgba(255,214,150,.03)');
      warm.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = warm;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      const mist = ctx.createLinearGradient(0, 316, 0, H);
      mist.addColorStop(0, 'rgba(255,252,244,0)');
      mist.addColorStop(0.55, 'rgba(255,252,244,.34)');
      mist.addColorStop(1, 'rgba(255,252,244,.72)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 316, W, H - 316);

      for (let i = 0; i < 46; i++) {
        const x = G.hash(i, 1, 21) * W;
        const y = 150 + G.hash(i, 2, 22) * 190;
        const a = 0.18 + G.hash(i, 3, 23) * 0.4;
        const tw = 0.6 + 0.4 * Math.sin(t * 1.6 + i);
        ctx.globalAlpha = a * tw;
        ctx.fillStyle = i % 5 === 0 ? '#7fd6e0' : (i % 3 === 0 ? '#e8b463' : '#fff3cf');
        ctx.fillRect(Math.round(x), Math.round(y), i % 7 === 0 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;

      /* warm edge vignette */
      const vg = ctx.createRadialGradient(320, 180, 170, 320, 190, 440);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(96,76,44,.13)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
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
      if (title) title.sync();
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
    const loading = $('#artdemo-loading');
    if (loading) loading.classList.remove('hidden');
    if (frame && frame.dataset.loaded !== '1') {
      frame.onload = function () { if (loading) loading.classList.add('hidden'); };
      frame.dataset.loaded = '1';
      frame.src = G.ART_DEMO_SRC;
    } else if (loading) {
      loading.classList.add('hidden');
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
     创造模式（独立页面 · iframe 隔离 · 独立存档）
     ============================================================ */
  G.creationOpen = false;
  G.CREATION_SRC = 'creation/index.html';
  G.creationCreations = function () {
    if (!Array.isArray(G.save.data.creations)) G.save.data.creations = [];
    return G.save.data.creations;
  };
  G.openCreation = function () {
    if (G.creationOpen) return;
    G.creationOpen = true;
    const frame = $('#creation-frame');
    const loading = $('#creation-loading');
    if (loading) loading.classList.remove('hidden');
    if (frame && frame.dataset.loaded !== '1') {
      frame.dataset.loaded = '1';
      frame.onload = function () {
        if (loading) loading.classList.add('hidden');
        try {
          // 同源 iframe：完成事件只在子窗口触发，必须监听 contentWindow
          frame.contentWindow.addEventListener('wanxiang:creation-completed', function (ev) {
            const d = (ev && ev.detail) || {};
            if (typeof d.worldId !== 'string' || d.independent !== true) return;
            const list = G.creationCreations();
            list.push({ worldId: d.worldId, at: Date.now() });
            G.save.persist();
            G.ui.toast('创造模式 · 作品已定格：' + d.worldId, 'good', 2800);
          });
        } catch (e) { /* 跨域时静默：仍是独立页面 */ }
      };
      frame.src = G.CREATION_SRC;
    } else if (loading) {
      loading.classList.add('hidden');
    }
    G.show($('#creation'));
    G.input.clearPressed();
    try { if (frame) frame.focus(); } catch (e) { /* ignore */ }
  };
  G.closeCreation = function () {
    if (!G.creationOpen) return;
    G.creationOpen = false;
    G.hide($('#creation'));
    G.input.clearPressed();
    try { const c = $('#game'); if (c && c.focus) c.focus(); } catch (e) { /* ignore */ }
  };

  /* ============================================================
     home hall
     ============================================================ */
  /* 家 · 大厅已经整体下线（只保留了创造模式的接口） */
  G.homeReturn = null;
  G.goHome = function () { G.ui.toast('家已经下线了 · 创造模式请从标题页进入', 'warn', 2200); };
  G.leaveHome = function () {};
  G.toggleHome = function () { G.goHome(); };

  /* 故事模式：进「万象灵境 · 雅典—故宫」（原来放在创造模式里的那场戏） */
  function startStory() {
    G.audio.init();
    G.audio.setEnabled(G.save.data.sound !== false);
    G.save.reset(true);
    G.save.data.flags.introSeen = false;
    G.save.persist();
    G.fade.to(() => {
      if (G.enterFusion) G.enterFusion();
      else G.enterBeijing({ x: 1100, y: 1200 });
      G.ui.toast('故事模式 · 万象灵境：先和狄奥提玛确认投影标签', 'good', 3800);
    }, 520);
  }

  /* 旧故事线（中轴线 → 故宫），保留给调试 / 后续支线使用 */
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
    G.fade.to(() => {
      const pos = G.save.data.pos;
      if (pos && pos.scene === 'create' && G.mod && G.mod.go && G.mod.has && G.mod.has('map', 'create')) {
        G.mod.go('create', { spawn: { x: pos.x, y: pos.y } });
        G.ui.showHud(true);
      }
      else if (pos && pos.scene === 'wumen' && G.mod && G.mod.go && G.mod.has && G.mod.has('map', 'wumen')) {
        G.mod.go('wumen', { spawn: { x: pos.x, y: pos.y } });
        G.ui.showHud(true);
      }
      else if (pos && pos.scene === 'fusion' && G.enterFusion) { G.enterFusion({ skipIntro: true, spawn: { x: pos.x, y: pos.y } }); }
      else if (pos && pos.scene === 'gugong') { G.enterPalace({ x: pos.x, y: pos.y }); }
      else if (pos && pos.scene === 'beijing') { G.enterBeijing({ x: pos.x, y: pos.y }); }
      else if (f.night || f.finished) {
        G.enterPalace({ x: 650, y: 300 });
      } else if (f.entered) {
        let spawn = { x: 750, y: 1300 };
        if (f.metZhao) spawn = { x: 750, y: 380 };
        G.enterPalace(spawn);
      } else {
        G.enterBeijing({ x: 1100, y: 1200 });
      }
      G.ui.toast('继续故事', 'good', 2000);
    }, 520);
  }

  /* 创造模式入口（接口）：家 · 大厅的工作台调用；标题页不再放按钮 */
  G.enterCreateMode = function () {
    if (G.fade.busy) return;
    G.audio.sfx('page');
    G.fade.to(() => {
      if (G.mod && G.mod.go && G.mod.has && G.mod.has('map', 'create')) {
        G.mod.go('create');
        G.ui.showHud(true);
        G.ui.toast('造境台 · 把紫禁城与卫城的构件摆到同一台上', 'good', 3200);
        return;
      }
      G.enterFusion();
    }, 340);
  };

  /* 旧入口（保留兼容）：也走同一个接口 */
  function enterCreate() {
    G.audio.init();
    G.audio.setEnabled(G.save.data.sound !== false);
    G.fade.to(() => {
      // 新创造模式：造境台（中式/希式构件自由组合，可收境成展签）
      if (G.mod && G.mod.go && G.mod.has && G.mod.has('map', 'create')) {
        const sc = G.mod.go('create');
        if (sc) {
          G.ui.showHud(true);
          G.ui.toast('创造模式 · 造境台：把紫禁城与卫城的构件摆到同一台上', 'good', 3600);
          return;
        }
      }
      G.enterFusion();
      G.ui.toast('创造模式 · 先校准来源，再走进创作终端', 'good', 3200);
    }, 420);
  }

  /* 自动保存：把场景与站位写进存档，供「继续游戏」还原 */
  G.autosave = function () {
    if (!G.scene || G.titleActive) return;
    const p = G.scene.player || {};
    G.save.data.pos = { scene: G.scene.id || G.sceneName || 'beijing', x: Math.round(p.x || 0), y: Math.round(p.y || 0) };
    G.save.data.scene = G.scene.id || G.save.data.scene;
    G.save.persist();
  };

  /* 退出到标题页（菜单里的「退出 · 回到标题」） */
  G.quitToTitle = function () {
    if (G.fade.busy) return;
    G.autosave();
    G.audio.sfx('page');
    G.fade.to(() => {
      if (G.scene && G.scene.exit) { try { G.scene.exit(); } catch (e) { /* noop */ } }
      G.scene = null;
      G.sceneName = '';
      G.ui.showHud(false);
      G.ui.setHomeButton(false);
      G.hide($('#hud'));
      G.hide($('#exit-screen'));
      // 注意：这里不要调 G.backToTitle()——它会被 fade.busy 挡住，直接切回标题页
      G.show($('#title'));
      G.titleActive = true;
      G.input.clearPressed();
      title.sync();
    }, 320);
  };

  /* 支线 · 打铁花：从正阳门出发，沿中轴线一路走到午门、进宫、入夜 */
  G.enterTiehua = function () {
    if (G.fade.busy) return;
    G.audio.init();
    G.audio.setEnabled(G.save.data.sound !== false);
    // 支线从头走：清掉入园 / 材料 / 夜场标记，保留图鉴与最佳成绩
    G.save.flag('entered', false);
    G.save.flag('metZhao', false);
    G.save.flag('iron', false);
    G.save.flag('charcoal', false);
    G.save.flag('ladle', false);
    G.save.flag('night', false);
    G.save.data.flags.palaceIntroSeen = false;
    G.save.data.flags.introSeen = true;
    G.save.data.scene = 'beijing';
    G.save.persist();
    G.fade.to(() => {
      G.enterBeijing({ x: 1100, y: 1200 });
      G.unlock('axis');
      G.ui.toast('支线 · 打铁花：从正阳门出发，沿中轴线向北走到午门', 'good', 3600);
    }, 420);
  };

  /* 退出游戏：浏览器允许时直接关闭标签页，否则留在退出画面 */
  G.exitGame = function () {
    if (G.fade.busy) return;
    G.save.persist();
    G.audio.sfx('gong');
    G.fade.to(() => {
      G.titleActive = false;
      G.hide($('#title'));
      G.ui.showHud(false);
      G.show($('#exit-screen'));
      setTimeout(() => { try { window.close(); } catch (e) { /* ignore */ } }, 60);
    }, 320);
  };

  G.backToTitle = function () {
    if (G.fade.busy) return;
    G.hide($('#exit-screen'));
    G.show($('#title'));
    G.titleActive = true;
    G.ui.showHud(false);
    if (title) title.sync();
    G.input.clearPressed();
  };

  /* ============================================================
     title init
     ============================================================ */
  const title = {
    active: true,
    init() {
      /* 旧线（btn-start / btn-fusion / btn-athens）已整体下线 */
      $('#btn-continue').addEventListener('click', () => continueGame());
      const thBtn = $('#btn-tiehua');
      if (thBtn) thBtn.addEventListener('click', () => G.enterTiehua());
      const crBtn = $('#btn-create');
      if (crBtn) crBtn.addEventListener('click', () => G.openCreation());
      const creationClose = $('#creation-close');
      if (creationClose) creationClose.addEventListener('click', () => G.closeCreation());
      $('#btn-exit').addEventListener('click', () => G.exitGame());
      const delBtn = $('#btn-del-save');
      if (delBtn) delBtn.addEventListener('click', () => {
        G.confirm('删除本机存档？', '进度、图鉴与最佳成绩都会被清除，无法恢复。', () => {
          G.save.remove();
          title.sync();
          G.ui.toast('存档已删除', 'good', 2200);
        });
      });
      $('#btn-back-title').addEventListener('click', () => G.backToTitle());
      this.sync();
    },
    sync() {
      const has = G.save.exists();
      const btn = $('#btn-continue');
      if (btn) {
        btn.disabled = !has;
        btn.querySelector('small').textContent = has ? 'CONTINUE' : 'NO SAVE';
      }
      const slot = $('#save-slot');
      const info = $('#save-info');
      if (!slot || !info) return;
      slot.classList.toggle('none', !has);
      if (!has) { info.textContent = '存档 · 暂无'; return; }
      const d = G.save.data || {};
      const sceneName = ({ beijing: '北京 · 中轴线', gugong: '紫禁城', fusion: '万象灵境', wumen: '午门', create: '造境台', acropolis: '卫城', athens: '雅典城' })[d.scene] || (d.scene || '旅途');
      const mins = Math.max(0, Math.round(((Date.now() - (d.at || Date.now())) / 60000)));
      const done = d.codex ? d.codex.length : 0;
      info.textContent = '存档 · ' + sceneName + ' · 图鉴 ' + done + ' 页';
    },
  };

  /* ============================================================
     global keys
     ============================================================ */
  G.onKeyDown = function (code) {
    if (G.audio.ctx) G.audio.resume();
    if (G.ai && G.ai.open) {
      if (code === 'Escape') G.ai.close();
      return;
    }
    if (G.creationOpen) {
      if (code === 'Escape') G.closeCreation();
      return;
    }
    if (G.confirmOpen) {
      if (code === 'Escape') G.closeConfirm(false);
      else if (code === 'Enter') G.closeConfirm(true);
      return;
    }
    // exit screen: any confirm key re-enters the title
    if ($('#exit-screen') && !$('#exit-screen').classList.contains('hidden')) {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') G.backToTitle();
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
    if (code === 'KeyT') { if (G.ai) G.ai.toggle(); return; }
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
    if (G.ai) G.ai.init();

    $('#confirm-yes').addEventListener('click', () => G.closeConfirm(true));
    $('#confirm-no').addEventListener('click', () => G.closeConfirm(false));
    $('#confirm').addEventListener('click', (e) => { if (e.target.id === 'confirm') G.closeConfirm(false); });
    const homeBtn = $('#btn-home');
    if (homeBtn) homeBtn.addEventListener('click', () => G.toggleHome());
    const askBtn = $('#btn-ask');
    if (askBtn && G.ai) askBtn.addEventListener('click', () => G.ai.toggle());
    const menuAsk = $('#menu-ask');
    if (menuAsk && G.ai) menuAsk.addEventListener('click', () => { menu.close(); G.ai.show(); });
    const menuArt = $('#menu-artdemo');
    if (menuArt) menuArt.addEventListener('click', () => { menu.close(); G.openArtDemo(); });
    const artClose = $('#artdemo-close');
    if (artClose) artClose.addEventListener('click', () => G.closeArtDemo());
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
      G.hide($('#exit-screen'));
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

    // 每 8 秒自动保存一次站位与进度；打开菜单、切后台、离开页面时也会存
    setInterval(() => { try { if (!G.titleActive) G.autosave(); } catch (e) { /* noop */ } }, 8000);
    document.addEventListener('pause', () => G.autosave());
    // auto-save on hide
    window.addEventListener('beforeunload', () => G.autosave());
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.save.persist(); });

    // initial UI
    G.ui.showHud(false);
    G.ui.setHomeButton(false);
    G.hide($('#security'));
    G.hide($('#mg-hud'));
    G.hide($('#mg-result'));
    G.hide($('#codex'));
    G.hide($('#menu'));
    G.hide($('#exit-screen'));
    $('#mg-zone').style.left = '52%';
    $('#mg-zone').style.width = '32%';
    if (!hasSave) {
      // keep title clean for first-time visitors
      G.save.data.sound = true;
    }

    // main loop
    let last = performance.now();
    let titleT = 0;
    let wasTitle = null;
    const titleBg = $('#title-bg');
    const titleBgCtx = titleBg ? titleBg.getContext('2d') : null;
    if (titleBgCtx) titleBgCtx.imageSmoothingEnabled = false;
    // the title art is a full-bleed poster: cover wide windows, contain narrow ones
    function fitTitleBg() {
      if (!titleBg) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      const s = vw / vh >= 1.5
        ? Math.max(vw / G.W, vh / G.H)
        : Math.min(vw / G.W, vh / G.H);
      titleBg.style.width = Math.round(G.W * s) + 'px';
      titleBg.style.height = Math.round(G.H * s) + 'px';
    }
    fitTitleBg();
    window.addEventListener('resize', fitTitleBg);
    function frame(now) {
      requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (!isFinite(dt) || dt < 0) dt = 0.016;
      dt = Math.min(dt, 0.05);
      if (G.titleActive !== wasTitle) {
        wasTitle = G.titleActive;
        document.body.classList.toggle('title-mode', !!G.titleActive);
      }
      if (G.titleActive) {
        titleT += dt;
        titleArt.t = titleT;
        if (titleBgCtx) titleArt.draw(titleBgCtx);
      } else if (G.minigameGreek && G.minigameGreek.active) {
        G.minigameGreek.update(dt);
        G.minigameGreek.draw(ctx);
      } else if (G.minigame && G.minigame.active) {
        G.minigame.update(dt);
        G.minigame.draw(ctx);
      } else if (G.sundial && G.sundial.active) {
        // 日晷谜题直接画在主画布上，必须自己接管 update/draw，否则表针不动、也看不到盘面
        G.sundial.update(dt);
        G.sundial.draw(ctx);
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
