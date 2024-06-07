const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'teenPrivatebetList';

const BetListSchema = new Schema(
    {
        createTableplayerId: { type: String, required: true },
        gameType: { type: String, required: true, default: 'TeenPrivateTable' },
        entryFee: { type: Number },//boot Amount
        chalLimit: { type: Number, default: 0 },
        tableId: { type: String },
        potLimit: { type: Number, default: 500 },//Max Pot
        createdAt: { type: Date, default: Date.now },
        modifiedAt: { type: Date, default: Date.now },
    },
    {
        versionKey: false,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(collectionName, BetListSchema, collectionName);

