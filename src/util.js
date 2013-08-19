define(function () {
    "use strict";

    var exports = {};

    exports.inherits = function(a, b){
        var Fn = function(){};
        Fn.prototype = b.prototype;
        a.prototype = new Fn();
        a.prototype.constructor = a;
    };

    /**
     * Extend the prototype of a Function with any keys on Base.prototype
     * that aren't already on that Functions prototype
     */
    exports.prototypallyInherits = function (a, Base) {
        var baseKeys = exports.keys(Base.prototype),
            baseKeysLength = baseKeys.length,
            methodName;
        for (var i=0; i < baseKeysLength; i++) {
            methodName = baseKeys[i];
            if ( ! a.prototype[methodName]) {
                a.prototype[methodName] = Base.prototype[methodName];
            }
        }
    };

    exports.nextTick = (function () {
        if (typeof setImmediate == 'function') {
            return function(f){ setImmediate(f); };
        }
        // fallback for other environments / postMessage behaves badly on IE8
        else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
            return function(f){ setTimeout(f); };
        } else {
            var q = [];

            window.addEventListener('message', function(){
                var i = 0;
                while (i < q.length) {
                    try { q[i++](); }
                    catch (e) {
                        q = q.slice(i);
                        window.postMessage('tic!', '*');
                        throw e;
                    }
                }
                q.length = 0;
            }, true);

            return function(fn){
                if (!q.length) window.postMessage('tic!', '*');
                q.push(fn);
            };
        }
    }());

    /**
     * Object.keys shim
     */
    exports.keys = Object.keys || (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
            DontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            DontEnumsLength = DontEnums.length;

        return function (o) {
            if (typeof o != "object" && typeof o != "function" || o === null)
                throw new TypeError("Object.keys called on a non-object");

            var result = [];
            for (var name in o) {
                if (hasOwnProperty.call(o, name))
                    result.push(name);
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < DontEnumsLength; i++) {
                    if (hasOwnProperty.call(o, DontEnums[i]))
                        result.push(DontEnums[i]);
                }
            }

            return result;
        };
    })();

    return exports;
});