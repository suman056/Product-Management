const jwt = require("jsonwebtoken")
const {isValidRequestBody, isValidData, isValidObjectId} = require("../validator/validator")
const userModel=require('../model/userModel')

const authetication = function (req, res, next) {
    try {
        const token1 = req.headers["authorization"]||req.headers["Authorization"]
        
        
        if (!token1) {
            return res.status(401).send({ status: false, message: "token is missing" })
        }
        let token= token1.split(" ")[1]
        try {
            var decodedtoken = jwt.verify(token, "RoomNo-74", { ignoreExpiration: true });
            
            if (Date.now() > decodedtoken.exp * 1000) {
                return res.status(401).send({ status: false, message: "token is expired" });
            }
            
        }
        catch (err) {
            return res.status(401).send({ status: false, msg: "token is invalid " })
            
        }
        
        req.decodedtoken = decodedtoken
        console.log("authenticated sucessfully")
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
        console.log(err)
    }

}
const authorisation=async function(req,res,next){
    try {
        let dToken=req.decodedtoken
        let userId=req.params.userId.trim()
        
        if(!userId){
            return res.status(400).send({status:false,message:"userId is required in the request paramaters"})
        }
        if(!isValidObjectId(userId)){
            return res.status(401).send({status:false,message:"not a valid userId"})
        }
        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, message: `User do not exists` })
        }
        if(dToken.userId!=userId){
            return res.status(403).send({status:false,message:"you are not authorised"})

        }
        console.log("authorised sucessfully")
        next()
        
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}





















module.exports={authetication,authorisation}