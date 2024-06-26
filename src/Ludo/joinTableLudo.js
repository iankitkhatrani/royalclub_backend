const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const playingLudo = mongoose.model("playingLudo");
const BetListsLudo = mongoose.model("betListLudo")
const PrivateBetListsLudo = mongoose.model("betListLudoPrivate")

const { sendEvent, sendDirectEvent, AddTime, setDelay, clearJob } = require('../helper/socketFunctions');

const gameStartActions = require("./gameStartLudo");
const CONST = require("../../constant");
const logger = require("../../logger");
const botLogic = require("./botLogic");
const { getToken } = require('../../Agora/RtcTokenBuilderSample');

const leaveTableActions = require('./leaveTable');
module.exports.joinTable = async (requestData, client) => {
    try {
        logger.info("requestData Ludo", requestData);

        if (typeof client.uid == "undefined") {
            sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Please restart game!!");
            return false;
        }
        if (typeof client.JT != "undefined" && client.JT) return false;

        client.JT = true;
        console.log("requestData ", requestData)
        let bwh = {
            _id: requestData.betId
        }
        const BetInfo = await BetListsLudo.findOne(bwh, {}).lean();
        logger.info("Join Table data : ", JSON.stringify(BetInfo));

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("JoinTable UserInfo : ", gwh, JSON.stringify(UserInfo));

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)

        console.log("BetInfo ", BetInfo)

        if (Number(totalWallet) < Number(BetInfo.entryFee)) {
            sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Please add Wallet!!");
            delete client.JT
            return false;
        }

        let gwh1 = {
            "playerInfo._id": MongoID(client.uid)
        }
        let tableInfo = await playingLudo.findOne(gwh1, { 'playerInfo.$': 1 }).lean();
        logger.info("JoinTable tableInfo : ", gwh, JSON.stringify(tableInfo));

        if (tableInfo != null) {
            // sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Already In playing table!!");
            // delete client.JT


            await leaveTableActions.leaveTableLudo(
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
            await this.findTable(BetInfo, client, requestData)

            return false;
        } else {
            await this.findTable(BetInfo, client, requestData)
        }
    } catch (error) {
        console.info("JOIN_TABLE", error);
    }
}

module.exports.findTable = async (BetInfo, client, requestData) => {
    logger.info("findTable BetInfo : ", JSON.stringify(BetInfo));

    let tableInfo = await this.getBetTable(BetInfo, requestData);
    logger.info("findTable tableInfo : ", JSON.stringify(tableInfo));

    await this.findEmptySeatAndUserSeat(tableInfo, BetInfo, client, requestData);
}

module.exports.getBetTable = async (BetInfo, requestData) => {
    logger.info("getBetTable BetInfo : ", JSON.stringify(BetInfo));
    let wh = {
        boot: Number(BetInfo.entryFee),
        activePlayer: { $gte: 0, $lt: 2 /*BetInfo.maxSeat*/ },
        _ip: requestData._ip
    }
    logger.info("getBetTable wh : ", JSON.stringify(wh));
    let tableInfo = await playingLudo.find(wh, {}).sort({ activePlayer: 1 }).lean();

    if (tableInfo.length > 0) {
        return tableInfo[0];
    }
    let table = await this.createTable(BetInfo, requestData);
    return table;
}

module.exports.createTable = async (betInfo, requestData) => {
    try {
        let insertobj = {
            gameId: "",
            maxSeat: 2,
            activePlayer: 0,
            betId: betInfo._id != undefined ? betInfo._id.toString() : "",
            boot: betInfo.entryFee,
            playerInfo: this.makeObjects(4),
            gameState: "",
            playerRoutePos1: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58
            ],
            playerRoutePos2: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                41, 42, 43, 44, 45, 46, 47, 48, 49,
                50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 59, 60, 61, 62, 63, 64
            ],
            playerRoutePos3: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
                52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 65, 66, 67, 68, 69, 70
            ],
            playerRoutePos4: [
                40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 71, 72, 73, 74, 75, 76
            ],
            safeDice: [9, 22, 35, 48, 1, 14, 27, 40],
            _ip: requestData._ip != undefined ? requestData._ip : 0,
            tableCode: requestData._ip != undefined && requestData._ip == 1 ? Math.floor(1000000 + Math.random() * 9000000) : "",
            adminId: requestData.adminId != undefined ? requestData.adminId : "",
        };
        logger.info("createTable insertobj : ", insertobj);

        let insertInfo = await playingLudo.create(insertobj);
        logger.info("createTable insertInfo : ", insertInfo);

        return insertInfo;

    } catch (error) {
        logger.error('joinTable.js createTable error=> ', error, betInfo);

    }
}

