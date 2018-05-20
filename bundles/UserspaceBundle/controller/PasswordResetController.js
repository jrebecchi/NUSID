var InputValidator = require("../service/forms/InputValidatorService");
var registrationCB = require("../service/forms/callbacks/ValidationCallbacks");
var UserModel = require("../model/UserModel");
var UserspaceMailer = require('../service/mailer/UserspaceMailer');
var crypto = require('crypto');
var RECOVER_PASSWORD_TOKEN_LENGTH = 64;

var exports;

var isFormResetFormValid = (req, res) => {
    var isFormValid = true;
    var iv = new InputValidator();
    iv.testInput(registrationCB.testEmail,req.body.email);
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        isFormValid = false;
    }        
    return isFormValid;
};

var isFormChangePasswordFormValid = (req, res) => {
    var isFormValid = true;
    var iv = new InputValidator();
    iv.testInput(registrationCB.testPassword,req.body.password);
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        isFormValid = false;
    }         
    iv.testInput(registrationCB.testConfirmPassword,req.body.confirm_password, req.body.password);
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        isFormValid = false;
    }   
    iv.testInput(registrationCB.testEmail,req.body.email);
    return isFormValid;
};

var generateToken = (cb) => {
    return crypto.randomBytes(RECOVER_PASSWORD_TOKEN_LENGTH, cb).toString("hex");
};

exports.postChangePassword = function (req, res){
    
    if(req.user !== undefined){
        req.flash('error', "Oups, you are already logged in !");
        res.redirect('/dashboard');
        return;
    }
    var token = req.body.token;
    var newPassword = req.body.password;

    if(!isFormChangePasswordFormValid(req, res)){
        res.redirect('/password_renew?token='+token);
        return;
    }
    
    var users = new UserModel(); 
    users.load(function(err) {
        if(err){
            users.close();
            req.flash('error', "A mistake happened in our side, please retry !");
            res.redirect('/login');
            return;
        }
        users.userFromUpdatePasswordTokenExists(token, function(err, exists) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened in our side, please retry !");
                res.redirect('/login');
                return;
            }
            if (exists) {
                users.getUserForUpdatePasswordToken(token, function(err, user){
                    if(err){
                        req.flash('error', "A mistake has occured.");
                        res.redirect('/login');
                        users.close();
                        return;
                    } else {
                        var updatePasswordProperties = {
                            updatePasswordToken : null,
                            passwordUpdateRequestDate : null
                        };
                        var resetDate = new Date(user.extras.passwordUpdateRequestDate);
                        var actualDate = new Date();
                        var diff = Math.abs(actualDate - resetDate);
                        var minutes = Math.floor((diff/1000)/60);
                        if(minutes >= 60){
                            users.addExtras({email : user.email}, updatePasswordProperties, function(err, extras){
                                if(err){
                                    users.close();
                                    req.flash('error', "A mistake happened in our side, please retry !");
                                    res.redirect('/login');
                                    return;
                                }
                                req.flash('error', "This link has expired, please ask a new one.");
                                res.redirect('/password_reset');
                                users.close();
                                return;
                            });
                        }
                        else {
                            users.resetPassword(user.email, newPassword,function(err){
                                if(err){
                                    users.close();
                                    req.flash('error', "A mistake happened in our side, please retry !");
                                    res.redirect('/login');
                                    return;
                                }
                                users.addExtras({email : user.email}, updatePasswordProperties, function(err, extras){
                                    if(err){
                                        users.close();
                                        req.flash('error', "A mistake happened in our side, please retry !");
                                        res.redirect('/login');
                                        return;
                                    }
                                    req.flash('success', "Your password has been updated.");
                                    res.redirect('/login');
                                    users.close();
                                    return;
                                });
                            });
                        }
                    }
                });
                
            } else {
                //We never say to a user if an email is or is not in our database for security reasons
                users.close();
                req.flash('error', "This token has never existed or is no longer in our database.");
                res.redirect('/login');
                return;
            }
        });
    });
};

exports.getShowChangePasswordForm = function (req, res){
    if(req.user !== undefined){
        req.flash('error', "Oups, you are already logged in !");
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/change-password.ejs', {token: req.query.token, csrfToken: req.csrfToken() });
};

exports.getShowPasswordRecoveryForm = function (req, res){
    if(req.user !== undefined){
        req.flash('error', "Oups, you are already logged in !");
        res.redirect('/dashboard');
        return;
    }
    res.render('pages/forgot-password.ejs', {email: req.query.email, csrfToken: req.csrfToken() });
};

exports.postResetPassword = function (req, res){
    
    var users = new UserModel(); 
    
    if(req.user !== undefined){
        req.flash('error', "Oups, you are already logged in !");
        res.redirect('/dashboard');
        return;
    }
    var email = req.body.email;

    if(!isFormResetFormValid(req, res)){
        res.redirect('/password_reset?email='+email);
        return;
    }
    
    users.load(function(err) {
        if(err){
            users.close();
            req.flash('error', "A mistake happened in our side, please retry !");
            res.redirect('/');
            return;
        }
        users.emailExists(email, function(err, exists) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened in our side, please retry !");
                res.redirect('/');
                return;
            }
            if (exists) {
                var updatePasswordProperties = {
                    updatePasswordToken : generateToken(),
                    passwordUpdateRequestDate : new Date()
                };
                users.addExtras({email : email}, updatePasswordProperties, function(err, extras){
                    console.log(err);
                    users.close();
                });
                sendPasswordRecoveryEmail(req, res, email, updatePasswordProperties.updatePasswordToken);
            } else {
                //We never say to a user if an email is or is not in our database for security reasons
                users.close();
                req.flash('info', "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.");
                res.redirect('/login');
            }
        });
    });
};

var sendPasswordRecoveryEmail = (req, res, email, updatePasswordToken) => {
    UserspaceMailer.send(req,{
        template:'emails/reset_password.ejs', 
        locals:{
            updatePasswordToken: updatePasswordToken,
            host: req.headers.host
        },
        email : email, 
        subject:'Password Recovery',
    }, function (err) {
        if (err) {
            req.flash('error', "Mail not sent, an error has occured.");
            res.redirect('/');
            return;
        }
        req.flash('info', "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.");
        res.redirect('/login');
    });
};
    
