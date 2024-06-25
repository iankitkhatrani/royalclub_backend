const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;

const PlayingTables = mongoose.model("playingTables");
const GameUser = mongoose.model("users");

const CONST = require("../../constant");
const commandAcions = require("../helper/socketFunctions");
const roundStartActions = require("./roundStart")
const gameFinishActions = require("./gameFinish");
const logger = require("../../logger");
const { filterBeforeSendSPEvent, getPlayingUserInTable } = require("../common-function/manageUserFunction");


module.exports.leaveTable = async (requestData, client) => {
    requestData = (requestData != null) ? requestData : {}
    if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
        commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_LEAVE_TABLE, requestData, false, "User session not set, please restart game!");
        return false;
    }

    let userWh = {
        _id: MongoID(client.uid.toString()),
    }
    let userInfo = await GameUser.findOne(userWh, {});
    logger.info("leaveTable userInfo : ", userInfo)

    let wh = {
        _id: MongoID(client.tbid.toString()),
        "playerInfo._id": MongoID(client.uid.toString())
    };
    let tb = await PlayingTables.findOne(wh, {});
    logger.info("leaveTable tb : ", tb);

    if (tb == null) {
        return false;
    }

    if (typeof client.id != "undefined") {
        client.leave(tb._id.toString());
    }

    let reason = (requestData != null && typeof requestData.reason != "undefined" && requestData.reason) ? requestData.reason : "ManuallyLeave"
    let playerInfo = tb.playerInfo[client.seatIndex];
    logger.info("leaveTable playerInfo : =>", playerInfo)

    let updateData = {
        $set: {
            "playerInfo.$": {}
        },
        $inc: {
            activePlayer: -1
        }
    }
    if (tb.activePlayer == 2 && tb.gameState == "GameStartTimer") {
        let jobId = CONST.GAME_START_TIMER + ":" + tb._id.toString();
        commandAcions.clearJob(jobId)
        updateData["$set"]["gameState"] = "";
    }
    if (tb.activePlayer == 1) {
        let jobId = "LEAVE_SINGLE_USER:" + tb._id;
        commandAcions.clearJob(jobId)
    }

    if (tb.gameState == "RoundStated") {
        if (client.seatIndex == tb.turnSeatIndex) {
            commandAcions.clearJob(tb.jobId)
        }
        if (playerInfo.cards.length == 3) {
            if (["chal", "blind"].indexOf(playerInfo.playerStatus) != -1) {

                let userTrack = {
                    _id: playerInfo._id,
                    username: playerInfo.username,
                    cards: playerInfo.cards,
                    seatIndex: playerInfo.seatIndex,
                    totalBet: playerInfo.totalBet,
                    playerStatus: "leaveTable"
                }
                updateData["$push"] = {
                    "gameTracks": userTrack
                }
            }
        }
    }

    logger.info("leaveTable updateData : ", wh, updateData);

    let tbInfo = await PlayingTables.findOneAndUpdate(wh, updateData, {
        new: true,
    });

    if (!tbInfo) return;


    let activePlayerInRound = await getPlayingUserInTable(tbInfo.playerInfo);
    logger.info("leaveTable activePlayerInRound : ", activePlayerInRound);


    let response = {
        reason: reason,
        tbid: tb._id,
        seatIndex: client.seatIndex,
        ap: activePlayerInRound.length,
    }

    // let tbInfo = await PlayingTables.findOneAndUpdate(wh, updateData, { new: true });
    // logger.info("leaveTable tbInfo : ", tbInfo);

    commandAcions.sendDirectEvent(client.sck.toString(), CONST.TEEN_PATTI_LEAVE_TABLE, response);
    commandAcions.sendEventInTable(tb._id.toString(), CONST.TEEN_PATTI_LEAVE_TABLE, response);

    let userDetails = await GameUser.findOne({
        _id: MongoID(client.uid.toString()),
    }).lean();

    logger.info("check user Details =>", userDetails)

    let finaldata = await filterBeforeSendSPEvent(userDetails);

    logger.info("check user Details finaldata =>", finaldata)

    commandAcions.sendDirectEvent(client.sck.toString(), CONST.DASHBOARD, finaldata);

    await this.manageOnUserLeave(tbInfo, client);
}

module.exports.manageOnUserLeave = async (tb, client) => {
    logger.info("\nmanageOnUserLeave tb : ", tb);

    const playerInGame = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
    logger.info("manageOnUserLeave playerInGame : ", playerInGame);

    const list = ['RoundStated', 'CollectBoot', 'CardDealing'];

    if (list.includes(tb.gameState) && tb.currentPlayerTurnIndex === client.seatIndex) {
        if (playerInGame.length == 0) {
            if (tb.activePlayer === 0) {
                let wh = {
                    _id: MongoID(tb._id.toString()),
                };
                await PlayingTables.deleteOne(wh);
            }
        } else if (playerInGame.length >= 2) {
            await roundStartActions.nextUserTurnstart(tb, false);
        } else if (playerInGame.length === 1) {

            await roundStartActions.nextUserTurnstart(tb);
        }
    } else if (list.includes(tb.gameState) && tb.currentPlayerTurnIndex !== client.seatIndex) {

        if (playerInGame.length == 0) {
            // await this.leaveallrobot(tb._id)
            if (tb.activePlayer === 0) {
                let wh = {
                    _id: MongoID(tb._id.toString()),
                };
                await PlayingTables.deleteOne(wh);
            }
        } else if (playerInGame.length === 1) {

            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        }
    } else if (["", "GameStartTimer"].indexOf(tb.gameState) != -1) {
        if (playerInGame.length == 0 && tb.activePlayer == 0) {
            let wh = {
                _id: MongoID(tb._id.toString())
            }
            await PlayingTables.deleteOne(wh);
        } else if (tb.activePlayer == 0) {
            this.leaveSingleUser(tb._id)
        }
    }

}

module.exports.leaveSingleUser = async (tbid) => {
    logger.info("leaveSingleUser call tbid : ", tbid);
    let tbId = tbid
    let jobId = "LEAVE_SINGLE_USER:" + tbid;
    let delay = commandAcions.AddTime(120);
    const delayRes = await commandAcions.setDelay(jobId, new Date(delay));
    logger.info("leaveSingleUser delayRes : ", delayRes);

    const wh1 = {
        _id: MongoID(tbId.toString())
    }
    const tabInfo = await PlayingTables.findOne(wh1, {}).lean();
    logger.info("leaveSingleUser tabInfo : ", tabInfo);
    if (tabInfo.activePlayer == 1) {
        let playerInfos = tabInfo.playerInfo
        for (let i = 0; i < playerInfos.length; i++) {
            if (typeof playerInfos[i].seatIndex != "undefined") {
                await this.leaveTable({
                    reason: "singleUserLeave"
                }, {
                    uid: playerInfos[i]._id.toString(),
                    tbid: tabInfo._id.toString(),
                    seatIndex: playerInfos[i].seatIndex,
                    sck: playerInfos[i].sck,
                })
            }
        }

    }
}