'use strict';
var Transform = require('../transform');
var inherits = require('inherits');

/**
 * A Transform that converts all inputs to Strings
 */
var StringTransform = module.exports = function StringTransform (array) {
    Transform.call(this);
}

inherits(StringTransform, Transform);

/**
 * @private
 * Called by Transform base when there is data to transform,
 * then pass it to this.push() and call the done callback
 */
StringTransform.prototype._transform = function (data, done) {
    this.push(String(data));
    done();
};
