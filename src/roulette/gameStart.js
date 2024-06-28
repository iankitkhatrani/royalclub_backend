const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const IdCounter = mongoose.model("idCounter")
const _ = require("underscore")
const commandAcions = require("../helper/socketFunctions");
const CONST = require("../../constant");
const logger = require("../../logger");
const roundStartActions = require("./roundStart");
const RouletteTables = mongoose.model('RouletteTables');
const RouletteUserHistory = mongoose.model('RouletteUserHistory');

const walletActions = require("../common-function/walletTrackTransaction");

const gamePlayActionsRoulette = require('./gamePlay');
const adminwinloss = mongoose.model('adminwinloss');


// const leaveTableActions = require("./leaveTable");
const { v4: uuidv4 } = require('uuid');

module.exports.gameTimerStart = async (tb) => {
    try {
        logger.info("gameTimerStart tb : ", tb);
        if (tb.gameState != "" && tb.gameState != "WinnerDecalre") return false;

        let wh = {
            _id: MongoID(tb._id)
        }
        let update = {
            $set: {
                gameState: "RouletteGameStartTimer",
                "gameTimer.GST": new Date(),
                "totalbet": 0,
                "playerInfo.0.selectObj": [
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
                "playerInfo.0.betObject": [],
                "playerInfo.0.totalbet": 0,
                "isFinalWinner": false,
                uuid: uuidv4(),
            }
        }
        logger.info("gameTimerStart UserInfo : ", wh, update);

        const tabInfo = await RouletteTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("gameTimerStart tabInfo :: ", tabInfo);

        let roundTime = CONST.BLUETABLETIMER;

        // if (tabInfo.whichTable == "blueTable")
        //     roundTime = CONST.BLUETABLETIMER;
        // else
        //     roundTime = CONST.GREENTABLETIMER;


        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.ROULETTE_GAME_START_TIMER, { timer: roundTime, history: tabInfo.history });

        let tbId = tabInfo._id;
        let jobId = CONST.ROULETTE_GAME_START_TIMER + ":" + tbId;
        let delay = commandAcions.AddTime(roundTime);

        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

        setTimeout(async () => {
            this.StartSpinnerGame(tbId)
        }, 1000)



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
        logger.info("RouletteGameStartTimer GAMELOGICCONFIG.SPIN : ", GAMELOGICCONFIG.ROULETTE);
        logger.info("DAY DAY.DAY : ", GAMELOGICCONFIG.DAY);

        logger.info("RouletteGameStartTimer tb.totalbet : ", tb.TableObject);

        // // NORMAL 
        // let itemObject = this.getRandomInt(0, 36)

        // // if(CONST.SORATLOGIC == "Client"){ // Client SIDE
        // //     if(tb.totalbet >= 5){
        // //          Number = this.generateNumber()
        // //     }else if(tb.totalbet < 5){
        // //          Number = this.generateNumber()
        // //     }
        // // }else if(CONST.SORATLOGIC == "User"){  // User SIDE
        // //      Number = this.generateNumber()
        // // }   
        // console.log("itemObject ", itemObject)

        // NORMAL 

        let TotalPlayerBetInfo = []
        let TotalAllPlayer = []

        for (let i = 0; i < tb.playerInfo.length; i++) {
            if (tb.playerInfo[i].betObject != undefined) {
                for (let x = 0; x < tb.playerInfo[i].betObject.length; x++) {

                    if (tb.playerInfo[i].betObject[x] != undefined && tb.playerInfo[i].betObject[x].type == "number") {
                        TotalPlayerBetInfo.push(tb.playerInfo[i].betObject[x])
                    }

                    TotalAllPlayer.push(tb.playerInfo[i].betObject[x])
                }
            }
        }
        let MustPlay = ""
        if (GAMELOGICCONFIG.ROULETTE == "User" && TotalAllPlayer.length <= 5) {
            MustPlay = "Client"
        }

        logger.info("RouletteGameStartTimer MustPlay: ", MustPlay);


        logger.info("RouletteGameStartTimer GAMELOGICCONFIG.SPIN : ", GAMELOGICCONFIG.ROULETTE);

        logger.info("RouletteGameStartTimer MustPlay: ", MustPlay);

        let betObjectData = TotalPlayerBetInfo //tb.playerInfo[0].betObject;
        let itemObject = -1
        let AdminWinlossData = []
        if (GAMELOGICCONFIG.DAY != undefined && GAMELOGICCONFIG.DAY != 1) {
            let datebeforecount = this.AddTimeLAST(-((GAMELOGICCONFIG.DAY-1)* 86400));

            logger.info("datebeforecount ", datebeforecount)

            //let currentdata = gamePlayActionsRoulette.CreateDate(new Date())


            AdminWinlossData = await adminwinloss.find({ createdAt: { $gte: new Date(datebeforecount) } })
        } else {
            let currentdata = gamePlayActionsRoulette.CreateDate(new Date())
            AdminWinlossData = await adminwinloss.find({ date: currentdata })
        }

        logger.info("AdminWinlossData ", AdminWinlossData)

        let totalWin = (AdminWinlossData.length > 0) ? AdminWinlossData.reduce((total, num) => {return total + Math.round(num.win);}, 0) : 0
        let totalLoss = (AdminWinlossData.length > 0) ? AdminWinlossData.reduce((total, num) => {return total + Math.round(num.loss);}, 0) : 0
        let perwin = 100 - ((totalLoss * 100) / totalWin)

        logger.info("totalWin", totalWin);
        logger.info("totalLoss", totalLoss);
        logger.info("((totalLoss * 100)/totalWin)", ((totalLoss * 100) / totalWin));
        logger.info("perwin", perwin);
        logger.info("GAMELOGICCONFIG.PERCENTAGE", GAMELOGICCONFIG.PERCENTAGE);


        if (GAMELOGICCONFIG.PERCENTAGE != undefined && GAMELOGICCONFIG.PERCENTAGE != -1 && perwin < GAMELOGICCONFIG.PERCENTAGE) {
            MustPlay = "Client"
        }

        if (GAMELOGICCONFIG.BLUEFIXNUMBERWON != undefined && GAMELOGICCONFIG.BLUEFIXNUMBERWON != -1 && GAMELOGICCONFIG.BLUEFIXNUMBERWON >= 0 && GAMELOGICCONFIG.BLUEFIXNUMBERWON <= 36) {
            itemObject = GAMELOGICCONFIG.BLUEFIXNUMBERWON
        } 
        // else if (tb.whichTable == "greenTable" && GAMELOGICCONFIG.GREENFIXNUMBERWON != undefined && GAMELOGICCONFIG.GREENFIXNUMBERWON != -1 && GAMELOGICCONFIG.GREENFIXNUMBERWON >= 0 && GAMELOGICCONFIG.GREENFIXNUMBERWON <= 36) {
        //     itemObject = GAMELOGICCONFIG.GREENFIXNUMBERWON
        // } 
        else if (MustPlay == "Client" || GAMELOGICCONFIG.ROULETTE == "Client") {
            itemObject = this.getRandomInt(0, 36)
            totalnmber = []
            // Remove TotalNumber for Bet 

            for (let i = 0; i < TotalAllPlayer.length; i++) {
                if (TotalAllPlayer[i].bet != undefined) {
                    totalnmber.push(TotalAllPlayer[i].number)
                }
            }
            totalnmber = _.flatten(totalnmber)

            logger.info("totalnmber ", totalnmber)


            let notselectnumber = _.difference([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], totalnmber)

            logger.info("notselectnumber ", notselectnumber)


            itemObject = notselectnumber.length > 0 ? notselectnumber[this.getRandomInt(0, notselectnumber.length - 1)] : itemObject
        } else if (GAMELOGICCONFIG.ROULETTE == "User") {

            betObjectData.sort((e, f) => {
                return e.bet - f.bet;
            })

            // [2024-05-22T05:35:51.163] [INFO] development - betObjectData [
            //     { number: [ 7 ], type: 'number', bet: 2, betIndex: '7' },
            //     { number: [ 2 ], type: 'number', bet: 100, betIndex: 2 },
            //     { number: [ 3 ], type: 'number', bet: 100, betIndex: 3 },
            //     { number: [ 1 ], type: 'number', bet: 100, betIndex: 1 },
            //     { number: [ 4 ], type: 'number', bet: 100, betIndex: 4 },
            //     { number: [ 5 ], type: 'number', bet: 100, betIndex: 5 },
            //     { number: [ 6 ], type: 'number', bet: 100, betIndex: 6 },
            //     { number: [ 7 ], type: 'number', bet: 500, betIndex: '7' }
            //   ]


            logger.info("betObjectData", betObjectData)

            itemObject = betObjectData.length > 0 && betObjectData[0].number != undefined ? _.flatten(betObjectData[0].number)[0] : this.getRandomInt(0, 36)

        } else {
            itemObject = this.getRandomInt(0, 36)
        }

        let wh = {
            _id: tbId
        }
        let update = {
            $set: {
                gameState: "StartSpinner",
                itemObject: itemObject,
                turnStartTimer: new Date()
            },
            $push: {
                "history": {
                    $each: [itemObject],
                    $slice: -14
                }
            }
        }
        logger.info("startSpinner UserInfo : ", wh, update);

        const tabInfo = await RouletteTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("startSpinner tabInfo :: ", tabInfo);


        let winnerData = [

        ]

        let itemIndex = itemObject;

        logger.info("itemIndex", itemIndex);


        for (let x = 0; x < tabInfo.playerInfo.length; x++) {
            if (tabInfo.playerInfo[x].seatIndex != undefined && tabInfo.playerInfo[x].betObject != undefined) {

                let betObjectData = tabInfo.playerInfo[x].betObject;

                for (let i = 0; i < betObjectData.length; i++) {
                    if (betObjectData[i].bet != undefined) {

                        if (betObjectData[i].type == "number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 35,
                            })
                        }

                        if (betObjectData[i].type == "1to34" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }

                        if (betObjectData[i].type == "2to35" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }


                        if (betObjectData[i].type == "3to36" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }

                        if (betObjectData[i].type == "1st12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }

                        if (betObjectData[i].type == "2nd12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }

                        if (betObjectData[i].type == "3rd12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 3,
                            })
                        }

                        if (betObjectData[i].type == "1to18" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }


                        if (betObjectData[i].type == "19to36" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }

                        if (betObjectData[i].type == "odd" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }

                        if (betObjectData[i].type == "even" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }


                        if (betObjectData[i].type == "red" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }

                        if (betObjectData[i].type == "black" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 2,
                            })
                        }


                        if (betObjectData[i].type == "2_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 17.5,
                            })
                        }


                        if (betObjectData[i].type == "3_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 11.66,
                            })
                        }

                        if (betObjectData[i].type == "4_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 8.75,
                            })
                        }


                        if (betObjectData[i].type == "6_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tabInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: betObjectData[i].bet * 5.83,
                            })
                        }
                    }
                }
            }
        }


        commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.START_ROULETTE, { itemObject: itemObject,winnerData:winnerData, timelimit: 10 });

        setTimeout(async () => {
            // Clear destory 
            // const tabInfonew = await RouletteTables.findOneAndUpdate(wh, {
            //     $set: {
            //         gameState: "",
            //         itemObject:""
            //     }
            // }, { new: true });

            this.winnerSpinner(tabInfo);
        }, 15000);

        //botLogic.PlayRobot(tabInfo,tabInfo.playerInfo,itemObject)

    } catch (error) {
        logger.error("RouletteTables.js error ->", error)
    }
}

