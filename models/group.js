const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const List = require('./list');

const groupSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    dateCreated: {
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

module.exports = mongoose.model('Group', groupSchema);