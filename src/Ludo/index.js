
const { getBetList } = require('./betList');
const { joinTable,CLPT,JPTL,SPLT,JTOFC } = require("./joinTableLudo");
const { leaveTableLudo } = require("./leaveTable");
const { disconnectTableHandle, findDisconnectTable } = require("./disconnectHandle");
const { RollDice, MOVEKUKARI } = require("./gamePlayLudo");

module.exports = {
  getBetList: getBetList,
  joinTable: joinTable,
  RollDice: RollDice,
  MOVEKUKARI: MOVEKUKARI,
  leaveTable: leaveTableLudo,
  findDisconnectTable: findDisconnectTable,
  disconnectTableHandle: disconnectTableHandle,
  CLPT: CLPT,
  JPTL: JPTL,
  SPLT: SPLT,
  JTOFC:JTOFC
};
