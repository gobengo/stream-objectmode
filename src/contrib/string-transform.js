define(['stream/transform', 'stream/util'], function (Transform, util) {
    "use strict";

    /**
     * A Transform that converts all inputs to Strings
     */
    function StringTransform (array) {
        Transform.call(this);
    }

    util.inherits(StringTransform, Transform);


    /**
     * @private
     * Called by Transform base when there is data to transform,
     * then pass it to this.push() and call the done callback
     */
    StringTransform.prototype._transform = function (data, done) {
        this.push(String(data));
        done();
    };


    return StringTransform;
 });