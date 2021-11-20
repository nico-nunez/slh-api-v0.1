const express = require('express')
const router = express.Router();
const { ExpressError, errorHandler, catchAsync } = require('../utils');
const { validateParty } = require('../joiSchemas');
const { isLoggedIn, isCreatorParty } = require('../middleware');
const dayjs = require('dayjs');

const Party = require('../models/party');

router.get('/', catchAsync( async (req, res, next) => {
    const parties = await Party.find().populate('creator').lean();
    res.render('parties/index', {parties})
}));

router.post('/', isLoggedIn, validateParty, catchAsync( async (req, res, next) => {
    const { party } = req.body;
    party.isPrivate = party.isPrivate ? true : false;
    party.creator = req.user._id;
    const newParty = new Party(party);
    await newParty.save();
    req.flash('success', 'Success! Your party has been created.');
    res.redirect('/parties');
}));

router.get('/new', isLoggedIn, (req, res) => {
    const dates = {
        min: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        max: dayjs().add(1, 'year').format('YYYY-MM-DD')
    }
    res.render('parties/new', {dates});
});

router.get('/:id', catchAsync( async (req, res, next) => {
    const { id } = req.params;
    const party = await Party.findById( id ).populate('creator');
    if(!party) {
        req.flash('error', "Sorry, coud not find that party");
        return res.redirect('/parties');
    }
    res.render('parties/show', { party })
}));

router.delete('/:id', isLoggedIn, isCreatorParty, catchAsync ( async (req, res, next) => {
    const { id } = req.params;
    await Party.findByIdAndDelete( id );
    req.flash('success', 'Success! Party has been deleted.');
    res.redirect('/parties');
}));



module.exports = router;