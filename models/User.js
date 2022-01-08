const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new Schema(
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
    confirmed: {
      type: Boolean,
      default: false
    },
		displayName: String,
    listsFollowing: [ 
      {type: Schema.Types.ObjectId, ref: 'List'}
    ],
		selections: [
      {type: Schema.Types.ObjectId, ref: 'Selection'}
		],
	},
	{ timestamps: true }
);

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model("User", UserSchema);
