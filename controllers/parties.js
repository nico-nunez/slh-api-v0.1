const { catchAsync, formatDate } = require("../helpers/errors");
const dayjs = require("dayjs");
const { getSelections } = require("../helpers/utils");
const Party = require("../models/Party");

module.exports.showPublicParties = catchAsync(async (req, res, next) => {
  const parties = await Party.find().populate("creator").lean();
  res.render("parties/index", { parties });
})

module.exports.createPartyForm = (req, res) => {
	res.render("parties/new");
};

module.exports.createParty = catchAsync(async (req, res, next) => {
  const { party } = req.body;
  party.isPublic = Boolean(party.isPublic);
  party.creator = req.user._id;
  const newParty = new Party({ ...party });
  newParty.members.push(req.user._id);
  await newParty.save();
  req.flash("success", "Success! Your party has been created.");
  res.redirect(`/parties/${newParty.id}`);
});

module.exports.showParty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const party = await Party.findById(id).populate("creator members lists");
  if (!party) {
    req.flash("error", "Sorry, coud not find that party");
    return res.redirect("/parties");
  }
  res.render("parties/show", { party });
});

module.exports.updatePartyForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const foundParty = await Party.findById(id).populate("creator members lists");
  if (!foundParty) {
    req.flash("error", "Sorry, coud not find that party");
    return res.redirect("/parties");
  }
  
  const party = foundParty.toObject();
  party.startsOn = formatDate(foundParty.startsOn);
  party.endsOn = formatDate(foundParty.endsOn);

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

