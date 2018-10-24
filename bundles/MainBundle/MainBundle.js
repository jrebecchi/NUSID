const Router = require('./router/Router');

exports.init = function(app) {
    //Launch rooter
    app.use(Router)
};