const mongoose = require("mongoose");
const MongoID = mongoose.Types.ObjectId;
const CONST = require("../../constant");
const { v4: uuidv4 } = require('uuid');

const PrivateTable = mongoose.model("rummyPrivateTable");
const PlayingTables = mongoose.model("rummyPrivatePlayingTable");
const users_helper = require("../helper/usersHelper");
const logger = require("../../logger");
const { sendEvent } = require("../helper/socketFunctions");
const walletActions = require("../common-function/walletTrackTransaction");


// const PrivateTable = require("../models/privateTable");

/**
 * @description 1. Create/Register private table
 * @param {Object} requestBody
 * @returns {Object}
 */
module.exports.privateTableCreate = async (requestBody, socket) => {
    const { playerId, entryFee, gamePlayType, tableId, deduct } = requestBody;
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
                await walletActions.addWalletPayin(playerId, - Number(100), 'Debit', 'Rummy Private Table Charges', 'Rummy Private');

            } else {
                sendEvent(socket, CONST.R_CREATE_RUMMY_PRIVATE_TABLE_ID, {}, false, "Private table Invalid Credential");
                return
            }

            try {
                let insertobj = {
                    maxSeat: 5,
                    entryFee: entryFee,
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
                logger.error('joinTable.js createTable error=> ', error);
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

module.exports.makeObjects = (length = 0) => {
    try {
        return Array.from({ length }, () => {
            return {};
        });
    } catch (error) {
        logger.error('joinTable.js makeObjects error=> ', error);
    }
};

module.exports.checkPrivateTableExists = async (requestBody, socket) => {
    const { playerId, tableId } = requestBody;
    logger.info("req.body => ", requestBody);

    // Get the current date and time
    const now = new Date();

    // Calculate the date and time for 12 hours ago
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    try {
        const isExist = await PrivateTable.findOne({
            createTableplayerId: playerId,
            createdAt: { $gte: twelveHoursAgo }
        });

        logger.info("isExist => ", isExist);
        if (isExist) {
            return {
                message: "already exists",
                status: 0,
                tableId: isExist.tableId
            };
        } else {
            //remove a data after 12 hours
            const res = await PrivateTable.deleteMany({
                createdAt: { $lt: twelveHoursAgo },
                createTableplayerId: playerId
            })
            logger.info("check data delete => ", res);

            return {
                message: "already Not exists",
                status: 1,
            };


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
