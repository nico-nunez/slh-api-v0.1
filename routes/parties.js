const express = require('express')
const router = express.Router();
const { ExpressError, errorHandler, catchAsync } = require('../utils');
const { validateParty } = require('../joiSchemas');
const { isLoggedIn, isCreatorParty } = require('../middleware');
const dayjs = require('dayjs');
const secretSantaSelector = require('../utils/secretSantaSelector');
const List = require('../models/list')



const Party = require('../models/party');

router.get('/', catchAsync( async (req, res, next) => {
    const parties = await Party.find().populate('creator').lean();
    res.render('parties/index', {parties})
}));

router.post('/', isLoggedIn, validateParty, catchAsync( async (req, res, next) => {
    const { party } = req.body;
    party.isPrivate = party.isPrivate ? true : false;
    party.creator = req.user._id;
    const newParty = new Party({...party});
    newParty.members.push(req.user._id);
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

router.get('/:id', isLoggedIn, catchAsync( async (req, res, next) => {
    const { id } = req.params;
    const party = await Party.findById( id ).populate('creator members lists');
    if(!party) {
        req.flash('error', "Sorry, coud not find that party");
        return res.redirect('/parties');
    }
    res.render('parties/show', { party })
}));
router.post('/:id', isLoggedIn, catchAsync( async (req, res, next) => {
    const { id } = req.params;
    const party = await Party.findById( id );
    if(!party) {
        req.flash('error', "Sorry, coud not find that party");
        return res.redirect('/parties');
    }
    if(party.members.includes(req.user._id)) {
        req.flash('error', "Already a member.")
    } else {
        party.members.push(req.user._id);
        await party.save();
    }
    res.redirect( party._id)
}));

router.delete('/:id', isLoggedIn, isCreatorParty, catchAsync ( async (req, res, next) => {
    const { id } = req.params;
    await Party.findByIdAndDelete( id );
    req.flash('success', 'Success! Party has been deleted.');
    res.redirect('/parties');
}));


router.get('/:id/start', isLoggedIn, isCreatorParty, catchAsync (async (req, res, next) => {
    const party = await Party.findById( req.params.id ).populate('members');
    const members = party.members;
    const selections = secretSantaSelector(members, party._id);
    for (const selection of selections) {
        const gifter = selection.gifter;
        gifter.selections.push(selection);
        await selection.save();
        await gifter.save();
    }
    res.redirect(`/parties/${party._id}`);
}));





module.exports = router;

