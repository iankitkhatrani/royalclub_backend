const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collectionName = "rummyPrivateTable";

const PrivateTableSchema = new Schema({
    createTableplayerId: { type: String, required: true },
    entryFee: { type: String, required: true },
    tableId: { type: String },
    gamePlayType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PrivateTableSchema, collectionName);