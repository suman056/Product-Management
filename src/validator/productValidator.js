const { isValidRequestBody, isValidData, isValidObjectId, isValidAlpha ,isValidAlphaNumeric} = require("./validator")
const aws = require("./aws")
const produnctModel = require("../model/productModel")


const productaValid = async function (req, res, next) {
    try {
        let requestBody = req.body



        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }
        if (req.body.data) {
            requestBody = JSON.parse(req.body.data)

        }
        let cretaeFolder = {}
        let productImage = req.files
        let { title, description, price, currencyId, style, availableSizes, currencyFormat, isFreeShipping, installments, isDeleted, deletedAt } = requestBody

        let missdata = ""
        //mandatory field
        if (!isValidData(title)) {
            missdata = missdata + " title"
        }
        if (!isValidData(description)) {
            missdata = missdata + " description"
        }

        if (!isValidData(price)) {
            missdata = missdata + " price"
        }
       
        if (!isValidData(style)) {
            missdata = missdata + " style"
        }
        // console.log(availableSizes)
        if (!isValidData(availableSizes)) {
            missdata = missdata + " availableSize"
        }
        if (productImage.length == 0) {
            missdata = missdata + " prductimage"
        }
        if (missdata.length > 0) {
            let message = missdata + " is missing"
            return res.status(400).send({ status: false, message: message })
        }
        // indivisual validation

        if (!isValidAlphaNumeric(title)) {
            return res.status(400).send({ status: false, message: "title is not in proper format" })
        }
        let titleCheck = await produnctModel.findOne({ title })
        if (titleCheck) {
            return res.status(400).send({ status: false, message: "title is already created" })
        }
        cretaeFolder.title = title
       
        cretaeFolder.description = description
        if (typeof price != Number) {
            price = parseInt(price)
        }

        if (!/^\d{0,8}(\.\d{1,4})?$/.test(price)) {
            return res.status(400).send({ status: false, message: "price is not in proper format" })
        }
        cretaeFolder.price = price
        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "currencyId should be INR" })
            }
            cretaeFolder.currencyId = currencyId
        }
        else{
            cretaeFolder.currencyId = "INR"
        }
        if(currencyFormat){
        if ( currencyFormat != "₹") {
            return res.status(400).send({ status: false, message: "currencyFormat should be ₹" })
        }
        cretaeFolder.currencyFormat = currencyFormat
    }
    else{
        cretaeFolder.currencyFormat="₹"
    }
        if (isFreeShipping) {
            if (typeof isFreeShipping != Boolean) {
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean" })
            }
            cretaeFolder.isFreeShipping = isFreeShipping
        }
        if (style) {
            if (!isValidAlphaNumeric(style)) {
                return res.status(400).send({ status: false, message: "style is not in proper format" })
            }
            cretaeFolder.style = style
        }
        availableSizes = availableSizes.split(',').map(x => x.trim())
        const sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i in availableSizes) {
            if (!sizes.includes(availableSizes[i])) {
                return res.status(400).send({ status: false, message: `${availableSizes[i]} in not a proper size` })
            }
        }
        cretaeFolder.availableSizes = availableSizes
        if (installments) {
            if (typeof installments != Number) {
                installments = parseInt(installments)
            }
            if (/^[0-9]{1,2,3}$/.test(installments)) {
                return res.status(400).send({ status: false, message: "not a proper installment" })
            }
            cretaeFolder.installments = installments
        }
        if (isDeleted) {
            if (typeof isDeleted != Boolean) {
                return res.status(400).send({ status: false, message: "isDeleted should be boolean" })
            }
            if (isDeleted == true) {
                if (!deletedAt) {
                    return res.status(400).send({ status: false, message: "if you have deleted you have to give time" })
                }
                if (typeof deletedAt != Date) {
                    return res.status(400).send({ status: false, message: "deletedAt should be in proper format" })
                }
                cretaeFolder.deletedAt = deletedAt
            }
            cretaeFolder.isDeleted = isDeleted
        }
        // if(/  \.(gif|jpe?g|tiff?|png|webp|bmp)$/.test(productImage)==false){
        //     return res.status(400).send({status:false,message:`${productImage} is not a proper image file`})
        // }
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

        cretaeFolder.productImage = uploadedFileURL

        req.cretaeFolder = cretaeFolder
        next()
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
    }

}











module.exports = { productaValid }




