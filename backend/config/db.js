import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://task_management:task_management12345@cluster0.kgulbxz.mongodb.net/Task_management");
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error: ", err);
    
  }
};