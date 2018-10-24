const express = require('express');
const bodyParser = require('body-parser');
const flashify = require('flashify');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');

exports.init = function(app){
    app.use(express.static(path.resolve(__dirname, '../client')));
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
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(morgan('combined'));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(
        process.env.NODE_ENV === 'test' ?
        csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'] }):
        csrf({ cookie: true })
    );
    app.use(helmet());
};
