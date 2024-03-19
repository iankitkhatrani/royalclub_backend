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
        console.log("turnSeatIndex ",tabInfo.turnSeatIndex)
        console.log("client.seatIndex ",client.seatIndex)
        console.log("requestData ",requestData)


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

        
        //await roundStartActions.nextUserTurnstart(tb,nextTuner);

        let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        logger.info("chal activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);

        if (activePlayerInRound.length == 1) {
            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        } else {
            if (UserInfo.Iscom == 1) {
                // Take turn for kukari 

                botLogic.PlayRobot(tb,tb.playerInfo[tb.turnSeatIndex],tb.playerInfo[tb.turnSeatIndex],DiceNumber)


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
            logger.info("139  : ", requestData);

            commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.MOVEKUKARI != "undefined" && client.MOVEKUKARI){
            return false
        }

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

        let playerRoutePos = client.seatIndex == 0 ? tabInfo["playerRoutePos1"] : tabInfo["playerRoutePos3"]

        console.log("kya number par kukari 6e ", playerInfo.kukaris[requestData.movekukari])
        //kukari haju home 6e and move number 6 nathi 
        // if (playerInfo.kukaris[requestData.movekukari] == -1 && requestData.movenumber != 6) {
        //     logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
        //     delete client.MOVEKUKARI;
        //     commandAcions.sendDirectEvent(client.sck, CONST.MOVEKUKARI, requestData, false, "It's not your turn!");
        //     return false;
        // }
        console.log("kya number par kukari 6e ", playerInfo.kukarisindex[requestData.movekukari])
        console.log("requestData.movenumber",requestData.movenumber)
        console.log("playerRoutePos.length",playerRoutePos.length)


        // Move no thai home ma java mate na move number nathi so
        if (playerInfo.kukarisindex[requestData.movekukari] + requestData.movenumber > playerRoutePos.length) {
            logger.info("MOVEKUKARI : client.su ::", client.seatIndex);
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

      
        let updateData = {
            $set: {
                playStatus: "movekukari",
            },
            
        }

        if(playerInfo.kukarisindex[requestData.movekukari] == -1){
            updateData["$set"]["playerInfo."+ client.seatIndex+".kukaris." + requestData.movekukari] = playerRoutePos[0]
            updateData["$set"]["playerInfo."+ client.seatIndex+".kukarisindex." + requestData.movekukari] = 0
        }else{
            updateData["$inc"] = {}
            updateData["$set"]["playerInfo."+ client.seatIndex+".kukaris." + requestData.movekukari] = playerRoutePos[(playerInfo.kukarisindex[requestData.movekukari] + requestData.movenumber)]
            updateData["$inc"]["playerInfo."+ client.seatIndex+".kukarisindex." + requestData.movekukari] = requestData.movenumber
        }

        

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
        let oppseat = client.seatIndex == 0 ? 2 : 0;
        //Safe No hoi to j kill karvani 
        logger.info("oppseat  :: ", oppseat);
        logger.info("tb.playerInfo[oppseat]  :: ", tb.playerInfo[oppseat].kukaris);
        logger.info("tb.playerInfo[client.seatIndex].kukaris  :: ", tb.playerInfo[client.seatIndex].kukaris);


        let kukariname = -1
        if (tb.safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k1 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k1"
        }

        if (tb.safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k2 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k2"
        }

        if (tb.safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k3 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k3"
        }

        if (tb.safeDice.indexOf(tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) == -1
            && tb.playerInfo[oppseat].kukaris.k4 == tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari]) {
            kukariname = "k4"
        }
        console.log("kukariname KILLL ",kukariname)
        if (kukariname != -1) {
            let updateData1 = {
                $set: {

                }
            }
            updateData1["$set"]["playerInfo."+ oppseat+".kukaris." + kukariname] = -1
            updateData1["$set"]["playerInfo."+ oppseat+".kukarisindex." + kukariname] = -1


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

            let jobId = commandAcions.GetRandomString(10);
            let delay = commandAcions.AddTime(requestData.movenumber*0.2);
            const delayRes = await commandAcions.setDelay(jobId, new Date(delay));
            
        }

        let winnernumber = client.seatIndex == 0 ? 58 : 70
        // Winner 
        if (tb.playerInfo[client.seatIndex].kukaris.k1 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k2 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k3 == winnernumber
            && tb.playerInfo[client.seatIndex].kukaris.k4 == winnernumber) {


                let updateData = {
                    $set: {
                        playStatus: "win"
                    }
                }

                const upWh1 = {
                    _id: MongoID(client.tbid.toString()),
                    "playerInfo.seatIndex": Number(client.seatIndex)
                }

                const tb1 = await playingLudo.findOneAndUpdate(upWh1, updateData, { new: true });

                //Winner Of Ludo 
                gameFinishActions.winnerDeclareCallLudo([tb1.playerInfo[client.seatIndex]],tb1)
                return false 
        }


        delete client.MOVEKUKARI;

        let activePlayerInRound = await roundStartActions.getPlayingUserInRound(tb.playerInfo);
        logger.info("chal activePlayerInRound :", activePlayerInRound, activePlayerInRound.length);

        if (activePlayerInRound.length == 1) {
            await gameFinishActions.lastUserWinnerDeclareCall(tb);
        } else {
            logger.info("Table Change Tunr ::::::::::::::: ", kukariname);
            let nextTuner =((tb.playerInfo[client.seatIndex].kukaris[requestData.movekukari] == winnernumber) || (parseInt(requestData.movenumber) == 6) || (kukariname != -1)) ? client.seatIndex : -1;

            logger.info("Table Change Tunr :::::::::::::::11111111111nextTuner ",nextTuner,kukariname);

            await roundStartActions.nextUserTurnstart(tb,nextTuner);
        }

        return true;
    } catch (e) {
        logger.info("Exception chal : ", e);
    }
}



module.exports.WinnerOfLudo = async (tb, client) => {



}