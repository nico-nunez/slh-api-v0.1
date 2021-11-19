const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  profileName: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);