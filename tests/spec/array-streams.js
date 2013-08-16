define([
    'jasmine',
    'stream/util',
    'stream/contrib/readable-array',
    'stream/contrib/writable-array'],
function (jasmine, util, ReadableArray, WritableArray) {

    describe('WritableArray', function () {
        it('can be written to three times', function () {
            var stream = new WritableArray();
            stream.write(1);
            stream.write(2);
            stream.write(3);
            expect(stream.get()).toEqual([1,2,3]);
        });
    });

    describe('ReadableArray', function () {
        it('can be read', function () {
            var stream = new ReadableArray([1,2,3]);
            expect(stream.read()).toBe(1);
            expect(stream.read()).toBe(2);
            expect(stream.read()).toBe(3);
        });
    });
});