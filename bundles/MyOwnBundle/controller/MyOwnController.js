exports.getMyPrivateTab = function (req, res){
    res.render('pages/my-private-tab.ejs', { user: req.user });
};

exports.getMyPublicTab = function (req, res){
    res.render('pages/my-public-tab.ejs', { user: req.user, csrfToken: req.csrfToken() });
};
