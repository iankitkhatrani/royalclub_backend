const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionName = 'JantaTables';

const PlayingTablesSchema = new Schema({
    gameId: { type: String, default: "" },
    activePlayer: { type: Number, default: 0 },
    playerInfo: [],
    gameState: { type: String, default: "" },
    turnStartTimer: { type: Date },
    jobId: { type: String, default: "" },
    turnDone: { type: Boolean, default: false },
    gameTimer: {},
    gameTracks: [],
    callFinalWinner: { type: Boolean, default: false },
    isLastUserFinish: { type: Boolean, default: false },
    isFinalWinner: { type: Boolean, default: false },
    history:[],
    betamount:[],
    cards:[],
    opencards:[],
    totalbet:{ type: Number, default: 0 },
    sumofcard:{ type: Number, default: -1 },
    TableObject:[],
    uuid:{ type: String, default: "" }
}, { versionKey: false });

module.exports = mongoose.model(collectionName, PlayingTablesSchema, collectionName);