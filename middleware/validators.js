const List = require('../models/List');
const Party = require('../models/Party');
const User = require('../models/User');
const Link = require('../models/Link');
const { ExpressError, catchAsync } = require('../helpers/errors');

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectedFrom = req.originalUrl;
		throw new ExpressError('Must be logged in.', 403, '/auth/login');
	}
	next();
};

const isCreatorList = catchAsync(async (req, res, next) => {
	const list = await List.findById(req.params.id);
	if (!list.creator.equals(req.user._id)) {
		throw new ExpressError('Permision denied', 403, `/lists/${id}`);
	}
	next();
});

const isCreatorParty = catchAsync(async (req, res, next) => {
	const party = await Party.findById(req.params.id);
	if (!party.creator.equals(req.user._id)) {
		throw new ExpressError('Permision denied', 403, `/parties/${id}`);
	}
	next();
});

const isUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	const redirectURL = req.user._id ? `/users/${req.user._id}` : '/lists';
	if (!user._id.equals(req.user._id)) {
		throw new ExpressError('Permission denied', 403, redirectURL);
	}
	next();
});

const isVerified = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user.verified) {
		const msg = 'Must verify your email before proceeding.';
		throw new ExpressError(msg, 403, `/users/${user.id}`);
	}
	next();
});

const isValidLinkReset = catchAsync(async (req, res, next) => {
	const code = req.query.ulc || req.body.ulc;
	const link = await Link.findOne({ code, type: 'resetRequest' });
	if (!link || !link.valid) {
		throw new ExpressError(
			'Permission denied. This link is invalid or has expired.',
			403,
			'/auth/login'
		);
	}
	next();
});

const isPartyMember = catchAsync(async (req, res, next) => {
	const isMember = await Party.exists({
		_id: req.params.id,
		members: { $in: req.user.id },
	});
	if (!isMember) {
		throw new ExpressError(
			'Permission denied. Not a member.',
			403,
			`/parties/${req.params.id}`
		);
	}
	next();
});

const isPartyPrivate = catchAsync(async (req, res, next) => {
	const { join_code = '' } = req.query;
	const party = await Party.findById(req.params.id);

	const isMember = party && party.members.includes(req.user._id);
	const isInvited = party && join_code === party.secret;

	if (!party || (!party.public && !isMember && !isInvited)) {
		throw new ExpressError(
			'The party you are looking for is either private or does not exist.',
			400
		);
	}
	next();
});

module.exports = {
	isLoggedIn,
	isCreatorList,
	isCreatorParty,
	isUser,
	isVerified,
	isValidLinkReset,
	isPartyMember,
	isPartyPrivate,
};
