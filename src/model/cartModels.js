// const mongoose=require("mongoose")

// const cartSchema=new mongoose.Schema({ 
//     userId: {type:mongoose.Schema.Types.ObjectId, 
//         refs:"user", 
//         required:true, 
//         unique:true},
//     items: [{
//       productId: {ObjectId, refs to Product model, mandatory},
//       quantity: {number, mandatory, min 1}
//     }],
//     totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//     totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},},{timestamps:true})

// module.exports=mongoose.model("cart",cartSchema)