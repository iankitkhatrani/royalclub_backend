const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'playingLudo';


const PlayingTablesSchema = new Schema({
    gameId: { type: String, default: "" },
    gameType: { type: String, default: "Simple" },
    maxSeat: { type: Number, default: 2 },
    activePlayer: { type: Number, default: 0 },
    betId: { type: String,default: "" },
    boot: { type: Number, default: 0 },
    playerInfo: [{},{}],
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
    playerRoutePos1:[],
    playerRoutePos2:[],
    playerRoutePos3:[],
    playerRoutePos4:[],
    safeDice:[],
    _ip:{ type: Number},
    tableCode:{ type: String, default: "" },
    adminId: { type: String,default: "" },
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PlayingTablesSchema, collectionName);
