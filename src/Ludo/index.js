
const { getBetList } = require('./betList');
const { joinTable } = require("./joinTableLudo");
const { leaveTable } = require("./leaveTable");
const { disconnectTableHandle, findDisconnectTable } = require("./disconnectHandle");
const { RollDice } = require("./gamePlayLudo");

module.exports = {
  getBetList: getBetList,
  joinTable: joinTable,
  RollDice: RollDice,
  leaveTable: leaveTable,
  findDisconnectTable: findDisconnectTable,
  disconnectTableHandle: disconnectTableHandle,
};
