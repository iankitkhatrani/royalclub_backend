const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'agent';

const AgentSchema = new Schema(
  {
    password:{type: String},
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now },
    status:{ type: String },
    location:{ type: String },
    chips:{ type: Number,default: 0 }
    
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, AgentSchema, collectionName);
