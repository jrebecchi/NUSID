var exports;
var router = require('./router/Router');
var  mailer = require('express-mailer');

exports.enable = function(app, expressMailOptions, dbOptions) {
    //Configure Userspace
    mailer.extend(app, expressMailOptions);
    //Launch rooter
    router.launchRouter(app, dbOptions);
    
}