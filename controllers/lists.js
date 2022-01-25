const List = require('../models/List');
const User = require('../models/User');
const { catchAsync } = require('../helpers/errors');


module.exports.showPublicLists = catchAsync( async (req, res, next) => {
  const lists = await List.find({public: true}).populate('creator', 'displayName').limit(6).sort({createdAt: -1}).lean();
  res.render('lists/index', {lists});
});

module.exports.searchPublicLists = catchAsync(async (req, res, next) => {
  const { searchBy, searchString } = req.query;
  let results = [];
  if (searchBy === 'creator') {
    const users = await User.find({$text: {$search: searchString}})
      .distinct('_id').lean();
    results = await List.find({creator: {$in: users}, public: true})
      .populate('creator', 'displayName').lean();
  }
  if (searchBy === 'title') {
    results = await List.find({
      title: {$regex: searchString, $options: 'i'}, public: true
    }).populate('creator', 'displayName').lean();
  }
  if (searchBy === 'items') {
    results = await List.find({
     'items.description': {$regex: searchString, $options: 'i'}, public: true
    }).populate('creator', 'displayName').lean();
  }

  res.render("lists/index", { lists: results, searchBy });
})

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