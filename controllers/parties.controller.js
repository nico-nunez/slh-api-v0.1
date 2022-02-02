const { catchAsync, formatDate, ExpressError } = require("../helpers/errors");
const dayjs = require("dayjs");
const { getSelections } = require("../helpers/utils");
const Party = require("../models/Party");
const User = require("../models/User");
const List = require("../models/List");
const Selection = require("../models/Selection");
const { generateCode } = require('../helpers/utils');
const { ObjectId } = require('mongoose').Types;


module.exports.showPublicParties = catchAsync(async (req, res, next) => {
  const { page = 0, searchBy='', searchString='' } = req.query;
  const docLimit = 9;
  const searchQuery = {};
  if(searchBy) {
    searchQuery[searchBy] = {$regex: searchString, $options: 'i'};
  }
  const [{parties, numFound}] = await Party.aggregate([
    {$lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
    }},
    {$unwind: '$creator'},
    {$match: {...searchQuery, public:true}},
    {$facet: {
      'parties': [
        {$skip: Number(page) * docLimit},
        {$limit: docLimit},
        {$project: {
          title: 1,
          numMembers: {$size: "$members"},
          updatedAt: 1,
          joinStatus: 1,
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
    baseURL: '/paries?page='
  };
  res.render("parties/index", { parties, pages, searchBy, searchString });
});

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
  const examplePartyID = "61f17ad6cac18a2ca6cb75f9"
  const foundParty = await Party.findById(req.params.id)
    .populate('creator', 'displayName')
    .populate('members', 'displayName')
    .populate('lists', 'title creator').lean();
  if (!foundParty) {
    throw new ExpressError('Sorry, party could not be found.', 400, '/parties');
  }
  let userLists = [];
  const lists = {}
  let selections;
  foundParty.lists.forEach(list => lists[String(list.creator._id)] = list);
  const isMember = await Party.exists({_id: req.params.id, members: {$in: req.user.id}});
  if (isMember) {
    userLists = await List.find({creator: req.user.id}, {title: 1}).lean();
  }
  foundParty.isMember = isMember;
  foundParty.disableJoin = isMember || foundParty.joinStatus === 'closed' || isPastJoinDate(foundParty.joinBy);
  if(String(foundParty._id) === examplePartyID) {
    selections = await Selection.find({party: foundParty._id}).populate('selector', 'displayName').populate('recipient', 'displayName').lean();
    await Selection.deleteMany({party: foundParty._id});
  }
  res.render("parties/show", { party: foundParty, lists, userLists, selections });
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

module.exports.addListToParty = catchAsync(async (req, res, next) => {
  const { listID } = req.body; 
  const partyID = req.params.id;
  const foundParty = await Party.findById(partyID).populate('lists');
  if (!foundParty) {
    throw new ExpressError('Unable to find party.', 400, '/parties');
  }
  if (!ObjectId.isValid(listID)) {
    throw new ExpressError('Please select a valid list.', 400, `/parties/${req.params.id}`)
  }
  const list = await List.findOne({_id: listID, creator: req.user.id});
  const filteredLists = foundParty.lists.filter(list => String(list.creator._id) !== req.user.id);
  filteredLists.push(list);
  foundParty.lists = filteredLists;
  await foundParty.save();
  res.redirect(`/parties/${req.params.id}`);
})

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



module.exports.getMemberSelections = catchAsync(async (req, res, next) => {
  const foundParty = await Party.findById(req.params.id).populate("members");
  if(!foundParty) throw new ExpressError('Unable to find party.', 400, '/parties');
  await Selection.deleteMany({party: foundParty.id});
  const members = foundParty.members;
  const selections = getSelections(members);
  const formatted = []
  for (const selection of selections) {
    await new Selection({
      selector: selection.selector._id,
      recipient: selection.recipient._id,
      party: foundParty._id
    }).save();
  }
  const now = new Date().getTime
  await Party.updateOne({_id: foundParty._id }, { joinBy: Date.now(), joinStatus: 'closed'});
  res.redirect(`/parties/${foundParty._id}`);
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
