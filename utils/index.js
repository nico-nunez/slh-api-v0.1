// const { cloudinary } = require('../cloudinary');

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
	//   req.flash('error', err.message);
	//   res.status(status).redirect('/lists');
    res.status(status).send(err.message)
};

// async function updateImages(req, camp) {
//   const addImgs = req.files.map(file => ({url: file.path, filename: file.filename}));
//   const deleteImgs = req.body.deleteImages;
//   if (addImgs) {
//     camp.images.push(...addImgs);
//     await camp.save();
//   }
//   if (deleteImgs) {
//     for (let filename of deleteImgs) {
//       await cloudinary.uploader.destroy(filename);
//     }
//     await camp.updateOne({$pull: {images: {filename: {$in: deleteImgs}}}});
//   }
// }

module.exports = {
	ExpressError,
	errorHandler,
	//   updateImages,
	catchAsync,
};
