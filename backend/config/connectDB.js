const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async() => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Successfully connected to database");
    } catch(error) {
        console.error(`Error in database connection : ${error}`);
    }
}

module.exports = connectDB;


