import mongoose from 'mongoose'
const connectDB = async () =>{
    try{
        const connection_string = 'mongodb://localhost:27017/Ecommerce-app'
        const connect = await mongoose.connect(connection_string);
        console.log("Database connected", connect.connection.name, connect.connection.host)
    } catch (err){
        console.log(err)
        process.exit(1)
    }
}

export {connectDB};