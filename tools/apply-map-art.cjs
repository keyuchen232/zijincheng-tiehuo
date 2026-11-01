const fs=require('fs'),vm=require('vm');
const specs={wumen:{h:620,b:[100,430,440,170],spawn:[320,576],spots:[[320,486,34],[170,554,30],[484,468,30]],npc:[398,556]},taihe:{h:650,b:[100,380,440,250],spawn:[320,610],spots:[[320,506,32],[156,544,28],[490,548,28],[130,454,26],[442,418,28],[320,394,26],[216,606,25],[320,606,25],[424,606,25]],npc:[400,552]},qianqing:{h:650,b:[100,380,440,250],spawn:[320,610],spots:[[320,560,34],[194,526,30],[446,526,30]],npc:[402,600]},repair_bench:{h:650,b:[100,410,440,220],spawn:[320,610],spots:[[320,552,32],[460,560,30],[150,486,28],[222,566,28],[476,474,28]],npc:[390,604]},creator:{h:620,b:[100,370,440,230],spawn:[320,576],spots:[[320,514,32],[190,504,28],[450,536,28]],npc:[430,454]},shenwumen:{h:620,b:[100,410,440,190],spawn:[320,574],spots:[[320,460,32],[320,564,28],[174,494,28],[464,528,28],[492,440,26]],npc:[396,574]}};
for(const[id,s]of Object.entries(specs)){
 const file='data/maps/'+id+'.js';let map;vm.runInNewContext(fs.readFileSync(file,'utf8'),{G:{mod:{register:m=>map=m}}});
 map.size.h=s.h;map.bounds={x:s.b[0],y:s.b[1],w:s.b[2],h:s.b[3]};map.spawn={x:s.spawn[0],y:s.spawn[1]};map.spots.forEach((p,i)=>Object.assign(p,{x:s.spots[i][0],y:s.spots[i][1],r:s.spots[i][2]}));Object.assign(map.marker,{x:map.spots[0].x,y:map.spots[0].y});
 map.npcs=[{id:'diotima',painter:'mentor.diotima',x:s.npc[0],y:s.npc[1],r:22,dialogKey:'nodes.'+id+'.enter'}];map.ground.forEach(p=>p.h=map.size.h-p.y);
 if(id==='taihe'){
 map.props.filter(p=>p.painter==='hall.layerstone').forEach((p,i)=>{p.x=[216,320,424][i];p.baseY=612;});
 const labels=map.props.find(p=>p.painter==='hall.labelplates');labels.opt.at=[{dx:142,dy:-46},{dx:-138,dy:-46},{dx:0,dy:-34}];labels.opt.resolved=[{dx:-138,dy:-46},{dx:142,dy:-46},{dx:0,dy:-34}];
 map.props.push({painter:'hall.references',x:320,baseY:416,opt:{}});
 }
 if(id==='qianqing'){
 map.props=map.props.filter(p=>p.painter!=='hall.rock');map.props.filter(p=>p.painter==='hall.columns').forEach(p=>{p.x=p.opt.style==='stone'?220:454;p.baseY=500;p.opt.n=p.opt.style==='stone'?6:1;p.opt.gap=28;p.opt.h=90;});map.props.push({painter:'hall.loadbeam',x:320,baseY:500,opt:{}});map.solids.push({x:140,y:488,w:160,h:14},{x:444,y:488,w:20,h:14});
 }
 if(id==='repair_bench'){
 map.props.find(p=>p.painter==='hall.bench').baseY=520;Object.assign(map.props.find(p=>p.painter==='hall.relic'),{x:472,baseY:530});map.props.find(p=>p.painter==='wumen.lantern').baseY=490;map.solids.push({x:180,y:476,w:240,h:44});map.lights=[{x:320,y:474,r:130,color:'#ffcf86',a:.2}];
 }
 if(id==='creator'){
 map.props=map.props.filter(p=>p.painter!=='hall.rock');map.props.filter(p=>p.painter==='hall.trees').forEach((p,i)=>{p.x=i?550:90;p.baseY=464;p.opt.n=1;});map.props.find(p=>p.painter==='hall.terminal').baseY=476;map.solids.push({x:250,y:426,w:140,h:50});map.lights[0].y=414;
 }
 if(id==='shenwumen')map.props.filter(p=>p.painter==='hall.clue').forEach((p,i)=>{p.x=i?464:174;p.baseY=i?516:482;});
 fs.writeFileSync(file,'/* Compact interaction court; all movement is confined by bounds. */\nG.mod.register('+JSON.stringify(map,null,2)+');\n');
}
function replace(text,from,to){if(!text.includes(from))throw Error('Missing source: '+from.slice(0,100));return text.replace(from,to);}
let w=fs.readFileSync('js/art/wumen.js','utf8');
w=replace(w,"const dx = (v.gridDx || 0) + (v.gridBoth || 0);\n    const cell = 40;","const both = v.gridBoth || 0;\n    const dx = (v.gridDx || 0) + both;\n    const cell = 40;");
w=replace(w,"gridLines(ctx, 320, 470, prop.w, prop.h, cell, GOLD", "gridLines(ctx, 320 + both, 470, prop.w, prop.h, cell, GOLD");
w=replace(w,"const ox = 320, oy = 470;","const ox = 320 + both, oy = 470;");fs.writeFileSync('js/art/wumen.js',w);
let h=fs.readFileSync('js/art/halls.js','utf8');
h=replace(h,"if (v.labelGlitch) {","if (v.labelGlitch && (v.labelsDone || 0) < 3) {");
h=replace(h,"const at = spots[i] || { dx: 0, dy: 0 };","const done = i < (v.labelsDone || 0);\n      const resolved = (prop.opt && prop.opt.resolved) || spots;\n      const at = (done ? resolved[i] : spots[i]) || { dx: 0, dy: 0 };\n      const glitch = v.labelGlitch && !done;");
h=replace(h,"ctx.globalAlpha = v.labelGlitch ? 0.55 : 0.8;","ctx.globalAlpha = glitch ? 0.55 : 0.8;");
h=replace(h,"size: 9, color: v.labelGlitch ? '#c98f77' : '#d8c9a8', align: 'center',","size: 9, color: glitch ? '#c98f77' : (done && i < 2 ? '#a7c8d2' : '#d8c9a8'), align: 'center',");
h=replace(h,"if (v.crack) {","if (v[o.style === 'stone' ? 'crackStone' : 'crackWood'] || (mine && v.crack)) {");
h=replace(h,"if (v.dust) {","if (mine && v.dust) {");
h=replace(h,"ctx.fillRect(px - 7 + tilt, y - hh, 14, hh);",`ctx.beginPath();
        ctx.moveTo(px - 9 + tilt, y - 6);ctx.lineTo(px - 5 + tilt, y - hh + 28);
        ctx.lineTo(px + 5 + tilt, y - hh + 28);ctx.lineTo(px + 9 + tilt, y - 6);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.arc(px + tilt, y - hh + 18, 6, 0, Math.PI * 2);ctx.fill();
        ctx.fillRect(px - 7 + tilt, y - hh + 24, 14, 8);
        ctx.strokeStyle='#9c9382';ctx.lineWidth=1;
        for(let fold=-1;fold<=1;fold++){ctx.beginPath();ctx.moveTo(px+fold*3,y-hh+38);ctx.lineTo(px+fold*5,y-10);ctx.stroke();}`);