module.exports.makeObjects = (no) => {
    logger.info("makeObjects no : ", no)
    const arr = new Array();
    for (i = 0; i < no; i++)
        arr.push({});
    return arr;
}

module.exports.findEmptySeatAndUserSeat = async (table, betInfo, client, requestData) => {
    try {
        logger.info("findEmptySeatAndUserSeat table :=> ", table);
        logger.info("findEmptySeatAndUserSeat table :=> ", table.playerInfo);
        logger.info("findEmptySeatAndUserSeat table :=> ", table._ip);

        let seatIndex = this.findEmptySeat(table.playerInfo); //finding empty seat
        logger.info("findEmptySeatAndUserSeat seatIndex ::", seatIndex);

        if (seatIndex == "-1") {
            if (table._ip == 1) {
                sendEvent(client, CONST.CLPT, {}, false, "Not seat availabe !!");
            } else {
                await this.findTable(betInfo, client, requestData)
            }
            return false;
        }

        let user_wh = {
            _id: client.uid
        }

        let userInfo = await GameUser.findOne(user_wh, {}).lean();
        logger.info("findEmptySeatAndUserSeat userInfo : ", userInfo)

        // let wh = {
        //     _id : table._id.toString()
        // };
        // let tbInfo = await playingLudo.findOne(wh,{}).lean();
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
            color: seatIndex == 0 ? "blue" : "green",
            kukaris: {
                k1: -1,
                k2: -1,
                k3: -1,
                k4: -1
            },
            kukarisindex: {
                k1: -1,
                k2: -1,
                k3: -1,
                k4: -1
            },
            turnMissCounter: 0,
            turnCount: 0,
            sck: client.id,
            playerSocketId: client.id,
            playerLostChips: 0,
            isSee: false,
            Iscom: userInfo.Iscom != undefined ? userInfo.Iscom : 0
        }

        logger.info("findEmptySeatAndUserSeat playerDetails : ", playerDetails);

        let whereCond = {
            _id: MongoID(table._id.toString())
        };
        whereCond['playerInfo.' + seatIndex + '.seatIndex'] = { $exists: false };

        let setPlayerInfo = {
            $set: {
                gameState: ""
            },
            $inc: {
                activePlayer: 1
            }
        };
        setPlayerInfo["$set"]["playerInfo." + seatIndex] = playerDetails;

        logger.info("findEmptySeatAndUserSeat whereCond : ", whereCond, setPlayerInfo);

        let tableInfo = await playingLudo.findOneAndUpdate(whereCond, setPlayerInfo, { new: true });
        logger.info("\nfindEmptySeatAndUserSeat tbInfo : ", tableInfo);

        let playerInfo = tableInfo.playerInfo[seatIndex];

        if (!(playerInfo._id.toString() == userInfo._id.toString())) {
            if (tableInfo._ip == 1) {
                sendEvent(client, CONST.CLPT, {}, false, "Please Join Table....!!");
            } else {

                await this.findTable(betInfo, client, requestData);
            }
            return false;
        }
        client.seatIndex = seatIndex;
        client.tbid = tableInfo._id;

        logger.info('\n Assign table id and seat index socket event ->', client.seatIndex, client.tbid);
        let diff = -1;

        if (tableInfo.activePlayer >= 2 && tableInfo.gameState === CONST.ROUND_START_TIMER) {
            let currentDateTime = new Date();
            let time = currentDateTime.getSeconds();
            let turnTime = new Date(tableInfo.gameTimer.GST);
            let Gtime = turnTime.getSeconds();

            diff = Gtime - time;
            diff += CONST.gameStartTime;
        }

        sendEvent(client, CONST.JOINLUDO, {});
        const tokenNO = getToken(requestData.agoraAppId, requestData.agoraCertificate, tableInfo._id.toString(), requestData.agoraUid)
        //GTI event
        sendEvent(client, CONST.GAME_TABLE_INFO, {
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
            playerRoutePos1: tableInfo.playerRoutePos1,
            playerRoutePos2: tableInfo.playerRoutePos2,
            playerRoutePos3: tableInfo.playerRoutePos3,
            playerRoutePos4: tableInfo.playerRoutePos4,
            safeDice: tableInfo.safeDice,
            tokenNo: tokenNO,
            agoraUid: requestData.agoraUid,
            tableCode: tableInfo.tableCode,
            gameState: tableInfo.gameState,
            adminId: tableInfo.adminId
        });

        if (userInfo.Iscom == undefined || userInfo.Iscom == 0)
            client.join(tableInfo._id.toString());

        sendDirectEvent(client.tbid.toString(), CONST.JOIN_TABLE, {
            ap: tableInfo.activePlayer,
            playerDetail: tableInfo.playerInfo[seatIndex],
        });

        delete client.JT;

        if (tableInfo._ip == 0 && tableInfo.activePlayer == 2 && tableInfo.gameState == "") {

            let jobId = "LEAVE_SINGLE_USER:" + tableInfo._id;
            clearJob(jobId)

            await gameStartActions.gameTimerStart(tableInfo);
        }
        // else{

        //     setTimeout(()=>{
        //         botLogic.JoinRobot(tableInfo,betInfo)
        //     },2000)

        // }
    } catch (error) {
        console.info("findEmptySeatAndUserSeat", error);
    }
}

