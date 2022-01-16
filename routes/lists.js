const express = require('express');
const router = express.Router();
const List = require('../models/List');
const { catchAsync } = require('../helpers/errors');
const { validList } = require('../middleware/joiSchemas');
const { isLoggedIn, isCreatorList } = require('../middleware/validators');
const lists = require('../controllers/lists');

router.get('/', lists.showPublicLists);

router.get('/new', isLoggedIn, lists.createListForm);
router.post('/', isLoggedIn, validList, lists.createList);

router.get('/:id', isLoggedIn, lists.showList);
router.get('/:id/edit', isLoggedIn, isCreatorList, lists.updateListForm);
router.put('/:id', isLoggedIn, isCreatorList, validList, lists.updateList);

router.delete('/:id', isLoggedIn, isCreatorList, lists.deleteList);

module.exports = router;

