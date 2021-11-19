const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
// const { validateUser } = require('../joiSchemas');


router.get('/', (req, res) => {
    res.render('users/index');
});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync (async (req, res) => {
    try {
        const { username, profileName, password, confirmPass } = req.body.newUser;
        if(password !== confirmPass) {
            req.flash('error', 'Passwords must match.')
            return res.redirect('register')
        }
        const newUser = new User({ username, profileName });
        const user = await User.register(newUser, password);
        req.login(user, err => {
            if (err) return next(err);
            const redirect = req.session.redirectedFrom || '/parties';
            delete req.session.redirectedFrom;
            req.flash('success', 'Welcome! Thank you for joining!');
            res.redirect(redirect);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/users/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: 'login'}), (req, res) => {
    const redirect = req.session.redirectedFrom || '/parties';
    delete req.session.redirectedFrom;
    req.flash('success', 'Welcome back!');
    res.redirect(redirect);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('login');
})


router.get('/:id/edit', catchAsync( async (req, res, next) => {
    res.render('users/edit')
}));

module.exports = router;