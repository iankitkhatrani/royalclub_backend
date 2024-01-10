const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;

const playingLudo = mongoose.model("playingLudo");
const GameUser = mongoose.model("users");

const CONST = require("../../constant");
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");
const roundStartActions = require("./roundStart");
const gameFinishActions = require("./gameFinish");
const checkWinnerActions = require("./checkWinner");
const checkUserCardActions = require("./checkUserCard");

const walletActions = require("./updateWallet");


module.exports.RollDice = async (requestData, client) => {
    try {
        logger.info("RollDice requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.RollDice, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.RollDice != "undefined" && client.RollDice) return false;

        client.RollDice = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await playingLudo.findOne(wh, project).lean();
        logger.info("RollDice tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("RollDice user not turn ::", tabInfo);
            delete client.RollDice;
            return false
        }
        if (tabInfo.turnDone) {
            logger.info("RollDice : client.su ::", client.seatIndex);
            delete client.RollDice;
            commandAcions.sendDirectEvent(client.sck, CONST.RollDice, requestData, false, "Turn is already taken!");
            return false;
        }
        if (tabInfo.turnSeatIndex != client.seatIndex) {
            logger.info("RollDice : client.su ::", client.seatIndex);
            delete client.RollDice;
            commandAcions.sendDirectEvent(client.sck, CONST.RollDice, requestData, false, "It's not your turn!");
            return false;
        }

        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("RollDice UserInfo : ", gwh, JSON.stringify(UserInfo));

        if (playerInfo.playStatus == "rolldice") {
            logger.info("RollDice : client.su ::", client.seatIndex);
            delete client.RollDice;
            commandAcions.sendDirectEvent(client.sck, CONST.RollDice, requestData, false, "It's not your turn!");
            return false;
        }
        var DiceNumber = this.GetRandomInt(1, 6);

        let updateData = {
            $set: {
                playStatus: "rolldice",
                dicenumber: DiceNumber
            }
        }

        //commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("chal upWh updateData :: ", upWh, updateData);

        const tb = await playingLudo.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("chal tb : ", tb);

        let response = {
            seatIndex: tb.turnSeatIndex,
            dicenumber: DiceNumber
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.RollDice, response);
        delete client.RollDice;

        let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        logger.info("chal activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);

        if (activePlayerInRound.length == 1) {
            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        } else {
            if (UserInfo.Iscom == 0) {
                // Take turn for kukari 
            }
        }

        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}

module.exports.GetRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*
    requestData
    movenumber : 5,
    movekukari: b1 ,
    
*/
module.exports.MOVEKUKARI = async (requestData, client) => {
    try {
        logger.info("MOVEKUKARI requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.MOVEKUKARI != "undefined" && client.MOVEKUKARI) return false;

        client.MOVEKUKARI = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await playingLudo.findOne(wh, project).lean();
        logger.info("MOVEKUKARI tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("MOVEKUKARI user not turn ::", tabInfo);
            delete client.MOVEKUKARI;
            return false
        }
        if (tabInfo.turnDone) {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "Turn is already taken!");
            return false;
        }
        if (tabInfo.turnSeatIndex != client.seatIndex) {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
            return false;
        }

        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("MOVEKUKARI UserInfo : ", gwh, JSON.stringify(UserInfo));

        let playerRoutePos = client.seatIndex == 0 ? "playerRoutePos1" : "playerRoutePos3"

        console.log("kya number par kukari 6e ", playerInfo.kukaris[requestData.movekukari])
        //kukari haju home 6e and move number 6 nathi 
        if (playerInfo.kukaris[requestData.movekukari] == -1 && requestData.movenumber != 6) {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
            return false;
        }
        console.log("kya number par kukari 6e ", playerInfo.kukarisindex[requestData.movekukari])
        // Move no thai home ma java mate na move number nathi so
        if (playerInfo.kukarisindex[requestData.movekukari] + movenumber > playerRoutePos.length) {
            ogger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
            return false;
        }


        if (playerInfo.playStatus == "movekukari") {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
            return false;
        }

        var DiceNumber = this.GetRandomInt(1, 6);

        let updateData = {
            $set: {
                playStatus: "movekukari",

            },
            $inc: {

            }
        }
        updateData["playerInfo.kukaris." + requestData.movekukari] = movenumber
        updateData["playerInfo.kukarisindex." + requestData.movekukari] = movenumber

        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("chal upWh updateData :: ", upWh, updateData);

        const tb = await playingLudo.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("chal tb : ", tb);

        let response = {
            seatIndex: tb.turnSeatIndex,
            movekukari: requestData.movekukari,
            kukari: tb.playerInfo[client.seatIndex].kukaris,
            kukarisindex: tb.playerInfo[client.seatIndex].kukarisindex
        }
        commandAcions.sendEventInTable(tb._id.toString(), CONST.MOVEKUKARI, response);

        // Kill 
        // Opp User Kukari same place 
        let oppseat = client.seatIndex == 0 ? 1 : 0;
        //Safe No hoi to j kill karvani 
        let kukariname = -1
        if (tb.playerInfo[client.seatIndex].safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k1 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k1"
        }

        if (tb.playerInfo[client.seatIndex].safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k2 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k2"
        }

        if (tb.playerInfo[client.seatIndex].safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k3 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k3"
        }

        if (tb.playerInfo[client.seatIndex].safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k4 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k4"
        }

        if (kukariname == "") {
            let updateData1 = {
                $inc: {

                }
            }
            updateData1["playerInfo.kukaris." + kukariname] = -1
            updateData1["playerInfo.kukarisindex." + kukariname] = -1


            const upWh1 = {
                _id: MongoID(client.tbid.toString()),
                "playerInfo.seatIndex": Number(oppseat)
            }

            const tb1 = await playingLudo.findOneAndUpdate(upWh1, updateData1, { new: true });
            logger.info("chal tb : ", tb);


            let response = {
                kukariname: kukariname,
                movekukari: -1,
                kukari: tb1.playerInfo[oppseat].kukaris,
                kukarisindex: tb1.playerInfo[oppseat].kukarisindex
            }

            commandAcions.sendEventInTable(tb1._id.toString(), CONST.KILLKUKARI, response);
        }
        let winnernumber = client.seatIndex == 0 ? 57 : 69
        // Winner 
        if (tb.playerInfo[client.seatIndex].kukaris.k1 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k2 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k3 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k4 == winnernumber) {

                //Winner Of Ludo 

                return false 
        }


        delete client.MOVEKUKARI;

        let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        logger.info("chal activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);

        if (activePlayerInRound.length == 1) {
            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        } else {
            await roundStartActions.nextUserTurnstart(tb);
        }

        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}