var nodemailer = require("nodemailer");

var UserspaceMailer = function(app, emailConfig){
    this.app = app;
    this.emailConfig = emailConfig;
    
    this.send = function(params, cb){
        var email = params.email; 
        var subject = params.subject;
        var template = params.template; 
        var locals = params.locals;
        var from = this.emailConfig.from; 
        var transporter = nodemailer.createTransport(this.emailConfig);
        
        this.app.render(template, locals, function (err, html) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: from,
                    to: email,
                    subject: subject,
                    html: html
                };
                transporter.sendMail(mainOptions, cb);
            }
        });
    };
};

module.exports.isInitialized = false;
module.exports.instance = null;

module.exports.init = function(app, emailConfig){
    this.isInitialized = true;
    this.instance = new UserspaceMailer(app, emailConfig);
};

module.exports.getInstance = function(){
    if(!this.isInitialized){
        throw new Error('The UserspaceMailer has not been initialized !');
    } else {
        return this.instance;
    }
};