module.exports.findEmptySeat = (playerInfo) => {
    for (x in playerInfo) {


        if (typeof playerInfo[x] == 'object' && playerInfo[x] != null && (x == 0 || x == 2) && typeof playerInfo[x].seatIndex == 'undefined') {
            return parseInt(x);
            break;
        }
    }
    return '-1';
}

/*
    Create Private  Table 
    entryFee:110

*/
module.exports.CLPT = async (requestData, client) => {
    try {
        logger.info("CLPT Ludo", requestData);

        if (typeof client.uid == "undefined") {
            sendEvent(client, CONST.CLPT, requestData, false, "Please restart game!!");
            return false;
        }
        if (typeof client.CLPT != "undefined" && client.CLPT){
            console.log("CLPT ",client.CLPT)
            return false;

        }
        client.CLPT = true;

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("JoinTable UserInfo : ", gwh, JSON.stringify(UserInfo));

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)

        console.log("requestData ", requestData)

        if (Number(totalWallet) < Number(requestData.entryFee)) {
            sendEvent(client, CONST.CLPT, requestData, false, "Please add Wallet!!");
            delete client.CLPT
            return false;
        }

        let gwh1 = {
            "playerInfo._id": MongoID(client.uid)
        }
        let tableInfo = await playingLudo.findOne(gwh1, {}).lean();
        logger.info("JoinTable tableInfo : ", gwh, JSON.stringify(tableInfo));


        if (tableInfo != null) {
            // sendEvent(client, CONST.CLPT, requestData, false, "Already In playing table!!");
            // delete client.CLPT

            await leaveTableActions.leaveTableLudo(
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

            requestData._ip = 1;
            let table = await this.createTable(requestData, { _ip: 1, adminId: client.uid.toString() });
            console.log("table ", table)
            delete client.CLPT
            sendEvent(client, CONST.CLPT, { tableCode: table.tableCode, _id: table._id }, false, "");


            return false;
        } else {
            requestData._ip = 1;
            let table = await this.createTable(requestData, { _ip: 1, adminId: client.uid.toString() });
            console.log("table ", table)
            delete client.CLPT
            sendEvent(client, CONST.CLPT, { tableCode: table.tableCode, _id: table._id }, false, "");
        }
    } catch (error) {
        console.info("CLPT", error);
    }
}


