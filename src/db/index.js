import mongoose from 'mongoose' ;
import {DB_NAME} from '../constants.js'


// Databse connection Approach 1
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("\nDataBase Connected !!");
        
    } catch (error) {
        console.log("MONGO DB CONNECTION ERROR :: ",error);
        process.exit(1);
    }
}

export default connectDB