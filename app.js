const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Joi = require('joi')
const { ExpressError, errorHandler, catchAsync } = require('./utils');
const { validateList } = require('./middleware');

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

app.get('/lists', catchAsync( async (req, res, next) => {
    const lists = await List.find({})
    res.render('lists/index', {lists});
}));

app.post('/lists', validateList, catchAsync( async (req, res, next) => {
    const { list, items } = req.body;
    const newList = new List({...list});
    await newList.save();
    res.redirect(`lists/${newList._id}`);
}));

app.get('/lists/new', (req, res) => {
    res.render('lists/new');
});

app.get('/lists/:id', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    res.render('lists/show', {list});
}));

app.put('/lists/:id', validateList, catchAsync( async(req, res, next) => {
    if(!req.body.list) throw new ExpressError('Invalid List Data', 400);
    const { id } = req.params;
    await List.findByIdAndUpdate(id, {...req.body.list});
    res.redirect(`/lists/${id}`);
}));

app.delete('/lists/:id', catchAsync( async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    res.redirect('/lists');
}));

app.get('/lists/:id/edit', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    res.render('lists/edit', { list });
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  })


app.use(errorHandler);

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})