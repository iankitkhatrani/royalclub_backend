
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'superadminWalletTracks';

const superadminWalletTracksSchema = new Schema(
    {   
        adminid:{ type: String ,default:""},
        name: { type: String ,default:"Superadmin"},
        uniqueId: { type: String },
        trnxType: { type: String },
        trnxTypeTxt: { type: String },
        trnxAmount: { type: Number },
        chips: { type: Number },
        gameType: { type: String },
        DateandTime:{ type: Date,default:new Date() },
        adminname: { type: String },
        authorisedid: { type: String },
        authorisedtype: { type: String },
        authorisedname: { type: String }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(collectionName, superadminWalletTracksSchema, collectionName);
