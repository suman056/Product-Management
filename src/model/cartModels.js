const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        trim:true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
            trim:true

        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            trim:true
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        trim:true
    },
    totalItems: {
        type: Number,
        required: true,
        trim:true
    }
}, { timestamps: true })

module.exports = mongoose.model("cart", cartSchema)