var exports;

var MyOwnControler = require("../controller/MyOwnController.js");
var proxy = require('connect-ensure-login');

exports.init = function(app) {
    var myOwnControler = MyOwnControler.getInstance();
    
    app.get('/myprivatetab', proxy.ensureLoggedIn(),function(req, res){
        myOwnControler.getMyPrivateTab(req, res);
    });
    
    app.get('/mypublictab', function(req, res) {
        myOwnControler.getMyPublicTab(req, res);
    });
    
};