
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
    req.flash('error', err.stack);
    // req.flash('error', err.message);
    res.status(status).redirect('/lists');
};

const formatDate = (dateObj) => {
  const monthStr = String(dateObj.getUTCMonth() + 1);
  const monthFormatted = '0'.repeat(2 - monthStr.length) + monthStr;

  const dateStr = String(dateObj.getUTCDate());
  const dateFormatted = '0'.repeat(2 - dateStr.length) + dateStr;
  
  return `${dateObj.getFullYear()}-${monthFormatted}-${dateFormatted}`
}

module.exports = {
	ExpressError,
	errorHandler,
	catchAsync,
  formatDate
};
