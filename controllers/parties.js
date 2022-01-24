const { catchAsync, formatDate, ExpressError } = require("../helpers/errors");
const dayjs = require("dayjs");
const { getSelections } = require("../helpers/utils");
const Party = require("../models/Party");
const User = require("../models/User");
const List = require("../models/List");
const { generateCode } = require('../helpers/utils');


module.exports.showPublicParties = catchAsync(async (req, res, next) => {
  const parties = await Party.aggregate().sample(4);
  const populated = await Party.populate(parties, {path: 'creator', select: 'displayName'});
  res.render("parties/index", { parties: populated });
});

module.exports.searchPublicParties = catchAsync(async (req, res, next) => {
  const { searchBy, searchString } = req.query;
  let results = [];
  if (searchBy === 'creator') {
    const users = await User.find({$text: {$search: searchString}}).distinct('_id').lean();
    results = await Party.find({creator: {$in: users}, public: true}).populate('creator', 'displayName').lean();
  }
  if (searchBy === 'title') {
    results = await Party.find({
      title: {$regex: searchString, $options: 'i'}, public: true
    }).populate('creator', 'displayName').lean();
  }
  res.render("parties/index", { parties: results, search: true });
})

module.exports.createPartyForm = (req, res) => {
	res.render("parties/new");
};

module.exports.createParty = catchAsync(async (req, res, next) => {
  const { party } = req.body;
  party.public = Boolean(party.public);
  party.creator = req.user.id;
  party.secret = party.secret || generateCode(16, 'alphaNumeric');
  const newParty = new Party({ ...party });
  newParty.members.addToSet(req.user.id);
  const savedParty = await newParty.save();
  req.flash("success", "Success! Your party has been created.");
  res.redirect(`/parties/${savedParty.id}`);
});

module.exports.showParty = catchAsync(async (req, res, next) => {
  const foundParty = await Party.findById(req.params.id)
    .populate('creator', 'displayName')
    .populate('members', 'displayName')
    .populate('lists', 'creator.displayName').lean();
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  const lists = {}
  foundParty.lists.forEach(list => lists[String(list.creator._id)] = list);
  const isMember = foundParty.members.filter(member => String(member._id) === req.user.id)
  foundParty.disableJoin = isMember.length || isPastJoinDate(foundParty.joinBy);
  res.render("parties/show", { party: foundParty, lists });
});

module.exports.updatePartyForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const party = await Party.findById(id).lean();
  if (!party) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  party.joinBy = formatDate(party.joinBy);
  party.exchangeOn = formatDate(party.exchangeOn);
  res.render("parties/edit", { party });
});

module.exports.updatePartyDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { party } = req.body;
  party.secret = party.secret || generateCode(16, 'alphaNumeric');
  party.public = Boolean(party.public);
  const updatedParty = await Party.findByIdAndUpdate(id, party).lean();
  if (!updatedParty) {
    req.flash("error", "Party not found.");
    return res.redirect("/parties");
  }
  res.redirect(`/parties/${updatedParty._id}`);
});

module.exports.deleteParty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Party.findByIdAndDelete(id);
  req.flash("success", "Success! Party has been deleted.");
  res.redirect("/parties");
});


module.exports.addMember = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const foundParty = await Party.findById(id);
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  if (isPastJoinDate(foundParty.joinBy)) {
    throw new ExpressError('Deadline to join has passed.', 403, `/parties/${id}`);
  }
  if (foundParty.secret !== req.body.secret ) {
    throw new ExpressError('Join request denied. Invalid code.', 403, `/parties/${id}`);
  }
  foundParty.members.addToSet(req.user.id);
  await foundParty.save();
  req.flash('success', 'Sucessfully joined party.');
  res.redirect(`/parties/${foundParty._id}`);
});

module.exports.removeMembersForm = catchAsync(async (req, res, next) => {
  const foundParty = await Party.findById(req.params.id).populate('members', 'displayName').lean();
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  res.render('parties/editMembers', {party: foundParty})
})

module.exports.editMembers = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { secret=undefined, members=undefined } = req.body
  const foundParty = await Party.findById(id);
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  if (secret) {
    const err = await addMember(foundParty, secret, req.user.id);
    if (err) throw err;
    req.flash('success', 'Sucessfully joined party.');
  }
  if(members) {
    await Party.updateOne({_id: id},{$pull: {members: {$in: members}}});
  }
  res.redirect(`/parties/${foundParty._id}`);
})



module.exports.startParty = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id).populate("members");
  const members = party.members;
  const selections = getSelections(members, party._id);
  for (const selection of selections) {
    const { selector } = selection;
    selector.selections.push(selection);
    await selection.save();
    await selector.save();
  }
  res.redirect(`/parties/${party._id}`);
});


function isPastJoinDate(joinDate) {
  const now = Date.now();
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const current = now - offset;
  const end = joinDate.getTime();
  return end - current <= 0;
}

async function addMember(party, secret, userID) {
  if (isPastJoinDate(party.joinBy)) {
    return new ExpressError('Deadline to join has passed.', 403, `/parties/${party._id}`);
  }
  if (party.secret !== secret ) {
    return new ExpressError('Join request denied. Invalid code.', 403, `/parties/${party._id}`);
  }
  party.members.addToSet(userID);
  await party.save();
}

async function removeMembers(party, members) {

}
