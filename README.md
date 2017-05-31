# demo_mugenJS

Test of using mugen's characters in JavaScript (DEF, AIR, SFF and ACT files)

### To test with another character : ###

- put character files in chars directories (ex. chars/sf3_gouki)
- in js/app.js add the ressource 
```html
var ressources = [ new ressource( 'chars', 'SF3_Ryu' ), new ressource( 'chars', 'sf3_gouki' ) ];
```
- in js/app.js change ressource of player2
```html
player2 = new player( ressources[ 1 ] );
```

### To change animation ###
- in js/app.js add a line player1.action
```html
player1.action = 11;
```
