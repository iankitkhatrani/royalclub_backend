const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'playingTables';
const BetLists = mongoose.model('betList');

const PlayingTablesSchema = new Schema({
    gameId: { type: String, default: "" },
    gameType: { type: String, default: "Simple" },
    gamePlayType: { type: String, default: "Simple" },
    maxSeat: { type: Number, default: 6 },
    activePlayer: { type: Number, default: 0 },
    betId: { type: mongoose.Schema.Types.ObjectId, ref: BetLists },
    boot: { type: Number, default: 0 },
    currentPlayerTurnIndex: { type: Number, default: -1 },
    startTimer: { type: String, default: -1 },
    tableAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 10 },

    chalValue: { type: Number, default: 0 },
    potValue: { type: Number, default: 0 },

    chalLimit: { type: Number, default: 0 },
    potLimit: { type: Number, default: 0 },
    gameTimer: { type: Object, default: {} },

    rate: { type: Number },
    hukum: { type: String, default: "" },
    playerInfo: [],
    gameState: { type: String, default: "" },
    turnStartTimer: { type: Date },
    dealerSeatIndex: { type: Number, default: -1 },
    turnSeatIndex: { type: Number, default: -1 },
    jobId: { type: String, default: "" },
    turnDone: { type: Boolean, default: false },
    gameTracks: [],
    callFinalWinner: { type: Boolean, default: false },
    isLastUserFinish: { type: Boolean, default: false },
    isFinalWinner: { type: Boolean, default: false },
    winStatus: { type: Boolean, default: false },
    finished: { type: Boolean, default: false },
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PlayingTablesSchema, collectionName);
