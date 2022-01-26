const express = require("express");
const router = express.Router();
const { validParty } = require("../middleware/joiSchemas");
const { isLoggedIn, isCreatorParty, isPartyMember} = require("../middleware/validators");
const parties = require('../controllers/parties');

router.get("/", parties.showPublicParties);
router.get("/new", isLoggedIn, parties.createPartyForm);
router.get("/search", parties.searchPublicParties);

router.post("/", isLoggedIn, validParty, parties.createParty);

router.get("/:id", isLoggedIn, parties.showParty);
router.get("/:id/edit", isLoggedIn, isCreatorParty, parties.updatePartyForm);
router.put("/:id/lists", isLoggedIn, isPartyMember, parties.addListToParty);
router.put("/:id",	isLoggedIn, isCreatorParty, validParty, parties.updatePartyDetails);
router.get("/:id/members/edit", isLoggedIn, isCreatorParty, parties.removeMembersForm);
router.put("/:id/members",	isLoggedIn, parties.editMembers);

router.delete("/:id", isLoggedIn, isCreatorParty, parties.deleteParty);
router.get("/:id/start",isLoggedIn,	isCreatorParty, parties.startParty);

module.exports = router;