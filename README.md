stream
======

This is a browser-compatible version of the node.js `stream` module. Thus, you can use the node docs as the docs for this library: http://nodejs.org/api/stream.html.

This is a quick example of how to make a readable stream of random numbers

```javascript
var Readable = require('stream/readable');

function createRandomNumberStream (opts) {
    var randomNumberStream = new Readable(opts);
    randomNumberStream._read = function () {
        this.push(Math.random());
    };
    return randomNumberStream;
}

var myRandomNumberStream = createRandomNumberStream();
myRandomNumberStream.on('data', function (randomNumber) {
    console.log(randomNumber);
});
```

There is one slight addition from what node implements, and that is the `Readable.prototype.forEach` method, which behaves much like the `Observable.prototype.forEach` method (docced as [subscribe](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservableprototypesubscribeobserver--onnext-onerror-oncompleted)) in [RxJS](https://github.com/Reactive-Extensions/RxJS/blob/master/src/core/observable.js#L28);

```javascript
// full signature
var subscription = readable.forEach(onData, onError, onEnd);
// Remove relevant listeners
subscription.dispose();

// or, more commonly
readable.forEach(function (thing) {
    // do something
    console.log(thing);
});
```
