
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Agent = mongoose.model("agent");
const GameUser = mongoose.model("users");
const collectionName = 'agentWalletTracks';

const agentWalletTracksSchema = new Schema(
    {
        agentId: { type: mongoose.Schema.Types.ObjectId, ref: Agent },
        name:{ type: String },
        uniqueId: { type: String },
        trnxType: { type: String },
        trnxTypeTxt: { type: String },
        trnxAmount: { type: Number },
        oppChips: { type: Number },
        chips: { type: Number },
        gameWinning: { type: Number },
        totalBucket: { type: Number },
        gameType: { type: String },
        DateandTime: { type: Date, default: new Date() },
        authorisedid: { type: String },
        authorisedtype: { type: String },
        authorisedname: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, agentWalletTracksSchema, collectionName);
