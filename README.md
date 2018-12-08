# MugenJS Renderer

This project use mugen's files format in JavaScript (DEF, AIR, SFF and ACT files) to display and animate into canvas.

![Capture of MugenJS](https://mugenjs.github.io/images/mugenjs.png)

## About M.U.G.E.N.

M.U.G.E.N is a 2D fighting game engine with many customizable components.

### DEF files

The definitions file (.def) is the most commonly used file in the M.U.G.E.N engine, as it is required for any content to function properly.

This file tells the engine what files the content uses and where they are located, what characters to be included on the select screen and their locations, what stages to be included, what stages the characters are to be fought on in Arcade mode, what order they appear in and how many can be fought per order, etc. 

### AIR files

The animations file (.air) plays a major role in any character, as without it, the character would not actually appear on-screen. It determines what sprites are used for each action a character does, what order they appear in, alpha transparency, the rotation of the sprites in the animation, the hit/collision boxes, and how fast the animations play. 

### SFF files

The sprites file (.sff) contains every image (sprite) used by a stage, character, screenpack, etc. Because M.U.G.E.N runs off indexed images with 256 colour palettes, transparency has to be a single forced colour rather than actual transparency. If a sprite isn't indexed, it runs off the palette of the computer's operating system, with the default transparency colour being black. 

### ACT files

Palette files (.act) are the 256 colour data files that determine what colours go where on a character. A single M.U.G.E.N character can have up to 12 act files that can be read by the M.U.G.E.N engine - these are determined by the .def file. 

### Usage

1. [Install Node.js](https://nodejs.org/en/download/package-manager/);
2. [Install the dependencies](https://docs.npmjs.com/cli/install);
3. [Run grunt](https://gruntjs.com/getting-started) without arguments;
4. Import `dist/mugen_renderer.js` file on page;
```html
<script type="text/javascript" src="mugen_renderer.js"></script>
```
5. Load characters and init **mugen_renderer.js**;
```js
var app = require('app');
var player = require('player');
var canvasWidth = 720;
var canvasHeight = 540;

app.loadCharacters(
    [
        {
            'path': 'chars',
            'name': 'Nanoha_Tsukikage'
        },
        {
            'path': 'chars',
            'name': 'Natsuka_Fuou'
        }
    ],
    function(resources) {
        var player1 = new player.Player(resources[0]);
        player1.pos = {
            x: canvasWidth / 2 - 200,
            y: canvasHeight - 140
        };
        player1.palette = player1.SFF.palette;
        player1.right = 1;

        var player2 = new player.Player(resources[1]);
        player2.pos = {
            x: canvasWidth / 2 + 200,
            y: canvasHeight - 140
        };
        player2.palette = player2.SFF.palette;
        player2.right = -1;

        app.init(player1, player2, canvasWidth, canvasHeight, 1);
    }
);
```
