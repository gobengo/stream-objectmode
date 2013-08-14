define(['stream', 'stream/util'], function (Stream, util) {
    "use strict";

    /**
     * Base class for Readable Streams
     * @constructor
     * @param [opts] {object} Configuration options
     * @param [opts.highWaterMark=50] {number} The maximum number of objects to
     *     store in the internal buffer before ceasing to read from upstream
     */
    function Readable (opts) {
        opts = opts || {};
        // This Readable implementation only supports objectMode
        opts.objectMode = true;
        this._readableState = new ReadableState(opts, this);

        this.readable = true;
        Stream.call(this);
    }
    util.inherits(Readable, Stream);


    /**
     * The Default .highWaterMark for Readables
     * This will be used if none is specified on construction
     */
    var DEFAULT_HIGH_WATER_MARK = 50;


    /**
     * Push a chunk onto the end of the internal buffer
     * The _read() function will not be called again until at least one
     *     push(chunk) call is made.
     * The Readable class works by putting data into a read queue to be pulled
     *     out later by calling the read() method when the 'readable' event fires.
     * @param chunk {object} Chunk of data to push into the read queue.
     *     if chunk === null, that signals the end of data
     * @returns {boolean} Whether or not more pushes should be performed
     */
    Readable.prototype.push = function (chunk) {
        return this._addToBuffer(chunk, false);
    };


    /**
     * Push a chunk onto the front of the internal buffer.
     * This is useful in certain cases where a stream is being consumed by a
     * parser, which needs to "un-consume" some data that it has optimistically pulled out of the source, so that the stream can be passed on to some other party.
     * @param chunk {object} Chunk of data to unshift onto the read queue
     * @returns {boolean} Whether or not more pushes should be performed
     */
    Readable.prototype.unshift = function (chunk) {
        return this._addToBuffer(chunk, true);
    };


    /**
     * @private
     * Common implementation shared between .push and .unshift
     * Both methods mutate to read buffer
     * @param chunk {object} Chunk of data to add to the read queue
     * @param addToFront {boolean} Whether to add to the front or back of the
     *     buffer
     * @returns {boolean} Whether this stream should have more data pushed
     *     to it
     */
    Readable.prototype._addToBuffer = function (chunk, addToFront) {
        var state = this._readableState;
        if (chunk === null || chunk === undefined) {
            // End of file.
            state.reading = false;
            // Start wrapping up if we haven't before
            if ( ! state.ended) {
                this._endReadable();
            }
        } else if (state.objectMode || chunk && chunk.length > 0) {
            if (state.ended && ! addToFront) {
                this.emit('error', new Error("readable.push() called after EOF"));
            } else if (state.endEmitted && addToFront) {
                this.emit('error', new Error("readable.unshift() called after end event"));
            } else {
                if (addToFront) {
                    state.buffer.unshift(chunk);
                } else {
                    state.reading = false;
                    state.buffer.push(chunk);
                }
                // Now that we've pushed data to the buffer,
                // let listeners know we're readable
                if (state.needReadable) {
                    this._emitReadable();
                }
                this._maybeReadMore();
            }
        }
        
        // Return whether
        return ! state.ended && 
               ( state.needReadable ||
                 state.buffer.length < state.highWaterMark ||
                 state.buffer.length === 0);
    };


    /**
     * @private
     * _read() more data from upstream until the buffer length is greater than
     *     the highWaterMark. It triggers this by calling .read(0);
     * This executes on nextTick, not synchronously
     */
    Readable.prototype._maybeReadMore = function () {
        var self = this,
            state = self._readableState;

        if (state.readingMore) {
            return;
        }
        state.readingMore = true;

        util.nextTick(_readMore);

        function _readMore () {
            var len = state.buffer.length;
            while ( ! state.reading && ! state.ended &&
                    state.buffer.length < state.highWaterMark ) {
                // Trigger ._read()
                self.read(0);
                if (len === state.buffer.length) {
                    // self.read(0) didn't add any data
                    break;
                } else {
                    len = state.buffer.length;
                }
            }
            state.readingMore = false;
        }
    };


    /**
     * Bind an event listener to an event on this stream
     * Readable adds some extra functionality so that binding a listener
     *     to 'readable' marks ._readableState.needReadable=true
     * @param eventName {string} The Event name to listen for
     * @param cb {function} Callback function to call when eventName fires
     */
    Readable.prototype.on = function (eventName, cb) {
        var ret = Stream.prototype.on.call(this, eventName, cb),
            state = this._readableState;

        if (eventName === 'readable' && this.readable) {
            // Start reading on the first readable listener
            if ( ! state.readableListening) {
                state.readableListening = true;
                state.emittedReadable = false;
                state.needReadable = true;
                if ( ! state.reading) {
                    this.read(0);
                } else if (state.buffer.length) {
                    this._emitReadable();
                }
            }
        }
    };


    /**
     * Read data from the read buffer
     * @param [size] {number} The number of items to read from the buffer.
     *     If not provided, all data will be returned.
     *     If 0, There are some cases where you want to trigger a refresh of the
     *     underlying readable stream mechanisms, without actually consuming any
     *     data. In that case, you can call stream.read(0), which will always
     *     return null.
     *     If the internal read buffer is below the highWaterMark, and the
     *     stream is not currently reading, then calling read(0) will trigger a
     *     low-level _read call.
     *     There is almost never a need to do this externally.
     * @returns {object|null} An object from the read buffer, or null
     */
    Readable.prototype.read = function (size) {
        var state = this._readableState,
            originalSize = size,
            doRead,
            ret;

        state.calledRead = true;
        
        if (typeof size !== 'number' || size > 0) {
            // User wants data. We'll need to emit readable
            state.emittedReadable = false;
        }

        if (size === 0 && state.needReadable &&
           (state.buffer.length >= state.highWaterMark || state.ended)) {
            this._emitReadable();
            return null;
        }

        size = this._getSizeToRead(size);

        // If called with 0 once end has been emitted, return null
        if (size === 0 && state.ended) {
            if (state.buffer.length === 0) {
                this._endReadable();
            }
            return null;
        }

        // Determine whether ._read needs to be called to fill up the buffer
        doRead = state.needReadable;

        // We need to read if this read will lower the buffer size
        // below the highWaterMark
        if (state.buffer.length - size <= state.highWaterMark) {
            doRead = true;
        }

        // Never read if already reading or the stream has ended
        if (state.reading || state.ended) {
            doRead = false;
        }

        if (doRead) {
            state.reading = true;
            state.sync = true;
            if (state.buffer.length === 0) {
                state.needReadable = true;
            }
            // Go get more data!
            this._read(state.highWaterMark);
            state.sync = false;
            // state.reading will be falsy if _read executed synchronously
            // This could change the buffer so we recalc size
            if ( ! state.reading) {
                size = this._getSizeToRead(originalSize);
            }
        }

        if (size > 0) {
            ret = this._readFromBuffer(size);
        } else {
            ret = null;
        }

        if (ret === null) {
            state.needReadable = true;
            size = 0;
        }

        // If we have nothing in the buffer, then we want to know
        // as soon as we *do* get something into the buffer.
        if (state.buffer.length === 0 && !state.ended) {
            state.needReadable = true;
        }

        // If we happened to read() exactly the remaining amount in the
        // buffer, and the EOF has been seen at this point, then make sure
        // that we emit 'end' on the very next tick.
        if (state.ended && !state.endEmitted && state.buffer.length === 0) {
            this._endReadable();
        }

        return ret;
    };


    /**
     * @private
     * Fetch data asynchronously from an upstream source.
     * Implement this function, but do NOT call it directly.
     * When data is available, put it into the read queue by calling
     *     readable.push(chunk). If push returns false, then you should stop
     *     pushing. When _read is called again, you should start pushing more.
     */
    Readable.prototype._read = function () {
        this.emit('error', new Error('._read() not implemented'));
    };


    /**
     * @private
     * Get data from the internal read buffer
     * @returns {object|null} An object from the internal read buffer, or null
     *     if there is no more on the buffer
     */
    Readable.prototype._readFromBuffer = function () {
        var state = this._readableState,
            buffer = state.buffer;
        if (buffer.length === 0) {
            return null;
        } else {
            return buffer.shift();
        }
    };


    /**
     * @private
     * Get the appropriate number of objects to read from the buffer.
     * @param sizeAskedFor {number} The Number of items asked for by the user
     * @returns {number} The number of objects that should be returned from
     *     .read()
     */
    Readable.prototype._getSizeToRead = function (sizeAskedFor) {
        var state = this._readableState;
        // Don't read anything if there's nothing to read
        if (state.buffer.length === 0 && state.ended) {
            return 0;
        }
        // Assuming objectMode. Return at most one item
        return sizeAskedFor === 0 ? 0 : 1;
    };


    /**
     * @private
     * Cause the stream to emit 'readable'
     */
    Readable.prototype._emitReadable = function () {
        var self = this,
            state = this._readableState;
        state.needReadable = false;
        state.emittedReadable = true;
        if (state.sync) {
            util.nextTick(emitReadable);
        } else {
            emitReadable();
        }
        function emitReadable () {
            self.emit('readable');
        }
    };


    /**
     * @private
     * Mark the stream as closed and that it should not be readable again.
     * Often this happens after this.push(null);
     */
    Readable.prototype._endReadable = function () {
        var state = this._readableState;
        state.ended = true;
        if (state.buffer.length) {
            this._emitReadable();
        } else {
            this._emitEnd();
        }
    };


    /**
     * @private
     * Emit the end event if it hasn't been emitted yet
     */
    Readable.prototype._emitEnd = function () {
        var self = this,
            state = this._readableState;
        if (state.buffer.length > 0) {
            throw new Error("Tried to emit end event on a non-empty Readable");
        }
        if ( ! state.endEmitted && state.calledRead) {
            state.ended = true;
            util.nextTick(function () {
                // Check that we didn't get one last unshift.
                if (!state.endEmitted && state.buffer.length === 0) {
                    state.endEmitted = true;
                    self.readable = false;
                    self.emit('end');
                }
            });
        }
    };


    /**
     * The state objects contain other useful information for debugging the
     * state of streams in your programs. It is safe to look at them, but beyond
     * setting option flags in the constructor, it is not safe to modify them.
     * Copied from http://bit.ly/16eA5K7
     */
    function ReadableState(opts, stream) {
        opts = opts || {};

        // the point at which it stops calling _read() to fill the buffer
        // Note: 0 is a valid value, means "don't call _read preemptively ever"
        var hwm = opts.highWaterMark;
        this.highWaterMark = (hwm || hwm === 0) ? hwm : DEFAULT_HIGH_WATER_MARK;

        // cast to ints.
        this.highWaterMark = ~~this.highWaterMark;

        this.buffer = [];
        this.pipes = null;
        this.pipesCount = 0;
        this.flowing = false;
        this.ended = false;
        this.endEmitted = false;
        this.reading = false;

        // In streams that never have any data, and do push(null) right away,
        // the consumer can miss the 'end' event if they do some I/O before
        // consuming the stream.  So, we don't emit('end') until some reading
        // happens.
        this.calledRead = false;

        // a flag to be able to tell if the onwrite cb is called immediately,
        // or on a later tick.  We set this to true at first, becuase any
        // actions that shouldn't happen until "later" should generally also
        // not happen before the first write call.
        this.sync = true;

        // whenever we return null, then we set a flag to say
        // that we're awaiting a 'readable' event emission.
        this.needReadable = false;
        this.emittedReadable = false;
        this.readableListening = false;


        // object stream flag. Used to make read(n) ignore n and to
        // make all the buffer merging and length checks go away
        this.objectMode = !!opts.objectMode;

        // Crypto is kind of old and crusty.  Historically, its default string
        // encoding is 'binary' so we have to make this configurable.
        // Everything else in the universe uses 'utf8', though.
        this.defaultEncoding = opts.defaultEncoding || 'utf8';

        // when piping, we only care about 'readable' events that happen
        // after read()ing all the bytes and not getting any pushback.
        this.ranOut = false;

        // the number of writers that are awaiting a drain event in .pipe()s
        this.awaitDrain = 0;

        // if true, a maybeReadMore has been scheduled
        this.readingMore = false;

        this.decoder = null;
        this.encoding = null;
    }

    return Readable;
});