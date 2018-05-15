var exports;

var UserController = require("../controller/UserController.js");
var PasswordResetController  = require("../controller/PasswordResetController.js");
var UserspaceController  = require("../controller/UserspaceController.js");
var passport = require('passport');
var proxy = require('connect-ensure-login');

exports.init = function(app) {
    var passwordResetController = PasswordResetController.getInstance();
    var userspaceController = UserspaceController.getInstance();
    var userController = UserController.getInstance();

    app.get('/register', function(req, res) {
        userspaceController.getRegister(req, res);
    });
    app.get('/login', function(req, res) {
        userspaceController.getLogin(req, res);
    });
    app.get('/email-exists', function(req, res) {
        userController.getCheckEmailExists(req, res);
    });
    app.get('/username-exists', function(req, res) {
        userController.getCheckUsernameExists(req, res);
    });
    app.post('/register', function(req, res) {
        userController.createUser(req, res);
    });
    app.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid username or password.', 
        }),
        function(req, res) {
            userspaceController.postLogin(req, res);
    });
    
    app.get('/logout', function(req, res){
        userspaceController.getLogout(req, res);
    });
    
    app.get('/send_confirmation_email', proxy.ensureLoggedIn(),function(req, res){
        userController.getSendConfirmationEmail(req, res);
    });
    
    app.post('/password_reset', function(req, res){
        passwordResetController.resetPassword(req, res);
    });
    
    app.get('/password_reset', function(req, res){
        passwordResetController.showPasswordRecoverForm(req, res);
    });
    
    app.get('/password_renew', function(req, res){
        passwordResetController.showChangePasswordForm(req, res);
    });
    
    app.post('/password_renew', function(req, res){
        passwordResetController.changePassword(req, res);
    });
    app.get('/confirm_email', function(req, res){
        userController.getConfirmEmail(req, res);
    });
    app.get('/settings', proxy.ensureLoggedIn(),function(req, res){
        userspaceController.getSettings(req, res);
    });
    app.post('/modify-password', proxy.ensureLoggedIn(),function(req, res){
        userController.postModifyPassword(req, res);
    });
    app.post('/modify-username', proxy.ensureLoggedIn(),function(req, res){
        userController.postModifyUsername(req, res);
    });
    app.post('/modify-email', proxy.ensureLoggedIn(),function(req, res){
        userController.postModifyEmail(req, res);
    });
    app.post('/modify-firstname', proxy.ensureLoggedIn(),function(req, res){
        userController.postModifyFirstName(req, res);
    });
    app.post('/modify-lastname', proxy.ensureLoggedIn(),function(req, res){
        userController.postModifyLastName(req, res);
    });
    app.post('/delete-account', proxy.ensureLoggedIn(),function(req, res){
        userController.postDeleteAccount(req, res);
    });
};