const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { sendEmailLink } = require("../helpers/email");

const favoriteSchema = new Schema({
  likedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  likedModel: {
    type: String,
    required: true,
    enum: ['Party', 'List', 'User']
  },
  likedObj: {
    type: Schema.Types.ObjectId,
    refPath: 'likedModel'
  }
});




module.exports = mongoose.model("Favorite", favoriteSchema);
