const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const List = require('./list');


const partySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    joinBy: Date,
    endsOn: Date,
    creator: { 
        type: Schema.Types.ObjectId,
        ref: 'User' 
    },
    members: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],
    lists: [
        { type: Schema.Types.ObjectId, ref: 'List'}
    ],
    isPrivate: Boolean
},{timestamps: true});

module.exports = mongoose.model('Party', partySchema);