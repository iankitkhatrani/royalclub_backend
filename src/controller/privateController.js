const mongoose = require("mongoose");
const MongoID = mongoose.Types.ObjectId;
const CONST = require("../../constant");
const { v4: uuidv4 } = require('uuid');

const PrivateTable = mongoose.model("rummyPrivateTable");
const PlayingTables = mongoose.model("rummyPrivatePlayingTable");
const users_helper = require("../helper/usersHelper");
const common_helper = require("../helper/commonHelper");
const logger = require("../../logger");
const { sendEvent, sendDirectEvent, AddTime, setDelay, clearJob, } = require("../helper/socketFunctions");

// const PrivateTable = require("../models/privateTable");

/**
 * @description 1. Create/Register private table
 * @param {Object} requestBody
 * @returns {Object}
 */
async function privateTableCreate(requestBody, socket) {
  const { playerId, entryFee, gamePlayType, tableId } = requestBody;
  logger.info("req.body => ", requestBody);
  //logger.info(req.files);
  try {
    const user = await PrivateTable.countDocuments({ tableId });
    //logger.info("avatar =>", avatar.data[0]);

    if (user > 0) {
      return {
        message: "User already exists",
        status: 0,
      };
    } else {

      let privateTableId = uuidv4();

      // Trim to the first 6 characters
      privateTableId = privateTableId.substring(0, 6);

      const newData = {
        createTableplayerId: playerId,
        entryFee: entryFee,
        tableId: privateTableId,
        gamePlayType: gamePlayType,
      };

      logger.info("Before New Data", newData);

      let response = await users_helper.registerPrivateTable(newData);
      logger.info("privateTableCreate response => ", response);

      if (response.status) {
        sendEvent(socket, CONST.R_CREATE_RUMMY_PRIVATE_TABLE_ID, { privateTableId: privateTableId }, "Create Private Table Id");
      } else {
        sendEvent(socket, CONST.R_CREATE_RUMMY_PRIVATE_TABLE_ID, {}, false, "Private table Invalid Credential");
        return
      }

      try {
        let insertobj = {
          maxSeat: 5,
          entryFee: betInfo.entryFee,
          commission: 10,
          privateTableId: privateTableId,
          activePlayer: 0,
          gamePlayType: "RummyPrivateTable",
          playerInfo: this.makeObjects(Number(5)),
          // gameState: CONST.WAITING,
          discardCard: '',
          totalRewardCoins: 0,
          playersScoreBoard: [],
        };

        let insertInfo = await PlayingTables.create(insertobj);
        logger.info("create Private Table : ", insertInfo);


        return insertInfo;
      } catch (error) {
        logger.error('joinTable.js createTable error=> ', error, betInfo);
      }

      // return response;
    }
  } catch (error) {
    logger.info("privateTableCreate error => ", error);
    return {
      message:
        "something went wrong while create private table, please try again",
      status: 0,
    };
  }
}

/**
 * @description 2. Check Private tableId is exists or not
 * @param {Object} requestBody
 * @returns {Object}
 */
async function privateTableExistsOrNot(requestBody) {
  logger.info("requestBody => ", requestBody);
  let condition = { tableId: requestBody };
  logger.info("parivate table  condition => ", condition);

  try {
    const userData = await common_helper.findOne(PrivateTable, condition);
    // const userData = await PrivateTable.find({ condition }).lean();
    logger.info("private Table Id userData => ", userData);

    // if (userData.status === 1) {
    //     // res.status(config.OK_STATUS).json({ message: "praivate table id is found", status: 1, userData: userData });
    //     logger.info("praivate table id is found");
    // }
    // else {
    //     logger.info("praivate table id NOT found");
    //     // res.status(config.OK_STATUS).json({ message: "praivate table id *NOT* found", status: 0 });
    // }
    return userData;
  } catch (error) {
    logger.info("privateTableExistsOrNot something went wrong", error);
    return {
      message:
        "something went wrong while Find Private table, please try again",
      status: 0,
    };
  }
}

/**
 * @description 3. after complete private table delete
 * @param {Object} requestBody
 * @returns {Object}
 */
async function privateTableDelete(requestBody) {
  try {
    const { tableId } = requestBody;
    let condition = { tableId };
    console.info("parivate table  condition => ", condition);

    const privateTableData = await common_helper.deleteOne(
      PrivateTable,
      condition
    );
    // const res = await Character.deleteOne({ condition });
    // let privateTableData = await PrivateTable.find().lean();
    logger.info("all privateTableData => ", privateTableData);

    if (privateTableData.status) {
      logger.info("delete private table Data");
      // res.status(config.OK_STATUS).json({ message: "Data deleted ", status: 1, privateTableData: privateTableData.data });
    } else {
      logger.info("Not delete private table Data");
      // res.status(config.OK_STATUS).json({ message: "Data not delete", status: 0 });
    }
    return privateTableData;
  } catch (error) {
    logger.error("something went wrong when private table delete ", error);
  }
}

module.exports.makeObjects = (length = 0) => {
  try {
    return Array.from({ length }, () => {
      return {};
    });
  } catch (error) {
    logger.error('joinTable.js makeObjects error=> ', error);
  }
};

module.exports = {
  privateTableCreate,
  privateTableExistsOrNot,
  privateTableDelete,
};
