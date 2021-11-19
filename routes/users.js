const express = require('express');
const router = express.Router();
const User = require('../models/user');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
// const { validateUser } = require('../joiSchemas');


router.get('/', (req, res) => {
    res.render('users/index');
});

router.post('/', catchAsync (async (req, res) => {
    const { username, profileName, password, confirmPass } = req.body.newUser;
    if(password !== confirmPass) {
        req.flash('error', 'Passwords must match.')
        return res.redirect('/users/register')
    }
    const newUser = new User({ username, profileName });
    const user = await User.register(newUser, password);
    req.flash('success', 'Welcome! Thank you for joining!');
    res.redirect('/parties');
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', catchAsync (async (req, res) => {
    const { user } = req.body;
    // const newUser = new User({email: '', username: 'Fakey McFakester', profileName: 'fake_son'});
    // const user = await User.register(newUser, 'fakePass');
    res.send(user);
}));

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    res.render('users/edit')
}));

module.exports = router;