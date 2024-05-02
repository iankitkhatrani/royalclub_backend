const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GameUser = require('./users');
const collectionName = 'walletTrackTransaction';

const UserWalletTracksSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
    uniqueId: { type: String },
    username: { type: String },
    transType: { type: String },
    transTypeText: { type: String },
    transAmount: { type: Number },
    chips: { type: Number },
    winningChips: { type: Number },
    bonusChips: { type: Number },
    lockbonusChips: { type: Number },
    paymentGateway: { type: String, Default: 'Null' },
    type: { type: String },
    totalBucket: { type: Number, defualt: 0 },
    gameId: { type: String },
    gameType: { type: String },
    maxSeat: { type: Number },
    betValue: { type: Number },
    tableId: { type: String },
  },
  {
    timestamps: true,
  },
  { versionKey: false }
);

module.exports = mongoose.model(collectionName, UserWalletTracksSchema, collectionName);
