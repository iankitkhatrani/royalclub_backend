
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GameUser = mongoose.model("users");

const collectionName = 'userWalletTracks';

const userWalletTracksSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        id: { type: Number },
        uniqueId: { type: String },
        trnxType: { type: String },
        trnxTypeTxt: { type: String },
        trnxAmount: { type: Number },
        oppChips: { type: Number },
        //oppWinningChips: { type: Number },
        //winningChips: { type: Number },
        chips: { type: Number },
        gameWinning: { type: Number },
        totalBucket: { type: Number },
        gameType: { type: String },
        DateandTime:{ type: Date,default:new Date() },
        adminname: { type: String },
        adminid: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, userWalletTracksSchema, collectionName);
