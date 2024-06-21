
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminUser = mongoose.model("admin");

const collectionName = 'adminWalletTracks';

const adminWalletTracksSchema = new Schema(
    {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: AdminUser },
        name: { type: String },
        uniqueId: { type: String },
        trnxType: { type: String },
        trnxTypeTxt: { type: String },
        trnxAmount: { type: Number },
        oppChips: { type: Number },
        chips: { type: Number },
        gameWinning: { type: Number },
        totalBucket: { type: Number },
        gameType: { type: String },
        DateandTime:{ type: Date,default:new Date() },
        authorisedid: { type: String },
        authorisedtype: { type: String },
        authorisedname: { type: String },
        id: { type: String,default:"" },
        type: { type: String,default:"" },
        trackname: { type: String,default:"" },
        
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, adminWalletTracksSchema, collectionName);
