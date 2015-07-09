var done = false;

//(function () {
//  var name = 'creep';
//  var age = 123;
//
//  cola.use(function (require) {
//    var dom = require('./lib/dom');
//    var ajax = require('./lib/ajax');
//  });
//
//  cola.use(function (require) {
//    var dom = require('./lib/dom');
//    var cookie = require('./lib/cookie');
//  });
//
//})();


cola.use(function (require) {
    var ajax = require('./lib/ajax');
    var event = require('./lib/event')
});
