const express = require('express');
const router = express.Router();
const passport = require('passport');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
const { isLoggedIn, isUser} = require('../middleware');
const List = require('../models/list');
const User = require('../models/user');
const Party = require('../models/party')


router.get('/', catchAsync(async(req, res, next) => {
    const users = await User.find().populate({
        path: 'selections',
        populate: {
            path: 'giftee party',
        },
    });
    res.render('users/index', { users });
}))


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
            return res.redirect(redirect);
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
    const redirection = req.session.redirectedFrom || `/parties`;
    delete req.session.redirectedFrom;
    req.flash('success', 'Welcome back!');
    res.redirect(redirection);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('login');
})

router.get('/:id', isLoggedIn, isUser, catchAsync(async (req, res) => {
    const user = await User.findById( req.params.id).populate({
        path: 'selections',
        populate: {
            path: 'giftee party'
        }
    });
    const userLists = await List.find({'creator': req.user._id});
    const parties = await Party.find({'members': req.user._id })
    res.render('users/profile', {user, userLists, parties});
}));

router.get('/:id/lists', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id)
    const userLists = await List.find({'creator': req.params.id});
    res.render('users/lists', {user, userLists});
}));

router.get('/:id/famlies', isLoggedIn, catchAsync(async (req, res) => {
    const userFamlies = await Familes.find({'members': req.user._id});
    res.render('users/famlies', {userFamlies});
}));

router.get('/:id/parties', isLoggedIn, isUser, catchAsync(async (req, res) => {
    const userParties = await Party.find({'members': req.user._id})
    res.render('users/parties', {userParties});
}));

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    res.render('users/edit')
}));

module.exports = router;