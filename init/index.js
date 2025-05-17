const mongoose = require('mongoose');
const initData = require('./data');
const listing = require('../models/listing');

const MONGO_URI = "mongodb://localhost:27017/wanderlust";

main().then(() => {
    console.log("Connected to database");
    initDB(); // Call the initDB function here
}).catch((err) => {
    console.log("Database connection error:", err);
});

async function main() {
    await mongoose.connect(MONGO_URI);
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=> ({...obj,owner:'68124922f7f95950dca3626c'}));
    await listing.insertMany(initData.data);
    console.log("Data was initialized");
};
