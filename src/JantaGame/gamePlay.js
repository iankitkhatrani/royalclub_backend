const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;

const GameUser = mongoose.model("users");

const CONST = require("../../constant");
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");
const JantaTables = mongoose.model('JantaTables');

const walletActions = require("./updateWallet");

/*
    bet : 10,
    object:{
        item:0,    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        bet:10,
        type:"NORMAL" || Odd || Even || onetofive || sixtozero
    }

*/
module.exports.actionJanta = async (requestData, client,callback) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined" || typeof requestData.bet == "undefined" || typeof requestData.type == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONJANTA, requestData, false, "User session not set, please restart game!");
            if (typeof callback == "function") {
                return callback("error")
            }
            return false;
        }
        if (typeof client.action != "undefined" && client.action){
            if (typeof callback == "function") {
                return callback("error")
            }
            return false;
        } 

        client.action = true;

        const wh = {
            _id: MongoID(client.tbid.toString()),
            //status:"JantaGameStartTimer"
        }
        const project = {

        }
        const tabInfo = await JantaTables.findOne(wh, project).lean();
        logger.info("action tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("action user not turn ::", tabInfo);
            delete client.action;
            if (typeof callback == "function") {
                return callback("error")
            }
            return false
        }


        let playerInfo = tabInfo.playerInfo[client.seatIndex];
        let currentBet = Number(requestData.bet);

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
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONJANTA, requestData, false, "Please add wallet!!");
            if (typeof callback == "function") {
                return callback("error")
            }
            return false;
        }
        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.deductWallet(client.uid, -chalvalue, 2, "Janta Bet", tabInfo, client.id, client.seatIndex, "Janta");

        if (requestData.type == "NORMAL") {
            updateData.$inc["playerInfo.$.selectObj." + requestData.item] = chalvalue;
        } else if (requestData.type == "Odd") {
            updateData.$inc["playerInfo.$.selectObj.1"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.3"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.5"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.7"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.9"] = chalvalue / 5;

        } else if (requestData.type == "Even") {
            updateData.$inc["playerInfo.$.selectObj.2"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.4"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.6"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.8"] = chalvalue / 5;
        } else if (requestData.type == "onetofive") {
            updateData.$inc["playerInfo.$.selectObj.1"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.2"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.3"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.4"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.5"] = chalvalue / 5;
        } else if (requestData.type == "sixtozero") {
            updateData.$inc["playerInfo.$.selectObj.6"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.7"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.8"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.9"] = chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.0"] = chalvalue / 5;
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

        const tb = await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            bet: chalvalue,
            item: requestData.item,
            type: requestData.type,
            betAnimationType: requestData.betAnimationType
        }

        commandAcions.sendEvent(client, CONST.ACTIONJANTA, response, false, "");


        delete client.action;

        if (typeof callback == "function") {
            return callback("error")
        }

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}


