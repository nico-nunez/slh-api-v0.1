const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    res.render('home');
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
    const list = await List.findById(req.params.id);
    res.render('lists/show', {list});
});

app.put('/lists/:id', async(req, res) => {
    const { id } = req.params;
    await List.findByIdAndUpdate(id, {...req.body.list});
    res.redirect(`/lists/${id}`);
});

app.delete('/lists/:id', async (req, res) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    res.redirect('/lists');
});

app.get('/lists/:id/edit', async (req, res) => {
    const list = await List.findById(req.params.id);
    res.render('lists/edit', { list });
});

app.get('/lists/:id/items/new', async (req, res) => {
    const list = await List.findById(req.params.id);
    res.render('lists/itemNew', { list });
})

app.post('/lists/:id/items', async (req, res) => {
    const { description, link } = req.body.item;
    const list = await List.findById(req.params.id);
    list.items.push({...req.body.item})
    await list.save();
    res.redirect(`/lists/${req.params.id}/edit`);
});

app.get('/lists/:id/items/:item_id/edit', async(req, res) => {
    const list = await List.findById(req.params.id);
    const item = list.items.id(req.params.item_id);
    res.render('lists/itemEdit', {list, item});
});

app.put('/lists/:id/items/:item_id', async(req, res) => {
    const { id, item_id } = req.params;
    const { description, link } = req.body.item;
    const list = await List.findById(id);
    const item = list.items.id(item_id);
    item.description = description;
    item.link = link
    await list.save()
    res.redirect(`/lists/${id}`);
});

app.delete('/lists/:id/items/:item_id', async(req, res) => {
    const { id, item_id } = req.params;
    const list = await List.findById(id);
    list.items = list.items.filter( item => item.id !== item_id);
    await list.save();
    res.redirect(`/lists/${id}/edit`);
});



const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})