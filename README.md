[![NUSID Logo](https://nusidpublicresources-xeqnuojpin.now.sh/Nusid_Banner_Logo_800px.jpg)](#)

NUSID - Node.JS User Space for Idle Developers!

NUSID is a generic user space you can use in all your [Node.js](http://nodejs.org) apps as a starting point. It contains everything, from the [MongoDB](https://www.mongodb.com/) database model to the dynamic views made with [EJS](http://ejs.co/), [Bootstrap3](http://getbootstrap.com/docs/3.3/) and [AngularJS](https://angularjs.org/). 

If you are an idle developer NUSID is made for you!

  [![Linux Build][travis-image]][travis-url]

![NUSID Screenshot](https://nusidpublicresources-xeqnuojpin.now.sh/login_screenshot.png)
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
  * Architectured in bundles similar to the [Symfony](https://symfony.com/) framework

## Demo

Click [here](https://nusid-mxmoriwkmz.now.sh/) to see a live demo!

## Installation

This is a [Node.js](https://nodejs.org/en/) app working with [MongoDB](https://www.mongodb.com/). Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required. You also need to have a distant access or a local installation of [MongoDB](https://www.mongodb.com/). 

Installation is done using the
[`git clone` command](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ git clone https://github.com/JohannC/NUSID
$ cd NUSID
$ npm install
```

Then you need to edit the `app.js` file to enter your email and [MongoDB](https://www.mongodb.com/) information:

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

**TIP!** You can deploy for free this NodeJS app on [Zeit](https://zeit.co)

**TIP!** You can have a free MongoDB database on [MLab](https://mlab.com/)

**TIP!** You can use a Gmail email by [allowing less secure app](https://myaccount.google.com/lesssecureapps)

Finally launch this app with :

```bash
$ node app.js
```

## Bundle architecture

NUSID is designed in bundles using the MVC pattern. A bundle is simply a component which contains :
* A router : Redirecting some given routes to its different controllers
* Controlers : Responsible for sending responses the user requests
* Models : To represent the data retrieved from the database and offer different treatment functions
* Services : Any utility methods that can be used anywhere in the bundle
* Views : template views that are sent back by the controllers to the users

## Add your own bundles

Here you are going to learn how to add our own bundles and extend this userspace to create your own app ! As an exemple we are going to create a bundle named MyOwnBundle containing 2 routes, one to a public page and one to a private page that you can see only by being connected as a user.

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
```

* Step 3: Create the entry file of your bundle, the router, a controller and the 2 different views for the public page and the private page 

```bash
$ touch bundles/MyOwnBundle.js 
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
		<h1>This is a public page</h1>
		<hr>
		<p>You don't need to register to see this !</p>
	</div>
</div>
		
<% include partials/footer %>
<% include partials/end %>
```
    We do the same for the private page.

* Step 5: Edit the controller `MyOwnController.js` that will serve those 2 pages

```javascript
var exports;

exports.getMyPrivateTab = function (req, res){
    res.render('pages/my-private-tab.ejs', { user: req.user });
};

exports.getMyPublicTab = function (req, res){
    res.render('pages/my-public-tab.ejs', {csrfToken: req.csrfToken() });
};
```

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

By taping `yourwebsite.com/mypublictab` a user will acces the public page you just created.

```
* Step 7: Edit the bundle launcher `MyOwnController.js` to init the rooter

```javascript
var exports;
var Router = require('./router/Router');

exports.init = function(app) {
    //Launch router
    Router.init(app);
};
```
* Step 8: configure the `app.js` file to integrate your new bundle

Import the bundle line 8:
```javascript
var myOwnBundle = require('./bundles/MyOwnBundle/MyOwnBundle');
```
Init the bundle line 33:
```javascript
myOwnBundle.init(app);
```
Add its view folder in the EJS repository:
```javascript
  path.join(__dirname+'/bundles/MyOwnBundle', 'views')

```

## Adapt NUSID

Under construction

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
[travis-url]: https://travis-ci.org/expressjs/express
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/express/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/express
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/express?branch=master
[gratipay-image-visionmedia]: https://img.shields.io/gratipay/visionmedia.svg
[gratipay-url-visionmedia]: https://gratipay.com/visionmedia/
[gratipay-image-dougwilson]: https://img.shields.io/gratipay/dougwilson.svg
[gratipay-url-dougwilson]: https://gratipay.com/dougwilson/
