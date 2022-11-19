const { boolean } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exclusionSchema = new Schema({
	member_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	excluded_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	party_id: {
		type: Schema.Types.ObjectId,
		ref: 'Party',
	},
});

module.exports = mongoose.model('exclusion', exclusionSchema);
