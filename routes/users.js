const express = require('express');
const router = express.Router();
const passport = require('passport');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
const { isLoggedIn, isUser} = require('../middleware/validators');
const List = require('../models/list');
const User = require('../models/user');
const Party = require('../models/party')


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

router.get('/:id', isLoggedIn, isUser, catchAsync(async (req, res, next) => {
    const currentUser = await User.findById( req.params.id).populate({
        path: 'selections',
        populate: {
            path: 'giftee party'
        }
    });
    const currentUserLists = await List.find({'creator': req.user._id});
    const parties = await Party.find({'members': req.user._id })
    res.render('users/index', {currentUser, currentUserLists, parties});
}));

router.get('/:id/public_profile', isLoggedIn, catchAsync( async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const userLists = await List.find({ 'creator': id });
    const parties = await Party.find({ 'members' : id });
    res.render('users/show', { user, userLists, parties });
}));

router.get('/:id/lists', isLoggedIn, catchAsync(async (req, res) => {
    const currentUser = await User.findById(req.params.id)
    const currentUserLists = await List.find({'creator': req.params.id});
    res.render('users/lists', {currentUser, currentUserLists});
}));

router.get('/:id/famlies', isLoggedIn, catchAsync(async (req, res) => {
    const userFamlies = await Familes.find({'members': req.user._id});
    res.render('users/famlies', {userFamlies});
}));

router.get('/:id/parties', isLoggedIn, isUser, catchAsync(async (req, res) => {
    const userParties = await Party.find({'members': req.user._id})
    res.render('users/parties', {userParties});
}));

router.get('/:id/edit', isLoggedIn, isUser, catchAsync( async (req, res, next) => {
    const currentUser = await User.findById( req.params.id );
    res.render('users/edit', { currentUser })
}));

router.put('/:id/edit', isLoggedIn, isUser, catchAsync( async (req, res, next) => {
    const { profileName, password } = req.body;
    const { id } = req.params;
    const user = await User.findById(id);
    if(profileName) {
       user.profileName = profileName;
       await user.save();
    }
    if(password) {
        if(password.new !== password.confirm) {
            req.flash('error', 'Password confirmation must match.');
        } else {
            await user.changePassword(password.current, password.new);
        }
    }
    res.redirect(`/users/${id}`);
}))

module.exports = router;