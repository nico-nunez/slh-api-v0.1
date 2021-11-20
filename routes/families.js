const express = require('express');
const router = express.Router();
const days = require('dayjs');
const Family = require('../models/family');
const { ExpressError, catchAsync } = require('../utils');
const { isLoggedIn, isCreatorFamily } = require('../middleware');


router.get('/', catchAsync(async (req, res) => {
    const families = await Family.find({});
    res.render('families/index', { families });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('families/new');
});

router.post('/', isLoggedIn, catchAsync( async (req, res, next) => {
    const { family } = req.body;
    const newFamily = new Family({...family});
    newFamily.creator = req.user._id;
    newFamily.members.push(req.user._id);
    await newFamily.save();
    req.flash('success', 'Success! New List created.');
    res.redirect(`families/${newFamily._id}`);
}));

router.get('/:id', isLoggedIn, catchAsync (async (req, res, next) => {
    const family = await Family.findById( req.params.id ).populate('members creator');
    if(!family) {
        req.flash('error', "Sorry, coud not find what you were looking for.");
        return res.redirect('/families');
    }
    res.render('families/show', { family });
}))

router.post('/:id', isLoggedIn, catchAsync ( async (req, res, next) => {
    const family = await Family.findById( req.params.id );
    if(!family) {
        req.flash('error', "Sorry, coud not find what you were looking for.");
        return res.redirect('/families');
    }
    if (family.members.includes(req.user._id)) {
        req.flash('error', "Already a member.")
    } else {
        family.members.push(req.user._id);
        await family.save();
    }
    res.redirect(family._id);
}))

module.exports = router;