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
          joinStatus: 1,
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