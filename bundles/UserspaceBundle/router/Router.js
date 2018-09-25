var exports;

var UserController = require("../controller/UserController.js");
var PasswordResetController  = require("../controller/PasswordResetController.js");
var UserspaceController  = require("../controller/UserspaceController.js");
var passport = require('passport');
var proxy = require('connect-ensure-login');

exports.init = function(app) {

    app.get('/register', function(req, res) {
        UserspaceController.getRegister(req, res);
    });
    app.get('/login', function(req, res) {
        UserspaceController.getLogin(req, res);
    });
    app.get('/email-exists', function(req, res) {
        UserController.getCheckEmailExists(req, res);
    });
    app.get('/username-exists', function(req, res) {
        UserController.getCheckUsernameExists(req, res);
    });
    app.post('/register', function(req, res) {
        UserController.postCreateUser(req, res);
    });
    app.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.', 
        }),
        function(req, res) {
            UserspaceController.postLogin(req, res);
    });
    
    app.get('/logout', function(req, res){
        UserspaceController.getLogout(req, res);
    });
    
    app.get('/send_confirmation_email', proxy.ensureLoggedIn(),function(req, res){
        UserController.getSendConfirmationEmail(req, res);
    });
    
    app.post('/password_reset', function(req, res){
        PasswordResetController.postResetPassword(req, res);
    });
    
    app.get('/password_reset', function(req, res){
        PasswordResetController.getShowPasswordRecoveryForm(req, res);
    });
    
    app.get('/password_renew', function(req, res){
        PasswordResetController.getShowChangePasswordForm(req, res);
    });
    
    app.post('/password_renew', function(req, res){
        PasswordResetController.postChangePassword(req, res);
    });
    app.get('/confirm_email', function(req, res){
        UserController.getConfirmEmail(req, res);
    });
    app.get('/settings', proxy.ensureLoggedIn(),function(req, res){
        UserspaceController.getSettings(req, res);
    });
    app.post('/modify-password', proxy.ensureLoggedIn(),function(req, res){
        UserController.postModifyPassword(req, res);
    });
    app.post('/modify-username', proxy.ensureLoggedIn(),function(req, res){
        UserController.postModifyUsername(req, res);
    });
    app.post('/modify-email', proxy.ensureLoggedIn(),function(req, res){
        UserController.postModifyEmail(req, res);
    });
    app.post('/modify-firstname', proxy.ensureLoggedIn(),function(req, res){
        UserController.postModifyFirstName(req, res);
    });
    app.post('/modify-lastname', proxy.ensureLoggedIn(),function(req, res){
        UserController.postModifyLastName(req, res);
    });
    app.post('/delete-account', proxy.ensureLoggedIn(),function(req, res){
        UserController.postDeleteAccount(req, res);
    });
};