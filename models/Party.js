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
    secret: {
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
    lists: [
      {type: Schema.Types.ObjectId, ref: 'List'}
    ],
		members: [
      { type: Schema.Types.ObjectId, ref: "User" }
    ],
		public: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{ timestamps: true }
);

partySchema.index({name: 'text', creator: 'text', members: 'text'});

module.exports = mongoose.model("Party", partySchema);
