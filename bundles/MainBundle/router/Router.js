const MainController = require("../controller/MainController.js");
const proxy = require('connect-ensure-login');
const express = require('express');
const router = express.Router();


router.get('/', function(req, res) {
    MainController.getIndex(req, res);
});

router.get('/dashboard', proxy.ensureLoggedIn(),function(req, res){
    MainController.getDashboard(req, res);
});

router.get('/legal', function(req, res) {
    MainController.getLegal(req, res);
});
    
module.exports = router;