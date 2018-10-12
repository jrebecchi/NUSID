const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const Express = require('express');
const config = require('../../config/config'); 
const sessionize = require('supertest-session');
const userspaceBundleRooter = require('../../bundles/UserspaceBundle/router/Router.js');
const mainBundleRooter = require('../../bundles/MainBundle/router/Router.js');
const myOwnBundleRooter = require('../../bundles/MyOwnBundle/router/Router.js');
const path =require('path');
const userspaceBundle = require('../../bundles/UserspaceBundle/UserspaceBundle');
const mainBundle = require('../../bundles/MainBundle/MainBundle');
const myOwnBundle = require('../../bundles/MyOwnBundle/MyOwnBundle');
const db = require('../../config/db');

global.userspaceMailOptions = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'bhn7gau3j756yti6@ethereal.email',
        pass: 'jbqbDP5uEyHTGBjbNT'
    }
};

//Return the NUSID app ready for test
const AppTester = function (options){
    this.app = new Express();
    config.init(this.app);
    //Enable bundles
    if (options.useMockAuthentificaiton){
        userspaceBundleRooter.init(this.app);
        mainBundleRooter.init(this.app);
        myOwnBundleRooter.init(this.app);
    } else {
        userspaceBundle.init(this.app);
        mainBundle.init(this.app);
        myOwnBundle.init(this.app);
    }
    //Add the view folders
    
    this.app.set('views', [
        path.join(__dirname+'../../../bundles/MainBundle', 'views'), 
        path.join(__dirname+'../../../bundles/UserspaceBundle', 'views'),
        path.join(__dirname+'../../../bundles/MyOwnBundle', 'views')
    ]);

    
    this.request = sessionize(this.app);

    this.connectDB = (done) => {
        db.init(done);
    }

    this.disconnectDB = (done) =>{
        db.close(done)
    }

    this.getRequestSender = () => {
        return this.request;
    };

    this.getCookies = () => {
        return this.request.cookies;
    };

    this.resetSession = () => {
        this.request = sessionize(this.app);
    };

    this.getQueryArguments = (query) => {
        const queryArguments = new Object();
        query.split("?")[1].split("&").forEach((element, index) => {
            let tmp = element.split("=");
            queryArguments[tmp[0]] = tmp[1];
        });
        return queryArguments;
    }

    if (options.useMockAuthentificaiton){
        this.loginMockUser = (mockUser) => {
            passport.use(new Strategy(
                function(username, password, cb) {
                    return cb(null, mockUser);
            }));
        
            passport.serializeUser(function(user, cb) {
                return cb(null, JSON.stringify(mockUser));
            });
        
            passport.deserializeUser(function(packet, cb) {
                return cb(null, mockUser);
            });
            
            return new Promise((resolve) => {
                this.request.post('/login').send({username:"test", password:"test"}).then((response) => { 
                    resolve();
                });
            });   
        };

        this.logoutMockUser = () => {
            return new Promise((resolve) => {
                this.request.get('/logout').then((response) => { 
                    resolve();
                });
            }); 
        };
    }
        
};

module.exports = AppTester;