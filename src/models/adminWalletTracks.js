
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'adminWalletTracks';

const adminWalletTracksSchema = new Schema(
    {   
        adminid:{ type: String ,default:""},
        name: { type: String ,default:"admin"},
        uniqueId: { type: String },
        trnxType: { type: String },
        trnxTypeTxt: { type: String },
        trnxAmount: { type: Number },
        chips: { type: Number },
        gameType: { type: String },
        DateandTime:{ type: Date,default:new Date() },
        adminname: { type: String },
        adminid: { type: String },
        agentid: { type: String },
        agentname: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, adminWalletTracksSchema, collectionName);
