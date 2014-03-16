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
