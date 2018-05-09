var exports;

var mainControler = require("../controler/MainControler.js");
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })


exports.launchRouter = function(app) {

    app.get('/', csrfProtection, function(req, res) {
        mainControler.getIndex(req, res);
    });

    app.get('/dashboard', require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        mainControler.getDashboard(req, res);
    });
    
    app.get('/legal', csrfProtection, function(req, res) {
        mainControler.getLegal(req, res);
    });
    
};