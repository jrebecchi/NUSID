var exports;

var checkIfEmailConfirmed = function(req, res){
   if(!req.user.extras.emailConfirmed){
        res.flash('warning', "Please confirm your email by clicking on the link we sent you at this adress! Click <a href=\"/send_confirmation_email\">here</a> to resend the link.");
    } 
};

exports.getDashboard = function (req, res){
    checkIfEmailConfirmed(req, res);
    res.render('pages/dashboard.ejs', { user: req.user });
};

exports.getIndex = function (req, res){
    res.render('pages/index.ejs', { user: req.user, csrfToken: req.csrfToken() });
};

exports.getLegal = function (req, res){
    res.render('pages/legal.ejs', { user: req.user, csrfToken: req.csrfToken() });
};


