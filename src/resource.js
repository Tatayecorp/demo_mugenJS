// For signature & version
DataView.prototype.getString = function(offset, length) {
    var str = '';
    var charCode;
    for (var i = 0; i < length; i++) {
        charCode = this.getUint8(i + offset);
        if (charCode === 0) {
            break;
        }
        str += String.fromCharCode(charCode);
    }
    return str;
};

// For extract dataImage & palette
DataView.prototype.extractBuffer = function(offset, end) {
    return this.buffer.slice(offset - 1, end);
};

function imageDataToImage(imageData, operation) {
    var canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var image = canvas.getContext('2d');
    image.putImageData(imageData, 0, 0);

    if (typeof operation === 'undefined') {
        return canvas;
    } else if (operation == 'flipH') {
        var canvas2 = document.createElement('canvas');
        canvas2.width = imageData.width;
        canvas2.height = imageData.height;
        var image2 = canvas2.getContext('2d');
        image2.scale(-1, 1)
        image2.drawImage(canvas, -imageData.width, 0);
        return canvas2;
    }
}

function decodePalette(buffer) {
    var palette = [];
    var dvp = new DataView(buffer);
    var offset = 0;
    for (var i = 0; i < 256; i++) {
        var c = [];
        c[0] = dvp.getUint8(offset, true); offset += 1;
        c[1] = dvp.getUint8(offset, true); offset += 1;
        c[2] = dvp.getUint8(offset, true); offset += 1;
        palette.push(c);
    }

    return palette;
}

function decodeACT(buffer) {
    var palette = [];
    var dvp = new DataView(buffer);
    var offset = 0;
    for (var i = 0; i < 256; i++) {
        var c = [];
        c[0] = dvp.getUint8(offset, true); offset += 1;
        c[1] = dvp.getUint8(offset, true); offset += 1;
        c[2] = dvp.getUint8(offset, true); offset += 1;
        palette.unshift(c);
    }

    return palette;
}

