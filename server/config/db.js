const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "SmartLabBooking"
    });

    console.log("MongoDB Connected:", conn.connection.name);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log("Collections:", collections.map(c => c.name));

    const count = await mongoose.connection.db
      .collection("labs")
      .countDocuments();

    console.log("Total labs in database:", count);

  } catch (error) {
    console.log("Database Error:", error.message);
  }
};

module.exports = connectDB;