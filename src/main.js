define([
    'inherits',
    'event-emitter',
    './readable',
    './writable',
    './transform',
    './duplex',
    './passthrough'],
function (inherits, EventEmitter, Readable, Writable, Transform, Duplex, PassThrough) {
    "use strict";

    /**
     * Base class for all Streams
     */
    function Stream (opts) {
        EventEmitter.call(this);
    }
    inherits(Stream, EventEmitter);

    Stream.Readable = Readable;
    Stream.Writable = Writable;
    Stream.Transform = Transform;
    Stream.Duplex = Duplex;
    Stream.PassThrough = PassThrough;
    return Stream;
});
