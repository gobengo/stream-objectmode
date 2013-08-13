define([
    'stream/util',
    'event-emitter',
    'stream/readable'],
function (util, EventEmitter, Readable) {
    "use strict";

    /**
     * Base class for all Streams
     */
    function Stream (opts) {
        EventEmitter.call(this);
    }
    util.inherits(Stream, EventEmitter);

    Stream.Readable = Readable;
    return Stream;
});