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
    const { newUser } = req.body;
    // const newUser = new User({email: '', username: 'Fakey McFakester', profileName: 'fake_son'});
    // const user = await User.register(newUser, 'fakePass');
    res.send(newUser);
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    res.render('users/edit')
}));

module.exports = router;