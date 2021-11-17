const express = require('express')
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// --------- Models -----------
const List = require('./models/list');

// -------------- Mongoose -----------
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';

const db = mongoose.connection;
mongoose.connect(mongoDBUrl);

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/newlist', async(req, res) => {
    const list = new List({ title: 'My first list'})
    await list.save();
    res.send(list);
})


const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})