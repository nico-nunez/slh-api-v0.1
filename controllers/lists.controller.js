const List = require('../models/List');
const User = require('../models/User');
const { catchAsync } = require('../helpers/errors');
const helpers = require('../helpers/lists.helpers');


module.exports.showPublicLists = catchAsync( async (req, res, next) => {
  const { searchBy='', searchString='' } = req.query;
  const page = Number(req.query.page) || 0;
  const docLimit = 9;
  const searchQuery = {}
  if(searchBy) {
    searchQuery[searchBy] = {$regex: searchString, $options: 'i'};
  }
  const { lists, totalMatches } = await helpers.findLists(searchQuery, page, docLimit);
  const numPages = Math.ceil(totalMatches / docLimit);
  const pages = {
    numPages,
    current: page,
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