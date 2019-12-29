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

class RoundOneJSApp {
    constructor(player1, player2, canvasWidth, canvasHeight, zoom) {
        this.player1 = player1;
        this.player2 = player2;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoom = zoom;
    }

    static loadCharacters(characters, callback) {
        var resources = [];

        for (var i = 0, length = characters.length; i < length; i++) {
            var character = characters[i];

            resources.push(
                new resource.Resource(character.path, character.name)
            );
        }

        Promise.all(resources.map(function(resource) {
            return resource.load();
        })).then(function() {
            callback.call(this, resources);
        });
    }

    // Create the canvas
    createCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth * this.zoom;
        canvas.height = this.canvasHeight * this.zoom;
        document.body.appendChild(canvas);
        return canvas.getContext('2d');
    }

    main() {
        var now = Date.now();
        var dt = (now - this.lastTime) / 1000.0;
        this.fps = Math.ceil(1000 / (now - this.lastTime));
        this.update();
        this.render();

        this.lastTime = now;
        requestAnimFrame(this.main.bind(this));
    }

    init() {
        this.ctx = this.createCanvas();
        this.reset();
        this.lastTime = Date.now();
        this.main();
    }

    // Update game objects
    update(dt) {
        //handleInput(dt);
        //checkCollisions();
    }

    // Draw everything
    render() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Player 1
        this.renderPlayer(this.player1);
        this.renderPlayer(this.player2);

        // Infos debug
        var text = 'FPS:' + this.fps + ' - action:' + this.player1.action;

        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px  Lucida Console';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(text, 10, 20);
    }

    renderPlayer(player) {
        this.ctx.save();
        this.ctx.scale(player.right, 1);

        var groupNumber = (
            player.AIR[player.action].elements[player.currentFrame].groupNumber
        );
        var imageNumber = (
            player.AIR[player.action].elements[player.currentFrame].imageNumber
        );
        var i = player.indexOf(groupNumber, imageNumber);

        var image = resource.decodePCX(
            player.SFF.images[i].image,
            player.palette
        );
        var width = player.right === 1 ? 0 : image.width;

        // Fill image
        this.ctx.drawImage(
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
        } else if (
            player.AIR[player.action].elements[player.currentFrame].clsn2
        ) {
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
            if (
                player.currentFrame >= player.AIR[player.action].elements.length
            ) {
                player.currentFrame = 0;
            }
        }

        this.ctx.restore();
    }

    // Reset game to original state
    reset() {
        this.isGameOver = false;
        this.gameTime = 0;

        this.score = 0;

        this.ctx.scale(this.zoom || 1, this.zoom || 1);
    }
}

module.exports = {
    RoundOneJSApp: RoundOneJSApp
};
