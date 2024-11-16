const express = require('express');
const router = express.Router();
const lists = require('../controllers/lists.controller');
const { validList } = require('../middleware/joiSchemas');
const { isLoggedIn, isCreatorList } = require('../middleware/validators');

router.get('/public', lists.showPublicLists);
router.get('/new', isLoggedIn, lists.createListForm);
router.post('/', isLoggedIn, validList, lists.createList);

router.get('/:id', isLoggedIn, lists.showList);
router.get('/:id/edit', isLoggedIn, isCreatorList, lists.updateListForm);
router.put('/:id', isLoggedIn, isCreatorList, validList, lists.updateList);

router.delete('/:id', isLoggedIn, isCreatorList, lists.deleteList);

module.exports = router;
