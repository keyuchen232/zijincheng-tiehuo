// Whitelisted distribution: two scene packages, two fusion hosts, self-contained HTML.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
require('./compile-example.cjs');require('./build.js');
const ids=JSON.parse(read('packages/catalog.json')).packages;
const catalog=Object.fromEntries(ids.map(id=>[id,JSON.parse(read('packages/'+id+'/manifest.json'))]));
const env={window:{WanxiangPackages:catalog,WanxiangSkills:JSON.parse(read('skills/catalog.json'))}};vm.createContext(env);vm.runInContext(read('src/spec.js'),env);const S=env.window.FusionSpec;
const html=read('index.html'),out=path.join(root,'发布'),records=[];fs.mkdirSync(out,{recursive:true});
function write(p,s){const f=path.join(out,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);}
const names={palace:'故宫',acropolis:'雅典卫城'};
for(const a of [['palace'],['acropolis'],['palace','acropolis']])for(const host of a){
 const label=a.map(id=>names[id]).join(' × ')+' / '+names[host]+'骨架',folder=(a.length===1?'单场景包/':'融合包/')+a.join('+')+'--'+host;
 const prompt=host==='palace'?'以故宫门院为骨架，保留门院递进、两翼呼应和开敞主院，侧庭可回游；'+(a.length===2?'白石神庙':'后殿重檐')+'从窗中借见。月夜灯火与脚步回声留在庭院。':'以卫城错落台地为骨架，庙宇错位、周边留白，保留绕行和斜向观看，'+(a.length===2?'让红檐与柱列在开敞平台相遇。':'让神庙与柱廊在开敞平台错落呼应。')+'落日照亮石阶。';
 const world=S.derive(prompt,a,S.localPlan(prompt,a,host));if(!S.validate(world))throw Error(label+' invalid');
 const artifact={schema:'wanxiang.playable-package',version:2,world,initial:{motif:world.plan.motif,rhythm:'ascending',frameAngle:0},note:'本地文化规则编译；从全新试玩进度开始，不含密钥；内嵌明确标记的故宫 AI 转绘样例。'};
 const boot=JSON.stringify(artifact).replaceAll('<','\\u003c');
 write(folder+'/web.html',html.replace(/(<script id="boot-world" type="application\/json">)[\s\S]*?(<\/script>)/,(m,s,e)=>s+boot+e));
 write(folder+'/world.json',JSON.stringify(artifact,null,2));
 write(folder+'/文化技能/catalog.json',JSON.stringify(Object.fromEntries(world.plan.skills.map(k=>[k,S.skills[k]])),null,2));
 for(const k of world.plan.skills)write(folder+'/文化技能/'+k+'/SKILL.md',read('skills/'+k+'/SKILL.md'));
 for(const id of a)write(folder+'/场景资料/'+id+'.json',JSON.stringify(catalog[id],null,2));
 write(folder+'/交互.md',read('交互.md'));
 write(folder+'/启动.md',`# ${label}\n\n完整解压后双击 web.html，使用 Edge / Chrome。无需 Node、Python 或密钥。\n\nWASD / 方向键移动，Shift 快走，E 互动，J 文化手记，P 作品。先在侧庭取景或在柱廊踩响声石（次序不限），然后回中央共创台选意象，到上方观景台正式定格。声石可选辅助，不限时。\n\n「享」导出可玩 HTML；「包」导出 JSON。导入保留作品选择，从新进度开始。像素画卷可离线保存；实时 AI 编排和非像素转绘须回完整开发工程启动本机服务并使用接收者自己的认证。这个独立包不自带在线 AI。创作不影响主线结局，无视频。\n\n含故宫时提供门院/廊庑/木作文化卡、宫门/主殿/廊庑建筑插画与木片拼合；含雅典时提供山门/神庙/柱廊插画卡、两位虚构角色与柱式观察拼合。融合包按实际建筑放置两种文化内容。点击「访」快速阅读和体验，靠近人物、图记或观察案按 E。默认少量互动，可在「创」中按提示词或互动下拉框排除。小游戏可退出或辅助，不影响主线门槛；小灯与石模纳入画卷和分享，完成进度重置。取景后完整远景等比缩小进入图窗。详细接口见交互.md。\n`);
 records.push({id:a.join('+')+'--'+host,packages:a,primary:host,label,folder,html:folder+'/web.html',worldId:world.seed});
}
write('web.html',html);write('交互.md',read('交互.md'));write('启动.md',read('启动.md'));
write('组合清单.json',JSON.stringify({schema:'wanxiang.release',version:'0.10',uniqueCombinations:3,playablePackages:4,packages:records},null,2));
const cards=records.map(r=>`<a href="${r.html}"><b>${r.label}</b><span>${catalog[r.primary].summary}</span></a>`).join('');
write('主页.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>万象灵境 · 文化空间工坊</title><style>body{margin:0;background:#132329;color:#e6dcc4;font:16px/1.8 system-ui}main{max-width:1040px;margin:auto;padding:5vw}h1{font:40px Georgia,serif;letter-spacing:.12em}p,small{color:#a4b9b7}a{color:inherit;text-decoration:none;display:block;border:1px solid #6a8275;padding:22px;background:#1c3035}a:hover{border-color:#e2c58c}a b,a span{display:block}a span{font-size:13px;color:#9fb8b6;margin-top:10px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.hero{margin:28px 0;background:#594a30}</style><main><small>万象灵境 · 独立创作 v0.10</small><h1>文化有规则，空间有性格</h1><p>门庭递进与错落台地，两种观看方式在同一座境中相遇。选择文化技能，探索、取景、用脚步留下一段回声，再把相遇定格成画。</p><a class="hero" href="web.html"><b>进入自由创作 →</b><span>只保留故宫与雅典卫城。离线规则可直接玩；实时 AI 需要完整工程和本机服务。</span></a><div class="grid">${cards}</div><p>2 个单场景包 + 2 个融合骨架版本，3 种组合。合集不含认证信息，不参与主线结局。非历史复原，无视频。</p></main></html>`);
const bundledPython=path.join(process.env.USERPROFILE||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python=process.env.WANXIANG_PYTHON||(fs.existsSync(bundledPython)?bundledPython:'python');
cp.execFileSync(python,['-c',String.raw`
import json,pathlib,sys,zipfile
out=pathlib.Path(sys.argv[1]);records=json.loads((out/'组合清单.json').read_text(encoding='utf-8'))['packages']
allfiles=[out/n for n in ['主页.html','web.html','启动.md','交互.md','组合清单.json']]
for r in records:
 folder=out/r['folder'];files=[folder/n for n in ['web.html','world.json','启动.md','交互.md']]+list((folder/'场景资料').glob('*.json'))+list((folder/'文化技能').rglob('*.*'))
 dest=out/'单独压缩包'/(r['id']+'.zip');dest.parent.mkdir(exist_ok=True)
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
  for f in files:z.write(f,f.relative_to(folder))
 allfiles.extend(files)
with zipfile.ZipFile(out/'万象灵境-v0.10-双场景试玩合集.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in allfiles:z.write(f,f.relative_to(out))
print('ZIP: 4 scene/fusion packages + 1 collection')
`,out],{stdio:'inherit'});
console.log('v0.10 流水线完成：两个单场景、两个融合骨架版本。');
