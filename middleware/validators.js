const List = require("../models/List");
const Party = require("../models/Party");
const User = require("../models/User");

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectedFrom = req.originalUrl;
		req.flash("error", "Must be logged in.");
		return res.redirect("/auth/login");
	}
	next();
};

async function isCreatorList(req, res, next) {
	const list = await List.findById(req.params.id);
	if (!list.creator.equals(req.user._id)) {
		req.flash("error", "Permission denied.");
		return res.redirect(`/lists/${id}`);
	}
	next();
}

async function isCreatorParty(req, res, next) {
	const party = await Party.findById(req.params.id);
	if (!party.creator.equals(req.user._id)) {
		req.flash("error", "Permission denied.");
		return res.redirect(`/parties/${id}`);
	}
	next();
}

async function isUser(req, res, next) {
	const user = await User.findById(req.params.id);
	if (!user._id.equals(req.user._id)) {
		req.flash("error", "Permission denied.");
		return res.redirect("/auth/login");
	}
	next();
}
async function isVerified(req, res, next) {
	const user = await User.findById(req.params.id);
	if (!user.verified) {
		req.flash("error", "Please verify your email before proceeding.");
		return res.redirect(`/users/${user.id}`);
	}
	next();
}

module.exports = {
	isLoggedIn,
	isCreatorList,
	isCreatorParty,
	isUser,
  isVerified
};
