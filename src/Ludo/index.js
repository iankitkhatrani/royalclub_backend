
const { getBetList } = require('./betList');
const { joinTable } = require("./joinTableLudo");
const { leaveTable } = require("./leaveTable");
const { disconnectTableHandle, findDisconnectTable } = require("./disconnectHandle");
const { RollDice,MOVEKUKARI } = require("./gamePlayLudo");

module.exports = {
  getBetList: getBetList,
  joinTable: joinTable,
  RollDice: RollDice,
  MOVEKUKARI:MOVEKUKARI,
  leaveTable: leaveTable,
  findDisconnectTable: findDisconnectTable,
  disconnectTableHandle: disconnectTableHandle,
};
