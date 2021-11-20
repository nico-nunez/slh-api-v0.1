const mongoose = require('mongoose');
const toys = require('./toys');
const firstNames = require('./firstNames');
const partyNames = require('./partyNames');
const dayjs = require('dayjs');

// --------- Models -----------
const List = require('../models/list');
const Party = require('../models/party');

const creator = '6198140850dae10abb82c4fa';
// -------------- Mongoose -----------
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';

const db = mongoose.connection;
mongoose.connect(mongoDBUrl);

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

function randInt(num) {
    return Math.floor(Math.random() * num);
}

const items = [];

for (let i=0; i<20; i++) {
    const numToys = toys.length;
    let randomItems = []
    for (let j=0; j<5; j++){
        let item = {
            description: toys[randInt(numToys)],
            link: '',
            purchased: false
        }
        randomItems.push(item);
    }
    items.push(randomItems)
}


const seedLists = async () => {
    const numNames = firstNames.length;
    const numItems = items.length;
    await List.deleteMany({});
    for (let i=0; i<10; i++){
        const name = firstNames[randInt(numNames)];
        const list = new List({
            title: `${name}'s List`,
            items: items[randInt(numItems)],
            creator
        });
        await list.save();
    } 
}

const seedParties = async () => {
    await Party.deleteMany({});
    for (let i=0; i<10; i++) {
        const randNum = randInt(partyNames.length);
        const [ name ] = partyNames.splice(randNum, 1);
        const joinBy = dayjs().add(1, 'day');
        const endsOn = dayjs().add(1, 'month');
        const party = new Party({
            name,
            joinBy,
            endsOn,
            creator,
            isPrivate: randNum % 2 === 0
        })
        await party.save();
    }
}

const seedDB = async () => {
    await seedLists();
    await seedParties();
}

seedDB().then(() => {
	mongoose.connection.close();
});
