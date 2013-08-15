define(['jasmine', 'stream', 'stream/writable'], function (jasmine, Stream, Writable) {
    describe('stream/writable', function () {
        describe('when constructed', function () {
            var stream;
            beforeEach(function () {
                stream = new Writable();
            });
            it('is instanceof Stream and Writable', function () {
                expect(stream instanceof Stream).toBe(true);
                expect(stream instanceof Writable).toBe(true);
            });
            it('is .writable', function () {
                expect(stream.writable).toBe(true);
            });
        });
    });
});