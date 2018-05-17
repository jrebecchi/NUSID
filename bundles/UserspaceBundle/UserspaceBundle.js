var exports;
var PassportAuthentification = require('./service/authentification/PassportAuthentification');
var Router = require('./router/Router');

exports.init = function(app, emailConfig, dbOptions) {

    //Init services
    PassportAuthentification.init();

    //Launch rooter
    Router.init(app);
};