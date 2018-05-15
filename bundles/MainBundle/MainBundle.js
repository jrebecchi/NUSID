var exports;
var Router = require('./router/Router');
var MainController = require("./controller/MainController.js");

exports.enable = function(app) {
    //Launch controlers
    MainController.init();
    
    //Launch router
    Router.init(app);
};