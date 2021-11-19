const express = require('express')
const router = express.Router();
const { ExpressError, errorHandler, catchAsync } = require('../utils');
const { validateParty } = require('../joiSchemas');
const dayjs = require('dayjs');

const Party = require('../models/party');

router.get('/', catchAsync( async (req, res, next) => {
    const parties = await Party.find();
    res.render('parties/index', {parties})
}));

router.post('/', validateParty, catchAsync( async (req, res, next) => {
    const { party } = req.body;
    party.isPrivate = party.isPrivate ? true : false;
    const newParty = new Party(party);
    await newParty.save();
    req.flash('success', 'Success! Your party has been created.');
    res.redirect('/parties');
}));

router.get('/new', (req, res) => {
    const dates = {
        min: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        max: dayjs().add(1, 'year').format('YYYY-MM-DD')
    }
    res.render('parties/new', {dates});
});

router.get('/:id', catchAsync( async (req, res, next) => {
    const { id } = req.params;
    const party = await Party.findById( id );
    res.render('parties/show', { party })
}));

router.delete('/:id', catchAsync ( async (req, res, next) => {
    const { id } = req.params;
    await Party.findByIdAndDelete( id );
    req.flash('success', 'Success! Party has been deleted.');
    res.redirect('/parties');
}));



module.exports = router;