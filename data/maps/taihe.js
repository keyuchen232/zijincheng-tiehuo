/* Compact interaction court; all movement is confined by bounds. */
G.mod.register({
  "kind": "map",
  "id": "taihe",
  "title": "太和殿",
  "sub": "月台",
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
  "clock": "09:10",
  "ambient": "palace",
  "background": "#171310",
  "vars": {
    "keepSteps": "",
    "labelsDone": 0,
    "layerStones": 0,
    "layerImages": 1,
    "layerLabels": 1,
    "labelGlitch": 0
  },
  "ground": [
    {
      "painter": "hall.marble",
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
      "y": 246,
      "w": 616,
      "h": 124
    }
  ],
  "props": [
    {
      "painter": "hall.terrace.deck",
      "x": 320,
      "baseY": 329,
      "opt": {
        "w": 560,
        "topY": 330,
        "frontY": 454
      }
    },
    {
      "painter": "hall.palace",
      "x": 320,
      "baseY": 330,
      "opt": {
        "w": 520,
        "wallH": 36,
        "roofH": 34,
        "double": true,
        "nameKey": "nodes.taihe.name"
      }
    },
    {
      "painter": "hall.terrace",
      "x": 320,
      "baseY": 470,
      "opt": {
        "w": 560
      }
    },
    {
      "painter": "hall.labelplates",
      "x": 320,
      "baseY": 470,
      "opt": {
        "at": [
          {
            "dx": 142,
            "dy": -46
          },
          {
            "dx": -138,
            "dy": -46
          },
          {
            "dx": 0,
            "dy": -34
          }
        ],
        "resolved": [
          {
            "dx": -138,
            "dy": -46
          },
          {
            "dx": 142,
            "dy": -46
          },
          {
            "dx": 0,
            "dy": -34
          }
        ]
      }
    },
    {
      "painter": "wumen.lantern",
      "x": 92,
      "baseY": 560,
      "opt": {}
    },
    {
      "painter": "wumen.lantern",
      "x": 548,
      "baseY": 560,
      "opt": {}
    },
    {
      "painter": "hall.layerstone",
      "x": 216,
      "baseY": 612,
      "opt": {
        "layer": "stones"
      }
    },
    {
      "painter": "hall.layerstone",
      "x": 320,
      "baseY": 612,
      "opt": {
        "layer": "images"
      }
    },
    {
      "painter": "hall.layerstone",
      "x": 424,
      "baseY": 612,
      "opt": {
        "layer": "labels"
      }
    },
    {
      "painter": "hall.references",
      "x": 320,
      "baseY": 416,
      "opt": {}
    }
  ],
  "lights": [
    {
      "x": 92,
      "y": 540,
      "r": 68,
      "color": "#ffcf86",
      "a": 0.2
    },
    {
      "x": 548,
      "y": 540,
      "r": 68,
      "color": "#ffcf86",
      "a": 0.2
    }
  ],
  "npcs": [
    {
      "id": "diotima",
      "painter": "mentor.diotima",
      "x": 400,
      "y": 552,
      "r": 22,
      "dialogKey": "nodes.taihe.enter"
    }
  ],
  "spots": [
    {
      "id": "taihe.labels",
      "x": 320,
      "y": 506,
      "r": 32,
      "labelKey": "ui.hud.interact",
      "puzzle": "taihe.labels",
      "when": {
        "notDone": [
          "taihe.labels"
        ]
      }
    },
    {
      "id": "taihe.keep",
      "x": 156,
      "y": 544,
      "r": 28,
      "labelKey": "ui.hud.interact",
      "puzzle": "taihe.keep",
      "when": {
        "notDone": [
          "taihe.keep"
        ]
      }
    },
    {
      "id": "taihe.look_steps",
      "x": 490,
      "y": 548,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_taihe_steps"
    },
    {
      "id": "taihe.look_railing",
      "x": 130,
      "y": 454,
      "r": 26,
      "labelKey": "ui.hud.look",
      "inspect": "obj_taihe_railing"
    },
    {
      "id": "taihe.look_archive",
      "x": 442,
      "y": 418,
      "r": 28,
      "labelKey": "ui.hud.look",
      "inspect": "obj_taihe_archive"
    },
    {
      "id": "taihe.look_plaque",
      "x": 320,
      "y": 394,
      "r": 26,
      "labelKey": "ui.hud.look",
      "inspect": "obj_taihe_plaque"
    },
    {
      "id": "taihe.layer.stones",
      "x": 216,
      "y": 606,
      "r": 25,
      "labelKey": "ui.hud.layer",
      "puzzle": "taihe.layer.stones",
      "optional": true
    },
    {
      "id": "taihe.layer.images",
      "x": 320,
      "y": 606,
      "r": 25,
      "labelKey": "ui.hud.layer",
      "puzzle": "taihe.layer.images",
      "optional": true
    },
    {
      "id": "taihe.layer.labels",
      "x": 424,
      "y": 606,
      "r": 25,
      "labelKey": "ui.hud.layer",
      "puzzle": "taihe.layer.labels",
      "optional": true
    }
  ],
  "marker": {
    "x": 320,
    "y": 506,
    "when": {
      "notDone": [
        "taihe.labels"
      ]
    }
  },
  "next": "qianqing",
  "bounds": {
    "x": 100,
    "y": 380,
    "w": 440,
    "h": 250
  }
});
