const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema(
	{
    googleID: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
		email: {
			type: String,
      trim: true,
			unique: true,
			sparse: true,
		},
    verified: {
      type: Boolean,
      default: false
    },
		displayName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    listsFollowing: [ 
      {type: Schema.Types.ObjectId, ref: 'List'}
    ],
		selections: [
      {type: Schema.Types.ObjectId, ref: 'Selection'}
		],
	},
	{ timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  maxAttempts: 5,
  errorMessages: { UserExistsError: 'Email is already registered.  You can attempt to login, or recover your password if necessary.'}
  });

module.exports = mongoose.model("User", userSchema);
