var resource = require('resource');

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
function main(player1, player2) {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    fps = Math.ceil(1000 / (now - lastTime));
    update();
    render(player1, player2);

    lastTime = now;
    requestAnimFrame(function() {
        main(player1, player2);
    });
}

function loadCharacters(characters, callback) {
    var resources = [];

    for (var i = 0, length = characters.length; i < length; i++) {
        var character = characters[i];

        resources.push(new resource.resource(character.path, character.name));
    }

    Promise.all(resources.map(function(resource) {
        return resource.load();
    })).then(function() {
        callback.call(this, resources);
    });
}

function init(player1, player2) {
    reset();
    lastTime = Date.now();
    main(player1, player2);
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
function render(player1, player2) {
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

    var groupNumber = (
        player.AIR[player.action].elements[player.currentFrame].groupNumber
    );
    var imageNumber = (
        player.AIR[player.action].elements[player.currentFrame].imageNumber
    );
    var i = player.indexOf(groupNumber, imageNumber);

    var image = resource.decodePCX(player.SFF.images[i].image, player.palette);
    var width = player.right === 1 ? 0 : image.width;

    // Fill image
    ctx.drawImage(
        image,
        (
            (player.right * (player.pos.x - player.SFF.images[i].x))
            + (player.right * width)
        ),
        player.pos.y - player.SFF.images[i].y
    );

    /*
    // Fill collision box // TODO Wrong in scale
    if (player.AIR[player.action].clsn2Default) {
        var clsn = player.AIR[action].clsn2Default;
    } else if (player.AIR[player.action].elements[player.currentFrame].clsn2) {
        var clsn = (
            player.AIR[player.action].elements[player.currentFrame].clsn2
        );
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
    if (
        player.currentTime
        >= player.AIR[player.action].elements[player.currentFrame].time
    ) {
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
}

module.exports = {
    init: init,
    loadCharacters: loadCharacters
};
