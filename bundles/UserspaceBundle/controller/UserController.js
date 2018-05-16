var InputValidator = require("../service/forms/InputValidatorService");
var registrationCB = require("../service/forms/callbacks/RegistrationCallbacks");
var UserModel = require("../model/UserModel");
var UserspaceMailer = require('../service/mailer/UserspaceMailer');
var crypto = require('crypto');
var CONFIRM_EMAIL_TOKEN_LENGTH = 64;

var UserController = function(app){
    this.app = app;

    var generateToken = function (cb) {
        return crypto.randomBytes(CONFIRM_EMAIL_TOKEN_LENGTH, cb).toString("hex");
    };
    
    
    var isRegistrationFormValid = function(req, res){
        var isFormValid = true;
        var iv = new InputValidator();
        iv.testInput(registrationCB.testUsername, req.body.username); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            isFormValid = false;
        }
        iv.testInput(registrationCB.testEmail,req.body.email);
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            isFormValid = false;
        }        
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
        iv.testInput(registrationCB.testName,req.body.first_name);
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            isFormValid = false;
        }           
        iv.testInput(registrationCB.testName,req.body.last_name);
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            isFormValid = false;
        }             
        iv.testInput(registrationCB.testImperativeCheckBox,req.body.conditions);
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            isFormValid = false;
        }
        return isFormValid;
    };
    
    this.getCheckEmailExists = function (req, res){
        var email = req.query.email;
        if (req.user !== undefined && req.user.email === email){
            res.json({
                "emailExists": false,
                "errorMsg": ""
            });
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened in our side, please retry !");
                return;
            }
            users.emailExists(email, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened in our side, please retry !");
                    return;
                }
                if (exists) {
                    users.close();
                    res.json({
                        "emailExists": true,
                        "errorMsg": "This email address is already used. You can sign in with this one or type another !"
                    });
                } else {
                    users.close();
                    res.json({
                        "emailExists": false,
                        "errorMsg": ""
                    });
                }
            });
        });
    };
    
    this.getCheckUsernameExists = function (req, res){
        var username = req.query.username;
        if (req.user !== undefined && req.user.username === username){
            res.json({
                "usernameExists": false,
                "errorMsg": ""
            });
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened in our side, please retry !");
                return;
            }
            users.userExists(username, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened in our side, please retry !");
                    return;
                }
                if (exists) {
                    users.close();
                    res.json({
                        "usernameExists": true,
                        "errorMsg": "This username is already used. Please type another !"
                    });
                } else {
                    users.close();
                    res.json({
                        "usernameExists": false,
                        "errorMsg": ""
                    });
                }
            });
        });
    };
    
    this.getConfirmEmail = function(req, res){
        var token = req.query.token;
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                req.flash('error', "A mistake has occured.");
                res.redirect('/login');
                users.close();
                return;
            }
            users.userFromEmailConfirmationCodeExists(token, function(err, exists) {
                if(err){
                    req.flash('error', "A mistake has occured.");
                    res.redirect('/login');
                    users.close();
                    return;
                }
                if (exists) {
                    users.getUserForEmailConfirmationCode(token, function(err, user){
                        if(err){
                            req.flash('error', "A mistake has occured.");
                            res.redirect('/login');
                            users.close();
                            return;
                        } else {
                            var updateEmailProperties = {
                                emailConfirmed : true,
                                emailConfirmationCode : null
                            };
                            users.addExtras({email : user.email}, updateEmailProperties, function(err){
                                if(err){
                                    req.flash('error', "A mistake has occured.");
                                    res.redirect('/');
                                    users.close();
                                    return;
                                }
                                req.flash('success', "Your email adress is now confirmed !");
                                res.redirect('/');
                                users.close();
                                return;
                            });
                        } 
                    });
                } else {
                    req.flash('error', "Wrong email confirmation code, you can ask a new one in your profile settings");
                    res.redirect('/');
                    users.close();
                    return;
                }
            });
        });
    };
    
    this.createUser = function (req, res){
        if(req.user !== undefined){
            req.flash('error', "To register a new account you need to deconnect yourself !");
            res.redirect('/dashboard');
            return;
        }
        
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        var lastName = req.body.last_name;
        var firstName = req.body.first_name;
        var extras = {
            lastName: lastName , 
            firstName: firstName,
            emailConfirmed : false,
            emailConfirmationCode : generateToken()
        };
    
        if(!isRegistrationFormValid(req, res)){
            res.redirect('/register?username='+username+'&email='+email+'&lastName='+lastName+'&firstName='+firstName);
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened in our side, please retry !");
                res.redirect('/register');
                return;
            }
            users.userExists(username, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened in our side, please retry !");
                    res.redirect('/register');
                    return;
                }
                if (exists) {
                    users.close();
                    req.flash('error', 'User already exists');
                    res.redirect('/register?username='+username+'&email='+email+'&lastName='+lastName+'&firstName='+firstName);
    
                } else {
                    users.emailExists(email, function(err, exists) {
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened in our side, please retry !");
                            res.redirect('/register');
                            return;
                        }
                        if (exists) {
                            users.close();
                            req.flash('error', 'Email already exists');
                            res.redirect('/register?username='+username+'&email='+email+'&lastName='+lastName+'&firstName='+firstName);
    
                        } else {
                            users.createUser(username, email, password, extras, function (err) {
                                if(err){
                                    users.close();
                                    req.flash('error', "A mistake happened in our side, please retry !");
                                    res.redirect('/register');
                                    return;
                                }
                                users.close();
                                req.flash('success', 'User created !');
                                sendConfirmationEmail(req, res, extras.emailConfirmationCode, email, function(err){
                                    if (err) {
                                        req.flash('error', "Mail not sent, an error has occured.");
                                    }
                                    else {
                                        req.flash('info', "You will receive a confirmation link at your email address in a few minutes.");
                                    }
                                    res.redirect('/dashboard');  
                                });
                            });
                        }
                    });
                }   
            });
            
        });
    };
    
    this.getSendConfirmationEmail = function(req, res){
        sendConfirmationEmail(req, res, req.user.extras.emailConfirmationCode, req.user.email, function(err){
            if (err) {
                req.flash('error', "Mail not sent, an error has occured.");
            } else {
                req.flash('success', "You will receive a confirmation link at your email address in a few minutes.");
            }
            res.redirect('/dashboard');  
        });
    };
    
    this.postModifyPassword = function(req, res){
        var iv = new InputValidator();
        var oldPassword = req.body.old_password;
        var newPassword = req.body.password;
        var confirmNewPassword = req.body.confirm_password;
        iv.testInput(registrationCB.testPassword, newPassword, confirmNewPassword); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        iv.testInput(registrationCB.testConfirmPassword, confirmNewPassword, newPassword); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to change your username");
                res.redirect('/settings');
                return;
            }
            users.getTokenForEmail(req.user.email, function(err, token){
                if(err){
                    users.close();
                    req.flash('error', err);
                    res.redirect('/settings');
                    return;
                }
                users.changePassword(token, oldPassword, newPassword, function(err){
                    if(err){
                        users.close();
                        req.flash('error', err);
                        res.redirect('/settings');
                        return;
                    }
                    users.close();
                    req.flash('success', "Your password is now updated !");
                    res.redirect('/settings');
                    return;
                });
            });
                
        });
    };
    
    this.postModifyUsername = function(req, res){
       var iv = new InputValidator();
        var username = req.body.username;
        iv.testInput(registrationCB.testUsername, username); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        if(username === req.user.username){
            req.flash('info',"This is the same username as the previous one!");
            res.redirect("/settings");
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to change your username");
                res.redirect('/settings');
                return;
            }
            users.userExists(username, function(err, exists) {
                if (err){
                    users.close();
                    req.flash('error', "A mistake happened, you can retry to change your username");
                    res.redirect('/settings');
                    return;
                }
                if (exists) {
                    users.close();
                    req.flash('error', 'This username already exists, please choose another !');
                    res.redirect('/settings');
                    return;
                } else {
                    users.changeUsername(req.user.username, username, function(err) {
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened, you can retry to change your username");
                            res.redirect('/settings');
                            return;
                        }
                        users.close();
                        req.flash('success', "Your username is now updated !");
                        res.redirect('/settings');
                        return;
                    });
                }
             });
        }); 
    };
    
    this.postModifyEmail = function(req, res){
        var iv = new InputValidator();
        var email = req.body.email;
        iv.testInput(registrationCB.testEmail, email); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        if(email === req.user.email){
            req.flash('info',"This is the same email as the previous one!");
            res.redirect("/settings");
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to change your email");
                res.redirect('/settings');
                return;
            }
            users.emailExists(email, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened, you can retry to change your email");
                    res.redirect('/settings');
                    return;
                }
                if (exists) {
                    users.close();
                    req.flash('error', 'This email already exists, please choose another !');
                    res.redirect('/settings');
                    return;
                } else {
                    var emailConfirmationCode = generateToken();
                    users.changeEmail(req.user.email, email, emailConfirmationCode, function(err) {
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened, you can retry to change your email");
                            res.redirect('/settings');
                            return;
                        }
                        sendConfirmationEmail(req, res, emailConfirmationCode, email, function(err){
                            if (err) {
                                users.close();
                                req.flash('error', "Your email address has been modified but the confirmation email was not sent !");
                                res.redirect('/settings');
                                return;
                            }
                            users.close();
                            req.flash('success', "Your email is now updated !");
                            req.flash('info', "You will receive a confirmation link at your email address in a few minutes.");
                            res.redirect('/settings');
                            return;
                        });
                        
                    });
                }
            });
        });
    };
    
    this.postModifyFirstName = function(req, res){
        var iv = new InputValidator();
        var firstName = req.body.first_name;
        iv.testInput(registrationCB.testName, firstName); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        if(firstName === req.user.extras.firstName){
            req.flash('info',"This is the same first name as the previous one!");
            res.redirect("/settings");
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to change your first name");
                res.redirect('/settings');
                return;
            }
            users.emailExists(req.user.email, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened, you can retry to change your first name");
                    res.redirect('/settings');
                    return;
                }
                if (exists) {
                    users.addExtras({email : req.user.email}, {firstName: firstName}, function(err, extras){
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened, you can retry to change your first name");
                            res.redirect('/settings');
                            return;
                        }
                        users.close();
                        req.flash('success', "Your first name is now updated !");
                        console.log(req.user);
                        res.redirect('/settings');
                        return;
                    });
                } else {
                    users.close();
                    req.flash('error', "User doesn't exist");
                    res.redirect('/logout');
                    return;
                }
            });
        });
    };
    
    this.postModifyLastName = function(req, res){
        var iv = new InputValidator();
        var lastName = req.body.last_name;
        iv.testInput(registrationCB.testName, lastName); 
        if(iv.hasError){
            req.flash('error',iv.errorMsg);
            res.redirect("/settings");
            return;
        }
        if(lastName === req.user.extras.lastName){
            req.flash('info',"This is the same last name as the previous one!");
            res.redirect("/settings");
            return;
        }
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to change your last name");
                res.redirect('/settings');
                return;
            }
            users.emailExists(req.user.email, function(err, exists) {
                if(err){
                    users.close();
                    req.flash('error', "A mistake happened, you can retry to change your last name");
                    res.redirect('/settings');
                    return;
                }
                if (exists) {
                    users.addExtras({email : req.user.email}, {lastName: lastName}, function(err, extras){
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened, you can retry to change your last name");
                            res.redirect('/settings');
                            return;
                        }
                        users.close();
                        req.flash('success', "Your last name is now updated !");
                        res.redirect('/settings');
                        return;
                    });
                } else {
                    users.close();
                    req.flash('error', "User doesn't exist");
                    res.redirect('/logout');
                    return;
                }
            });
        });
    };
    
    this.postDeleteAccount = function(req, res){
        var password = req.body.password;
        var users = UserModel.getInstance(); 
        users.load(function(err) {
            if(err){
                users.close();
                req.flash('error', "A mistake happened, you can retry to delete your account");
                res.redirect('/settings');
                return;
            }
            users.isPasswordValid(req.user.email, password, function(err, result){
                if(err || !result.emailExists){
                    users.close();
                    req.flash('error', "A mistake happened, you can retry to delete your account");
                    res.redirect('/settings');
                    return;
                } else if (!result.passwordsMatch) {
                    users.close();
                    req.flash('error', "The password is not correct");
                    res.redirect('/settings');
                    return;
                } else {
                    users.removeUser(req.user.email, function(err){
                        if(err){
                            users.close();
                            req.flash('error', "A mistake happened, you can retry to delete your account");
                            res.redirect('/settings');
                            return;
                        }
                        users.close();
                        req.flash('success', "Your account has been deleted");
                        req.logout();
                        res.redirect('/');
                    });
                }
                
            });
        });
    };
    
    var sendConfirmationEmail = (req, res, confirmationToken, email, cb) => {
        UserspaceMailer.getInstance().send({
            email: email, 
            subject: 'Activate your account', 
            template: 'emails/confirm_email.ejs', 
            locals: {
                confirmationToken: confirmationToken,
                host: req.headers.host
            },
        }, cb);
    };
};

module.exports.isInitialized = false;
module.exports.instance = null;

module.exports.init = function(app){
    this.isInitialized = true;
    this.instance = new UserController(app);
};

module.exports.getInstance = function(){
    if(!this.isInitialized){
        throw new Error('The controller has not been initialized !');
    } else {
        return this.instance;
    }
};
