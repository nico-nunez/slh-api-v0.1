const List = require('../models/List');
const { catchAsync } = require('../helpers/errors');


module.exports.showPublicLists = catchAsync( async (req, res, next) => {
  const allLists = await List.find().populate('creator', 'displayName').limit(6).sort({updatedAt: -1}).lean();
  const lists = allLists.map(list => {
    list.showThreeItems = list.items.slice(0,3);
    return list;
  });
  res.render('lists/index', {lists});
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
  const list = await List.findByIdAndUpdate(id, {...req.body.list}, {new: true, runValidators: true});
  if(!list) {
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
  res.redirect('/lists');
});