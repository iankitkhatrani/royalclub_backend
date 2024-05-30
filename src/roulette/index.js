

const { ROULETTE_GAME_JOIN_TABLE } = require("./joinTable");
const { leaveTable } = require("./leaveTable");
const { disconnectTableHandle, findDisconnectTable } = require("./disconnectHandle");
const {REMOVEBETROULETTE,PASTBET,NEIGHBORBET, HISTORY,actionSpin,ClearBet,DoubleBet,AdminWinLossData } = require("./gamePlay");

module.exports = {
  ROULETTE_GAME_JOIN_TABLE: ROULETTE_GAME_JOIN_TABLE,
  leaveTable: leaveTable,
  findDisconnectTable: findDisconnectTable,
  disconnectTableHandle: disconnectTableHandle,
  actionSpin:actionSpin,
  ClearBet:ClearBet,
  DoubleBet:DoubleBet,
  HISTORY:HISTORY,
  NEIGHBORBET:NEIGHBORBET,
  PASTBET: PASTBET,
  REMOVEBETROULETTE: REMOVEBETROULETTE,
  AdminWinLossData:AdminWinLossData
};
