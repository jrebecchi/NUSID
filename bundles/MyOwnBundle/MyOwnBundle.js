const Router = require('./router/Router');

exports.init = function(app) {
    //Launch router
    app.use(Router)
};