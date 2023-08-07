import mongoose  from "mongoose"

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    verificationToken : {
        type: String,
    },
    resetToken :{
        type: String
    },
    resetTokenExpires : {
        type: Date
    },
    cart :[{
        product : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity : {
            type : Number,
            default: 1,
        },
    }],
    purchases: [{
        product :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        },
        quantity :{
            type: Number,
            default: 1,
        },
    }],
    order :[{
        product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        }
    }]
}, {timestamps: true})



const User = mongoose.model('User', userSchema)

export default  User