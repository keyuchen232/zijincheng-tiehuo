/* 实景是唯一编辑目标；结果绑定场景、取景、笔意与源图，不跨场景套图。 */
(() => {
 'use strict';
 const G=window.G,$=id=>document.getElementById(id),out=$('painting'),samples=window.FusionArtworkSamples||[],catalog=window.FusionArtStyles,results=new Map();
 let opened=false,scene=null,snapshots=null,mode='pixel',view='axis',style='jade',compare='after',adapter=null,busy=false,epoch=0,sourceURL='',entry=null,sourceLoaded=Promise.resolve();
 const text=(c,t,x,y,size,col,align='left')=>{c.font=size+'px "Microsoft YaHei",sans-serif';c.textAlign=align;c.fillStyle=col;c.fillText(t,x,y);};
 const recipe=()=>({moon:'海月入园',flowers:'花雨入窗'})[scene.mistView]+' · '+({rise:'涨潮',ebb:'退潮',still:'静潮'})[scene.tideMode]+' · '+({ascending:'逐光',returning:'回澜',together:'齐鸣'})[scene.rhythm];
 function capture(s,v){
  const cv=document.createElement('canvas');cv.width=v==='axis'?1040:640;cv.height=v==='axis'?896:360;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  const old={capture:s.capturingArtwork,finish:s.finishTime,marker:s.marker};s.capturingArtwork=true;s.finishTime=6;s.marker=null;
  try{if(v==='current')s.draw(c);else{c.save();c.translate(-220,-230);c.drawImage(s.ground,0,0);s.drawGroundExtras(c);const list=s.entities.slice();list.push({x:s.player.x,baseY:s.player.y,draw:cc=>s.drawPlayer(cc)});list.sort((a,b)=>a.baseY-b.baseY);for(const e of list)e.draw(c);s.drawForeground(c);c.restore();}}
  finally{s.capturingArtwork=old.capture;s.finishTime=old.finish;s.marker=old.marker;}return cv;
 }
 function title(){return $('painting-title').value.trim()||scene.theme.title;}
 function identity(){return {spec:scene.spec,flags:scene.flags,garden:scene.mistView,tide:scene.tideMode,rhythm:scene.rhythm,player:{x:scene.player.x,y:scene.player.y},view,style};}
 function identityKey(){return window.FusionSpec.hash(JSON.stringify(identity()));}
 function prompt(){return catalog.prompt(identity());}
 function request(){if(!scene)throw Error('先打开作品');return {version:2,type:'wanxiang.image-edit',identityKey:identityKey(),worldId:window.FusionSpec.hash(scene.spec.seed),view,style,choices:{garden:scene.mistView,tide:scene.tideMode,rhythm:scene.rhythm},scene:identity(),source:{width:snapshots[view].width,height:snapshots[view].height},size:view==='axis'?'1040x896':'1280x720',prompt:prompt()+' Material constraint: GREEN land and BEIGE paths are DRY. Only existing BLUE regions are water. Preserve their exact extent, dry banks and every walkable route. Do not flood the terraces or turn the scene into a generic palace panorama.'};}
 function eligibleSample(){return scene.previewOnly?samples.find(s=>s.identityKey===identityKey()&&JSON.stringify(s.scene)===JSON.stringify(identity())):null;}
 // 完整输入作缓存键，不能仅凭主题复用；源图逐字节不同即视为另一作品。
 function activeKey(){return JSON.stringify(identity())+':'+sourceURL;}
 async function imageFrom(url){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('图片加载失败'));img.src=url;});return img;}
 function updateSource(){
  const revision=++epoch,selected=eligibleSample();sourceURL=selected?selected.source:snapshots[view].toDataURL('image/png');$('art-source-image').src=sourceURL;
  sourceLoaded=imageFrom(sourceURL);sourceLoaded.then(()=>{if(opened&&revision===epoch)refresh();}).catch(e=>$('art-status').textContent=e.message);
  entry=results.get(activeKey())||(selected?{url:selected.result,origin:'AI 实景转绘 · 随包样例',model:selected.model}:null);
  $('ai-status').textContent=selected?'此成品由当前实景图生图获得；三个媒介的真实样例均已随包保存。':'当前取景与笔意已绑定；生成或导入后在这里对照。';refresh();
 }
 function compose(){
  const axis=view==='axis';out.width=axis?1280:1440;out.height=axis?1184:1040;const c=out.getContext('2d'),ink=style==='ink'?'#294a48':'#495044',paper=style==='ink'?'#dfe5d9':'#e9dfc7';
  c.fillStyle=paper;c.fillRect(0,0,out.width,out.height);c.strokeStyle='#a49d80';c.lineWidth=1;c.strokeRect(22,22,out.width-44,out.height-44);text(c,'万 象 灵 境  /  THE PLACE YOU MADE',80,65,13,'#87846d');text(c,title(),out.width-80,72,25,ink,'right');c.imageSmoothingEnabled=false;
  const source=eligibleSample()?$('art-source-image'):snapshots[view];if(source.complete===false)return;c.drawImage(source,axis?120:80,110,axis?1040:1280,axis?896:720);const y=axis?1050:880;text(c,recipe(),80,y,18,ink);let p=scene.spec.prompt;if(p.length>72)p=p.slice(0,71)+'…';text(c,p,80,y+36,13,'#87846d');text(c,'实景像素画卷 · '+(scene.flags.finished?'共创已成':'途中习作')+' · 当代虚构创作',80,out.height-40,12,'#87846d');return out;
 }
 function preferences(){scene.artwork={title:$('painting-title').value,mode,view,style};window.FusionExplore.save();}
 function refresh(){
  if(!opened)return;const ai=mode==='painting';$('painting-image').hidden=ai;$('art-comparison').hidden=!ai;$('compare-options').hidden=!ai;$('ai-controls').hidden=!ai;
  $('art-mode-title').textContent=ai?'换一种媒介，再造此境':'一刻成卷';$('art-description').textContent=ai?'以布局为骨架，把像素完全重塑为新的媒介。中轴、柱廊与水庭依旧可辨，笔触和材质自由生长。':'保留亲手走过的世界。建筑的位置、沿途意象与发现的方向，都留在这一刻。';$('style-label').textContent='转绘媒介';$('style-label').hidden=!ai;document.querySelector('.art-styles').hidden=!ai;$('art-panel').setAttribute('aria-labelledby','tab-'+mode);$('art-view-label').textContent=ai?'实景 → 转绘 / 同一张原图':'实景定格 / 保留你的布局';
  $('painting-caption').textContent=scene.previewOnly?'成品示例 · 海月入园 / 退潮成路 / 回澜':'这次探索的原图与选择，已绑定为同一件作品';$('art-origin').textContent=ai?(entry?.origin||'尚未转绘 · 显示实际原图'):'像素画卷 · 实景装裱';$('credit-view').textContent=scene.mistView==='flowers'?'花雨入窗':'海月入园';$('credit-tide').textContent=scene.flags.tide?(scene.tideMode==='rise'?'花桥浮现':'石径露出'):'待解水庭';$('credit-rhythm').textContent=scene.flags.echo?({ascending:'逐光',returning:'回澜',together:'齐鸣'})[scene.rhythm]:'回声待谱';
  const effective=!entry?'before':compare,wipe=ai&&effective==='wipe';
  $('art-comparison').hidden=!ai||wipe;$('art-wipe').hidden=!wipe;
  $('before-figure').hidden=effective==='after';$('after-figure').hidden=effective==='before';$('art-comparison').classList.toggle('solo',effective!=='pair');
  $('art-ai-image').hidden=!entry;$('art-empty').hidden=!ai||!!entry;
  if(entry){if($('art-ai-image').getAttribute('src')!==entry.url)$('art-ai-image').src=entry.url;if(wipe){$('wipe-after').src=entry.url;$('wipe-before').src=sourceURL;updateWipe();}}
  $('result-label').textContent=entry?(entry.origin.startsWith('外部')?'外部导入 · 待核对':catalog.styles[style].name+' · 图生图'):'等待转绘';
  $('clear-ai').hidden=!results.has(activeKey());$('download-painting').hidden=ai&&!entry;$('download-painting').disabled=false;$('download-painting').textContent=ai?'保存成图 PNG ↓':'保存像素画卷 PNG ↓';
  $('download-print').hidden=!ai||!entry;$('download-comparison').hidden=!ai||!entry;
  for(const b of document.querySelectorAll('[data-art-compare]'))b.disabled=!entry&&b.dataset.artCompare!=='before';
  $('run-ai').disabled=busy||!adapter;$('run-ai').textContent=busy?'正在转绘，请稍候…':entry?'按此媒介再绘一张 ↗':'用此媒介转绘 ↗';
  for(const b of document.querySelectorAll('[data-art-mode]')){const yes=b.dataset.artMode===mode;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;}
  for(const [attr,val]of [['view',view],['style',style],['compare',compare]])for(const b of document.querySelectorAll('[data-art-'+attr+']'))b.setAttribute('aria-pressed',String(b.dataset['art'+attr[0].toUpperCase()+attr.slice(1)]===val));
  if(!ai){compose();$('painting-image').src=out.toDataURL('image/png');}preferences();
 }
 function open(s){
  if(!s)return false;if(opened&&scene===s)return true;scene=s;snapshots={axis:capture(s,'axis'),current:capture(s,'current')};const p=s.artwork||{};mode=['pixel','painting'].includes(p.mode)?p.mode:'pixel';view=['axis','current'].includes(p.view)?p.view:'axis';style=Object.hasOwn(catalog.styles,p.style)?p.style:'jade';compare='after';$('painting-title').value=p.title||s.theme.title;
  if(!opened)G.overlayDepth++;$('artwork').classList.remove('immersive');$('return-world').textContent='返回探索 ↗';$('art-immersive').textContent='放大赏画 ↗';opened=true;G.show($('artwork'));G.input.down=Object.create(null);G.ui.prompt(null);$('art-status').textContent='可保存原作，或选择三种非像素媒介；转绘后还可制作收藏展签。';updateSource();$('tab-'+mode).focus();return true;
 }
 function close(){if(!opened)return;epoch++;opened=false;G.hide($('artwork'));G.overlayDepth=Math.max(0,G.overlayDepth-1);G.input.clearPressed();G.input.down=Object.create(null);$('game').focus();}
 function setMode(v){if(!['pixel','painting'].includes(v))throw Error('不支持的作品形式');mode=v;refresh();}
 function setView(v){if(!['axis','current'].includes(v))throw Error('不支持的取景');if(view!==v){view=v;updateSource();}}
 function setStyle(v){if(!Object.hasOwn(catalog.styles,v))throw Error('不支持的笔意');if(style!==v){style=v;updateSource();}}
 function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 const filename=()=>title().replace(/[\\/:*?"<>|]/g,'-');
 async function download(){
  if(!opened)return;if(mode==='pixel'){await sourceLoaded;compose();out.toBlob(b=>b&&saveBlob(b,filename()+'-像素画卷.png'),'image/png');}else if(entry){const img=await imageFrom(entry.url),cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;cv.getContext('2d').drawImage(img,0,0);cv.toBlob(b=>b&&saveBlob(b,filename()+'-实景转绘.png'),'image/png');}$('art-status').textContent='PNG 已生成，请查看浏览器下载。';
 }
 async function downloadComparison(){
  if(!entry)return;const src=sourceURL,result=entry.url,name=filename(),caption=title(),label=recipe(),brush=style,[a,b]=await Promise.all([imageFrom(src),imageFrom(result)]),cv=document.createElement('canvas');cv.width=2200;cv.height=1120;const c=cv.getContext('2d');c.fillStyle='#e9dfc7';c.fillRect(0,0,cv.width,cv.height);text(c,caption+' / 同境异笔',60,64,30,'#354e4c');
  for(const [img,x]of [[a,60],[b,1140]]){const w=1000,h=896,scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;c.imageSmoothingEnabled=img!==a;c.drawImage(img,x+(w-dw)/2,110+(h-dh)/2,dw,dh);}text(c,'实景原图',60,1050,18,'#354e4c');text(c,'AI 实景转绘 / '+catalog.styles[brush].name,1140,1050,18,'#354e4c');text(c,label+' · 当代虚构创作',60,1090,13,'#777d69');cv.toBlob(b=>b&&saveBlob(b,name+'-原图对照.png'),'image/png');
 }
 function updateWipe(){const value=Math.max(0,Math.min(100,Number($('wipe-slider').value)||0));$('wipe-before').style.clipPath='inset(0 '+(100-value)+'% 0 0)';$('wipe-line').style.left=value+'%';}
 async function downloadPrint(){
  if(!entry)return;const url=entry.url,name=filename(),caption=title(),label=recipe(),medium=catalog.styles[style].name,key=identityKey(),img=await imageFrom(url),cv=document.createElement('canvas');
  cv.width=1440;cv.height=1580;const c=cv.getContext('2d');c.fillStyle='#f2ebdd';c.fillRect(0,0,1440,1580);c.strokeStyle='#c8bda3';c.lineWidth=2;c.strokeRect(34,34,1372,1512);
  text(c,'万 象 灵 境   /   PRIVATE WORLDS, SHARED IMAGINATION',88,90,15,'#68736b');
  const scale=Math.min(1264/img.naturalWidth,1150/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;c.drawImage(img,88+(1264-w)/2,140+(1150-h)/2,w,h);
  text(c,caption,88,1360,36,'#294c4c');text(c,medium+' / '+label,88,1410,20,'#68736b');
  text(c,'由玩家布局与选择生成 · AI 媒介转绘 · 当代虚构创作',88,1460,16,'#68736b');text(c,'SCENE / '+key,1352,1505,14,'#68736b','right');
  cv.toBlob(b=>b&&saveBlob(b,name+'-'+medium+'-收藏展签.png'),'image/png');$('art-status').textContent='收藏展签已生成，保留你的题名、选择与场景编号。';
 }
 async function loadResult(blob,origin='外部导入 · 待核对',boundKey=activeKey(),boundEpoch=epoch){
  if(!(blob instanceof Blob)||!['image/png','image/jpeg','image/webp'].includes(blob.type))throw Error('请选择 PNG、JPEG 或 WebP 图片');if(blob.size>20*1024*1024)throw Error('图片应小于 20 MB');const url=URL.createObjectURL(blob);
  try{const img=await imageFrom(url);if(img.naturalWidth*img.naturalHeight>24000000)throw Error('图片不得超过 2400 万像素');const previous=results.get(boundKey);if(previous?.url.startsWith('blob:'))URL.revokeObjectURL(previous.url);const item={url,origin};results.set(boundKey,item);if(!opened||epoch!==boundEpoch||activeKey()!==boundKey)return;entry=item;mode='painting';$('ai-status').textContent=origin+'已载入。请对照建筑位置、通路和水庭。';refresh();}catch(e){URL.revokeObjectURL(url);throw e;}
 }
 function setImageAdapter(fn){if(fn!==null&&typeof fn!=='function')throw Error('适配器必须为函数');adapter=fn;$('connection-status').textContent=fn?'本机图像服务已连接':'离线模式 · 可导出原图';if(opened)refresh();}
 async function generateAI(){
  if(!adapter)throw Error('请先启动本机 AI 绘景服务');if(busy)return;const boundKey=activeKey(),boundEpoch=epoch,req=request(),source=sourceURL;busy=true;refresh();$('ai-status').textContent='正在以这张原图转绘，通常需要数十秒至数分钟。切换取景后不会误套旧结果。';
  try{const image=await(await fetch(source)).blob(),result=await adapter({request:req,image});await loadResult(result,'AI 实景转绘 · 本机服务',boundKey,boundEpoch);}finally{busy=false;if(opened)refresh();}
 }
 async function connect(){
  if(!/^https?:$/.test(window.location?.protocol||'')){setImageAdapter(null);return;}
  try{const r=await fetch('/api/status',{cache:'no-store'}),s=await r.json();if(!r.ok||!s.available)throw Error();setImageAdapter(async({request,image})=>{
   const imageBase64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(image);}),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),390000);
   try{const response=await fetch('/api/artwork/render',{method:'POST',headers:{'Content-Type':'application/json','X-Wanxiang-Token':s.token},body:JSON.stringify({request,imageBase64}),signal:controller.signal});if(!response.ok){let e={};try{e=await response.json();}catch{}throw Error(e.error||'服务暂不可用');}return await response.blob();}finally{clearTimeout(timer);}
  });}catch{setImageAdapter(null);}
 }
 function toggleImmersive(){const yes=!$('artwork').classList.contains('immersive');$('artwork').classList.toggle('immersive',yes);$('return-world').textContent=yes?'退出赏画 / Esc':'返回探索 ↗';if(yes)$('return-world').focus();else $('art-immersive').focus();}
 $('art-immersive').onclick=toggleImmersive;$('download-print').onclick=()=>downloadPrint().catch(e=>$('art-status').textContent=e.message);$('wipe-slider').addEventListener('input',updateWipe);
 for(const s of samples)$('thumb-'+s.scene.style).src=s.thumbnail;
 document.querySelector('.hud-right').appendChild($('btn-art'));$('btn-art').onclick=()=>open(window.FusionExplore.getScene());$('return-world').onclick=()=>{if($('artwork').classList.contains('immersive'))toggleImmersive();else close();};$('download-painting').onclick=()=>download().catch(e=>$('art-status').textContent=e.message);$('download-comparison').onclick=()=>downloadComparison().catch(e=>$('art-status').textContent=e.message);$('painting-title').addEventListener('input',refresh);
 for(const b of document.querySelectorAll('[data-art-mode]'))b.onclick=()=>setMode(b.dataset.artMode);for(const b of document.querySelectorAll('[data-art-view]'))b.onclick=()=>setView(b.dataset.artView);for(const b of document.querySelectorAll('[data-art-style]'))b.onclick=()=>setStyle(b.dataset.artStyle);for(const b of document.querySelectorAll('[data-art-compare]'))b.onclick=()=>{compare=b.dataset.artCompare;refresh();};
 $('export-ai-input').onclick=async()=>{await sourceLoaded;const blob=await(await fetch(sourceURL)).blob();saveBlob(blob,filename()+'-待美化原图.png');};$('export-ai-request').onclick=()=>saveBlob(new Blob([JSON.stringify(request(),null,2)],{type:'application/json'}),filename()+'-美化提示.json');$('run-ai').onclick=()=>generateAI().catch(e=>$('ai-status').textContent='本次未能转绘：'+e.message+'。原图仍可导出，请勿连续重复提交。');
 $('import-ai-image').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{await loadResult(file);}catch(err){$('ai-status').textContent=err.message;}finally{e.target.value='';}};
 $('clear-ai').onclick=()=>{const item=results.get(activeKey());if(item?.url.startsWith('blob:'))URL.revokeObjectURL(item.url);results.delete(activeKey());const selected=eligibleSample();entry=selected?{url:selected.result,origin:'AI 实景转绘 · 随包样例'}:null;epoch++;refresh();};
 $('artwork').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if($('artwork').classList.contains('immersive'))toggleImmersive();else close();return;}if(e.key==='Tab'){const items=[...$('artwork').querySelectorAll('button:not(:disabled),input,summary')].filter(n=>n.getClientRects().length&&n.tabIndex!==-1),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}if(e.target.dataset.artMode&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setMode(mode==='pixel'?'painting':'pixel');$('tab-'+mode).focus();}});
 const paused=G.isWorldPaused;G.isWorldPaused=()=>opened||paused();const onKey=G.onKeyDown;G.onKeyDown=(code,e)=>{if(opened){if(code==='Escape'){if($('artwork').classList.contains('immersive')){toggleImmersive();}else close();}return;}onKey?.(code,e);};
 window.FusionArtwork={open,close,setMode,setView,setStyle,download,downloadPrint,downloadComparison,renderScene:capture,setImageAdapter,generateAI,prepareImageRequest:request,loadResult,isOpen:()=>opened,getState:()=>({opened,mode,view,style,compare,identityKey:scene?identityKey():null,hasResult:!!entry,busy,aiConnected:!!adapter,width:out.width,height:out.height})};connect();
})();
