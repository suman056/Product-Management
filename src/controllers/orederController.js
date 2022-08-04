const orderModel = require("../model/orderModel")
const { isValidRequestBody, isValidData, isValidObjectId, isValidAlpha } = require('../validator/validator')
const userModel = require("../model/userModel")
const cartModel = require("../model/cartModels")
const productModel = require("../model/productModel")


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }
        let cartCheck = await cartModel.findOne({ userId: userId })
        if (!cartCheck) {
            return res.status(404).send({ status: false, message: "no cart is created for this user " })
        }
        if (cartCheck.items.length == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" })
        }
        let cart = {}
        cart.userId = userId
        cart.items = []
        let itemLength = cartCheck.items.length
        let flag = 0
        let totalQuantity = 0
        let missingitem=""
        for (let i = 0; i < itemLength; i++) {
            //need to ask wheather we have to check the productId is present or not
            if (cartCheck.items[i].quantity >= 1) {
                flag = 1
                cart.items.push(cartCheck.items[i])
                totalQuantity += cartCheck.items[i].quantity

            }
            let productCheck= await productModel.findOne({_id:cartCheck.items[i].productId,isDeleted:false})
            if(!productCheck){

                missingitem=missingitem+`   ${cartCheck.items[i].productId}`
            }
            
        }
        if(missingitem.length>0){
            let response=missingitem+" product not found "
            return res.status(404).send({status:false,message:response})
        }
        if (flag == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" })
        }
        cart.totalPrice = cartCheck.totalPrice
        cart.totalItems = cartCheck.totalItems
        cart.totalQuantity = totalQuantity
        if (req.body.cancellable) {
            if (typeof req.body.cancellable != Boolean) {
                return res.status(400).send({ status: false, message: "cancellable should be boolean" })
            }
        }
        let sts = ["pending"]
        if (req.body.status) {
            
            if (!sts.includes(req.body.status)) {
                return res.status(400).send({ status: false, message: "status should be pending" })
            }
        }
        if (req.body.isDeleted) {
            if (typeof req.body.isDeleted != Boolean) {
                return res.status(400).send({ status: false, message: "isDeleted should be  in Boolean format" })
            }
            if (req.body.isDeleted == true) {
                if (typeof req.body.deletedAt != Date) {
                    return res.status(400).send({ status: false, message: "deletedAt should be in Date format " })
                }
                cart.deletedAt=deletedAt
            }
            cart.isDeleted=isDeleted
        }
        let filter={}
           filter.items=[]
           filter.totalItems=0
           filter.totalPrice=0
        let cartUpdated=await cartModel .findByIdAndUpdate({_id:cartCheck._id},filter,{new:true})
        let oredrCreate= await  orderModel.create(cart)
        oredrCreate = { ...oredrCreate.toObject() }
         oredrCreate.items.map(x => delete x._id)
        res.status(201).send({status:true,message:"Success",data:oredrCreate})


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const updateOrder=async function(req,res){
try{
    let userId=req.params.userId.trim()
let orderId= req.body.orderId.trim()
let statusbody=req.body.status.trim()
if(req.body.cancellable){
    return res.status(400).send({status:false,message:"this feature(cancellable ) is not available right now"})
}
let userCheck = await userModel.findOne({ _id: userId })
if (!userCheck) {
    return res.status(404).send({ status: false, message: "user id doesn't exist" })
}
let orderCheck= await orderModel.findOne({_id:orderId})
if(!orderCheck){
    return res.status(404).send({ status: false, message: "order is not created " })
}
if(orderCheck.userId.toString()!==userCheck._id.toString()){
    return res.status(404).send({ status: false, message: `order is not for ${userId}, you cannot order it  ` })
}

if(orderCheck.cancellable==false){
    if(statusbody=="canceled"){
        return res.status(404).send({ status: false, message: `you cannot canceled this oredr ` })
    }
    if(statusbody!="completed"){
        return res.status(404).send({ status: false, message: `this order can only be completed` })
    }
}
else if(orderCheck.status=="completed"){
    if(statusbody=="pending"){
        return res.status(400).send({status:false,message:"this can only be completed !!cannot make it pending"})
    }
}
else{
let sts = [ "completed", "canceled"]
if(sts.includes(statusbody)==false){
   return res.status(400).send({status:false,message:"this can only be completed or canceled"})
}}
if(orderCheck.status=="canceled"){
    if(statusbody!="canceled"){
        return res.status(400).send({status:false,message:"this has canceled please create a oreder"})
    }
}
orderCheck.status=statusbody
if(req.body.isDeleted== Boolean){
    orderCheck.isDeleted=req.body.isDeleted
    if(req.body.isDeleted==true){
        orderCheck.deletedAt=new Date.now()
    }
   
}
let updateOrder= await orderModel.findByIdAndUpdate({_id:orderId},orderCheck,{new:true})
updateOrder = { ...updateOrder.toObject()}
updateOrder.items.map(x => delete x._id)
res.status(201).send({status:true,message:"Success",data:updateOrder})
}
catch (error) {
    res.status(500).send({ status: false, message: error.message })
    console.log(error)
}

}










module.exports={createOrder,updateOrder}