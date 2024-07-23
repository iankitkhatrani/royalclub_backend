const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const PlayingTables = mongoose.model("playingTables");
const Users = mongoose.model("users");

const commandAcions = require("../helper/socketFunctions");
const gameStartActions = require("./gameStart");
const logger = require("../../logger");
const CONST = require("../../constant");
const { filterBeforeSendSPEvent } = require("../common-function/manageUserFunction");

module.exports.roundFinish = async (tb) => {
    try {
        logger.info("\n roundFinish tb :: ", tb);


        const playerInGame = await this.getPlayingUserInRound(tb.playerInfo);
        logger.info('roundFinish Player In game =>', playerInGame);

        const list = ['play', 'pack', 'blind', 'win', 'loss', 'chal', 'winner', 'leaveTable'];

        playerInGame.forEach(async (player) => {
            logger.info('teen roundFinish player ->', player);
            if (list.includes(player.playerStatus)) {
                //player.playerStatus = CONST.WAITING;

                let uWh1 = {
                    _id: MongoID(tb._id.toString()),
                    'playerInfo.seatIndex': Number(player.seatIndex),
                };

                let dataUpdate = {
                    $set: {
                        'playerInfo.$.playerStatus': "",
                        'playerInfo.$.status': CONST.WAITING,
                        'playerInfo.$.finished': false,
                        'playerInfo.$.isSee': false,
                        'playerInfo.$.cards': [],
                        'playerInfo.$.chalValue': 0,
                        'playerInfo.$.totalBet': 0,
                    },
                };

                logger.info('\n roundFinish player uWh1 ->', uWh1);
                logger.info('\n roundFinish player update ->', dataUpdate);

                const restartTable = await PlayingTables.findOneAndUpdate(uWh1, dataUpdate, { new: true });
                logger.info('\n roundFinish restart Table ->', restartTable);

                let whr = { _id: player._id };
                let userInfo = await Users.findOne(whr, {}).lean();
                logger.info('\n roundFinish restart userInfo ->', userInfo);

                // let totalWallet = Number(userInfo.chips);
                let requireGameChips = restartTable.boot;

                if ((userInfo.chips) > requireGameChips) {
                    logger.info('sufficient local chips');
                } else {

                    logger.info(' Insufficient Balance..Please Add Wallet!!');

                    let wh = {
                        _id: MongoID(tb._id.toString()),
                        'playerInfo._id': MongoID(player._id.toString()),
                    };

                    let updateData = {
                        $set: {
                            'playerInfo.$': {},
                        },
                        $inc: {
                            activePlayer: -1,
                        },
                    };

                    let tbInfo = await PlayingTables.findOneAndUpdate(wh, updateData, {
                        new: true,
                    });

                    let activePlayerInRound = await this.getPlayingUserInRound(tbInfo.playerInfo);

                    let response = {
                        pi: player._id,
                        score: tbInfo.entryFee,
                        lostChips: tbInfo.entryFee,
                        totalRewardCoins: tbInfo.tableAmount,
                        ap: activePlayerInRound.length,
                    };
                    //commandAcions.sendDirectEvent(player.sck.toString(), CONST.LEAVE, response);
                    commandAcions.sendEventInTable(tbInfo._id.toString(), CONST.LEAVE, response);

                    let userDetails = await Users.findOne({
                        _id: MongoID(player._id.toString()),
                    }).lean();

                    let finalData = await filterBeforeSendSPEvent(userDetails);

                    commandAcions.sendDirectEvent(player.sck.toString(), CONST.DASHBOARD, finalData);

                    commandAcions.sendDirectEvent(player.sck.toString(), CONST.REMOVE_USERSOCKET_FROM_TABLE);

                    let jobId = commandAcions.GetRandomString(10);
                    let delay = commandAcions.AddTime(2);
                    await commandAcions.setDelay(jobId, new Date(delay));

                    commandAcions.sendDirectEvent(player.sck.toString(), CONST.INSUFFICIENT_CHIPS, {
                        flag: false,
                        msg: 'Insufficient Balance..Please Add Wallet!!',
                    });

                }
            } else {
                logger.info('roundFinish player.playerStatus ------>', player.playerStatus);
            }
        });

        let tableFinal = await PlayingTables.findOne({
            _id: MongoID(tb._id.toString()),
        }).lean();

        logger.info("tableFinal -->", tableFinal)

        let wh = {
            _id: MongoID(tableFinal._id.toString())
        }
        let update = {
            $set: {
                gameTracks: [],
                gameId: "",
                gameState: "",
                isLastUserFinish: false,
                isFinalWinner: false,
                callFinalWinner: false,
                turnSeatIndex: -1,
                dealerSeatIndex: -1,
                hukum: "",
                chalValue: 0,
                potValue: 0,
                turnDone: false,
                currentPlayerTurnIndex: -1,
                jobId: "",
            },
            $unset: {
                gameTimer: 1
            }
        }
        logger.info("roundFinish wh :: ", wh, update);

        let tbInfo = await PlayingTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("roundFinish tbInfo : ", tbInfo);
        let tableId = tbInfo._id;

        let jobId = commandAcions.GetRandomString(10);
        let delay = commandAcions.AddTime(5);
        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));
        logger.info("roundFinish delayRes : ", delayRes);

        const wh1 = {
            _id: MongoID(tableId.toString())
        }
        const tabInfo = await PlayingTables.findOne(wh1, {}).lean();
        logger.info("roundFinish tabInfo : ", tabInfo);

        if (!tabInfo) {
            logger.info('roundEnd.js table is Null:', tabInfo);
            return false;
        }

        if (tabInfo.activePlayer >= 2) {
            await gameStartActions.gameTimerStart(tabInfo);
        }

        return true;
    } catch (err) {
        logger.info("Exception roundFinish : ", err)
    }
}

module.exports.getPlayingUserInRound = async (p) => {
    try {

        let pl = [];
        if (typeof p == 'undefined' || p == null)
            return pl;

        for (let x = 0; x < p.length; x++) {
            if (typeof p[x] == 'object' && p[x] != null && typeof p[x].seatIndex != 'undefined' && p[x].status == "play")
                pl.push(p[x]);
        }
        return pl;
    } catch (error) {
        logger.error('roundStart.js getPlayingUserInRound error : ', error);
    }
}