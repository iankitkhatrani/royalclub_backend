const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model("users");
const PlayingTables = mongoose.model("playingTables");

const CONST = require("../../constant");
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");

const roundStartActions = require("./roundStart");
const gameFinishActions = require("./gameFinish");
const checkWinnerActions = require("./checkWinner");
const checkUserCardActions = require("./checkUserCard");
const walletActions = require("../common-function/walletTrackTransaction");

module.exports.chal = async (requestData, client) => {
    try {
        logger.info("chal requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CHAL, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.chal != "undefined" && client.chal) return false;

        client.chal = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await PlayingTables.findOne(wh, project).lean();
        logger.info("chal tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("chal user not turn ::", tabInfo);
            delete client.chal;
            return false
        }
        if (tabInfo.turnDone) {
            logger.info("chal : client.su ::", client.seatIndex);
            delete client.chal;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CHAL, requestData, false, "Turn is already taken!");
            return false;
        }
        if (tabInfo.turnSeatIndex != client.seatIndex) {
            logger.info("chal : client.su ::", client.seatIndex);
            delete client.chal;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CHAL, requestData, false, "It's not your turn!");
            return false;
        }

        let playerInfo = tabInfo.playerInfo[client.seatIndex];
        logger.info("\n chal Bet PlayerInfo ::", playerInfo);
        logger.info("\n playerInfo.isSee  ==>", playerInfo.isSee);
        logger.info("\n playerInfo.playerStatus  ==>", playerInfo.playerStatus);

        let currentBet = Number(tabInfo.chalValue);
        logger.info("chal currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("chal UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {}, $inc: {}
        }

        let chalvalue = tabInfo.chalValue;
        logger.info("1 Before chal chalvalue ::", chalvalue);


        if (typeof requestData.isIncrement != "undefined" && requestData.isIncrement) {
            chalvalue = chalvalue * 2;
            logger.info("2 Incriment chal chalvalue ::", chalvalue);
        }
        updateData.$set["chalValue"] = chalvalue;



        if (playerInfo.playerStatus === "blind" && playerInfo.isSee) {
            chalvalue = chalvalue * 2;
            updateData.$set["playerInfo.$.playerStatus"] = "chal"
            // updateData.$set["playerInfo.$.isSee"] = true
            logger.info("3 playerInfo.isSee SEEN PLAYER chalv value =>", playerInfo._id, ' + ', chalvalue);
        } else if (playerInfo.isSee) {
            chalvalue = chalvalue * 2;
        }
        let totalWallet = Number(UserInfo.chips) //+ Number(UserInfo.winningChips)

        if (Number(chalvalue) > Number(totalWallet)) {
            logger.info("chal client.su ::", client.seatIndex);
            delete client.chal;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CHAL, requestData, false, "Please add wallet!!");
            return false;
        }


        chalvalue = Number(Number(chalvalue).toFixed(2))
        logger.info("4 After chal chalvalue ::", chalvalue);

        // await walletActions.deductWallet(client.uid, -chalvalue, CONST.TRANSACTION_TYPE.DEBIT, "TeenPatti chal", tabInfo, client.id, client.seatIndex);
        await walletActions.deductuserWalletGame(client.uid, -chalvalue, CONST.TRANSACTION_TYPE.DEBIT, "TeenPatti chal", "Teen Patti", client.tbid);

        // updateData.$set["chalValue"] = chalvalue;
        updateData.$inc["potValue"] = chalvalue;
        updateData.$set["turnDone"] = true;

        //clear the Schedule
        // commandAcions.clearJob(tabInfo.jobId);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("chal upWh updateData :: ", upWh, updateData);

        const tb = await PlayingTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("chal tb : ", tb);
        logger.info("\n final table chal value: ", tb.chalValue);

        let response = {

            seatIndex: tb.turnSeatIndex,
            chalValue: chalvalue,
            potValue: tb.potValue
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.TEEN_PATTI_CHAL, response);
        delete client.chal;

        if (Number(tb.potLimit) <= Number(tb.potValue)) {
            await checkWinnerActions.autoShow(tb);
        } else {
            let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
            logger.info("chal activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);
            if (activePlayerInRound.length == 1) {
                await gameFinishActions.lastUserWinnerDeclareCall(tb);
            } else {
                await roundStartActions.nextUserTurnstart(tb);
            }
        }
        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}

