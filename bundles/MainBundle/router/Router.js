var exports;

var MainController = require("../controller/MainController.js");
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });


exports.launchRouter = function(app) {
    var mainController = MainController.getInstance();
    
    app.get('/', csrfProtection, function(req, res) {
        mainController.getIndex(req, res);
    });

    app.get('/dashboard', require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        mainController.getDashboard(req, res);
    });
    
    app.get('/legal', csrfProtection, function(req, res) {
        mainController.getLegal(req, res);
    });
    
};