function decodePCX(buffer, palette) {
    var o = {};
    var dv = new DataView(buffer);
    var offset = 0;

    o.id = dv.getUint8(offset, true); offset += 1;
    o.version = dv.getUint8(offset, true); offset += 1;
    o.encoding = dv.getUint8(offset, true); offset += 1;
    o.bitPerPixel = dv.getUint8(offset, true); offset += 1;
    o.x = dv.getUint16(offset, true); offset += 2;
    o.y = dv.getUint16(offset, true); offset += 2;
    o.width = dv.getUint16(offset, true); offset += 2;
    o.height = dv.getUint16(offset, true); offset += 2;
    o.hres = dv.getUint16(offset, true); offset += 2;
    o.vres = dv.getUint16(offset, true); offset += 2;

    o.colorMap = []; // 16 colors rgb
    for (var i = 0; i < 16; i++) {
        var c = [];
        c[0] = dv.getUint8(offset, true); offset += 1;
        c[1] = dv.getUint8(offset, true); offset += 1;
        c[2] = dv.getUint8(offset, true); offset += 1;
        o.colorMap.push(c);
    }

    o.reserved = dv.getUint8(offset, true); offset += 1;
    o.nbPlanes = dv.getUint8(offset, true); offset += 1;
    o.bpl = dv.getUint16(offset, true); offset += 2;
    o.paletteInfo = dv.getUint16(offset, true); offset += 2;

    o.palette = []; // 256 colors rgb
    if (typeof palette === 'undefined') {
        offset = buffer.byteLength - 769;
        o.signature = dv.getUint8(offset, true); offset += 1; // 12

        for (var i = 0; i < 256; i++) {
            var c = [];
            c[0] = dv.getUint8(offset, true); offset += 1;
            c[1] = dv.getUint8(offset, true); offset += 1;
            c[2] = dv.getUint8(offset, true); offset += 1;
            o.palette.push(c);
        }
    } else {
        o.palette = palette;
    }

    offset = 128;

    var x = o.x;
    var y = o.y;
    o.width++;
    o.height++;

    var data = new Uint8ClampedArray(o.width * o.height * 4);
    i = 0;
    while (i < o.width * o.height * 4) {
        data[i++] = 0;
    }

    while (y < o.height) {
        var b = dv.getUint8(offset, true); offset += 1;
        var runcount;
        var value;
        if ((b & 0xC0) == 0xC0) {
            runcount = (b & 0x3F);
            value = dv.getUint8(offset, true); offset += 1;
        } else {
            runcount = 1;
            value = b;
        }
        for (var i = 0; i < runcount; i++) {
            if(value != 0) {
                var j = (x + y * o.width) * 4;
                data[j + 0] = o.palette[value][0];
                data[j + 1] = o.palette[value][1];
                data[j + 2] = o.palette[value][2];
                data[j + 3] = 255;
            }
            x++;
            if (x >= o.width) {
                y++;
                x = o.x;
            }
        }
    }
    //return { data : data, width : o.width, height : o.height };

    var canvas = document.createElement('canvas');
    canvas.width = o.width;
    canvas.height = o.height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(o.width, o.height);
    imageData.data.set(data);
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function decodeSFF(data) {
    var o = {};
    var dv = new DataView(data);
    var offset = 0;

    o.signature = dv.getString(offset, 12); offset += 12;
    o.version = dv.getString(offset, 4); offset += 4;
    o.nbGroups = dv.getUint32(offset, true); offset += 4;
    o.nbImages = dv.getUint32(offset, true); offset += 4;
    o.posFirstSubFile = dv.getUint32(offset, true); offset += 4;
    o.length = dv.getUint32(offset, true); offset += 4;
    o.paletteType = dv.getUint8(offset, true); offset += 1;
    o.blank = dv.getString(offset, 3); offset += 3;
    o.comments = dv.getString(offset, 476); offset += 476;

    o.SF = [];
    var i = 0;
    var pos = o.posFirstSubFile;
    while (i < o.nbImages) {
        var sf = {};
        var nextSubFile = dv.getUint32(offset, true); offset += 4;
        var subFileLength = dv.getUint32(offset, true); offset += 4;
        sf.x = dv.getUint16(offset, true); offset += 2;
        sf.y = dv.getUint16(offset, true); offset += 2;
        sf.groupNumber = dv.getUint16(offset, true); offset += 2;
        sf.imageNumber = dv.getUint16(offset, true); offset += 2;
        sf.indexPreviousCopy = dv.getUint16(offset, true); offset += 2;
        sf.samePalette = dv.getUint8(offset, true); offset += 1;
        var comments = dv.getString(offset, 14); offset += 14;
        if (sf.indexPreviousCopy == 0) {
            if(sf.samePalette == 0) {
                sf.image = dv.extractBuffer(offset, nextSubFile);
            } else {
                sf.image = dv.extractBuffer(offset, nextSubFile);
            }
        }
        if (i == 0) {
            o.palette = decodePalette(dv.extractBuffer(nextSubFile - 767, nextSubFile));
        }
        offset = nextSubFile;
        o.SF.push(sf);
        i++;
    }
    return {
        images : o.SF,
        palette : o.palette
    };
}

function decodeAIR(data) {
    var regex = {
        action : /^\[Begin Action\s*(\d*)\s*\]$/,
        clsn2Default : /^Clsn2Default\s*:\s*(\d*)$/,
        clsn1 : /^\Clsn1\s*:\s*(\d*)$/,
        clsn2 : /^\Clsn2\s*:\s*(\d*)$/,
        clsn : /^Clsn(\d)\[\s*(\d*)\s*\]\s*\=\s*(-?\d*?)\s*,\s*(-?\d*?)\s*,\s*(-?\d*?)\s*,\s*(-?\d*?)$/,
        element : /^(-?\d*)\s*,\s*(\d*)\s*,\s*(-?\d*)\s*,\s*(-?\d*)\s*,\s*(-?\d*)$/
    };

    var actions = [];
    var lines = data.split(/\r\n|\r|\n/);
    var action = null;
    var clsn1 = null;
    var clsn2 = null;

    lines.forEach(function(line) {
        line = line.replace(/^\s+/, '').replace(/;.*/, '').replace(/\s+$/, '');

        /* action */
        if (regex.action.test(line)) {
            var match = line.match(regex.action);
            action = match[1];
            clsn2Default = null;
            clsn1 = null;
            clsn2 = null;
            actions[action] = {};
        } else if (regex.clsn2Default.test(line)) {
            /* clsn2Default */
            if (action) {
                actions[action].clsn2Default = [];
            }
        } else if (regex.clsn1.test(line)) {
            /* clsn1 */
            if (action) {
                clsn1 = [];
            }
        } else if (regex.clsn2.test(line)) {
            /* clsn2 */
            if (action) {
                clsn2 = [];
            }
        } else if (regex.clsn.test(line)) {
            /* clsn */
            var match = line.match(regex.clsn);
            if (action) {
                var clsn = {
                    x : +match[3],
                    y : +match[4],
                    x2 : +match[5],
                    y2 : +match[6]
                };
                if (actions[action].clsn2Default) {
                    actions[action].clsn2Default.push(clsn);
                } else if (clsn1) {
                    clsn1.push(clsn);
                } else if (clsn2) {
                    clsn2.push(clsn);
                }
            }
        } else if (regex.element.test(line)) {
            /* element */
            var match = line.match(regex.element);
            var element = {
                groupNumber : +match[1],
                imageNumber : +match[2],
                x : +match[3],
                y : +match[4],
                time : +match[5]
            };
            if (clsn1) {
                element.clsn1 = clsn1;
            }
            if (clsn2) {
                element.clsn2 = clsn2;
            }
            if (!actions[action].elements) {
                actions[action].elements = [];
            }
            actions[action].elements.push(element);
        } else if (line.length != 0) {
            console.log('AIR - Line unknown : ' + line);
        }
    });
    return actions;
}

function decodeDEF(text) {
    var regex = {
        section: /^\[\s*([^\]]*)\s*\]$/,
        param: /^([\w\.\-\_]+)\s*=\s*(.*?)$/
    };

    var value = {};
    var lines = text.split(/\r\n|\r|\n/);
    var section = null;

    lines.forEach(function(line) {
        line = line.replace(/^\s+/, '').replace(/;.*/, '').replace(/\s+$/, '');

        if (regex.section.test(line)) {
            var match = line.match(regex.section);
            section = match[1].toLowerCase();
            value[section] = {};
        } else if (regex.param.test(line)) {
            var match = line.match(regex.param);
            if (section) {
                value[section][match[1].toLowerCase()] = match[2];
            } else {
                value[match[1].toLowerCase()] = match[2];
            }
        } else if (line.length != 0) {
            console.log('DEF - Line unknown : ' + line);
        }
    });
    return value;
}

