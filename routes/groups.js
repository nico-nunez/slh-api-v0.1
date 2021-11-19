const express = require('express')
const router = express.Router();
const { ExpressError, errorHandler, catchAsync } = require('../utils');
const { validateList } = require('../middleware');

const Group = require('../models/group');

router.get('/', (req, res) => {
    res.send('Groups Page')
});


module.exports = router;