module.exports.show = async (requestData, client) => {
    try {
        logger.info("show requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_SHOW, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.show != "undefined" && client.show) return false;

        client.show = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await PlayingTables.findOne(wh, project).lean();
        logger.info("show tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("show user not turn ::", tabInfo);
            delete client.show;
            return false
        }
        if (tabInfo.turnDone) {
            logger.info("chal : client.su ::", client.seatIndex);
            delete client.chal;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CHAL, requestData, false, "Turn is already taken!");
            return false;
        }
        if (tabInfo.turnSeatIndex != client.seatIndex) {
            logger.info("show : client.su ::", client.seatIndex);
            delete client.show;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_SHOW, requestData, false, "It's not your turn!");
            return false;
        }

        const playerInGame = await roundStartActions.getPlayingUserInRound(tabInfo.playerInfo);
        logger.info("show userTurnExpaire playerInGame ::", playerInGame);

        if (playerInGame.length != 2) {
            logger.info("show : client.su ::", client.seatIndex);
            delete client.show;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_SHOW, requestData, false, "Not valid show!!");
            return false;
        }

        let playerInfo = tabInfo.playerInfo[client.seatIndex];
        logger.info("show playerInfo ::", playerInfo);

        let currentBet = Number(tabInfo.chalValue);
        logger.info("show currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("show UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {
            },
            $inc: {

            }
        }
        let chalvalue = tabInfo.chalValue;

        if (typeof requestData.isIncrement != "undefined" && requestData.isIncrement) {
            chalvalue = chalvalue * 2;
        }
        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)
        if (Number(chalvalue) > Number(totalWallet)) {
            logger.info("show client.su :: ", client.seatIndex);
            delete client.show;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_SHOW, requestData, false, "Please add wallet!!");
            return false;
        }
        chalvalue = Number(Number(chalvalue).toFixed(2));

        // await walletActions.deductWallet(client.uid, -chalvalue, 3, "TeenPatti show", tabInfo, client.id, client.seatIndex);
        await walletActions.deductuserWallet(client.uid, -chalvalue, CONST.TRANSACTION_TYPE.DEBIT, "TeenPatti show", 'TeenPatti', tabInfo, client.id, client.seatIndex);

        updateData.$set["chalValue"] = chalvalue;
        updateData.$inc["potValue"] = chalvalue;

        //clear jobId schudle
        commandAcions.clearJob(tabInfo.jobId);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("show upWh updateData :: ", upWh, updateData);

        const tb = await PlayingTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("show tb :: ", tb);

        let response = {
            seatIndex: tb.turnSeatIndex,
            chalValue: chalvalue
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.TEEN_PATTI_SHOW, response);
        delete client.show;
        await checkWinnerActions.winnercall(tb, true, tb.turnSeatIndex);
        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}

module.exports.cardPack = async (requestData, client) => {
    try {
        logger.info("PACK requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_PACK, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.pack != "undefined" && client.pack) return false;

        client.pack = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await PlayingTables.findOne(wh, project).lean();
        logger.info("PACK tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("PACK user not turn ::", tabInfo);
            delete client.pack;
            return false
        }
        if (tabInfo.turnSeatIndex != client.seatIndex) {
            logger.info("PACK : client.su ::", client.seatIndex);
            delete client.pack;
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_PACK, requestData, false, "It's not your turn!", "Error!");
            return false;
        }
        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        //clear schedule job
        commandAcions.clearJob(tabInfo.jobId);

        let winner_state = checkUserCardActions.getWinState(playerInfo.cards, tabInfo.hukum);
        let userTrack = {
            _id: playerInfo._id,
            username: playerInfo.username,
            cards: playerInfo.cards,
            seatIndex: client.seatIndex,
            totalBet: playerInfo.totalBet,
            playerStatus: "pack",
            winningCardStatus: winner_state.status
        }

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        const updateData = {
            $set: {
                "playerInfo.$.status": "pack",
                "playerInfo.$.playerStatus": "pack"
            },
            $push: {
                gameTracks: userTrack
            }
        };
        logger.info("PACK upWh updateData :: ", upWh, updateData);

        const tb = await PlayingTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("PACK tb : ", tb);

        let response = {
            seatIndex: tb.turnSeatIndex,
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.TEEN_PATTI_PACK, response);

        let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        logger.info("PACK activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);
        if (activePlayerInRound.length == 1) {
            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        } else {
            await roundStartActions.nextUserTurnstart(tb);
        }
        return true;
    } catch (e) {
        logger.info("Exception PACK : ", e);
    }
}

module.exports.seeCard = async (requestData, client) => {
    try {
        logger.info("seeCard requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.TEEN_PATTI_CARD_SEEN, requestData, false, "1000", "User session not set, please restart game!", "Error!");
            return false;
        }
        const wh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        const project = {
        }
        const tabInfo = await PlayingTables.findOne(wh, project).lean();
        logger.info("seeCard tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("seeCard user not turn ::", tabInfo);
            return false
        }
        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        const updateData = {
            $set: {
                "playerInfo.$.isSee": true
            }
        };
        logger.info("seeCard upWh updateData :: ", upWh, updateData);

        const tb = await PlayingTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("seeCard tb : ", tb);

        let response = {
            cards: playerInfo.cards
        }
        commandAcions.sendEvent(client, CONST.TEEN_PATTI_SEE_CARD_INFO, response);
        let isShow = await roundStartActions.checShowButton(tb.playerInfo, client.seatIndex);

        let response1 = {
            seatIndex: client.seatIndex,
            isShow: isShow
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.TEEN_PATTI_CARD_SEEN, response1);

        return true;
    } catch (e) {
        logger.info("Exception seeCard : ", e);
    }
}