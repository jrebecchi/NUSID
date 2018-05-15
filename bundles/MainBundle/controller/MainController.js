var MainController = function (){
    var checkIfEmailConfirmed = (req, res) => {
       if(!req.user.extras.emailConfirmed){
            res.flash('warning', "Please confirm your email by clicking on the link we sent you at this adress! Click <a href=\"/send_confirmation_email\">here</a> to resend the link.");
        } 
    };

    this.getDashboard = function (req, res){
        checkIfEmailConfirmed(req, res);
        res.render('pages/dashboard.ejs', { user: req.user });
    };
    
    this.getIndex = function (req, res){
        res.render('pages/index.ejs', { user: req.user, csrfToken: req.csrfToken() });
    };
    
    this.getLegal = function (req, res){
        res.render('pages/legal.ejs', { user: req.user, csrfToken: req.csrfToken() });
    };
};

module.exports.isInitialized = false;
module.exports.instance = null;

module.exports.init = function(app){
    this.isInitialized = true;
    this.instance = new MainController();
};

module.exports.getInstance = function(){
    if(!this.isInitialized){
        throw new Error('The controller has not been initialized !');
    } else {
        return this.instance;
    }
};


