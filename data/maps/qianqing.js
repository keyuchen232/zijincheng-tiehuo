/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "qianqing",
  "title": "乾清宫",
  "sub": "承重实验",
  "size": {
    "w": 640,
    "h": 650
  },
  "spawn": {
    "x": 320,
    "y": 610
  },
  "camera": {
    "lookAhead": 44
  },
  "clock": "10:40",
  "ambient": "palace",
  "background": "#151210",
  "vars": {
    "stoneMethod": "",
    "woodMethod": "",
    "tested": 0,
    "sag": 0,
    "sagSide": "",
    "crack": 0,
    "dust": 0
  },
  "ground": [
    {
      "painter": "hall.court",
      "x": 0,
      "y": 380,
      "w": 640,
      "h": 270,
      "opt": {}
    }
  ],
  "solids": [
    {
      "x": 12,
      "y": 250,
      "w": 616,
      "h": 116
    },
    {
      "x": 140,
      "y": 488,
      "w": 160,
      "h": 14
    },
    {
      "x": 444,
      "y": 488,
      "w": 20,
      "h": 14
    }
  ],
  "props": [
    {
      "painter": "hall.palace",
      "x": 320,
      "baseY": 336,
      "opt": {
        "w": 470,
        "wallH": 32,
        "roofH": 30,
        "nameKey": "nodes.qianqing.name"
      }
    },
    {
      "painter": "hall.columns",
      "x": 220,
      "baseY": 500,
      "opt": {
        "style": "stone",
        "n": 6,
        "gap": 28,
        "h": 90
      }
    },
    {
      "painter": "hall.columns",
      "x": 454,
      "baseY": 500,
      "opt": {
        "style": "wood",
        "n": 1,
        "gap": 28,
        "h": 90
      }
    },
    {
      "painter": "hall.loadbeam",
      "x": 320,
      "baseY": 500,
      "opt": {}
    },
    {
      "painter": "hall.trees",
      "x": 66,
      "baseY": 470,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "hall.trees",
      "x": 574,
      "baseY": 470,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "hall.rock",
      "x": 76,
      "baseY": 560,
      "opt": {
        "s": 18
      }
    },
    {
      "painter": "hall.rock",
      "x": 564,
      "baseY": 560,
      "opt": {
        "s": 18
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 74,
      "baseY": 610,
      "opt": {}
    },
    {
      "painter": "wumen.lantern",
      "x": 566,
      "baseY": 610,
      "opt": {}
    }
  ],
  "lights": [
    {
      "x": 320,
      "y": 470,
      "r": 120,
      "color": "#ffcf86",
      "a": 0.14
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 402,
      "y": 600,
      "r": 22,
      "dialogKey": "nodes.qianqing.enter"
    }
  ],
  "spots": [
    {
      "id": "qianqing.loadtest",
      "x": 320,
      "y": 560,
      "r": 34,
      "labelKey": "ui.hud.interact",
      "puzzle": "qianqing.loadtest",
      "when": {
        "notDone": [
          "qianqing.loadtest"
        ]
      }
    },
    {
      "id": "qianqing.look_stone",
      "x": 194,
      "y": 526,
      "r": 30,
      "labelKey": "ui.hud.look",
      "inspect": "obj_qianqing_caryatid"
    },
    {
      "id": "qianqing.look_wood",
      "x": 446,
      "y": 526,
      "r": 30,
      "labelKey": "ui.hud.look",
      "inspect": "obj_qianqing_woodcol"
    }
  ],
  "marker": {
    "x": 320,
    "y": 560,
    "when": {
      "notDone": [
        "qianqing.loadtest"
      ]
    }
  },
  "next": "repair_bench",
  "bounds": {
    "x": 100,
    "y": 380,
    "w": 440,
    "h": 250
  }
});
