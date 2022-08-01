const express= require("express")
const router=express.Router()
const {authetication,authorisation}=require("../middleware/auth")
const{getUserDetails,registerUser,login,updateUser}=require("../controllers/userController")
const {productCreate,getProductByParam,getProduct,updateProduct,deleteProduct}=require("../controllers/productController")
const{productaValid}=require("../validator/productValidator")
const {createCart,updateCart,getCart,deleteCart}=require("../controllers/cartController")
const {createOrder,updateOrder}=require("../controllers/orederController")


router.get("/user/:userId/profile",authetication,getUserDetails)
 
router.post("/register",registerUser)

router.post("/login",login)

router.put("/user/:userId/profile",authetication,authorisation,updateUser)

router.post("/products",productaValid,productCreate)

router.get("/products/:productId",getProductByParam)
 
router.get("/products",getProduct)

router.put("/products/:productId",updateProduct)

router.delete("/products/:productId",deleteProduct)

router.post("/users/:userId/cart",authetication,authorisation,createCart)

router.put("/users/:userId/cart",authetication,authorisation,updateCart)

router.get("/users/:userId/cart",authetication,authorisation,getCart)

router.delete("/users/:userId/cart",authetication,authorisation,deleteCart)

router.post("/users/:userId/orders",authetication,authorisation,createOrder)

router.put("/users/:userId/orders",authetication,authorisation,updateOrder)


module.exports= router