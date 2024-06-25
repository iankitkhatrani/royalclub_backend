const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const IdCounter = mongoose.model("idCounter")
const _ = require("underscore")
const commandAcions = require("../helper/socketFunctions");
const CONST = require("../../constant");
const logger = require("../../logger");
const roundStartActions = require("./roundStart");
const walletActions = require("./updateWallet");
const WinwalletActions = require("../roulette/updateWallet");
const JantaTables = mongoose.model('JantaTables');
// const leaveTableActions = require("./leaveTable");
const { v4: uuidv4 } = require('uuid');


module.exports.gameTimerStart = async (tb) => {
    try {
        logger.info("gameTimerStart tb : ", tb);
        if (tb.gameState != "" && tb.gameState != "WinnerDecalre") return false;

        let wh = {
            _id:MongoID(tb._id),
            "playerInfo._id": {$exists:true}
        }
        let update = {
            $set: {
                gameState: "JantaGameStartTimer",
                "gameTimer.GST": new Date(),
                "totalbet":0,
                "playerInfo.$.selectObj": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "playerInfo.$.betObject": [],
                "isFinalWinner":false,
                sumofcard:-1,
                opencards:[],
                uuid: uuidv4(),
            }
        }
        logger.info("gameTimerStart UserInfo : ", wh, update);

        const tabInfo = await JantaTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("gameTimerStart tabInfo :: ", tabInfo);

        let roundTime = 3;
        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.JANTA_GAME_START_TIMER, { timer: roundTime,history:tabInfo.history });

        let tbId = tabInfo._id;
        let jobId = CONST.JANTA_GAME_START_TIMER + ":" + tbId;
        let delay = commandAcions.AddTime(roundTime);

        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

        setTimeout(async ()=>{
            this.StartJantaGame(tbId)
        },500)

        

    } catch (error) {
        logger.error("gameTimerStart.js error ->", error)
    }
}

module.exports.StartJantaGame = async (tbId) => {

    try {

        const tb = await JantaTables.findOne({
            _id: MongoID(tbId.toString()),
        }, {})

        logger.info("StartJantaGame tbId : ", tb);
        if (tb == null || tb.gameState != "JantaGameStartTimer") return false;


        //Genrate Rendom Number 
        logger.info("StartJantaGame GAMELOGICCONFIG.JANTA : ", GAMELOGICCONFIG.JANTA);
        logger.info("StartJantaGame tb.totalbet : ", tb.cards);

        // NORMAL 
        let cards = _.shuffle(tb.cards).slice(0, 3);
        
        let sumofcard = cards.reduce((accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.split("-")[1] == "10"?0:currentValue.split("-")[1])
        },0);

        // if(CONST.SORATLOGIC == "Client"){ // Client SIDE
        //     if(tb.totalbet >= 5){
        //          Number = this.generateNumber()
        //     }else if(tb.totalbet < 5){
        //          Number = this.generateNumber()
        //     }
        // }else if(CONST.SORATLOGIC == "User"){  // User SIDE
        //      Number = this.generateNumber()
        // }   
        let WinnerNumber = -1
        if(sumofcard.toString().length > 1){
            WinnerNumber  = sumofcard.toString()[1]
        }else{
            WinnerNumber = sumofcard.toString()

        }

        console.log("WinnerNumber ::::::::::::::::",WinnerNumber)
        
        let wh = {
            _id: tbId
        }
        let update = {
            $set: {
                gameState: "StartJanta",
                sumofcard:WinnerNumber,
                opencards:cards,
                turnStartTimer:new Date()
            },
            $push:{
                "history": {
                    $each: [WinnerNumber],
                    $slice: -7
                }
            }
        }
        logger.info("StartJanta UserInfo : ", wh, update);

        const tabInfo = await JantaTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("StartJanta tabInfo :: ", tabInfo);

        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.JANTA_ROUND_START_TIMER, { opencards: cards,sumofcard:WinnerNumber,timelimit:30 });

        setTimeout(async ()=> {
            
            this.winnerJanta(tabInfo,WinnerNumber);
        },31000);

        //botLogic.PlayRobot(tabInfo,tabInfo.playerInfo,itemObject)

    } catch (error) {
        logger.error("StartJantaGame.js error ->", error)
    }
}       

