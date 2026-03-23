import mongoose from 'mongoose'
import { DB_NAME } from '../constant.js'

export const connectDB = async () => {
  try {
const mongoUrl = `${process.env.MONGODB_URL}/${DB_NAME}?retryWrites=true&w=majority`;
console.log("Connecting to MongoDB at:", mongoUrl);

const response = await mongoose.connect(mongoUrl);

    console.log(`✅ MongoDB connected | Host: ${response.connection.host}`);
  } catch (error) {
    console.log(`❌ MongoDB connection error: ${error}`);
    process.exit(1);
  }
};
