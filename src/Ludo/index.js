
const { getBetList } = require('./betList');
const { joinTable,CLPT,JPTL,SPLT } = require("./joinTableLudo");
const { leaveTable } = require("./leaveTable");
const { disconnectTableHandle, findDisconnectTable } = require("./disconnectHandle");
const { RollDice, MOVEKUKARI } = require("./gamePlayLudo");

module.exports = {
  getBetList: getBetList,
  joinTable: joinTable,
  RollDice: RollDice,
  MOVEKUKARI: MOVEKUKARI,
  leaveTable: leaveTable,
  findDisconnectTable: findDisconnectTable,
  disconnectTableHandle: disconnectTableHandle,
  CLPT: CLPT,
  JPTL: JPTL,
  SPLT: SPLT,
};
