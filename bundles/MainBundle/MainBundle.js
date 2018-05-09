var exports;
var router = require('./router/Router');

exports.enable = function(app) {
    //Launch router
    router.launchRouter(app);
    
}