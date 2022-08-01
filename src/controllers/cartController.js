const cartModels = require("../model/cartModels")
const productModel = require("../model/productModel")
const userModel = require("../model/userModel")
const { isValidRequestBody, isValidData, isValidObjectId, isValidAlpha } = require("../validator/validator")

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        if (!userId) {
            return res.status(400).send({ status: false, message: "user id is not present the path parameters" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid object id` })
        }
        let userCheck = await userModel.findById({ _id: userId })

        if (!userCheck) {
            return res.status(404).send({ status: false, message: `${userId} doesn't exist` })
        }
        let alreadyCart = await cartModels.findOne({ userId: userId })
        
        if (alreadyCart) {
            let cartId = alreadyCart._id.toString()
            console.log(cartId)
            if(req.body.cartId){
                if(req.body.cartId!==cartId){
                    return res.status(400).send({status:false,message:"wrong cart id given in the request body"})
                }
            }
            let itemsnew = req.body.items
            let increamented = {}
            let itemcount = 0
            let cartCheck = await cartModels.findById({ _id: cartId }).select({ _id: 0, items: 1 })

            if (!cartCheck) {
                return res.status(404).send({ status: false, message: "cart not available" })
            }



            if (!isValidObjectId(itemsnew[0].productId)) {
                return res.status(400).send({ status: false, message: "not a valid objectId" })
            }
            if (typeof itemsnew[0].quantity != "number" || itemsnew[0].quantity < 1) {
                return res.status(400).send({ status: false, message: `quantity for productId ${items[i].productId}is not valid` })
            }
            itemcount = itemcount + itemsnew[0].quantity
            increamented.totalItems = itemcount

            let flag = 0

            for (let i = 0; i < cartCheck.items.length; i++) {

                if (cartCheck.items[i].productId == itemsnew[0].productId) {
                    cartCheck.items[i].quantity = cartCheck.items[i].quantity + itemsnew[0].quantity
                    flag++
                }
            }
            if (flag == 0) {
                cartCheck.items.push(itemsnew[0])
            }


            let totalPrice = 0

            let priceProduct = await productModel.findOne({ _id: itemsnew[0].productId, isDeleted: false }).select({ price: 1, _id: 0 })
            if (!priceProduct) {
                return res.status(400).send({ status: false, message: "this product is not available" })
            }
            totalPrice = totalPrice + priceProduct.price * itemsnew[0].quantity

            increamented.totalPrice = totalPrice



            let cartUpDated = await cartModels.findByIdAndUpdate({ _id: cartId }, { items: cartCheck.items, $inc: increamented }, { new: true })

            cartUpDated = { ...cartUpDated.toObject() }
            delete cartUpDated.items.map(x => delete x._id)


            return res.status(200).send({ status: true, message: "Success", data: cartUpDated })

        }
        else {
            let items = req.body.items
            let filter = {}
            filter.userId = userId
            let itemcount = 0
            for (let i = 0; i < items.length; i++) {
                if (!isValidObjectId(items[i].productId)) {
                    return res.status(400).send({ status: false, message: "not a valid objectId" })
                }

                if (typeof items[i].quantity != "number" || items[i].quantity < 1) {
                    return res.status(400).send({ status: false, message: `quantity for productId ${items[i].productId}is not valid` })
                }
                itemcount = itemcount + items[i].quantity
            }
            filter.totalItems = itemcount
            let totalPrice = 0
            for (let j = 0; j < items.length; j++) {
                let priceProduct = await productModel.findOne({ _id: items[j].productId, isDeleted: false }).select({ price: 1, _id: 0 })
                if (!priceProduct) {
                    return res.status(400).send({ status: false, message: "this product is not available" })
                }
                totalPrice = totalPrice + priceProduct.price * items[0].quantity

            }
            filter.totalPrice = totalPrice

            filter.items = items
            let cartCreate = await cartModels.create(filter)
            cartCreate = { ...cartCreate.toObject() }
            cartCreate.items.map(x => delete x._id)

            return res.status(201).send({ status: true, message: "Success", data: cartCreate })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
    }

}


const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId.trim()


        let { cartId, productId, removeProduct } = req.body
        let missdata = ""
        if (!isValidData(cartId)) {
            missdata = missdata + " cartId"
        }
        if (!isValidData(productId)) {
            missdata = missdata + " productId"
        }
        if (!isValidData(removeProduct)) {
            missdata = missdata + " removeproduct"
        }
        if (missdata) {
            message = missdata + " is missing and required to delete product from the cart"
            return res.status(400).send({ status: false, message: message })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `${cartId} is not a valid userId` })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid userId` })
        }
        removeProduct = parseInt(removeProduct)
        // console.log(removeProduct)
        if (removeProduct != 0 && removeProduct != 1) {
            return res.status(400).send({ status: false, message: "remove product should be 1 or 0" })
        }
        let cartCheck = await cartModels.findById({ _id: cartId })
        if (!cartCheck) {
            return res.status(400).send({ status: false, message: "cart is not available" })
        }
        // console.log(cartCheck.items.length)

        if (cartCheck.items.length == 0) {
            return res.status(400).send({ status: false, message: "no item present in the cart" })
        }

        let productCheck = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productCheck) {
            return res.status(404).send({ status: false, message: `${productId} is not available` })
        }
        let userCheck = await userModel.findById({ _id: userId })
        if (!userCheck) {
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, message: `${cartId} is not a valid userId` })
            }
        }

        let itemslength = cartCheck.items.length
        for (let i = 0; i < itemslength; i++) {
            let flag = 0
            if (cartCheck.items[i].productId == productId) {
                if (removeProduct == 0 || cartCheck.items[i].quantity == 1) {
                    if (removeProduct == 0) {
                        cartCheck.totalPrice -= productCheck.price * cartCheck.items[i].quantity
                        cartCheck.totalItems -= 1 * cartCheck.items[i].quantity
                        flag = 1
                    }
                    cartCheck.items.splice(i, 1)
                    i--
                    itemslength--

                }
                else {
                    cartCheck.items[i].quantity -= 1
                }
             
                if (flag == 0) {
                    cartCheck.totalPrice -= productCheck.price
                    cartCheck.totalItems -= 1
                }
            }

        }




        let updatedCart = await cartModels.findByIdAndUpdate({ _id: cartId }, cartCheck, { new: true })
        updatedCart = { ...updatedCart.toObject() }
        if (updatedCart.items.length != 0) {
            updatedCart.items.map(x => delete x._id)
        }
        console.log(updatedCart.items)
        return res.status(200).send({ status: true, message: "Success", data: updatedCart })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
    }
}

const getCart= async function(req,res){
  try{
   userId=req.params.userId
   let userCheck= await userModel.findOne({_id:userId})
   if(!userCheck){
    return res.status(404).send({status:false,message:"user not found"})
   }
   let cartCheck= await cartModels.findOne({userId:userId})
   if(!cartCheck){
    return res.status(404).send({status:false,message:"cart not found"})
   }
   cartCheck= { ...cartCheck.toObject() }
   if (cartCheck.items.length != 0) {
    cartCheck.items.map(x => delete x._id)
   }
   res.status(200).send({ status: true, message: "Success", data: cartCheck })
   
}
  catch(error){
    res.status(500).send({ status: false, message: error.message })
    console.log(error)
  }
}



const deleteCart= async function(req,res){
  try { userId= req.params.userId
    let userCheck= await userModel.findOne({_id:userId})
   if(!userCheck){
    return res.status(404).send({status:false,message:"user not found"})
   }
   let cartCheck= await cartModels.findOne({userId:userId})
   if(!cartCheck){
    return res.status(404).send({status:false,message:"cart not found"})
   }
   if(cartCheck.items.length==0){
    return res.status(404).send({status:false,message:"cart is empty"})
   }
   cartCheck.items=[]
   cartCheck.totalPrice=0
   cartCheck.totalItems=0
   
   let deletedCart= await cartModels.findByIdAndUpdate({_id:cartCheck._id},cartCheck,{new:true})
   deletedCart= { ...deletedCart.toObject() }
   if (deletedCart.items.length != 0) {
    deletedCart.items.map(x => delete x._id)
   }
    res.status(200).send({ status: true, message: "Success", data: cartCheck })}
    catch(error){
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
      }
    
}





















module.exports = { createCart, updateCart,getCart,deleteCart }