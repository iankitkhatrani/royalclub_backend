const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'users';
//username: { type: String },
//email: { type: String, default: '' },
//    mobileNumber: { type: String, required: true },
// isVIP: { type: Number, default: 0 },
// Iscom: { type: Number, default: 0 },
// avatar: { type: String },
// isBot: { type: Boolean, default: false },
//     referralCode: { type: String },
//     appVersion: { type: String },
//     systemVersion: { type: String },
//     deviceName: { type: String },
//     deviceModel: { type: String },
//     operatingSystem: { type: String },
//     graphicsMemorySize: { type: String },
//     systemMemorySize: { type: String },
//     processorType: { type: String },
//     processorCount: { type: String },
//     batteryLevel: { type: String },
//     genuineCheckAvailable: { type: String },
//     platform: { type: String },
//     deviceType: { type: String, default: 'Android' },
//     profileUrl: { type: String },
//     loginType: { type: String, default: 'phone' },
// deviceId: { type: String },

// isBlock: { type: Boolean, default: false },
const GameUserSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
    uniqueId: { type: String },
    password: { type: String, default: '' },
    chips: { type: Number },
    flags: {
      isOnline: { type: Number, default: 0 }
    },
    counters: {
      gameWin: { type: Number, default: 0 },
      gameLoss: { type: Number, default: 0 },
      totalMatch: { type: Number, default: 0 },
    },
    tableId: { type: String, default: '' },
    sckId: { type: String },
    status: { type: Boolean, default: true },
    lastLoginDate: { type: Date, default: Date.now },
    fcmToken: { type: String, default: '' },
    isfree: { type: Boolean, default: true },
    lastTableId: [],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
    authorisedid: { type: String },
    authorisedtype: { type: String },
    authorisedname: { type: String }
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, GameUserSchema, collectionName);
