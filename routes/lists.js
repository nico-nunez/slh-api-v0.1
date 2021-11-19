const express = require('express');
const router = express.Router();
const List = require('../models/list');
const { ExpressError, catchAsync } = require('../utils');
const { validateList } = require('../joiSchemas');

router.get('/', catchAsync( async (req, res, next) => {
    const lists = await List.find({})
    res.render('lists/index', {lists});
}));

router.post('/', validateList, catchAsync( async (req, res, next) => {
    const { list, items } = req.body;
    const newList = new List({...list});
    await newList.save();
    res.redirect(`lists/${newList._id}`);
}));

router.get('/new', (req, res) => {
    res.render('lists/new');
});

router.get('/:id/edit', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    res.render('lists/edit', { list });
}));

router.get('/:id', catchAsync( async (req, res, next) => {
    const list = await List.findById(req.params.id);
    res.render('lists/show', {list});
}));

router.put('/:id', validateList, catchAsync( async(req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndUpdate(id, {...req.body.list});
    res.redirect(`/lists/${id}`);
}));

router.delete('/:id', catchAsync( async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    res.redirect('/lists');
}));

module.exports = router;

