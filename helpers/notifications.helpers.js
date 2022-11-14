const Notification = require('../models/Notification');

module.exports.createNotification = async (
	model,
	user_id,
	message = { title: '', content: '' }
) => {
	const actualSubs = model.subscribers.filter((sub) => sub !== user_id);
	if (!actualSubs.length) return;
	const newNotification = new Notification({
		title: message.title,
		content: message.content,
		generator: model._id,
		recipients: actualSubs,
		readBy: [],
	});
	await newNotification.save();
};
