const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const _ = require("underscore")
const GameUser = mongoose.model("users");

const CONST = require("../../constant");
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");
const RouletteTables = mongoose.model('RouletteTables');

const walletActions = require("./updateWallet");
const RouletteUserHistory = mongoose.model('RouletteUserHistory');

/*
    bet : 10,
    object:{
        bet:10,
         betaction : 
            {
                "number" : [ 1 ],
                "type":"number",
                "bet":0,

            }

    }
   
    

*/
module.exports.actionSpin = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined"
            || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined"
            || typeof requestData.bet == "undefined"
            || typeof requestData.betaction == "undefined"
            || typeof requestData.betaction.number == "undefined"
        ) {
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONROULETTE, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.action != "undefined" && client.action) return false;


        requestData.betaction.number = JSON.parse(requestData.betaction.number)

        console.log("requestData.betaction. ", requestData.betaction)

        client.action = true;

        const wh = {
            _id: MongoID(client.tbid.toString()),
            //status:"RouletteGameStartTimer"
        }
        const project = {

        }
        const tabInfo = await RouletteTables.findOne(wh, project).lean();
        logger.info("action tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("action user not turn ::", tabInfo);
            delete client.action;
            return false
        }


        let betObjectData = tabInfo.playerInfo[client.seatIndex].betObject;
        let currentBet = Number(requestData.betaction.bet);

        logger.info("action currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("action UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {

            },
            $inc: {

            }
        }
        let chalvalue = currentBet;
        updateData.$set["playerInfo.$.playStatus"] = "action"

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)

        if (Number(chalvalue) > Number(totalWallet)) {
            logger.info("action client.su ::", client.seatIndex);
            delete client.action;
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONROULETTE, requestData, false, "Please add wallet!!");
            return false;
        }
        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.deductWallet(client.uid, -chalvalue, 2, "roulette Bet", "roulette");

        //updateData.$inc["playerInfo.$.selectObj." + requestData.item] = chalvalue;
        let indextoinc = -1
        for (let i = 0; i < betObjectData.length; i++) {
            if (betObjectData[i].betIndex === requestData.betaction.betIndex) {
                indextoinc = i;
                break;
            }
        }

        updateData.$inc["playerInfo.$.totalbet"] = chalvalue;
        if (indextoinc != -1) {
            updateData.$inc["playerInfo.$.betObject." + indextoinc + ".bet"] = chalvalue;
        } else {
            updateData["$push"] = {}
            updateData["$push"]["playerInfo.$.betObject"] = requestData.betaction
        }

        updateData.$inc["totalbet"] = chalvalue;
        updateData.$set["turnDone"] = true;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("action upWh updateData :: ", upWh, updateData);

        const tb = await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            bet: chalvalue,
            betaction: requestData.betaction
        }

        commandAcions.sendEvent(client, CONST.ACTIONROULETTE, response, false, "");


        delete client.action;

        // let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        // logger.info("action activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);
        // if (activePlayerInRound.length == 1) {
        //     await gameFinishActions.lastUserWinnerDeclareCall(tb);
        // } else {
        //     await roundStartActions.nextUserTurnstart(tb);
        // }

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}


