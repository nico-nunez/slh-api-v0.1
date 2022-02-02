const List = require('../models/List');

module.exports.findLists = async (query, page, docLimit) => {
  const [results] = await List.aggregate([
    {$lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
    }},
    {$unwind: '$creator'},
    {$match: {...query, public:true}},
    {$facet: {
      'lists': [
        {$skip: page * docLimit},
        {$limit: docLimit},
        {$project: {
          title: 1,
          items: 1,
          updatedAt: 1,
          'creator._id': '$creator._id',
          'creator.displayName': '$creator.displayName'
        }}
      ],
      'numMatches': [
        {$count: 'total'}
      ]
    }},
    {$unwind: '$numMatches'}
  ]);

  const lists = results ? results.lists : [];
  const totalMatches = results ? results.numMatches.total : 0;

  return {lists, totalMatches};
}