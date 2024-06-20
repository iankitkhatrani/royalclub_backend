
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Shop = mongoose.model("shop");
const GameUser = mongoose.model("users");
const collectionName = 'shopWalletTracks';

const shopWalletTracksSchema = new Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: Shop },
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
        adminname: { type: String },
        adminid: { type: String },
        userid: { type: String },
        username: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, shopWalletTracksSchema, collectionName);
