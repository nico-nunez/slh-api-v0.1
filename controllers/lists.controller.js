const List = require('../models/List');
const User = require('../models/User');
const { catchAsync, ExpressError } = require('../helpers/errors');
const helpers = require('../helpers/lists.helpers');

// RENDER ALL PUBLIC LISTS
module.exports.showPublicLists = catchAsync(async (req, res, next) => {
	const { searchBy = '', searchString = '' } = req.query;
	const page = Number(req.query.page) || 0;
	const docLimit = 50;
	const searchQuery = {};

	if (searchBy) {
		searchQuery[searchBy] = { $regex: searchString, $options: 'i' };
	}
	const { lists, totalMatches } = await helpers.findLists(
		searchQuery,
		page,
		docLimit
	);
	const numPages = Math.ceil(totalMatches / docLimit);
	const pages = {
		numPages,
		current: page,
		baseURL: '/lists?page=',
	};
	res.json({ lists, pages, searchBy, searchString });
});

// RENDER NEW LIST FORM
module.exports.createListForm = (req, res) => {
	res.render('lists/new');
};

// CREATE NEW LIST
module.exports.createList = catchAsync(async (req, res, next) => {
	const { body } = req;
	const items = body.items.filter((item) => item.description);
	const newList = new List({
		title: body.title,
		items,
		public: body.public,
	});
	newList.creator = req.user.id;
	const savedList = await newList.save();
	res.json({
		message: 'Success! New List created.',
		data: savedList,
	});
});

// RENDER LIST BY ID
module.exports.showList = catchAsync(async (req, res, next) => {
	const list = await List.findById(req.params.id).populate(
		'creator',
		'displayName'
	);
	if (!list) {
		throw new ExpressError('Sorry, coud not find that list', 404);
	}
	res.json(list);
});

// UPDATE LIST
module.exports.updateList = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const list = req.body;
	const items = list.items.map(({ description, link }) => ({
		description,
		link,
	}));
	const updatedList = await List.findByIdAndUpdate(
		id,
		{
			title: list.title,
			items,
			public: Boolean(list.public),
		},
		{ runValidators: true }
	).lean();
	if (!updatedList) {
		throw new ExpressError('Sorry, coud not find that list', 404);
	}
	res.json({
		message: 'Success! List has been updated',
		data: updatedList,
	});
});

// DELETE LIST BY ID
module.exports.deleteList = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	await List.findByIdAndDelete(id);
	res.json({
		status: 'success',
		message: 'Success! List has been deleted.',
	});
});
