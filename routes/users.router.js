const express = require('express');
const router = express.Router();
const { 
  isLoggedIn,
  isUser,
} = require('../middleware/validators');

const List = require('../models/List');
const User = require('../models/User');
const Party = require('../models/Party')

const { validProfile } = require('../middleware/joiSchemas');
const users = require('../controllers/users.controller');

router.get('/:id', isLoggedIn, users.showDashboard);

router.get('/:id/profile', isLoggedIn, users.showProfile);

router.get('/:id/lists', isLoggedIn, isUser, users.showUserLists);
router.get('/:id/parties', isLoggedIn, isUser, users.showUserParties);

router.get('/:id/update', isLoggedIn, isUser, users.updateUserForm)
router.put('/:id/update', isLoggedIn, isUser, validProfile, users.updateUser);

module.exports = router;