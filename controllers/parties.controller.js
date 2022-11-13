const { CronJob } = require('cron');
const dayjs = require('dayjs');

const Party = require('../models/Party');
const User = require('../models/User');
const List = require('../models/List');
const Selection = require('../models/Selection');
const Notification = require('../models/Notification');

const { ObjectId } = require('mongoose').Types;
const { generateCode } = require('../helpers/utils');
const helpers = require('../helpers/parties.helpers');
const { getSelections } = require('../helpers/utils');
const { createNotification } = require('../helpers/notifications.helpers');
const { catchAsync, formatDate, ExpressError } = require('../helpers/errors');

// RENDER ALL PUBLIC PARTIES
module.exports.showPublicParties = catchAsync(async (req, res, next) => {
	const { searchBy = '', searchString = '' } = req.query;
	const page = Number(req.query.page) || 0;
	const docLimit = 9;
	const searchQuery = {};
	if (searchBy) {
		searchQuery[searchBy] = { $regex: searchString, $options: 'i' };
	}
	const { parties, totalMatches } = await helpers.findParties(
		searchQuery,
		page,
		docLimit
	);
	const numPages = Math.ceil(totalMatches / docLimit);
	const pages = {
		numPages,
		current: page,
		baseURL: '/parties?page=',
	};
	res.render('parties/index', { parties, pages, searchBy, searchString });
});

// RENDER EXAMPLE PARTY PAGE
module.exports.showExample = catchAsync(async (req, res, next) => {
	const exampleID = process.env.EXAMPLE_PARTY_ID;
	const party = await Party.findById(exampleID)
		.populate('members', 'displayName')
		.populate('lists', 'title creator')
		.lean();
	const lists = {};
	party.lists.forEach((list) => (lists[String(list.creator._id)] = list));
	const selections = await Selection.find({ party: exampleID })
		.populate('selector', 'displayName')
		.populate('recipient', 'displayName')
		.lean();
	await Selection.deleteMany({ party: exampleID });
	res.render('parties/example', { party, lists, selections });
});

// RENDER NEW PARTY FORM
module.exports.createPartyForm = (req, res) => {
	res.render('parties/new');
};

// CREATE NEW PARTY
module.exports.createParty = catchAsync(async (req, res, next) => {
	const { party } = req.body;
	party.public = Boolean(party.public);
	party.creator = req.user.id;
	party.secret = party.secret || generateCode(16, 'alphaNumeric');
	const newParty = new Party({ ...party });
	newParty.members.addToSet(req.user.id);
	const savedParty = await newParty.save();
	req.flash('success', 'Success! Your party has been created.');
	res.redirect(`/parties/${savedParty.id}`);
});

// RENDER PARTY BY ID
module.exports.showParty = catchAsync(async (req, res, next) => {
	const joinCode = req.query.join_code || '';
	const foundParty = await Party.findById(req.params.id)
		.populate('creator', 'displayName')
		.populate('members', 'displayName')
		.populate('lists', 'title creator')
		.lean();
	if (!foundParty) {
		throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
	}
	let userLists = [];
	const lists = {};
	foundParty.lists.forEach((list) => (lists[String(list.creator._id)] = list));
	foundParty.isMember = helpers.isPartyMember(foundParty, req.user.id);
	if (foundParty.isMember) {
		userLists = await List.find({ creator: req.user.id }, { title: 1 }).lean();
	}
	foundParty.disableJoin = foundParty.isMember || foundParty.status !== 'open';
	res.render('parties/show', { party: foundParty, lists, userLists, joinCode });
});

// RENDER UPDATE PARTY FORM
module.exports.updatePartyForm = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const party = await Party.findById(id).lean();
	if (!party) {
		throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
	}
	party.selectionsOn = formatDate(party.selectionsOn);
	party.exchangeOn = formatDate(party.exchangeOn);
	res.render('parties/edit', { party });
});

// ADD LIST TO PARTY
module.exports.addListToParty = catchAsync(async (req, res, next) => {
	const { listID } = req.body;
	const partyID = req.params.id;
	const foundParty = await Party.findById(partyID).populate('lists');
	if (!foundParty) {
		throw new ExpressError('Unable to find party.', 400, '/parties');
	}
	if (!ObjectId.isValid(listID)) {
		throw new ExpressError(
			'Please select a valid list.',
			400,
			`/parties/${req.params.id}`
		);
	}
	const list = await List.findOne({ _id: listID, creator: req.user.id });
	const filteredLists = foundParty.lists.filter(
		(list) => String(list.creator._id) !== req.user.id
	);
	filteredLists.push(list);
	foundParty.lists = filteredLists;
	await foundParty.save();
	await createNotification(foundParty, req.user._id, {
		title: '',
		content: `${req.user.displayName} has added a list to ${foundParty.title}`,
	});
	req.flash('success', 'Listed successfully added to party.');
	res.redirect(`/parties/${req.params.id}`);
});

module.exports.updatePartyDetails = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { party } = req.body;
	party.secret = party.secret || generateCode(16, 'alphaNumeric');
	party.public = Boolean(party.public);
	const updatedParty = await Party.findByIdAndUpdate(id, party).lean();
	if (!updatedParty) {
		req.flash('error', 'Party not found.');
		return res.redirect('/parties');
	}
	req.flash('success', 'Party updated successfully.');
	res.redirect(`/parties/${updatedParty._id}`);
});

module.exports.deleteParty = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	await Party.findByIdAndDelete(id);
	const message = {
		title: '',
		content: `${req.user.displayName} has canceled ${foundParty.title}`,
	};
	req.flash('success', 'Success! Party has been deleted.');
	res.redirect('/parties');
});

module.exports.removeMembersForm = catchAsync(async (req, res, next) => {
	const foundParty = await Party.findById(req.params.id)
		.populate('members', 'displayName')
		.lean();
	if (!foundParty) {
		throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
	}
	res.render('parties/editMembers', { party: foundParty });
});

module.exports.editMembers = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { secret, members } = req.body;
	const foundParty = await Party.findById(id);
	if (!foundParty) {
		throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
	}
	if (secret) {
		const { errMsg } = helpers.checkEligiblity(foundParty, secret);
		if (errMsg) {
			throw new ExpressError(errMsg, 403, `/parties/${id}`);
		}
		await Party.updateOne(
			{ _id: id },
			{ $addToSet: { members: req.user._id } },
			{ $addToSet: { subscribers: req.user._id } }
		);
		await createNotification(foundParty, req.user._id, {
			title: '',
			content: `${req.user.displayName} has joined party - ${foundParty.title}`,
		});
		req.flash('success', 'Sucessfully joined party.');
	}
	if (members) {
		await Party.updateOne(
			{ _id: id },
			{ $pull: { members: { $in: members } } }
		);
		req.flash('success', `Success! Removed from members.`);
	}
	res.redirect(`/parties/${foundParty._id}`);
});

module.exports.getExampleSelections = catchAsync(async (req, res, next) => {
	const example = await Party.findById(process.env.EXAMPLE_PARTY_ID, {
		members: 1,
	}).lean();
	const selections = helpers.getSelections(example);
	await Selection.insertMany(selections);
	res.redirect(`/parties/example`);
});

const dailyTasks = new CronJob('00 00 06 * * *', async function () {
	await helpers.makeSelectionsUpdateStatus();
});
dailyTasks.start();
