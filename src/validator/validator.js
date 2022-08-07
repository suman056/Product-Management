const mongoose = require("mongoose");

//checks if the request body is not empty
//used in 6 APIs
const isValidRequestBody =  function (requestBody) {
    if (Object.keys(requestBody).length == 0) return false;
    return true 
}
const isValidAlpha= function(value){
    return /^[a-zA-Z\s]*$/.test(value)

}
const isValidAlphaNumeric=function(value){ 
    return /^[a-zA-Z0-9 ]*$/.test(value)
}

const isValidData = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length == 0) return false;
     return true;
}
//checks if Object id has valid format
const isValidObjectId = function (objectId) {
    if (mongoose.Types.ObjectId.isValid(objectId)) return true;
    return false;
}

module.exports = {
    isValidRequestBody, isValidData, isValidObjectId,isValidAlpha,isValidAlphaNumeric
}