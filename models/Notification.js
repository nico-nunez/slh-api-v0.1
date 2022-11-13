const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    generatorModel: {
      type: String,
      enum: ['Party', 'List', 'User'],
    },
    generator: {
      type: Schema.Types.ObjectId,
      refPath: 'generatorModel',
    },
    recipients: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
