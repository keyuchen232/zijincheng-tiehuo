/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "repair_bench",
  "title": "修复台",
  "sub": "来源判断",
  "size": {
    "w": 640,
    "h": 650
  },
  "spawn": {
    "x": 320,
    "y": 610
  },
  "camera": {
    "lookAhead": 42
  },
  "clock": "11:50",
  "ambient": "palace",
  "background": "#120f0d",
  "vars": {
    "evidenceDone": 0,
    "verdictR07": "",
    "crackCount": 0,
    "stampUnfounded": 0
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
      "y": 300,
      "w": 616,
      "h": 96
    },
    {
      "x": 180,
      "y": 476,
      "w": 240,
      "h": 44
    }
  ],
  "props": [
    {
      "painter": "hall.palace",
      "x": 320,
      "baseY": 392,
      "opt": {
        "w": 380,
        "wallH": 26,
        "roofH": 24,
        "nameKey": "nodes.repair_bench.name"
      }
    },
    {
      "painter": "hall.bench",
      "x": 320,
      "baseY": 520,
      "opt": {
        "w": 300
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 86,
      "baseY": 490,
      "opt": {}
    },
    {
      "painter": "hall.relic",
      "x": 472,
      "baseY": 530,
      "opt": {
        "s": 18
      }
    },
    {
      "painter": "hall.bench",
      "x": 70,
      "baseY": 440,
      "opt": {
        "w": 120
      }
    },
    {
      "painter": "hall.bench",
      "x": 570,
      "baseY": 440,
      "opt": {
        "w": 120
      }
    },
    {
      "painter": "hall.trees",
      "x": 66,
      "baseY": 570,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "hall.trees",
      "x": 574,
      "baseY": 570,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 70,
      "baseY": 620,
      "opt": {}
    },
    {
      "painter": "wumen.lantern",
      "x": 570,
      "baseY": 620,
      "opt": {}
    }
  ],
  "lights": [
    {
      "x": 320,
      "y": 474,
      "r": 130,
      "color": "#ffcf86",
      "a": 0.2
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 390,
      "y": 604,
      "r": 22,
      "dialogKey": "nodes.repair_bench.enter"
    }
  ],
  "spots": [
    {
      "id": "repair_bench.evidence",
      "x": 320,
      "y": 552,
      "r": 32,
      "labelKey": "ui.hud.interact",
      "puzzle": "repair_bench.evidence",
      "when": {
        "notDone": [
          "repair_bench.evidence"
        ]
      }
    },
    {
      "id": "repair_bench.relic",
      "x": 460,
      "y": 560,
      "r": 30,
      "labelKey": "ui.hud.interact",
      "puzzle": "repair_bench.relic",
      "when": {
        "done": [
          "repair_bench.evidence"
        ]
      }
    },
    {
      "id": "bench.look_cards",
      "x": 150,
      "y": 486,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_bench_cards"
    },
    {
      "id": "bench.look_stamp",
      "x": 222,
      "y": 566,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_bench_stamp"
    },
    {
      "id": "bench.look_clock",
      "x": 476,
      "y": 474,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_bench_clock"
    }
  ],
  "marker": {
    "x": 320,
    "y": 552,
    "when": {
      "notDone": [
        "repair_bench.evidence"
      ]
    }
  },
  "next": "creator",
  "bounds": {
    "x": 100,
    "y": 410,
    "w": 440,
    "h": 220
  }
});
