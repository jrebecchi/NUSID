var exports;

var MainController = require("../controller/MainController.js");
var proxy = require('connect-ensure-login');

exports.init = function(app) {

    app.get('/', function(req, res) {
        MainController.getIndex(req, res);
    });

    app.get('/dashboard', proxy.ensureLoggedIn(),function(req, res){
        MainController.getDashboard(req, res);
    });
    
    app.get('/legal', function(req, res) {
        MainController.getLegal(req, res);
    });
    
};