const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const confirmationSchema = new Schema({
  ucc: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60
  }
});

module.exports = mongoose.model('Confirmation', confirmationSchema);

