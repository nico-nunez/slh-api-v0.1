const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema(
	{
    googleID: {
      type: String,
      unique: true,
      sparse: true
    },
		email: {
			type: String,
			unique: true,
			sparse: true,
		},
		displayName: String,
		selections: [
      {type: Schema.Types.ObjectId, ref: "SecretSanta"}
		],
	},
	{ timestamps: true }
);

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model("User", UserSchema);
