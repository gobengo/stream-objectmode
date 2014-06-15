"use strict";
var extend = require('util-extend');

module.exports = extend(require('./stream'), {
    Readable: require('./readable'),
    Writable: require('./writable'),
    Transform: require('./transform'),
    Duplex: require('./duplex'),
    PassThrough: require('./passthrough')
});
