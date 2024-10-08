const mongoose = require("mongoose");
const MongoID = mongoose.Types.ObjectId;
const CONST = require("../../constant");
const { v4: uuidv4 } = require('uuid');

const PrivateTable = mongoose.model("teenPrivatebetList");
const PlayingTables = mongoose.model("TeenPrivatePlayingTables");
const users_helper = require("../helper/usersHelper");
const logger = require("../../logger");
const { sendEvent } = require("../helper/socketFunctions");
const { deductWallet } = require("./updateWallet");
const walletActions = require("../common-function/walletTrackTransaction");

// const PrivateTable = require("../models/privateTable");

/**
 * @description 1. Create/Register private table
 * @param {Object} requestBody
 * @returns {Object}
 * 
 */
module.exports.privateTableCreate = async (requestBody, socket) => {
    const { playerId, entryFee, gamePlayType, tableId, potLimit, chalLimit } = requestBody;
    logger.info("req.body => ", requestBody);

    try {
        const user = await PrivateTable.countDocuments({ tableId });
        logger.info("get user details =>", user);

        if (user > 0) {
            return {
                message: "User already exists",
                status: 0,
            };
        } else {

            let privateTableId = generateNumericId(6); // Generates a 6-digit numeric ID
            // console.log(privateTableId);
            // let privateTableId = uuidv4();

            // // Trim to the first 6 characters
            // privateTableId = privateTableId.substring(0, 6);

            const newData = {
                createTableplayerId: playerId,
                entryFee: entryFee,
                tableId: privateTableId,
                gamePlayType: gamePlayType,
                chalLimit: chalLimit,
                potLimit: potLimit
            };

            logger.info("Before New Data", newData);

            let response = await users_helper.registerTeenPrivateTable(newData);
            logger.info("privateTableCreate response => ", response);

            if (response.status) {
                sendEvent(socket, CONST.CREATE_TEEN_PRIVATE_TABLE_ID, { privateTableId: privateTableId }, "Create Teen Patti Private Table Id");
                // await walletActions.addWalletPayin(playerId, - Number(100), 'Debit', 'Teen Patti Private Table Charges', 'Teen Private');
                await walletActions.deductuserWalletGame(socket.uid, - Number(100), CONST.TRANSACTION_TYPE.TABLE_CHARGE, "Teen Patti Private Table Charges", 'Teen Private', privateTableId);

            } else {
                sendEvent(socket, CONST.CREATE_TEEN_PRIVATE_TABLE_ID, {}, false, "Private table Invalid Credential");
                return
            }

            try {
                let insertobj = {
                    gameId: "",
                    maxSeat: 5,
                    entryFee: entryFee,
                    boot: entryFee,
                    tableId: response.data.tableId,
                    commission: 10,
                    privateTableId: privateTableId,
                    activePlayer: 0,
                    potLimit: response.data.potLimit,
                    gamePlayType: "TeenPrivateTable",
                    playerInfo: this.makeObjects(Number(5)),
                    // gameState: CONST.WAITING,
                    discardCard: '',
                    totalRewardCoins: 0,
                    playersScoreBoard: [],
                    gameState: "",
                    discardCard: '',
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

        logger.info("Teen Patti isExist => ", isExist);
        if (isExist) {
            return {
                message: "Already Table Exists",
                status: 0,
                tableId: isExist.tableId,
                entryFee: isExist.entryFee,
            };
        } else {

            //remove a data after 12 hours
            const res = await PrivateTable.deleteMany({
                createdAt: { $lt: twelveHoursAgo },
                createTableplayerId: playerId
            })
            logger.info("Teen check data delete => ", res);


            return {
                message: "already Not exists",
                status: 1,
            };
        }

    } catch (error) {
        logger.info("teen privateTableCreate error => ", error);
        return {
            message: "something went wrong while create private table, please try again",
            status: 0,
        };
    }
}


function generateNumericId(length) {
    let numericId = '';
    const digits = '0123456789';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        numericId += digits[randomIndex];
    }

    return numericId;
}


