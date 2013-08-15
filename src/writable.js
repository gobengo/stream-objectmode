define(['stream', 'stream/util'], function (Stream, util) {

	function Writable (opts) {
		this.writable = true;
		this._writableState = new WritableState(opts, this);
		Stream.call(this, opts);
	}

	util.inherits(Writable, Stream);


	Writable.prototype.write = function (chunk, errback) {
		var state = this._writableState,
			ret = false,
			writeAfterEndErr;

		if (typeof errback !== 'function') {
			errback = function () {};
		}

		if (state.ended) {
			writeAfterEndErr = new Error('.write() called after stream end');
			this.emit('error', writeAfterEndErr);
			util.nextTick(function () {
				errback(writeAfterEndErr);
			});
		} else {

		}
		return ret;
	};

	
	Writable.prototype.pipe = function () {
		this.emit('error', new Error('Cannot pipe. Not readable'));
	};


	Writable.prototype.end = function (chunk, errback) {
		var state = this._writableState;

		// If only passed an errback
		if (typeof chunk === 'function') {
			errback = chunk;
			chunk = null;
		}

		// If passed a chunk
		if (typeof chunk !== 'undefined' && chunk !== null) {
			this.write(chunk);
		}

		// Ignore extra .end() calls
		if ( ! state.ending && ! state.finished) {
			// Shut it down
			state.ending = true;
			this._finishMaybe();
			if (errback) {
				if (state.finished) {
					util.nextTick(errback);
				} else {
					this.once('finish', errback);
				}
			}
			state.ended = true;
		}
	};


	/**
	 * @private
	 */
	Writable.prototype._finishMaybe = function () {
		var state = this._writableState,
			needToFinish = this._needFinish();
		if (needToFinish) {
			state.finished = true;
			this.emit('finish');
		}
		return needToFinish;
	};


	/**
	 * @private
	 */
	Writable.prototype._needFinish = function () {
		var state = this._writableState;
		return (state.ending &&
				state.buffer.length === 0 &&
				! state.finished &&
				! state.writing);
	};


	function WriteReq(chunk, encoding, cb) {
		this.chunk = chunk;
		this.encoding = encoding;
		this.callback = cb;
	}


	/**
	 * From https://github.com/isaacs/readable-stream/blob/c547457903406fdb9b5c621501c55eced48cae82/lib/_stream_writable.js#L41
	 */
	function WritableState (opts, stream) {
		opts = opts || {};

		// the point at which write() starts returning false
		// Note: 0 is a valid value, means that we always return false if
		// the entire buffer is not flushed immediately on write()
		var hwm = opts.highWaterMark;
		this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

		// object stream flag to indicate whether or not this stream
		// contains buffers or objects.
		this.objectMode = !!opts.objectMode;

		// cast to ints.
		this.highWaterMark = ~~this.highWaterMark;

		this.needDrain = false;
		// at the start of calling end()
		this.ending = false;
		// when end() has been called, and returned
		this.ended = false;
		// when 'finish' is emitted
		this.finished = false;

		// should we decode strings into buffers before passing to _write?
		// this is here so that some node-core streams can optimize string
		// handling at a lower level.
		var noDecode = opts.decodeStrings === false;
		this.decodeStrings = !noDecode;

		// Crypto is kind of old and crusty.  Historically, its default string
		// encoding is 'binary' so we have to make this configurable.
		// Everything else in the universe uses 'utf8', though.
		this.defaultEncoding = opts.defaultEncoding || 'utf8';

		// not an actual buffer we keep track of, but a measurement
		// of how much we're waiting to get pushed to some underlying
		// socket or file.
		this.length = 0;

		// a flag to see when we're in the middle of a write.
		this.writing = false;

		// a flag to be able to tell if the onwrite cb is called immediately,
		// or on a later tick.  We set this to true at first, becuase any
		// actions that shouldn't happen until "later" should generally also
		// not happen before the first write call.
		this.sync = true;

		// a flag to know if we're processing previously buffered items, which
		// may call the _write() callback in the same tick, so that we don't
		// end up in an overlapped onwrite situation.
		this.bufferProcessing = false;

		// the callback that's passed to _write(chunk,cb)
		this.onwrite = function(er) {
		onwrite(stream, er);
		};

		// the callback that the user supplies to write(chunk,encoding,cb)
		this.writecb = null;

		// the amount that is being written when _write is called.
		this.writelen = 0;

		this.buffer = [];
	}

	Writable.WritableState = WritableState;
	return Writable;
});