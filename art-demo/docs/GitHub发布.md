# GitHub 发布与更新

## 首次准备

安装 Git、官方 GitHub CLI 和 Node.js。发布离线 ZIP 还需 Python 3。运行 `gh auth login --hostname github.com --git-protocol https --web`，在浏览器完成本人授权；用 `gh auth status` 查看连接，不要把 Token 写进仓库。

本机本次采用可移植 GitHub CLI，保存在 `D:\codex_config\github-cli\v2.103.3\bin\gh.exe`，认证配置独立保存在 `D:\codex_config\github-cli\config`。使用时设置 `GH_CONFIG_DIR` 指向该目录；这些配置不随仓库分发。其他队友可直接使用自己正常安装并登录的 `gh`。

## 更新 Demo

```sh
node build.js
node verify.cjs
python -m py_compile serve_ai.py tools/image-api/generate.py
node tools/package.cjs
git status --short
git add .
git commit -m "Update demo"
git push origin main
```

Windows 的打包脚本若找不到 Python，可先把 `WANXIANG_PYTHON` 设置为 python.exe 的完整路径。提交前确认没有认证文件、环境变量值、`.local-renders`、日志和个人生成结果。默认 ignore 已排除这些常见路径，但仍需检查实际提交清单。

仓库的 Actions 会重建页面、运行现有检查、校验构建产物一致性，并生成可下载的离线包；不调用付费图片 API。首次运行以 GitHub 上的实际结果为准。

## 发布给队友

创建新的版本标签及 Release，附上 `dist/` 的离线 ZIP。队友下载、解压、双击 `index.html`。README、启动.md 和交互文档应随功能一起更新。

不要重复覆盖其他开发线或旧标签。GitHub 仓库地址用于源码与下载；本版本没有自动配置网页托管，`127.0.0.1` 链接也不能远程分享。在线成图需要每位使用者自己的本机后端与认证。
