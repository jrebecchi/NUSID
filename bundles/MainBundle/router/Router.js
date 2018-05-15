var exports;

var MainController = require("../controller/MainController.js");
var proxy = require('connect-ensure-login');

exports.init = function(app) {
    var mainController = MainController.getInstance();
    
    app.get('/', function(req, res) {
        mainController.getIndex(req, res);
    });

    app.get('/dashboard', proxy.ensureLoggedIn(),function(req, res){
        mainController.getDashboard(req, res);
    });
    
    app.get('/legal', function(req, res) {
        mainController.getLegal(req, res);
    });
    
};