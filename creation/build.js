const fs=require('node:fs'),path=require('node:path'),root=__dirname;
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const catalog=Object.fromEntries(JSON.parse(read('packages/catalog.json')).packages.map(id=>[id,JSON.parse(read('packages/'+id+'/manifest.json'))]));
let core=read('../athens-city-v2.0.0/js/core.js').replace("const KEY = 'athens.city.save.v1';","const KEY = 'wanxiang.fusion.explore.engine.v7';");
core=core.replace("window.addEventListener('keydown', (e) => {","window.addEventListener('keydown', (e) => {\n        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;");
let greek=read('../athens-city-v2.0.0/js/art.js');const a=greek.indexOf('    // back wall between columns'),b=greek.indexOf('    // entablature:',a);if(a<0||b<0)throw Error('神庙背墙适配失效');const wall=greek.slice(a,b);greek=greek.slice(0,a)+greek.slice(b);greek=greek.replace('    const colTop = stylo - opts.columnH;','    const colTop = stylo - opts.columnH;\n'+wall);
// 三角山墙的凹面使用三角形，避免原矩形阴影越出斜屋面。
const oldRecess='r(c, cx - halfW * 0.72, pBase - opts.pedH * 0.55, halfW * 1.44, opts.pedH * 0.55 - 1, A.pal.marbleShade);';
if(!greek.includes(oldRecess))throw Error('卫城山墙阴影适配失效');
greek=greek.replace(oldRecess,'c.fillStyle = A.pal.marbleShade;\n      c.beginPath(); c.moveTo(cx - halfW * 0.72, pBase - 2); c.lineTo(cx, pBase - opts.pedH * 0.72); c.lineTo(cx + halfW * 0.72, pBase - 2); c.closePath(); c.fill();');
// v0.10 采用独立的故宫绘景修正版：旧源码的屋顶逐行宽度插值方向相反，
// 会让屋脊比屋檐更宽。只在本版本内修正，避免静默改动队友的旧场景包。
let palaceArt=read('../zijincheng-tiehuo-v1.0.0/forbidden-city/js/art.js');
const oldRoofFormula='halfW * (1 - 0.62 * Math.pow(t, 0.78))';
const fixedRoofFormula='halfW * (0.38 + 0.62 * Math.pow(t, 0.78))';
if(!palaceArt.includes(oldRoofFormula)) throw Error('故宫屋顶公式未找到，停止构建以避免回归');
palaceArt=palaceArt.replace(oldRoofFormula,fixedRoofFormula);
// 原函数的屋檐/屋脊也取反了行号；只改坡面仍会留下悬空的宽屋脊。
for(const [before,after] of [
 ['const w0 = rows[0][0];','const w0 = rows[h - 1][0];'],
 ['const topHalf = rows[h - 1][0];','const topHalf = rows[0][0];'],
 ['c.fillRect(cx - w0 + 2, baseY - h + 3, w0 * 2 - 4, 1);','const sheenHalf = rows[Math.min(3, h - 1)][0];\n    c.fillRect(cx - sheenHalf + 2, baseY - h + 3, Math.max(0, sheenHalf * 2 - 4), 1);']
]){if(!palaceArt.includes(before))throw Error('故宫屋顶行号适配失效');palaceArt=palaceArt.replace(before,after);}
const palace='window.FusionPalace=Object.create(window.G);\n'+palaceArt.replace('const G = window.G;','const G = window.FusionPalace;');
const script=s=>'<script>\n'+s.replaceAll('</script','<\\/script')+'\n</script>';
const example=fs.existsSync(path.join(root,'assets/ai-example.json'))?JSON.parse(read('assets/ai-example.json')):null;
const skills=JSON.parse(read('skills/catalog.json'));
const artworkSample=JSON.parse(read('assets/artwork-sample.json'));
for(const key of ['source','result'])artworkSample[key]='data:image/png;base64,'+fs.readFileSync(path.join(root,artworkSample[key])).toString('base64');
const sources=[core,greek,palace,read('../athens-city-v2.0.0/js/world.js'),'window.WanxiangSkills='+JSON.stringify(skills)+';window.WanxiangPackages='+JSON.stringify(catalog)+';window.FusionArtworkSamples='+JSON.stringify([artworkSample])+';window.WanxiangAIExample='+JSON.stringify(example)+';',read('src/spec.js'),read('src/renderers.js'),read('src/building-cards.js'),read('src/athens-life.js'),read('src/palace-life.js'),read('src/game.js'),read('src/art-styles.js'),read('src/artwork.js'),'window.WanxiangDistribution=document.documentElement.outerHTML;'];
const artworkUI=read('src/artwork-ui.html').replace(/<img id="thumb-(jade|ink|paper)"/g,(m,k)=>m+' src="data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'assets/medium-ref-'+k+'.jpg')).toString('base64')+'"');
const html=read('src/ui.html').replace('<title>万象灵境 · 让想象成境</title>','<title>万象灵境 · 空间的相遇 v0.10</title>').replace('/* ORIGINAL_CSS */',()=>read('../athens-city-v2.0.0/styles.css')).replace('<!-- ARTWORK_UI -->',()=>artworkUI).replace('<!-- SCRIPTS -->',()=>sources.map(script).join('\n'));
fs.writeFileSync(path.join(root,'index.html'),html);console.log('v0.10 已构建：双场景 / 文化技能与区域编排 / 单文件作品分发');
module.exports={html,catalog};
