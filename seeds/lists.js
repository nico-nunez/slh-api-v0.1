const mongoose = require('mongoose');

// --------- Models -----------
const List = require('../models/list');

// -------------- Mongoose -----------
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';

const db = mongoose.connection;
mongoose.connect(mongoDBUrl);

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

const seedDB = async () => {
    await List.deleteMany({});
    for (let i=0; i<10; i++){
        const list = new List({title: `My list ${i}`});
        await list.save();
    }   
}

seedDB();