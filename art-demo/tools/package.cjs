// Offline and full-project ZIPs with explicit allowlists; no local credentials.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const python=process.env.WANXIANG_PYTHON || (process.platform==='win32'?'python':'python3');
const result=spawnSync(python,['-c',[
 'from pathlib import Path',
 'from zipfile import ZipFile, ZIP_DEFLATED',
 'root=Path.cwd()',
 "target=root/'dist'/'wanxiang-art-demo-v0.5-art.1-offline.zip'",
 'target.parent.mkdir(exist_ok=True)',
 "files=['index.html','启动离线试玩.bat','启动.md','改进说明.md']",
 'with ZipFile(target, "w", ZIP_DEFLATED) as archive:',
 '    for name in files: archive.write(root/name,name)',
 'with ZipFile(target) as archive:',
 '    assert archive.testzip() is None',
 '    assert archive.namelist()==files',
 '    assert archive.read("index.html")== (root/"index.html").read_bytes()',
 'print(target.name)',
 "full=root/'dist'/'wanxiang-art-demo-v0.5-art.1-full.zip'",
 "root_files=['index.html','README.md','启动.md','Image接入-队友先读.md','改进说明.md','启动离线试玩.bat','启动AI绘景.bat','停止AI绘景.bat','launch-ai.ps1','stop-ai.ps1','serve_ai.py','requirements-ai.txt','build.js','verify.cjs','.gitignore','.gitattributes']",
 "folder_types={'src':{'.js','.html'},'assets':{'.png','.jpg','.json','.txt'},'vendor':{'.js','.css'},'docs':{'.md'},'tools':{'.py','.cjs','.md'},'.github':{'.yml'}}",
 'entries=[root/name for name in root_files]',
 'for folder, suffixes in folder_types.items():',
 '    entries.extend(p for p in (root/folder).rglob("*") if p.is_file() and p.suffix in suffixes and "__pycache__" not in p.parts)',
 'with ZipFile(full, "w", ZIP_DEFLATED) as archive:',
 '    for item in sorted(entries): archive.write(item, "wanxiang-art-demo/"+item.relative_to(root).as_posix())',
 'with ZipFile(full) as archive:',
 '    assert archive.testzip() is None',
 '    for item in entries: assert archive.read("wanxiang-art-demo/"+item.relative_to(root).as_posix()) == item.read_bytes()',
 '    assert len(archive.namelist())==len(set(archive.namelist()))',
 'print(full.name)',
].join('\n')],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});
if(result.error) console.error('Python 3 required; set WANXIANG_PYTHON if needed.');
process.exit(result.status ?? 1);
