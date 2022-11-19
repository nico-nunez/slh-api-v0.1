const { sendEmailLink } = require('../helpers/email');
const { catchAsync, ExpressError } = require('../helpers/errors');

// MODELS
const List = require('../models/List');
const User = require('../models/User');
const Party = require('../models/Party');
const Selection = require('../models/Selection');
const Notification = require('../models/Notification');

// USER DASHBOARD
module.exports.showDashboard = catchAsync(async (req, res, next) => {
	const currentUser = await User.findById(req.user.id);
	const parties = await Party.find({ members: req.user.id });
	const lists = await List.find({ creator: req.user._id });
	const notifications = await Notification.find({
		recipients: { $in: [currentUser._id] },
	});
	currentUser.notifications = notifications;
	const selections = await Selection.find({
		selector: req.user._id,
	})
		.populate('recipient', 'displayName')
		.populate('party', 'title')
		.lean();
	const user = await currentUser.save();
	res.render('users/index', { user, lists, parties, selections });
});

// USER PUBLIC PROFILE
module.exports.showProfile = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const user = await User.findById(id).lean();
	const lists = await List.find({ creator: id, public: true }).lean();
	res.render('users/profile', { user, lists });
});

// USER'S LISTS
module.exports.showUserLists = catchAsync(async (req, res) => {
	const currentUser = await User.findById(req.params.id);
	const currentUserLists = await List.find({ creator: req.params.id });
	res.render('users/lists', { currentUser, currentUserLists });
});

// USERS'S PARTIES
module.exports.showUserParties = catchAsync(async (req, res) => {
	const userParties = await Party.find({ members: req.user._id });
	res.render('users/parties', { userParties });
});

// GET UPDATE USER FORM
module.exports.updateUserForm = catchAsync(async (req, res, next) => {
	const { avatars } = require('../helpers/utils');
	const user = await User.findById(req.user.id);
	res.render('users/update', { user, avatars });
});

// PUT UPDATE USER
module.exports.updateUser = catchAsync(async (req, res, next) => {
	const { displayName, email, avatar } = req.body.profile;
	const user = await User.findById(req.user.id);

	if (!user) throw new ExpressError('User not found', 400);

	if (user.email.address !== email) {
		user.email.verified = false;
		user.verified = false;
		await sendEmailLink(user, 'emailUpdated');
		await sendEmailLink(user, 'emailVerify', email);
		req.flash(
			'success',
			'Profile update! A verification email has been sent to the updated email address. Please check your inbox, and verify your email address.'
		);
	} else {
		req.flash('success', 'Profile updated!');
	}
	user.displayName = displayName;
	user.email.address = email;
	user.avatar = avatar;
	await user.save();

	res.redirect(`/users/${user.id}`);
});

// DELETE USER
module.exports.deleteUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	await User.findOneAndDelete({ _id: id });
	req.flash('success', 'Profile removed.');
	res.redirect('/lists');
});

// REMOVE NOTIFICATION
module.exports.dismissNotification = catchAsync(async (req, res, next) => {
	const { id, notification_id } = req.params;
	const result = await Notification.updateOne(
		{ _id: notification_id },
		{ $pull: { recipients: req.user._id } }
	);
	res.redirect('/users/dashboard');
});
