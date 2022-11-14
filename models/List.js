const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');

const Party = require('./Party');
const { createNotification } = require('../helpers/notifications.helpers');

const itemSchema = new Schema({
	description: {
		type: String,
		required: true,
	},
	link: String,
	purchased: Boolean,
});

const listSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		items: [itemSchema],
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		public: {
			type: Boolean,
			required: true,
			default: false,
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

listSchema.index({ title: 'text', creator: 'text', items: 'text' });
itemSchema.index({ description: 'text' });

listSchema.post('findOneAndDelete', async function (doc) {
	await createNotification(doc, doc.creator, {
		title: '',
		content: `${doc.title} has been deleted`,
	});
});

listSchema.post('findOneAndUpdate', async function (doc) {
	const parties = await Party.find({ lists: { $in: doc._id } });
	if (parties) {
		Promise.all(
			parties.map(async (party) => {
				await createNotification(party, doc.creator, {
					title: '',
					content: `The list "${doc.title}" has been updated`,
				});
			})
		);
	}
});

module.exports = mongoose.model('List', listSchema);
