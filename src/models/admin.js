const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'admin';

const AdminSchema = new Schema(
  {
    name: { type: String },
    password:{type: String},
    createdAt: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now },
    status: { type: Boolean, default: true },
    chips:{ type: Number,default: 0 },
    type: { type: String, default: "Admin" },
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, AdminSchema, collectionName);