module.exports.AddTimeLAST = (t) => {
    try {
        const ut = new Date();
        ut.setUTCHours(23);
        ut.setUTCMinutes(59);
        ut.setUTCSeconds(0);
        ut.setSeconds(ut.getSeconds() + Number(t));

        ut.setUTCHours(0);
        ut.setUTCMinutes(0);
        ut.setUTCSeconds(0);
        ut.setUTCMilliseconds(0);



        return ut;
    } catch (error) {
        logger.error('socketFunction.js AddTime error :--> ' + error);
    }
};

// Generate a random whole number between a specified range (min and max)
module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.winnerSpinner = async (tabInfo) => {

    try {
        logger.info("winnerSorat winner ::  -->", tabInfo);
        let tbid = tabInfo._id.toString()
        logger.info("winnerSorat tbid ::", tbid);

        const tb = await RouletteTables.findOne({
            _id: MongoID(tbid.toString()),
        }, {})
        console.log("winnerSpinner tb ", tb)

        console.log("winnerSpinner tb.itemObject ", tb.itemObject)


        if (typeof tb.itemObject == "undefined" || (typeof tb != "undefined" && tb.playerInfo.length == 0)) {
            logger.info("winnerSpinner winner ::", tb.itemObject);
            logger.info("winnerSpinner winner tb.playerInfo.length ::", tb.playerInfo.length);

            return false;
        }

        if (tabInfo.gameState != "StartSpinner") return false;
        if (tabInfo.isFinalWinner) return false;

        let itemObject = tb.itemObject
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

        let itemIndex = itemObject;

        logger.info("itemIndex", itemIndex);


        for (let x = 0; x < tbInfo.playerInfo.length; x++) {
            if (tbInfo.playerInfo[x].seatIndex != undefined && tbInfo.playerInfo[x].betObject != undefined) {

                let betObjectData = tbInfo.playerInfo[x].betObject;
                var TotalWinAmount = 0
                var TotalBetAmount = 0


                console.log("pastbetObject Winner ",betObjectData)
                const upWh = {
                    _id: MongoID(tbid),
                    "playerInfo.seatIndex": tbInfo.playerInfo[x].seatIndex
                }
                const updateData = {
                    $set: {
                        "playerInfo.$.pastbetObject": betObjectData,
                        "playerInfo.$.betObject": [],
                        "playerInfo.$.totalbet": 0,
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
                        ]
                    }
                };
                logger.info("winnerSorat upWh updateData :: ", upWh, updateData);

                await RouletteTables.findOneAndUpdate(upWh, updateData, { new: true });

                for (let i = 0; i < betObjectData.length; i++) {
                    if (betObjectData[i].bet != undefined) {

                        console.log("betObjectData[i] ",betObjectData[i])

                        if (betObjectData[i].type == "number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 35) ,
                            })

                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 35;
                        }

                        if (betObjectData[i].type == "1to34" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 3) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }

                        if (betObjectData[i].type == "2to35" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 3) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }


                        if (betObjectData[i].type == "3to36" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 3) ,
                            })
                           
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }

                        if (betObjectData[i].type == "1st12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 3) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }

                        if (betObjectData[i].type == "2nd12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 3 ),
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }

                        if (betObjectData[i].type == "3rd12" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount:( betObjectData[i].bet * 3 ),
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 3;
                        }

                        if (betObjectData[i].type == "1to18" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 2) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }


                        if (betObjectData[i].type == "19to36" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 2) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }

                        if (betObjectData[i].type == "odd" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 2) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }

                        if (betObjectData[i].type == "even" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 2 ),
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }


                        if (betObjectData[i].type == "red" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount:( betObjectData[i].bet * 2 ),
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }

                        if (betObjectData[i].type == "black" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount:( betObjectData[i].bet * 2) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 2;
                        }


                        if (betObjectData[i].type == "2_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount:( betObjectData[i].bet * 17.5) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 17.5;
                        }


                        if (betObjectData[i].type == "3_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 11.66) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 11.66;
                        }

                        if (betObjectData[i].type == "4_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount:( betObjectData[i].bet * 8.75) ,
                            })
                            
                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 8.75;
                        }


                        if (betObjectData[i].type == "6_number" && betObjectData[i].number.indexOf(itemIndex) != -1) {
                            winnerData.push({
                                uid: tbInfo.playerInfo[x]._id,
                                seatIndex: 0,
                                winAmount: (betObjectData[i].bet * 5.83),
                            })

                            TotalWinAmount = TotalWinAmount + betObjectData[i].bet * 5.83;
                        }


                    }


                }
                console.log("TotalWinAmount ", TotalWinAmount)

                TotalWinAmount != 0 && await walletActions.addUserWalletGame(tbInfo.playerInfo[x]._id,Number(TotalWinAmount),"credit", "roulette Win","Roulette",tbInfo._id);

                
                gamePlayActionsRoulette.AdminWinLossData(Number(TotalWinAmount), "loss")

                let insertobj = {
                    userId: tbInfo.playerInfo[x]._id.toString(),
                    ballposition: itemIndex,
                    beforeplaypoint: tbInfo.playerInfo[x].coins +  tbInfo.playerInfo[x].totalbet,
                    play: tbInfo.playerInfo[x].totalbet,
                    won: TotalWinAmount,
                    afterplaypoint: tbInfo.playerInfo[x].coins + TotalWinAmount,
                    uuid: tbInfo.uuid,
                    betObjectData:betObjectData

                };
                console.log("RouletteUserHistory ", insertobj)
                await RouletteUserHistory.create(insertobj);
            }
        }

        console.log("itemIndex ", itemIndex)
        // for (let i = 0; i < tbInfo.playerInfo.length; i++) {
        //     if(tbInfo.playerInfo[i].seatIndex != undefined){

        //         var TotalWinAmount = 0 
        //         if(tbInfo.playerInfo[i].selectObj[itemIndex] != 0){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[itemIndex] * 35,
        //             })

        //             TotalWinAmount = tbInfo.playerInfo[i].selectObj[itemIndex] * 35;
        //         }
        //         // [
        //         //     "0","1","2","3","4",
        //         //     "5","6","7","8","9",
        //         //     "10","11","12","13","14",
        //         //     "15","16","17","18","19",
        //         //     "20","21","22","23","24",
        //         //     "25","26","27","28","29",
        //         //     "30","31","32","33","34",
        //         //     "35","36",
        //         //     "1 to 34" , "2 - 35" , "3 - 36",   
        //         //     "1st12","2nd12","3rd12",
        //         //     "1to18","19to36",
        //         //     "odd","even",
        //         //     "red","black"
        //         //      37,38,39,
        //         //      40,41,42
        //         //      43,44,
        //         //      45,46   
        //         //      47 48       
        //         // ]

        //         // 1 to 34 
        //         if(tbInfo.playerInfo[i].selectObj[37] != 0 && [1,4,7,10,13,16,19,22,25,28,31,34].indexOf(itemIndex) != -1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[37] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[37] * 2;
        //         }

        //         //2 to 35
        //         if(tbInfo.playerInfo[i].selectObj[38] != 0 && [2,5,8,11,14,17,20,23,26,29,32,35].indexOf(itemIndex) != -1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[38] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[38] * 2;
        //         }

        //         //3 to 36
        //         if(tbInfo.playerInfo[i].selectObj[39] != 0 && [3,6,9,12,15,18,21,24,27,30,33,36].indexOf(itemIndex) != -1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[39] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[39] * 2;
        //         }

        //         //1 to 12
        //         if(tbInfo.playerInfo[i].selectObj[40] != 0 && itemIndex >= 1  && itemIndex <= 12){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[40] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[40] * 2;
        //         }

        //         //13 to 24
        //         if(tbInfo.playerInfo[i].selectObj[41] != 0 && itemIndex >= 13  && itemIndex <= 24){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[41] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[41] * 2;
        //         }

        //         //25 to 36
        //         if(tbInfo.playerInfo[i].selectObj[42] != 0 && itemIndex >= 25  && itemIndex <= 36){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[42] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[42] * 2;
        //         }

        //         //1 to 18
        //         if(tbInfo.playerInfo[i].selectObj[43] != 0 && itemIndex >= 1  && itemIndex <= 18){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[43] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[43] * 2;
        //         }

        //         //19 to 36
        //         if(tbInfo.playerInfo[i].selectObj[44] != 0 && itemIndex >= 18  && itemIndex <= 36){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[44] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[44] * 2;
        //         }

        //         // Odd 
        //         if(tbInfo.playerInfo[i].selectObj[45] != 0 && itemIndex%2 == 1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[45] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[45] * 2;
        //         }

        //         // Even
        //         if(tbInfo.playerInfo[i].selectObj[46] != 0 && itemIndex%2 == 0){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[46] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[46] * 2;
        //         }

        //         // Red
        //         if(tbInfo.playerInfo[i].selectObj[47] != 0 && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].indexOf(itemIndex) != -1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[47] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[47] * 2;
        //         }
        //         //Black
        //         if(tbInfo.playerInfo[i].selectObj[48] != 0 && [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].indexOf(itemIndex) != -1){
        //             winnerData.push({
        //                 uid:tbInfo.playerInfo[i]._id,
        //                 seatIndex:tbInfo.playerInfo[i].seatIndex,
        //                 winAmount:tbInfo.playerInfo[i].selectObj[48] * 2,
        //             })
        //             TotalWinAmount = TotalWinAmount + tbInfo.playerInfo[i].selectObj[48] * 2;
        //         }

        //         // 49 to 105 

        //         console.log("TotalWinAmount ",TotalWinAmount)

        //         TotalWinAmount != 0 && await walletActions.addWalletAdmin(tbInfo.playerInfo[i]._id, Number(TotalWinAmount), 4, "Roulette Win", tabInfo,"","","roulette");
        //     }
        // }


        const playerInGame = await roundStartActions.getPlayingUserInRound(tbInfo.playerInfo);
        logger.info("getWinner playerInGame ::", playerInGame);



        //const winnerTrack = await gameTrackActions.gamePlayTracks(winnerIndexs, tbInfo.gameTracks, tbInfo);
        //logger.info("winnerDeclareCall winnerTrack:: ", winnerTrack);

        // for (let i = 0; i < tbInfo.gameTracks.length; i++) {
        //     if (tbInfo.gameTracks[i].playStatus == "win") {
        //         await walletActions.addWalletAdmin(tbInfo.gameTracks[i]._id, Number(winnerTrack.winningAmount), 4, "Sorat Win", tabInfo);
        //     }
        // }





        commandAcions.sendEventInTable(tbInfo._id.toString(), CONST.ROULETTEWINNER, {
            WinnerData: winnerData,
            itemObject: itemObject
        });

        let jobId = CONST.BNW_GAME_START_TIMER + ":" + tbInfo._id.toString();
        let delay = commandAcions.AddTime(5);

        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

        await this.gameTimerStart(tbInfo);

    } catch (err) {
        logger.info("Exception  WinnerDeclareCall : 1 :: ", err)
    }

}

module.exports.generateRandomNumber = (length) => {
    let randomNumber = '';
    for (let i = 0; i < length; i++) {
        randomNumber += Math.floor(Math.random() * 10); // Generates a random digit from 0 to 9
    }
    return randomNumber;
}
