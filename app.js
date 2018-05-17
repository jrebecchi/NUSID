//App entry point
var app =  require('./config').getConfiguredApp();
var path = require('path');

//Declare here your bundles
var userspaceBundle = require('./bundles/UserspaceBundle/UserspaceBundle');
var mainBundle = require('./bundles/MainBundle/MainBundle');
var myOwnBundle = require('./bundles/MyOwnBundle/MyOwnBundle');

//Enter your mongoDB database connection options for the userspace
global.userDBOptions = {
  hostname :"dbuser:dbpassword@host.com",
  port :"19150",
  database : "user_management"
};

//Enter your email options for the userspace from where will be sent the emails
//Check nodemailer confirguration for more options (https://nodemailer.com)
global.userspaceMailOptions = {
  from: 'myemail@myhost.com', //email address
  host: 'smtp.myhost.com', // hostname 
  secureConnection: true, // use SSL 
  port: 465, // port for secure SMTP 
  auth: {
    user: 'username', //email login
    pass: 'mypassword' //email password
  }
};

//Enable your bundles
userspaceBundle.init(app);
mainBundle.init(app);
myOwnBundle.init(app);

//Add the view folders of your bundle
app.set('views', [
  path.join(__dirname+'/bundles/MainBundle', 'views'), 
  path.join(__dirname+'/bundles/UserspaceBundle', 'views'),
  path.join(__dirname+'/bundles/MyOwnBundle', 'views')
]);

//Adapt your server config
var http = require('http');
var server = http.createServer(app);
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
