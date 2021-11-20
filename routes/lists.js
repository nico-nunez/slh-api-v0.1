const express = require('express');
const router = express.Router();
const List = require('../models/list');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
const { validateList } = require('../joiSchemas');
const { isLoggedIn, isCreatorList } = require('../middleware');

router.get('/', catchAsync( async (req, res, next) => {
    const lists = await List.find({})
    res.render('lists/index', {lists});
}));

router.post('/', isLoggedIn, validateList, catchAsync( async (req, res, next) => {
    const { list } = req.body;
    const newList = new List({...list});
    newList.creator = req.user._id;
    await newList.save();
    req.flash('success', 'Success! New List created.');
    res.redirect(`lists/${newList._id}`);
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('lists/new');
});

router.get('/:id/edit', isLoggedIn, isCreatorList, catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    res.render('lists/edit', { list });
}));

router.get('/:id', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id).populate('creator');
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    res.render('lists/show', {list});
}));

router.put('/:id', isLoggedIn, isCreatorList, validateList, catchAsync( async(req, res, next) => {
    const { id } = req.params;
    const list = await List.findByIdAndUpdate(id, {...req.body.list}, {new: true, runValidators: true});
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    req.flash('success', 'Success! List has been updated.')
    res.redirect(`/lists/${id}`);
}));

router.delete('/:id', isLoggedIn, isCreatorList, catchAsync( async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    req.flash('success', 'Success! List has been deleted.');
    res.redirect('/lists');
}));

module.exports = router;

