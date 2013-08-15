define(['stream', 'stream/util'], function (Stream, util) {

	function Writable (opts) {
		this.writable = true;
		Stream.call(this, opts);
	}

	util.inherits(Writable, Stream);

	return Writable;
});