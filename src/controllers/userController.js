const { isValidRequestBody, isValidData, isValidObjectId,isValidAlpha } = require("../validator/validator")
const userModel = require("../model/userModel")
const aws = require("../validator/aws")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

function Checkphone(number) {
    if (/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(number)) {
        return true
    }
    return false
}


const registerUser = async function (req, res) {
    try {

        let requestBody = req.body


        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }
        if(req.body.data){
              requestBody =JSON.parse(req.body.data)
              
        }
        
                
                let profileImage=req.files
              
      
        //extract param
        let { fname, lname, email, password, phone, address } = requestBody
        // console.log(profileImage)
        let missdata = ""
        
        if (!isValidData(fname)) {
            missdata = missdata + " fname"
        }
        if (!isValidData(lname)) {
            missdata = missdata + " lname"

        }
        if (!isValidData(email)) {
            missdata = missdata + " email"

        }

        if (!isValidData(phone)) {
            missdata = missdata + " phone"

        }
        if (!isValidData(password)) {
            missdata = missdata + " password"

        }
        if (!isValidData(address)) {
            missdata = missdata + " address"

        }
        if (address) {
            if (!isValidData(address.shipping)) {
                missdata = missdata + " shipping address"

            }
            if (address.shipping) {
                if (!isValidData(address.shipping.street)) {
                    missdata = missdata + " shipping-street"

                }
                if (!isValidData(address.shipping.city)) {
                    missdata = missdata + " shipping-city"
                }
                if (!isValidData(address.shipping.pincode)) {
                    missdata = missdata + " shipping-pincode"

                }
            }
            if (!isValidData(address.billing)) {
                missdata = missdata + " billing-address"

            }
            if (address.billing) {
                if (!isValidData(address.billing.street)) {
                    missdata = missdata + " billing-street"

                }
                if (!isValidData(address.billing.city)) {
                    missdata = missdata + " billing-city"

                    
                }
                if (!isValidData(address.billing.pincode)) {
                    missdata = missdata + " billing-pincode"

                }
            }
        }
        if(!profileImage ||profileImage.length==0){
            missdata=missdata+" profileImage"
        }
        if (missdata) {
            let msg = missdata + " is missing"
            return res.status(400).send({ status: false, message: msg })
        }
        if (!isValidAlpha(fname)) {
            return res.status(400).send({ status: false, message: 'first name is not valid' })

        }

        if (!isValidAlpha(lname)) {
            return res.status(400).send({ status: false, message: 'last name is not valid' })

        }

        if (!isValidData(email)) {
            res.status(400).send({ status: false, message: 'email is required' })
            return
        }

        if (!isValidData(password)) {
            res.status(400).send({ status: false, message: 'password is required' })
            return
        }
        
        if (!((password.length > 7) && (password.length < 16))) {

            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })

        }
        if (!Checkphone(phone.trim())) {
            return res.status(400).send({ status: false, msg: "The phone no. is not valid" })
        }
        if (!isValidData(address)) {
            return res.status(400).send({ status: false, msg: "Address is mandatory" })
        }
        if (!isValidData(address.shipping)) {
            return res.status(400).send({ status: false, msg: "Shipping address is missing mandatory fields" })

        }
        if (!isValidData(address.shipping.street && address.shipping.city && address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "Some shipping address details or detail are/is missing" })
        }
        if (!isValidData(address.billing)) {
            return res.status(400).send({ status: false, msg: "Billing address is missing mandatory fields" })
        }
        if (!isValidData(address.billing.street && address.billing.city && address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Some billing address details or detail are/is missing" })
        }
        const isNumberorEmailAlreadyUsed = await userModel.findOne({$or:[ {phone},{email} ]});
        
        if (isNumberorEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} number or ${email} mail is already registered` })
            return
        }
        if (!isValidData(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }
        let files = req.files;
        if (files && files.length > 0) {
            //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
            let uploadedFileURL = await aws.uploadFile(files[0]); // expect this function to take file as input and give url of uploaded file as output 
            //    res.status(201).send({ status: true, data: uploadedFileURL });
            const EncrypPassword = await bcrypt.hash(password, 10)
            // console.log(EncrypPassword)
            profileImage = uploadedFileURL
            const userData = { fname, lname, email, phone, profileImage, password: EncrypPassword, address }
            let saveduser = await userModel.create(userData)
            res.status(201).send({ status: true, message: 'user created succesfully', data: saveduser })
        }
        else {
            res.status(400).send({ status: false, msg: "No file to write" });
        }

        
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
        
        
    }
}
const login = async function (req, res) {
    try {
        let data = req.body



        
        if (Object.keys(data).length == 0)
        res.status(400).send({ status: false, msg: "There are no any Data in Request Body Please Enter some Valid data" })
        let { email, password } = data
          email=email.trim()
          password= password.trim()
        if (!(isValidData(email) && isValidData(password)))
            res.status(400).send({ status: false, msg: "email and password both required" })

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "Email Should be valid EmailId" })
        }
        
        if (password.length < 8 || password.length > 16) {
            return res.status(400).send({ status: false, msg: "Password Shiuld be Min 8 and Max 16" })
        }

        let user = await userModel.findOne({ email: email })
       
        if (user) {

            let passwordmatch = bcrypt.compareSync(password, user.password)
            if (passwordmatch) {

                let token = jwt.sign({ userId: user._id }, "RoomNo-74", { expiresIn: '365d' })
                let details = { userid: user._id, token: token }

                return res.status(200).send({ status: true, msg: "Login Sucessfully", data: details })
            }
            else {
                return res.status(404).send({ status: false, msg: "Password is Not match" })
            }
        }
        return res.status(404).send({ status: false, msg: "email not found" })

    }
    catch (error) {
        res.status(500).send({ msg: "server error", err: error.message })
    }
}

const getUserDetails = async function (req, res) {
    try {
        let dToken = req.decodedtoken
        let userId = req.params.userId.trim()

        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is missing in the path parameter" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "not a valid userId" })
        }
        if (dToken.userId != userId) {
            return res.status(401).send({ staus: false, message: "you are not autheticated" })
        }
        const userDetails = await userModel.findById({ _id: userId })

        res.status(200).send({ status: true, message: "User profile details", data: userDetails })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        let files = req.files;
        const requestBody = req.body
        userId = req.decodedtoken.userId

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, message: `User do not exists` })
        }


        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide details to update' })
            return
        }
        // destructuring the body
        var { fname, lname, email, phone, password, address } = requestBody;
        let updateUserData = {}
        if (fname) {
            if (!isValidData(fname)) {
                return res.status(400).send({ status: false, message: 'fname Required' })
            }

            updateUserData['fname'] = fname
        }
        if (lname) {
            if (!isValidData(lname)) {
                return res.status(400).send({ status: false, message: 'lname Required' })
            }

            updateUserData['lname'] = lname
        }
        if (email) {
            if (!isValidData(email)) {
                return res.status(400).send({ status: false, message: 'Invalid request parameters. email required' })
            }

            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` })
            }
            const duplicateEmail = await userModel.find({ email: email })
            if (duplicateEmail.length) {
                return res.status(400).send({ status: false, message: 'email already exists' })
            }

            updateUserData['email'] = email
        }
        if (phone) {
            if (!isValidData(phone)) {
                return res.status(400).send({ status: false, message: "phone number is not given in string" })
            }

            if (!(/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phone.trim()))) {
                return res.status(400).send({ status: false, message: `Please provide valid phone number` })
            }
            const duplicatePhone = await userModel.find({ phone: phone })
            if (duplicatePhone.length) {
                return res.status(400).send({ status: false, message: 'phone already exists' })
            }

            updateUserData['phone'] = phone
        }

        if (password) {
            if (!isValidData(password)) {
                return res.status(400).send({ status: false, message: "password in not in a proper format " })
            }
            if (!((password.length > 7) && (password.length < 16))) {

                return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })

            }
            const encrypt = await bcrypt.hash(password, 10)
            updateUserData['password'] = encrypt
        }
        if (address) {
            console.log(address)
            if (typeof address == "string") {
                let Address = JSON.parse(address)
                var address = Address
            }

            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValidData(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street to update' })
                    }
                    updateUserData['address.shipping.street'] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!isValidData(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city name to update' })
                    }
                    updateUserData['address.shipping.city'] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    console.log(address.shipping.pincode)
                    if (/^[1-9]{1}[0-9]{5}$/.test(address.shipping.pincode) == false) {
                        return res.status(400).send({ status: false, message: 'Please provide pincode to update' })
                    }
                    let pinCode = parseInt(address.shipping.pincode)
                    updateUserData['address.shipping.pincode'] = pinCode
                }
            }
            if (address.billing) {

                if (address.billing.street) {
                    if (!isValidData(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'Please provide street to update' })
                    }
                    updateUserData['address.billing.street'] = address.billing.street
                }
                if (address.billing.city) {
                    if (!isValidData(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'Please provide city to update' })
                    }
                    updateUserData['address.billing.city'] = address.billing.city
                }
                if (address.billing.pincode) {
                    let pinCode = parseInt(address.billing.pincode)
                    if (typeof pinCode !== 'number') {
                        return res.status(400).send({ status: false, message: 'Please provide pincode to update' })
                    }
                    updateUserData['address.billing.pincode'] = pinCode
                }

            }
        }
        // let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await aws.uploadFile(files[0]);
            // res.status(201).send({ status: true, data: uploadedFileURL });
            if (uploadedFileURL) {
                updateUserData['profileImage'] = uploadedFileURL
            }
        }
        const updatedUserData = await userModel.findOneAndUpdate({ _id: userId }, updateUserData, { new: true })
        res.status(201).send({ status: true, data: updatedUserData })
    } catch (error) {
        res.status(500).send({ status: false, msg: error });
        console.log(error)
    }

}

























module.exports = { getUserDetails, registerUser, login, updateUser }
