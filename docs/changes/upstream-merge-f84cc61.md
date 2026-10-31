# 继续同步 upstream/main f84cc61

继 0bd7475 整合 9db0953 后，同步上游新增的六关选关、午门指引及创造模式新标签页。

## 冲突处理及修复

- 午门完整保留紧凑地图数据，仅新增 enterTip；离线 web.html 从源码重新生成。
- 菜单进入选关时调用私有 menu.close()，释放菜单覆盖层；选关期间 isWorldPaused 返回真。
- 标题 Enter / Space 均打开选关，避免旧新游戏入口重置存档；M 在模块地图中打开选关。
- 继续游戏按注册地图查找恢复，覆盖六关和 create；保留旧 fusion/gugong/beijing 分支。
- 创造完成消息使用消息来源窗口，存储事件携带作品包；核对作品 seed 与 worldId 一致，允许补全先前只有 ID 的记录。弹窗受阻时直接使用 iframe。

## 可复现验证和作用域

命令：`node --check js/main.js`、`node --check js/core.js`、`node --check data/maps/wumen.js`、`node tools/build-web.mjs`、`node tools/check-modules.mjs`。

独立只读审查执行实际函数切片的 VM：菜单关闭后 open=false/depth=0；六关加 create 均恢复坐标123,456；旧路线维持原分支；Enter/Space 只打开选关；A/B 两标签页不会串作品；storage 携带作品、空记录补全、错误 seed 拒绝、异源消息拒绝、弹窗受阻进入 iframe；子页向 storage/opener 发送匹配作品；选关暂停释放。

VM 验证覆盖上述状态分支，不代表真实浏览器已验证跨标签消息投递和弹窗策略。没有主观美术结论。上游引入文件的两处尾随空格未作无关修改。

真实按键回归：`$env:PORT='18123'; node serve.js`，另一个终端执行 `$env:APP='http://127.0.0.1:18123/?map=wumen'; node tools/check-interaction.mjs`。默认8123在当前机器报 listen EACCES，验证使用18123。Chrome 在沙箱内无法启动调试端口，需可运行浏览器的环境。此前自动操作曾在太和淡入时提前行走，实际停在入场对话而非牌子；测试增加淡入等待与牌子距离断言，结果以最新运行输出为准。
