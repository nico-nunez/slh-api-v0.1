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
      name: {$regex: searchString, $options: 'i'}, public: true
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
  const memberLists = {}
  foundParty.lists.forEach(list => memberLists[list.id] = list);
  const isMember = foundParty.members.filter(member => String(member._id) === req.user.id)
  foundParty.disableJoin = isMember.length || isPastJoinDate(foundParty.joinBy);
  res.render("parties/show", { party: foundParty, memberLists });
});

module.exports.updatePartyForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const party = await Party.findById(id).populate("creator members lists");
  if (!party) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  // const party = foundParty.toObject();
  // party.startsOn = formatDate(foundParty.startsOn);
  // party.endsOn = formatDate(foundParty.endsOn);
  res.render("parties/edit", { party });
});

module.exports.updateParty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const party = await Party.findById(id);
  if (!party) {
    req.flash("error", "Sorry, coud not find that party");
    return res.redirect("/parties");
  }
  if (party.members.includes(req.user._id)) {
    req.flash("error", "Already a member.");
  } else {
    party.members.push(req.user._id);
    await party.save();
  }
  res.redirect(party._id);
});

module.exports.deleteParty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Party.findByIdAndDelete(id);
  req.flash("success", "Success! Party has been deleted.");
  res.redirect("/parties");
});

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

module.exports.joinParty = catchAsync(async (req, res, next) => {
  const { joinCode } = req.body;
  const { id } = req.params
  const foundParty = await Party.findById(id).lean();
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  if (isPastJoinDate(foundParty.joinBy)) {
    throw new ExpressError('Deadline to join has passed.', 403, `/parties/${id}`);
  }
  if (foundParty.secretCode !== joinCode) {
    throw new ExpressError('Join request denied. Invalid code.', 403, `/parties/${id}`);
  }
  foundParty.members.addedTo(req.user.id);
  req.flash('success', 'Sucessfully joined party.');
  res.redirect(`/parties/${foundParty._id}`);
});


function isPastJoinDate(joinDate) {
  const now = Date.now();
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const current = now - offset;
  const end = joinDate.getTime();
  return end - current <= 0;
}
