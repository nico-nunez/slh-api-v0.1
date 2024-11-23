const passport = require('passport');
const { sendEmailLink } = require('../helpers/email');
const { catchAsync, ExpressError } = require('../helpers/errors');

const User = require('../models/User');
const Link = require('../models/Link');

// --- REGISTER ----
module.exports.avatars = (_req, res) => {
	const { avatars } = require('../helpers/utils');
	res.json({ avatars });
};

module.exports.registerUser = catchAsync(async (req, res, next) => {
	const { email, displayName, avatar, password } = req.body.newUser;
	const newUser = new User({
		displayName,
		email: { address: email },
		avatar,
	});

	const user = await User.register(newUser, password);

	req.login(user, async (err) => {
		if (err) return next(err);
		delete req.session.redirectedFrom;
		return res.json({
			status: 'success',
			user,
			message:
				'Welcome! Please check your inbox and verify your email address.',
		});
	});
});

// --- LOGIN LOCAL ---
module.exports.loginLocal = (req, res) => {
	delete req.session.redirectedFrom;
	const user = req.user
		? {
				id: req.user._id,
				avatar: req.user.avatar,
				displayName: req.user.displayName,
				email: req.user.email,
				notifications: req.user.notifications,
				verified: req.user.verified,
		  }
		: null;

	const errorMessge = !user ? 'User not found' : undefined;

	res.status(errorMessge ? 404 : 200).json({ user, errorMessge });
};

// --- LOGIN GOOGLE ---
module.exports.loginGoogle = (req, res) => {
	const redirection = req.session.redirectedFrom || `/users/${req.user.id}`;
	delete req.session.redirectedFrom;
	let message = '';
	if (req.user.email && !req.user.verified) {
		message =
			'Welcome! Please check your inbox and verify your email address.';
	} else {
		message = 'Welcome back!';
	}
	res.json({ message });
};

module.exports.logout = (req, res) => {
	req.logout();
	res.json({
		status: 'success',
		message: 'user sucessfully logged out.',
	});
};

// --- EMAIL VERIFICATION ----
module.exports.verifyEmailVerification = catchAsync(async (req, res, next) => {
	const code = req.query.ulc;
	const link = await Link.findOneAndUpdate(
		{ code },
		{ valid: false, expireAt: Date.now() }
	);
	if (!link || link.referenceID !== req.user.id) {
		const msg =
			'Unable to verify email. Please try again or request a new link.';
		throw new ExpressError(msg, 400, `/users/${req.user.id}`);
	}
	await User.updateOne(
		{ _id: req.user.id },
		{ verified: true, 'email.verified': true }
	);
	const message = 'Thank you! Email has been verified.';
	res.json({ statue: 'success', message });
});

module.exports.verifyEmailSend = catchAsync(async (req, res, next) => {
	const { id } = req.body;
	const user = await User.findById(id);
	if (!user || user.verified) {
		throw new ExpressError(
			'Email is either not registered or already verified.',
			400
		);
	}
	sendEmailLink(user, 'emailVerify');
	res.json({
		status: 'success',
		message:
			'A verification email has been sent.  Please check your spam folder if you do not see it in your inbox.',
	});
});

module.exports.updatePassResult = catchAsync(async (req, res, next) => {
	const { currentPass, password } = req.body;
	const user = await User.findById(req.user.id);
	await user.changePassword(currentPass, password);
	await user.save();
	res.json({
		status: 'success',
		message: 'Successfully updated password',
	});
});

module.exports.resetPassRequestResult = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ 'email.address': req.body.email });
	if (!user || !user.verified || user.googleID) {
		const msg =
			'Email is either not regitered, verified, or is associated with an alternative login method.';
		throw new ExpressError(msg, 400, '/auth/login');
	}
	await sendEmailLink(user, 'resetRequest');

	res.json({
		status: 'success',
		message:
			'A message has been sent to the email address.  Please check your spam folder if you do not see it in your inbox.',
	});
});

module.exports.resetPassUpdateResult = catchAsync(async (req, res, next) => {
	const code = req.body.ulc;
	const link = await Link.findOneAndUpdate(
		{ code },
		{ valid: false, expireAt: Date.now() }
	);
	const user = await User.findById(link.referenceID);
	if (!user) {
		const msg = 'Unable to update password.';
		throw new ExpressError(msg, 400, '/auth/login');
	}
	await user.setPassword(req.body.password);
	await user.save();
	await sendEmailLink(user, 'resetUpdated');
	delete req.session.redirectedFrom;
	res.json({ status: 'success', message: 'Successfully updated password' });
});
