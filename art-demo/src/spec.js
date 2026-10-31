/* WorldSpec v3: 作品意图与交互结构；RuntimeProgress: 玩家在作品中的经历。 */
(() => {
  'use strict';
  const clone=o=>JSON.parse(JSON.stringify(o));
  const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
  const cultures={
    axis:{title:'门—院—殿的次序',source:'故宫建筑空间组织；《周礼·夏官司马》篇首',quote:'辨方正位，体国经野。',use:'保留进入次序与两侧呼应。',adaptation:'云上水庭与光门为当代虚构。',url:'https://www.dpm.org.cn/explore/buildings.html'},
    garden:{title:'借景，也借一条路',source:'计成《园冶·兴造论》',quote:'园林巧于因借，精在体宜。',use:'借来的景色影响场地的走法。',adaptation:'海月石径、花雨浮桥是游戏机关，并非历史造园技术。',url:'https://ctext.org/wiki.pl?chapter=378683&if=en&remap=gb'},
    symmetria:{title:'把间隔变成回声',source:'亚里士多德《形而上学》Μ.3，1078a36–b1；帕特农建筑参照',quote:'τάξις καὶ συμμετρία καὶ τὸ ὡρισμένον',use:'秩序与比例启发柱列、开间和声音节奏。',adaptation:'合璧殿与声石均属当代创作，不是古代建筑复原。',url:'https://www.ysma.gr/en/monuments/parthenon/'}
  };
  const layout={width:1440,height:1200,axisX:720,water:{x:145,y:716,w:1150,h:28},bridges:{moon:{x:688,y:710,w:64,h:40},flowers:{x:586,y:710,w:68,h:40}},axis:[{id:'bridge',name:'流光桥',x:720,y:990},{id:'outerGate',name:'入境门',x:720,y:930},{id:'innerGate',name:'承序门',x:720,y:815},{id:'fusionHall',name:'合璧殿',x:720,y:610},{id:'rearHall',name:'后殿',x:720,y:430}]};
  const nodes=[{id:'guide',x:775,y:1035,culture:'axis'},{id:'axis',x:720,y:883,culture:'axis'},{id:'garden',x:640,y:772,culture:'garden'},{id:'tide',x:800,y:772,culture:'garden'},{id:'echo',x:935,y:686,culture:'symmetria'},{id:'finished',x:720,y:674,culture:'symmetria'}];
  const tasks=[{id:'guide',requires:[],label:'与守境人聊聊这座境',node:'guide'},{id:'axis',requires:[],label:'点亮门庭灯，穿过承序门',node:'axis'},{id:'garden',requires:['axis'],label:'在近处的借景窗选择海月或花雨',node:'garden'},{id:'tide',requires:['garden'],label:'拨转引潮石，让借来的景成为一条路',node:'tide'},{id:'echo',requires:['tide'],label:'越过水庭，为柱廊选择一种声音节奏',node:'echo'},{id:'finished',requires:['axis','garden','tide','echo'],label:'回到共创台，把这次相遇留成作品',node:'finished'}];
  function extend(base){return {...base,schema:'wanxiang.world',revision:'0.4',seed:'world:'+hash(base.prompt),layout:clone(layout),nodes:clone(nodes),tasks:clone(tasks),cultureRefs:['axis','garden','symmetria']};}
  function hash(t){let n=2166136261;for(const c of t)n=Math.imul(n^c.codePointAt(0),16777619);return(n>>>0).toString(36);}
  function validate(s){
    if(!s||s.version!==3||s.schema!=='wanxiang.world'||s.revision!=='0.4'||!['stars','tide','garden'].includes(s.theme)||typeof s.prompt!=='string'||s.prompt.length<8||s.prompt.length>1200||typeof s.seed!=='string'||s.seed!=='world:'+hash(s.prompt)||!['clear','rain','snow','mist'].includes(s.weather))return false;
    if(!['flowers','whale','manyLights','ruins','mirror','reverse'].every(k=>typeof s[k]==='boolean')||![0,10,20,30].includes(s.offset))return false;
    // 此演示只接受受支持的布局与节点；未来编辑器需扩展校验，而不是执行模型代码。
    return ['layout','nodes','tasks','cultureRefs'].every(k=>JSON.stringify(s[k])===JSON.stringify(({layout,nodes,tasks,cultureRefs:['axis','garden','symmetria']})[k]));
  }
  function progress(p={}){const flags={};for(const k of ['guide','axis','garden','tide','echo','finished'])flags[k]=p.flags?.[k]===true;return{version:1,flags,gardenChoice:['moon','flowers'].includes(p.gardenChoice)?p.gardenChoice:'moon',tideMode:['ebb','rise'].includes(p.tideMode)?p.tideMode:'still',rhythm:['ascending','returning','together'].includes(p.rhythm)?p.rhythm:'ascending',player:p.player||null,artwork:p.artwork||{}};}
  function passage(s,p){const open=!!p.flags.garden&&((p.gardenChoice==='moon'&&p.tideMode==='ebb')||(p.gardenChoice==='flowers'&&p.tideMode==='rise'));return{open,kind:p.gardenChoice,rect:open?s.layout.bridges[p.gardenChoice]:null};}
  window.FusionSpec={clone,freeze,extend,validate,progress,passage,cultures,hash};
})();
