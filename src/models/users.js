const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'users';

const GameUserSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
    username: { type: String },
    deviceId: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    uniqueId: { type: String },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    chips: { type: Number },
    winningChips: { type: Number },
    referralCode: { type: String },
    appVersion: { type: String },
    systemVersion: { type: String },
    deviceName: { type: String },
    deviceModel: { type: String },
    operatingSystem: { type: String },
    graphicsMemorySize: { type: String },
    systemMemorySize: { type: String },
    processorType: { type: String },
    processorCount: { type: String },
    batteryLevel: { type: String },
    genuineCheckAvailable: { type: String },
    platform: { type: String },
    deviceType: { type: String, default: 'Android' },
    profileUrl: { type: String },
    loginType: { type: String, default: 'phone' },
    flags: {
      isOnline: { type: Number, default: 0 }
    },
    counters: {
      gameWin: { type: Number, default: 0 },
      gameLoss: { type: Number, default: 0 },
      totalMatch: { type: Number, default: 0 },
    },
    avatar: { type: String },
    tableId: { type: String, default: '' },
    sckId: { type: String },
    status: { type: String, default: '' },
    lastLoginDate: { type: Date, default: Date.now },
    isVIP: { type: Number, default: 0 },
    Iscom: { type: Number, default: 0 },
    fcmToken: { type: String, default: '' },
    isBot: { type: Boolean, default: false },
    isfree: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    lastTableId: [],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, GameUserSchema, collectionName);
