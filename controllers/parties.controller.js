const { CronJob } = require('cron');
const dayjs = require('dayjs');

const Party = require('../models/Party');
const List = require('../models/List');
const Selection = require('../models/Selection');
const Exclusion = require('../models/Exclusion');
const Notification = require('../models/Notification');

const { ObjectId } = require('mongoose').Types;
const { generateCode } = require('../helpers/utils');
const helpers = require('../helpers/parties.helpers');
const { getSelections } = require('../helpers/parties.helpers');
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
	newParty.members.addToSet(req.user._id);
	newParty.subscribers.addToSet(req.user._id);
	const savedParty = await newParty.save();
	req.flash('success', 'Success! Your party has been created.');
	res.redirect(`/parties/${savedParty.id}`);
});

// RENDER PARTY BY ID
module.exports.showParty = catchAsync(async (req, res, next) => {
	const joinCode = req.query.join_code || '';
	// FIND PARTY BY ID
	const foundParty = await Party.findById(req.params.id)
		.populate('creator', 'displayName')
		.populate('members', 'displayName')
		.populate('lists', 'title creator')
		.populate('exclusions.member_id', 'displayName')
		.populate('exclusions.excluded_id', 'displayName')
		.lean();
	if (!foundParty) {
		throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
	}
	let userLists = [];
	const lists = {};
	// FORMAT MEMEMBERS LIST WITH ID AS KEY AND LIST AS VALUE
	foundParty.lists.forEach((list) => (lists[String(list.creator._id)] = list));
	// CHECK IF USER IS MEMBER OF PARTY
	foundParty.isMember = helpers.isPartyMember(foundParty, req.user.id);
	if (foundParty.isMember) {
		userLists = await List.find({ creator: req.user.id }, { title: 1 }).lean();
	}
	// SORTY MEMBERS NAMES ASCENDING
	foundParty.members.sort((a, b) => {
		if (a.displayName < b.displayName) return -1;
		if (a.displayName > b.displayName) return 1;
		return 0;
	});
	// DISABLE JOIN BUTTON IF PARTY IS IN PROGRESS OR USER IS ALREADY A MEMBER
	foundParty.disableJoin = foundParty.isMember || foundParty.status !== 'open';
	// GET CONFIRMED & REQUESTED EXCLUSIONS FOR USER
	const exclusionRequests = await Exclusion.find({
		party_id: foundParty._id,
		$or: [{ member_id: req.user._id }, { excluded_id: req.user._id }],
	})
		.populate('member_id', 'displayName')
		.populate('excluded_id', 'displayName')
		.lean();
	// FILTER EXCLUSIONS THAT ARE APPLICABLE TO THE CURRENT USER
	const excludeUserList = foundParty.members.filter((member) => {
		return (
			member._id.toString() !== req.user._id.toString() &&
			foundParty.exclusions.findIndex((exclude) => {
				return (
					(exclude.member_id._id.toString() === member._id.toString() &&
						exclude.excluded_id._id.toString() === req.user._id.toString()) ||
					(exclude.member_id._id.toString() === req.user._id.toString() &&
						exclude.excluded_id._id.toString() === member._id.toString())
				);
			}) < 0
		);
	});
	// FIND SELECTION FOR USER
	const selection = await Selection.findOne({
		party: foundParty._id,
		selector: req.user._id,
	})
		.populate('recipient', 'displayName')
		.lean();

	res.render('parties/show', {
		party: foundParty,
		lists,
		userLists,
		joinCode,
		exclusionRequests,
		excludeUserList,
		selection,
	});
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
			{
				$addToSet: {
					members: req.user._id,
					subscribers: req.user._id,
				},
			}
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

module.exports.makeSelections = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	// find party
	const foundParty = await Party.findById(id);
	// check party
	if (!foundParty) throw new ExpressError('Unable to find party.', 400);
	// delete prior selections (if any)
	const foo = await Selection.deleteMany({ party: id });
	// make selections
	const partySelections = getSelections(foundParty);
	// // check selections
	if (!partySelections.length)
		throw new ExpressError('Unable to make selections', 400);
	// // save selections
	await Selection.insertMany(partySelections);
	// // update party to 'in progress'
	foundParty.status = 'in progress';
	// // save party
	await foundParty.save();
	// // TODO: generate notifications that selections were made
	req.flash('success', 'Selections made!');
	// // redirect to party
	res.redirect(`/parties/${id}`);
});

module.exports.requestExclusion = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { excluded_id } = req.body;
	const member_id = req.user._id.toString();
	const foundParty = await Party.findById(id);
	if (!foundParty) throw new ExpressError('Unable to find party.', 400).lean();
	const existingExclusion =
		foundParty.exclusions &&
		foundParty.exclusions.findIndex(
			(exclude) =>
				(exclude.member_id.toString() === excluded_id &&
					exclude.excluded_id.toString() === member_id) ||
				(exclude.member_id.toString() === member_id &&
					exclude.excluded_id.toString() === excluded_id)
		) > -1;
	if (!existingExclusion) {
		const exclusion = new Exclusion({
			member_id: req.user._id,
			excluded_id,
			party_id: id,
		});
		await exclusion.save();
	}
	req.flash(
		'success',
		'A request has been sent to the member and will remain pending until accepted or rejected.'
	);
	res.redirect(`/parties/${id}`);
});

module.exports.resolveExclusion = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { exclusion_id, resolve } = req.query;
	const foundExclusion = await Exclusion.findById(exclusion_id);
	if (!foundExclusion) {
		throw new ExpressError('Unable to find to complete request.', 400);
	}
	if (resolve === 'confirm') {
		const { member_id, excluded_id } = foundExclusion;
		await Party.findByIdAndUpdate(id, {
			$push: { exclusions: { member_id, excluded_id } },
		});
	}
	await Exclusion.findByIdAndDelete(exclusion_id);
	res.redirect(`/parties/${id}`);
});

// MAKE SELECTIONS ATOMAICALLY FOR PARTIES STARTING EACH DAY
const dailyTasks = new CronJob('00 00 06 * * *', async function () {
	await helpers.makeSelectionsUpdateStatus();
});
dailyTasks.start();

// DELETE NOTIFICATIONS WITH NO RECIPIENTS EACH DAY
const deleteNotifications = new CronJob('00 00 06 * * *', async function () {
	await Notification.deleteMany({ recipients: { $size: 0 } });
});
deleteNotifications.start();
