const productModel = require("../model/productModel")
const { isValidRequestBody, isValidData, isValidObjectId, isValidAlpha } = require('../validator/validator')
const aws = require("../validator/aws")


const productCreate = async function (req, res) {
    try {
        let finalProduct = req.cretaeFolder
        let productCreate = await productModel.create(finalProduct)

        res.status(201).send({ status: true,message:"Success", data: productCreate })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const getProductByParam = async function (req, res) {
    try {
        let productId = req.params.productId.trim()
        if (!productId) {
            return res.status(400).send({ status: false, message: "product id is required in the path parameters" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "not a valid productId" })
        }

        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({ status: false, message: "product not available" })
        }


        res.status(200).send({ status: true, message: "Success", data: productDetails })

    } catch (error) {

        res.status(500).send({ status: false, message: error.message })
    }
}
const getProduct = async function (req, res) {
    try {
        let data = req.query
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = data
        let filteredProduct = { isDeleted: false }

        // ---------------SIZE--------------------//
        if (data.hasOwnProperty("size")) {

            if (isValidData(size)) {
                for (let i = 0; i < size.length; i++) {
                    if ((["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size[i]))) {
                        filteredProduct['availableSizes'] = size
                    }
                    else {
                        return res.status(400).send({ status: false, msg: "enter size among S,XS,M,X,L,XXL,XL to filter to products" })
                    }
                }
            }
            else {
                return res.status(400).send({ status: false, msg: "enter valid size to filter the products" })
            }
        }

        //---------------Product Name--------------//
        if (data.hasOwnProperty("name")) {
            if (isValidData(name)) {
                filteredProduct['title'] = {$regex:name}
            }
            else {
                return res.status(400).send("enter valid product name to filter product")
            }
        }

        //---------------Price Greater Than---------------//        
        if (data.hasOwnProperty("priceGreaterThan")) {
            if (isValidData(priceGreaterThan)) {
                if (!isNaN(priceGreaterThan)) {
                    filteredProduct['price'] = { $gt: priceGreaterThan }
                }
                else {
                    return res.status(400).send({ status: false, msg: "priceGreaterThan should be in number to filter products" })
                }
            }
            else {
                return res.status(400).send({ status: false, msg: "enter valid number for priceGreaterThan to filter products" })
            }
        }

        //----------------------Price Less Than----------------//
        if (data.hasOwnProperty("priceLessThan")) {
            if (isValidData(priceLessThan)) {
                if (!isNaN(priceLessThan)) {
                    filteredProduct['price'] = { $lt: priceLessThan }
                }
                else {
                    return res.status(400).send({ status: false, msg: "priceLessThan should be in number to filter products" })
                }
            }
            else {
                return res.status(400).send({ status: false, msg: "enter valid priceLessThan to filter the products" })
            }
        }
        if (data.hasOwnProperty("priceLessThan") && data.hasOwnProperty("priceGreaterThan")) {
            filteredProduct['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }

        }

        // ------------------- Sort-------------------------//
        if (data.hasOwnProperty("priceSort")) {
            if (isValidData(priceSort)) {
                if (!(priceSort == 1 || priceSort == -1)) {
                    return res.status(400).send({ status: false, msg: "you can sort price by value 1 or -1" })
                }
            }
            else {
                return res.status(400).send({ status: false, msg: "enter valid priceSort of 1 or -1 to filter products" })
            }
        }

        // --------------------Get Products Details------------------------------//    
        let productDetails = await productModel.find(filteredProduct).sort({ price: priceSort })
        if (productDetails.length == 0) {
            return res.status(400).send({ status: false, msg: "product not exist" })
        }
        else {
            return res.status(200).send({ status: true, message:"Success", noOfProduct: productDetails.length, data: productDetails })
        }
    }
    catch (error) {
        res.status(500).send({ msg: error.message })
        console.log(error)
    }
}
const updateProduct = async function (req, res) {
   try{ let requestBody = req.body
    let productId = req.params.productId.trim()
    if(!productId){
        return res.status(400).send({status:false,message:"productId should be in the path parameters"})
    }
    if (!isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: `${productId} is not a valid objectid` })
    }
    let idCheck = await productModel.findOne({ _id: productId, isDeleted: true })
    if (idCheck) {
        return res.status(400).send({ status: false, message: "this product is not available" })
    }
    let { installments, availableSizes, style, isFreeShipping, price, description, title } = requestBody
    if(!isValidRequestBody(requestBody)){
        return res.status(400).send({ status: false, message: "nothing to update!!please give some input" })
    }
    let filter = {}
    let missdata = ""
    if (title) {
        if (!isValidData(title)) {
            missdata = missdata + " title"
        }
    }
    if (description) {
        if (!isValidData(description)) {
            missdata = missdata + " description"
        }
    }
    if (price) {
        if (!isValidData(price)) {
            missdata = missdata + " price"
        }
    }
    if (isFreeShipping) {
        if (!isValidData(isFreeShipping)) {
            missdata = missdata + " isFreeShipping"
        }
    }
    if (style) {
        if (!isValidData(style)) {
            missdata = missdata + " style"
        }
    }
    if (availableSizes) {
        if (!isValidData(availableSizes)) {
            missdata = missdata + " availableSizes"
        }
    }
    if (installments) {
        if (!isValidData(installments)) {
            missdata = missdata + " installments"
        }
    }
    if (missdata) {
        let message = missdata + " are given but value are not assignment"
        return res.status(400).send({ status: false, message: message })
    }
    if (title) {
        if (!isValidAlpha(title)) {
            return res.status(400).send({ status: false, message: "title is not proper format" })
        }
        let titleChecks = await productModel.findOne({ title })
        if (titleChecks) {
            return res.status(400).send({ status: false, message: `${title} is already present ` })
        }
        filter.title = title
    }
    if (description) {
        filter.description = description
    }
    if (price) {
        price = parseInt(price)
        if (!/^\d{0,8}(\.\d{1,4})?$/.test(price)) {
            return res.status(400).send({ status: false, message: "price is not in proper format" })
        }
        filter.price = price
    }
    if (isFreeShipping) {
        isFreeShipping=Boolean(isFreeShipping.trim())
       
        if (typeof isFreeShipping != "boolean") {
            return res.status(400).send({ status: false, message: "isFreeShipping must be bollean" })
        }
        filter.isFreeShipping = isFreeShipping
    }
    if (style) {
        if (!isValidAlpha(style)) {
            return res.status(400).send({ status: false, message: "isFreeShipping must be bollean" })
        }
        filter.style = style
    }
    
    if (availableSizes) {
         availableSizes=availableSizes.split(',').map(x=>x.trim())
    const sizes=["S", "XS","M","X","L","XXL", "XL"]
    
    for(let i in availableSizes ){
        if(!sizes.includes(availableSizes[i])){
            return res.status(400).send({status:false,message:`${availableSizes[i]} in not a proper size`})
        }
    }
        
    }
    if (installments) {
        installments = parseInt(installments)
        if (!/^[0-9]{1,2,3}$/.test(installments)) {
            return res.status(400).send({ status: faslse, message: "messageis not in proper format" })
        }
        filter.installments = installments
    }
 
    if (req.files.length>0) {
        let productImage = req.files
        if (req.files.length == 0) {
            return res.status(400).send({ status: false, message: "image is not available" })
        }
        let allowedExtension = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/bmp",
        ];

        if (!allowedExtension.includes(productImage[0].mimetype))
            return res.status(400).send({ status: false, message: "Image should be in required format" });

        let uploadedFileURL = await aws.uploadFile(productImage[0]);

        filter.productImage = uploadedFileURL

    }
    let updateProduct = await productModel.findByIdAndUpdate({ _id: productId }, {$set:filter,$addToSet:{availableSizes:availableSizes}},{ new: true })
    
    return res.status(200).send({status:true,message: 'Success', data:updateProduct})
}
catch(error){
    res.status(500).send({ msg: error.message })
    console.log(error)
}

}

const deleteProduct=async function(req,res){
   try {let productId= req.params.productId.trim()
   if(!productId){
        return res.status(400).send({status:false,message:"product id should be in the path parameters"})
    }
    if(!isValidObjectId(productId)){
        return res.status(400).send({status:false,message:`${productId} is not a valid objectid`})

    }
    let productCheck= await productModel.findOneAndUpdate({_id:productId,isDeleted:false},{deletedAt:Date.now(),isDeleted:true})
    if(!productCheck){
        return res.status(404).send({status:false,message:"product not found"})
    }

    return res.status(200).send({status:true,message:"product is deleted"})}
    catch(error){
        res.status(500).send({ msg: error.message })  
    }
}




module.exports = { productCreate, getProductByParam, getProduct ,updateProduct,deleteProduct}