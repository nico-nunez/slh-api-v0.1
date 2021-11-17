// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  profileName: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);