/*
    Remove Private Table 
    tbid:""
*/
module.exports.RPT = async (requestData, client) => {
    try {
        logger.info("RPT", requestData);

        if (typeof requestData.tbid == "undefined") {
            sendEvent(client, CONST.RPT, requestData, false, "Please restart game!!");
            return false;
        }

        let tableInfo = await playingLudo.deleteOne({ _id: MongoID(requestData.tbid) })

    } catch (error) {
        console.info("RPT", RPT);
    }
}

/*
    _id:""
*/
module.exports.JPTL = async (requestData, client) => {
    logger.info("JPTL requestData : ", requestData);

    let tableInfo = await playingLudo.findOne({ _id: MongoID(requestData._id) }, {});
    logger.info("JPTL tableInfo : ", JSON.stringify(tableInfo));

    await this.findEmptySeatAndUserSeat(tableInfo, {}, client, requestData);
}




/*
if (tableInfo._ip == 0 && tableInfo.activePlayer == 2 && tableInfo.gameState == "") {

    let jobId = "LEAVE_SINGLE_USER:" + tableInfo._id;
    clearJob(jobId)

    await gameStartActions.gameTimerStart(tableInfo);
}

    _id:""
*/
module.exports.SPLT = async (requestData, client) => {
    logger.info("JPTL requestData : ", requestData);

    let tableInfo = await playingLudo.findOne({ _id: MongoID(requestData._id) }, {});
    logger.info("JPTL tableInfo : ", JSON.stringify(tableInfo));

    if (tableInfo.activePlayer == 2 && tableInfo.gameState == "") {
        await gameStartActions.gameTimerStart(tableInfo);
    } else {
        sendEvent(client, CONST.SPLT, requestData, false, "Must be 2 Player require for player....!!");
    }
}

/*
    Join Table Code 
    playerId:""
    code:""
*/
module.exports.JTOFC = async (requestData, client) => {
    if (typeof requestData.code != 'undefined' && requestData.code != null && requestData.code != '') {

        let userInfo = await GameUser.findOne({ _id: MongoID(client.uid) }, {})
        let wh = {
            tableCode: requestData.code.toString(),
            activePlayer: { $gte: 0, $lt: 2 },
            "pi.ui.uid": { $ne: MongoID(client.uid.toString()) },
        }
        logger.info("JTOFC getBetTable wh : ", JSON.stringify(wh));

        let tbdata = await playingLudo.findOne(wh, {}).lean();

        if (tbdata == null) {
            sendEvent(client, CONST.JTOFC, requestData, false, "Please Enter valid Table Code..!!");
            return false
        }

        if (userInfo.chips >= tbdata.boot * 2) {

            if (tbdata.activePlayer < tbdata.maxSeat) {

                this.findEmptySeatAndUserSeat(tbdata, {}, client, requestData);

            } else {
                sendEvent(client, CONST.JTOFC, requestData, false, "Please restart game!!");
            }
        } else {
            sendEvent(client, CONST.JTOFC, requestData, false, "Please add Chip in Wallet!!");
        }
    } else {
        sendEvent(client, CONST.JTOFC, requestData, false, "Please restart game!!");
    }
}

module.exports.checkPrivateTableExists = async (requestBody, socket) => {
    const { playerId, tableId } = requestBody;
    logger.info("checkPrivateTableExists req.body => ", requestBody);

    // Get the current date and time
    const now = new Date();

    // Calculate the date and time for 12 hours ago
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    try {
        const isExist = await PrivateBetListsLudo.findOne({
            createTableplayerId: playerId,
            createdAt: { $gte: twelveHoursAgo }
        });

        logger.info("isExist => ", isExist);
        if (isExist) {
            return {
                message: "already exists",
                status: 0,
                tableCode: isExist.tableCode,
                _id:isExist.tableid
            };
        } else {
            return {
                message: "already Not exists",
                status: 1,
            };
        }

    } catch (error) {
        logger.info("privateTableCreate error => ", error);
        return {
            message:
                "something went wrong while create private table, please try again",
            status: 0,
        };
    }
}