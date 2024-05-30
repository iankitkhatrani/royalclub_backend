const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const collectionName = 'RouletteUserHistory';

const RouletteUserSchema = new Schema({
    userId: { type: String },
    ballposition: { type: Number },
    beforeplaypoint:{ type: Number },
    play:{ type: Number},
    won: { type: Number },
    afterplaypoint:{ type: Number },
    uuid:{ type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    betObjectData: {}
}, { versionKey: false });

module.exports = mongoose.model(collectionName, RouletteUserSchema, collectionName);