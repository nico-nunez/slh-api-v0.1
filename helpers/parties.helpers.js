const Party = require('../models/Party');
const crypto = require('crypto');
const Selection = require('../models/Selection');

module.exports.findParties = async (query, page, docLimit) => {
  const [results] = await Party.aggregate([
    {$lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
    }},
    {$unwind: '$creator'},
    {$match: {...query, public:true}},
    {$facet: {
      'parties': [
        {$skip: page * docLimit},
        {$limit: docLimit},
        {$project: {
          title: 1,
          numMembers: {$size: "$members"},
          updatedAt: 1,
          status: 1,
          'creator._id': '$creator._id',
          'creator.displayName': '$creator.displayName'
        }},
        
      ],
      'numMatches': [
        {$count: 'total'}
      ]
    }},
    {$unwind: '$numMatches'}
  ])
  const parties = results ? results.parties : [];
  const totalMatches = results ? results.numMatches.total : 0;
  return { parties, totalMatches};
}

module.exports.isPartyMember = (party,userId) => {
  let isMember = false;
  for (const member of party.members) {
    if (String(member._id) === userId) {
      isMember = true;
      break;
    }
  }
  return isMember;
}


module.exports.checkEligiblity = async (party, secret) => {
  let errMsg;
  if (party.status !== 'open') {
    errMsg = 'Deadline to join has passed.';
  }
  if (party.secret !== secret ) {
    errMsg = 'Join request denied. Invalid code.';
  }
  return errMsg;
}


const randomRecipient = (selector, members, exceptions=[]) => {
  const randIndex = Math.floor(crypto.randomInt(members.length));
  let recipient = members[randIndex];
  const isSameUser = recipient.id === selector.id;
  if (members.length === 1 && isSameUser) {
    return null;
  }
  if (isSameUser) {
    recipient = randomRecipient(selector, members);
  }
	return recipient;
}

module.exports.getSelections = party => {
	let availableMembers = [...party.members];
	let results = [];
	for (const selector of party.members) {
		const recipient = randomRecipient(selector, availableMembers);
		if (!recipient) {
			results = this.getSelections(party);
		} else {
			const data = {
				selector,
				recipient,
        party: party._id
			};
      const newSelection = new Selection(data);
			results.push(newSelection);
			availableMembers = availableMembers.filter(
				member => member.id !== recipient.id
			);
		}
	}
	return results;
}


module.exports.makeSelectionsUpdateStatus = async () => {
  const tomorrow = new Date();
  tomorrow.setUTCHours(00,00,00,00);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const parties = await Party.find({
    selectionsOn: {$lt: tomorrow},
    status: {$eq: 'open'}
  }, {members: 1}).lean();
  const selections = []
  for (const party of parties) {
    const partySelections = this.getSelections(party);
    selections.push(...partySelections);
  }
  await Selection.insertMany(selections);
  await Party.updateMany(
    {selectionsOn: {$lt: tomorrow}, status: 'open'},
    {status: 'in progress'}
  );
  await Party.updateMany(
    {exchangeOn: {$lt: tomorrow}, status: 'in progress'},
    {status: 'closed'}
  );
};