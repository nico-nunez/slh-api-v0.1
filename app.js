if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const User = require('./models/user');

const { ExpressError, errorHandler} = require('./utils');

// Routes
const listsRoutes = require('./routes/lists');
const partiesRoutes = require('./routes/parties');
const usersRoutes = require('./routes/users');
const familiesRoutes = require('./routes/families');
// -------------- Mongoose -----------

// const dbURL = process.env.DB_URL
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/grab-bag';
const secret = process.env.SECRET || 'supersecretwordything';
// const mongoDBUrl = dbURL

const db = mongoose.connection;
mongoose.connect(mongoDBUrl);

db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
db.once("open", () => {
    console.log("Mongo Connection Open...");
});

const store = MongoStore.create({
    mongoUrl: mongoDBUrl,
    touchAfter: 24*60*60,
    crypto: {
      secret 
    }
});

store.on('error', function (e) {
    console.log(('SESSION STORE ERROR', e))
});

const sessionConfig = {
    store,
    secret,
    name: 'appSession',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7 * 31,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 31
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.loggedInUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/', (req, res) => {
    res.render('home');
});

app.use('/lists', listsRoutes);
app.use('/parties', partiesRoutes);
app.use('/users', usersRoutes);
// app.use('/families', familiesRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  })


app.use(errorHandler);

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server running on ${port}`);
})