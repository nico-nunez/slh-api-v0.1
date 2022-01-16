const { catchAsync, ExpressError } = require('../helpers/errors');
const List = require('../models/List');
const User = require('../models/User');
const Party = require('../models/Party')

module.exports.showDashboard = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById( req.params.id).populate({
    path: 'selections',
    populate: {
      path: 'recipient party'
    }
  });
  const currentUserLists = await List.find({'creator': req.user._id});
  const parties = await Party.find({'members': req.user._id })
  res.render('users/index', {currentUser, currentUserLists, parties});
});

module.exports.showPublicProfile = catchAsync( async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const userLists = await List.find({ 'creator': id });
  const parties = await Party.find({ 'members' : id });
  res.render('users/show', { user, userLists, parties });
});

module.exports.showUserLists = catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.params.id)
  const currentUserLists = await List.find({'creator': req.params.id});
  res.render('users/lists', {currentUser, currentUserLists});
});

module.exports.showUserParties = catchAsync(async (req, res) => {
  const userParties = await Party.find({'members': req.user._id})
  res.render('users/parties', {userParties});
});

module.exports.updateUserForm = catchAsync( async (req, res, next) => {
    const user = await User.findById( req.user.id );
    res.render('users/update', { user })
});

module.exports.updateUser = catchAsync( async (req, res, next) => {
  const { profile } = req.body;
  const { id } = req.params;
  const user = await User.findByIdAndUpdate( id, profile, {runValidators: true});

  if(user && user.email !== profile.email) {
    //send email to original notifying
    // send confirmation to new
  }
  res.redirect(`/users/${id}`);
});