const List = require('./models/list');
const Party = require('./models/party');
const User = require('./models/user');
const Family = require('./models/family');

const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectedFrom = req.originalUrl
        req.flash('error', 'Must be logged in.');
        return res.redirect('/users/login');
    }
    next();
}

async function isCreatorList (req, res, next) {
    const { id }= req.params;
    const list = await List.findById( id );
    if(!list.creator.equals(req.user._id)) {
      req.flash('error', 'Permission denied.');
      return res.redirect(`/lists/${ id }`);
    }
    next();
  }

async function isCreatorParty (req, res, next) {
    const { id }= req.params;
    const party = await Party.findById( id );
    if(!party.creator.equals(req.user._id)) {
      req.flash('error', 'Permission denied.');
      return res.redirect(`/parties/${ id }`);
    }
    next();
  }

async function isUser (req, res, next) {
    const { id }= req.params;
    const user = await User.findById( id );
    if(!user._id.equals(req.user._id)) {
      req.flash('error', 'Permission denied.');
      return res.redirect('/users/login');
    }
    next();
  }
async function isFamily (req, res, next) {
    // const { id }= req.params;
    // const families = await Family.find().populate({
    //     path: 'members',
    //     match: req.user._id
    // });
    // // if(!user._id.equals(req.user._id)) {
    // //   req.flash('error', 'Permission denied.');
    // //   return res.redirect('/users/login');
    // // }
    next();
  }

module.exports = {
    isLoggedIn,
    isCreatorList,
    isCreatorParty,
    isUser,
    isFamily
}