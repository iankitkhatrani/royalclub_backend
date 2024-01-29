const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const IdCounter = mongoose.model("idCounter")

const commandAcions = require("../helper/socketFunctions");
const CONST = require("../../constant");
const logger = require("../../logger");
const roundStartActions = require("./roundStart");
const walletActions = require("./updateWallet");
const RouletteTables = mongoose.model('RouletteTables');
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
                gameState: "RouletteGameStartTimer",
                "gameTimer.GST": new Date(),
                "totalbet":0,
                "playerInfo.$.selectObj":[
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,0,0,0,
                    0,0,
                    0,0,0,
                    0,0,0,0,
                    0,0
                ],
                "isFinalWinner":false,
                uuid: uuidv4(),
            }
        }
        logger.info("gameTimerStart UserInfo : ", wh, update);

        const tabInfo = await RouletteTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("gameTimerStart tabInfo :: ", tabInfo);

        let roundTime = 10;
        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.GAME_START_TIMER, { timer: roundTime,history:tabInfo.history });

        let tbId = tabInfo._id;
        let jobId = CONST.GAME_START_TIMER + ":" + tbId;
        let delay = commandAcions.AddTime(roundTime);

        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

        setTimeout(async ()=>{
            this.StartSpinnerGame(tbId)
        },2000)

        

    } catch (error) {
        logger.error("gameTimerStart.js error ->", error)
    }
}

module.exports.StartSpinnerGame = async (tbId) => {

    try {

        const tb = await RouletteTables.findOne({
            _id: MongoID(tbId.toString()),
        }, {})

        logger.info("RouletteGameStartTimer tbId : ", tb);
        if (tb == null || tb.gameState != "RouletteGameStartTimer") return false;


        //Genrate Rendom Number 
        logger.info("RouletteGameStartTimer GAMELOGICCONFIG.SPIN : ", GAMELOGICCONFIG.SPIN);
        logger.info("RouletteGameStartTimer tb.totalbet : ", tb.TableObject);

        // NORMAL 
        let itemObject = this.getRandomInt(0,36)

        // if(CONST.SORATLOGIC == "Client"){ // Client SIDE
        //     if(tb.totalbet >= 5){
        //          Number = this.generateNumber()
        //     }else if(tb.totalbet < 5){
        //          Number = this.generateNumber()
        //     }
        // }else if(CONST.SORATLOGIC == "User"){  // User SIDE
        //      Number = this.generateNumber()
        // }   
        console.log("itemObject ",itemObject)
        
        let wh = {
            _id: tbId
        }
        let update = {
            $set: {
                gameState: "StartSpinner",
                itemObject:itemObject,
                turnStartTimer:new Date()
            },
            $push:{
                "history": {
                    $each: [itemObject],
                    $slice: -7
                }
            }
        }
        logger.info("startSpinner UserInfo : ", wh, update);

        const tabInfo = await RouletteTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("startSpinner tabInfo :: ", tabInfo);

        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.STARTSPINNER, { itemObject: itemObject,timelimit:10 });

        setTimeout(async ()=> {
            // Clear destory 
            // const tabInfonew = await RouletteTables.findOneAndUpdate(wh, {
            //     $set: {
            //         gameState: "",
            //         itemObject:""
            //     }
            // }, { new: true });

            this.winnerSpinner(tabInfo,itemObject);
        },10000);

        //botLogic.PlayRobot(tabInfo,tabInfo.playerInfo,itemObject)

    } catch (error) {
        logger.error("RouletteTables.js error ->", error)
    }
}       

