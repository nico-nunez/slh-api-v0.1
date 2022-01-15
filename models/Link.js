const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    enum: ['confirmation', 'invitation', 'reset'],
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
  const { referenceID, subject } = this;
  await Link.deleteMany({referenceID, subject});
})

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;