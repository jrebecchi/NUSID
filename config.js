var exports;

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var flashify = require('flashify');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');

exports.getConfiguredApp = function(){
    app.use(express.static(path.resolve(__dirname, 'client')));
    app.use(cookieParser('userspaceSecret'));
    app.use(session({ 
        cookie : {
            maxAge: 1000* 60 * 60 *24 * 365
        },
        secret: 'sessionsecret', 
        resave: true, 
        saveUninitialized: false }));
    app.use(flashify);
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(morgan('combined'));
    app.use(passport.initialize());
    app.use(passport.session());
    
    return app;
};
