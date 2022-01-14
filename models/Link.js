const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const linkCodeSchema = new Schema({
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

module.exports = mongoose.model('Link', linkCodeSchema);