const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collectionName = "privateTable";

const PrivateTableSchema = new Schema({
    createTableplayerId: { type: String, required: true },
    entryFee: { type: String, required: true },
    tableId: { type: String },
    gamePlayType: { type: String, default:'private' },
    maxSeat: { type: Number, default: 6 },
    winingDeclareCount: { type: Number, default: 3 },
    activePlayer: { type: Number, default: 0 },
    gameTimer: { type: Object, default: {} },
    startTimer: { type: String, default: -1 },
    tableAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 10 },
    currentPlayerTurnIndex: { type: Number, default: -1 },
    tableLock: { type: Boolean, default: false },
    gameTracks: [],
    lastPointTable: [],
    playerInfo: [],
    chatPanel: [],
    round: { type: Number, default: 0 },
    reAssignPoint: { type: Number, default: 0 },
    totalRewardCoins: { type: Number, default: 0 },
    playersScoreBoard: [],
    lastGameScoreBoard: [],
    gameState: { type: String, default: '' },
    wildCard: { type: String, default: '' },
    openCard: { type: String, default: '' },
    discardCard: { type: String, default: '' },
    openDeck: [{ type: String, default: [] }],
    closeDeck: [{ type: String, default: [] }],
    turnDone: { type: Boolean, default: false },
    turnStartTimer: { type: Date },
    dealerSeatIndex: { type: Number, default: -1 },
    jobId: { type: String, default: '' },
    callFinalWinner: { type: Boolean, default: false },
    isLastUserFinish: { type: Boolean, default: false },
    isFinalWinner: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PrivateTableSchema, collectionName);