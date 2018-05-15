var MyOwnController = function(){
    this.getMyPrivateTab = function (req, res){
        res.render('pages/my-private-tab.ejs', { user: req.user });
    };

    this.getMyPublicTab = function (req, res){
        res.render('pages/my-public-tab.ejs', {csrfToken: req.csrfToken() });
    };
}

module.exports.isInitialized = false;
module.exports.instance = null;

module.exports.init = function(app){
    this.isInitialized = true;
    this.instance = new MyOwnController();
};

module.exports.getInstance = function(){
    if(!this.isInitialized){
        throw new Error('The controller has not been initialized !');
    } else {
        return this.instance;
    }
};
