const mongoose = require("mongoose")


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        trim:true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
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
    },
    totalQuantity: {
        type: Number,
        required: true,
        trim:true
    },
    cancellable: {
        type: Boolean,
        default: true,
        trim:true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ["pending", "completed", "canceled"]
    },
    deletedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)