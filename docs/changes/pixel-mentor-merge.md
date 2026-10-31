# 导师像素画与主线合并核验

范围：合并 upstream/main 到 chore/repo-normalize；午门保留640×620紧凑地图、出生576、地面410..620与导师，同时加入上游石狮、华表、铜缸和边缘松树。离线网页从最终源码生成。

导师三个入口：js/portraits.js 的 P.draw('mentor')、P.chibi('mentor')；js/art/portraits.js 的 portrait.diotima。地图 mentor.diotima 通过0.16倍包装复用全身。所有导师绘制均用整数 fillRect 与逐行扫描椭圆，保留现代学者深蓝西装、眼镜、长裤和研究夹。

核验：

- `node --check js/portraits.js`、`node --check js/art/portraits.js`：语法。
- `node tools/check-modules.mjs`：合并后地图7/画笔39（含新增台面）/玩法17/过场3/文案194。
- 第二关新增 hall.terrace.deck：台面y330..454、前缘y454..470连续；排序deck329 < palace330 < terrace470。上游屋顶修复已合入，实际A.roof验证屋脊行宽184 < 檐口行宽540，避免倒置。
- `node tools/check-interaction.mjs`：实际Chrome键盘W/E、暂停恢复、已完成午门继续、导师头像、微软雅黑、第二关两次结果驻留1.6秒后E继续、过场姓名均通过，无浏览器异常。
- 导师绘制独立VM使用只接受save/restore/translate/scale/fillRect的Canvas代理执行半身/标题/全身，scale=[0.5,1,2,3]，t=[0,1.25,100]共36种组合，所有局部矩形均为整数。地图y与baseY两入口也已执行。

局限：非整数场景缩放依然由浏览器栅格化；上述检查证明无光滑曲线路径，不代表人工美术验收。旧测试tools/test.mjs仍包含废弃标题按钮断言，未用其作为本次验证依据。
