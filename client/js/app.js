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