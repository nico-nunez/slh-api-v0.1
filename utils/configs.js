const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const mongoDBUrl = process.env.MONGODB_URL;
const secret = process.env.SECRET;


const db = mongoose.connection;

const connectDB = () => {
  mongoose.connect(mongoDBUrl);

  db.on("error", console.error.bind(console, 'Mongo Connection Failed...'));
  db.once("open", () => {
      console.log("Mongo Connection Open...");
  });
}


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

module.exports = { connectDB, sessionConfig };
