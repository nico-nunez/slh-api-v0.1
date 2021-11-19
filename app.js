const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const { ExpressError, errorHandler, catchAsync } = require('./utils');
const { validateList } = require('./middleware');

const listsRoutes = require('./routes/lists');

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

app.use('/lists', listsRoutes)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  })


app.use(errorHandler);

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})