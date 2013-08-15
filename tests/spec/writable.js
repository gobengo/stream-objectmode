define(['jasmine', 'stream', 'stream/writable'], function (jasmine, Stream, Writable) {
    describe('stream/writable', function () {
    	it('defines .WritableState', function () {
    		expect(Writable.WritableState).toEqual(jasmine.any(Function));
    	});
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
            it('has a ._writableState', function () {
            	expect(stream._writableState)
            		.toEqual(jasmine.any(Writable.WritableState));
            });
            it('can be written to', function () {
            	var data = '11',
            		writeRet = stream.write(data);
            	expect(writeRet).toBe(true);
            });
            it('emits an error event if .pipe is called, since Writables ' +
               'should not be pipeable', function () {
                var onErrorSpy = jasmine.createSpy('onErrorSpy');
                stream.on('error', onErrorSpy);
                stream.pipe();
                waitsFor(function () {
                	return onErrorSpy.callCount
                }, 'error to be emitted');
            });
        });
    });
});