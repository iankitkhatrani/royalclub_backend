const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const JantaTables = mongoose.model('JantaTables');
const { sendEvent, sendDirectEvent, AddTime, setDelay, clearJob } = require('../helper/socketFunctions');

const gameStartActions = require("./gameStart");
const CONST = require("../../constant");
const logger = require("../../logger");
const botLogic = require("./botLogic");
const { getToken } = require('../../Agora/RtcTokenBuilderSample');
const leaveTableActions = require('./leaveTable');

module.exports.JANTA_JOIN_TABLE = async (requestData, client) => {
    try {
        if (typeof client.uid == "undefined") {
            sendEvent(client, CONST.JANTA_JOIN_TABLE, requestData, false, "Please restart game!!");
            return false;
        }
        if (typeof client.JT != "undefined" && client.JT) return false;

        client.JT = true;

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("JoinTable UserInfo : ", gwh, JSON.stringify(UserInfo));

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)
        if (Number(totalWallet) < 1) {
            sendEvent(client, CONST.JANTA_JOIN_TABLE, requestData, false, "Please add Wallet!!");
            delete client.JT
            return false;
        }

        let gwh1 = {
            "playerInfo._id": MongoID(client.uid)
        }
        let tableInfo = await JantaTables.findOne(gwh1, {}).lean();
        logger.info("JoinTable tableInfo : ", gwh, JSON.stringify(tableInfo));

        // if (tableInfo != null) {
        //     sendEvent(client, CONST.JANTA_JOIN_TABLE, requestData, false, "Already In playing table!!");
        //     delete client.JT
        //     return false;
        // }
        
        
        // await this.findTable(client,requestData)


        if (tableInfo != null) {
            // sendEvent(client, CONST.ROULETTE_GAME_JOIN_TABLE, requestData, false, "Already In playing table!!");
            // delete client.JT

            await leaveTableActions.leaveTable(
                {
                    reason: 'autoLeave',
                },
                {
                    uid: tableInfo.playerInfo[0]._id.toString(),
                    tbid: tableInfo._id.toString(),
                    seatIndex: tableInfo.playerInfo[0].seatIndex,
                    sck: tableInfo.playerInfo[0].sck,
                }
            );
            await this.findTable(client, requestData)

            return false;
        } else {
            await this.findTable(client, requestData)
        }
    } catch (error) {
        console.info("JANTA_JOIN_TABLE", error);
    }
}

module.exports.findTable = async (client,requestData) => {
    logger.info("findTable  : ");

    let tableInfo = await this.getBetTable();
    logger.info("findTable tableInfo : ", JSON.stringify(tableInfo));
    console.log("tableInfo ", tableInfo)
    await this.findEmptySeatAndUserSeat(tableInfo, client,requestData);
}

module.exports.getBetTable = async () => {
    logger.info("getBetTable  : ");
    let wh = {
        activePlayer: { $gte: 1 }
    }
    logger.info("getBetTable wh : ", JSON.stringify(wh));
    let tableInfo = await JantaTables.find(wh, {}).sort({ activePlayer: 1 }).lean();

    if (tableInfo.length > 0) {
        return tableInfo[0];
    }
    let table = await this.createTable({});
    return table;
}

module.exports.createTable = async () => {
    try {
        let insertobj = {
            gameId: "",
            activePlayer: 0,
            playerInfo: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
            gameState: "",
            history: [],
            cards: [
                "C-1", "C-2", "C-3", "C-4", "C-5", "C-6", "C-7", "C-8", "C-9", "C-10",
                "S-1", "S-2", "S-3", "S-4", "S-5", "S-6", "S-7", "S-8", "S-9", "S-10",
                "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10",
                "H-1", "H-2", "H-3", "H-4", "H-5", "H-6", "H-7", "H-8", "H-9", "H-10"
            ],
            betamount: [1, 5, 10, 50, 100, 500, 1000],
            TableObject: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        };
        logger.info("createTable insertobj : ", insertobj);

        let insertInfo = await JantaTables.create(insertobj);
        logger.info("createTable insertInfo : ", insertInfo);

        return insertInfo;

    } catch (error) {
        logger.error('joinTable.js createTable error=> ', error);

    }
}

