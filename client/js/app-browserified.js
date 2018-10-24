(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports  = function(){
    this.errorMsg = "";
    this.hasError;
    
    this.testInput = function(inputTesterCallback, param1, param2){
        const result = inputTesterCallback(param1, param2);
        this.hasError = result.hasError;
        this.errorMsg = result.errorMsg;
    };
};
},{}],2:[function(require,module,exports){
const USERNAME_LENGTH = 4;
const PASSWORD_LENGTH = 8;
const NAME_LENGTH = 2;

exports.testUsername = function(username){
    const re = /^[a-zA-Z0-9\-_.]*$/;
    let hasError = false;
    let errorMsg = "";
    if(username.length < USERNAME_LENGTH){
        hasError=true;
        errorMsg = "The username must contains more than 4 characters !";
    }
    else if(!re.test(username)){
        hasError=true;
        errorMsg = "Username may only contain letters, numbers, dashes, dots and underscores !";
    }
    return {hasError, errorMsg}
}
    
exports.testEmail = function(email){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let hasError = false;
    let errorMsg = "";
    if(!re.test(email)){
        hasError=true;
        errorMsg = "The email adress is not valid !";
    }
    return {hasError, errorMsg}
}

exports.testPassword = function(password){
    let hasError = false;
    let errorMsg = "";
    if(password.length < PASSWORD_LENGTH){
        hasError=true;
        errorMsg = "The password must contains more than "+PASSWORD_LENGTH+" characters !";
    }
    return {hasError, errorMsg}
}
    
exports.testConfirmPassword = function(confirmPassword, password){
    let hasError = false;
    let errorMsg = "";
    if(!(confirmPassword === password)){
        hasError=true;
        errorMsg = "The passwords don't match !";
    }
    return {hasError, errorMsg}
}
    
exports.testName = function(name){
    const re = /^[a-zA-z]+([ '\-][a-zA-Z]+)*$/;
    let hasError = false;
    let errorMsg = "";
    if(name.length < NAME_LENGTH){
        hasError=true;
        errorMsg = "The name must contains more than 2 characters !";
    }
    else if(!re.test(name)){
        hasError=true;
        errorMsg = "Uncorrect name !";
    }
    return {hasError, errorMsg}
}
    
exports.testImperativeCheckBox = function(checkBoxValue){
    let hasError = false;
    let errorMsg = "";
    if(!checkBoxValue){
        hasError=true;
        errorMsg = "You must agree with the terms of service !";
    }
    return {hasError, errorMsg};
}
},{}],3:[function(require,module,exports){
var InputValidator = require("../../bundles/UserspaceBundle/service/forms/lib/InputValidator");
var registrationCB = require("../../bundles/UserspaceBundle/service/forms/lib/callbacks/ValidationCallbacks");


var app = angular.module('app', []);

var HAS_ERROR_CSSCLASS = "has-error has-feedback";
var HAS_SUCCESS_CSSCLASS = "has-success has-feedback";;

const checkEmailExists = function($http, $scope){
    $http.get("email-exists?email="+$scope.email)
        .then(function(response) {
            $scope.inputs["email"] = {
                hasError : response.data.emailExists,
                isValid : !response.data.emailExists,
                errorMsg: response.data.errorMsg,
                cssClass : response.data.emailExists ? HAS_ERROR_CSSCLASS : HAS_SUCCESS_CSSCLASS
            };
    });
}

const checkUsernameExists = function($http, $scope){
    $http.get("username-exists?username="+$scope.username)
        .then(function(response) {
            $scope.inputs["username"] = {
                hasError : response.data.usernameExists,
                isValid : !response.data.usernameExists,
                errorMsg: response.data.errorMsg,
                cssClass : response.data.usernameExists ? HAS_ERROR_CSSCLASS : HAS_SUCCESS_CSSCLASS
            };
    });
}

app.controller('registration', function($scope, $http) {
    const iv = new InputValidator();
    
    $scope.inputs = new Object();
    
    $scope.disableSubmit = function(){
        return (!($scope.inputs.hasOwnProperty('username') && $scope.inputs['username'].isValid) 
                || !($scope.inputs.hasOwnProperty('email') && $scope.inputs['email'].isValid)
                || !($scope.inputs.hasOwnProperty('password') && $scope.inputs['password'].isValid)
                || !($scope.inputs.hasOwnProperty('confirmPassword') && $scope.inputs['confirmPassword'].isValid)
                || !($scope.inputs.hasOwnProperty('firstName') && $scope.inputs['firstName'].isValid)
                || !($scope.inputs.hasOwnProperty('lastName') && $scope.inputs['lastName'].isValid)
                || !($scope.inputs.hasOwnProperty('conditions') && $scope.inputs['conditions'].isValid)
        );
    }
    $scope.validateData = function(inputName){
        switch(inputName){
            case "username" : 
                iv.testInput(registrationCB.testUsername, $scope.username);
                if(!iv.hasError){
                    checkUsernameExists($http, $scope);
                }
                break;
            case "email" :
                iv.testInput(registrationCB.testEmail,$scope.email);
                if(!iv.hasError){
                    checkEmailExists($http, $scope);
                }
                break;
            case "password" :
                iv.testInput(registrationCB.testPassword,$scope.password);
                break;
            case "confirmPassword" :
                iv.testInput(registrationCB.testConfirmPassword,$scope.confirmPassword, $scope.password);
                break;
            case "firstName" :
                iv.testInput(registrationCB.testName,$scope.firstName);
                break;
            case "lastName" :
                iv.testInput(registrationCB.testName,$scope.lastName);
                break;
            case "conditions" :
                iv.testInput(registrationCB.testImperativeCheckBox,$scope.conditions);
                break;
        }
        $scope.inputs[inputName] = {
            hasError : iv.hasError,
            isValid : !iv.hasError,
            errorMsg: iv.errorMsg,
            cssClass : iv.hasError ? HAS_ERROR_CSSCLASS : HAS_SUCCESS_CSSCLASS
        };
        return !iv.hasError;
    }
    
});
app.controller('change-password', ['$scope', function($scope) {
    
    const iv = new InputValidator();
    
    $scope.inputs = new Object();
    
    $scope.validateData = function(inputName){
        switch(inputName){
            case "password" :
                iv.testInput(registrationCB.testPassword,$scope.password);
                break;
            case "confirmPassword" :
                iv.testInput(registrationCB.testConfirmPassword,$scope.confirmPassword, $scope.password);
                break;

        }
        $scope.inputs[inputName] = {
            hasError : iv.hasError,
            isValid : !iv.hasError,
            errorMsg: iv.errorMsg,
            cssClass : iv.hasError ? HAS_ERROR_CSSCLASS : HAS_SUCCESS_CSSCLASS
        };
        return !iv.hasError;
    }
    
}]);

app.controller('settings', function($scope, $http) {
    
    const iv = new InputValidator();
    
    $scope.inputs = new Object();
    
    $scope.modifyUsername = false;
    $scope.modifyEmail = false;
    $scope.modifyFirstName = false;
    $scope.modifyLastName = false;
    
    $scope.enableModifyUsername = function (){
       $scope.modifyUsername = true; 
    };
    
    $scope.disableModifyUsername = function (){
       $scope.modifyUsername = false; 
    };
    
    $scope.enableModifyEmail = function (){
       $scope.modifyEmail = true; 
    };
    
    $scope.disableModifyEmail = function (){
       $scope.modifyEmail = false; 
    };
    
    $scope.enableModifyFirstName = function (){
       $scope.modifyFirstName = true; 
    };
    
    $scope.disableModifyFirstName = function (){
       $scope.modifyFirstName = false; 
    };
    
    $scope.enableModifyLastName = function (){
       $scope.modifyLastName = true; 
    };
    
    $scope.disableModifyLastName = function (){
       $scope.modifyLastName = false; 
    };
    
    $scope.validateData = function(inputName){
        switch(inputName){
            case "username" : 
                iv.testInput(registrationCB.testUsername, $scope.username);
                if(!iv.hasError){
                        checkUsernameExists($http, $scope);
                }
                break;
            case "email" :
                iv.testInput(registrationCB.testEmail,$scope.email);
                if(!iv.hasError){
                    checkEmailExists($http, $scope);
                }
                break;
            case "firstName" :
                iv.testInput(registrationCB.testName,$scope.firstName);
                break;
            case "lastName" :
                iv.testInput(registrationCB.testName,$scope.lastName);
                break;
        }
        
        $scope.inputs[inputName] = {
            hasError : iv.hasError,
            isValid : !iv.hasError,
            errorMsg: iv.errorMsg,
            cssClass : iv.hasError ? HAS_ERROR_CSSCLASS : HAS_SUCCESS_CSSCLASS
        };
        return !iv.hasError;
    }
    
});
},{"../../bundles/UserspaceBundle/service/forms/lib/InputValidator":1,"../../bundles/UserspaceBundle/service/forms/lib/callbacks/ValidationCallbacks":2}]},{},[3]);
