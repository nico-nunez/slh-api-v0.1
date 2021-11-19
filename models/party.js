const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const List = require('./list');

const partySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    dateCreated: {
        type: Date
    },
    dateJoinBy: {
        type: Date
    },
    dateEnd: {
        type: Date
    },
    // creator: { 
    //     type: Schema.Types.ObjectId,
    //     ref: 'User' 
    // },
    // members: [
    //     { type: Schema.Types.ObjectId, ref: 'User' }
    // ],
    // lists: [
    //     { type: Schema.Types.ObjectId, ref: 'List' },
    // ],
    isPrivate: Boolean
});

module.exports = mongoose.model('Party', partySchema);