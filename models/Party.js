const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const partySchema = new Schema(
	{
		name: {
			type: String,
			required: true,
      trim: true,
			unique: true,
		},
    secretCode: {
      type: String,
      trim: true,
      required: true
    },
		joinBy: {
			type: Date,
			required: true,
		},
		exchangeOn: {
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
		public: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Party", partySchema);
