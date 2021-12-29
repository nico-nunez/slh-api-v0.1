const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const partySchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		startsOn: {
			type: Date,
			required: true,
		},
		endsOn: {
			type: Date,
			required: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		members: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],
		lists: [
      { type: Schema.Types.ObjectId, ref: "List" }
    ],
		isPublic: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Party", partySchema);
