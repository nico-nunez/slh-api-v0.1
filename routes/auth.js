const express = require("express");
const router = express.Router();
const passport = require("passport");
const { catchAsync } = require("../helpers/errors");
const { sendConfirmation } = require('../helpers/email');

const { validRegistration } = require("../middleware/joiSchemas");
const User = require("../models/User");
const LinkCode = require('../models/LinkCode');
const { isLoggedIn } = require("../middleware/validators");


router.get("/register", async (req, res) => {
	res.render("auth/register");
});

router.post(
	"/register",
	validRegistration,
	catchAsync( async (req, res, next) => {
		const { email, displayName, password } = req.body.newUser;
		const newUser = new User({ email: email.toLowerCase(), displayName });
		const user = await User.register(newUser, password);
		req.login(user, (err) => {
			if (err) return next(err);
			const redirect = req.session.redirectedFrom || `/users/${user.id}`;
			delete req.session.redirectedFrom;
			req.flash("success", "Welcome! Thank you for joining!");
      sendConfirmation(user); //- uncomment here and middle/passport.js for prod
			return res.redirect(redirect);
		});
	})
);

router.get("/login", (req, res) => {
	res.render("auth/login");
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "login",
	}),
	(req, res) => {
		const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
		delete req.session.redirectedFrom;
		req.flash("success", "Welcome back!");
		res.redirect(redirection);
	}
);

router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out!");
	res.redirect("login");
});

router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureFlash: true,
		failureRedirect: "login",
	}),
	(req, res) => {
		const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
		delete req.session.redirectedFrom;
		req.flash("success", "Welcome!");
		res.redirect(redirection);
	}
);

router.get('/confirmation/email', isLoggedIn, catchAsync( async(req, res, next) => {
  const { ucc } = req.query;
  const foundCode = await LinkCode.findOne({ ucc });
  if (foundCode && foundCode.referenceID === req.user.id) {
    req.flash('success', 'Thank you! Email has been verified.');
    const user = await User.findById(req.user.id);
    user.verified = true;
    await user.save();
    foundCode.valid = false;
    foundCode.expireAt = Date.now();
    foundCode.save();
  } else {
    req.flash('error', 'Unable to verify email.  Please try agian, or request a new link.');
  }
  res.redirect(`/users/${req.user.id}`)
}));

module.exports = router;
