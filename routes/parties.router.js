const express = require('express');
const router = express.Router();
const { validParty } = require('../middleware/joiSchemas');
const {
	isLoggedIn,
	isCreatorParty,
	isPartyMember,
	isPartyPrivate,
} = require('../middleware/validators');
const parties = require('../controllers/parties.controller');

router.get('/', parties.showPublicParties);
router.get('/example', parties.showExample);
router.post('/example', parties.getExampleSelections);

router.post(
	'/:id/selections',
	isLoggedIn,
	isCreatorParty,
	parties.makeSelections
);

router.post('/', isLoggedIn, validParty, parties.createParty);

router.get('/:id', isLoggedIn, isPartyPrivate, parties.showParty);
router.put('/:id/lists', isLoggedIn, isPartyMember, parties.addListToParty);
router.put(
	'/:id',
	isLoggedIn,
	isCreatorParty,
	validParty,
	parties.updatePartyDetails
);

router.put('/:id/members', isLoggedIn, parties.editMembers);

router.put(
	'/:id/exclusions/request',
	isLoggedIn,
	isPartyMember,
	parties.requestExclusion
);
router.put(
	'/:id/exclusions/resolve',
	isLoggedIn,
	isPartyMember,
	parties.resolveExclusion
);

router.delete('/:id', isLoggedIn, isCreatorParty, parties.deleteParty);

module.exports = router;
