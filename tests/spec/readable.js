define(['jasmine', 'stream', 'stream/readable'], function (jasmine, Stream, Readable) {
    describe('stream/readable', function () {
        describe('when constructed', function () {
            var stream;
            beforeEach(function () {
                stream = new Readable();
            });
            it('is instanceof Stream and Readable', function () {
                expect(stream instanceof Stream).toBe(true);
                expect(stream instanceof Readable).toBe(true);
            });
            it('is .readable', function () {
                expect(stream.readable).toBe(true);
            });
        });

        describe('.read', function () {
            var items,
                stream;
            beforeEach(function() {
                stream = new Readable();
                spyOn(stream, '_read').andCallThrough();
                items = [1,/a/gi,3,{},'5',6];
                for (var i=0, numItems = items.length; i < numItems; i++) {
                    stream.push(items[i]);
                }
            });
            it('is a method on Readable instances', function () {
                expect(stream.read instanceof Function).toBe(true);
            });
            it('returns null if called with 0', function () {
                // In this case, it should actually call ._read
                expect(stream.read(0)).toBe(null);
                expect(stream._read).toHaveBeenCalled();
            });
            it('returns the first item on the buffer if called with no arguments', function () {
                expect(stream.read()).toEqual(items[0]);
                expect(stream._readableState.buffer.length).toBe(items.length - 1);
            });
            it('always returns 1 item if .read(N) is called (objectMode)', function () {
                var N = 3,
                    chunk = stream.read(N);
                expect(chunk).toBe(items[0]);
            });
            describe('when .read(N) is called and N > .state.buffer.length', function () {
                var N,
                    chunk;
                beforeEach(function () {
                    N = 20;
                    chunk = stream.read(N);
                })
                it('returns the first item on the buffer', function () {
                    expect(chunk).toBe(items[0]);
                });
            });
        });

        describe('.push', function () {
            var stream;
            beforeEach(function () {
                stream = new Readable();
            });
            it('is a method on Readable instances', function () {
                expect(stream.push instanceof Function).toBe(true);
            });
            describe('when called with a chunk of data', function () {
                var chunk,
                    onReadableSpy;
                beforeEach(function () {
                    onReadableSpy = jasmine.createSpy('onReadableSpy');
                    stream.on('readable', onReadableSpy);
                    chunk = 'abcde';
                    stream.push(chunk);
                });
                it('the stream emits readable', function () {
                    waitsFor(function () {
                        return onReadableSpy.callCount;
                    }, 'stream to emit readable');
                    runs(function () {
                        expect(onReadableSpy).toHaveBeenCalled();
                    })
                });
                describe('and then called with null', function () {
                    var onEndSpy;
                    beforeEach(function () {
                        onEndSpy = jasmine.createSpy('onEndSpy');
                        stream.on('end', onEndSpy);
                        stream.push(null);
                    });
                    it('the stream does not emit end if there is still content in the buffer', function () {
                        expect(onEndSpy).not.toHaveBeenCalled();
                    });
                    it('the stream emits end once all content has been read from the buffer', function () {
                        while (stream.read() !== null) {}
                        waitsFor(function () {
                            return onEndSpy.callCount;
                        }, 500, 'stream to emit end')
                        runs(function () {
                            expect(onEndSpy).toHaveBeenCalled();
                        });
                    });
                });
            });
            describe('when called with null before being read', function () {
                var onEndSpy;
                beforeEach(function () {
                    onEndSpy = jasmine.createSpy('onEndSpy');
                    stream.on('end', onEndSpy);
                    stream.push(null);
                });
                it('the stream does not emit end', function () {
                    expect(onEndSpy).not.toHaveBeenCalled();
                });
            });
        });
    });
});