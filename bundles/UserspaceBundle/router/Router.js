var exports;

var userController = require("../controler/UserControler.js");
var passwordResetController  = require("../controler/PasswordResetControler.js");
var userspaceController  = require("../controler/UserspaceControler.js");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var bodyParser = require('body-parser')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })
var UserManagement = require('../model/UserModel');

exports.launchRouter = function(app, dbOptions) {
    
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
        userController.getCheckEmailExists(req, res, new UserManagement(dbOptions));
    });
    app.get('/username-exists', function(req, res) {
        userController.getCheckUsernameExists(req, res, new UserManagement(dbOptions));
    });
    app.post('/register', parseForm, csrfProtection, urlencodedParser, function(req, res) {
        userController.createUser(app, req, res, new UserManagement(dbOptions));
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
        userController.getSendConfirmationEmail(app, req, res, new UserManagement(dbOptions));
    });
    
    app.post('/password_reset', parseForm, csrfProtection, function(req, res){
        passwordResetController.resetPassword(app, req, res, new UserManagement(dbOptions));
    });
    
    app.get('/password_reset', csrfProtection, function(req, res){
        passwordResetController.showPasswordRecoverForm(req, res);
    });
    
    app.get('/password_renew', csrfProtection, function(req, res){
        passwordResetController.showChangePasswordForm(req, res);
    });
    
    app.post('/password_renew', parseForm, csrfProtection, function(req, res){
        passwordResetController.changePassword(app, req, res, new UserManagement(dbOptions));
    });
    app.get('/confirm_email', csrfProtection, function(req, res){
        userController.getConfirmEmail(req, res, new UserManagement(dbOptions));
    });
    app.get('/settings', csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userspaceController.getSettings(req, res);
    });
    app.post('/modify-password', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyPassword(req, res, new UserManagement(dbOptions));
    });
    app.post('/modify-username', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyUsername(req, res, new UserManagement(dbOptions));
    });
    app.post('/modify-email', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyEmail(app, req, res, new UserManagement(dbOptions));
    });
    app.post('/modify-firstname', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyFirstName(req, res, new UserManagement(dbOptions));
    });
    app.post('/modify-lastname', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postModifyLastName(req, res, new UserManagement(dbOptions));
    });
    app.post('/delete-account', parseForm, csrfProtection, require('connect-ensure-login').ensureLoggedIn(),function(req, res){
        userController.postDeleteAccount(req, res, new UserManagement(dbOptions));
    });
    
    // Configure the local strategy for use by Passport.
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new Strategy(
        function(email, password, cb) {
            var users = new UserManagement(dbOptions);
            users.load(function(err) {
                if (err) {
                    users.close();
                    return cb(err);
                }
                users.authenticateUser(email, password, function(err, result) {
                    if (err) {
                        users.close();
                        return cb(err);
                    }
                    if (!result.userExists || !result.passwordsMatch) {
                        users.close();
                        return cb(null, false);
                    } else {
                        users.getUserForToken(result.token, function(err, user) {
                            if (err) {
                                users.close();
                                return cb(err);
                            } else {
                                users.close();
                                return cb(null, user);
                            }
                        });
                    }
                });
            });
        }));

    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.
    passport.serializeUser(function(user, cb) {
        var users = new UserManagement(dbOptions);
        users.load(function(err) {
            if (err) {
                users.close();
                return cb(err);
            }
            users.getTokenForUsername(user.username, function(err, token) {
                if (err) {
                    users.close();
                    return cb(err);
                } else {
                    users.close();
                    return cb(null, token);
                }
            });
        });
    });

    passport.deserializeUser(function(token, cb) {
        var users = new UserManagement(dbOptions);
        users.load(function(err) {
            if (err) {
                users.close();
                return cb(err);
            }
            users.getUserForToken(token, function(err, user) {
                if (err) {
                    users.close();
                    return cb(err);
                } else {
                    users.close();
                    return cb(null, user);
                }
            });
        });
    });
    
};