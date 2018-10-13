const InputValidator = require("../service/forms/InputValidatorService");
const registrationCB = require("../service/forms/callbacks/ValidationCallbacks");
const UserspaceMailer = require('../service/mailer/UserspaceMailer');
const crypto = require('crypto');
const CONFIRM_EMAIL_TOKEN_LENGTH = 64;
const User = require('../model/UserModel');

class EmailNotSentError extends Error {};
class EmailAlreadyExistsError extends Error {};
class UsernameAlreadyExistsError extends Error {};
class WrongPasswordError extends Error {};
class UserNotFound extends Error {};

const generateToken = function (cb) {
    return crypto.randomBytes(CONFIRM_EMAIL_TOKEN_LENGTH, cb).toString("hex");
};

const isRegistrationFormValid = function(req, res){
    let isFormValid = true;
    let iv = new InputValidator();
    iv.testInput(registrationCB.testUsername, req.body.username.trim()); 
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        isFormValid = false;
    }
    iv.testInput(registrationCB.testEmail,req.body.email.trim());
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
    iv.testInput(registrationCB.testName,req.body.first_name.trim());
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        isFormValid = false;
    }           
    iv.testInput(registrationCB.testName,req.body.last_name.trim());
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

exports.getCheckEmailExists = function (req, res){
    let email = req.query.email;
    User.userExists({email: email})
    .then(emailExists => {
        if(emailExists){
            res.json({
                "emailExists": true,
                "errorMsg": "This email address is already used. You can sign in with this one or type another !"
            });
        } else {
            res.json({
                "emailExists": false,
                "errorMsg": ""
            });
        }
    })
    .catch(e => {
        console.log(e);
    });
};

exports.getCheckUsernameExists = function (req, res){
    let username = req.query.username;
    User.userExists({username: username})
    .then(usernameExists => {
        if(usernameExists){
            res.json({
                "usernameExists": true,
                "errorMsg": "This username is already used. Please type another !"
            });
        } else {
            res.json({
                "usernameExists": false,
                "errorMsg": ""
            });
        }
    })
    .catch(e => {
        console.log(e);
    });
};

exports.getConfirmEmail = function(req, res){
    let token = req.query.token;
    User.userExists({'extras.emailConfirmationCode': token})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.getUser({'extras.emailConfirmationCode': token})
    })
    .then(user => {
        return User.update({email: user.email}, {'extras.emailConfirmationCode': null, 'extras.emailConfirmed': true,});
    })
    .then(() => {
        req.flash('success', "Your email adress is now confirmed !");
        res.redirect('/dashboard');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'This link is no longer valid.');
        else{
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry.");
        }
        res.redirect('/');
    });
};

exports.postCreateUser = function (req, res){
    if (req.user !== undefined){
        req.flash('error', "To register a new account you need to deconnect yourself !");
        res.redirect('/dashboard');
        return;
    }
    const user = { 
        username: req.body.username.trim(),
        email: req.body.email.trim(),
        password: req.body.password,
        extras: {
            lastName: req.body.last_name.trim(),
            firstName: req.body.first_name.trim(),
            emailConfirmationCode: generateToken()
        }
    };
    if (!isRegistrationFormValid(req, res)){
        res.redirect('/register?username='+user.username+'&email='+user.email+'&lastName='+user.extras.lastName+'&firstName='+user.extras.firstName);
        return;
    }
    User.userExists({username: user.username})
    .then(usernameExists => {
        if (usernameExists){
            throw new UsernameAlreadyExistsError();
        } else {
            return User.userExists({email: user.email});
        }
    })
    .then(emailExists => {
        if (emailExists){
            throw new EmailAlreadyExistsError();
        } else {
            return User.createUser(user);
        }
    })
    .then(() => {
        req.flash('success', 'User created !');
        sendConfirmationEmail(req, res, user.extras.emailConfirmationCode, user.email, function(err){
            if (err) {
                throw new EmailNotSentError();  
            }
            else {
                req.flash('info', "You will receive a confirmation link at your email address in a few minutes.");
            }
            res.redirect('/login');
        });
    })
    .catch(e => {
        if(e instanceof UsernameAlreadyExistsError)
            req.flash('error', 'Username already exists');
        else if(e instanceof EmailAlreadyExistsError)
            req.flash('error', 'Email already exists');
        else if(e instanceof EmailNotSentError)
            req.flash('error', "Mail not sent, an error has occured.");
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/register?username='+user.username+'&email='+user.email+'&lastName='+user.extras.lastName+'&firstName='+user.extras.firstName);
    })
};

exports.getSendConfirmationEmail = function(req, res){
    sendConfirmationEmail(req, res, req.user.extras.emailConfirmationCode, req.user.email, function(err){
        if (err) {
            req.flash('error', "Mail not sent, an error has occured.");
        } else {
            req.flash('success', "You will receive a confirmation link at your email address in a few minutes.");
        }
        res.redirect('/dashboard');  
    });
};

