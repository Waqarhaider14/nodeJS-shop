import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the product name'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide the product price'],
  },
  description: {
    type: String,
    required: [true, 'Please provide the product description'],
  },
  category: {
    type: String,
    required: [true, 'Please provide the product category'],
  },
  gender: {
    type:String,
    enum: ['male', 'female', 'kids'],
    required: [true, 'Please provide gender']
  },
  size: {
    type: String,
    enum : ['small', 'medium', 'large', 'X large']
  },
  stock: {
    type: Number,
    default: 0,
  },
  picture: {
    type: String, // The URL of the product picture will be stored here
  },
  review: [
    {
      user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
      },
      product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      rating: {
        type: Number,
        required: true,
      },
      comment:{
        type: String,
      }
    }
  ]

}, {timestamps:true});

const Product = mongoose.model('Product', productSchema);

export default  Product;
