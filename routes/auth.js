const express = require("express");
const router = express.Router();
const passport = require("passport");
const { catchAsync, ExpressError } = require("../helpers/errors");
const { sendEmailLink } = require('../helpers/email');

const User = require("../models/User");
const Link = require('../models/Link');
const {
  isLoggedIn,
  isValidLink
} = require("../middleware/validators");

const { 
  validRegistration,
  validEmail,
  validPassword
} = require("../middleware/joiSchemas");


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

		req.login(user, async (err) => {
			if (err) return next(err);

			const redirect = req.session.redirectedFrom || `/users/${user.id}`;
			delete req.session.redirectedFrom;

      const details = await sendEmailLink(user, 'confirmation');
      const newLink = new Link(details);
      await newLink.save();

      req.flash("success", "Welcome! Please check your messages and confirm your email address.");
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

router.get(
  '/confirmation/email',
  isLoggedIn,
  catchAsync( async(req, res, next) => {
  const { ulc } = req.query;
  const link = await Link.findOne({ ulc });

  if(!link || link.referenceID !== req.user.id) {
    const msg = 'Unable to verify email. Please try again or request a new link.'
    throw new ExpressError(msg, 400, `/users/${req.user.id}`);
  }

  const user = await User.findById(req.user.id);
  user.verified = true;
  await user.save();

  link.valid = false;
  link.expireAt = Date.now();
  link.save();

  req.flash('success', 'Thank you! Email has been verified.');
  
  res.redirect(`/users/${req.user.id}`)
}));

router.post('/confirmation/email', isLoggedIn, catchAsync( async(req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user && !user.verified) {
    const details = await sendEmailLink(user, 'confirmation');
    const newLink = new Link(details);
    await newLink.save();
    
    req.flash('success', 'A confirmation email has been sent.  Please check your spam folder if you do not see it in your inbox.')
  } else {
    req.flash('error', 'Unable to send email confirmation.');
  }
  
  res.redirect(`user/${req.user.id}`);
}));

// Update password - logged in user
router.get('/password/update', isLoggedIn, (req, res) => {
  res.render('auth/update');
});

router.put(
  '/password/update',
  isLoggedIn, validPassword,
  catchAsync( async (req, res, next) => {
    const { currentPass, password } = req.body;
    const user = await User.findById(req.user.id);

    if(!user) {
      req.flash('error', 'Unable to update password.');
      return res.redirect('/auth/login');
    }  
    
    await user.changePassword(currentPass, password);
    await user.save();

    req.flash('success', 'Successfully updated password');
    res.redirect('/auth/login');
  }));


// ----- START PASSWORD RESET ------
router.get('/password/reset/request', (req,res) => {
  res.render('auth/reset');
});

// Update password - forgot password
router.get('/password/reset/update', isValidLink, (req, res) => {
  const { ulc } = req.query;
  res.render('auth/update', {ulc});
});

router.post('/password/reset',
  validEmail,
  catchAsync( async(req, res, next) => {
  const user = await User.findOne({email: req.body.email});

  if(!user || !user.verified || user.googleID) {
    const msg = 'Cannot reset password.  Either this email is not registered, or is associated with an alternative login option.';
    throw new ExpressError(msg, 400, '/auth/login');
  }
  
  const details = await sendEmailLink(user, 'reset');
  const newLink = new Link(details);
  await newLink.save();

  req.flash('success', 'A message has been sent to the provided email.  Please check your spam folder if you do not see it in your inbox.');

  res.redirect('/auth/login');
}));

router.put(
  '/password/reset/update',
  isValidLink, validPassword,
  catchAsync( async(req, res, next) => {
  const link = await Link.findOne({ code: req.body.ulc });

  link.valid = false;
  link.expireAt = Date.now();
  await link.save();
  
  const user = await User.findById( link.referenceID );
  if(!user) {
    const msg = 'Unable to update password.'
    throw new ExpressError(msg, 400, '/auth/login')
  }
  
  await user.setPassword(req.body.password);
  await user.save();

  req.flash('success', 'Successfully updated password');
  res.redirect('/auth/login');
}));


module.exports = router;