exports.postModifyPassword = function(req, res){
    let iv = new InputValidator();
    let oldPassword = req.body.old_password;
    let newPassword = req.body.password;
    let confirmNewPassword = req.body.confirm_password;
    iv.testInput(registrationCB.testPassword, newPassword, confirmNewPassword); 
    if (iv.hasError){
        req.flash('error',iv.errorMsg);
        res.redirect("/settings");
        return;
    }
    iv.testInput(registrationCB.testConfirmPassword, confirmNewPassword, newPassword); 
    if (iv.hasError){
        req.flash('error',iv.errorMsg);
        res.redirect("/settings");
        return;
    }
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.isPasswordValid({email: req.user.email}, oldPassword)
    })
    .then(isValid => {
        if (!isValid){
            throw new WrongPasswordError();
        }
        return User.resetPassword({email: req.user.email}, newPassword);
    })
    .then(() => {
        req.flash('success', "Your password is now updated !");
        res.redirect('/settings');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found');
        if(e instanceof WrongPasswordError)
            req.flash('error', 'You entered a wrong password !');
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/settings');
    });
};

exports.postModifyUsername = function(req, res){
    let iv = new InputValidator();
    let username = req.body.username.trim();
    iv.testInput(registrationCB.testUsername, username); 
    if(iv.hasError){
        req.flash('error',iv.errorMsg);
        res.redirect("/settings");
        return;
    }
    if(username === req.user.username){
        req.flash('info',"This is the same username as the previous one.");
        res.redirect("/settings");
        return;
    }
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.userExists({username: username});
    })
    .then(usernameExists => {
        if(usernameExists)
            throw new UsernameAlreadyExistsError();
        return User.update({email: req.user.email}, {username: username});
    })
    .then(() => {
        req.flash('success', "Your username is now updated.");
        res.redirect('/settings');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found');
        else if(e instanceof UsernameAlreadyExistsError)
            req.flash('error', 'Username already exists');
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry.");
        }
        res.redirect('/settings');
    });
};

exports.postModifyEmail = function(req, res){
    let iv = new InputValidator();
    let email = req.body.email.trim();
    let emailConfirmationCode;
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
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.userExists({email: email});
    })
    .then(emailExists => {
        if(emailExists)
            throw new EmailAlreadyExistsError();
        emailConfirmationCode = generateToken();
        return User.update({username: req.user.username}, {email: email, 'extras.emailConfirmationCode': emailConfirmationCode, "extras.emailConfirmed": false});
    })
    .then(() => {
        req.flash('success', "Your email is now updated !");
        sendConfirmationEmail(req, res, emailConfirmationCode, email, function(err){
            if (err) {
                throw new EmailNotSentError();  
            }
            else {
                req.flash('info', "You will receive a confirmation link at your email address in a few minutes.");
            }
            res.redirect('/settings');
        });
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found !');
        else if(e instanceof EmailAlreadyExistsError)
            req.flash('error', 'Email already exists');
        else if(e instanceof EmailNotSentError)
            req.flash('error', "Mail not sent, an error has occured.");
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/settings');
    });
};

exports.postModifyFirstName = function(req, res){
    let iv = new InputValidator();
    let firstName = req.body.first_name.trim();
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
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.update({email: req.user.email}, {'extras.firstName': firstName});
    })
    .then(() => {
        req.flash('success', "Your first name is now updated !");
        res.redirect('/settings');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found !');
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/settings');
    });
};

exports.postModifyLastName = function(req, res){
    let iv = new InputValidator();
    let lastName = req.body.last_name.trim();
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
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.update({email: req.user.email}, {'extras.lastName': lastName});
    })
    .then(() => {
        req.flash('success', "Your last names is now updated !");
        res.redirect('/settings');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found !');
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/settings');
    });
};

exports.postDeleteAccount = function(req, res){
    let password = req.body.password;
    User.userExists({email: req.user.email})
    .then((exists) =>{
        if (!exists)
            throw new UserNotFound();
        return User.isPasswordValid({email: req.user.email}, password)
    })
    .then(isValid => {
        if (!isValid){
            throw new WrongPasswordError();
        }
        return User.removeUser({email: req.user.email});
    })
    .then(() => {
        req.flash('success', "Your account has been deleted");
        req.logout();
        res.redirect('/');
    })
    .catch(e => {
        if(e instanceof UserNotFound)
            req.flash('error', 'User not found');
        if(e instanceof WrongPasswordError)
            req.flash('error', 'You entered a wrong password !');
        else {
            console.log(e);
            req.flash('error', "A mistake happened at our side, please retry !");
        }
        res.redirect('/settings');
    });
};

const sendConfirmationEmail = (req, res, confirmationToken, email, cb) => {
    UserspaceMailer.send(req, {
        email: email, 
        subject: 'Activate your account', 
        template: 'emails/confirm_email.ejs', 
        locals: {
            confirmationToken: confirmationToken,
            host: req.headers.host
        },
    }, cb);
};
