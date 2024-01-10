const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'playingTables';
const BetLists = mongoose.model('betList');

const PlayingTablesSchema = new Schema({
    gameId: { type: String, default: "" },
    gameType: { type: String, default: "Simple" },
    maxSeat: { type: Number, default: 6 },
    activePlayer: { type: Number, default: 0 },
    betId: { type: mongoose.Schema.Types.ObjectId, ref: BetLists },
    boot: { type: Number, default: 0 },

    chalValue: { type: Number, default: 0 },
    potValue: { type: Number, default: 0 },

    chalLimit: { type: Number, default: 0 },
    potLimit: { type: Number, default: 0 },

    rate: { type: Number },
    hukum: { type: String, default: "" },
    playerInfo: [],
    gameState: { type: String, default: "" },
    turnStartTimer: { type: Date },
    dealerSeatIndex: { type: Number, default: -1 },
    turnSeatIndex: { type: Number, default: -1 },
    jobId: { type: String, default: "" },
    turnDone: { type: Boolean, default: false },
    gameTimer: {},
    gameTracks: [],
    callFinalWinner: { type: Boolean, default: false },
    isLastUserFinish: { type: Boolean, default: false },
    isFinalWinner: { type: Boolean, default: false },
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PlayingTablesSchema, collectionName);
