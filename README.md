[![Build Status](https://travis-ci.org/JohannC/NUSID.svg?branch=master)](https://travis-ci.org/JohannC/NUSID)
[![Coverage Status](https://coveralls.io/repos/github/JohannC/NUSID/badge.svg?branch=master)](https://coveralls.io/github/JohannC/NUSID?branch=master)


[![NUSID Logo](https://nusidpublicresources-xeqnuojpin.now.sh/Nusid_Banner_Logo_800px.jpg)](#)

NUSID - Node.JS User Space for Idle Developers!

NUSID is a generic user space you can use in all your [Node.js](http://nodejs.org) apps as a starting point. It contains everything, from the [MongoDB](https://www.mongodb.com/) database model to the dynamic views made with [EJS](http://ejs.co/), [Bootstrap3](http://getbootstrap.com/docs/3.3/) and [AngularJS](https://angularjs.org/). 

If you are an idle developer NUSID is made for you!
  
![NUSID Screenshot](https://nusidpublicresources-xeqnuojpin.now.sh/login_screenshot.png)

## Demo

Click [here](https://nusid.net) to see a live demo!

## Features
  * Registration
  * Login
  * "Remember me" session login 
  * Email verification
  * Password recovery
  * Account modification
  * Account deletion
  * Input field validation rules for both the client & server side (centralized with Browserify)
  * MongoDB User model with password encryption & salt
  * CSRF protection
  * Flash message manager
  * Responsive design 
  * Designed in bundles similar to the [Symfony](https://symfony.com/) framework
  * HTTP Strict Transport Security

## Installation

This is a [Node.js](https://nodejs.org/en/) app working with [MongoDB](https://www.mongodb.com/). Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required. You also need to have a distant access or a local installation of [MongoDB](https://www.mongodb.com/). 

Installation is done using the
[`git clone` command](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ git clone https://github.com/JohannC/NUSID.git
$ cd NUSID
$ npm install
```

Then you need to rename the `app.js.exemple` file as `app.js`, and edit it to enter your email and [MongoDB](https://www.mongodb.com/) information:

* [MongoDB](https://www.mongodb.com/) configuration (where will be stored the users) 

```js
var dbOptions = {
	hostname :"dbuser:dbpassword@yourhost.com",
	port :"XXXXX",
	database : "YourDataBaseName"
}
```

##### If you wish to use your local [MongoDB](https://www.mongodb.com/) use the following:

```js
var dbOptions = {
	hostname :"localhost",
	port :"27017",
	database : "users"
}
```

* Email configuration (from where will be sent the administration emails)

```js
var userspaceMailOptions = {
  from: 'myemail@myhost.com', //email address
  host: 'smtp.myhost.com', // hostname 
  secureConnection: true, // use SSL 
  port: 465, // port for secure SMTP 
  auth: {
    user: 'username', //email login
    pass: 'mypassword' //email password
  }
};
```
You can have more options for the email parameters looking at the [nodemailer options](https://nodemailer.com).

* Server configuration

Adapt the following code to your installation configuration:
```js
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
```
Finally launch this app with :

```bash
$ node app.js
```

**TIP!** You can deploy for free this NodeJS app on [Zeit](https://zeit.co)

**TIP!** You can have a free MongoDB database on [MLab](https://mlab.com/)

**TIP!** You can use a Gmail email by [allowing less secure app](https://myaccount.google.com/lesssecureapps)

## Bundle architecture

NUSID is designed in bundles using the MVC pattern. A bundle is simply a component which contains :
* A router : Redirecting some given routes to its different controllers
* Controlers : Responsible for sending responses the user requests
* Models : To represent the data retrieved from the database and offer different treatment functions
* Services : Any utility methods that can be used anywhere in the bundle
* Views : template views that are sent back by the controllers to the users

## Add your own bundles

Here you are going to learn how to add our own bundles and extend this user space to create your own app ! As an exemple we are going to create a bundle named MyOwnBundle containing 2 routes, one to a public page and one to a private page that you can see only by being connected as a user.

* Step 1: Create your bundle folder under the `bundles` directory

```bash
$ mkdir bundles/MyOwnBundle
```

* Step 2: Create the bundle structure with a `controller`, `model`, `router`, `service` and `views` folder 

```bash
$ mkdir bundles/MyOwnBundle/controller 
$ mkdir bundles/MyOwnBundle/model 
$ mkdir bundles/MyOwnBundle/router 
$ mkdir bundles/MyOwnBundle/service 
$ mkdir bundles/MyOwnBundle/views
$ mkdir bundles/MyOwnBundle/views/pages
```

* Step 3: Create the entry file of your bundle, the router, a controller and the 2 different views for the public page and the private page 

```bash
$ touch bundles/MyOwnBundle/MyOwnBundle.js 
$ touch bundles/MyOwnBundle/router/Router.js
$ touch bundles/MyOwnBundle/controller/MyOwnController.js
$ touch bundles/MyOwnBundle/views/pages/my-private-tab.ejs
$ touch bundles/MyOwnBundle/views/pages/my-public-tab.ejs
```
* Step 4: We are now going to create the public and the private template pages
  
  * Step 4.1: Edit the `my-public-tab.ejs` template as followed
  ```html
  <% include partials/head %>
  <% include partials/header %>
  
  <div class="container">
  	<div id="content">
  		<h1>This is a public page</h1>
  		<hr>
  		<p>You don't need to register to see this !</p>
  	</div>
  </div>
  		
  <% include partials/footer %>
  <% include partials/end %>
  ```
  We use here the `include` mechanism of [EJS](http://ejs.co/) to import the headers and footers of the page.
  
  * Step 4.2: Edit the `my-private-tab.ejs` template
  ```html
  <% include partials/head %>
  <% include partials/header %>
  
  <div class="container">
  	<div id="content">
  		<h1>This is a private page</h1>
  		<hr>
  		<p>You need to be registered to see this !</p>
  	</div>
  </div>
  		
  <% include partials/footer %>
  <% include partials/end %>
  ```
  We do the same for the private page.

* Step 5: Edit the controller `MyOwnController.js` that will return those templates we just created

```javascript
var exports;

exports.getMyPrivateTab = function (req, res){
    res.render('pages/my-private-tab.ejs', { user: req.user });
};

exports.getMyPublicTab = function (req, res){
    res.render('pages/my-public-tab.ejs', {csrfToken: req.csrfToken() });
};
```
For the public page, you need to include a crsfToken to enable the different forms present on the page for unconnected users.

* Step 6: Edit the router `Router.js` that will serve those 2 pages

```javascript
var exports;

var MyOwnControler = require("../controller/MyOwnController.js");
var proxy = require('connect-ensure-login');

exports.init = function(app) {

    app.get('/myprivatetab', proxy.ensureLoggedIn(),function(req, res){
        MyOwnControler.getMyPrivateTab(req, res);
    });
    
    app.get('/mypublictab', function(req, res) {
        MyOwnControler.getMyPublicTab(req, res);
    });
};
```

For the private page, add the `proxy.ensureLoggedIn()` middleware to ensure that the user is logged in to access this page. By taping `yourwebsite.com/mypublictab` a user will acces the public page you just created.

* Step 7: Edit the `./bundles/MainBundle/views/partials/header.ejs` file to add some buttons on the header nav-bar redirecting to those 2 pages 
Add the following on line 14 :

```html
<li><a href="/mypublictab">My public tab</a></li>
<li><a href="/myprivatetab">My private tab</a></li>
```

* Step 8: Edit the bundle launcher `MyOwnController.js` to init the rooter

```javascript
var exports;
var Router = require('./router/Router');

exports.init = function(app) {
    //Launch router
    Router.init(app);
};
```
* Step 9: configure the `app.js` file to integrate your new bundle

Import the bundle line 8:
```javascript
var myOwnBundle = require('./bundles/MyOwnBundle/MyOwnBundle');
```
Init the bundle line 33:
```javascript
myOwnBundle.init(app);
```
Add its view folder in the EJS repository line 39:
```javascript
  path.join(__dirname+'/bundles/MyOwnBundle', 'views')

```
This example bundle is already included in the actual Nusid repository. Feel free to delete it or modify it!

## Adapt NUSID

* How to modify the general design

  You can modify the design and appearance of Nusid by modifying the style sheet located in `./client/css/style.css` and also the different partial templates present in all the pages. Those are located in the MainBundle : `./bundles/MainBundle/views/partials`. 
  * `head.ejs` for the metadata and Javascript/CSS Style sheets imports
  * `hearder.ejs` for the menu nav-bar of the page
  * `footer.ejs` for the footer of the page
  * `end.ejs` for the page closing, contains others Javascript/CSS Style sheets imports
  * `alerts.ejs` for the flash messenger.

* How to modify the client-side input form validation

  The client-side input form validation use 2 different technologies : [AngularJS](https://angularjs.org/) and [Browserify](http://browserify.org/).

  You will find the Angular input validation animations in the form templates located here: `./bundles/UserspaceBundle/views/forms` and its Javascript code in this file : `./client/js/app.js`.

  Thanks to [Browserify](http://browserify.org/) the Angular Javascript code in `app.js` can use the `require` function and import the input validation rules from the server located in `./bundles/UserspaceBundle/service/forms`. It means that the same code validate the inputs client and server side.

  If you want to modify the code in `app.js` you will have to [install browserify](http://browserify.org/#install) which provide this `require` function.
  **!!Warning!!** Every time you modify this code you will have to run the following command in a terminal :

  ```bash
  $ browserify client/js/app.js -o client/js/app-browserified.js
  ```
  The web pages will indeed import the `app-browserified.js` file which will convert the require imports into something the browser can read.

* How to change the input validation rules
  
  You can change the input validation rules by editing the validation callbacks located in `./bundles/UserspaceBundle/service/forms/callbacks/ValidationCallbacks.js`. Those functions have to return an object with 2 properties :
  * `hasError`: if the input has an error
  * `errorMsg`: the error message to display to the user if `hasError` is `true`

* How to change the general behavior of the UserspaceBundle

  You have to modify the different controllers located in `./bundles/UserspaceBundle/controller` and also its user model `./bundles/UserspaceBundle/model/UserModel.js`. Feel free to contact me if you need any information.

## Security Issues

If you discover a security vulnerability or a bug please contact me.

## Philosophy

NUSID wish to give you a starting point into your [Node.js](https://nodejs.org/en/) project with a complete user space and also a framework. This app is architectured in bundles, similarly as in the PHP framework [Symfony](https://symfony.com/). Feel free to adapt/modify the present bundles to make them fit your needs and simply add your own bundles as shown above.

## Want to contribute

If you want to share some improvements, contact me and I will add you as a contributor.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/express
[downloads-image]: https://img.shields.io/npm/dm/express.svg
[downloads-url]: https://npmjs.org/package/express
[travis-image]: https://img.shields.io/travis/expressjs/express/master.svg?label=linux
[travis-url]: https://github.com/JohannC/NUSID
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/express/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/express
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/express?branch=master
[gratipay-image-visionmedia]: https://img.shields.io/gratipay/visionmedia.svg
[gratipay-url-visionmedia]: https://gratipay.com/visionmedia/
[gratipay-image-dougwilson]: https://img.shields.io/gratipay/dougwilson.svg
[gratipay-url-dougwilson]: https://gratipay.com/dougwilson/
