
var requestAnimFrame = (function() {
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var canvasWidth = 320;
var canvasHeight = 240;
var zoom = 2;
canvas.width = canvasWidth * zoom;
canvas.height = canvasHeight * zoom;
document.body.appendChild(canvas);

// The main game loop
var lastTime;
var fps;
function main() {

    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    fps = Math.ceil(1000 / (now - lastTime));
    update();
    render();

    lastTime = now;
    requestAnimFrame(main);
}

var player1;
var player2;

var resources = [];
resources.push(new resource('chars', 'SF3_Ryu'));
//resources.push(new resource('chars', 'sf3_gouki')); // Another character
Promise.all(resources.map(function(resource) {
    return resource.load();
})).then(function() {
    init();
});

function init() {
    reset();
    lastTime = Date.now();
    main();
}

// Game state
var gameTime = 0;
var isGameOver;

// Update game objects
function update(dt) {

    //handleInput(dt);
    //checkCollisions();

}

// Draw everything
function render() {

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Player 1
    renderPlayer(player1);
    renderPlayer(player2);

    // Infos debug
    var text  = 'FPS:' + fps + ' - action:' + player1.action ;

    ctx.fillStyle = '#000';
    ctx.font = '10px  Lucida Console';
    ctx.textBaseline = 'bottom';
    ctx.fillText(text, 10, 20);

}

function renderPlayer(player) {

    ctx.save();
    ctx.scale(player.right, 1);

    var groupNumber = player.AIR[player.action].elements[player.currentFrame].groupNumber;
    var imageNumber = player.AIR[player.action].elements[player.currentFrame].imageNumber;
    var i = player.indexOf(groupNumber, imageNumber);

    var image = decodePCX(player.SFF.images[i].image, player.palette);
    var width = player.right === 1 ? 0 : image.width;

    // Fill image
    ctx.drawImage(image, (player.right * (player.pos.x - player.SFF.images[i].x)) + (player.right * width), player.pos.y - player.SFF.images[i].y);

    /*
    // Fill collision box // TODO Wrong in scale
    if (player.AIR[player.action].clsn2Default) {
        var clsn = player.AIR[action].clsn2Default;
    }
    else if (player.AIR[player.action].elements[player.currentFrame].clsn2) {
        var clsn = player.AIR[player.action].elements[player.currentFrame].clsn2;
    }
    if (clsn) {
        for (i = 0; i < clsn.length; i++) {
            var x = player.pos.x + clsn[i].x;
            var y = player.pos.y + clsn[i].y ;
            var width = clsn[i].x2 - clsn[i].x;
            var height = clsn[i].y2 - clsn[i].y;
            ctx.fillStyle = 'rgba(0,0,255,0.2)';
            ctx.fillRect(player.right * x, y, player.right * width, height);
        }
    }
    */

    // Fill pos
    /*
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.right * player.pos.x, player.pos.y, 1, 1);
    */

    player.currentTime++;
    if (player.currentTime >= player.AIR[player.action].elements[player.currentFrame].time) {
        player.currentTime = 0;
        player.currentFrame++;
        if (player.currentFrame >= player.AIR[player.action].elements.length) {
            player.currentFrame = 0;
        }
    }

    ctx.restore();

}

// Reset game to original state
function reset() {

    isGameOver = false;
    gameTime = 0;
    score = 0;

    ctx.scale(zoom || 1, zoom || 1);

    player1 = new player(resources[0]);
    player1.pos = { x : canvasWidth / 2 - 70, y : canvasHeight - 70 };
    player1.palette = player1.SFF.palette;
    player1.right = 1;

    player2 = new player(resources[0]);
    //player2 = new player(resources[1]); // Another character
    player2.pos = { x : canvasWidth / 2 + 70, y : canvasHeight - 70 };
    player2.palette = player2.ACT[0];
    player2.right = -1;

}
