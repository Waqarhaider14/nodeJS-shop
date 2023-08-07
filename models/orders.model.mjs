import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    items : [
        {
            product : {
                type : mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required:true
            },
            quantity: {
                type: Number,
                required: true,
            },
            price : {
                type: Number,
                required: true
            },
        },
    ],
    total: {
        type : Number,
        required: true
    },
}, {timestamps : true})

const Order = mongoose.model("Order", orderSchema)

export default  Order;