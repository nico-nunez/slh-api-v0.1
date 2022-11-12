if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const path = require('path');
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const passportConfig = require('./middleware/passport');
const { connectDB, sessionConfig } = require('./helpers/configs');
const { ExpressError, errorHandler } = require('./helpers/errors');

connectDB();

// Routes
const listsRoutes = require('./routes/lists.router');
const partiesRoutes = require('./routes/parties.router');
const usersRoutes = require('./routes/users.router');
const authRoutes = require('./routes/auth.router');

// if (process.env.NODE_ENV === 'production'){
//   app.set('trust proxy', 1)
// }

app.use(helmet({ contentSecurityPolicy: false }));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

app.use((req, res, next) => {
	res.locals.loggedInUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.get('/', (req, res) => {
	if (req.user) {
		res.redirect('/users/dashboard');
	} else {
		res.render('home');
	}
});

app.use('/lists', listsRoutes);
app.use('/parties', partiesRoutes);
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);
app.use(favicon(path.join(__dirname, '/public/assets/santa-hat.png')));

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Server running on ${port}`);
});
