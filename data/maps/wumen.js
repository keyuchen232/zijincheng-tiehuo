/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "wumen",
  "title": "午门",
  "sub": "原点之争",
  "enterCut": "wumen.intro",
  "size": {
    "w": 640,
    "h": 620
  },
  "spawn": {
    "x": 320,
    "y": 576
  },
  "camera": {
    "lookAhead": 46
  },
  "clock": "08:30",
  "ambient": "palace",
  "background": "#171310",
  "vars": {
    "gridDx": 18,
    "gridBoth": 0,
    "seamShift": 0,
    "nailShift": 0,
    "terraceGap": 0,
    "view": ""
  },
  "ground": [
    {
      "painter": "wumen.plaza",
      "x": 0,
      "y": 410,
      "w": 640,
      "h": 210,
      "opt": {}
    },
    {
      "painter": "wumen.grid",
      "x": 0,
      "y": 0,
      "w": 640,
      "h": 620,
      "opt": {}
    }
  ],
  "solids": [
    {
      "x": 12,
      "y": 262,
      "w": 616,
      "h": 148
    }
  ],
  "props": [
    { "painter": "wumen.steps", "x": 320, "baseY": 428, "opt": { "w": 190 } },
    { "painter": "wumen.lion", "x": 150, "baseY": 470, "opt": { "flip": false } },
    { "painter": "wumen.lion", "x": 490, "baseY": 470, "opt": { "flip": true } },
    { "painter": "wumen.huabiao", "x": 112, "baseY": 476, "opt": {} },
    { "painter": "wumen.huabiao", "x": 528, "baseY": 476, "opt": {} },
    { "painter": "wumen.vat", "x": 210, "baseY": 512, "opt": {} },
    { "painter": "wumen.vat", "x": 430, "baseY": 512, "opt": {} },
    { "painter": "wumen.tree", "x": 74, "baseY": 600, "opt": { "kind": "pine", "s": 0.8 } },
    { "painter": "wumen.tree", "x": 566, "baseY": 600, "opt": { "kind": "pine", "s": 0.8 } },
    { "painter": "wumen.sign", "x": 190, "baseY": 600, "opt": { "text": "午門 · 广场", "w": 58 } },
    { "painter": "wumen.sign", "x": 450, "baseY": 600, "opt": { "text": "万象灵境", "w": 58 } },
    {
      "painter": "wumen.far",
      "x": 320,
      "baseY": 420,
      "opt": {}
    },
    {
      "painter": "wumen.gate",
      "x": 320,
      "baseY": 420,
      "opt": {
        "w": 660
      }
    },
    {
      "painter": "wumen.plaque",
      "x": 320,
      "baseY": 268,
      "opt": {
        "textKey": "nodes.wumen.plaque"
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
    }
  ],
  "lights": [
    {
      "x": 96,
      "y": 500,
      "r": 70,
      "color": "#ffcf86",
      "a": 0.22
    },
    {
      "x": 544,
      "y": 500,
      "r": 70,
      "color": "#ffcf86",
      "a": 0.22
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 398,
      "y": 556,
      "r": 22,
      "dialogKey": "nodes.wumen.enter"
    }
  ],
  "spots": [
    {
      "id": "wumen.origin",
      "x": 320,
      "y": 486,
      "r": 34,
      "labelKey": "ui.hud.interact",
      "puzzle": "wumen.registration",
      "when": {
        "notDone": [
          "wumen.origin"
        ]
      }
    },
    {
      "id": "wumen.look_grid",
      "x": 170,
      "y": 554,
      "r": 30,
      "labelKey": "ui.hud.look",
      "inspect": "obj_wumen_grid"
    },
    {
      "id": "wumen.look_gate",
      "x": 484,
      "y": 468,
      "r": 30,
      "labelKey": "ui.hud.look",
      "inspect": "obj_wumen_gate"
    }
  ],
  "marker": {
    "x": 320,
    "y": 486,
    "when": {
      "notDone": [
        "wumen.origin"
      ]
    }
  },
  "next": "taihe",
  "bounds": {
    "x": 100,
    "y": 430,
    "w": 440,
    "h": 170
  }
});
