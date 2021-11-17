const mongoose = require('mongoose');
const toys = require('./toys');
const firstNames = require('./firstNames');
const namesLen = firstNames.length;

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

const items = [];

for (let i=0; i<20; i++) {
    let randomItems = []
    for (let j=0; j<5; j++){
        let item = {
            description: toys[Math.floor(Math.random() * toys.length)],
            link: '',
            purchased: false
        }
        randomItems.push(item);
    }
    items.push(randomItems)
}


const seedDB = async () => {
    await List.deleteMany({});
    for (let i=0; i<10; i++){
        const name = firstNames[Math.floor(Math.random() * namesLen)]
        const list = new List({title: `${name}'s List`});
        list.items = items[Math.floor(Math.random() * items.length)]
        await list.save();
    }   
}

seedDB().then(() => {
	mongoose.connection.close();
});
