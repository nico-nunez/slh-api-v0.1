const express = require('express');
const router = express.Router();
const lists = require('../controllers/lists.controller');
const { validList } = require('../middleware/joiSchemas');
const { isLoggedIn, isCreatorList } = require('../middleware/validators');

router.get('/', isLoggedIn, lists.createListForm);
router.get('/public', isLoggedIn, lists.showPublicLists);
router.post('/publish', isLoggedIn, validList, lists.createList);

router.get('/:id', isLoggedIn, lists.showList);
router.put('/:id', isLoggedIn, isCreatorList, validList, lists.updateList);

router.delete('/:id', isLoggedIn, isCreatorList, lists.deleteList);

module.exports = router;
