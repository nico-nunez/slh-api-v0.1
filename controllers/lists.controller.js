const List = require('../models/List');
const User = require('../models/User');
const { catchAsync } = require('../helpers/errors');


module.exports.showPublicLists = catchAsync( async (req, res, next) => {
  const { page=0, searchBy='', searchString='' } = req.query;
  const docLimit = 9;
  const searchQuery = {}
  if(searchBy) {
    searchQuery[searchBy] = {$regex: searchString, $options: 'i'};
  }
  const [{lists, numFound}] = await List.aggregate([
    {$lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
    }},
    {$unwind: '$creator'},
    {$match: {...searchQuery, public:true}},
    {$facet: {
      'lists': [
        {$skip: Number(page) * docLimit},
        {$limit: docLimit},
        {$project: {
          title: 1,
          items: 1,
          updatedAt: 1,
          'creator.id': '$creator._id',
          'creator.displayName': '$creator.displayName'
        }}
      ],
      'numFound': [
        {$count: 'total'}
      ]
    }},
  ])
  const totalFound = numFound.length ? numFound[0].total : 0;
  const numPages = Math.ceil(totalFound / docLimit);
  const pages = {
    numPages,
    current: Number(page),
    baseURL: '/lists?page='
  };
  res.render('lists/index', {lists, pages, searchBy, searchString});
});


module.exports.createListForm = (req, res) => {
  res.render('lists/new');
};

module.exports.createList = catchAsync( async (req, res, next) => {
  const { list } = req.body;
  const items = list.items.filter(item => item.description);
  const newList = new List({
    title: list.title,
    items,
    public: Boolean(list.public)
  });
  newList.creator = req.user.id;
  await newList.save();
  req.flash('success', 'Success! New List created.');
  res.redirect(`lists/${newList._id}`);
});


module.exports.showList = catchAsync( async (req, res, next) => {
  const list = await List.findById(req.params.id).populate('creator', 'displayName');
  if(!list) {
    req.flash('error', "Sorry, coud not find that list");
    return res.redirect('/parties');
  }
  res.render('lists/show', {list});
});

module.exports.updateListForm = catchAsync( async (req, res, next) => {
  const list = await List.findById(req.params.id);
  if(!list) {
    req.flash('error', "Sorry, coud not find that list");
    return res.redirect('/parties');
  }
  res.render('lists/edit', { list });
});

module.exports.updateList = catchAsync( async(req, res, next) => {
  const { id } = req.params;
  const { list } = req.body;
  const items = list.items.filter(item => item.description);
  const foundList = await List.findByIdAndUpdate(
    id,
    {
      title: list.title,
      items,
      public: Boolean(list.public)
    },
    {runValidators: true})
    .lean();
  if(!foundList) {
    req.flash('error', "Sorry, coud not find that list");
    return res.redirect('/parties');
  }
  req.flash('success', 'Success! List has been updated.')
  res.redirect(`/lists/${id}`);
});

module.exports.deleteList = catchAsync( async (req, res, next) => {
  const { id } = req.params;
  await List.findByIdAndDelete(id);
  req.flash('success', 'Success! List has been deleted.');
  res.redirect(`/users/${req.user.id}`);
});