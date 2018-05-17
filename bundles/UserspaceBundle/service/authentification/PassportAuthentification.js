var passport = require('passport');
var UserModel = require("../../model/UserModel");
var Strategy = require('passport-local').Strategy;

module.exports.init = function(){
    // Configure the local strategy for use by Passport.
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new Strategy(
        function(email, password, cb) {
            var users = new UserModel();
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
        var users = new UserModel();
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
        var users = new UserModel();
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