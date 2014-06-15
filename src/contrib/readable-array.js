'use strict';
var Readable = require('../readable');
var inherits = require('inherits');

/**
 * A Readable that emits the items of an array
 */
var ReadableArray = module.exports = function ReadableArray (array) {
    this._array = array ? array.slice() : [];
    Readable.call(this);
}

inherits(ReadableArray, Readable);

/**
 * @private
 * Called by Readable base when you should go get more data,
 * then pass it to this.push()
 */
ReadableArray.prototype._read = function () {
    this.push(this._array.shift() || null);
};
