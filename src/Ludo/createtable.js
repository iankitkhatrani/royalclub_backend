const mongoose = require("mongoose");
const MongoID = mongoose.Types.ObjectId;
const CONST = require("../../constant");
const { v4: uuidv4 } = require('uuid');

const PrivateTableBetList = mongoose.model("betListLudoPrivate");
const PlayingTables = mongoose.model("playingLudo");
const users_helper = require("../helper/usersHelper");
const logger = require("../../logger");
const { sendEvent } = require("../helper/socketFunctions");
const walletActions = require("../common-function/walletTrackTransaction");


// const PrivateTableBetList = require("../models/privateTable");

/**
 * @description 1. Create/Register private table
 * @param {Object} requestBody
 * @returns {Object}
 */
module.exports.privateTableCreate = async (requestBody, socket) => {
    const { playerId, entryFee, gamePlayType, tableId, deduct, _ip } = requestBody;
    logger.info("req.body => ", requestBody);
    //logger.info(req.files);
    try {
        const user = await PrivateTableBetList.countDocuments({ createTableplayerId:playerId });
        logger.info("user =>", user);

        if (user > 0) {
            return {
                message: "User already exists",
                status: 0,
            };

            //sendEvent(socket, CONST.CLPT, {}, false, "Private table Invalid Credential");

        } else {

            let privateTableId = uuidv4();

            // Trim to the first 6 characters
            privateTableId = privateTableId.substring(0, 6);

            const newData = {
                createTableplayerId: playerId,
                entryFee: entryFee,
                tableCode: privateTableId
                // gamePlayType: gamePlayType,
            };

            logger.info("Before New Data", newData);

            let response = await users_helper.registerLudoPrivateTable(newData);
            logger.info("privateTableCreate response => ", response);

            // if (response.status) {
            //     sendEvent(socket, CONST.CLPT, { tableCode: privateTableId , _id: table._id }, "Create Private Ludo Table Id");
            //     await walletActions.addWalletPayin(playerId, - Number(100), 'Debit', 'Ludo Private Table Charges', 'Rummy Private');

            // } else {
            //     sendEvent(socket, CONST.CLPT, {}, false, "Private table Invalid Credential");
            //     return
            // }

            try {
                let insertobj = {
                    maxSeat: 2,
                    entryFee: entryFee,
                    commission: 10,
                    privateTableId: privateTableId,
                    activePlayer: 0,
                    gamePlayType: "privateLudo",
                    playerInfo: this.makeObjects(Number(2)),
                    // gameState: CONST.WAITING,
                    discardCard: '',
                    totalRewardCoins: 0,
                    playersScoreBoard: [],
                    playerRoutePos1: [
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                        27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58
                    ],
                    playerRoutePos2: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                        29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                        41, 42, 43, 44, 45, 46, 47, 48, 49,
                        50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 59, 60, 61, 62, 63, 64
                    ],
                    playerRoutePos3: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
                        52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 65, 66, 67, 68, 69, 70
                    ],
                    playerRoutePos4: [
                        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                        27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 71, 72, 73, 74, 75, 76
                    ],
                    safeDice: [9, 22, 35, 48, 1, 14, 27, 40],
                    _ip: _ip,
                    tableCode: privateTableId,//requestData._ip != undefined && requestData._ip == 1 ? Math.floor(1000000 + Math.random() * 9000000) : "",
                    adminId: playerId//requestData.adminId != undefined ? requestData.adminId : "",
                };

                let insertInfo = await PlayingTables.create(insertobj);
                logger.info("create Private Table : ", insertInfo);

                 await PrivateTableBetList.updateOne({tableCode:privateTableId},{tableid:insertInfo._id});

                if (response.status) {
                    sendEvent(socket, CONST.CLPT, { tableCode: privateTableId , _id: insertInfo._id }, "Create Private Ludo Table Id");
                    await walletActions.addWalletPayin(playerId, - Number(100), 'Debit', 'Ludo Private Table Charges', 'Rummy Private');
    
                } else {
                    sendEvent(socket, CONST.CLPT, {}, false, "Private table Invalid Credential");
                    return
                }
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
        const isExist = await PrivateTableBetList.findOne({
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
            const res = await PrivateTableBetList.deleteMany({
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
