var nodemailer = require("nodemailer");

module.exports.send = function(req, params, cb){
    var app = req.app;
    var email = params.email; 
    var subject = params.subject;
    var template = params.template; 
    var locals = params.locals;
    var from = global.userspaceMailOptions; 
    var transporter = nodemailer.createTransport(global.userspaceMailOptions);
    
    app.render(template, locals, function (err, html) {
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