// Generate a random whole number between a specified range (min and max)
module.exports.getRandomInt = (min, max) =>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.winnerSpinner = async (tabInfo, itemObject) =>{

    try {
        logger.info("winnerSorat winner ::  -->", itemObject, tabInfo);
        let tbid = tabInfo._id.toString()
        logger.info("winnerSorat tbid ::", tbid);

        const tb = await RouletteTables.findOne({
            _id: MongoID(tbid.toString()),
        }, {})
        console.log("winnerSpinner tb ",tb)
        if (typeof itemObject == "undefined" || (typeof tb != "undefined" && tb.playerInfo.length == 0)) {
            logger.info("winnerSpinner winner ::", itemObject);
            logger.info("winnerSpinner winner tb.playerInfo.length ::", tb.playerInfo.length);

            return false;
        }

        if (tabInfo.gameState != "StartSpinner") return false;
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

        const tbInfo = await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("winnerSorat tbInfo : ", tbInfo);

        let winnerData = [

        ]

        let itemIndex = itemObject
        console.log("itemIndex ",itemIndex)
        for (let i = 0; i < tbInfo.playerInfo.length; i++) {
            if(tbInfo.playerInfo[i].seatIndex != undefined){

                var TotalWinAmount = 0 
                if(tbInfo.playerInfo[i].selectObj[itemIndex] != 0){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[itemIndex] * 10,
                    })

                    TotalWinAmount = tbInfo.playerInfo[i].selectObj[itemIndex] * 10;
                }
                // [
                //     "0","1","2","3","4",
                //     "5","6","7","8","9",
                //     "10","11","12","13","14",
                //     "15","16","17","18","19",
                //     "20","21","22","23","24",
                //     "25","26","27","28","29",
                //     "30","31","32","33","34",
                //     "35","36",
                //     "1st12","2nd12","3rd12",
                //     "1to18","19to36",
                //     "even","odd",
                //     "red","black"
                //      37,38,39
                //      40,41,
                //      42,43,
                //      44,45          
                // ]

                // Old  tem
                if(tbInfo.playerInfo[i].selectObj[37] != 0 && itemIndex >= 1  && itemIndex <= 12){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[37] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[37] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[38] != 0 && itemIndex >= 13  && itemIndex <= 24){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[38] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[38] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[39] != 0 && itemIndex >= 25  && itemIndex <= 36){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[39] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[39] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[40] != 0 && itemIndex >= 1  && itemIndex <= 18){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[40] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[40] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[41] != 0 && itemIndex >= 18  && itemIndex <= 36){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[41] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[41] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[42] != 0 && itemIndex%2 == 0){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[42] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[42] * 2;
                }


                if(tbInfo.playerInfo[i].selectObj[43] != 0 && itemIndex%2 == 1){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[43] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[43] * 2;
                }

                if(tbInfo.playerInfo[i].selectObj[44] != 0 && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].indexOf(itemIndex) != -1){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[44] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[44] * 2;
                }
               
                if(tbInfo.playerInfo[i].selectObj[45] != 0 && [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].indexOf(itemIndex) != -1){
                    winnerData.push({
                        uid:tbInfo.playerInfo[i]._id,
                        seatIndex:tbInfo.playerInfo[i].seatIndex,
                        winAmount:tbInfo.playerInfo[i].selectObj[45] * 2,
                    })
                    TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[45] * 2;
                }

                console.log("TotalWinAmount ",TotalWinAmount)

                TotalWinAmount != 0 && await walletActions.addWallet(tbInfo.playerInfo[i]._id, Number(TotalWinAmount), 4, "Roulette Win", tabInfo,"","","roulette");
            }
        }
        const playerInGame = await roundStartActions.getPlayingUserInRound(tbInfo.playerInfo);
        logger.info("getWinner playerInGame ::", playerInGame);

        

        //const winnerTrack = await gameTrackActions.gamePlayTracks(winnerIndexs, tbInfo.gameTracks, tbInfo);
        //logger.info("winnerDeclareCall winnerTrack:: ", winnerTrack);

        // for (let i = 0; i < tbInfo.gameTracks.length; i++) {
        //     if (tbInfo.gameTracks[i].playStatus == "win") {
        //         await walletActions.addWallet(tbInfo.gameTracks[i]._id, Number(winnerTrack.winningAmount), 4, "Sorat Win", tabInfo);
        //     }
        // }

      
        commandAcions.sendEventInTable(tbInfo._id.toString(), CONST.ROULETTEWINNER, {
            WinnerData:winnerData,
            itemObject:itemObject
        });

        let jobId = CONST.BNW_GAME_START_TIMER + ":" + tbInfo._id.toString();
        let delay = commandAcions.AddTime(5);

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

                await walletActions.deductWallet(playerInfo[i]._id,-Number(tabInfo.boot), 1, "Sorat Bet", tabInfo, playerInfo[i].sck, playerInfo[i].seatIndex,"Spinner");

                let update = {
                    $inc: {
                        "potValue": Number(tabInfo.boot),
                        "playerInfo.$.totalBet": Number(tabInfo.boot)
                    }
                }
                let uWh = { _id: MongoID(tabInfo._id.toString()), "playerInfo.seatIndex": Number(playerInfo[i].seatIndex) }
                logger.info("deduct uWh update ::", uWh, update)
                await RouletteTables.findOneAndUpdate(uWh, update, { new: true });
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
                await RouletteTables.findOneAndUpdate(uWh, update, { new: true });
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