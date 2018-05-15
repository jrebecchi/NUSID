var UserSpaceController = function(){

    this.getLogout = function (req, res){
        req.logout();
        res.redirect('/');
    };
    
    this.getLogin = function (req, res){
        if(req.user !== undefined){
            req.flash('error', "Oups, you are already logged in !");
            res.redirect('/dashboard');
            return;
        }
        res.render('pages/login.ejs',  {csrfToken: req.csrfToken()});
    };
    
    this.getRegister = function (req, res){
        if(req.user !== undefined){
            req.flash('error', "To register a new account you need to deconnect yourself !");
            res.redirect('/dashboard');
            return;
        }
        res.render('pages/register.ejs', {
            email: req.query.email, 
            username: req.query.username, 
            lastName:req.query.lastName, 
            firstName:req.query.firstName,
            csrfToken: req.csrfToken()
        });
    };
    
    this.postLogin = function (req, res){
        if(!req.body.remember) {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('/dashboard');
    };
    
    this.getSettings = function (req, res){
        res.render('pages/settings.ejs', { user: req.user, csrfToken: req.csrfToken() });
    };
};

module.exports.isInitialized = false;
module.exports.instance = null;

module.exports.init = function(){
    this.isInitialized = true;
    this.instance = new UserSpaceController();
};

module.exports.getInstance = function(){
    if(!this.isInitialized){
        throw new Error('The controller has not been initialized !');
    } else {
        return this.instance;
    }
};