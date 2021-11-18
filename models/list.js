const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
  });

const itemSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    link: String,
    purchased: Boolean
    // images: [imageSchema]
})
  
//   imageSchema.virtual('thumbnail').get(function() {
//     return this.url.replace('/upload', '/upload/w_100,h_80');
//   });
//   imageSchema.virtual('indexPage').get(function() {
//     return this.url.replace('/upload', '/upload/w_300,h_300');
//   });
//   imageSchema.virtual('showPage').get(function() {
//     return this.url.replace('/upload', '/upload/w_600,h_500');
//   });

const listSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  items: [itemSchema],
      // updated: Date,
    // created: Date,
    // author,

});


module.exports = mongoose.model('List', listSchema);