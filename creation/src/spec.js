/* WorldSpec v5: cultural skills -> regions, connections, solids and viewpoints. */
(() => {
 'use strict';
 const clone=o=>JSON.parse(JSON.stringify(o)),freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
 const catalog=freeze(window.WanxiangPackages),ids=Object.keys(catalog),skills=freeze(window.WanxiangSkills);
 const enums={weather:['clear','mist','snow','rain'],timeOfDay:['day','dusk','night'],palette:['mineral','ink','warm'],motif:['moon','flowers','lights'],spatialIntent:['gathered','layered'],gardenSide:['west','east']};
 function hash(t){let n=2166136261;for(const c of t)n=Math.imul(n^c.codePointAt(0),16777619);return(n>>>0).toString(36);}
 const validText=(s,min,max)=>typeof s==='string'&&s.length>=min&&s.length<=max&&!/[<>\x00-\x1f]/.test(s);
 const selectedOK=a=>Array.isArray(a)&&a.length>0&&a.length<=2&&new Set(a).size===a.length&&a.every(id=>ids.includes(id));
 const availableSkills=a=>Object.keys(skills).filter(k=>skills[k].requires.every(id=>a.includes(id)));
 const requiredSkills=a=>availableSkills(a).filter(k=>skills[k].required);
 const defaultSkills=a=>availableSkills(a);
 function skillsOK(s,a){return Array.isArray(s)&&s.length<=4&&new Set(s).size===s.length&&s.every(k=>availableSkills(a).includes(k))&&requiredSkills(a).every(k=>s.includes(k));}
 const policies=['full','no-npc','no-games','quiet'];
 function policyFor(prompt,preference='auto'){if(preference!=='auto'&&policies.includes(preference))return preference;return /纯观赏|无互动|不要互动|只看风景/.test(prompt)||(/无NPC|不要NPC|不加NPC|没有NPC|不要人物/i.test(prompt)&&/无小游戏|不要小游戏|不加小游戏|不要游戏/.test(prompt))?'quiet':/无NPC|不要NPC|不加NPC|没有NPC|不要人物/i.test(prompt)?'no-npc':/无小游戏|不要小游戏|不加小游戏|不要游戏/.test(prompt)?'no-games':'full';}
 function validatePlan(p,a){return (!Object.hasOwn(p||{},'interactionPolicy')||policies.includes(p.interactionPolicy))&& selectedOK(a)&&p&&Object.keys(p).filter(k=>k!=='interactionPolicy').sort().join()===['title','primary','description','skills',...Object.keys(enums)].sort().join()&&a.includes(p.primary)&&validText(p.title,2,28)&&validText(p.description,8,240)&&skillsOK(p.skills,a)&&Object.entries(enums).every(([k,v])=>v.includes(p[k]));}
 function sample(r,t){const ls=r.slice(1).map((p,i)=>Math.hypot(p.x-r[i].x,p.y-r[i].y));let d=ls.reduce((a,b)=>a+b,0)*t;for(let i=0;i<ls.length;i++){if(d<=ls[i]){const f=d/ls[i];return{x:r[i].x+(r[i+1].x-r[i].x)*f,y:r[i].y+(r[i+1].y-r[i].y)*f};}d-=ls[i];}return clone(r.at(-1));}
 function layoutFor(p,a,legacy=false,modern=false,buildingCards=false,dualCulture=false){
  const palace=p.primary==='palace',layered=p.spatialIntent==='layered',mirror=p.gardenSide==='east',mx=x=>mirror?1500-x:x;
  const regions=palace?[
   {id:'arrival',name:'门外前庭',x:530,y:1100,w:440,h:170,elevation:0},
   {id:'outer',name:'开阔外院',x:410,y:840,w:680,h:270,elevation:0},
   {id:'inner',name:'殿前主院',x:440,y:570,w:620,h:290,elevation:1},
   {id:'garden',name:'侧庭回游',x:170,y:470,w:280,h:530,elevation:1},
   {id:'colonnade',name:a.includes('acropolis')?'白石柱廊院':'东廊小院',x:1050,y:470,w:280,h:530,elevation:1},
   {id:'upper',name:a.includes('acropolis')?'眺望台地':'后殿观景庭',x:440,y:220,w:620,h:380,elevation:2}
  ]:[
   {id:'arrival',name:'山门前庭',x:390,y:1090,w:400,h:180,elevation:0},
   {id:'outer',name:'山门平台',x:280,y:830,w:630,h:290,elevation:0},
   {id:'inner',name:'中央台地',x:400,y:560,w:690,h:290,elevation:1},
   {id:'garden',name:'橄榄侧庭',x:170,y:420,w:270,h:580,elevation:1},
   {id:'colonnade',name:'柱廊外院',x:1060,y:490,w:270,h:510,elevation:1},
   {id:'upper',name:a.includes('palace')?'红檐眺望台':'神庙环游台',x:490,y:190,w:740,h:390,elevation:2}
  ];
  if(layered){regions.find(r=>r.id==='inner').w-=90;regions.find(r=>r.id==='garden').y-=70;regions.find(r=>r.id==='garden').h+=70;}
  // Doorway bands join wide courts; side galleries form two independent return loops.
  const gateX=palace?750:590;
  const connections=[{id:'entry',x:gateX-32,y:1070,w:64,h:60},{id:'threshold',x:700,y:810,w:100,h:75},{id:'upper-step',x:710,y:540,w:110,h:95},
   {id:'west-upper',x:370,y:530,w:170,h:70},{id:'west-lower',x:350,y:920,w:160,h:70},
   {id:'east-upper',x:990,y:530,w:180,h:70},{id:'east-lower',x:990,y:920,w:170,h:70}];
  const pond={x:235,y:650,w:118,h:120};
  let placements=palace?[
   {kind:'gate',name:'入境宫门',package:'palace',x:750,y:1100,w:270},
   {kind:'gate',name:'承序门',package:'palace',x:750,y:845,w:205},
   {kind:a.includes('acropolis')?'fusion':'hall',name:a.includes('acropolis')?'合璧共创殿':'重檐主殿',package:'palace',x:750,y:585,w:320},
   {kind:'wing',name:'西廊',package:'palace',x:490,y:985,w:135},{kind:'wing',name:'东廊',package:'palace',x:1010,y:985,w:135},
   {kind:a.includes('acropolis')?'temple':'hall',name:a.includes('acropolis')?'白石神庙意象':'后殿',package:a.includes('acropolis')?'acropolis':'palace',x:legacy||a.includes('acropolis')?800:750,y:375,w:275},
   {kind:a.includes('acropolis')?'stoa':'wing',name:'侧院长廊',package:a.includes('acropolis')?'acropolis':'palace',x:legacy?1195:1190,y:legacy?535:570,w:208}
  ]:[
   {kind:'gateway',name:'山门意象',package:'acropolis',x:590,y:1100,w:235},
   {kind:'temple',name:'白石神庙意象',package:'acropolis',x:810,y:430,w:310},
   {kind:'stoa',name:'柱廊',package:'acropolis',x:1190,y:550,w:220},
   {kind:'temple',name:'侧台小庙',package:'acropolis',x:305,y:490,w:155},
   {kind:a.includes('palace')?'fusion':'stoa',name:a.includes('palace')?'红檐共创台':'共享柱廊',package:a.includes('palace')?'palace':'acropolis',x:740,y:700,w:280}
  ];
  if(modern&&palace){for(const b of placements.filter(b=>['西廊','东廊'].includes(b.name))){b.kind='long-wing';b.w=66;b.length=152;b.y=1047;b.facing=b.x<750?'east':'west';}const gallery=placements.find(b=>b.name==='侧院长廊');if(gallery.package==='palace'){gallery.kind='long-wing';gallery.x=1270;gallery.y=633;gallery.w=66;gallery.length=130;gallery.facing='west';}}
  if(layered){const b=placements.find(b=>b.kind==='temple');if(b)b.x+=75;}
  const nodes=[{id:'arrival',x:gateX,y:1190},{id:'frame',x:325,y:850},{id:'echo',x:1180,y:835},{id:'compose',x:750,y:760},{id:'finish',x:600,y:300}];
  const pads=[{x:1120,y:730},{x:1190,y:670},{x:1260,y:730}];
  const obstacles=[{...pond,kind:'water'}];
  for(const b of placements){if(b.kind==='gate'||b.kind==='gateway'){obstacles.push({x:b.x-b.w/2,y:b.y-20,w:b.w/2-30,h:25},{x:b.x+30,y:b.y-20,w:b.w/2-30,h:25});}else if(b.kind==='long-wing')obstacles.push({x:b.x-b.w/2+4,y:b.y-b.length,w:b.w-8,h:b.length});else obstacles.push({x:b.x-b.w/2+12,y:b.y-60,w:b.w-24,h:58});}
  // A low enclosing wall with open side doors makes the gate sequence legible.
  if(palace)for(const y of[1090,835])for(const [x,w]of[[410,300],[790,300]])obstacles.push({x,y,w,h:10,kind:'wall'});
  let interactions=modern&&a.includes('palace')?{policy:p.interactionPolicy||'full',anchors:[{id:'craft',x:palace?565:640,y:palace?1005:790},{id:'keeper',x:palace?560:520,y:palace?665:600}].map(n=>({...n,x:mx(n.x)}))}:null;
  if(interactions&&buildingCards){
   interactions.buildings=placements.filter(b=>b.package==='palace'&&['gate','hall','fusion','long-wing'].includes(b.kind)).filter(b=>b.name==='入境宫门'||['重檐主殿','合璧共创殿','红檐共创台','东廊'].includes(b.name)).map((b,i)=>({id:'building-'+i,name:b.name,card:b.kind==='gate'?'gate':b.kind==='long-wing'?'gallery':'hall',x:mx(b.kind==='long-wing'?b.x-60:b.kind==='fusion'&&!palace?b.x-130:b.x),y:b.kind==='long-wing'?b.y-47:b.y+35}));
  }
  if(dualCulture){
   interactions=interactions||{policy:p.interactionPolicy||'full',anchors:[],buildings:[]};
   if(a.includes('acropolis')){
    interactions.anchors.push({id:'stone',name:'石作学徒 · 伊里斯',culture:'acropolis',x:mx(palace?1130:470),y:palace?630:1000},{id:'observer',name:'台地记录者 · 莱昂',culture:'acropolis',x:mx(palace?600:1040),y:palace?350:340});
    interactions.buildings.push(...placements.filter(b=>b.package==='acropolis'&&['gateway','temple','stoa'].includes(b.kind)).filter(b=>b.name!=='侧台小庙'&&b.name!=='共享柱廊').map((b,i)=>({id:'athens-building-'+i,name:b.name,card:b.kind==='gateway'?'propylaea':b.kind==='temple'?'temple':'stoa',culture:'acropolis',x:mx(b.x),y:b.y+35})));
   }
  }
  const transform=r=>({...r,x:mirror?1500-r.x-(r.w||0):r.x});
  return{...(modern?{interactions}:{}),width:1500,height:1350,topology:palace?'gate-courts-and-loops':'asymmetric-terraces',regions:regions.map(transform),connections:connections.map(transform),obstacles:obstacles.map(transform),pond:transform(pond),placements:placements.map(b=>({...b,x:mx(b.x),...(modern&&b.facing?{facing:mirror?(b.facing==='east'?'west':'east'):b.facing}:{})})),nodes:nodes.map(n=>({...n,x:mx(n.x)})),pads:pads.map(n=>({...n,x:mx(n.x)})),frameTarget:mirror?25:-25,spawn:{x:mx(gateX),y:1230},route:[{x:mx(gateX),y:1230},{x:mx(gateX),y:950},{x:mx(750),y:760},{x:mx(550),y:640},{x:mx(550),y:300}]};
 }
 // Only these two deterministic compiler revisions are accepted; old coordinates remain verifiable.
 function deriveAt(prompt,a,p,provenance,revision){if(!validText(prompt,8,1200)||!validatePlan(p,a))throw Error('描述、场景或文化技能不符合约定');if(!provenance||!['local','live-ai','bundled-ai'].includes(provenance.mode)||!(provenance.model===null||validText(provenance.model,1,100)))throw Error('来源无效');const packages=a.slice().sort(),plan=clone(p);plan.skills.sort();if(['0.8','0.9','0.10'].includes(revision))plan.interactionPolicy=plan.interactionPolicy||policyFor(prompt);const layout=layoutFor(plan,packages,revision==='0.7',['0.8','0.9','0.10'].includes(revision),['0.9','0.10'].includes(revision),revision==='0.10'),core={schema:'wanxiang.world',version:5,revision,prompt,packages,plan,layout,placements:layout.placements,cultureRefs:plan.skills};return{...core,seed:'v7:'+hash(JSON.stringify(core)),provenance:clone(provenance)};}
 function derive(prompt,a,p,provenance={mode:'local',model:null}){return deriveAt(prompt,a,p,provenance,'0.10');}
 function validate(s){try{return ['0.7','0.7.1','0.8','0.9','0.10'].includes(s.revision)&&JSON.stringify(deriveAt(s.prompt,s.packages,s.plan,s.provenance,s.revision))===JSON.stringify(s);}catch{return false;}}
 function upgrade(s){if(!validate(s))throw Error('场景包无效或版本不匹配');return s.revision!=='0.10'?derive(s.prompt,s.packages,s.plan,s.provenance):s;}
 function localPlan(prompt,a,primary=a[0],ss=defaultSkills(a)){return{title:a.length===2?'门庭之间，借见卫城':primary==='palace'?'门院与回望':'白石台地之上',primary,skills:ss.slice().sort(),weather:/雪/.test(prompt)?'snow':/雨/.test(prompt)?'rain':/雾/.test(prompt)?'mist':'clear',timeOfDay:/夜|月/.test(prompt)?'night':/暮|落日/.test(prompt)?'dusk':'day',palette:/墨/.test(prompt)?'ink':/暖|落日/.test(prompt)?'warm':'mineral',motif:/花/.test(prompt)?'flowers':/灯/.test(prompt)?'lights':'moon',spatialIntent:/错落|层叠|层次|远眺/.test(prompt)?'layered':'gathered',gardenSide:/东侧|东庭/.test(prompt)?'east':'west',description:'保留'+a.map(id=>catalog[id].name).join('与')+'的空间关系，以宽阔的庭院、侧庭环路和可绕行的建筑组织探索。完成取景与空间节奏后，在高处把自己的选择留成作品。本地规则创作，非历史复原。'};}
 const cultures=Object.fromEntries(ids.map(id=>[id,{title:catalog[id].name,use:catalog[id].relation,adaptation:catalog[id].boundary,url:catalog[id].source.url}]));
 window.FusionSpec={policies,policyFor,clone,freeze,catalog,ids,skills,enums,hash,selectedOK,availableSkills,requiredSkills,defaultSkills,skillsOK,validatePlan,layoutFor,sample,derive,validate,upgrade,localPlan,cultures};
})();
