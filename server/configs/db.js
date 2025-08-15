import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // The await here will pause execution until the connection is either successful or throws an error.
        await mongoose.connect(`${process.env.MONGODB_URL}/SarvTribe`);

        // This log will only run if the connection is successful.
        console.log('Database connected successfully');

    } catch (error) {
        console.error('Database connection failed:', error.message);
        
        // Re-throw the error to be caught by the server's startup logic
        throw error;
    }
};

export default connectDB;