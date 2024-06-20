const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'superadmin';

const AdminSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
    type: { type: String, default: "SuperAdmin" },
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, AdminSchema, collectionName);
