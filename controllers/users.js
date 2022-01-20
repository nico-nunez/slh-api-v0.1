const { catchAsync, ExpressError } = require('../helpers/errors');
const { sendEmailLink } = require('../helpers/email');
const List = require('../models/List');
const User = require('../models/User');
const Party = require('../models/Party')

module.exports.showDashboard = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById( req.user.id).populate('memberOf', 'name').lean();
  const lists = await List.find({'creator': req.user._id});
  res.render('users/index', {currentUser, lists});
});


module.exports.showPublicProfile = catchAsync( async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate(memberOf, 'name').lean();
  const lists = await List.find({ 'creator': id });
  console.log(user);
  res.render('users/show', { user, lists});
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
  const { displayName, email } = req.body.profile;
  const user = await User.findById(req.user.id)

  if (!user) throw new ExpressError('User not found', 400);

  if (user.email.address !== email){
    user.email.verified = false;
    user.verified = false;
    await sendEmailLink(user, 'emailUpdated');
    await sendEmailLink(user, 'emailVerify', email);
    req.flash("success", "Profile update! A verification email has been sent to the updated email address. Please check your inbox, and verify your email address.");
  } else {
    req.flash("success", "Profile updated!");
  }
  user.displayName = displayName;
  user.email.address = email;
  await user.save();
  
  res.redirect(`/users/${user.id}`);
});