const express = require('express')
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');

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
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/lists', async (req, res) => {
    const lists = await List.find({})
    res.render('lists/index', {lists});
});

app.post('/lists', async (req, res) => {
    const { list } = req.body;
    const newList = new List({...list});
    await newList.save();
    res.redirect(`lists/${newList._id}`);
})

app.get('/lists/new', (req, res) => {
    res.render('lists/new');
});

app.get('/lists/:id', async (req, res) => {
    const list = await List.findById(req.params.id)
    res.render('lists/show', {list})
})

app.put('/lists/:id', async(req, res) => {
    const { id } = req.params;
    await List.findByIdAndUpdate(id, {...req.body.list});
    res.redirect(`/lists/${id}`);
});

app.get('/lists/:id/edit', async (req, res) => {
    const list = await List.findById(req.params.id);
    res.render('lists/edit', { list });
})


const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})