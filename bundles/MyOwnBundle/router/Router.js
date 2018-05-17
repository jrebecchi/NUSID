var exports;

var MyOwnControler = require("../controller/MyOwnController.js");
var proxy = require('connect-ensure-login');

exports.init = function(app) {

    app.get('/myprivatetab', proxy.ensureLoggedIn(),function(req, res){
        MyOwnControler.getMyPrivateTab(req, res);
    });
    
    app.get('/mypublictab', function(req, res) {
        MyOwnControler.getMyPublicTab(req, res);
    });
    
};