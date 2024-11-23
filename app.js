if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const passportConfig = require('./middleware/passport');
const { connectDB, sessionConfig, corsConfig } = require('./helpers/configs');
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

app.use(cors(corsConfig));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

app.use((req, res, next) => {
	res.locals.loggedInUser = req.user;
	next();
});

app.get('/', (req, res) => {
	if (req.user) {
		res.redirect('/users/dashboard');
	} else {
		res.status(403).json({ errorMessage: 'Unauthorized user.' });
	}
});

app.use('/api/auth', authRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/parties', partiesRoutes);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Server running on ${port}`);
});
