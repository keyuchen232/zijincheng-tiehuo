/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "creator",
  "title": "御花园",
  "sub": "共同造境",
  "size": {
    "w": 640,
    "h": 620
  },
  "spawn": {
    "x": 320,
    "y": 576
  },
  "camera": {
    "lookAhead": 42
  },
  "clock": "13:20",
  "ambient": "palace",
  "background": "#141110",
  "vars": {
    "planSigned": 0,
    "keepWhat": ""
  },
  "ground": [
    {
      "painter": "hall.court",
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
      "y": 250,
      "w": 616,
      "h": 90
    },
    {
      "x": 250,
      "y": 426,
      "w": 140,
      "h": 50
    }
  ],
  "props": [
    {
      "painter": "hall.palace",
      "x": 320,
      "baseY": 336,
      "opt": {
        "w": 330,
        "wallH": 22,
        "roofH": 20,
        "nameKey": "nodes.creator.pavilion"
      }
    },
    {
      "painter": "hall.trees",
      "x": 90,
      "baseY": 464,
      "opt": {
        "n": 1,
        "size": 56
      }
    },
    {
      "painter": "hall.trees",
      "x": 550,
      "baseY": 464,
      "opt": {
        "n": 1,
        "size": 52
      }
    },
    {
      "painter": "hall.terminal",
      "x": 320,
      "baseY": 476,
      "opt": {}
    },
    {
      "painter": "hall.trees",
      "x": 66,
      "baseY": 400,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "hall.trees",
      "x": 574,
      "baseY": 400,
      "opt": {
        "n": 2
      }
    },
    {
      "painter": "hall.bench",
      "x": 70,
      "baseY": 570,
      "opt": {
        "w": 120
      }
    },
    {
      "painter": "hall.bench",
      "x": 570,
      "baseY": 570,
      "opt": {
        "w": 120
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 70,
      "baseY": 500,
      "opt": {}
    },
    {
      "painter": "wumen.lantern",
      "x": 570,
      "baseY": 500,
      "opt": {}
    }
  ],
  "lights": [
    {
      "x": 320,
      "y": 414,
      "r": 120,
      "color": "#9fd6e0",
      "a": 0.16
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 430,
      "y": 454,
      "r": 22,
      "dialogKey": "nodes.creator.enter"
    }
  ],
  "spots": [
    {
      "id": "creator.review",
      "x": 320,
      "y": 514,
      "r": 32,
      "labelKey": "ui.hud.interact",
      "puzzle": "creator.review",
      "when": {
        "flag": {
          "creator.signed": false
        }
      }
    },
    {
      "id": "creator.look_terminal",
      "x": 190,
      "y": 504,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_creator_terminal"
    },
    {
      "id": "creator.look_guide",
      "x": 450,
      "y": 536,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_creator_guide"
    }
  ],
  "marker": {
    "x": 320,
    "y": 514,
    "when": {
      "notDone": [
        "creator.review"
      ]
    }
  },
  "next": "shenwumen",
  "bounds": {
    "x": 100,
    "y": 370,
    "w": 440,
    "h": 230
  }
});
