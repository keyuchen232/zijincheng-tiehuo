# 可选：本机图片转绘

离线试玩无需本节。本版保留已经使用的 Codex imagegen CLI 桥接，不把 API 密钥、个人配置或技能程序放进仓库。

## 所需环境

1. Python 3.11+，安装 SDK：`python -m pip install -r requirements-ai.txt`（在仓库根目录执行）。
2. 本机已经安装 imagegen 技能，存在 `$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py`。未设置 CODEX_HOME 时默认使用用户目录的 `.codex`。
3. 该目录中的 `config.toml` 已设置 `model_provider`，对应 `model_providers` 项包含 `base_url` 和 `env_key`。把实际认证值设置到 env_key 指定的本机环境变量中，勿发给队友、勿提交到 GitHub。
4. 服务商支持当前配置的 `gpt-image-2` 图片编辑接口、quality=medium 及 1040×896 / 1280×720 输出。此仓库不保证所有兼容聊天接口的服务商都支持图片。

本仓库不要求队友安装 Codex 才能试玩。在线转绘才需要上述既有桥接环境；没有该技能时，可以导出原图与提示词、外部生成后导入。

Windows 可设置 `WANXIANG_PYTHON` 指向自己的 python.exe，然后双击根目录 AI 启动脚本。服务只监听 127.0.0.1:8319。命令行可运行 `python serve_ai.py`。

## 单独调用与诊断

```sh
python tools/image-api/generate.py --image assets/source.png --prompt-file assets/prompt-jade.txt --out .local-renders/test.png --size 1040x896 --quality medium --dry-run
```

`--dry-run` 不生成图片；实际生成需移除此参数，可能计费。不自动重试。任务原图、请求、结果与日志存放 `.local-renders/`，由 .gitignore 排除，不随作品分发。

上层服务仅暴露页面与两条 API，不开放本机配置或任务存档。GitHub Pages 等静态托管无法运行这个 Python 后端。
