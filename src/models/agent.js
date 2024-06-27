const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'agent';
const AdminUser = mongoose.model('admin');

const AgentSchema = new Schema(
  {
    
    password:{type: String},
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    chips: { type: Number, default: 0 },
    authorisedid: { type: String },
    authorisedtype: { type: String },
    authorisedname: { type: String },
    commission: { type: Number, default: 0 },
    partnerpercentagejanata: { type: Number, default: 0 },
    partnerpercentageroulette: { type: Number, default: 0 },
    type: { type: String, default: "agent" }
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, AgentSchema, collectionName);
