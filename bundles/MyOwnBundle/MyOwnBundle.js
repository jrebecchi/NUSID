var exports;
var MyOwnController = require('./controller/MyOwnController');
var Router = require('./router/Router');

exports.enable = function(app) {
    
    //Launch controller
    MyOwnController.init();
    
    //Launch router
    Router.init(app);
    
}