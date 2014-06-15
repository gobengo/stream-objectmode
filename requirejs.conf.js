require.config({
  paths: {
    jasmine: 'lib/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'lib/jasmine/lib/jasmine-core/jasmine-html',
    "event-emitter": 'lib/event-emitter/src/event-emitter',
    'inherits': 'lib/inherits/inherits',
    'util-extend': 'node_modules/util-extend/extend'
  },
  packages: [{
    name: 'stream',
    location: 'src/'
  }],
  shim: {
    jasmine: {
        exports: 'jasmine'
    },
    'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine'
    }
  }
});
