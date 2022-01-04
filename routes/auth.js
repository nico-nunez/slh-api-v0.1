const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ExpressError, catchAsync } = require('../utils');
const { isLoggedIn, isUser} = require('../middleware/validators');
const { validUser } = require('../middleware/joiSchemas');
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', validUser, catchAsync (async (req, res) => {
  try {
      const { email, displayName, password, confirmPass } = req.body.newUser;
      const newUser = new User({ email, displayName });
      const user = await User.register(newUser, password);
      req.login(user, err => {
          if (err) return next(err);
          const redirect = req.session.redirectedFrom || '/parties';
          delete req.session.redirectedFrom;
          req.flash('success', 'Welcome! Thank you for joining!');
          return res.redirect(redirect);
      });
  } catch (e) {
      req.flash('error', e.message);
      res.redirect('/auth/register');
  }
}));


router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: 'login'}), (req, res) => {
  const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
  delete req.session.redirectedFrom;
  req.flash('success', 'Welcome back!');
  res.redirect(redirection);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('login');
})

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

router.get('/google/callback',
  passport.authenticate('google', {
    failureFlash: true, 
    failureRedirect: 'login'
  }),
  (req, res) => {
    const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
    delete req.session.redirectedFrom;
    req.flash('success', 'Welcome back!');
    res.redirect(redirection);
});


module.exports = router;