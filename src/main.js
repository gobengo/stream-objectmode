define([
    'stream/util',
    'event-emitter'],
function (util, EventEmitter) {
    "use strict";

    /**
     * Base class for all Streams
     */
    function Stream (opts) {
        EventEmitter.call(this);
    }
    util.inherits(Stream, EventEmitter);

    return Stream;
});