h=replace(h,"/* 裂纹：塌过一次就一直留着 */",`/* Material-specific joint: keep accepted connection readable. */
      const method = v[o.style === 'stone' ? 'stoneMethod' : 'woodMethod'];
      if (method) {
        ctx.strokeStyle = method === 'dowel' ? '#b9c1bd' : '#d8b26a';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-7,y-hh-4);ctx.lineTo(px+7,y-hh-4);ctx.stroke();
        if(method === 'tenon')ctx.strokeRect(px-3,y-hh-10,6,10);
        if(method === 'dowel')ctx.fillRect(px-1,y-hh-13,2,14);
      }
      /* 裂纹：塌过一次就一直留着 */`);
// Show the shared load above six caryatids and the seventh wooden support.
h=replace(h,"/* 修复台：一张长桌、几片纸、一盏台灯",`G.mod.painter('hall.loadbeam', function(ctx,prop,scene){
    const v=V(scene), y=prop.baseY-102;
    ctx.save();ctx.fillStyle='#a29886';ctx.fillRect(138,y,328,13);
    if(v.sag){const left=v.sagSide==='stone'?138:360;ctx.fillStyle='#665c4e';ctx.fillRect(left,y+13,106,v.sag*12);}
    ctx.strokeStyle='#d4c9b5';ctx.strokeRect(138,y,328,13);ctx.restore();
  });
  /* 修复台：一张长桌、几片纸、一盏台灯`);
h=replace(h,"/* 外来构件：齿轮 + 铅灌铁销 */",`/* Clock face and native wooden housing remain together after correction. */
    ctx.fillStyle='#e9dfc6';ctx.beginPath();ctx.arc(x,y-s*1.16,s*.62,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#4a3b26';ctx.lineWidth=1;
    for(let k=0;k<12;k++){const a=k*Math.PI/6;ctx.beginPath();ctx.moveTo(x+Math.sin(a)*s*.46,y-s*1.16-Math.cos(a)*s*.46);ctx.lineTo(x+Math.sin(a)*s*.55,y-s*1.16-Math.cos(a)*s*.55);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(x,y-s*1.55);ctx.lineTo(x,y-s*1.16);ctx.lineTo(x+s*.3,y-s*.98);ctx.stroke();
    /* 外来构件：齿轮 + 铅灌铁销 */`);
