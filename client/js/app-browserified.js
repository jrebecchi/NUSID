(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports  = function(){
    this.errorMsg = "";
    this.hasError;
    
    this.testInput = function(inputTesterCallback, param1, param2){
        var result = inputTesterCallback(param1, param2);
        this.hasError = result.hasError;
        this.errorMsg = result.errorMsg;
    };
};
},{}],2:[function(require,module,exports){
var exports;

var USERNAME_LENGTH = 4;
var PASSWORD_LENGTH = 8;
var NAME_LENGTH = 2;

exports.testUsername = function(username){
    var re = /^[a-zA-Z0-9\-_.]*$/;
    var hasError = false;
    var errorMsg = "";
    if(username.length < 4){
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
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var hasError = false;
    var errorMsg = "";
    if(!re.test(email)){
        hasError=true;
        errorMsg = "The email adress is not valid !";
    }
    return {hasError, errorMsg}
}

exports.testPassword = function(password){
    var hasError = false;
    var errorMsg = "";
    if(password.length < PASSWORD_LENGTH){
        hasError=true;
        errorMsg = "The password must contains more than "+PASSWORD_LENGTH+" characters !";
    }
    return {hasError, errorMsg}
}
    
exports.testConfirmPassword = function(confirmPassword, password){
    var hasError = false;
    var errorMsg = "";
    if(!(confirmPassword === password)){
        hasError=true;
        errorMsg = "The passwords don't match !";
    }
    return {hasError, errorMsg}
}
    
exports.testName = function(name){
    var re = /^[a-zA-z]+([ '\-][a-zA-Z]+)*$/;
    var hasError = false;
    var errorMsg = "";
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
    var hasError = false;
    var errorMsg = "";
    if(!checkBoxValue){
        hasError=true;
        errorMsg = "You must agree with the terms of service !";
    }
    return {hasError, errorMsg};
}
},{}],3:[function(require,module,exports){
var InputValidator = require("../../bundles/UserspaceBundle/service/forms/InputValidatorService");
var registrationCB = require("../../bundles/UserspaceBundle/service/forms/callbacks/RegistrationCallbacks");


var app = angular.module('app', []);

var HAS_ERROR_CSSCLASS = "has-error has-feedback";
var HAS_SUCCESS_CSSCLASS = "has-success has-feedback";;

var checkEmailExists = function($http, $scope){
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

var checkUsernameExists = function($http, $scope){
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
    var iv = new InputValidator();
    
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
    
    var iv = new InputValidator();
    
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
    
    var iv = new InputValidator();
    
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
},{"../../bundles/UserspaceBundle/service/forms/InputValidatorService":1,"../../bundles/UserspaceBundle/service/forms/callbacks/RegistrationCallbacks":2}]},{},[3]);
