const mongoose = require("mongoose");

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries++;
      console.error(
        `MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`,
        error.message
      );
      if (retries === MAX_RETRIES) {
        console.error("Max retries reached. DB connection failed.");
        throw new Error("Failed to connect to MongoDB after max retries");
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
