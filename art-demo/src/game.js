/* 万象灵境·融合探索 v0.5：门院成序、合璧殿、可导出的作品画卷。
 * 直接继承队友的 G.WorldScene；PromptDirector 是当前本地演示生成器。
 * 未来 AI 返回同一场景规格，经过校验后交给 FusionScene。不得执行模型返回的代码。
 */
(() => {
  'use strict';
  const G=window.G, A=G.art, C=window.FusionPalace.art;
  const $=id=>document.getElementById(id), canvas=$('game'),ctx=canvas.getContext('2d');
  const STORE='wanxiang.fusion.explore.art1', reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PRESETS={
    stars:'让星海流过白石柱廊，红檐下亮起灯，鲸从月光里游来。',
    tide:'让海月穿过白石柱廊，退潮时露出通往红檐殿的路。',
    garden:'让花从借景窗里漫出来，托起一座通往云中殿的花桥。'
  };
  const THEMES={
    stars:{title:'星海长桥',sub:'星作水，桥作舟',sky:'#14243c',sky2:'#293b59',floor:'#827d70',tile:'#999382',grass:'#354e49',water:'#173a58',waterHi:'#6fa9bd',cloud:'#42607b',glow:'#e8c684',night:true},
    tide:{title:'倒流潮汐',sub:'月落水庭，潮声向北',sky:'#192f42',sky2:'#365766',floor:'#a39880',tile:'#b9af94',grass:'#465f54',water:'#21546a',waterHi:'#91c6c9',cloud:'#5c818b',glow:'#93d8e0',night:true},
    garden:{title:'云上花园',sub:'云托殿宇，风携春信',sky:'#6a9da8',sky2:'#bed5c8',floor:'#b1ab8a',tile:'#cbc4a0',grass:'#6f8b63',water:'#467f88',waterHi:'#b1d6ca',cloud:'#c8dfd5',glow:'#f3c6ad',night:false}
  };
  const copy=o=>JSON.parse(JSON.stringify(o));
  function random(seed){let a=2166136261;for(const c of String(seed))a=Math.imul(a^c.codePointAt(0),16777619);return()=>{a+=0x6d2b79f5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  // 自然语言映射只支持明确列出的意象；UI与README均说明当前是本地演示。
  const PromptDirector={
    create(prompt){
      prompt=String(prompt).trim();if(prompt.length<8)throw new Error('再添一点想象吧：写下你想看到的建筑、景色或奇遇。');if(prompt.length>1200)throw new Error('请把这次想象控制在1200字以内。');
      const intent=prompt.replace(/(?:不要|不需要|没有|无)(?:任何)?(?:鲸鱼?|下雨|雨|雪|花|灯|星星)/g,'');
      const scores={stars:(intent.match(/星|银河|宇宙|星空|鲸|发光|太空/g)||[]).length,tide:(intent.match(/潮|海潮|倒流|海底|水庭|倒影|鱼|海洋/g)||[]).length,garden:(intent.match(/花|春|云海|花园|桃|樱|庭园|云上/g)||[]).length};
      const r=random(prompt), theme=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];
      const chosen=scores[theme]?theme:['stars','tide','garden'][Math.floor(r()*3)];
      return window.FusionSpec.extend({version:3,prompt,theme:chosen,seed:prompt,weather:/雪|冰/.test(intent)?'snow':/雨/.test(intent)?'rain':/雾/.test(intent)?'mist':'clear',flowers:/花|桃|樱|春/.test(intent),whale:!/(?:不要|不需要|没有|无)(?:任何)?鲸/.test(prompt)&&(/鲸|鱼|海|星/.test(intent)||chosen==='stars'),manyLights:/灯|发光|星/.test(intent),ruins:/遗迹|残垣|断柱/.test(intent),mirror:/倒影|镜|潮/.test(intent),reverse:/倒流|逆流/.test(intent),gardenChoice:'unset',offset:Math.floor(r()*4)*10,roots:['axis','garden','symmetria']});
    },
    validate(s){return window.FusionSpec.validate(s);}
  };
  let active=null,preview=PromptDirector.create(PRESETS.stars),creating=true,bookOpen=false,busy=false,lastFrame=performance.now(),previewTime=0,saveCandidate=null;
  const R=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function star(c,x,y,s,color){c.fillStyle=color;c.fillRect(x-s,y,2*s+1,1);c.fillRect(x,y-s,1,2*s+1);}
  function cloud(c,x,y,s,col){c.save();c.globalAlpha=.7;for(const [dx,dy,w,h]of[[-34,0,75,8],[-19,-7,38,9],[-3,-12,22,10],[19,-5,32,8]])R(c,x+dx*s,y+dy*s,w*s,h*s,col);c.restore();}
  // 大轮廓在低分辨率画布上绘制，再由同一640×360像素舞台展示。
  function whale(c,x,y,s,t,color){c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);c.fillStyle=color;c.beginPath();c.moveTo(-45,0);c.lineTo(-30,-10);c.lineTo(7,-13);c.lineTo(25,-6);c.lineTo(34,0);c.lineTo(42,-8);c.lineTo(49,-11);c.lineTo(46,-1);c.lineTo(53,6);c.lineTo(41,4);c.lineTo(33,2);c.lineTo(20,12);c.lineTo(-16,14);c.lineTo(-37,7);c.closePath();c.fill();R(c,-29,4,45,4,'#86afbf');c.fillStyle='#85a7b6';c.beginPath();c.moveTo(-5,8);c.lineTo(8,23+Math.sin(t)*2);c.lineTo(15,10);c.fill();R(c,-30,0,2,2,'#e6e4c4');for(let i=0;i<3;i++)R(c,-19+i*6,-9,3,1,'#a1c1cc');c.restore();}
  function lotus(c,x,y,t,color){c.save();c.translate(x,y);for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*.1;c.fillStyle=color;c.beginPath();c.ellipse(Math.cos(a)*4,Math.sin(a)*2,4,2,a,0,G.TAU);c.fill();}R(c,-1,-1,2,2,'#f4d98b');c.restore();}
  function stoa(c,x,y,w=180){R(c,x-w/2+5,y-39,w-10,34,'#64695c');R(c,x-w/2-4,y-4,w+8,5,'#b9b49a');const n=Math.round(w/18);for(let i=0;i<n;i++)A.column(c,x-w/2+8+i*(w-16)/(n-1),y-4,34,5,{});R(c,x-w/2-7,y-48,w+14,10,'#e3d8bb');R(c,x-w/2-10,y-52,w+20,4,'#a65c45');R(c,x-w/2-9,y-52,w+18,1,'#da9c67');}
  function beacon(c,x,y,lit,time,col){A.altar(c,x,y,false,time);R(c,x-2,y-30,4,17,'#b59b60');if(lit){A.glow(c,x,y-29,50,col,.22);star(c,x,y-30,5,'#ffe5a8');}else{c.strokeStyle='#a3bab8';c.strokeRect(x-4,y-34,8,8);} }
  // 当代虚构建筑：统一柱距、梁位和檐口，共用一个结构模数，不把两张成品图叠在一起。
  function fusionHall(c,x,y,state={}){
    c.save();c.translate(x,y);const glow=state.theme?.glow||'#e8c684';
    R(c,-154,0,308,9,'#7d8278');R(c,-148,-4,296,5,'#e2d8ba');R(c,-142,-8,284,5,'#bfbba5');
    for(let i=0;i<4;i++)R(c,-28-i*6,8+i*3,56+i*12,3,i%2?'#d4c9ad':'#aaa995');
    R(c,-128,-60,256,54,'#41545977');R(c,-130,-8,260,2,'#f0dfb4');
    for(const dx of[-119,-85,-51,-17,17,51,85,119]){A.column(c,dx,-8,54,8,{});if(state.echo){A.glow(c,dx,-63,16,'rgba(137,211,214,.4)',.2);star(c,dx,-64,1,'#d0e7d7');}}
    c.save();c.globalAlpha=state.cutaway ? 0.3 : 1;
    R(c,-137,-78,274,16,'#823e30');R(c,-140,-79,280,3,'#dcc38d');R(c,-137,-65,274,3,'#b08b52');
    for(let i=0;i<8;i++){const dx=-119+i*34;R(c,dx-10,-75,20,8,'#346a68');R(c,dx-7,-73,12,1,'#dbca93');R(c,dx-7,-72,1,3,'#dbca93');R(c,dx+5,-72,1,3,'#dbca93');R(c,dx-2,-77,4,3,glow);}
    C.roof(c,0,-78,161,27,null,{ornaments:3});
    R(c,-112,-104,224,11,'#8a4030');for(let dx=-99;dx<110;dx+=22)R(c,dx,-102,9,5,'#344b48');
    C.roof(c,0,-103,128,28,null,{ornaments:3});
    if(state.garden){if(state.view==='flowers')lotus(c,0,-96,0,'#f2c1b0');else{c.fillStyle='#e3d7ac';c.beginPath();c.arc(0,-97,6,0,G.TAU);c.fill();c.fillStyle='#8a4030';c.beginPath();c.arc(-3,-99,5,0,G.TAU);c.fill();}}
    R(c,-23,-75,46,11,'#242e2d');G.text(c,'合 璧',0,-67,{size:7,color:'#edce91',align:'center'});c.restore();
    if(state.finished)A.glow(c,0,-35,110,'rgba(255,210,138,.35)',.2);
    c.restore();
  }
  function fusionWing(c,x,y,w=164){stoa(c,x,y,w);R(c,x-w/2-5,y-48,w+10,9,'#813c2d');for(let dx=-w/2+10;dx<w/2;dx+=22){R(c,x+dx,y-47,9,5,'#427876');R(c,x+dx+2,y-46,5,1,'#e0cc94');}C.roof(c,x,y-48,w/2+15,19,null,{ornaments:2});}
  class FusionScene extends G.WorldScene{
    constructor(spec,progress){
      if(!PromptDirector.validate(spec))throw new Error('场景规格不符合当前生成器约定。');
      super({id:'fusion',w:1440,h:1200,spawn:{x:720,y:1040},lookAhead:37,dayGrade:false});
      this.spec=window.FusionSpec.freeze(copy(spec));this.theme=THEMES[spec.theme];this.ambient=this.theme.night?'night':'palace';
      const p=window.FusionSpec.progress(progress);this.flags=p.flags;this.echoStep=0;this.mistView=p.gardenChoice;this.tideMode=p.tideMode;this.rhythm=p.rhythm;this.artwork=p.artwork;this.cameraCue=null;
      this.flags.tide=this.passage().open;if(!(this.flags.axis&&this.flags.garden&&this.flags.tide&&this.flags.echo))this.flags.finished=false;
      this.night=false;this.dayGrade=false;this.finishTime=0;this.marker=null;this.decor=[];this.fireflies=[];this.weatherParticles=[];this.make();this.buildGround(c=>this.paintGround(c));this.player.speed=100;this.player.runSpeed=158;
      if(progress?.player&&this.safePosition(progress.player.x,progress.player.y))this.setPlayer(progress.player.x,progress.player.y);
      this.placeCamera(true);this.refreshGoal();
    }
    safePosition(x,y){return Number.isFinite(x)&&Number.isFinite(y)&&x>150&&x<1290&&y>200&&y<1100&&!this.collides(x,y);}
    collides(x,y){const bx=x-4,by=y-3,w=this.spec.layout.water,p=this.passage();if(bx<w.x+w.w&&bx+8>w.x&&by<w.y+w.h&&by+5>w.y&&(!p.open||bx<p.rect.x+3||bx+8>p.rect.x+p.rect.w-3))return true;return this.solids.some(s=>!(s.axisLock&&this.flags.axis)&&bx<s.x+s.w&&bx+8>s.x&&by<s.y+s.h&&by+5>s.y);}
    make(){
      const s=this.spec,t=this.theme,r=random(s.seed),o=s.offset;
      this.solid(0,0,1440,170);this.solid(0,1110,1440,90);this.solid(0,170,145,940);this.solid(1295,170,145,940);
      this.solid(145,970,547,45);this.solid(748,970,547,45);
      // 宫门两侧有通行边界，中央门洞可穿行；保留主轴入口，不复制原遗址平面。
      this.solid(554,907,142,30);this.solid(744,907,142,30);
      this.addBuilding(720,930,c=>{c.save();if(!this.capturingArtwork&&Math.abs(this.player.x-720)<125&&this.player.y<930&&this.player.y>835)c.globalAlpha=.3;C.drawGate(c,720,930,290,{wallH:48,roofH:28,double:true,arches:3,name:'入梦'});c.restore();});
      this.axisLayout=this.spec.layout.axis;
      this.addBuilding(720,430,c=>{C.drawHall(c,720,430,280,{wallH:47,roofH:36,double:true,bays:11,lanterns:true});if(this.flags.finished)A.glow(c,720,410,170,'rgba(255,208,116,.35)',.25);});this.solidRect(720,427,276,45);
      this.addBuilding(500,870,c=>fusionWing(c,500,870));this.solidRect(500,868,166,25);
      this.addBuilding(940,870,c=>fusionWing(c,940,870));this.solidRect(940,868,166,25);
      this.addBuilding(720,815,c=>{C.wallH(c,145,620,815,24,{});C.wallH(c,820,1295,815,24,{});c.save();if(!this.capturingArtwork&&Math.abs(this.player.x-720)<90&&this.player.y<815&&this.player.y>750)c.globalAlpha=.3;C.drawGate(c,720,815,180,{wallH:34,roofH:23,double:false,arches:3,name:'承序'});c.restore();if(!this.flags.axis){R(c,705,790,30,25,'#702c23');for(let xx=707;xx<735;xx+=5)R(c,xx,792,1,21,'#b27b46');}else A.glow(c,720,797,30,'rgba(255,215,147,.4)',.2);});
      this.solid(145,795,559,23);this.solid(736,795,559,23);this.solids.push({x:704,y:795,w:32,h:23,axisLock:true});
      this.addBuilding(720,610,c=>fusionHall(c,720,610,{...this.flags,theme:this.theme,view:this.mistView,cutaway:!this.capturingArtwork&&Math.abs(this.player.x-720)<140&&this.player.y<605&&this.player.y>480}));
      for(const dx of[-119,-85,-51,-17,17,51,85,119])this.solid(720+dx-4,593,8,12);
      this.addBuilding(1080,635,c=>{if(s.mirror){c.save();c.translate(0,970);c.scale(1,-.52);c.globalAlpha=.14;A.drawTemple(c,1080,635,226,{columns:8,columnH:49,columnW:8,entH:14,pedH:22});c.restore();}A.drawTemple(c,1080,635,226,{columns:8,columnH:49,columnW:8,entH:14,pedH:22,name:''});cloud(c,1080,526,1.4,t.cloud);});this.solidRect(1080,632,226,45);
      this.addBuilding(475,520,c=>fusionWing(c,475,520));this.solidRect(475,518,166,25);
      this.addBuilding(965,520,c=>fusionWing(c,965,520));this.solidRect(965,518,166,25);
      // 园景池：绕树、绕水组织曲径，不能直接从水面抄近路。
      this.solid(289,548,93,105);this.solid(432,542,65,77);
      const landscape=[{x:315,y:540,type:'olive'},{x:490,y:538,type:'tree'},{x:310,y:720,type:'tree'},{x:470,y:744,type:'olive'},{x:238,y:895,type:'tree'},{x:1208,y:860,type:'olive'},{x:1168,y:1049,type:'tree'},{x:270,y:1050,type:'olive'}];
      for(let i=0;i<22;i++){const x=190+Math.floor(r()*1060),y=225+Math.floor(r()*800);if(Math.abs(x-720)<180||Math.abs(y-690)<65||Math.abs(y-980)<55||x>950&&y>490&&y<760||x>275&&x<510&&y>490&&y<790)continue;landscape.push({x,y,type:i%2?'tree':'olive'});}
      for(const d of landscape){this.decor.push(d);this.addBuilding(d.x,d.y,c=>this.drawTree(c,d));this.solid(d.x-5,d.y-4,10,7);}
      for(const [x,y]of[[635,1055],[805,1055],[635,960],[805,960],[620,785],[820,785],[620,615],[820,615],[590,500],[850,500],[1140,770],[1000,770]]){this.addBuilding(x,y,c=>{C.lantern(c,x,y,{night:true,h:33});if(s.manyLights||this.flags.finished)A.glow(c,x,y-22,30,'rgba(255,183,83,.45)',.25);});this.solid(x-3,y-3,6,5);}
      for(let i=0;i<44;i++)this.fireflies.push({x:220+r()*1000,y:250+r()*720,p:r()*G.TAU});
      for(let i=0;i<85;i++)this.weatherParticles.push({x:r()*640,y:r()*360,v:.4+r()*.8,p:r()*6});
      this.addNPC({x:775,y:1035,name:'砚舟 · 守境人',palette:C.actorPalettes.zhao,quest:!this.flags.guide,getLines:()=>[{name:'砚舟',text:'欢迎。先点亮门庭灯，再选一扇借景、拨动潮水。月光会露出石径，花雨能托起浮桥。走过你亲手改变的路，给柱廊留下一段声音。'}],onTalk:()=>{this.flags.guide=true;this.refreshGoal();saveProgress();}});
      this.addNPC({x:1005,y:686,name:'闻风 · 采声人',palette:A.actorPalettes.tourist,getLines:()=>[{name:'闻风',text:'这里不考你记顺序。叩响任一声石，为柱廊选一段节奏：逐光、回澜或齐鸣。它会成为你这次创作的记忆，留在画卷的题记里。'}]});
      this.addBuilding(720,855,c=>beacon(c,720,855,this.flags.axis,this.time,'rgba(255,202,114,.6)'));
      this.addInteract({x:720,y:883,r:31,label:'点亮门庭灯，开启承序门',action:()=>this.axisInteraction()});
      this.addBuilding(405,665,c=>this.drawFrame(c,405,665));
      const garden=this.node('garden'),tide=this.node('tide');
      this.addBuilding(garden.x,garden.y-12,c=>{this.drawFrame(c,garden.x,garden.y-12);G.text(c,'借景',garden.x,garden.y+3,{size:8,color:'#f4dbad',align:'center',outline:'#203d46'});});
      this.addInteract({...garden,r:30,label:'借景 · 海月或花雨',action:()=>this.gardenInteraction()});
      this.addBuilding(tide.x,tide.y-12,c=>{A.altar(c,tide.x,tide.y-12,false,this.time);star(c,tide.x,tide.y-39,3,this.flags.tide?'#ffe2a6':'#a5d7d9');G.text(c,'引潮',tide.x,tide.y+3,{size:8,color:'#f4dbad',align:'center',outline:'#203d46'});});
      this.addInteract({...tide,r:30,label:'引潮 · 改变水庭通路',action:()=>this.tideInteraction()});
      [890,935,980].forEach((x,i)=>{this.addBuilding(x,665,c=>{A.column(c,x,665,19+i*7,12,{});const phase=this.rhythm==='together'?0:this.rhythm==='returning'?2-i:i;const lit=this.flags.echo&&(Math.floor(this.time*2)%3===phase);star(c,x,640-i*7,lit?4:2,lit?'#ffe3a0':'#91bdb9');G.text(c,['逐光','回澜','齐鸣'][i],x,678,{size:8,color:'#ede4cd',align:'center',outline:'#24343d',outlineWidth:2});});this.solid(x-7,658,14,8);this.addInteract({x,y:686,r:25,label:'谱写柱廊回声',action:()=>this.echoInteraction(i)});});
      this.addBuilding(720,645,c=>{A.altar(c,720,645,false,this.time);for(let i=0;i<3;i++)star(c,710+i*10,627,2,[this.flags.axis,this.flags.echo,this.flags.garden][i]?'#ffe2a0':'#5b7979');if(this.flags.finished)A.glow(c,720,628,55,'rgba(145,217,212,.5)',.3);});
      this.addInteract({x:720,y:674,r:30,label:'激活共创台 · 合璧入画',action:()=>this.finishInteraction()});
      for(const [x,y,id]of[[720,455,'axis'],[1080,665,'symmetria'],[405,690,'garden']])this.addInteract({x,y,r:24,label:'观察 · '+window.FusionSpec.cultures[id].title,action:()=>this.observe(id)});
      this.addBuilding(870,1078,c=>{R(c,865,1060,3,18,'#72563c');R(c,843,1045,46,18,'#594634');G.text(c,'向北入梦',866,1057,{size:8,color:'#e2c18a',align:'center'});});
      this.addInteract({x:868,y:1090,r:25,label:'阅读路牌',action:()=>G.dialog.show([{name:'路牌',text:'向北穿过宫门。门庭灯在主轴上，声石在东侧神庙前，借景窗在西侧花园。Shift可以快走；J可查看文化原型。'}])});
    }
    updateHud(){G.ui.location(this.theme.title,this.theme.sub);$('loc-seal').textContent='境';this.refreshGoal();}
    onEnter(){G.ui.location(this.theme.title,this.theme.sub);$('loc-seal').textContent='境';this.refreshGoal();}
    drawTree(c,d){if(d.type==='olive'){A.oliveTree(c,d.x,d.y,1.2);if(this.spec.theme==='stars'||this.flags.finished){for(const [dx,dy]of[[-8,-24],[6,-31],[15,-19]])star(c,d.x+dx,d.y+dy,2,'#efce80');}}else if(this.spec.flowers||this.mistView==='flowers'){C.tree(c,d.x,d.y,1.15);for(let i=0;i<8;i++)R(c,d.x-14+i%4*8,d.y-35+Math.floor(i/4)*10,5,3,i%2?'#e8b4b0':'#f3d8c0');}else C.pine(c,d.x,d.y,1.6);}
    paintGround(c){
      const t=this.theme,r=random(this.spec.seed+'ground');c.fillStyle=t.sky;c.fillRect(0,0,this.w,this.h);
      for(let i=0;i<500;i++){const x=Math.floor(r()*this.w),y=Math.floor(r()*this.h);if(r()>.7)star(c,x,y,1,t.cloud);else R(c,x,y,1,1,'#586f7d');}
      // 岩台的厚度、断面与漂浮云层，让场景在奇幻语境里仍有可辨的建筑尺度。
      R(c,139,197,1164,916,'#333f46');R(c,155,1110,1130,27,'#35434a');for(let x=160;x<1280;x+=28)R(c,x,1134,18+(x%3)*4,16+(x%5)*5,'#253b48');
      R(c,145,185,1150,925,t.floor);R(c,152,190,1136,913,t.grass);
      for(let i=0;i<3600;i++){const x=155+Math.floor(r()*1125),y=200+Math.floor(r()*894);R(c,x,y,2+r()*4,1,r()>.5?'#7e876b55':'#243b352c');}
      const paving=(x,y,w,h)=>{R(c,x,y,w,h,t.floor);for(let yy=y;yy<y+h;yy+=16){R(c,x,yy,w,1,'#615d4b50');for(let xx=x+((yy/16|0)%2)*12;xx<x+w;xx+=28)R(c,xx,yy,1,16,'#615d4b40');}};
      paving(662,435,116,652);paving(555,826,330,88);paving(535,650,370,136);paving(555,468,330,160);paving(350,666,780,58);paving(949,650,260,109);paving(281,637,230,110);
      c.strokeStyle='#c5bd9988';c.lineWidth=2;c.strokeRect(544,658,352,119);c.strokeRect(564,834,312,72);c.strokeRect(563,476,314,145);
      // 回折边框与圆形柱列节奏共用一块地面，形成合璧殿前的共同图案。
      c.strokeStyle='#bfac775c';c.lineWidth=1;c.strokeRect(666,669,108,88);c.beginPath();c.arc(720,713,36,0,G.TAU);c.stroke();
      for(let i=0;i<8;i++){const a=i*G.TAU/8;star(c,720+Math.cos(a)*36,713+Math.sin(a)*36,2,'#cbbd9166');}
      R(c,278,540,110,116,t.water);R(c,430,535,72,91,t.water);R(c,283,546,101,104,t.waterHi+'55');
      for(let i=0;i<12;i++){const x=292+i%3*29,y=561+(i/3|0)*25;R(c,x,y,16,1,t.waterHi+'77');}
      R(c,145,970,1150,45,t.water);R(c,145,969,1150,2,t.waterHi+'66');R(c,145,1014,1150,3,'#8b9a8a');
      // 竖向桥：栏杆位于路径两侧，保持中轴上真正可通过的门与桥。
      R(c,690,957,60,73,'#817960');paving(696,957,48,73);for(const x of[689,747]){R(c,x,953,4,80,'#d1c9ad');for(let y=953;y<1036;y+=13){R(c,x-2,y,8,5,'#e3d9b9');R(c,x,y-3,4,3,'#b3b09b');}}
      for(const [x,y]of[[587,775],[843,775],[587,555],[843,555]]){R(c,x-11,y-10,22,18,'#9f967c');R(c,x-8,y-7,16,12,'#6d7f62');}
      // 借景园的环路与小石块不挤占正中的活动庭院。
      for(let i=0;i<22;i++){const a=i/22*G.TAU;R(c,397+Math.cos(a)*112,632+Math.sin(a)*113,12,7,'#b9b297');}
      if(this.spec.ruins)for(let i=0;i<7;i++){A.columnDrum(c,1160+i%3*28,370+(i/3|0)*30,22,{});}
    }
    drawFrame(c,x,y){
      R(c,x-28,y-78,7,79,'#734534');R(c,x+21,y-78,7,79,'#734534');R(c,x-31,y-81,62,8,'#b08954');R(c,x-29,y-79,58,2,'#e6c47c');R(c,x-28,y-4,56,5,'#b49462');
      const view=this.mistView==='flowers'?'#b78887':this.theme.waterHi;c.save();c.globalAlpha=.7;c.fillStyle=view;c.beginPath();c.arc(x,y-44,19,0,G.TAU);c.fill();c.restore();
      if(this.mistView==='flowers')for(let i=0;i<7;i++)lotus(c,x-17+i*5,y-38+Math.sin(i)*9,0,'#f1c5b8');else{star(c,x,y-45,6,'#f5dfb1');R(c,x-18,y-25,36,1,'#a9d4ce');}
      G.text(c,'借景',x,y+11,{size:8,color:'#e9d6b0',align:'center',outline:'#273e43',outlineWidth:2});
    }
    drawGroundExtras(c){
      const t=this.theme,time=reduced?0:this.time,rev=this.tideMode==='rise'?-1:1;
      this.drawWaterCourt(c,time);
      for(let i=0;i<70;i++){const x=160+((i*41+time*12*rev)%1120+1120)%1120,y=979+(i%4)*8;R(c,x,y,9+i%7,1,t.waterHi+(i%3?'55':'99'));if(this.spec.theme==='stars')star(c,x,y,1,'#d4d7a5');}
      if(this.spec.whale){c.save();c.globalAlpha=.65;whale(c,510+Math.sin(time*.15)*65,991,.95,time,'#527e9a');whale(c,1060+Math.sin(time*.12+2)*60,992,.5,time,'#709aab');c.restore();}
      for(const [x,y,s]of[[100,360,2],[1320,620,2.3],[380,1146,2],[1000,1147,2.5]])cloud(c,x+Math.sin(time*.11+x)*7,y,s,t.cloud);
      if(this.spec.flowers||this.mistView==='flowers')for(let i=0;i<17;i++)lotus(c,305+i%4*19,560+(i/4|0)*19,time,'#e6b6a9');
      if(this.flags.axis){c.save();c.globalAlpha=.18;c.fillStyle='#ffe1a5';c.fillRect(714,444,12,487);c.restore();for(let y=455;y<940;y+=25)star(c,720,y+Math.sin(time*2+y)*2,1,'#e5ca8b');}
      if(this.flags.garden){for(let i=0;i<30;i++){const x=425+i*10,y=693+Math.sin(i*.35)*7;if(this.mistView==='flowers')lotus(c,x,y,time,'#e8c1b0');else star(c,x,y,1,'#b9dad3');}}
      if(this.flags.garden){if(this.mistView==='moon'){c.save();c.globalAlpha=.6;c.fillStyle='#d6dcc0';c.beginPath();c.arc(720,713,18,0,G.TAU);c.fill();c.fillStyle=t.floor;c.beginPath();c.arc(713,706,17,0,G.TAU);c.fill();c.restore();}else for(let i=0;i<8;i++){const a=i*G.TAU/8;lotus(c,720+Math.cos(a)*32,713+Math.sin(a)*32,time,'#e8c1b0');}}
      if(this.flags.echo){for(const x of[500,940]){star(c,x,826,3,'#aed9d4');A.glow(c,x,826,24,'rgba(127,202,208,.4)',.15);}}
      if(this.flags.finished){c.save();c.globalAlpha=.3;c.strokeStyle=t.waterHi;c.lineWidth=2;c.beginPath();c.moveTo(405,665);c.lineTo(720,645);c.lineTo(1080,705);c.stroke();c.restore();}
      for(const [name,y]of[['入境前庭',902],['共鸣中庭',695],['后殿',451]])G.text(c,name,720,y,{size:8,color:'#e6d2a7',align:'center',outline:'#46524a',outlineWidth:2,alpha:.75});
    }
    drawForeground(c){const time=reduced?0:this.time;
      for(const p of this.fireflies){const x=p.x+Math.sin(time*.6+p.p)*7,y=p.y+Math.cos(time+p.p)*5;c.save();c.globalAlpha=.3+Math.sin(time*1.8+p.p)*.25;star(c,x,y,this.flags.finished?2:1,this.theme.glow);c.restore();}
      if(this.flags.finished&&this.spec.whale){const x=720+Math.sin(time*.3)*110,y=287+Math.sin(time*.5)*7;c.save();c.globalAlpha=.65;whale(c,x,y,1.7,time,'#6a9bac');c.restore();}
    }
    drawPortal(c,x,y){A.glow(c,x,y-24,100,'rgba(124,209,213,.45)',.4);c.strokeStyle='#c8d8bd';c.lineWidth=3;c.beginPath();c.moveTo(x-16,y);c.lineTo(x-16,y-35);c.quadraticCurveTo(x,y-58,x+16,y-35);c.lineTo(x+16,y);c.stroke();for(let i=0;i<15;i++){const a=i*.5+this.time*.6;star(c,x+Math.sin(a)*12,y-10-i*2.2,1,'#f5dfa0');}}
    drawScreen(c){
      if(this.theme.night){c.save();c.fillStyle='#101c3929';c.fillRect(0,0,640,360);c.restore();}
      const time=reduced?0:this.time,weather=this.spec.weather;
      if(weather==='mist'){c.save();c.globalAlpha=.12;for(let i=0;i<3;i++)cloud(c,100+i*240+Math.sin(time*.13+i)*60,160+i*55,5,'#d3ded4');c.restore();}
      else if(weather==='rain'||weather==='snow'||this.spec.flowers){for(const p of this.weatherParticles.slice(0,weather==='clear'?28:80)){const x=(p.x+time*(weather==='rain'?-15:8)*p.v+6400)%640,y=(p.y+time*(weather==='rain'?170:18)*p.v)%360;c.save();c.globalAlpha=weather==='rain'?.35:.65;if(weather==='rain')R(c,x,y,1,6,'#b3cbd2');else R(c,x,y,weather==='snow'?2:3,2,weather==='snow'?'#e2e4dd':'#efc1b4');c.restore();}}
      if(this.flags.finished&&this.finishTime<3){c.save();c.globalAlpha=(1-this.finishTime/3)*.2;c.fillStyle='#e8d8a6';c.fillRect(0,0,640,360);c.restore();}
    }
    updateAmbient(dt){if(this.cameraCue){this.cameraCue.left-=dt;this.placeCamera(false,dt);if(this.cameraCue.left<=0)this.cameraCue=null;}if(this.flags.finished)this.finishTime+=dt;this.updateRoute();const y=this.player.y;const region=y>960?'流光桥 · 沿中轴向北':y>815?'入境前庭 · 两重宫门之间':y>610?'共鸣中庭 · 通往合璧殿':'合璧殿—后殿 · 中轴北段';if($('loc-sub').textContent!==region)$('loc-sub').textContent=region;}
    node(id){return this.spec.nodes.find(n=>n.id===id);}
    runtime(){return{version:1,flags:copy(this.flags),gardenChoice:this.mistView,tideMode:this.tideMode,rhythm:this.rhythm,player:{x:this.player.x,y:this.player.y},artwork:copy(this.artwork)};}
    passage(){return window.FusionSpec.passage(this.spec,{flags:this.flags||{},gardenChoice:this.mistView,tideMode:this.tideMode});}
    cue(x,y,label){G.ui.toast(label,null,3000);if(!reduced)this.cameraCue={x,y,left:1.5};}
    placeCamera(snap,dt){if(!this.cameraCue||snap){super.placeCamera(snap,dt);return;}const k=1-Math.exp(-5*(dt||.016));this.cam.x=G.lerp(this.cam.x,G.clamp(this.cameraCue.x-320,0,800),k);this.cam.y=G.lerp(this.cam.y,G.clamp(this.cameraCue.y-180,0,840),k);}
    drawWaterCourt(c,time){
      const w=this.spec.layout.water,p=this.passage();R(c,w.x,w.y-3,w.w,w.h+6,'#788d87');R(c,w.x,w.y,w.w,w.h,this.theme.water);
      for(let i=0;i<80;i++){const xx=155+((i*29+time*(this.tideMode==='rise'?-17:17))%1130+1130)%1130;R(c,xx,w.y+5+i%3*8,12,1,this.theme.waterHi+'88');}
      if(p.open){const b=p.rect;R(c,b.x,b.y,b.w,b.h,p.kind==='moon'?'#abae9b':'#92996c');for(let yy=b.y;yy<b.y+b.h;yy+=8)R(c,b.x+3,yy,b.w-6,2,p.kind==='moon'?'#e6dfc4':'#d5c59c');for(const xx of[b.x,b.x+b.w-3]){R(c,xx,b.y-3,3,b.h+6,'#e8d2a0');if(p.kind==='flowers')for(let yy=b.y;yy<b.y+b.h;yy+=10)lotus(c,xx,yy,time,'#edc6b8');}G.text(c,p.kind==='moon'?'月照石径':'花雨浮桥',b.x+b.w/2,b.y-10,{size:8,color:'#ffe4b8',align:'center',outline:'#243c48'});}
      else G.text(c,'景未成路 · 在南岸借景引潮',720,732,{size:8,color:'#c4d6ce',align:'center',outline:'#203c4c'});
    }
    refreshGoal(){
      if(this.npcs[0])this.npcs[0].quest=!this.flags.guide;
      const task=this.spec.tasks.find(t=>!this.flags[t.id]&&t.requires.every(id=>this.flags[id]));
      this.marker=task?copy(this.node(task.node)):null;const text=task?task.label:'作品已成 · 打开「画」，留住这一刻';
      this.goalText=text;G.ui.objective(text);$('semantic-status').textContent=text;
      for(const k of['axis','echo','garden','tide'])$('mark-'+k).classList.toggle('lit',this.flags[k]);
      $('btn-art').classList.remove('hidden');this.updateRoute();
    }
    updateRoute(){if(!this.marker){$('route').textContent='已成境 · 画卷仍可题名与导出';return;}const dx=this.marker.x-this.player.x,dy=this.marker.y-this.player.y,d=Math.hypot(dx,dy);$('route').textContent=d<35?'已靠近目标 · 按 E 互动':(Math.abs(dx)>Math.abs(dy)?dx>0?'东 →':'← 西':dy>0?'南 ↓':'↑ 北')+'  目标约 '+Math.round(d/10)+' 步';}
    axisInteraction(){if(this.flags.axis){this.observe('axis');return;}this.flags.guide=true;this.flags.axis=true;G.audio.sfx('success');this.cue(720,805,'门已开。先在水庭南岸借一幅景，再让潮水为它让路。');this.refreshGoal();saveProgress();}
    observe(id){const ref=window.FusionSpec.cultures[id];G.dialog.show([{name:ref.title,text:ref.use+' '+ref.adaptation+' 完整出处可在「册」中查看。'}]);}
    gardenInteraction(){if(!this.flags.axis){G.ui.toast('先点亮门庭灯，打开承序门。');return;}G.choice.show([{text:'海月 · 退潮露出中轴石径'},{text:'花雨 · 涨潮托起西侧花桥'}],{title:'借来的景，怎样改变你的路？',onPick:i=>{this.mistView=i===0?'moon':'flowers';this.flags.garden=true;this.flags.tide=this.passage().open;this.flags.finished=false;this.refreshGoal();saveProgress();this.cue(720,731,this.flags.tide?'风景与潮水相合，通路已改变。':'借景已选。去右侧引潮石，'+(i===0?'选择退潮。':'选择涨潮。'));}});}
    tideInteraction(){if(!this.flags.garden){G.ui.toast('先在左侧借景窗，选海月或花雨。');return;}G.choice.show([{text:'退潮 · 水退，月照石径'},{text:'涨潮 · 水起，花桥浮现'}],{title:'让潮水回应你借来的景',onPick:i=>{this.tideMode=i===0?'ebb':'rise';this.flags.tide=this.passage().open;this.flags.finished=false;G.audio.sfx('whoosh');this.refreshGoal();saveProgress();const p=this.passage();this.cue(p.open?p.rect.x+p.rect.w/2:720,730,p.open?(p.kind==='moon'?'潮退了，中轴石径露出水面。':'潮涨了，西侧花桥被托起。'):'潮水变了，但还没有路。海月需要退潮，花雨需要涨潮。');}});}
    echoInteraction(i){if(!this.flags.tide){G.ui.toast('先让借景与潮水相合，打开水庭通路。');return;}G.choice.show([{text:'逐光 · 低—中—高'},{text:'回澜 · 高—中—低'},{text:'齐鸣 · 三声共振'}],{title:'让柱廊记住怎样的节奏？',onPick:n=>{this.rhythm=['ascending','returning','together'][n];this.flags.echo=true;const notes=n===1?[659,523,392]:[392,523,659];notes.forEach((f,k)=>G.audio.tone(f,.65,'sine',.09,null,n===2?0:k*.22));this.refreshGoal();saveProgress();this.cue(720,570,'白石柱与红梁接住了你的回声，作品会记住这段节奏。');}});}
    finishInteraction(){const task=this.spec.tasks.find(t=>t.id==='finished');if(!task.requires.every(k=>this.flags[k])){G.ui.toast('还差：'+task.requires.filter(k=>!this.flags[k]).map(k=>({axis:'门庭灯',garden:'借景',tide:'通路',echo:'回声'})[k]).join('、'));return;}this.flags.finished=true;this.finishTime=0;G.audio.sfx('success');G.fx.burst(720,615,60,{colors:['#f3d396','#8cc6cc','#eabbb1'],grav:-7});this.refreshGoal();saveProgress();window.FusionArtwork.open(this);}
    reachability(){
      const original={flags:copy(this.flags),mistView:this.mistView,tideMode:this.tideMode};const results=[];
      try{for(const kind of ['moon','flowers']){this.flags.axis=true;this.flags.garden=true;this.mistView=kind;this.tideMode=kind==='moon'?'ebb':'rise';const cell=10,cols=144,rows=120,seen=new Uint8Array(cols*rows),q=[104*cols+72];seen[q[0]]=1;
      for(let k=0;k<q.length;k++){const n=q[k],x=n%cols,y=n/cols|0;for(const [xx,yy]of[[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(xx<0||yy<0||xx>=cols||yy>=rows)continue;const idx=yy*cols+xx;if(!seen[idx]&&!this.collides(xx*cell,yy*cell)){seen[idx]=1;q.push(idx);}}}
      results.push({kind,ok:this.spec.nodes.every(n=>!!seen[Math.round(n.y/cell)*cols+Math.round(n.x/cell)]),reachable:q.length});}return{ok:results.every(r=>r.ok),routes:results,stagedLock:true};}finally{this.flags=original.flags;this.mistView=original.mistView;this.tideMode=original.tideMode;}
    }
  }
  function drawPreview(time){
    const t=THEMES[preview.theme],r=random(preview.seed);ctx.fillStyle=t.sky;ctx.fillRect(0,0,640,360);for(let i=0;i<120;i++){const x=r()*640,y=r()*340;star(ctx,x,y,1,r()>.8?'#e7d6ad':'#647d97');}
    ctx.fillStyle=preview.theme==='garden'?'#e6e0bc':'#b1bec0';ctx.beginPath();ctx.arc(526,68,30,0,G.TAU);ctx.fill();ctx.fillStyle=t.sky;ctx.beginPath();ctx.arc(514,59,28,0,G.TAU);ctx.fill();
    for(let i=0;i<5;i++)cloud(ctx,360+i*72+Math.sin(time*.1+i)*9,160+i%2*20,1.8,t.cloud);
    const island=(x,y,w,h)=>{R(ctx,x-w/2,y,w,h,'#727d74');R(ctx,x-w/2+5,y-3,w-10,5,'#b1af91');for(let i=0;i<5;i++)R(ctx,x-w/2+i*w/5+5,y+h,w/5-10,10+i%3*5,'#3d5863');};
    ctx.strokeStyle='#acb4a0';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(452,130);ctx.lineTo(452,293);ctx.stroke();ctx.strokeStyle='#e2c88f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(446,130);ctx.lineTo(446,291);ctx.moveTo(458,130);ctx.lineTo(458,291);ctx.stroke();
    island(452,118,137,18);C.drawHall(ctx,452,117,110,{wallH:22,roofH:20,double:true,bays:5});
    island(452,210,223,28);ctx.save();ctx.translate(452,207);ctx.scale(.65,.65);fusionHall(ctx,0,0,{axis:true,echo:true,garden:true,view:'moon',theme:t});ctx.restore();
    island(579,248,142,22);A.drawTemple(ctx,579,246,105,{columns:8,columnH:28,columnW:4,entH:8,pedH:12});
    island(452,310,140,22);C.drawGate(ctx,452,309,97,{wallH:30,roofH:18,double:false,arches:3,name:''});
    A.oliveTree(ctx,514,199,.75);for(let i=0;i<4;i++)star(ctx,509+i*4,171+Math.sin(i)*5,1,'#ebcc83');
    if(preview.whale)whale(ctx,551+Math.sin(time*.12)*13,302+Math.sin(time*.25)*6,1.1,time,'#53798d');
    if(preview.flowers)for(let i=0;i<25;i++)R(ctx,330+r()*310,(r()*360+time*9)%360,2,1,'#edc5b6');
  }
  function openBook(){if(creating||busy)return;bookOpen=true;G.overlayDepth++;G.show($('book'));G.ui.prompt(null);$('creation-note').textContent='本次世界：'+active.theme.title+'。'+active.spec.prompt;G.input.down=Object.create(null);$('close-book').focus();}
  function closeBook(){if(!bookOpen)return;bookOpen=false;G.overlayDepth=Math.max(0,G.overlayDepth-1);G.hide($('book'));canvas.focus();G.input.clearPressed();}
  function saveProgress(){if(!active||active.previewOnly)return;const data={version:5,spec:active.spec,progress:active.runtime()};try{localStorage.setItem(STORE,JSON.stringify(data));saveCandidate=data;}catch{G.ui.toast('浏览器未允许存档；当前探索仍可继续。');}}
  function showCreation(){if(active)saveProgress();if(active?.previewOnly)active=null;closeBook();G.dialog.close();if(G.choice.active)G.choice.close();creating=true;G.titleActive=true;G.ui.showHud(false);G.hide($('touch'));G.show($('create'));G.input.down=Object.create(null);$('resume').classList.toggle('hidden',!active&&!saveCandidate);$('build-status').textContent='';$('prompt-input').focus();}
  function showTouch(){if(window.matchMedia('(pointer:coarse)').matches)G.show($('touch'));}
  function enterScene(scene){active=scene;creating=false;G.titleActive=false;G.hide($('create'));G.hide($('generating'));G.setScene(active,{name:'fusion'});showTouch();canvas.focus();$('resume').classList.toggle('hidden',!!scene.previewOnly&&!saveCandidate);saveProgress();G.ui.toast('方向键 / WASD 移动，走近发光标记按 E。Shift 可以快走。',null,4800);}
  function generationStep(i,text){$('generation-step').textContent=text;document.querySelectorAll('.loading-bridge i').forEach((el,n)=>el.classList.toggle('done',n<=i));}
  async function createWorld(){if(busy)return;let spec;try{spec=PromptDirector.create($('prompt-input').value);}catch(e){$('build-status').textContent=e.message;return;}busy=true;$('generate').disabled=true;G.audio.init();G.audio.resume();G.show($('generating'));G.input.down=Object.create(null);generationStep(0,'从文字里拾起：'+THEMES[spec.theme].title);try{
      await new Promise(resolve=>setTimeout(resolve,180));generationStep(1,'让门院有序，让云海自由');
      const scene=new FusionScene(spec);const check=scene.reachability();if(!check.ok)throw new Error('场景通路未通过检查，请换一种描述重试。');
      await new Promise(resolve=>setTimeout(resolve,180));generationStep(2,'安排可探索的路径与三种回声');
      await new Promise(resolve=>setTimeout(resolve,160));enterScene(scene);
    }catch(e){G.hide($('generating'));$('build-status').textContent='这次未能成境：'+e.message;console.error(e);}finally{busy=false;$('generate').disabled=false;}}
  function resume(){try{if(active){creating=false;G.titleActive=false;G.hide($('create'));G.ui.showHud(true);showTouch();canvas.focus();return;}if(saveCandidate&&PromptDirector.validate(saveCandidate.spec))enterScene(new FusionScene(saveCandidate.spec,saveCandidate.progress));}catch(e){$('build-status').textContent='未能读取上次探索，请重新生成。';}}
  G.ui.init();G.dialog.init();G.choice.init();G.fade.init();G.cinema.init();G.input.init();G.initTouch();G.hide($('touch'));
  // 原核心的选项通过键盘工作；这里补齐动态选项的点击行为。
  const showChoice=G.choice.show;G.choice.show=function(lines,opts){showChoice.call(this,lines,opts);this.optionEls.forEach((el,i)=>el.onclick=()=>this.pick(i));};
  G.isWorldPaused=()=>creating||bookOpen||!!active?.cameraCue||G.dialog.active||G.choice.active||G.fade.busy;
  G.onKeyDown=(code)=>{if(creating||busy)return;if(bookOpen){if(['Escape','KeyJ'].includes(code))closeBook();return;}if(G.dialog.active){if(['KeyE','Enter','Space'].includes(code))G.dialog.advance();return;}if(G.choice.active){if(['ArrowUp','ArrowLeft','KeyW','KeyA'].includes(code))G.choice.move(-1);else if(['ArrowDown','ArrowRight','KeyS','KeyD'].includes(code))G.choice.move(1);else if(['KeyE','Enter','Space'].includes(code))G.choice.pick();return;}if(code==='KeyJ')openBook();if(code==='KeyP')window.FusionArtwork.open(active);};
  $('prompt-input').value=PRESETS.stars;let previewTimer;
  $('prompt-input').addEventListener('input',()=>{clearTimeout(previewTimer);previewTimer=setTimeout(()=>{try{preview=PromptDirector.create($('prompt-input').value);}catch{}},100);document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));});
  for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>{$('prompt-input').value=PRESETS[b.dataset.preset];preview=PromptDirector.create(PRESETS[b.dataset.preset]);document.querySelectorAll('[data-preset]').forEach(el=>el.setAttribute('aria-pressed',el===b?'true':'false'));$('build-status').textContent='';};
  $('showcase').onclick=()=>{const spec=PromptDirector.create(PRESETS.tide);const scene=new FusionScene(spec,{flags:{guide:true,axis:true,garden:true,tide:true,echo:true,finished:true},gardenChoice:'moon',tideMode:'ebb',rhythm:'returning',player:{x:720,y:680}});scene.previewOnly=true;enterScene(scene);window.FusionArtwork.open(scene);window.FusionArtwork.setMode('painting');};
  $('generate').onclick=createWorld;$('resume').onclick=resume;$('btn-create').onclick=showCreation;$('btn-book').onclick=openBook;$('close-book').onclick=closeBook;$('btn-sound').onclick=()=>{G.audio.init();G.audio.resume();G.audio.setEnabled(!G.audio.enabled);};
  window.addEventListener('blur',()=>{G.input.down=Object.create(null);if(active)saveProgress();});document.addEventListener('visibilitychange',()=>{if(document.hidden){G.input.down=Object.create(null);saveProgress();}});
  try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved&&saved.version===5&&PromptDirector.validate(saved.spec)&&saved.progress?.flags&&['guide','axis','echo','garden','tide','finished'].every(k=>typeof saved.progress.flags[k]==='boolean')){saveCandidate=saved;$('resume').classList.remove('hidden');}}catch{}
  // 测试及后续主线整合使用的窄接口，不更改队友已有场景与存档。
  G.FusionScene=FusionScene;G.PromptDirector=PromptDirector;
  window.FusionExplore={save:saveProgress,presets:PRESETS,director:PromptDirector,Scene:FusionScene,getScene:()=>active,getState:()=>active?{spec:copy(active.spec),flags:copy(active.flags),player:{x:active.player.x,y:active.player.y},cam:{...active.cam},goal:active.goalText}:null};
  function frame(now){const dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;if(creating){previewTime+=dt;drawPreview(reduced?0:previewTime);}else if(active){active.update(dt);active.draw(ctx);}G.input.endFrame();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
