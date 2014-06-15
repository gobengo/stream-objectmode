var Transform = require('./transform');
var inherits = require('inherits');

var PassThrough = module.exports = function PassThrough (opts) {
	Transform.call(this, opts);
}

inherits(PassThrough, Transform);

PassThrough.prototype._transform = function (chunk, done) {
	done(null, chunk);
};
