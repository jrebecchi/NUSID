var exports;

var UserController = require("../controller/UserController.js");
var PasswordResetController  = require("../controller/PasswordResetController.js");
var UserspaceController  = require("../controller/UserspaceController.js");
var passport = require('passport');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

exports.launchRouter = function(app) {
    var passwordResetController = PasswordResetController.getInstance();
    var userspaceController = UserspaceController.getInstance();
    var userController = UserController.getInstance();
    var bodyParser = require('body-parser');
    var urlencodedParser = bodyParser.urlencoded({
        extended: false
    });
    
    app.get('/register', csrfProtection, function(req, res) {
        userspaceController.getRegister(req, res);
    });
    app.get('/login', csrfProtection, function(req, res) {
        userspaceController.getLogin(req, res);
    });
    app.get('/email-exists', function(req, res) {
        userController.getCheckEmailExists(req, res);
    });
    app.get('/username-exists', function(req, res) {
        userController.getCheckUsernameExists(req, res);
    });
    app.post('/register', parseForm, csrfProtection, urlencodedParser, function(req, res) {
        userController.createUser(req, res);
    });
    app.post('/login', parseForm, csrfProtection,
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
    
    app.get('/send_confirmation_email', require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.getSendConfirmationEmail(req, res);
    });
    
    app.post('/password_reset', parseForm, csrfProtection, function(req, res){
        passwordResetController.resetPassword(req, res);
    });
    
    app.get('/password_reset', csrfProtection, function(req, res){
        passwordResetController.showPasswordRecoverForm(req, res);
    });
    
    app.get('/password_renew', csrfProtection, function(req, res){
        passwordResetController.showChangePasswordForm(req, res);
    });
    
    app.post('/password_renew', parseForm, csrfProtection, function(req, res){
        passwordResetController.changePassword(req, res);
    });
    app.get('/confirm_email', csrfProtection, function(req, res){
        userController.getConfirmEmail(req, res);
    });
    app.get('/settings', csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userspaceController.getSettings(req, res);
    });
    app.post('/modify-password', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyPassword(req, res);
    });
    app.post('/modify-username', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyUsername(req, res);
    });
    app.post('/modify-email', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyEmail(req, res);
    });
    app.post('/modify-firstname', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyFirstName(req, res);
    });
    app.post('/modify-lastname', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyLastName(req, res);
    });
    app.post('/delete-account', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postDeleteAccount(req, res);
    });
};