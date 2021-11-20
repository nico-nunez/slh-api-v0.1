const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const secretSantaSchema = new Schema(
	{
        gifter: {type: Schema.Types.ObjectId, ref: 'User'},
        giftee: {type: Schema.Types.ObjectId, ref: 'User'},
        party: {type: Schema.Types.ObjectId, ref: 'Party'},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("SecretSanta", secretSantaSchema);