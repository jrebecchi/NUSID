var exports;
/*
var checkIfEmailConfirmed = function(req, res){
   if(!req.user.extras.emailConfirmed){
        res.flash('warning', "Please confirm your email by clicking on the link we sent you at this adress! Click <a href=\"/send_confirmation_email\">here</a> to resend the link.");
    } 
};

exports.getDashboard = function (req, res){
    checkIfEmailConfirmed(req, res);
    res.render('pages/dashboard.ejs', { user: req.user });
};
*/

exports.getLogout = function (req, res){
    req.logout();
    res.redirect('/');
};

exports.getLogin = function (req, res){
    if(req.user !== undefined){
        req.flash('error', "Oups, you are already logged in !");
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/login.ejs',  {csrfToken: req.csrfToken()});
};

exports.getRegister = function (req, res){
    if(req.user !== undefined){
        req.flash('error', "To register a new account you need to deconnect yourself !");
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/register.ejs', {
        email: req.query.email, 
        username: req.query.username, 
        lastName:req.query.lastName, 
        firstName:req.query.firstName,
        csrfToken: req.csrfToken()
    });
};

exports.postLogin = function (req, res){
    if(!req.body.remember) {
        req.session.cookie.expires = false; // Cookie expires at end of session
    }
    res.redirect('/dashboard');
};

exports.getSettings = function (req, res){
    res.render('pages/settings.ejs', { user: req.user, csrfToken: req.csrfToken() });
};