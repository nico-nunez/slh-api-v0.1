const express = require("express");
const router = express.Router();
const { validParty } = require("../middleware/joiSchemas");
const { isLoggedIn, isCreatorParty } = require("../middleware/validators");
const Party = require("../models/Party");
const parties = require('../controllers/parties');

router.get("/", parties.showPublicParties);
router.get("/new", isLoggedIn, parties.createPartyForm);

router.post("/", isLoggedIn, validParty, parties.createParty);

router.get("/:id", isLoggedIn, parties.showParty);
router.get("/:id/edit", isLoggedIn, isCreatorParty, parties.updatePartyForm);
router.post("/:id",	isLoggedIn, parties.updateParty);

router.delete("/:id", isLoggedIn, isCreatorParty, parties.deleteParty);
router.get("/:id/start",isLoggedIn,	isCreatorParty, parties.startParty);

module.exports = router;