// Generate a random whole number between a specified range (min and max)
module.exports.getRandomInt = (min, max) =>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.winnerJanta = async (tabInfo, itemObject) =>{

    try {
        logger.info("winnerSorat winner ::  -->", itemObject, tabInfo);
        let tbid = tabInfo._id.toString()
        logger.info("winnerSorat tbid ::", tbid);

        logger.info("winnerSorat tbselectObjid ::", tabInfo.playerInfo[0].selectObj);


        const tb = await JantaTables.findOne({
            _id: MongoID(tbid.toString()),
        }, {})
        console.log("winner JANTA tb ",tb)
        if (typeof itemObject == "undefined" || (typeof tb != "undefined" && tb.playerInfo.length == 0)) {
            logger.info("winner JANTA  winner ::", itemObject);
            logger.info("winner JANTA  winner tb.playerInfo.length ::", tb.playerInfo.length);

            return false;
        }

        if (tabInfo.gameState != "StartJanta") return false;
        if (tabInfo.isFinalWinner) return false;

        const upWh = {
            _id: tbid
        }
        const updateData = {
            $set: {
                "isFinalWinner": true,
                gameState: "WinnerDecalre",
            }
        };
        logger.info("winnerSorat upWh updateData :: ", upWh, updateData);

        const tbInfo = await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("winnerSorat tbInfo : ", tbInfo);

        let winnerData = [

        ]

        let itemIndex = tbInfo.TableObject.indexOf(itemObject)
        console.log("itemIndex ",itemIndex)
        for (let i = 0; i < tbInfo.playerInfo.length; i++) {
            if (tbInfo.playerInfo[i].seatIndex != undefined) {
                //"playerInfo.$.betObject": [],
                let betObjectData = tbInfo.playerInfo[i].betObject;
                var TotalWinAmount = 0;
                var TotalBetAmount = 0;
                if (tbInfo.playerInfo[i].betObject.length > 0) {
                    const upWh = {
                        _id: MongoID(tbid),
                        "playerInfo.seatIndex": tbInfo.playerInfo[i].seatIndex
                    }
                    const updateData = {
                        $set: {
                            "playerInfo.$.pastbetObject": tbInfo.playerInfo[i].betObject,
                        }
                    };
                    logger.info("winnerSorat upWh updateData :: ", upWh, updateData);

                    await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
                }
                logger.info("winnerJanta Data :  ", tbInfo.playerInfo[i].selectObj[itemIndex] , tbInfo.playerInfo[i].selectObj[itemIndex] * 9);
                

                for (let j = 0; j < betObjectData.length; j++) {
                    if (betObjectData[j].bet != undefined) {

                        
                        if (betObjectData[j].type == "NORMAL" && parseInt(betObjectData[j].item) == parseInt(itemObject)) {
                          
                            console.log("betObjectData[j] ",betObjectData[j])

                            TotalWinAmount = TotalWinAmount + betObjectData[j].bet * 9;

                            console.log("TotalWinAmount normal", TotalWinAmount)
                            TotalBetAmount = TotalBetAmount + betObjectData[j].bet
                        }

                        if (betObjectData[j].type == "sixtozeroc" && [0,6,7,8,9].indexOf(parseInt(itemObject)) != -1) {
                          
                            console.log("betObjectData[j] ",betObjectData[j])

                            TotalWinAmount = (TotalWinAmount + ((betObjectData[j].bet/5) * 9));

                            console.log("TotalWinAmount normal", TotalWinAmount)
                            TotalBetAmount = TotalBetAmount + betObjectData[j].bet

                        }

                        

                        if (betObjectData[j].type == "onetofive" && [1,2,3,4,5].indexOf(parseInt(itemObject)) != -1) {
                          
                            console.log("betObjectData[j] ",betObjectData[j])

                            TotalWinAmount = (TotalWinAmount + ((betObjectData[j].bet/5) * 9));

                            console.log("TotalWinAmount normal", TotalWinAmount)
                            TotalBetAmount = TotalBetAmount + betObjectData[j].bet

                        }
                        

                        

                        if (betObjectData[j].type == "Odd" && itemObject%2 == 1) {
                            console.log("betObjectData[j] ", betObjectData[j])


                            TotalWinAmount = (TotalWinAmount + ((betObjectData[j].bet/5) * 9));
                            console.log("TotalWinAmount odd", TotalWinAmount)
                            TotalBetAmount = TotalBetAmount + betObjectData[j].bet

                        }

                        if (betObjectData[j].type == "Even" && itemObject%2 == 0) {
                            console.log("betObjectData[j] ", betObjectData[j])


                            TotalWinAmount = (TotalWinAmount + ((betObjectData[j].bet/5) * 9));
                            TotalBetAmount = TotalBetAmount + betObjectData[j].bet


                            console.log("TotalWinAmount even", TotalWinAmount)

                        }
                    }


                }
                console.log("TotalWinAmount ", TotalWinAmount)
                
             
        

                if (TotalWinAmount != 0) {
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:TotalWinAmount,
                    })

                    await WinwalletActions.addWalletAdmin(tbInfo.playerInfo[i]._id, Number(TotalWinAmount), 4, "Janta Win", "Janta");
                }
                
                
                
                // if(tbInfo.playerInfo[i].selectObj[itemIndex] != -1){
                //     


                //     //await walletActions.addWallet(tbInfo.playerInfo[i]._id, Number(tbInfo.playerInfo[i].selectObj[itemIndex] * 9), 4, "Janta Win", tabInfo,"","","Janta");
                //     await WinwalletActions.addWalletAdmin(tbInfo.playerInfo[x]._id, Number(tbInfo.playerInfo[i].selectObj[itemIndex] * 9), 4, "Janta Win", "Janta");
                // }
               
                
            }
        }
        const playerInGame = await roundStartActions.getPlayingUserInRound(tbInfo.playerInfo);
        logger.info("getWinner playerInGame ::", playerInGame);

      
        commandAcions.sendEventInTable(tbInfo._id.toString(), CONST.JANTAWINNER, {
            WinnerData:winnerData,
            itemObject:itemObject
        });

        let jobId = CONST.JANTA_GAME_START_TIMER + ":" + tbInfo._id.toString();
        let delay = commandAcions.AddTime(7);

        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

        await this.gameTimerStart(tbInfo);

    } catch (err) {
        logger.info("Exception  WinnerDeclareCall : 1 :: ", err)
    }

}


