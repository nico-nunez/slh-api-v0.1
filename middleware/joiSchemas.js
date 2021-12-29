const { ExpressError, errorHandler, catchAsync } = require("../utils");
const Joi = require("joi");

function validateList(req, res, next) {
	const itemSchema = Joi.object({
		description: Joi.string().min(3).max(30).required(),
		link: Joi.string().allow(""),
	});

	const listSchema = Joi.object({
		list: Joi.object({
			title: Joi.string().min(3).max(50).required(),
			items: Joi.array().items(itemSchema),
		}).required(),
	});

	const { error } = listSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	}
	return next();
}

function validateParty(req, res, next) {
	const partySchema = Joi.object({
		party: Joi.object({
			name: Joi.string().min(3).max(30).required(),
			startsOn: Joi.date().required(),
			endsOn: Joi.date().required(),
			isPublic: Joi.string()
		}).required()
	});

	const { error } = partySchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	}
	return next();
}

module.exports = {
	validateList,
	validateParty,
};