/*
    bet : 10,
    object:{
        bet:10,
         betaction : 
            {
                "number" : [ 1 ],
                "type":"number",
                "bet":0,

            }

    }
   
    

*/
module.exports.REMOVEBETROULETTE = async (requestData, client) => {
    try {
        logger.info("REMOVEBETROULETTE requestData : ", requestData);
        if (typeof client.tbid == "undefined"
            || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined"
            || typeof requestData.bet == "undefined"
            || typeof requestData.betaction == "undefined"
            || typeof requestData.betaction.number == "undefined"
        ) {
            commandAcions.sendDirectEvent(client.sck, CONST.REMOVEBETROULETTE, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.REMOVEBETROULETTE != "undefined" && client.REMOVEBETROULETTE) return false;


        requestData.betaction.number = JSON.parse(requestData.betaction.number)

        console.log("requestData.betaction. ", requestData.betaction)

        client.REMOVEBETROULETTE = true;

        const wh = {
            _id: MongoID(client.tbid.toString()),
            //status:"RouletteGameStartTimer"
        }
        const project = {

        }
        const tabInfo = await RouletteTables.findOne(wh, project).lean();
        logger.info("action tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("action user not turn ::", tabInfo);
            delete client.action;
            return false
        }


        let betObjectData = tabInfo.playerInfo[client.seatIndex].betObject;
        let currentBet = Number(requestData.betaction.bet);

        logger.info("action currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("action UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {

            },
            $inc: {

            }
        }
        

        //updateData.$inc["playerInfo.$.selectObj." + requestData.item] = chalvalue;
        let indextoinc = -1
        let leftBetObject = []
        let userbet = []
        for (let i = 0; i < betObjectData.length; i++) {
            if (betObjectData[i].betIndex === requestData.betaction.betIndex) {
                indextoinc = i;
                userbet = betObjectData[i]
            } else {
                leftBetObject.push(betObjectData[i])
            }
        }

        let chalvalue = userbet.bet;
        updateData.$set["playerInfo.$.playStatus"] = "action"

        chalvalue = Number(Number(chalvalue).toFixed(2))

        logger.info("action  : userbet ", userbet);


        if (indextoinc == -1) {
            logger.info("action remove bet UserInfo : ", indextoinc);
            return false
        }

        await walletActions.addWalletAdmin(client.uid, Number(chalvalue), 4, "roulette Clear Bet", "roulette");


        updateData.$inc["playerInfo.$.totalbet"] = -chalvalue;
        if (indextoinc != -1) {
            //updateData.$inc["playerInfo.$.betObject." + indextoinc + ".bet"] = chalvalue;
            //betObjectData = betObjectData.slice()

            updateData.$set["playerInfo.$.betObject"] = leftBetObject
        }

        updateData.$inc["totalbet"] = -chalvalue;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("action upWh updateData :: ", upWh, updateData);

        const tb = await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            betObjectData: tb.playerInfo[client.seatIndex].betObject,
            requestData:requestData
        }

        commandAcions.sendEvent(client, CONST.REMOVEBETROULETTE, response, false, "");


        delete client.REMOVEBETROULETTE;

        // let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        // logger.info("action activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);
        // if (activePlayerInRound.length == 1) {
        //     await gameFinishActions.lastUserWinnerDeclareCall(tb);
        // } else {
        //     await roundStartActions.nextUserTurnstart(tb);
        // }

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}


/*
    bet : 10,
    object:{
        item:0, 
        bet:10,
    }

*/
module.exports.ClearBet = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.ClearBet, requestData, false, "User session not set, please restart game!");
            return false;
        }

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await RouletteTables.findOne(wh, project).lean();
        logger.info("ClearBet tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("ClearBet user not turn ::", tabInfo);

            return false
        }


        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("ClearBet UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {
                "playerInfo.$.selectObj": [
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0,
                    0, 0, 0,
                    0, 0, 0, 0,
                    0, 0
                ],
                "playerInfo.$.betObject": [],
                "playerInfo.$.totalbet": 0,

            },
            $inc: {
                "totalbet": -Number(playerInfo.totalbet)
            }
        }


        await walletActions.addWalletAdmin(client.uid, Number(playerInfo.totalbet), 4, "roulette Clear Bet", "roulette");


        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("action upWh updateData :: ", upWh, updateData);

        const tb = await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            flags: true
        }

        commandAcions.sendEvent(client, CONST.ClearBet, response, false, "");

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}

/*
    bet : 10,
    object:{
        item:0, 
        bet:10,
    }

*/
module.exports.DoubleBet = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.DoubleBet, requestData, false, "User session not set, please restart game!");
            return false;
        }

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await RouletteTables.findOne(wh, project).lean();
        logger.info("DoubleBet tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("DoubleBet user not turn ::", tabInfo);

            return false
        }


        let playerInfo = tabInfo.playerInfo[client.seatIndex];

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("DoubleBet UserInfo : ", gwh, JSON.stringify(UserInfo));

        var chalvalue = playerInfo.betObject.reduce((accumulator, currentValue) => {
            return accumulator.bet + currentValue.bet
        }, 0);

        console.log("chalvalue ", chalvalue)

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)

        if (Number(chalvalue) > Number(totalWallet)) {
            logger.info("DoubleBet client.su ::", client.seatIndex);
            commandAcions.sendDirectEvent(client.sck, CONST.DoubleBet, requestData, false, "Please add wallet!!");
            return false;
        }


        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.deductWallet(client.uid, -chalvalue, 2, "roulette Bet", "roulette");

        let updateData = {
            $set: {

            },
            $inc: {

            }
        }

        // for (let i = 0; i < playerInfo.selectObj.length; i++) {
        //     if (playerInfo.selectObj[i] != 0) {
        //         updateData.$inc["playerInfo.$.selectObj." + i] = playerInfo.selectObj[i];
        //     }
        // }

        for (let i = 0; i < playerInfo.betObject.length; i++) {
            if (playerInfo.betObject[i].bet != undefined) {
                updateData.$inc["playerInfo.$.betObject." + i + ".bet"] = playerInfo.betObject[i].bet;
            }
        }




        updateData.$inc["playerInfo.$.totalbet"] = chalvalue;


        updateData.$inc["totalbet"] = chalvalue;
        updateData.$set["turnDone"] = true;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("action upWh updateData :: ", upWh, updateData);

        const tb = await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            selectObj: tb.playerInfo[client.seatIndex].selectObj,
            totalbet: tb.playerInfo[client.seatIndex].totalbet,
            betObject: tb.playerInfo[client.seatIndex].betObject

        }

        commandAcions.sendEvent(client, CONST.DoubleBet, response, false, "");

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}

