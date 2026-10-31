/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "shenwumen",
  "title": "神武门",
  "sub": "出口",
  "size": {
    "w": 640,
    "h": 620
  },
  "spawn": {
    "x": 320,
    "y": 574
  },
  "camera": {
    "lookAhead": 46
  },
  "clock": "16:40",
  "ambient": "palace",
  "background": "#171310",
  "vars": {
    "doorLit": 0,
    "clueARead": 0,
    "clueBRead": 0,
    "saidBorrow": "",
    "saidKeep": "",
    "saidNew": ""
  },
  "ground": [
    {
      "painter": "hall.marble",
      "x": 0,
      "y": 380,
      "w": 640,
      "h": 240,
      "opt": {}
    }
  ],
  "solids": [
    {
      "x": 12,
      "y": 260,
      "w": 616,
      "h": 130
    }
  ],
  "props": [
    {
      "painter": "hall.door",
      "x": 320,
      "baseY": 420,
      "opt": {
        "w": 620,
        "wallH": 74,
        "roofH": 40,
        "arches": 3,
        "nameKey": "nodes.shenwumen.name"
      }
    },
    {
      "painter": "wumen.plaque",
      "x": 320,
      "baseY": 268,
      "opt": {
        "textKey": "nodes.shenwumen.plaque"
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 96,
      "baseY": 520,
      "opt": {}
    },
    {
      "painter": "wumen.lantern",
      "x": 544,
      "baseY": 520,
      "opt": {}
    },
    {
      "painter": "hall.clue",
      "x": 174,
      "baseY": 482,
      "opt": {
        "read": "a"
      }
    },
    {
      "painter": "hall.clue",
      "x": 464,
      "baseY": 516,
      "opt": {
        "read": "b"
      }
    }
  ],
  "lights": [
    {
      "x": 96,
      "y": 500,
      "r": 68,
      "color": "#ffcf86",
      "a": 0.2
    },
    {
      "x": 544,
      "y": 500,
      "r": 68,
      "color": "#ffcf86",
      "a": 0.2
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 396,
      "y": 574,
      "r": 22,
      "dialogKey": "nodes.shenwumen.enter"
    }
  ],
  "spots": [
    {
      "id": "shenwumen.verify",
      "x": 320,
      "y": 460,
      "r": 32,
      "labelKey": "ui.hud.interact",
      "puzzle": "shenwumen.verify",
      "when": {
        "notDone": [
          "shenwumen.verify"
        ]
      }
    },
    {
      "id": "shenwumen.back",
      "x": 320,
      "y": 564,
      "r": 28,
      "labelKey": "ui.hud.interact",
      "puzzle": "shenwumen.back",
      "optional": true,
      "when": {
        "flag": {
          "creator.signed": false
        }
      }
    },
    {
      "id": "shenwumen.clue_a",
      "x": 174,
      "y": 494,
      "r": 28,
      "labelKey": "ui.hud.clue",
      "labelObj": "obj_shenwumen_clue_a",
      "puzzle": "shenwumen.clue_a",
      "when": {
        "notDone": [
          "shenwumen.clue_a"
        ]
      }
    },
    {
      "id": "shenwumen.clue_b",
      "x": 464,
      "y": 528,
      "r": 28,
      "labelKey": "ui.hud.clue",
      "labelObj": "obj_shenwumen_clue_b",
      "puzzle": "shenwumen.clue_b",
      "when": {
        "notDone": [
          "shenwumen.clue_b"
        ]
      }
    },
    {
      "id": "shenwumen.look_door",
      "x": 492,
      "y": 440,
      "r": 26,
      "labelKey": "ui.hud.look",
      "inspect": "obj_shenwumen_door"
    }
  ],
  "marker": {
    "x": 320,
    "y": 460,
    "when": {
      "notDone": [
        "shenwumen.verify"
      ]
    }
  },
  "exitCut": "ending",
  "next": null,
  "bounds": {
    "x": 100,
    "y": 410,
    "w": 440,
    "h": 190
  }
});
