var exports;

var myOwnControler = require("../controler/MyOwnControler.js");
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })


exports.launchRouter = function(app) {

    app.get('/myprivatetab', require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        myOwnControler.getMyPrivateTab(req, res);
    });
    
    app.get('/mypublictab', csrfProtection, function(req, res) {
        myOwnControler.getMyPublicTab(req, res);
    });
    
};