const express = require('express')
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// -------------- Mongoose -----------
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';

const db = mongoose.connection;
mongoose.connect(mongoDBUrl, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    });

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('index');
});


const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})