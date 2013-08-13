define(['stream/util', 'event-emitter'], function (util, EventEmitter) {
    function Stream (opts) {
        EventEmitter.call(this);
    };
    util.inherits(Stream, EventEmitter);

    return Stream;
});