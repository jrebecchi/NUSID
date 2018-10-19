const {
    EmailAlreadyExistsError,
    UsernameAlreadyExistsError,
    WrongPasswordError,
    UpdatePasswordTooLateError,
    EmailNotSentError,
    UserNotFound
} = require('./ErrorTypes')

module.exports = function (err, req, res, next){
    if(err instanceof UsernameAlreadyExistsError){
        req.flash('error', 'Username already exists');
        if (req.originalUrl === "/register")
            res.redirect('/register?username='+err.user.username+'&email='+err.user.email+'&lastName='+err.user.extras.lastName+'&firstName='+err.user.extras.firstName);
        if (req.originalUrl === "/modify-username")
            res.redirect('/settings');
    } else if(err instanceof EmailAlreadyExistsError){
        req.flash('error', 'Email already exists');
        if (req.originalUrl === "/register")
            res.redirect('/register?username='+err.user.username+'&email='+err.user.email+'&lastName='+err.user.extras.lastName+'&firstName='+err.user.extras.firstName);
        if (req.originalUrl === "/modify-email")
            res.redirect('/settings');
    } else if(err instanceof WrongPasswordError){
        req.flash('error', 'You entered a wrong password !');
        res.redirect('/settings');
    } else if (err instanceof UpdatePasswordTooLateError){
        req.flash('error', "This link has expired, please ask a new one.");
        res.redirect('/password_reset');
    } else if(err instanceof EmailNotSentError){
        req.flash('error', 'Mail not sent, an error has occured.');
        if (req.originalUrl === "/register")
            res.redirect('/login');
        if (req.originalUrl === "/modify-email")
            res.redirect('/settings');
    } else if(err instanceof UserNotFound){
        if (req.originalUrl === "/password_reset"){
            req.flash('info', "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.");
            res.redirect('/login');
        } else if(req.originalUrl.includes("/confirm_email")){
            req.flash('error', 'This link is no longer valid.');
            res.redirect('/');
        } else {
            console.log(err);
            console.log(req);
            req.flash('error', 'User not found');
            req.logout(); 
        }
    } else {
        next(err);
    }
};