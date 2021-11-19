const express = require('express')
const router = express.Router();
const { ExpressError, errorHandler, catchAsync } = require('../utils');
const { validateGroup } = require('../joiSchemas');
const dayjs = require('dayjs');

const Group = require('../models/group');

router.get('/', catchAsync( async (req, res, next) => {
    const groups = await Group.find();
    console.log(groups)
    res.render('groups/index', {groups})
}));

router.post('/', validateGroup, catchAsync( async (req, res, next) => {
    const { group } = req.body;
    group.isPrivate = group.isPrivate ? true : false;
    group.dateCreated = dayjs().format('YYYY-MM-DD');
    const newGroup = new Group(group);
    await newGroup.save();
    res.redirect('/groups');
}));

router.get('/new', (req, res) => {
    const dates = {
        min: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        max: dayjs().add(1, 'year').format('YYYY-MM-DD')
    }
    res.render('groups/new', {dates});
});



module.exports = router;