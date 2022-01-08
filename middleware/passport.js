const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { sendConfirmation } = require('../helpers/email');
const User = require('../models/User');

module.exports = () => {

  const googleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  }
  
  const googleCallback = async (accessToken, refreshToken, profile, done) => {
    const existingUser = await User.findOne({ googleID: profile.id });

    if(existingUser)
      return done(null, existingUser);
      
    const newUser = new User({ 
      googleID: profile.id,
      email: profile.email,
      displayName: profile.displayName,
    });
    const user = await newUser.save();
    sendConfirmation(user);
    done(null, user);
  }

  const serializeUser = (user, done) => {
    done(null, user.id);
  }

  const deserializeUser = async (id, done) => {
    const user = await User.findById( id ) ;
    done(null, user);
  }

  passport.use(new LocalStrategy({usernameField: 'email'},User.authenticate({usernameField: 'email'})));
  passport.use(new GoogleStrategy(googleOptions, googleCallback));
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

}