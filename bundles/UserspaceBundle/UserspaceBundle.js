var exports;
var PassportAuthentification = require('./service/authentification/PassportAuthentification');
var Router = require('./router/Router');
var mailer = require('express-mailer');
var UserController = require("./controller/UserController.js");
var PasswordResetController  = require("./controller/PasswordResetController.js");
var UserspaceController  = require("./controller/UserspaceController.js");
var UserModel = require('./model/UserModel');

exports.enable = function(app, expressMailOptions, dbOptions) {
    //Configure Userspace
    mailer.extend(app, expressMailOptions);
    
    //Init models
    UserModel.init(dbOptions);
    
    //Init controlers
    UserController.init(app);
    PasswordResetController.init(app);
    UserspaceController.init();
    
    //Init services
    PassportAuthentification.init();
    
    //Launch rooter
    Router.launchRouter(app, dbOptions);
};