const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const { sendEmailLink } = require('../helpers/email');
const { ExpressError } = require('../helpers/errors');

const List = require('./List');
const { userNotificationSchema } = require('./Notification');
const Party = require('./Party');

const userSchema = new Schema(
  {
    googleID: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      address: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    displayName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 'text', displayName: 'text' });

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email.address',
  maxAttempts: 5,
  errorMessages: {
    UserExistsError:
      'Email is already registered.  You can attempt to login, or recover your password if necessary.',
  },
});

userSchema.post('findOneAndDelete', async function (doc) {
  await List.deleteMany({ creator: doc._id });
  await Party.deleteMany({ creator: doc._id });
  await Party.updateMany({}, { $pull: { members: doc._id } });
});

userSchema.pre('save', function (next) {
  if (this.isNew) {
    sendEmailLink(this, 'emailVerify');
  }
  next();
});
userSchema.post('save', (err, doc, next) => {
  if (err.code === 11000)
    throw new ExpressError('Email already registered.', 400);
  next();
});
userSchema.post('findOneAndUpdate', function (err, doc, next) {
  if (err.code === 11000)
    throw new ExpressError('Email already registered.', 400);
  next();
});

module.exports = mongoose.model('User', userSchema);
