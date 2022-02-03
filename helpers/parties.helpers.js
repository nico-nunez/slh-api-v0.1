const Party = require('../models/Party');

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

module.exports.isPastSelectionsDate = selectionsDate => {
  const now = Date.now();
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const current = now - offset;
  const end = selectionsDate.getTime();
  return end - current <= 0;
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