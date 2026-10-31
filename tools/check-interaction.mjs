import {spawn} from 'node:child_process';
import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=9340;
const chrome=spawn(process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--mute-audio','--no-first-run','--no-sandbox','--remote-debugging-port='+port,'--user-data-dir='+mkdtempSync(join(tmpdir(),'wxl-input-')),'about:blank'],{stdio:'ignore'});
let ws,seq=0;const pending=new Map(),errors=[];
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function key(code,ms=60){const key=code==='Space'?' ':code.replace('Key','').toLowerCase();await send('Input.dispatchKeyEvent',{type:'keyDown',code,key});await sleep(ms);await send('Input.dispatchKeyEvent',{type:'keyUp',code,key});await sleep(100);}
async function until(expr,timeout=8000){const start=Date.now();while(Date.now()-start<timeout){if(await ev(expr))return;await sleep(100);}throw Error('Timeout: '+expr);}
function check(value,msg){if(!value)throw Error(msg);console.log('PASS '+msg);}
const state=`JSON.stringify({scene:G.scene?.id,title:G.titleActive,paused:G.isWorldPaused(),overlay:G.overlayDepth,cut:G.cut.active,dialog:G.dialog.active,fade:G.fade.busy,player:G.scene?.player,nearest:G.scene?._nearest?.label})`;
try{
 for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:'+port+'/json/version');break;}catch{}await sleep(100);}
 const tab=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 await send('Runtime.enable');await send('Page.enable');
 await send('Page.navigate',{url:process.env.APP||'http://127.0.0.1:8123/?map=wumen'});
 await until('window.G?.scene?.id === "wumen"');
 for(let i=0;i<10;i++){if(!await ev('G.cut.active'))break;await key('Space');await key('Space');}
 await until('!G.cut.active && !G.fade.busy');console.log('INITIAL',await ev(state));
 const walkMs=await ev('Math.max(100, (G.scene.player.y-G.scene.map.spots.find(s=>s.id==="wumen.origin").y-20)/68*1000)');
 const y=await ev('G.scene.player.y');await key('KeyW',walkMs);
 const after=await ev('G.scene.player.y');check(after<y-20,'real W key moves player');
 console.log('NEAR',await ev(state));
 check(await ev('!!G.scene._nearest'),'walking reaches an interaction');
 check(await ev('!document.querySelector("#prompt").classList.contains("hidden")'),'E prompt visible on approach');
 await ev('G.dialog.show([{text:"pause regression", speed:1}])');await sleep(100);await key('Space');if(await ev('G.dialog.active'))await key('Space');await sleep(100);
 check(await ev('!G.dialog.active'),'real Space closes temporary dialog');
 check(await ev('!document.querySelector("#prompt").classList.contains("hidden")'),'E prompt returns after dialog while standing still');
 await key('KeyE');check(await ev('G.dialog.active'),'real E opens interaction dialog');
 await ev('G.mod.done("wumen.origin"); G.save.flag("seen.wumen",true)');
 await send('Page.reload');
 await until('window.G?.scene?.id === "wumen" && !G.fade.busy && !G.dialog.active && !G.cut.active');
 await key('KeyW',walkMs);
 console.log('SAVED',await ev(state),await ev('JSON.stringify({done:G.mod.isDone("wumen.origin"),can:G.scene.canContinue(),text:document.querySelector("#prompt-text").textContent})'));
 check(await ev('document.querySelector("#prompt-text").textContent === G.str.get("ui.buttons.continue") && !document.querySelector("#prompt").classList.contains("hidden")'),'completed save offers Continue at original puzzle');
 await key('KeyE');
 check(await ev('G.dialog.active'),'real E resumes completed-map progression');
 for(let i=0;i<30;i++){if(await ev('G.scene.id === "taihe"'))break;await key('KeyE');}
 await until('G.scene.id === "taihe"');
 check(true,'completed Wumen proceeds to Taihe without clearing save');
 // Enter Taihe through real E; subsequent choices click the actual rendered buttons.
 await ev('G.save.flag("seen.taihe",true)');
 await send('Page.reload');
 await until('window.G?.scene?.id === "wumen" && !G.cut.active && !G.dialog.active');
 await ev('G.mod.go("taihe")');
 await until('G.scene.id === "taihe" && !G.fade.busy && !G.dialog.active');
 const taiheWalk=await ev('Math.max(100,(G.scene.player.y-G.scene.map.spots.find(s=>s.id==="taihe.labels").y-12)/68*1000)');
 await key('KeyW',taiheWalk);await key('KeyE');
 check(await ev('G.dialog.active'),'real E starts Taihe labels');
 mkdirSync('artifacts',{recursive:true});
 for(let i=0;i<10 && !await ev(`document.querySelector('#dialog').classList.contains('has-portrait')`);i++){await ev('G.dialog.finishType()');await key('Space');}
 await ev('G.dialog.finishType()');
 check(await ev(`document.querySelector('.dlg-portrait')?.width===160 && !document.querySelector('.dlg-portrait').classList.contains('hidden')`),'mentor portrait is visible in actual dialogue');
 check(await ev(`getComputedStyle(document.querySelector('#dlg-name')).fontFamily.includes('Microsoft YaHei') && getComputedStyle(document.querySelector('#dlg-name'),'::before').content==='none'`),'speaker uses Microsoft YaHei without decorative quote');
 const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync('artifacts/taihe-dialog.png',Buffer.from(shot.data,'base64'));
 const limit=Date.now()+25000;
 while(Date.now()<limit && !await ev('G.scene.id === "qianqing"')){
   const action=await ev(`(()=>{if(!G.dialog.active)return G.scene._continue ? 'continue' : G.scene.followUp?.(G.scene.map.spots.find(s=>s.id==='taihe.labels')) ? 'follow' : 'wait';G.dialog.finishType();const l=G.dialog.queue[G.dialog.idx];if(!l?._opts)return 'advance';const opts=l._opts;let value=opts.some(o=>o.value==='move')?(G.scene.vars.labelsDone===2?'stay':'move'):'keep';const idx=opts.findIndex(o=>o.value===value);if(idx<0)throw Error('Unknown choices '+JSON.stringify(opts));document.querySelectorAll('#dlg-options button')[idx].click();return 'picked';})()`);
   if(action==='advance')await key('Space');else if(action==='continue'||action==='follow'){await sleep(1600);check(await ev('G.scene.id==="taihe" && !G.dialog.active'),'choice result remains visible for 1.6 seconds before E');await key('KeyE');}else await sleep(110);
 }
 check(await ev('G.scene.id === "qianqing"'),'real E continues labels to keep choice then Qianqing');
 check(await ev('G.mod.isDone("taihe.labels") && G.mod.isDone("taihe.keep")'),'both required Taihe steps completed');
 check(await ev(`G.save.flag('keep.steps')===true && G.save.flag('keep.steps.note')===false && G.save.flag('keep.steps.drop')===false`),'keep choice writes distinct boolean flags');
 await ev(`void G.cut.play('wumen.intro')`);
 await until(`!!document.querySelector('.cut-who')?.textContent`);
 check(await ev(`document.querySelector('.cut-who').textContent===G.str.who('diotima').name && !document.querySelector('#cut').textContent.includes('[object Object]')`),'opening cut displays speaker name rather than object');
 for(let i=0;i<8 && await ev('G.cut.active');i++){await key('Space');await key('Space');}
 check(errors.length===0,'no browser exceptions: '+errors.join('\n'));
}catch(e){console.error(e);process.exitCode=1;}finally{if(ws)ws.close();chrome.kill();}
