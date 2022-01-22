const express = require("express");
const router = express.Router();
const { validParty } = require("../middleware/joiSchemas");
const { isLoggedIn, isCreatorParty } = require("../middleware/validators");
const parties = require('../controllers/parties');

router.get("/", parties.showPublicParties);
router.get("/new", isLoggedIn, parties.createPartyForm);
router.get("/search", isLoggedIn, parties.searchPublicParties);

router.post("/", isLoggedIn, validParty, parties.createParty);

router.get("/:id", isLoggedIn, parties.showParty);
router.get("/:id/edit", isLoggedIn, isCreatorParty, parties.updatePartyForm);
router.put("/:id",	isLoggedIn, parties.updateParty);
router.put("/:id/join",	isLoggedIn, parties.joinParty);

router.delete("/:id", isLoggedIn, isCreatorParty, parties.deleteParty);
router.get("/:id/start",isLoggedIn,	isCreatorParty, parties.startParty);

module.exports = router;