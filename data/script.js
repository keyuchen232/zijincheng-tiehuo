/* 自动生成，请勿手改。源文件 data/script.json，生成命令 node tools/build-data.mjs */
window.WXL_SCRIPT = {
 "$schema": "wxl.script.v1",
 "meta": {
  "game": "万象灵境",
  "subtitle": "故宫 × 雅典卫城 · 一次双向校准",
  "version": "0.4",
  "updated": "2026-10-31",
  "locale": "zh-CN",
  "owner": "主线剧情",
  "theme": "AI 让创作可以天马行空；对传统的理解与敬畏，让想象有值得延续的根。",
  "nodeOrder": [
   "wumen",
   "taihe",
   "qianqing",
   "repair_bench",
   "creator",
   "shenwumen"
  ],
  "guideChain": [
   {
    "step": "遇到失配",
    "node": "wumen",
    "how": "两套网格差一砖。玩家先分清哪一层在动、哪一层不该动，并留下疑问：哪些才是真正的错误。"
   },
   {
    "step": "体验传统设计",
    "node": "taihe",
    "how": "从门洞到月台要上三段台阶、抬一次头。关掉图像层再看一遍，同一处景致前后两样。"
   },
   {
    "step": "理解其价值",
    "node": "qianqing",
    "how": "木头与石头各自只接受一种对待方式。能比的是功能，不是谁更先进。"
   },
   {
    "step": "主动选择保留",
    "node": "taihe",
    "how": "「走近—抬头」这处空间关系要不要写进造境规则，由玩家自己决定，三种选择都成立。"
   },
   {
    "step": "发现真实融合",
    "node": "repair_bench",
    "how": "系统把带外来构件的清代广钟判为「错误混入」，建议移除。玩家改判为有据可查的历史融合。"
   },
   {
    "step": "带着理解自由创造",
    "node": "creator",
    "how": "创造入口交接保留项；出门时交代借鉴了什么、保留了什么、新造了什么。"
   }
  ],
  "notes": [
   "节点 id 与 docs/剧情更新.md 一致：wumen / taihe / qianqing / repair_bench / creator / shenwumen",
   "所有对白行形如 { who, text, pause?, when? }，who 取值见 characters",
   "when 是给引擎用的分支标记，文案作者不需要理解它的实现",
   "needsVerify: true 表示该条史实待核对，见 docs/关卡设计.md §10",
   "v0.4：接入 docs/主题思想补充与修订_v0.3.md 的引导链；新增 repair_bench.relic（结尾反转）与 taihe.labels.keep（主动选择保留）",
   "边界：外来器物的存在不自动等于融合；不写故宫与卫城的直接传承；虚构机关为当代创作，不冒充史实"
  ]
 },
 "characters": {
  "diotima": {
   "name": "狄奥提玛",
   "full": "Διοτίμα",
   "role": "雅典学者 · 研究《会饮篇》",
   "color": "#cbb283",
   "note": "直接、克制、偶尔刻薄。承认自己也会错，但不轻易承认。"
  },
  "player": {
   "name": "你",
   "role": "故宫数字孪生项目 · 学生",
   "note": "全程只有几处内心独白，其余靠交互选项表达。"
  },
  "narrator": {
   "name": "",
   "note": "场景提示，不显示说话人名字。"
  },
  "system": {
   "name": "系统",
   "note": "自动标注与处置建议的界面，永远说得很确定。"
  }
 },
 "ui": {
  "title": {
   "logo": "万象灵境",
   "eyebrow": "文化试验场 · 故宫 × 雅典卫城",
   "subtitle": "两套建筑语言，在同一张沙盘上互相校准。",
   "footer": "故宫 · 卫城 · 每一条比较都写明出处"
  },
  "buttons": {
   "enter": "进入万象灵境",
   "continue": "继续",
   "restart": "重新开始",
   "back": "返回",
   "retry": "再试一次",
   "skip": "跳过",
   "close": "关闭",
   "share": "保存校准记录",
   "copy": "复制",
   "hint": "给我一点提示",
   "confirm": "确定",
   "cancel": "取消",
   "next": "下一步",
   "keep": "保留",
   "remove": "移除",
   "note": "先记下"
  },
  "hud": {
   "progress": "校准 {done} / {total}",
   "cards": "来源卡 {got} / {total}",
   "stamps": "未成立 {n}",
   "nodeLabel": "{index} · {name}",
   "interact": "查看",
   "look": "观察 {name}",
   "talk": "交谈",
   "relic": "待处置 {n}"
  },
  "panel": {
   "objectTitle": "观察",
   "cardTitle": "来源卡",
   "cardClaim": "可以说什么",
   "cardNotClaim": "不声称什么",
   "cardLayer": "比较层面",
   "cardRefs": "出处",
   "cardPending": "此卡待核对，暂不出示结论。",
   "codexTitle": "图鉴",
   "codexEmpty": "还没有记下什么。",
   "albumTitle": "校准记录",
   "judgeTitle": "你的判定",
   "judgeEvidence": "可指认的依据"
  },
  "toast": {
   "saved": "已保存",
   "copied": "已复制",
   "cardObtained": "获得来源卡 · {name}",
   "stampObtained": "获得印章 · 未成立",
   "wrong": "再看看。",
   "cantUse": "现在还用不上。",
   "again": "再试一次。",
   "judged": "判定已更新",
   "kept": "已记入造境规则"
  }
 },
 "chapters": [
  {
   "id": "wumen",
   "index": 1,
   "name": "午门",
   "sub": "原点之争"
  },
  {
   "id": "taihe",
   "index": 2,
   "name": "太和殿",
   "sub": "标签归位"
  },
  {
   "id": "qianqing",
   "index": 3,
   "name": "乾清宫",
   "sub": "承重实验"
  },
  {
   "id": "repair_bench",
   "index": 4,
   "name": "修复台",
   "sub": "证据链 · 反转"
  },
  {
   "id": "creator",
   "index": 5,
   "name": "御花园",
   "sub": "共同造境"
  },
  {
   "id": "shenwumen",
   "index": 6,
   "name": "神武门",
   "sub": "亲手完成"
  }
 ],
 "nodes": {
  "wumen": {
   "name": "午门",
   "sub": "原点之争",
   "objective": "把卫城投影的坐标系贴到故宫沙盘上，让两套网格共用同一个原点。先分清哪一层在动。",
   "enter": [
    {
     "who": "narrator",
     "text": "午门广场。两套网格叠在地上，一套金的，一套青灰的。"
    },
    {
     "who": "narrator",
     "text": "青灰的那套，偏了大约一砖。"
    },
    {
     "who": "diotima",
     "text": "抱歉。我把卫城的数据包接进了你的沙盘，想让它看起来完整一点。"
    },
    {
     "who": "diotima",
     "text": "先把一件事说清楚：两套东西出现在同一块地上，本身不算错。"
    },
    {
     "who": "diotima",
     "text": "错的是——有人替它们写了不成立的关系。"
    },
    {
     "who": "diotima",
     "text": "所以别急着夸它好看。告诉我：哪一层在动？"
    }
   ],
   "hint": "选一个原点，两套网格会自己贴上去。"
  },
  "taihe": {
   "name": "太和殿",
   "sub": "标签归位",
   "objective": "把被投影盖错的说明牌放回原位；然后决定：这处空间关系要不要写进你自己的造境规则。",
   "enter": [
    {
     "who": "narrator",
     "text": "太和殿月台。三块说明牌悬在半空，谁都不在自己的位置上。"
    },
    {
     "who": "narrator",
     "text": "从门洞走到这儿，你要上三段台阶，视线才第一次正对殿身。"
    },
    {
     "who": "diotima",
     "text": "先别动牌子。站在这儿，看一眼。"
    },
    {
     "who": "diotima",
     "text": "你们把「走近—抬头—看见」写进了石头里。这段路是被人安排过的。"
    },
    {
     "who": "diotima",
     "text": "我的数据一进来，牌子就乱了。可乱的是标签，不是这段路。"
    },
    {
     "who": "diotima",
     "text": "三块牌子，两块被我盖错了。还有一块——本来就没错。"
    },
    {
     "who": "diotima",
     "text": "别急着点。先看清楚它属于哪一层。"
    }
   ],
   "hint": "石作、图像、标签，是三件不同的事。"
  },
  "qianqing": {
   "name": "乾清宫",
   "sub": "承重实验",
   "objective": "判断投影里那根被换掉的柱子能不能撑住檐部；弄清木头与石头各自接受什么。",
   "enter": [
    {
     "who": "narrator",
     "text": "乾清宫前。六根少女托着檐部，第七根，是你们的木柱。"
    },
    {
     "who": "narrator",
     "text": "风过去，檐口轻轻往下沉了一点。"
    },
    {
     "who": "diotima",
     "text": "六根少女替你扛着屋檐。第七根……是你们的柱子。"
    },
    {
     "who": "diotima",
     "text": "你说，它撑得住吗？"
    },
    {
     "who": "diotima",
     "text": "顺便一句：这个院子里的等级，我不打算替你辩护。"
    },
    {
     "who": "diotima",
     "text": "我要你带走的是它的做法——怎么把两块木头接成一根不会散的东西。"
    }
   ],
   "hint": "换一种连接方式，再加载一次。"
  },
  "repair_bench": {
   "name": "修复台",
   "sub": "证据链 · 反转",
   "objective": "把线索接到来源卡上，写明你比较的是哪个层面；然后处置系统判定的那件「异常」。",
   "enter": [
    {
     "who": "narrator",
     "text": "修复台。左边四张线索，右边三张来源卡，中间一块空白。"
    },
    {
     "who": "diotima",
     "text": "三条线索，三张卡。"
    },
    {
     "who": "diotima",
     "text": "还有一条……我故意放进去的。"
    },
    {
     "who": "narrator",
     "text": "台面角落里，系统推了一条待处置记录过来。"
    },
    {
     "who": "system",
     "text": "R-07 待处置 · 检出外来机械构件 · 判定：错误混入 · 建议：移除后恢复本土形制。"
    },
    {
     "who": "diotima",
     "text": "这条我还没看。先把线接完。"
    }
   ],
   "hint": "有些线索，接不上才是对的。"
  },
  "creator": {
   "name": "御花园",
   "sub": "共同造境",
   "objective": "用三件组件拼出自己的空间，审掉方案里那处来源错误，并写下你要保留什么。",
   "enter": [
    {
     "who": "narrator",
     "text": "御花园。创作终端亮着，沙盘空着，等你放第一件东西。"
    },
    {
     "who": "diotima",
     "text": "现在轮到你造一个了。"
    },
    {
     "who": "diotima",
     "text": "刚才体验到的设计里，你想保留什么？在这个基础上，你又想创造怎样的新世界？"
    },
    {
     "who": "diotima",
     "text": "我先给个方案。别全信我。"
    },
    {
     "who": "diotima",
     "text": "我一开始也以为对齐就是校准。"
    }
   ],
   "hint": "方案里有一样东西，来源标错了。"
  },
  "shenwumen": {
   "name": "神武门",
   "sub": "亲手完成",
   "objective": "走进自己造的空间，配对两条线索打开出口；出门时交代你借鉴了什么、保留了什么、新造了什么。",
   "enter": [
    {
     "who": "narrator",
     "text": "神武门。你造的空间从这里开始。"
    },
    {
     "who": "diotima",
     "text": "你自己写的规则。你自己走一遍。"
    }
   ],
   "hint": "出口认的不是人，是规则。"
  }
 },
 "puzzles": {
  "wumen.registration": {
   "prompt": "选择原点：",
   "options": [
    {
     "id": "A",
     "label": "午门门洞中心",
     "desc": "故宫中轴的原点。整座宫城从这里算起。"
    },
    {
     "id": "B",
     "label": "太和殿月台中心",
     "desc": "看起来最像'中心'的地方。"
    },
    {
     "id": "C",
     "label": "投影自身的中心",
     "desc": "让两套网格完全重合的那个点。"
    }
   ],
   "outcome": {
    "A": [
     {
      "who": "narrator",
      "text": "卫城网格平移到故宫网格上，贴住了。"
     },
     {
      "who": "narrator",
      "text": "故宫的网格一格都没动。"
     },
     {
      "who": "diotima",
      "text": "好。你没动它。"
     },
     {
      "who": "diotima",
      "text": "在雅典我们管这叫配准。在你们这儿它叫什么不重要。"
     },
     {
      "who": "diotima",
      "text": "重要的是你刚才没做的事。"
     },
     {
      "who": "player",
      "text": "它没动。动的是另一套。"
     },
     {
      "who": "diotima",
      "text": "接下来你会看到很多被盖错的东西。"
     },
     {
      "who": "diotima",
      "text": "但不是每一样都需要被搬走。学着分辨。"
     }
    ],
    "B": [
     {
      "who": "narrator",
      "text": "两套网格一起滑了一段。月台和大殿，错开了。"
     },
     {
      "who": "narrator",
      "text": "砖缝乱了。"
     },
     {
      "who": "diotima",
      "text": "中心不是一个点，是一个关系。"
     },
     {
      "who": "diotima",
      "text": "再选一次。"
     }
    ],
    "C": [
     {
      "who": "narrator",
      "text": "两套网格严丝合缝。看上去，完美。"
     },
     {
      "who": "narrator",
      "text": "但故宫的网格整体被拖走了三十个像素。"
     },
     {
      "who": "narrator",
      "text": "门钉的间距，歪了。"
     },
     {
      "who": "diotima",
      "text": "……你移动的是故宫。"
     },
     {
      "who": "diotima",
      "text": "为了让两套东西对上，你挪了自己。"
     },
     {
      "who": "diotima",
      "text": "这不是校准。"
     }
    ]
   },
   "hint1": "别管格子对不对齐。看一眼门钉。",
   "hint2": "门钉的间距应该是一样的。它们现在一样吗？"
  },
  "taihe.labels": {
   "prompt": "三块牌子。先点一块，再点它该去的位置。",
   "layers": [
    {
     "id": "stone",
     "label": "石作",
     "desc": "看得见摸得着的那一层。"
    },
    {
     "id": "image",
     "label": "图像",
     "desc": "投影打上来的那一层，半透明。"
    },
    {
     "id": "label",
     "label": "标签",
     "desc": "写字的那一层，悬空，最不可靠。"
    }
   ],
   "plaques": [
    {
     "id": "p1",
     "text": "帕特农东山墙",
     "from": "月台栏杆上",
     "to": "投影位置",
     "correct": true,
     "desc": "它压在一段汉白玉栏杆上，可栏杆是故宫的。"
    },
    {
     "id": "p2",
     "text": "伊瑞克提翁女像柱廊",
     "from": "殿身斗拱下",
     "to": "西侧柱廊",
     "correct": true,
     "desc": "六个少女的影子和斗拱挤在一起，谁都看不清。"
    },
    {
     "id": "p3",
     "text": "故宫太和殿月台",
     "from": "一块石雕上",
     "to": "不动",
     "correct": false,
     "desc": "它看起来最刺眼——可那块雕饰，本来就是故宫的。"
    }
   ],
   "wrongPlaced": [
    {
     "who": "narrator",
     "text": "牌子被挪开，底下露出一行乱码。"
    },
    {
     "who": "diotima",
     "text": "那块是你们自己的石头。"
    },
    {
     "who": "diotima",
     "text": "它只是长得像我带来的东西。"
    }
   ],
   "layerReveal": [
    {
     "who": "narrator",
     "text": "关掉图像层。栏杆上什么都没有。"
    },
    {
     "who": "narrator",
     "text": "雕饰是实的，投影是虚的。它们从来不是一回事。"
    }
   ],
   "success": [
    {
     "who": "narrator",
     "text": "三块牌子各归各位。乱码停了。"
    },
    {
     "who": "diotima",
     "text": "你一动手，先问的是'这属于谁'。"
    },
    {
     "who": "diotima",
     "text": "现在再问第二句：为什么会走成这个样子？"
    },
    {
     "who": "narrator",
     "text": "你回头看那段台阶。三折，一抬头，正对殿身。"
    },
    {
     "who": "diotima",
     "text": "你刚才做的不是把外来的东西清出去。"
    },
    {
     "who": "diotima",
     "text": "是把关系写回它该在的地方。"
    },
    {
     "who": "diotima",
     "text": "这段路，值得你带走。"
    },
    {
     "who": "player",
     "text": "错的是标签，不是另一套东西本身。"
    }
   ],
   "wrongHint": "先关掉图像层再看一次。",
   "keepPuzzle": "taihe.keep"
  },
  "taihe.keep": {
   "prompt": "这处空间关系，要写进你的造境规则吗？",
   "body": [
    {
     "who": "diotima",
     "text": "从门洞到月台：三段台阶，一次抬头。你已经知道它是被安排出来的。"
    },
    {
     "who": "diotima",
     "text": "你可以把它带走，也可以只记下来。没有标准答案。"
    }
   ],
   "options": [
    {
     "id": "keep",
     "label": "保留这段关系",
     "desc": "写进规则：造境时，走近与抬头要发生在同一个方向上。"
    },
    {
     "id": "note",
     "label": "先记下，待核",
     "desc": "不写进规则，只存进图鉴，之后还能回来改。"
    },
    {
     "id": "drop",
     "label": "不要",
     "desc": "你觉得自己造的空间不需要这段安排。"
    }
   ],
   "outcome": {
    "keep": [
     {
      "who": "diotima",
      "text": "好。那它跟着你走。"
     },
     {
      "who": "narrator",
      "text": "已记入造境规则 · 保留关系：走近与抬头同向。"
     }
    ],
    "note": [
     {
      "who": "diotima",
      "text": "记下来也算数。"
     },
     {
      "who": "narrator",
      "text": "已存入图鉴 · 保留关系（未启用）。"
     }
    ],
    "drop": [
     {
      "who": "diotima",
      "text": "可以。你自己造的空间，你说了算。"
     },
     {
      "who": "diotima",
      "text": "只是别忘了刚才为什么会抬头。"
     }
    ]
   },
   "applied": [
    {
     "who": "narrator",
     "text": "「走近—抬头」已写进造境规则。"
    }
   ]
  },
  "qianqing.loadtest": {
   "prompt": "选择连接方式，然后加载。",
   "materials": [
    {
     "id": "stone",
     "label": "石柱（女像柱）",
     "desc": "大理石。受得住压，受不住剪。"
    },
    {
     "id": "wood",
     "label": "木柱（故宫）",
     "desc": "会胀，会缩，会咬合。"
    }
   ],
   "methods": [
    {
     "id": "tenon",
     "label": "榫卯",
     "desc": "转一个角度，对准卯口插进去。"
    },
    {
     "id": "dowel",
     "label": "铅灌铁销",
     "desc": "两块石头之间打一根铁销，灌铅封住。"
    },
    {
     "id": "dry",
     "label": "直接叠压",
     "desc": "什么都不加，靠自重和摩擦。"
    }
   ],
   "outcome": {
    "stone": {
     "tenon": {
      "ok": false,
      "lines": [
       {
        "who": "narrator",
        "text": "卯口在石材上崩开一道缝。"
       },
       {
        "who": "narrator",
        "text": "檐部塌了半边。"
       },
       {
        "who": "diotima",
        "text": "石头不会因为你喜欢榫卯，就接受榫卯。"
       }
      ]
     },
     "dowel": {
      "ok": true,
      "lines": [
       {
        "who": "narrator",
        "text": "铁销吃进两个石面，铅把缝隙封死。"
       },
       {
        "who": "narrator",
        "text": "檐口回正。"
       }
      ]
     },
     "dry": {
      "ok": true,
      "lines": [
       {
        "who": "narrator",
        "text": "石头压着石头，什么都没加。"
       },
       {
        "who": "narrator",
        "text": "它站住了。石头本来就能这样站。"
       }
      ]
     }
    },
    "wood": {
     "tenon": {
      "ok": true,
      "lines": [
       {
        "who": "narrator",
        "text": "榫头吃进卯口，越压越紧。"
       },
       {
        "who": "narrator",
        "text": "檐口回正。"
       }
      ]
     },
     "dowel": {
      "ok": false,
      "lines": [
       {
        "who": "narrator",
        "text": "木头胀了，把铁销顶松。"
       },
       {
        "who": "narrator",
        "text": "柱头开始歪。"
       },
       {
        "who": "diotima",
        "text": "它会呼吸。你的铁不会。"
       }
      ]
     },
     "dry": {
      "ok": false,
      "lines": [
       {
        "who": "narrator",
        "text": "柱头在梁下打滑。"
       },
       {
        "who": "narrator",
        "text": "整排柱子往一边让了半步。"
       }
      ]
     }
    }
   },
   "conclusion": [
    {
     "who": "diotima",
     "text": "它们各自只接受一种对待。"
    },
    {
     "who": "diotima",
     "text": "这不是谁更先进。"
    },
    {
     "who": "diotima",
     "text": "你以为我们不用连接件？帕特农的石块之间，是铁销加铅灌。"
    },
    {
     "who": "diotima",
     "text": "这一步别信我。回去查。"
    },
    {
     "who": "diotima",
     "text": "一件东西好看，往往是因为做它的人知道手里的材料会怎么动。"
    }
   ],
   "allDone": [
    {
     "who": "narrator",
     "text": "檐部稳住。六位少女继续托着它。"
    },
    {
     "who": "diotima",
     "text": "你看，能比的是功能，不是谁替代谁。"
    },
    {
     "who": "diotima",
     "text": "榫卯这一手我建议你带走。它比外形难学，也比外形耐用。"
    }
   ],
   "hint": "榫卯在石头上试一次，再用同样的办法在木头上试一次。"
  },
  "repair_bench.evidence": {
   "prompt": "把线索接到来源卡上。每条线都要说明你比较的是哪个层面。",
   "layers": [
    {
     "id": "function",
     "label": "功能可比",
     "desc": "两件东西解决的是同一类问题。"
    },
    {
     "id": "spatial",
     "label": "空间观念对照",
     "desc": "两套建筑对'正面''秩序'的理解。"
    },
    {
     "id": "boundary",
     "label": "间接传播边界",
     "desc": "有中介，但只能证明方向，不能证明对应。"
    }
   ],
   "clues": [
    {
     "id": "c_gable",
     "text": "帕特农东山墙的标签被改成了「太和殿山花」",
     "detail": "两块三角形的山花，都朝着正面，都在讲一个故事。",
     "answerCard": "sc_sequence",
     "answerLayer": "spatial",
     "explain": "它们处理的是同一种观看秩序：正面、中轴、仰视。这叫空间观念对照。"
    },
    {
     "id": "c_banquet",
     "text": "瓶画上的宴饮场面，和《韩熙载夜宴图》",
     "detail": "都是躺着、坐着、有人伺候、有人看。",
     "answerCard": "sc_banquet",
     "answerLayer": "function",
     "explain": "两幅画都在用宴饮组织人物和视线。这是功能可比，不是谁影响了谁。"
    },
    {
     "id": "c_plate",
     "text": "靖远鎏金银盘上的酒神图像",
     "detail": "希腊的神，出现在中国甘肃的一只盘子上。",
     "answerCard": "sc_boundary",
     "answerLayer": "boundary",
     "explain": "它能证明有中介、有传播。它不能证明这两件作品直接相连。"
    },
    {
     "id": "c_bait",
     "text": "女像柱的柱础纹样，和故宫柱础几乎一样",
     "detail": "放大看，确实很像。",
     "answerCard": null,
     "answerLayer": null,
     "isBait": true,
     "explain": "相似不等于同源。这里没有年代链，也没有工艺链。这条不成立。"
    }
   ],
   "wrongLink": [
    {
     "who": "narrator",
     "text": "线接上去了，卡却从台面上漂走。"
    },
    {
     "who": "diotima",
     "text": "这条线不成立。"
    },
    {
     "who": "diotima",
     "text": "但你给了它一个不存在的证据。"
    }
   ],
   "baitLinked": [
    {
     "who": "narrator",
     "text": "修复台上裂开一道细纹。"
    },
    {
     "who": "diotima",
     "text": "摸上去是像的。"
    },
    {
     "who": "diotima",
     "text": "可它撑不住一条结论。"
    }
   ],
   "baitLeftBlank": [
    {
     "who": "narrator",
     "text": "那张卡被留在原处，盖上了一个章。"
    },
    {
     "who": "narrator",
     "text": "未成立。"
    },
    {
     "who": "diotima",
     "text": "……你把它留下了。"
    },
    {
     "who": "diotima",
     "text": "大部分人会硬连一条线，好让画面完整。"
    },
    {
     "who": "diotima",
     "text": "我年轻的时候也硬连过。"
    },
    {
     "who": "player",
     "text": "这里本来就没有东西可以连。"
    }
   ],
   "success": [
    {
     "who": "narrator",
     "text": "三条线，三个层面。"
    },
    {
     "who": "narrator",
     "text": "留白的那一格，也记进了校准记录。"
    },
    {
     "who": "diotima",
     "text": "一份能给别人复核的比较，才算比较。"
    },
    {
     "who": "diotima",
     "text": "现在去看系统留给你的那一条。"
    }
   ],
   "hint": "有一条线索，你不需要给它找卡。"
  },
  "repair_bench.relic": {
   "prompt": "系统给出了处置建议。你的判定是：",
   "systemVerdict": "错误混入",
   "case": {
    "id": "R-07",
    "name": "铜镀金珐琅转花活动人物钟",
    "era": "清乾隆",
    "desc": "通体铜镀金，嵌透明珐琅与彩色玻璃花。底层乐箱以塔轮、发条带动，正面水法转动，两侧为风景油画；中层门可自动开启，内有活动人物；上层是钟盘。",
    "line": "高 78 厘米 · 宽 39 厘米 · 厚 26.6 厘米 · 故宫博物院藏 · 文物号 故00183132"
   },
   "systemLines": [
    {
     "who": "system",
     "text": "检出外来机械构件：塔轮 · 发条 · 透明珐琅。"
    },
    {
     "who": "system",
     "text": "与本土工艺不一致。判定：错误混入。建议：移除后恢复本土形制。"
    }
   ],
   "evidence": [
    {
     "id": "e1",
     "label": "能指认的外来部分",
     "text": "塔轮（源于法文 fusee）、发条、透明珐琅，都是欧洲传入的机械与工艺。透明珐琅清代只在广州烧，又叫广珐琅。"
    },
    {
     "id": "e2",
     "label": "能指认的本土部分",
     "text": "水法、转花、跑人、乐箱与楼阁式外壳，是广州工匠按宫廷陈设另做的一套东西。"
    },
    {
     "id": "e3",
     "label": "能指认的改造关系",
     "text": "西洋机芯装进中国式外壳：除了报时，还要能演景、能听乐。技术被改写成另一种用法。"
    }
   ],
   "deepen": [
    {
     "who": "narrator",
     "text": "你翻开第三条线索：广钟的机芯、珐琅与外壳，来自三个不同的手艺圈。"
    },
    {
     "who": "narrator",
     "text": "它们不是被拼在一起，是被改成了一件能一起动的东西。"
    },
    {
     "who": "diotima",
     "text": "外来件本身不是错。错在有没有写下它被吸收、又被改成了什么。"
    }
   ],
   "options": [
    {
     "id": "A",
     "label": "按建议移除：拆掉外来机械构件",
     "desc": "恢复「本土形制」，让藏品回到单一起源。"
    },
    {
     "id": "B",
     "label": "改判：有据可查的历史融合，保留全件与完整说明",
     "desc": "把「错误混入」改成「吸收与再创造」，来源照写。"
    },
    {
     "id": "C",
     "label": "改判：本土原创，删去外来工艺的说明",
     "desc": "不写外来记录，只写中国工匠的成就。"
    }
   ],
   "outcome": {
    "A": [
     {
      "who": "narrator",
      "text": "机芯被拆走。钟壳还在，指针不再动。"
     },
     {
      "who": "narrator",
      "text": "水法停了，乐箱空了。它变成一只很漂亮的箱子。"
     },
     {
      "who": "diotima",
      "text": "我们要修复的是错误，不是抹去交流。"
     },
     {
      "who": "diotima",
      "text": "你把它修干净了。可它原来的样子，是有人做过选择的样子。"
     },
     {
      "who": "system",
      "text": "处置完成。来源记录已简化。"
     }
    ],
    "B": [
     {
      "who": "narrator",
      "text": "你把判定从「错误混入」改成「有据可查的历史融合」。"
     },
     {
      "who": "narrator",
      "text": "来源照写：机芯技术来自欧洲，外壳、水法、转花与乐箱由广州工匠改造。"
     },
     {
      "who": "narrator",
      "text": "藏品留在原处，说明牌上每一行都能被复核。"
     },
     {
      "who": "system",
      "text": "判定已更新。此件不再列为异常。"
     },
     {
      "who": "diotima",
      "text": "你要修的从来不是外来件。"
     },
     {
      "who": "diotima",
      "text": "是那个把「不干净」当成结论的判断。"
     },
     {
      "who": "diotima",
      "text": "我们要修复的是错误，不是抹去交流。"
     },
     {
      "who": "diotima",
      "text": "今天珍惜的传统里，也有前人曾经大胆的创造。"
     },
     {
      "who": "player",
      "text": "它没有被清干净。它被写清楚了。"
     }
    ],
    "C": [
     {
      "who": "narrator",
      "text": "外来工艺的记录被删掉，说明牌上只剩「本土制作」。"
     },
     {
      "who": "diotima",
      "text": "这样写，读起来更痛快。"
     },
     {
      "who": "diotima",
      "text": "但它不是真的。"
     },
     {
      "who": "diotima",
      "text": "把吸收藏起来，和把交流当成污染，是同一种错。"
     },
     {
      "who": "system",
      "text": "标签已更新。待复核。"
     }
    ]
   },
   "afterRight": [
    {
     "who": "diotima",
     "text": "记住这一下的手感：你刚才改的不是文物，是一个判断。"
    },
    {
     "who": "diotima",
     "text": "系统会给建议。签字的人是你们。"
    }
   ],
   "hints": [
    "先问一句：外来的部分，能不能指认出来？本土的部分，能不能指认出来？",
    "能指认「怎么被吸收、又被改成了什么」，才叫融合。只凭「里面有外来的东西」不足以下判断。"
   ]
  },
  "creator.review": {
   "prompt": "选三件组件，或者让我替你选。然后审一遍方案。",
   "rules": [
    "至少一件故宫组件、一件卫城组件、一件你自己的。",
    "选了「故宫中轴」，殿身就不能离开轴线。",
    "来源卡只能用卡册里已有的。",
    "不打分：不看风格占比，也不看文化纯度。只看来源写没写对、你自己定的关系有没有被破坏。"
   ],
   "violations": [
    {
     "id": "v_lineage",
     "label": "声称了不存在的传承",
     "desc": "方案把一件外来的东西，写成了本地原有。"
    },
    {
     "id": "v_rule",
     "label": "违反了保留关系",
     "desc": "方案自己破了自己定的规矩。"
    },
    {
     "id": "v_source",
     "label": "引用了不存在的来源",
     "desc": "卡册里没有这张卡。"
    },
    {
     "id": "v_layer",
     "label": "层面越界",
     "desc": "把'功能可比'写成了'直接传入'。"
    }
   ],
   "plan": {
    "title": "月台与六位少女",
    "oneLine": "把卫城的柱廊搬上月台，让屋檐由六位少女托起。",
    "why": "殿身保留中轴，柱廊提供正面的节奏。",
    "placements": [
     {
      "slot": "c",
      "componentId": "gugong_hall",
      "tag": "gugong",
      "label": "太和殿式殿身"
     },
     {
      "slot": "w",
      "componentId": "acropolis_caryatid",
      "tag": "gugong",
      "label": "伊瑞克提翁女像柱廊"
     },
     {
      "slot": "s",
      "componentId": "palace_lantern",
      "tag": "personal",
      "label": "宫灯"
     }
    ],
    "wrongTag": "w",
    "note": "女像柱被标成了「故宫参考」——这是不存在的传承。"
   },
   "planFromAI": [
    {
     "who": "diotima",
     "text": "我给了你一个方案。三件东西，一个轴线。"
    },
    {
     "who": "diotima",
     "text": "看起来能成立。你看一眼。"
    }
   ],
   "wrongAccuse": [
    {
     "who": "diotima",
     "text": "不是那儿。"
    },
    {
     "who": "diotima",
     "text": "再看一眼哪个标签写了来源。"
    }
   ],
   "rightAccuse": [
    {
     "who": "narrator",
     "text": "你把「故宫参考」的标签，改成了「卫城参考」。"
    },
    {
     "who": "diotima",
     "text": "……对。"
    },
    {
     "who": "diotima",
     "text": "是我把你们的东西，当成了我的注脚。"
    },
    {
     "who": "diotima",
     "text": "留住它。别改掉它，改掉来源就行。"
    },
    {
     "who": "narrator",
     "text": "女像柱留在月台上，标签换成了它真正的出处。"
    }
   ],
   "acceptedAnyway": [
    {
     "who": "diotima",
     "text": "可以。"
    },
    {
     "who": "diotima",
     "text": "但它会在门口等你。"
    }
   ],
   "regenerated": [
    {
     "who": "narrator",
     "text": "方案重算了一版。标签都落在了该落的地方。"
    },
    {
     "who": "diotima",
     "text": "这次我没法替你签字了。你签。"
    }
   ],
   "keepNote": [
    {
     "who": "diotima",
     "text": "记下来：你借鉴了什么，保留了什么，新造了什么。"
    },
    {
     "who": "diotima",
     "text": "出门的时候，那扇门会问你。"
    }
   ],
   "hint": "逐件看标签。来源写在标签上。"
  },
  "shenwumen.verify": {
   "prompt": "调查两条线索，完成配对，打开出口。",
   "nodeBlocked": [
    {
     "who": "narrator",
     "text": "出口的门框亮不起来。"
    },
    {
     "who": "diotima",
     "text": "这扇门是你自己画的。"
    },
    {
     "who": "diotima",
     "text": "它当然只认你自己的规则。"
    }
   ],
   "clueA": {
    "id": "clue_a",
    "text": "檐下的一组斗拱，被标成了「山花」",
    "detail": "标签和构件对不上。"
   },
   "clueB": {
    "id": "clue_b",
    "text": "柱廊上的第六位少女，脚下没有基座",
    "detail": "她悬着。"
   },
   "matchCorrect": [
    {
     "who": "narrator",
     "text": "两条线索咬合在一起，像一副榫卯。"
    },
    {
     "who": "narrator",
     "text": "门框亮了。"
    }
   ],
   "matchWrong": [
    {
     "who": "narrator",
     "text": "两条线索对不上。门没有反应。"
    }
   ],
   "doorOpen": [
    {
     "who": "narrator",
     "text": "神武门的出口，从门洞一路亮到屋脊。"
    },
    {
     "who": "diotima",
     "text": "记住这一下。"
    },
    {
     "who": "diotima",
     "text": "门亮，不是因为你在这里，是因为你写的规则在这里。"
    },
    {
     "who": "player",
     "text": "这扇门认的不是我，是我写下的规则。"
    },
    {
     "who": "diotima",
     "text": "出门之前，回答一句就好。"
    }
   ],
   "showcase": {
    "prompt": "出门之前，说清楚三件事：",
    "items": [
     {
      "id": "borrow",
      "label": "我借鉴了什么",
      "example": "例：卫城柱廊的正面节奏"
     },
     {
      "id": "keep",
      "label": "我保留了什么",
      "example": "例：走近与抬头同向的空间关系"
     },
     {
      "id": "new",
      "label": "我新造了什么",
      "example": "例：一条会随灯亮起来的门洞"
     }
    ],
    "done": [
     {
      "who": "narrator",
      "text": "门框上的光从门洞一路连到屋脊。"
     },
     {
      "who": "diotima",
      "text": "行了。你的东西，你说得清。"
     }
    ]
   },
   "hint": "回到创作终端，把没修的地方修掉，再进来一次。"
  }
 },
 "objects": [
  {
   "id": "obj_wumen_gate",
   "node": "wumen",
   "name": "午门门洞",
   "desc": "五个门洞，中间那个只有皇帝能走。今天它只是一个原点。",
   "interact": [
    {
     "who": "narrator",
     "text": "门钉排得很密。数一遍要花点时间，但值得数。"
    }
   ]
  },
  {
   "id": "obj_wumen_grid",
   "node": "wumen",
   "name": "叠印的网格",
   "desc": "金色的是故宫中轴，青灰色的是卫城轴线。两套都在，两套都还在争谁是原点。",
   "interact": [
    {
     "who": "narrator",
     "text": "两套网格都画到地上，谁也没让谁。"
    }
   ]
  },
  {
   "id": "obj_taihe_archive",
   "node": "taihe",
   "name": "故宫档案",
   "desc": "太和殿东庑的柜子。营缮司的旧档，纸都发脆了。",
   "interact": [
    {
     "who": "narrator",
     "text": "抽开抽屉，一股旧纸和樟脑的味道。"
    },
    {
     "who": "narrator",
     "text": "第一份档案到手：中轴、台基、斗拱的尺寸都在。"
    }
   ]
  },
  {
   "id": "obj_taihe_plaque",
   "node": "taihe",
   "name": "错位的说明牌",
   "desc": "三块。两块被投影盖错了，一块本来就没错。",
   "interact": [
    {
     "who": "narrator",
     "text": "牌子是铜的，背面刻着编号。"
    }
   ]
  },
  {
   "id": "obj_taihe_railing",
   "node": "taihe",
   "name": "汉白玉栏杆",
   "desc": "月台边上的栏杆。上面的雕饰是故宫自己的，只是长得像爱奥尼亚的涡卷。",
   "interact": [
    {
     "who": "narrator",
     "text": "雕得太深了，不像投影。投影落不下这么实的影子。"
    }
   ]
  },
  {
   "id": "obj_taihe_steps",
   "node": "taihe",
   "name": "三段台阶",
   "desc": "从门洞到月台，三段台阶，每上一段都要抬一次头。这段路是被安排过的。",
   "interact": [
    {
     "who": "narrator",
     "text": "站在第三段台阶中间往下看，整座广场都在你身后。"
    },
    {
     "who": "narrator",
     "text": "再抬头，殿身正好压在你视线的正中。"
    },
    {
     "who": "diotima",
     "text": "这不是巧合。这是图纸上量过的。"
    }
   ]
  },
  {
   "id": "obj_qianqing_caryatid",
   "node": "qianqing",
   "name": "女像柱廊投影",
   "desc": "六位少女，托着檐部。她们的重量是真的，她们的石头不是。",
   "interact": [
    {
     "who": "narrator",
     "text": "凑近看，衣褶里有一层极细的扫描线。那是投影。"
    }
   ]
  },
  {
   "id": "obj_qianqing_woodcol",
   "node": "qianqing",
   "name": "第七根柱子",
   "desc": "你们的木柱，被塞进了少女的队列里。",
   "interact": [
    {
     "who": "narrator",
     "text": "木头在慢慢胀。你能听见它。"
    }
   ]
  },
  {
   "id": "obj_bench_cards",
   "node": "repair_bench",
   "name": "空白记录",
   "desc": "一块什么都没写的板子。写上去的东西，要能被别人复核。",
   "interact": [
    {
     "who": "narrator",
     "text": "板子上有一道旧裂纹，不知道是谁留下的。"
    }
   ]
  },
  {
   "id": "obj_bench_stamp",
   "node": "repair_bench",
   "name": "「未成立」印章",
   "desc": "很少人用它。用了它，画面上就缺一块。",
   "interact": [
    {
     "who": "narrator",
     "text": "印泥是干的，说明它很久没被拿起来了。"
    }
   ]
  },
  {
   "id": "obj_bench_clock",
   "node": "repair_bench",
   "name": "待处置的座钟",
   "desc": "台面角落。系统给它挂了一条红标：错误混入，建议移除。",
   "interact": [
    {
     "who": "narrator",
     "text": "钟还在走。玻璃柱慢慢转，像一挂流水。"
    },
    {
     "who": "narrator",
     "text": "底层的乐箱里，发条绷着，等着下一次报时。"
    },
    {
     "who": "system",
     "text": "R-07 · 错误混入 · 待处置。"
    }
   ]
  },
  {
   "id": "obj_creator_terminal",
   "node": "creator",
   "name": "创作终端",
   "desc": "御花园里的那台。它只负责给方案，不负责签字。",
   "interact": [
    {
     "who": "narrator",
     "text": "屏幕上是一张空网格，九个格子。"
    }
   ]
  },
  {
   "id": "obj_creator_guide",
   "node": "creator",
   "name": "双语导览牌",
   "desc": "每块组件旁边都有一块小牌，写着它出自哪里。",
   "interact": [
    {
     "who": "narrator",
     "text": "牌子上留着一行空位，等着填来源卡编号。"
    }
   ]
  },
  {
   "id": "obj_shenwumen_door",
   "node": "shenwumen",
   "name": "神武门",
   "desc": "宫城的北门。出去就是景山。今天它是你作品的门。",
   "interact": [
    {
     "who": "narrator",
     "text": "门框上有一圈很细的光，还没连上。"
    }
   ]
  }
 ],
 "sourceCards": [
  {
   "id": "sc_axis",
   "kind": "map",
   "name": "故宫中轴 · 本体不动",
   "layer": "空间观念对照",
   "claim": "故宫的空间秩序以中轴为骨架，所有重要建筑都挂在同一条线上。",
   "notClaim": "不声称这与卫城的轴线有传承关系。两者是各自独立形成的空间观念。",
   "refs": [
    "第一关 · 午门配准"
   ],
   "needsVerify": false
  },
  {
   "id": "sc_banquet",
   "kind": "pair",
   "name": "宴饮图像 · 功能可比",
   "layer": "功能可比",
   "claim": "希腊瓶画与《韩熙载夜宴图》都用宴饮场面组织人物、视线与观看次序。",
   "notClaim": "不声称《韩熙载夜宴图》受到希腊瓶画影响，两者之间没有可证的传播链。",
   "refs": [
    "舞乐图瓶画器盖（约前 350–前 325）",
    "《韩熙载夜宴图》（五代）"
   ],
   "needsVerify": false
  },
  {
   "id": "sc_boundary",
   "kind": "boundary",
   "name": "传播有中介 · 不等于直接相连",
   "layer": "间接传播边界",
   "claim": "希腊图像因素经中亚—丝路进入中国物质文化，有实物中介可证。",
   "notClaim": "中介的存在不能证明任意两件具体作品直接相连；外来器物的存在也不自动等于融合，融合要有可指认的吸收与转化。",
   "refs": [
    "靖远鎏金金银盘（酒神／十二主神图像）",
    "西安隋墓陶骆驼驮囊「醉拂菻」"
   ],
   "needsVerify": true
  },
  {
   "id": "sc_sequence",
   "kind": "pair",
   "name": "山墙与月台 · 正面的秩序",
   "layer": "空间观念对照",
   "claim": "帕特农东山墙与太和殿月台都在处理「正面如何被观看」这件事。",
   "notClaim": "不声称帕特农的任何构件进入过故宫。投影叠印是虚构的叙事装置。",
   "refs": [
    "帕特农神庙东山墙",
    "太和殿月台 · 日晷 · 嘉量"
   ],
   "needsVerify": false
  },
  {
   "id": "sc_kore",
   "kind": "pair",
   "name": "科拉与陶女俑",
   "layer": "功能可比",
   "claim": "两者都是把「供养／陪伴」的人形放进建筑或墓葬语境。",
   "notClaim": "不声称二者同源。具体藏品号待核。",
   "refs": [
    "科拉雕像（约前 520–前 510）",
    "故宫藏唐陶女俑／北朝女供养人（藏品号待核）"
   ],
   "needsVerify": true
  },
  {
   "id": "sc_nike",
   "kind": "pair",
   "name": "胜利女神与月台序列",
   "layer": "空间观念对照",
   "claim": "两者都在入口—上升—仰望的动线里安排一个「被看见的高点」。",
   "notClaim": "不声称雅典娜胜利神庙与太和殿有任何建筑上的关联。",
   "refs": [
    "雅典娜胜利神庙",
    "太和殿 · 月台 · 日晷 · 嘉量序列"
   ],
   "needsVerify": true
  },
  {
   "id": "sc_guangzhong",
   "kind": "fusion",
   "name": "广钟 · 有据可查的历史融合",
   "layer": "吸收与再创造",
   "claim": "清乾隆时期，广州工匠把欧洲传入的塔轮、发条与透明珐琅工艺，做成能奏乐、能演景、能跑人的中国式座钟：技术被吸收，用法被改写。",
   "notClaim": "不声称这类钟与雅典卫城有任何直接关联；也不声称「含有外来构件」就等于融合——融合必须能指认吸收与转化的具体证据。",
   "refs": [
    "故宫博物院藏 · 铜镀金珐琅转花活动人物钟（清乾隆，故00183132）",
    "故宫博物院藏品页 https://www.dpm.org.cn/collection/clock/232081.html",
    "广东省博物馆「璀璨时光——清代广钟精品展」"
   ],
   "needsVerify": false
  }
 ],
 "codex": [
  {
   "id": "cx_register",
   "name": "配准",
   "desc": "把两套坐标系贴到一起。前提是先说清楚谁不动。"
  },
  {
   "id": "cx_layer",
   "name": "图层",
   "desc": "石作、图像、标签，是三件不同的事。判断之前先分层。"
  },
  {
   "id": "cx_tenon",
   "name": "榫卯",
   "desc": "木构的咬合方式。它靠材料的胀缩工作，换到石头上就会崩。"
  },
  {
   "id": "cx_dowel",
   "name": "铁销与铅灌",
   "desc": "古典希腊石构的固定方式。待核：具体做法与出处。"
  },
  {
   "id": "cx_caryatid",
   "name": "女像柱",
   "desc": "以人形替代柱身的承重构件。伊瑞克提翁神庙的那六位最出名。"
  },
  {
   "id": "cx_pediment",
   "name": "山墙",
   "desc": "坡屋顶两端的三角形正面。帕特农东山墙讲的是雅典娜的诞生。"
  },
  {
   "id": "cx_banquet",
   "name": "宴饮图像",
   "desc": "用一场宴席把人物、视线、权力关系摆在一张画里。"
  },
  {
   "id": "cx_mediator",
   "name": "传播中介",
   "desc": "让两件东西之间「看起来有关」的那条路。有路，不等于直达。"
  },
  {
   "id": "cx_preserve",
   "name": "保留关系",
   "desc": "造境时锁定的规则。你定的规则，会在出口那里考你。"
  },
  {
   "id": "cx_unproven",
   "name": "未成立",
   "desc": "一条接不上的线索。承认它，比硬连一条线更难。"
  },
  {
   "id": "cx_steps",
   "name": "走近与抬头",
   "desc": "三段台阶、一次正面仰视。空间关系本身就是一种设计，不必靠装饰表达。"
  },
  {
   "id": "cx_fusee",
   "name": "塔轮",
   "desc": "钟表动力零件，源于法文 fusee。名字和做法都是外来的，装进中国钟里就成了它的一部分。"
  },
  {
   "id": "cx_shuifa",
   "name": "水法",
   "desc": "齿轮长轴上的一根透明螺旋玻璃柱，转起来像流水。西洋机芯，中式景致。"
  },
  {
   "id": "cx_hybrid",
   "name": "历史融合",
   "desc": "有可指认的吸收与转化，才叫融合。只凭「里面有外来的东西」不足以下判断。"
  },
  {
   "id": "cx_judge",
   "name": "判定权",
   "desc": "系统给的是建议，签字的是人。改判也要写清依据，否则只是另一种误标。"
  }
 ],
 "cuts": {
  "opening": {
   "0": "这是一座被扫过一遍的故宫。",
   "1": "每一块砖、每一根柱、每一级台阶，都量过，都存下来了。",
   "2": "上个月，另一批人把雅典卫城也扫了一遍。他们把两个包裹放在一起，按了一个键。",
   "3": "投影叠上来了。可两层坐标系，从来没有对齐过。",
   "3sub": "系统提示：参数共用成功。标签一致性：未知。",
   "title": "万象灵境",
   "sub": "故宫 × 雅典卫城 · 一次校准"
  },
  "wumen_intro": {
   "0": "午门。八点三十。今天的宫门比平时多了一层灰绿色的线。",
   "1": "别急着走进去。先告诉我一件事：这层投影，它是以哪里为原点落下来的？",
   "2": "……你看地上的线。它们不重合。差得不多，但确实差着。",
   "3": "（差一点，就会被当成「本来就该这样」。）"
  }
 },
 "ending": {
  "lines": [
   {
    "who": "narrator",
    "text": "狄奥提玛走进你的作品。她的轮廓一点点变成像素。"
   },
   {
    "who": "diotima",
    "text": "在《会饮篇》里，我说爱是对美的欲求。"
   },
   {
    "who": "diotima",
    "text": "因为人总想占有自己没有的东西。"
   },
   {
    "who": "diotima",
    "text": "今天你教我一件事。"
   },
   {
    "who": "diotima",
    "text": "想占有，和想理解，是两回事。"
   },
   {
    "who": "diotima",
    "text": "还有一件：你们今天珍惜的东西，当年也都被人改过。"
   },
   {
    "who": "diotima",
    "text": "别把我的话写进导览牌。"
   },
   {
    "who": "diotima",
    "text": "写你自己核过的那些。"
   }
  ],
  "recall": [
   {
    "who": "narrator",
    "text": "今天你修过三样东西：一处配准，一份说明，一个判断。"
   },
   {
    "who": "narrator",
    "text": "最后那个最难。它不是你的判断，是别人交给你的。"
   }
  ],
  "afterword": [
   {
    "who": "narrator",
    "text": "神武门的灯一盏一盏亮起来，一直亮到景山。"
   },
   {
    "who": "narrator",
    "text": "你留下的每一条，旁边都写着它从哪儿来。"
   },
   {
    "who": "narrator",
    "text": "AI 让创作可以天马行空；对传统的理解与敬畏，让想象有值得延续的根。"
   }
  ]
 },
 "shareCard": {
  "title": "校准记录",
  "subtitle": "一份可以给别人复核的比较",
  "fields": [
   {
    "key": "nodes",
    "label": "走过节点",
    "value": "{done} / 6"
   },
   {
    "key": "links",
    "label": "成立的连接",
    "value": "{n} 条"
   },
   {
    "key": "blank",
    "label": "未成立",
    "value": "{n} 条"
   },
   {
    "key": "fixed",
    "label": "方案修正",
    "value": "{n} 处"
   },
   {
    "key": "judged",
    "label": "改判",
    "value": "{n} 处"
   },
   {
    "key": "kept",
    "label": "保留的关系",
    "value": "{n} 条"
   },
   {
    "key": "components",
    "label": "你的组件",
    "value": "{list}"
   }
  ],
  "footer": "万象灵境 · 故宫 × 雅典卫城"
 }
};
