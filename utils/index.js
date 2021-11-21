
class ExpressError extends Error {
	constructor(message, status) {
		super();
		this.message = message;
		this.status = status;
	}
}

const catchAsync = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};

const errorHandler = (err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = "Oh, no! Something went REALLY wrong!";
    req.flash('error', err.message);
    res.status(status).redirect('/lists');
};

module.exports = {
	ExpressError,
	errorHandler,
	catchAsync,
};