//===================
module.exports.deduct = async (tabInfo, playerInfo) => {
    try {

        logger.info("\ndeduct playerInfo :: ", playerInfo);
        let seatIndexs = [];
        for (let i = 0; i < playerInfo.length; i++) {
            if (playerInfo[i] != {} && typeof playerInfo[i].seatIndex != "undefined" && playerInfo[i].status == "play") {
                seatIndexs.push(playerInfo[i].seatIndex);

                await walletActions.deductWallet(playerInfo[i]._id,-Number(tabInfo.boot), 1, "Sorat Bet", tabInfo, playerInfo[i].sck, playerInfo[i].seatIndex,"Janta");

                let update = {
                    $inc: {
                        "potValue": Number(tabInfo.boot),
                        "playerInfo.$.totalBet": Number(tabInfo.boot)
                    }
                }
                let uWh = { _id: MongoID(tabInfo._id.toString()), "playerInfo.seatIndex": Number(playerInfo[i].seatIndex) }
                logger.info("deduct uWh update ::", uWh, update)
                await JantaTables.findOneAndUpdate(uWh, update, { new: true });
            }
        }
        return seatIndexs
    } catch (error) {
        logger.error("deduct error ->", error)
    }
}

module.exports.resetUserData = async (tbId, playerInfo) => {
    try {

        for (let i = 0; i < playerInfo.length; i++)
            if (typeof playerInfo[i].seatIndex != "undefined") {
                let update = {
                    $set: {
                        "playerInfo.$.status": "play",
                        "playerInfo.$.playStatus": "blind",
                        "playerInfo.$.chalValue": 0,
                        "playerInfo.$.cards": [],
                        "playerInfo.$.turnMissCounter": 0,
                        "playerInfo.$.turnDone": false,
                        "playerInfo.$.turnCount": 0,
                    }
                }
                playerInfo[i].status = "play";
                let uWh = { _id: MongoID(tbId.toString()), "playerInfo.seatIndex": Number(playerInfo[i].seatIndex) }
                logger.info("updateUserState uWh update ::", uWh, update)
                await JantaTables.findOneAndUpdate(uWh, update, { new: true });
            }

        logger.info("updateUserState playerInfo::", playerInfo, playerInfo.length);
        let playerInfos = await roundStartActions.getPlayingUserInRound(playerInfo);
        logger.info("updateUserState playerInfos::", playerInfos)
        return playerInfos;
    } catch (error) {
        logger.error("resetUserData error ->", error)
    }
}

module.exports.checkUserInRound = async (playerInfo, tb) => {
    try {

        let userIds = [];
        let userSeatIndexs = {};
        for (let i = 0; i < playerInfo.length; i++) {
            userIds.push(playerInfo[i]._id);
            userSeatIndexs[playerInfo[i]._id.toString()] = playerInfo[i].seatIndex;
        }
        logger.info("checkUserState userIds ::", userIds, userSeatIndexs);
        let wh = {
            _id: {
                $in: userIds
            }
        }
        let project = {
            chips: 1,
            winningChips: 1,
            sck: 1,
        }
        let userInfos = await GameUser.find(wh, project);
        logger.info("checkUserState userInfos :: ", userInfos);

        let userInfo = {};

        for (let i = 0; i < userInfos.length; i++)
            if (typeof userInfos[i]._id != "undefined") {
                let totalWallet = Number(userInfos[i].chips) + Number(userInfos[i].winningChips)
                userInfo[userInfos[i]._id] = {
                    coins: totalWallet,
                }
            }

        for (let i = 0; i < userInfos.length; i++)
            if (typeof userInfos[i]._id != "undefined") {
                if (Number(userInfo[userInfos[i]._id.toString()].coins) < (Number(tb.boot))) {
                    await leaveTableActions.leaveTable({
                        reason: "wallet_low"
                    }, {
                        _id: userInfos[i]._id.toString(),
                        tbid: tb._id.toString(),
                        seatIndex: userSeatIndexs[userInfos[i]._id.toString()],
                        sck: userInfos[i].sck,
                    })
                    //delete index frm array
                    playerInfo.splice(userSeatIndexs[userInfos[i]._id.toString()], 1);
                    delete userSeatIndexs[userInfos[i]._id.toString()];
                }
            }

        return playerInfo;
    } catch (error) {
        logger.error("checkUserInRound error ->", error)
    }
}

module.exports.getCount = async (type) => {
    let wh = {
        type: type
    }
    let update = {
        $set: {
            type: type
        },
        $inc: {
            counter: 1
        }
    }
    logger.info("\ngetUserCount wh : ", wh, update);

    let resp2 = await IdCounter.findOneAndUpdate(wh, update, { upsert: true, new: true });
    return resp2.counter;
}