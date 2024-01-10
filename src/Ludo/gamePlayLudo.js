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
        var DiceNumber = this.GetRandomInt(1,6);

        let updateData = {
            $set: {
                playStatus:"rolldice",
                dicenumber:DiceNumber
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
                if(UserInfo.Iscom == 0){
                    // Take turn for kukari 
                }   
            }
        
        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}

module.exports.GetRandomInt = (min, max) =>{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


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

        if (playerInfo.playStatus == "move") {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
            delete client.MOVEKUKARI;
            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
            return false;
        }
        var DiceNumber = this.GetRandomInt(1,6);

        let updateData = {
            $set: {
                playStatus:"movekukari"
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
        commandAcions.sendEventInTable(tb._id.toString(), CONST.MOVEKUKARI, response);
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