h=replace(h,"for (let i = 0; i < 3; i++) ctx.fillRect(x - s + 3 + i * 9, y + 5, 6, 2);",`if(verdict === 'fusion'){
        ctx.fillStyle='#9cbec6';ctx.fillRect(x-s+3,y+4,s-5,2);
        ctx.fillStyle='#8b6738';ctx.fillRect(x+2,y+4,s-5,2);
        ctx.strokeStyle='#346c53';ctx.beginPath();ctx.moveTo(x+s-8,y+7);ctx.lineTo(x+s-5,y+9);ctx.lineTo(x+s-1,y+3);ctx.stroke();
      } else for (let i = 0; i < 3; i++) ctx.fillRect(x - s + 3 + i * 9, y + 5, 6, 2);`);
const start=h.indexOf("    if (signed) {",h.indexOf("G.mod.painter('hall.terminal'"));
const end=h.indexOf("    ctx.globalAlpha = 0.85;",start);
if(start<0||end<0)throw Error('terminal boundaries missing');
h=h.slice(0,start)+`    /* A lit nine-cell sandbox exists before signing. Signing approves sources. */
    ctx.globalAlpha=.75;ctx.strokeStyle='#7c929e';ctx.lineWidth=1;
    for(let row=0;row<3;row++)for(let col=0;col<3;col++)ctx.strokeRect(x-57+col*38,y-91+row*23,35,20);
    if(v.keepWhat){
      const colors=['#d8b26a','#9cbec6','#c99587'];
      for(let i=0;i<3;i++){
        const col=v.keepWhat==='acropolis_axis'?1:i;
        ctx.fillStyle=colors[i];ctx.fillRect(x-53+col*38,y-86+i*23,24,10);
      }
    }
    if(signed){ctx.strokeStyle='#ffd479';ctx.beginPath();ctx.moveTo(x+28,y-26);ctx.lineTo(x+36,y-20);ctx.lineTo(x+51,y-35);ctx.stroke();}
`+h.slice(end);
h=replace(h,"ctx.fillStyle = signed ? '#16343a' : '#101a1e';","ctx.fillStyle = signed ? '#16343a' : '#173039';");
h=replace(h,"  /* 树丛（御花园，opt: n / size） */",`  G.mod.painter('mentor.diotima', function(ctx,prop,scene){
    ctx.save();ctx.translate(prop.x,prop.baseY==null?prop.y:prop.baseY);ctx.scale(.16,.16);
    G.mod.paint('portrait.diotima',ctx,{w:240,h:360},scene);ctx.restore();
  });
  /* 树丛（御花园，opt: n / size） */`);
h=replace(h,"      const text = q.text || '';",`      /* A short physical stem connects each label to its exhibit. */
      ctx.globalAlpha=.8;ctx.strokeStyle='#81725c';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(px,py+4);ctx.lineTo(px,py+15);ctx.stroke();
      ctx.fillStyle='#655c50';ctx.fillRect(px-10,py+14,20,3);
      const text = q.text || '';`);
h=replace(h,"  /* 树丛（御花园，opt: n / size） */",`  /* Physical comparison models on the terrace, each resting on a plinth. */
  G.mod.painter('hall.references',function(ctx,prop,scene){
    const v=V(scene);if(v.layerImages===0)return;
    const y=prop.baseY;ctx.save();ctx.globalAlpha=v.layerStones===1?.45:.85;
    ctx.fillStyle='#7a807b';ctx.fillRect(110,y,140,7);ctx.fillRect(394,y,136,7);
    ctx.fillStyle='#b2c0bd';ctx.strokeStyle='#718c96';ctx.lineWidth=2;
    /* East pediment: actual triangular gable and column supports. */
    ctx.beginPath();ctx.moveTo(114,y-44);ctx.lineTo(180,y-78);ctx.lineTo(246,y-44);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillRect(116,y-44,128,8);
    for(let i=0;i<6;i++){ctx.fillRect(124+i*21,y-36,7,36);ctx.fillRect(121+i*21,y-39,13,4);}
    /* Caryatid porch: six human silhouettes support the entablature. */
    ctx.fillRect(396,y-60,132,9);
    for(let i=0;i<6;i++){
      const x=406+i*22;ctx.beginPath();ctx.arc(x,y-43,5,0,Math.PI*2);ctx.fill();
      ctx.fillRect(x-7,y-53,14,5);ctx.beginPath();ctx.moveTo(x-5,y-37);ctx.lineTo(x+5,y-37);ctx.lineTo(x+8,y);ctx.lineTo(x-8,y);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#788f93';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-33);ctx.lineTo(x,y-4);ctx.stroke();
    }
    ctx.restore();
  });
  /* 树丛（御花园，opt: n / size） */`);
fs.writeFileSync('js/art/halls.js',h);
console.log('Applied six map layouts and art state fixes. Run syntax, reachability and browser checks before claiming success.');
