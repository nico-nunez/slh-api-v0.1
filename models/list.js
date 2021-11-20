const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');

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
})
  

const listSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    items: [itemSchema],
    creator: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    parties: [{
        type: Schema.Types.ObjectId,
        ref: 'Party'
    }]
},{timestamps: true});

module.exports = mongoose.model('List', listSchema);