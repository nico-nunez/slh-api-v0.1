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

router.post('/', catchAsync (async (req, res) => {
    try {
        const { username, profileName, password, confirmPass } = req.body.newUser;
        if(password !== confirmPass) {
            req.flash('error', 'Passwords must match.')
            return res.redirect('/users/register')
        }
        const newUser = new User({ username, profileName });
        const user = await User.register(newUser, password);
        req.flash('success', 'Welcome! Thank you for joining!');
        res.redirect('/parties');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('users/register');
    }

}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/users/login'}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/parties');
});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    res.render('users/edit')
}));

module.exports = router;