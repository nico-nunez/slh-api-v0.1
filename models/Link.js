const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const allowedTypes = [
  'emailVerify',
  'emailUpdate',
  'resetRequest'
]

const linkSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: [...allowedTypes],
    required: true
  },
  referenceID: {
    type: String,
    required: true
  },
  valid: {
    type: Boolean,
    default: true
  },
  expireAt: {
    type: Date,
    default: Date.now() + (1000 * 60 * 60),
    expires: 0
  }
});


linkSchema.pre('save', async function() {
  const { referenceID, type } = this;
  await Link.deleteMany({ referenceID, type});
})

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;