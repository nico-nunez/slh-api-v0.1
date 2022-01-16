const List = require('../models/List');
const Party = require('../models/Party');
const User = require('../models/User');
const Link =  require('../models/Link');
const { ExpressError, catchAsync } = require('../helpers/errors');

const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.redirectedFrom = req.originalUrl;
    throw new ExpressError('Must be logged in.', 403, '/auth/login');
	}
	next();
};

const isCreatorList = catchAsync( async (req, res, next) => {
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

const isUser = catchAsync( async(req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user._id.equals(req.user._id)) {
    throw new ExpressError('Permission denied', 403, '/auth/login');
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

const isValidLinkReset = catchAsync( async(req, res, next) => {
  const code = req.query.ulc || req.body.ulc;
  const link = await Link.findOne({ code, type: 'resetRequest'});
  if (!link || !link.valid ) {
    throw new ExpressError('Permission denied. This link is invalid or has expired.', 403, '/auth/login');
	}
	next();
});

module.exports = {
	isLoggedIn,
	isCreatorList,
	isCreatorParty,
	isUser,
  isVerified,
  isValidLinkReset
};