/*
    bet : 10,
    object:{
        item:0,    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        bet:10,
        type:"NORMAL" || Odd || Even || onetofive || sixtozero
    }
}
*/
module.exports.REMOVEBETJANTA = async (requestData, client) => {
    try {
        logger.info("REMOVEBETJANTA requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined" || typeof requestData.bet == "undefined" || typeof requestData.type == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.REMOVEBETJANTA, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.REMOVEBETJANTA != "undefined" && client.REMOVEBETJANTA) return false;

        client.REMOVEBETJANTA = true;

        const wh = {
            _id: MongoID(client.tbid.toString())
        }
        const project = {

        }
        const tabInfo = await JantaTables.findOne(wh, project).lean();
        logger.info("REMOVEBETJANTA tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("REMOVEBETJANTA user not turn ::", tabInfo);
            delete client.REMOVEBETJANTA;
            return false
        }


        let currentBet = Number(requestData.bet);

        logger.info("REMOVEBETJANTA currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("REMOVEBETJANTA UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {

            },
            $inc: {

            }
        }
        let chalvalue = currentBet;

        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.addWallet(client.uid, chalvalue, 2, "Janta Bet Return", tabInfo, client.id, client.seatIndex, "Janta");

        if (requestData.type == "NORMAL") {
            updateData.$inc["playerInfo.$.selectObj." + requestData.item] = -chalvalue;
        } else if (requestData.type == "Odd") {
            updateData.$inc["playerInfo.$.selectObj.1"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.3"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.5"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.7"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.9"] = -chalvalue / 5;

        } else if (requestData.type == "Even") {
            updateData.$inc["playerInfo.$.selectObj.2"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.4"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.6"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.8"] = -chalvalue / 5;
        } else if (requestData.type == "onetofive") {
            updateData.$inc["playerInfo.$.selectObj.1"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.2"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.3"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.4"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.5"] = -chalvalue / 5;
        } else if (requestData.type == "sixtozero") {
            updateData.$inc["playerInfo.$.selectObj.6"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.7"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.8"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.9"] = -chalvalue / 5;
            updateData.$inc["playerInfo.$.selectObj.0"] = -chalvalue / 5;
        }

        updateData.$inc["playerInfo.$.totalbet"] = -chalvalue;


        updateData.$inc["totalbet"] = -chalvalue;
        updateData.$set["turnDone"] = true;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("REMOVEBETJANTA upWh updateData :: ", upWh, updateData);

        const tb = await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("REMOVEBETJANTA tb : ", tb);

        let response = {
            bet: chalvalue,
            item: requestData.item,
            type: requestData.type,
            betAnimationType: requestData.betAnimationType
        }

        commandAcions.sendEvent(client, CONST.REMOVEBETJANTA, response, false, "");


        delete client.REMOVEBETJANTA;



        return true;
    } catch (e) {
        logger.info("Exception REMOVEBETJANTA : ", e);
    }
}


/*  
    bet:120,
    object:{
        item:0,    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        type:"NORMAL" || Odd || Even || onetofive || sixtozero
    }

*/
module.exports.ClearBetJANTA = async (requestData, client) => {
    try {
        logger.info("ClearBetJANTA requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.ClearBetJANTA, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.ClearBetJANTA != "undefined" && client.ClearBetJANTA) return false;

        client.ClearBetJANTA = true;

        const wh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        const project = {
            "playerInfo.$":1
        }
        const tabInfo = await JantaTables.findOne(wh, project).lean();
        logger.info("ClearBetJANTA tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("ClearBetJANTA user not turn ::", tabInfo);
            delete client.ClearBetJANTA;
            return false
        }


        let currentBet = Number(tabInfo.playerInfo[0].totalbet);

        logger.info("ClearBetJANTA currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("ClearBet UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {

            },
            $inc: {

            }
        }
        let chalvalue = currentBet;

        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.addWallet(client.uid, chalvalue, 2, "Janta Bet Return", tabInfo, client.id, client.seatIndex, "Janta");

        // if (requestData.type == "NORMAL") {
        //     updateData.$inc["playerInfo.$.selectObj." + requestData.item] = -chalvalue;
        // } else if (requestData.type == "Odd") {
        //     updateData.$inc["playerInfo.$.selectObj.1"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.3"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.5"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.7"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.9"] = -chalvalue / 5;

        // } else if (requestData.type == "Even") {
        //     updateData.$inc["playerInfo.$.selectObj.2"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.4"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.6"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.8"] = -chalvalue / 5;
        // } else if (requestData.type == "onetofive") {
        //     updateData.$inc["playerInfo.$.selectObj.1"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.2"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.3"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.4"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.5"] = -chalvalue / 5;
        // } else if (requestData.type == "sixtozero") {
        //     updateData.$inc["playerInfo.$.selectObj.6"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.7"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.8"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.9"] = -chalvalue / 5;
        //     updateData.$inc["playerInfo.$.selectObj.0"] = -chalvalue / 5;
        // }

        updateData.$set["playerInfo.$.selectObj"] = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        updateData.$set["playerInfo.$.totalbet"] = 0;


        updateData.$inc["totalbet"] = -chalvalue;
        updateData.$set["turnDone"] = true;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("ClearBetJANTA upWh updateData :: ", upWh, updateData);

        const tb = await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("ClearBetJANTA tb : ", tb);

        let response = {
        }

        commandAcions.sendEvent(client, CONST.ClearBetJANTA, response, false, "");

        delete client.ClearBetJANTA;
        return true;
    } catch (e) {
        logger.info("Exception ClearBetJANTA : ", e);
    }
}

/*
    playerId:""
    tbid:""

*/
module.exports.PASTBET = async (requestData, client) => {
    try {
        logger.info("PASTBET requestData : ", requestData);
        if (typeof requestData.playerId == "undefined"
        ) {
            commandAcions.sendDirectEvent(client.sck, CONST.PASTBETJANTA, requestData, false, "User session not set, please restart game!");
            return false;
        }

        logger.info("requestData.playerId : ", requestData.playerId);
        const PlayerInfo = await JantaTables.findOne({ _id: MongoID(requestData.tableId) , "playerInfo._id": MongoID(requestData.playerId) }, {"playerInfo.$":1})
        logger.info("PASTBET PlayerInfo : ", PlayerInfo);

        if (PlayerInfo == null) {
            logger.info("PASTBET user not turn ::", PlayerInfo);
            return false
        }

        this.BETACTIONCALL(PlayerInfo.playerInfo[0].pastbetObject, client, 0)

        let response = {
            userbet: PlayerInfo.playerInfo[0].pastbetObject
        }

        commandAcions.sendEvent(client, CONST.PASTBETJANTA, response, false, "");

        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}


// /*
//   Past Bet SAVE
//     pastbetObject
// */
// module.exports.PASTBETSAVE = async (requestData, client) => {
//     try {
//         logger.info("PASTBETSAVE requestData : ", requestData);
//         if (typeof client.tbid == "undefined"
//             || typeof client.uid == "undefined"
//             || typeof client.seatIndex == "undefined"
//             || typeof requestData.pastbetObject == "undefined"

//         ) {
//             commandAcions.sendDirectEvent(client.sck, CONST.PASTBETSAVE, requestData, false, "User session not set, please restart game!");
//             return false;
//         }


//         const upWh = {
//             _id: MongoID(client.uid)
//         }
//         let updateData = {}

//         updateData = {
//             $set: {
//                 "pastbetObject": requestData.pastbetObject
//             }
//         };

//         logger.info("PASTBETSAVE upWh updateData :: ", upWh, updateData);

//         let userInfo = await GameUser.findOneAndUpdate(upWh, updateData, { new: true });

//         if (userInfo == null) {
//             logger.info("PASTBETSAVE user not turn ::", userInfo);
//             return false
//         }


//         let response = {
//             pastbetObject: userInfo.pastbetObject
//         }

//         commandAcions.sendEvent(client, CONST.PASTBETSAVE, response, false, "");

//         return true;
//     } catch (e) {
//         logger.info("Exception action : ", e);
//     }
// }

// payload :::::::::::::::: {
//     eventName: 'ACTIONROULETTE',
//     data: {
//       tableId: '66507cc8d77e055964e42305',
//       playerId: '664c7085201e9907f3d31a8b',
//       bet: 1000,
//       betaction: {
//         number: '[1,2,3,4,5,6]',
//         type: '6_number',
//         bet: 1000,
//         betIndex: '145'
//       }
//     }
//   }

module.exports.BETACTIONCALL = async (pastbetObject, client, x) => {

    try {

        if (x >= pastbetObject.length) {
            return false;
        }

        let userBet = pastbetObject[x]
        console.log("userBet ", userBet)
        console.log("pastbetObject ", pastbetObject)
        if (userBet != 0) {
            this.actionJanta({
                tableId: client.tbid,
                playerId: client.uid,
                bet: userBet,
                // data: {
                //     "item": x,
                //     "bet": userBet,
                //     "type": "NORMAL"
                // }
                item: x,
                    bet: userBet,
                    type: "NORMAL"
            }, client, (d) => {
                x = x + 1
                this.BETACTIONCALL(pastbetObject, client, x)

            })
        } else {
            x = x + 1
            this.BETACTIONCALL(pastbetObject, client, x)
        }

    } catch (e) {
        logger.info("BETACTIONCALL BETACTIONCALL : ", e);
    }
}




