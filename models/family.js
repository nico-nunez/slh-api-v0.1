const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FamilySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }],
    creator: {type: Schema.Types.ObjectId}
});


module.exports = mongoose.model('Family', FamilySchema);