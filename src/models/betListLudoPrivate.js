const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'betListLudoPrivate';

const LudoBetListSchema = new Schema(
    {
        createTableplayerId: { type: String, required: true },
        gameType: { type: String, default: 'privateLudo' },
        tableCode: { type: String },
        entryFee: { type: Number },//boot Amount
        potLimit: { type: Number },//Max Pot
        createdAt: { type: Date, default: Date.now },
        modifiedAt: { type: Date, default: Date.now }
    },
    {
        versionKey: false,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(collectionName, LudoBetListSchema, collectionName);

