const { ExpressError } = require("../helpers/errors");
const Joi = require("joi");

function validateInput(joiSchema, body) {
  const { error } = joiSchema.validate(body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	}
}

function validUser(req, res, next) {
  const userSchema = Joi.object({
      email: Joi.string()
      .email({ 
        minDomainSegments: 2,
        tlds: { 
          allow: ['com', 'net']
        }
      })
      .required()
      .messages({
        'any.required': "Valid email is required.",
        'string.email': "Please eneter a valid email."
      }),

      displayName: Joi.string(),
    
    password: Joi.string()
      .required()
      .alphanum()
      .min(6)
      .max(32)
      .messages({
        'any.required': 'Password is required.',
        'string.min': 'Password must be at least 6 characters.',
        'string.max': 'Password must be 32 characters or less.',
        'string.alphanum': 'Password can only alpha-numeric characters.'
      }),
    
    confirmPass: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .messages({
        'any.required': "Please confirm password.",
        'any.only': 'Passwords must match.'
      })
  });

  validateInput(userSchema, req.body.newUser);

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
			isPublic: Joi.string()
		}).required()
	});

  validateInput(partySchema, req.body);

	return next();
}

module.exports = {
  validUser,
	validList,
	validParty,
};
