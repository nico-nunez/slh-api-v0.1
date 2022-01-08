const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const selectionSchema = new Schema(
	{
        selector: {type: Schema.Types.ObjectId, ref: 'User'},
        recipient: {type: Schema.Types.ObjectId, ref: 'User'},
        party: {type: Schema.Types.ObjectId, ref: 'Party'},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Selection', selectionSchema);