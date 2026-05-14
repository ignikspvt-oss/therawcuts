const mongoose = require("mongoose");

let cachedPromise = global.__mongooseConnPromise;

const connectDB = () => {
  if (cachedPromise) return cachedPromise;
  cachedPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    })
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      cachedPromise = null;
      global.__mongooseConnPromise = null;
      console.error("MongoDB connection failed:", err.message);
      throw err;
    });
  global.__mongooseConnPromise = cachedPromise;
  return cachedPromise;
};

module.exports = connectDB;
