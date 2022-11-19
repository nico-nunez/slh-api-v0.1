const Party = require('../models/Party');
const crypto = require('crypto');
const Selection = require('../models/Selection');

module.exports.findParties = async (query, page, docLimit) => {
	const [results] = await Party.aggregate([
		{
			$lookup: {
				from: 'users',
				localField: 'creator',
				foreignField: '_id',
				as: 'creator',
			},
		},
		{ $unwind: '$creator' },
		{ $match: { ...query, public: true } },
		{
			$facet: {
				parties: [
					{ $skip: page * docLimit },
					{ $limit: docLimit },
					{
						$project: {
							title: 1,
							numMembers: { $size: '$members' },
							updatedAt: 1,
							status: 1,
							'creator._id': '$creator._id',
							'creator.displayName': '$creator.displayName',
						},
					},
				],
				numMatches: [{ $count: 'total' }],
			},
		},
		{ $unwind: '$numMatches' },
	]);
	const parties = results ? results.parties : [];
	const totalMatches = results ? results.numMatches.total : 0;
	return { parties, totalMatches };
};

module.exports.isPartyMember = (party, userId) => {
	let isMember = false;
	for (const member of party.members) {
		if (String(member._id) === userId) {
			isMember = true;
			break;
		}
	}
	return isMember;
};

module.exports.checkEligiblity = async (party, secret) => {
	let errMsg;
	if (party.status !== 'open') {
		errMsg = 'Deadline to join has passed.';
	}
	if (party.secret !== secret) {
		errMsg = 'Join request denied. Invalid code.';
	}
	return errMsg;
};

const randomRecipient = (selector, members, exclusions = []) => {
	const randIndex = Math.floor(Math.random() * members.length);
	let recipient = members[randIndex];
	const isSameUser = recipient.toString() === selector.toString();
	const isExcluded =
		exclusions.findIndex(({ member_id, excluded_id }) => {
			return (
				(member_id.toString() === recipient.toString() &&
					excluded_id.toString() === selector.toString()) ||
				(member_id.toString() === selector.toString() &&
					excluded_id.toString() === recipient.toString())
			);
		}) > -1;
	if (isSameUser && members.length === 1) return null;
	if (isSameUser || isExcluded) {
		recipient = randomRecipient(selector, members, exclusions);
	}
	return recipient;
};

module.exports.getSelections = (party) => {
	let availableMembers = [...party.members];
	let results = [];
	for (const selector of party.members) {
		const recipient = randomRecipient(
			selector,
			availableMembers,
			party.exclusions
		);
		if (recipient) {
			const data = {
				selector,
				recipient,
				party: party._id,
			};
			const newSelection = new Selection(data);
			results.push(newSelection);
			availableMembers = availableMembers.filter((member) => {
				return member.toString() !== recipient.toString();
			});
		} else {
			results = this.getSelections(party);
		}
	}
	return results;
};

module.exports.makeSelectionsUpdateStatus = async () => {
	const tomorrow = new Date();
	tomorrow.setUTCHours(00, 00, 00, 00);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const parties = await Party.find(
		{
			selectionsOn: { $lt: tomorrow },
			status: { $eq: 'open' },
		},
		{ members: 1 }
	).lean();
	const selections = [];
	for (const party of parties) {
		const partySelections = this.getSelections(party);
		selections.push(...partySelections);
	}
	await Selection.insertMany(selections);
	await Party.updateMany(
		{ selectionsOn: { $lt: tomorrow }, status: 'open' },
		{ status: 'in progress' }
	);
	await Party.updateMany(
		{ exchangeOn: { $lt: tomorrow }, status: 'in progress' },
		{ status: 'closed' }
	);
};
