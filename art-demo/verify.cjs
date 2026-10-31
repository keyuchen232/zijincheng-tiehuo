// 运行成品中的真实脚本，检查玩法和导出契约；画面另在浏览器中检查。
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c2=new Proxy({measureText:()=>({width:35})},{get:(o,k)=>k in o?o[k]:(...args)=>c2});
const nodes=new Map();
function node(tag='div'){const classes=new Set();return{tagName:tag.toUpperCase(),style:{},dataset:{},children:[],textContent:'',value:'',innerHTML:'',classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},toggle(k,v){if(v===undefined)v=!classes.has(k);v?classes.add(k):classes.delete(k);},contains:k=>classes.has(k)},addEventListener(){},setAttribute(){},getAttribute(){return'';},appendChild(n){this.children.push(n);},append(...n){this.children.push(...n);},remove(){},focus(){},click(){},getContext(){return c2;},querySelectorAll(){return[];},toDataURL:()=> 'data:image/png;base64,AA==',toBlob:cb=>cb(new Blob(['png'],{type:'image/png'}))};}
const doc={readyState:'complete',hidden:false,addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,node(id==='game'?'canvas':'div'));return nodes.get(id);},querySelector(sel){return this.getElementById(sel.replace(/^#/,''));},querySelectorAll(sel){if(sel==='#choice .choice-opt')return this.getElementById('choice-body').children;return[];},createElement:node};
const saved=new Map(),frames=[];
class ImageStub{constructor(){this.complete=true;this.naturalWidth=1040;this.naturalHeight=896;}set src(v){this._src=v;queueMicrotask(()=>this.onload?.());}get src(){return this._src;}}
const env={document:doc,console,Blob,URL,Image:ImageStub,fetch:async()=>({blob:async()=>new Blob(['png'],{type:'image/png'})}),location:{protocol:'file:'},performance:{now:()=>0},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>frames.push(fn),setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1;},clearTimeout(){},addEventListener(){},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)}};env.window=env;vm.createContext(env);
const html=fs.readFileSync(__dirname+'/index.html','utf8');for(const [i,m]of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries())vm.runInContext(m[1],env,{filename:'成品脚本-'+i});
const G=env.G,api=env.FusionExplore,art=env.FusionArtwork;
assert.equal(G.$('#dialog'),doc.getElementById('dialog'));frames.slice().forEach(f=>f(16));
let count=0;for(const [theme,prompt]of Object.entries(api.presets))for(let i=0;i<4;i++){
 const spec=api.director.create(prompt+' 场景变化'+i);assert.equal(spec.theme,theme);assert(api.director.validate(spec));assert.equal(JSON.stringify(spec),JSON.stringify(api.director.create(spec.prompt)));
 const scene=new api.Scene(spec);assert(scene.reachability().ok);assert(scene.safePosition(720,1040));scene.draw(c2);count++;
}
const scene=new api.Scene(api.director.create(api.presets.stars)),initial=JSON.stringify(scene.spec);
assert(Object.isFrozen(scene.spec.layout.water));assert(scene.collides(720,805));assert(scene.collides(720,730));
scene.finishInteraction();assert(!scene.flags.finished);scene.echoInteraction(0);assert(!G.choice.active);scene.gardenInteraction();assert(!G.choice.active);
scene.axisInteraction();assert(!scene.collides(720,805));scene.gardenInteraction();assert(G.choice.active);G.choice.pick(0);scene.tideInteraction();G.choice.pick(1);assert(!scene.flags.tide);assert(scene.collides(720,730));
scene.tideInteraction();G.choice.pick(0);assert(scene.flags.tide);assert(!scene.collides(720,730));assert(scene.collides(620,730));
scene.gardenInteraction();G.choice.pick(1);assert(!scene.flags.tide);scene.tideInteraction();G.choice.pick(1);assert(!scene.collides(620,730));assert(scene.collides(720,730));
scene.echoInteraction(0);G.choice.pick(2);assert.equal(scene.rhythm,'together');assert(scene.flags.echo);
scene.finishInteraction();assert(scene.flags.finished);assert(art.isOpen());assert.equal(art.getState().width,1280);assert.equal(art.getState().height,1184);
assert.equal(art.prepareImageRequest().size,'1040x896');
art.setView('current');assert.equal(art.getState().width,1440);assert.equal(art.prepareImageRequest().size,'1280x720');art.setMode('painting');assert(!art.getState().hasResult);art.setStyle('ink');
assert.equal(JSON.stringify(scene.spec),initial);assert.equal(scene.runtime().version,1);assert(!('flags' in scene.spec));assert.equal(scene.runtime().artwork.mode,'painting');
assert.throws(()=>art.setMode('living'));assert.equal(typeof art.livingHTML,'undefined');assert(!/MediaRecorder|FusionPainting|living-canvas|tab-living/.test(html));
const request=art.prepareImageRequest();assert.equal(request.type,'wanxiang.image-edit');assert.equal(request.choices.garden,'flowers');assert.equal(request.choices.rhythm,'together');assert(!art.getState().aiConnected);
assert.throws(()=>art.setView('bad'));assert.throws(()=>art.setStyle('bad'));assert.throws(()=>art.setMode('bad'));art.close();assert.equal(G.overlayDepth,0);
assert(!api.director.validate({...scene.spec,theme:'unknown'}));assert(!api.director.validate({...scene.spec,seed:'tampered'}));assert(!api.director.validate({...scene.spec,nodes:[]}));assert.throws(()=>api.director.create(''));
assert.equal(api.director.create('星海柱廊，不要鲸鱼，不要下雨。').whale,false);assert.equal(api.director.create('星海柱廊，不要鲸鱼，不要下雨。').weather,'clear');
const walk=new api.Scene(api.director.create(api.presets.tide));
function move(dx,dy,frames){G.input.down={};if(dx)G.input.down[dx>0?'ArrowRight':'ArrowLeft']=true;if(dy)G.input.down[dy>0?'ArrowDown':'ArrowUp']=true;for(let i=0;i<frames;i++)walk.updatePlayer(.02);G.input.down={};}
move(0,-1,130);assert(walk.player.y>=820&&walk.player.y<850,'点灯前被承序门挡住');walk.axisInteraction();move(0,-1,44);assert(walk.player.y>745&&walk.player.y<780,'穿过门后被水庭挡住');walk.gardenInteraction();G.choice.pick(0);walk.tideInteraction();G.choice.pick(0);move(0,-1,38);assert(walk.player.y<716,'开路后实际穿过水庭');
async function artworkChecks(){
 doc.getElementById('showcase').onclick();assert(api.getScene().previewOnly);assert(!saved.has('wanxiang.fusion.explore.art1'),'成品预览不得写入正式存档');
 const hasSample=env.FusionArtworkSamples.length===3;assert.equal(art.getState().hasResult,hasSample);const key=art.prepareImageRequest().identityKey;
 art.setView('current');assert(!art.getState().hasResult,'改变取景不能沿用样例');art.setView('axis');assert.equal(art.getState().hasResult,hasSample);
 art.setStyle('ink');assert(art.getState().hasResult,'水墨必须绑定自己的样例');assert.notEqual(art.prepareImageRequest().identityKey,key);
 art.setStyle('paper');assert(art.getState().hasResult);assert(art.prepareImageRequest().prompt.includes('cut-paper'));art.setStyle('ink');assert(art.prepareImageRequest().prompt.includes('MONOCHROME'));
 await art.loadResult(new Blob(['fake-png'],{type:'image/png'}));assert(art.getState().hasResult);art.setStyle('jade');assert.equal(art.getState().hasResult,hasSample);art.setStyle('ink');assert(art.getState().hasResult,'相同输入应可找回当前会话的结果');
 let finish;art.setImageAdapter(()=>new Promise(resolve=>finish=resolve));const pending=art.generateAI();await new Promise(setImmediate);assert(art.getState().busy);art.setView('current');finish(new Blob(['fake-png'],{type:'image/png'}));await pending;assert(!art.getState().hasResult,'异步返回不能覆盖另一取景');assert(!art.getState().busy);art.close();assert.equal(G.overlayDepth,0);
 console.log(JSON.stringify({startup:'passed',configurations:count,questDependencies:'passed',twoArtworkModes:'passed',videoRemoved:'passed',immutableSpec:'passed',sourceDimensions:'passed',sampleBinding:'passed',styleAndViewIsolation:'passed',staleResponseIsolation:'passed',previewPreservesSave:'passed'},null,2));
}
artworkChecks().catch(e=>{console.error(e);process.exitCode=1;});