(function() {
    function resource(path, name) {
        this.path = path;
        this.name = name;
        this.DEF = {};
        this.AIR = [];
        this.SFF = {};
        this.ACT = [];
    }

    resource.prototype = {
        load : function() {
            var resource = this;
            return new Promise(function(resolveAll, reject) {
                // Load DEF
                fetch(
                    resource.path
                    + '/'
                    + resource.name
                    + '/'
                    + resource.name
                    + '.def'
                ).then(function(response) {
                    return response.text();
                }).then(function(text) {
                    return decodeDEF(text);
                }).then(function(data) {
                    resource.DEF = data;

                    // Load AIR
                    var pAIR = new Promise(function(resolve, reject) {
                        fetch(
                            resource.path
                            + '/'
                            + resource.name
                            + '/'
                            + data.files.anim
                        ).then(function(response) {
                            return response.text();
                        }).then(function(text) {
                            resource.AIR = decodeAIR(text);
                            resolve();
                        })
                    });

                    // Load SFF
                    var pSFF = new Promise(function(resolve, reject) {
                        fetch(
                            resource.path
                            + '/'
                            + resource.name
                            + '/'
                            + data.files.sprite
                        ).then(function(response) {
                            return response.arrayBuffer();
                        }).then(function(arrayBuffer) {
                            resource.SFF = decodeSFF(arrayBuffer);
                            resolve();
                        })
                    });

                    // Load Palette 1, 1st test
                    var pACT = new Promise(function(resolve, reject) {
                        fetch(
                            resource.path
                            + '/'
                            + resource.name
                            + '/'
                            + data.files.pal1
                        ).then(function(response) {
                            return response.arrayBuffer();
                        }).then(function(arrayBuffer) {
                            resource.ACT.push(decodeACT(arrayBuffer));
                            resolve();
                        })
                    });

                    Promise.all([pAIR, pSFF, pACT]).then(function() {
                        resolveAll();
                    });
                });
            });
        }
    };
    window.resource = resource;
})();
