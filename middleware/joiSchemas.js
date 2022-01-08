const { ExpressError } = require("../helpers/errors");
const Joi = require("joi");



function validateInput(joiSchema, req) {
  const redirectURL = req.originalUrl;
	const {value, error} = joiSchema.validate(req.body);
  if(error) {
    const message = error.details.map(err => err.message).join(',');
    throw new ExpressError(message, 400, redirectURL);
  }
  req.body = value;
}

function validRegistration(req, res, next) {
	const userSchema = Joi.object({
		newUser: Joi.object({
			email: Joi.string()
				.email({
					minDomainSegments: 2,
					tlds: {
						allow: ["com", "net"],
					},
				})
				.trim()
				.required()
				.messages({
					"any.required": "Valid email is required.",
					"string.email": "Please eneter a valid email.",
				}),

			displayName: Joi.string(),

			password: Joi.string()
				.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
				.required()
				.messages({
					"any.required": "Password is required.",
					"string.pattern.base": `Password must be between 8-32 characters and contain at least
           an uppercase, lowercase, number, and special character [!@$%&*?].
        `,
				}),

			confirmPass: Joi.string().required().valid(Joi.ref("password")).messages({
				"any.required": "Please confirm password.",
				"any.only": "Passwords must match.",
			}),
		}),
	});

	validateInput(userSchema, req);

	return next();
}

function validList(req, res, next) {
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

	validateInput(listSchema, req.body);

	return next();
}

function validParty(req, res, next) {
	const partySchema = Joi.object({
		party: Joi.object({
			name: Joi.string().min(3).max(30).required(),
			startsOn: Joi.date().required(),
			endsOn: Joi.date().required(),
			isPublic: Joi.string(),
		}).required(),
	});

	validateInput(partySchema, req.body);

	return next();
}

module.exports = {
	validRegistration,
	validList,
	validParty,
};
