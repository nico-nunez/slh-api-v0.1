const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: String,
        required: true
    },
    members: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ]
},{timestamps: true});

module.exports = mongoose.model('Family', familySchema);