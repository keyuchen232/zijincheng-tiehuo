import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve(process.env.TITLE_PREVIEW_OUT || 'artifacts/title-poster');fs.mkdirSync(out,{recursive:true});
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=9347',`--user-data-dir=${out}/profile`,'about:blank'],{stdio:'ignore'});
let ws;let id=0;const pending=new Map();const errors=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function send(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify({exception:r.exceptionDetails,errors}));return r.result.value;}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));}
try{
 let targets;for(let i=0;i<60;i++){try{targets=await(await fetch('http://127.0.0.1:9347/json/list')).json();break;}catch{await delay(150);}}
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 await send('Page.enable');await send('Runtime.enable');
 const report=[];
 for(const [name,width,height] of [['desktop',1440,900],['wide',1920,1080],['mobile',390,844],['landscape',844,390]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://127.0.0.1:8123/'});await delay(1800);
 const state=await ev(`JSON.stringify({url:location.href,poster:document.querySelector('.title-poster-image')?.naturalWidth,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('#title .title-actions button')].map(b=>{const r=b.getBoundingClientRect();return {id:b.id,x:r.x,y:r.y,w:r.width,h:r.height,visible:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})})`);
 report.push({name,...JSON.parse(state)});await shot(name);
 if(name==='desktop'){
 for(let i=0;i<12;i++){await shot(`frame-${String(i).padStart(2,'0')}`);await delay(180);}
 await ev(`document.getElementById('title-motion-toggle').click()`);
 report.push({pause:await ev(`document.querySelector('.title-poster-frame').getAnimations()[0].playState`)});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(500);
 report.push({reduced:await ev(`({disabled:document.getElementById('title-motion-toggle').disabled,animations:document.querySelector('.title-poster-frame').getAnimations().length})`)});
 await send('Emulation.setEmulatedMedia',{features:[]});
 }
 }
 await ev(`document.getElementById('btn-stage').click()`);await delay(900);report.push({entry:await ev(`({titleHidden:document.getElementById('title').classList.contains('hidden'),scene:window.G?.scene?.id})`)});
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify({report,errors},null,2));console.log(JSON.stringify({report,errors},null,2));
 if(errors.length||report.some(r=>r.buttons?.some(b=>!b.visible)||r.overflow||('poster'in r&&!r.poster)))process.exitCode=1;
}finally{ws?.close();browser.kill();}
