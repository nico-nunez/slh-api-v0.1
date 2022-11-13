const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { createNotification } = require('../helpers/notifications.helpers');

const partySchema = new Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
		},
		secret: {
			type: String,
			trim: true,
			required: true,
		},
		selectionsOn: {
			type: Date,
			required: true,
		},
		exchangeOn: {
			type: Date,
			required: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		lists: [{ type: Schema.Types.ObjectId, ref: 'List' }],
		members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		public: {
			type: Boolean,
			required: true,
			default: false,
		},
		status: {
			type: String,
			enum: ['open', 'in progress', 'closed'],
			default: 'open',
		},
		subscribers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{ timestamps: true }
);

partySchema.index({ title: 'text', creator: 'text', members: 'text' });

partySchema.post('findOneAndDelete', async function (doc) {
	await createNotification(doc, doc.creator, {
		title: '',
		content: `${doc.title} has been cancelled`,
	});
});

partySchema.post('findOneAndUpdate', async function (err, doc, next) {
	await createNotification(doc, doc.creator, {
		title: '',
		content: `${doc.title} has been cancelled`,
	});
	next();
});

module.exports = mongoose.model('Party', partySchema);
