const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const linkCodeSchema = new Schema({
  uniqueCode: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    enum: ['confirmation', 'invitation', 'recovery'],
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

module.exports = mongoose.model('LinkCode', linkCodeSchema);