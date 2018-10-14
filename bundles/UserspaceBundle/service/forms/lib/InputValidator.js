module.exports  = function(){
    this.errorMsg = "";
    this.hasError;
    
    this.testInput = function(inputTesterCallback, param1, param2){
        var result = inputTesterCallback(param1, param2);
        this.hasError = result.hasError;
        this.errorMsg = result.errorMsg;
    };
};