// Generate a random whole number between a specified range (min and max)
module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
    bet : 10,
    object:{
        item:0, 
        bet:10,
    }

    neighbor  BET 

*/
module.exports.NEIGHBORBET = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined"
            || typeof client.uid == "undefined"
            || typeof client.seatIndex == "undefined"
        ) {
            commandAcions.sendDirectEvent(client.sck, CONST.NEIGHBORBET, requestData, false, "User session not set, please restart game!");
            return false;
        }


        const tabInfo = await RouletteTables.findOne({}, {}).lean();
        logger.info("NEIGHBORBET tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("NEIGHBORBET user not turn ::", tabInfo);
            return false
        }
        let neighborBet = []
        logger.info("Neighbout Bet Info : ", tabInfo.playerInfo);
        // for (let i = 0; i < tabInfo.playerInfo - 1; i++) {

        //     if (tabInfo.playerInfo[i].si != undefined && parseInt(tabInfo.playerInfo[i].si) != parseInt(client.seatIndex) &&
        //         tabInfo.playerInfo[i].betObject.length > 0) {
        //         neighborBet.push(tabInfo.playerInfo[i].betObject)
        //     }
        // }

        if (parseInt(client.seatIndex) == 0) {
            if (tabInfo.activePlayer > 1) {
                neighborBet = tabInfo.playerInfo[1].betObject
            }
        }
        else if (parseInt(client.seatIndex) == tabInfo.activePlayer - 1) {
            if (tabInfo.activePlayer > 1) {
                neighborBet = tabInfo.playerInfo[0].betObject
            }
        }
        else {
            neighborBet = tabInfo.playerInfo[parseInt(client.seatIndex) - 1].betObject
        }

        logger.info("Neighbout Bet Info : neighborBet ", neighborBet);



        let response = {
            //neighborBet: neighborBet.length > 0 ? neighborBet[this.getRandomInt(0,getRandomInt,length-1)] : []
            neighborBet: neighborBet
        }

        neighborBet = tabInfo.playerInfo[this.getRandomInt(0, tabInfo.activePlayer)].betObject

        commandAcions.sendEvent(client, CONST.NEIGHBORBET, response, false, "");

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}


/*
  Past Bet 

*/
module.exports.PASTBET = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined"
            || typeof client.uid == "undefined"
            || typeof client.seatIndex == "undefined"
        ) {
            commandAcions.sendDirectEvent(client.sck, CONST.PASTBET, requestData, false, "User session not set, please restart game!");
            return false;
        }


        const tabInfo = await RouletteTables.findOne({}, {}).lean();
        logger.info("PASTBET tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("PASTBET user not turn ::", tabInfo);
            return false
        }


        let response = {
            pastbet: tabInfo.playerInfo[client.seatIndex].pastbetObject
        }

        commandAcions.sendEvent(client, CONST.PASTBET, response, false, "");

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}

module.exports.HISTORY = async (requestData, client) => {

    try {

        const tableHistory = await RouletteUserHistory.find({ userId: requestData.playerId }).sort({ createdAt: -1 });

        commandAcions.sendEvent(client, CONST.HISTORY, { tableHistory: tableHistory }, false, "");


    } catch (e) {
        logger.info("Exception HISTORY : ", e);
    }
}