module.exports.findEmptySeatAndUserSeat = async (table, client,requestData) => {
    try {
        logger.info("findEmptySeatAndUserSeat table :=> ", table + " client :=> ", client);
        let seatIndex = this.findEmptySeat(table.playerInfo); //finding empty seat
        logger.info("findEmptySeatAndUserSeat seatIndex ::", seatIndex);

        if (seatIndex == "-1") {
            await this.findTable(client)
            return false;
        }

        let user_wh = {
            _id: client.uid
        }
        console.log("user_wh ", user_wh)
        let userInfo = await GameUser.findOne(user_wh, {}).lean();
        logger.info("findEmptySeatAndUserSeat userInfo : ", userInfo)

        // let wh = {
        //     _id : table._id.toString()
        // };
        // let tbInfo = await JantaTables.findOne(wh,{}).lean();
        // logger.info("findEmptySeatAndUserSeat tbInfo : ", tbInfo)
        let totalWallet = Number(userInfo.chips) + Number(userInfo.winningChips)
        let playerDetails = {
            seatIndex: seatIndex,
            _id: userInfo._id,
            playerId: userInfo._id,
            username: userInfo.username,
            profile: userInfo.profileUrl,
            coins: totalWallet,
            status: "",
            playerStatus: "",
            selectObj: [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ], // Select object enter ,
            betObject: [],
            totalbet: 0,
            turnMissCounter: 0,
            turnCount: 0,
            sck: client.id,
            playerSocketId: client.id,
            playerLostChips: 0,
            Iscom: userInfo.Iscom != undefined ? userInfo.Iscom : 0,

        }

        logger.info("findEmptySeatAndUserSeat playerDetails : ", playerDetails);

        let whereCond = {
            _id: MongoID(table._id.toString())
        };
        whereCond['playerInfo.' + seatIndex + '.seatIndex'] = { $exists: false };

        let setPlayerInfo = {
            $set: {
                //gameState: ""
            },
            $inc: {
                activePlayer: 1
            }
        };
        setPlayerInfo["$set"]["playerInfo." + seatIndex] = playerDetails;

        logger.info("findEmptySeatAndUserSeat whereCond : ", whereCond, setPlayerInfo);

        let tableInfo = await JantaTables.findOneAndUpdate(whereCond, setPlayerInfo, { new: true });
        logger.info("\nfindEmptySeatAndUserSeat tbInfo : ", tableInfo);

        let playerInfo = tableInfo.playerInfo[seatIndex];

        if (!(playerInfo._id.toString() == userInfo._id.toString())) {
            await this.findTable(client);
            return false;
        }
        client.seatIndex = seatIndex;
        client.tbid = tableInfo._id;

        logger.info('\n Assign table id and seat index socket event ->', client.seatIndex, client.tbid);
        let diff = -1;

        if (tableInfo.activePlayer >= 2 && tableInfo.gameState === CONST.JANTA_ROUND_START_TIMER) {
            let currentDateTime = new Date();
            let time = currentDateTime.getSeconds();
            let turnTime = new Date(tableInfo.gameTimer.GST);
            let Gtime = turnTime.getSeconds();

            diff = Gtime - time;
            diff += CONST.gameStartTime;
        }

        sendEvent(client, CONST.JANTA_JOIN_TABLE, {}); //JOIN_SIGN_UP
        const tokenNO = getToken(requestData.agoraAppId,requestData.agoraCertificate,tableInfo._id.toString(),0)

        //GTI event
        sendEvent(client, CONST.JANTA_GAME_TABLE_INFO, {
            ssi: tableInfo.playerInfo[seatIndex].seatIndex,
            gst: diff,
            pi: tableInfo.playerInfo,
            utt: CONST.userTurnTimer,
            fns: CONST.finishTimer,
            tableid: tableInfo._id,
            gamePlayType: tableInfo.gamePlayType,
            type: tableInfo.gamePlayType,
            openDecks: tableInfo.openDeck,
            tableAmount: tableInfo.tableAmount,
            tokenNo:tokenNO
        });


        if (userInfo.Iscom == undefined || userInfo.Iscom == 0)
        client.join(tableInfo._id.toString());
    
    sendDirectEvent(client.tbid.toString(), CONST.JANTA_JOIN_TABLE, {
        ap: tableInfo.activePlayer,
        playerDetail: tableInfo.playerInfo[seatIndex],
    });
    console.log(getToken("2882a472e675475fb09710e134a38977","a1e36929d5e84f36b227913768981b82","Unity",0));

        delete client.JT;

        if (tableInfo.gameState == "" && tableInfo.activePlayer == 1) {

            let jobId = "LEAVE_SINGLE_USER:" + tableInfo._id;
            clearJob(jobId)
            setTimeout(async () => {
                await gameStartActions.gameTimerStart(tableInfo);
            }, 1000)
        }
        // else{

        //     if(tableInfo.activePlayer <= 2){
        //         setTimeout(()=>{
        //             botLogic.JoinRobot(tableInfo)
        //         },2000)
        //     }
        // }

        //}
    } catch (error) {
        console.info("findEmptySeatAndUserSeat", error);
    }
}

module.exports.findEmptySeat = (playerInfo) => {
    for (x in playerInfo) {
        if (typeof playerInfo[x] == 'object' && playerInfo[x] != null && typeof playerInfo[x].seatIndex == 'undefined') {
            return parseInt(x);
            break;
        }
    }
    return '-1';
}