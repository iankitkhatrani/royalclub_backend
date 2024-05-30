const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'adminwinloss';

const AdminWinlossTextSchema = new Schema(
    {
        win: { type: Number },
        loss: { type: Number },
        createdAt: { type: Date, default: Date.now },
        date: {type:String}
    },
    { versionKey: false }
);

module.exports = mongoose.model(collectionName, AdminWinlossTextSchema, collectionName);
