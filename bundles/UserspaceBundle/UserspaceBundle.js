var exports;
var PassportAuthentification = require('./service/authentification/PassportAuthentification');
var UserspaceMailer = require('./service/mailer/UserspaceMailer');
var Router = require('./router/Router');
var UserController = require("./controller/UserController.js");
var PasswordResetController  = require("./controller/PasswordResetController.js");
var UserspaceController  = require("./controller/UserspaceController.js");
var UserModel = require('./model/UserModel');

exports.enable = function(app, emailConfig, dbOptions) {
    //Init models
    UserModel.init(dbOptions);
    
    //Init controlers
    UserController.init(app);
    PasswordResetController.init(app);
    UserspaceController.init();
    
    //Init services
    PassportAuthentification.init();
    UserspaceMailer.init(app, emailConfig);
    
    //Launch rooter
    Router.init(app, dbOptions);
};