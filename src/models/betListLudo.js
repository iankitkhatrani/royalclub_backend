const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'betListLudo';

const LudoBetListSchema = new Schema(
    {
        gameName: { type: String },
        gameType: { type: String, required: true },
        entryFee: { type: Number },//boot Amount
        potLimit: { type: Number },//Max Pot
    },
    {
        versionKey: false,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(collectionName, LudoBetListSchema, collectionName);

