const fs=require('node:fs'),path=require('node:path'),root=__dirname;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let core=read('vendor/athens/js/core.js').replace("const KEY = 'athens.city.save.v1';","const KEY = 'wanxiang.fusion.explore.engine.art1';");
core=core.replace("window.addEventListener('keydown', (e) => {","window.addEventListener('keydown', (e) => {\n        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;");
let greek=read('vendor/athens/js/art.js');
const a=greek.indexOf('    // back wall between columns'),b=greek.indexOf('    // entablature:',a);
if(a<0||b<0)throw new Error('请检查神庙背墙适配');const wall=greek.slice(a,b);greek=greek.slice(0,a)+greek.slice(b);greek=greek.replace('    const colTop = stylo - opts.columnH;','    const colTop = stylo - opts.columnH;\n'+wall);
const palace="window.FusionPalace=Object.create(window.G);\n"+read('vendor/forbidden-city/js/art.js').replace('const G = window.G;','const G = window.FusionPalace;');
const script=s=>'<script>\n'+s.replaceAll('</script','<\\/script')+'\n</script>';
const samples=JSON.parse(read('assets/samples.json'));
for(const s of samples){s.source='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/source.png')).toString('base64');s.result='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/result-'+s.scene.style+'.png')).toString('base64');s.thumbnail='data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets/thumb-'+s.scene.style+'.jpg')).toString('base64');}
const scripts=[core,greek,palace,read('vendor/athens/js/world.js'),read('src/spec.js'),read('src/game.js'),read('src/art-styles.js'),'window.FusionArtworkSamples='+JSON.stringify(samples)+';',read('src/artwork.js')].map(script).join('\n');
let html=read('src/ui.html').replace('<title>万象灵境 · 让想象成境</title>','<title>万象灵境 · 同境异笔 v0.5-art.1</title>').replace('/* ORIGINAL_CSS */',()=>read('vendor/athens/styles.css')).replace('<!-- ARTWORK_UI -->',()=>read('src/artwork-ui.html')).replace('<!-- SCRIPTS -->',()=>scripts);
fs.writeFileSync(path.join(root,'index.html'),html,'utf8');console.log('v0.5-art.1 已构建：实景像素画卷＋AI实景转绘，单文件离线样例。');
