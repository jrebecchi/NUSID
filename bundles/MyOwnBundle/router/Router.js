const MyOwnControler = require("../controller/MyOwnController.js");
const proxy = require('connect-ensure-login');
const express = require('express');
const router = express.Router();


router.get('/myprivatetab', proxy.ensureLoggedIn(),function(req, res){
    MyOwnControler.getMyPrivateTab(req, res);
});

router.get('/mypublictab', function(req, res) {
    MyOwnControler.getMyPublicTab(req, res);
});

module.exports = router;