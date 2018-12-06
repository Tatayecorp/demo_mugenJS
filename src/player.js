function player (resource) {
    this.pos = {
        x: 0,
        y: 0
    };
    this.action = 0;
    this.currentFrame = 0;
    this.currentTime = 0;
    this.right = 1;
    this.palette = null;

    var hasOwn = Object.prototype.hasOwnProperty;
    if (typeof resource != 'object') {
        throw TypeError('player - ressource incorrect');
    }
    var properties = Object(resource);
    for (var prop in properties) {
        if (hasOwn.call(properties, prop)) {
            this[prop] = properties[prop];
        }
    }
}

player.prototype = {
    indexOf: function(groupNumber, imageNumber) {
        if (this.SFF == null) {
            throw new TypeError('indexOf - SFF not defined.');
        }
        for (var i = 0; i < this.SFF.images.length; i++) {
            if (this.SFF.images[i].groupNumber === groupNumber && this.SFF.images[i].imageNumber === imageNumber) {
                return i;
            }
        }
        return -1;
    }
}
