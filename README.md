# demo_mugenJS


About M.U.G.E.N.
-----

M.U.G.E.N is a 2D fighting game engine with many customizable components.


About this demo
-----

This demo use mugen's files format in JavaScript (DEF, AIR, SFF and ACT files) to display and animate into canvas.

![demo_mugenJS capture](https://julien.vancutsem.me/images/captures/demo_mugenJS.png)


DEF files
-----

The definitions file (.def) is the most commonly used file in the M.U.G.E.N engine, as it is required for any content to function properly.

This file tells the engine what files the content uses and where they are located, what characters to be included on the select screen and their locations, what stages to be included, what stages the characters are to be fought on in Arcade mode, what order they appear in and how many can be fought per order, etc. 


AIR files
-----

The animations file (.air) plays a major role in any character, as without it, the character would not actually appear on-screen. It determines what sprites are used for each action a character does, what order they appear in, alpha transparency, the rotation of the sprites in the animation, the hit/collision boxes, and how fast the animations play. 


SFF files
-----

The sprites file (.sff) contains every image (sprite) used by a stage, character, screenpack, etc. Because M.U.G.E.N runs off indexed images with 256 colour palettes, transparency has to be a single forced colour rather than actual transparency. If a sprite isn't indexed, it runs off the palette of the computer's operating system, with the default transparency colour being black. 


ACT files
-----

Palette files (.act) are the 256 colour data files that determine what colours go where on a character. A single M.U.G.E.N character can have up to 12 act files that can be read by the M.U.G.E.N engine - these are determined by the .def file. 


How to modify the demo
-----

### To test with another character : ###

- put character files in chars directory (ex. chars/sf3_gouki)
- in js/app.js add the resource 
```js
resources.push( new resource( 'chars', 'sf3_gouki' ) ); // Another character
```
- in js/app.js change resource of player2
```js
player2 = new player( resources[ 1 ] ); // Another character
```

### To change animation ###
- in js/app.js add a line player1.action
```js
player1.action = 11; // crouch
```
### To change palette ###
- in js/app.js change player1.palette
```js
player1.palette = player1.SFF.palette; // default
player1.palette = player2.ACT[ 0 ]; // first additionnal palette
```

