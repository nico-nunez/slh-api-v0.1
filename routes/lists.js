const express = require('express');
const router = express.Router();
const List = require('../models/list');
const days = require('dayjs');
const { ExpressError, catchAsync } = require('../utils');
const { validateList } = require('../joiSchemas');

router.get('/', catchAsync( async (req, res, next) => {
    const lists = await List.find({})
    res.render('lists/index', {lists});
}));

router.post('/', validateList, catchAsync( async (req, res, next) => {
    const { list } = req.body;
    const newList = new List({...list});
    await newList.save();
    req.flash('success', 'Success! New List created.');
    res.redirect(`lists/${newList._id}`);
}));

router.get('/new', (req, res) => {
    res.render('lists/new');
});

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    res.render('lists/edit', { list });
}));

router.get('/:id', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    res.render('lists/show', {list});
}));

router.put('/:id', validateList, catchAsync( async(req, res, next) => {
    const { id } = req.params;
    const list = await List.findByIdAndUpdate(id, {...req.body.list}, {new: true, runValidators: true});
    if(!list) {
        req.flash('error', "Sorry, coud not find that list");
        return res.redirect('/parties');
    }
    req.flash('success', 'Success! List has been updated.')
    res.redirect(`/lists/${id}`);
}));

router.delete('/:id', catchAsync( async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    req.flash('success', 'Success! List has been deleted.');
    res.redirect('/lists');
}));

module.exports = router;

