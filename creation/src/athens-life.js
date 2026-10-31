/* Contemporary learning activities, not historical ritual or restoration. */
(() => {
 'use strict';
 const G=window.G,R=window.WanxiangRender,$=id=>document.getElementById(id);
 const source='https://www.ysma.gr/en/monuments/';
 const stone='#e8ddc1',shade='#a2b5b0';
 const column=(x,y,h=94)=>`<path d="M${x-10} ${y}h20l-3 ${h}h-14z" fill="${stone}"/><path d="M${x-16} ${y-10}h32v10h-32z" fill="${shade}"/><path d="M${x-4} ${y+3}v${h-7}m8 0v-${h-7}" stroke="#9ca799" stroke-width="2"/>`;
 const steps='<path d="M65 226h350v12H65z M80 214h320v12H80z M95 202h290v12H95z" fill="#bdc5b6"/>';
 const cards={
  propylaea:{title:'山门：让入口回应地形',tag:'雅典卫城 · 历史参照与当代转译',source,text:'雅典卫城山门（Propylaia）位于卫城西侧入口，门厅与两翼共同组织进入高地的过程。入口处理与地形条件有关，不能把它理解成平地上一条笔直大道的终点。本作保留前庭、门槛与高低台地的转换，不复刻历史建筑的尺度和全部通道。',observe:'走过山门后，看看偏向一侧的主庙与展开的平台。再从侧面回望入口，观察正面与斜向观看的区别。',svg:`${steps}<path d="M112 100h256v16H112z M101 100l139-58 139 58z" fill="${stone}"/>${[135,177,303,345].map(x=>column(x,126,76)).join('')}<path d="M216 133h48v69h-48z" fill="#8ba3a0"/><path d="M240 266v-47m-7 9 7-9 7 9" fill="none" stroke="#d4b273" stroke-width="3"/><text x="240" y="30" fill="#ded9c4" font-size="16" text-anchor="middle">由前庭走入台地</text>`},
  temple:{title:'神庙：柱列、山墙与周边留白',tag:'多立克式元素 · 简化建筑插画',source,text:'帕特农神庙外部采用多立克式柱列。柱列、柱头、檐部与三角山墙共同构成立面的层次，外围柱廊也形成可环绕观看的空间。古希腊建筑曾使用色彩，今天常见的白石形象不能代表古代完整外观。游戏仅借用部分形式，不是帕特农神庙的精确复原。',observe:'走到主庙正面看山墙，再绕到一侧看柱列的重复与间隔。这里的柱数、比例和朝向均服务于游戏；请把它看成有文化参照的创作。',svg:`${steps}<path d="M90 93l150-65 150 65z" fill="${stone}"/><path d="M120 85l120-43 120 43z" fill="#8c9e99"/><path d="M95 97h290v17H95z" fill="#c6c9b7"/>${[120,168,216,264,312,360].map(x=>column(x,124,78)).join('')}<path d="M90 247h300" stroke="#d3b37b" stroke-width="2"/><text x="240" y="270" fill="#ded9c4" font-size="15" text-anchor="middle">台阶基座 → 柱身 → 柱头 → 檐部</text>`},
  stoa:{title:'柱廊：在重复中留下停留的空间',tag:'古希腊柱廊参照 · 非特定遗址复原',source:'https://www.ascsa.edu.gr/excavations/athenian-agora',text:'Stoa 通常指一面较开放、由柱列支撑屋顶的长形建筑。雅典古代集市中的柱廊与行走、交谈、交易等公共活动相关；集市与卫城是不同的空间。游戏把“柱廊中的停留与节奏”作为创作参照，并不声称这里还原了卫城某座原有柱廊。',observe:'沿柱列慢走，找一处可以看向院落的开口。声石节奏是本作新增的现代互动，不是古代建筑的仪式或原有功能。',svg:`<path d="M62 214h356v20H62z" fill="#bdc5b6"/><path d="M75 80h330v28H75z" fill="#d7d1b9"/><path d="M87 108h306v102H87z" fill="#637e79"/>${[100,156,212,268,324,380].map(x=>column(x,124,86)).join('')}<path d="M100 251h280m-10-6 10 6-10 6" fill="none" stroke="#d4b273" stroke-width="3"/><text x="240" y="51" fill="#ded9c4" font-size="16" text-anchor="middle">遮蔽、开放与柱间节奏</text>`}
 };
 for(const c of Object.values(cards))c.caption='原创建筑插画 · 非历史照片 / 非测绘复原；色彩为游戏表达';
 const parts=['台阶基座','柱身','柱头','檐部'];let current=null,order=[1,3,0,2];
 function init(panel){
  const area=document.createElement('div');area.id='athens-game';area.className='hidden';
  area.innerHTML='<p class="palace-lead" id="stone-lead">石作学徒 · 伊里斯　“从脚下的平台往上看，哪一部分承托哪一部分？”</p><div class="stone-study"><figure><svg id="stone-study-view" viewBox="0 0 360 260" role="img" aria-label="按当前排列显示的四层柱式构件"></svg><figcaption>现代观察模型 · 非施工或修复指导</figcaption></figure><div><h3>从下到上，排列四层</h3><p>点击层位切换构件，再观察左侧模型。多立克柱身直接立于台阶基座，不另添独立柱础。</p><div class="stone-order">'+parts.map((_,i)=>'<button id="stone-slot-'+i+'"></button>').join('')+'</div><div class="palace-tools"><button id="stone-check">检验层次</button><button id="stone-help">辅助示范</button></div></div></div><p id="stone-feedback" role="status" aria-live="polite"></p><p class="palace-role">不计时、可退出。完成后留下小石模，保留在画卷中；不影响主线进度。</p>';
  panel.querySelector('.palace-sheet').appendChild(area);
  for(let i=0;i<4;i++)$('stone-slot-'+i).onclick=()=>{if(current.life.columnStudy)return;order[i]=(order[i]+1)%4;draw();$('stone-feedback').textContent='已调整第 '+(i+1)+' 层，点击「检验层次」试一试。';};
  $('stone-check').onclick=()=>attempt();$('stone-help').onclick=()=>attempt(true);
 }
 function draw(){
  const shapes=[y=>`<path d="M75 ${y+20}h210v12H75z M90 ${y+10}h180v10H90z M110 ${y}h140v10H110z" fill="#b5c2b6"/>`,y=>`<path d="M163 ${y}h34l-4 32h-26z" fill="#e6ddc4"/><path d="M175 ${y+3}v26m10-26v26" stroke="#a0aaa0" stroke-width="2"/>`,y=>`<path d="M150 ${y}h60v11h-60z M158 ${y+11}h44l-9 21h-26z" fill="#dfd6bc"/>`,y=>`<path d="M102 ${y}h156v32H102z" fill="#d4c8ab"/><path d="M112 ${y+10}h136m-136 11h136" stroke="#98aaa0" stroke-width="2"/>`];
  $('stone-study-view').innerHTML='<rect width="360" height="260" rx="12" fill="#142f33"/>'+order.map((part,i)=>shapes[part](207-i*48)).join('');
  for(let i=0;i<4;i++){$('stone-slot-'+i).textContent=(i+1)+' · '+(i===0?'底层':i===3?'顶层':'中层')+'：'+parts[order[i]]+' ↻';$('stone-slot-'+i).disabled=current.life.columnStudy;}
 }
 function open(s){current=s;$('stone-lead').textContent=(s.spec.plan.interactionPolicy==='no-npc'?'观察提示':'石作学徒 · 伊里斯')+'：从脚下的平台往上看，哪一部分承托哪一部分？';order=s.life.columnStudy?[0,1,2,3]:[1,3,0,2];draw();$('stone-feedback').textContent=s.life.columnStudy?'已完成'+(s.life.columnAssisted?' · 使用辅助示范':' · 自己完成')+'，场景中的小石模已保留。':'沿着承托关系，从台阶基座到檐部逐层排列。';}
 function attempt(assisted=false){
  if(!current||!window.PalaceLife.hasGames(current)||current.life.columnStudy)return false;
  if(assisted)order=[0,1,2,3];
  if(order.some((part,i)=>part!==i)){$('stone-feedback').textContent=new Set(order).size<4?'有构件重复了：四种构件各使用一次。':'还未形成承托次序。先找最下面的台阶，再让柱身托住柱头，柱头承托檐部。';return false;}
  Object.assign(current.life,{columnStudy:true,columnAssisted:assisted,stoneModel:true});draw();$('stone-feedback').textContent=assisted?'示范完成 · 已标记辅助。台阶、柱身、柱头、檐部依次向上，石作案边留下了小石模。':'层次连起来了！你的小石模已留在石作案边，也会出现在画卷里。';G.audio.sfx('success');window.FusionExplore.save();return true;
 }
 function mount(s){
  const data=s.spec.layout.interactions;if(!data||data.policy==='quiet')return;
  for(const a of data.anchors.filter(a=>a.culture==='acropolis')){
   const craft=a.id==='stone',npc=data.policy!=='no-npc',name=npc?a.name:craft?'柱式观察案':'台地图记';
   s.addBuilding(a.x,a.y,c=>{R.rect(c,a.x-19,a.y-5,38,12,'#8d9f97');R.rect(c,a.x-22,a.y-10,44,7,'#d1d1ba');R.rect(c,a.x-7,a.y-19,14,9,craft?'#e2ddc5':'#b2c8b4');if(npc)G.art.drawActor(c,a.x+27,a.y+7,{dir:'down',frame:0,moving:false,time:0,palette:{...G.art.actorPalettes.tourist,robe:craft?'#a58157':'#69828e',robeDark:'#42565a',robeLight:'#c9c7a8',hat:'#e0d5b9'},scale:1.26});});
   s.addInteract({...a,name,r:44,label:npc?'与'+a.name+'交谈':name,action:()=>window.PalaceLife.open(s,craft&&window.PalaceLife.hasGames(s)?'stoneplay':craft?'temple':'propylaea')});
   if(craft)s.addBuilding(a.x-31,a.y+35,c=>{if(!s.life.stoneModel)return;R.rect(c,a.x-43,a.y+29,24,6,'#a8b9ac');R.rect(c,a.x-34,a.y+9,6,20,'#f0e1b9');R.rect(c,a.x-38,a.y+5,14,5,'#e5d4aa');R.rect(c,a.x-43,a.y,24,5,'#cbd0b9');});
  }
 }
 window.AthensLife={cards,init,open,attempt,mount};
})();
