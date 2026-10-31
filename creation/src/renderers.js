(() => {
 'use strict';const G=window.G,A=G.art,C=window.FusionPalace.art;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 function line(c,pts,col,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 function star(c,x,y,r=2,col='#f6d28d'){rect(c,x-r,y,r*2+1,1,col);rect(c,x,y-r,1,r*2+1,col);}
 const THEMES={mineral:{sky:'#193b4c',floor:'#969a7e',path:'#c2b89a',edge:'#e0d3ad',water:'#285b70',glow:'#d8bb81'},warm:{sky:'#684d50',floor:'#a19776',path:'#d6bc8d',edge:'#f5d6a5',water:'#496c78',glow:'#ffd393'},ink:{sky:'#3b5359',floor:'#85978d',path:'#c5c8b4',edge:'#e0dfcd',water:'#496a73',glow:'#d9dcc0'}};
 function fusion(c,x,y,w,s){const step=w/9;rect(c,x-w/2,y-5,w,11,'#8b9083');rect(c,x-w/2-5,y+5,w+10,5,'#d9cfb1');rect(c,x-w/2+8,y-66,w-16,60,'#334d50');for(let i=0;i<8;i++){const dx=x-w/2+step*(i+1);A.column(c,dx,y-6,56,8,{});rect(c,dx-10,y-78,20,9,'#4b7771');star(c,dx,y-77,1,'#e2c98d');}rect(c,x-w/2-4,y-80,w+8,15,'#893f31');C.roof(c,x,y-80,w/2+18,28,null,{ornaments:3});rect(c,x-w*.38,y-111,w*.76,12,'#8b4031');C.roof(c,x,y-110,w*.4+12,29,null,{ornaments:3});if(s?.flags.echo)line(c,[[x-w/2,y+15],[x+w/2,y+15]],'#b3ddd1',2);}
 function longWing(c,p,night){
  const {x,y,w,length}=p,top=y-length,side=p.facing==='east'?1:-1;
  rect(c,x-w/2-6,top-3,w+12,length+11,'#d0b991');
  rect(c,x-w/2,top,w,length,'#713d32');
  // Plan-view longitudinal ridge; posts remain upright in the screen projection.
  for(let j=0;j<length;j+=23){const px=x+side*(w/2-5);rect(c,px-3,top+j+7,6,16,'#b86342');rect(c,px-5,top+j+5,10,3,'#e0b67a');if(night)star(c,px+side*9,top+j+13,2,'#ffdc8e');}
  for(let i=-w/2;i<=w/2;i+=2){const edge=Math.abs(i)/(w/2),offset=Math.round(edge*9);rect(c,x+i,top-17+offset,2,length-8, i<0?'#c8a255':'#9a773e');}
  for(let j=0;j<length-12;j+=7)line(c,[[x-w/2,top-8+j],[x,top-17+j],[x+w/2,top-8+j]],'#eed18a66');
  rect(c,x-2,top-20,5,length-5,'#edd08a');rect(c,x-w/2-3,y-17,w+6,4,'#d2ab5e');
 }
 function landmark(c,p,night,s){const{x,y,kind}=p,w=p.w||230;c.save();
  if(s&&!s.capturingArtwork&&Math.abs(s.player.x-x)<w/2+12&&s.player.y<y&&s.player.y>y-150)c.globalAlpha=.3;
  if(kind==='gate'){C.drawGate(c,x,y,w,{wallH:48,roofH:25,double:true,arches:3,name:''});rect(c,x-29,y-30,58,30,'#273b3c');rect(c,x-23,y-27,46,27,'#777e6b');rect(c,x-23,y-8,46,8,'#b6ac8e');line(c,[[x-29,y],[x-29,y-31],[x+29,y-31],[x+29,y]],'#dccb9c',2);}
  else if(kind==='long-wing')longWing(c,p,night);
  else if(kind==='hall'||kind==='wing')C.drawHall(c,x,y,w,{wallH:kind==='wing'?36:52,roofH:kind==='wing'?20:32,double:kind==='hall',bays:kind==='hall'?9:5,lanterns:night});
  else if(kind==='fusion')fusion(c,x,y,w,s);
  else A.drawTemple(c,x,y,w,{columns:kind==='temple'?8:6,columnH:kind==='stoa'?38:62,columnW:kind==='temple'?9:7,entH:12,pedH:kind==='stoa'?12:28});c.restore();
 }
 function paving(c,r,t){rect(c,r.x,r.y,r.w,r.h,t.floor);for(let y=r.y;y<r.y+r.h;y+=18){rect(c,r.x,y,r.w,1,'#494c3b30');for(let x=r.x+(Math.floor(y/18)%2)*17;x<r.x+r.w;x+=34)rect(c,x,y,1,18,'#494c3b22');}c.strokeStyle=t.edge+'66';c.lineWidth=2;c.strokeRect(r.x+8,r.y+8,r.w-16,r.h-16);}
 function ground(c,s){const l=s.spec.layout,t=s.theme;rect(c,0,0,l.width,l.height,t.sky);
  for(let i=0;i<16;i++){const y=40+(i*83)%1250;rect(c,(i*127)%1300,y,240,13,'#d0dbcc0d');rect(c,(i*127+30)%1300,y-6,120,7,'#d0dbcc0a');}
  if(s.isNight){c.fillStyle='#e2d7b5';c.beginPath();c.arc(1290,115,33,0,G.TAU);c.fill();for(let i=0;i<60;i++)star(c,80+i*67%1370,40+i*37%1250,1,'#b5d0c133');}
  for(const r of [...l.regions,...l.connections]){rect(c,r.x-6,r.y+12,r.w+12,r.h+16,'#253d41');rect(c,r.x-3,r.y+5,r.w+6,r.h+14,'#5b7068');}
  for(const r of [...l.regions,...l.connections])paving(c,r,t);
  const g=l.regions.find(r=>r.id==='garden');rect(c,g.x+12,g.y+12,g.w-24,g.h-24,'#527467');
  for(const r of[{x:g.x+22,y:g.y+34,w:58,h:g.h-68},{x:g.x+g.w-80,y:g.y+34,w:58,h:g.h-68},{x:g.x+22,y:g.y+34,w:g.w-44,h:58},{x:g.x+22,y:g.y+g.h-92,w:g.w-44,h:58}])paving(c,r,t);
  const p=l.pond;rect(c,p.x-5,p.y-5,p.w+10,p.h+10,'#c1bb9e');rect(c,p.x,p.y,p.w,p.h,t.water);for(let i=0;i<28;i++)rect(c,p.x+8+(i*37)%(p.w-25),p.y+8+(i*23)%(p.h-16),12,1,'#a8c5bd55');
  for(const r of l.connections.filter(r=>r.id.includes('upper')||r.id==='threshold'))for(let y=r.y+12;y<r.y+r.h-7;y+=7)line(c,[[r.x+5,y],[r.x+r.w-5,y]],'#e0d6b377',1);
  for(const o of l.obstacles.filter(o=>o.kind==='wall')){rect(c,o.x,o.y-20,o.w,28,'#8a4637');rect(c,o.x-2,o.y-24,o.w+4,5,'#c29b64');}
  const main=l.regions.find(r=>r.id==='inner');c.strokeStyle='#d7bf8866';c.lineWidth=2;c.strokeRect(main.x+85,main.y+85,main.w-170,main.h-130);c.beginPath();c.arc(main.x+main.w/2,main.y+main.h*.63,35,0,G.TAU);c.stroke();
 }
 // Fit the complete composition, not only the landmark's nominal width.
 function fitRect(sourceW,sourceH,box){const scale=Math.min(box.w/sourceW,box.h/sourceH);return{x:box.x+(box.w-sourceW*scale)/2,y:box.y+(box.h-sourceH*scale)/2,w:sourceW*scale,h:sourceH*scale,scale};}
 function borrowedView(c,s,box){
  const fit=fitRect(260,160,box),delta=s.frameAngle-s.spec.layout.frameTarget;
  c.save();c.beginPath();c.rect(box.x,box.y,box.w,box.h);c.clip();rect(c,box.x,box.y,box.w,box.h,s.theme.sky);
  c.translate(fit.x,fit.y);c.scale(fit.scale,fit.scale);
  for(let i=0;i<4;i++)rect(c,i*75-25,125-i*7,120,60,'#486965');
  landmark(c,{kind:s.spec.packages.includes('acropolis')?'temple':'hall',x:130+delta*3,y:140,w:150},s.isNight);
  c.restore();return fit;
 }
 function frame(c,n,s){const enabled=s.spec.plan.skills.includes('borrowed-view');rect(c,n.x-39,n.y-27,78,7,'#8a4937');rect(c,n.x-35,n.y-67,6,45,'#aa7450');rect(c,n.x+29,n.y-67,6,45,'#aa7450');if(enabled){
  // Render content first; the frame stays on top and the entire saved view fits inside.
  borrowedView(c,s,{x:n.x-27,y:n.y-61,w:54,h:34});rect(c,n.x-39,n.y-70,78,7,'#bfa77d');
  if(s.flags.axis){line(c,[[n.x-27,n.y-61],[n.x+27,n.y-61]],'#e9d39c',1);}
 }else line(c,[[n.x-30,n.y-65],[n.x+30,n.y-65]],'#c4ba97',3);star(c,n.x,n.y-76,3,s.flags.axis?'#ffe0a1':'#95c2bf');}
 window.WanxiangRender={rect,line,star,landmark,ground,frame,borrowedView,fitRect,THEMES};
})();
