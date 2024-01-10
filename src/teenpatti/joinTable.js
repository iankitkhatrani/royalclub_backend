const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const GameUser = mongoose.model('users');
const PlayingTables = mongoose.model("playingTables");
const BetLists = mongoose.model("betList")

const { sendEvent, sendDirectEvent, AddTime, setDelay, clearJob } = require('../helper/socketFunctions');

const gameStartActions = require("./gameStart");
const CONST = require("../../constant");
const logger = require("../../logger");
const botLogic = require("./botLogic");


module.exports.joinTable = async (requestData, client) => {
    try {
        if (typeof client.uid == "undefined") {
            sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Please restart game!!");
            return false;
        }
        if (typeof client.JT != "undefined" && client.JT) return false;

        client.JT = true;

        let bwh = {
            _id: requestData.betId
        }
        const BetInfo = await BetLists.findOne(bwh, {}).lean();
        logger.info("Join Table data : ", JSON.stringify(BetInfo));

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("JoinTable UserInfo : ", gwh, JSON.stringify(UserInfo));

        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)
        if (Number(totalWallet) < Number(BetInfo.entryFee)) {
            sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Please add Wallet!!");
            delete client.JT
            return false;
        }

        let gwh1 = {
            "playerInfo._id": MongoID(client.uid)
        }
        let tableInfo = await PlayingTables.findOne(gwh1, {}).lean();
        logger.info("JoinTable tableInfo : ", gwh, JSON.stringify(tableInfo));

        if (tableInfo != null) {
            sendEvent(client, CONST.JOIN_TABLE, requestData, false, "Already In playing table!!");
            delete client.JT
            return false;
        }
        await this.findTable(BetInfo, client)
    } catch (error) {
        console.info("JOIN_TABLE", error);
    }
}

module.exports.findTable = async (BetInfo, client) => {
    logger.info("findTable BetInfo : ", JSON.stringify(BetInfo));

    let tableInfo = await this.getBetTable(BetInfo);
    logger.info("findTable tableInfo : ", JSON.stringify(tableInfo));

    await this.findEmptySeatAndUserSeat(tableInfo, BetInfo, client);
}

module.exports.getBetTable = async (BetInfo) => {
    logger.info("getBetTable BetInfo : ", JSON.stringify(BetInfo));
    let wh = {
        boot: Number(BetInfo.entryFee),
        activePlayer: { $gte: 0, $lt: 6 /*BetInfo.maxSeat*/ }
    }
    logger.info("getBetTable wh : ", JSON.stringify(wh));
    let tableInfo = await PlayingTables.find(wh, {}).sort({ activePlayer: 1 }).lean();

    if (tableInfo.length > 0) {
        return tableInfo[0];
    }
    let table = await this.createTable(BetInfo);
    return table;
}

module.exports.createTable = async (betInfo) => {
    try {
        let insertobj = {
            gameId: "",
            maxSeat: betInfo.maxPlayer,
            activePlayer: 0,
            betId: betInfo._id,
            boot: betInfo.entryFee,
            rate: betInfo.rate,
            chalLimit: betInfo.chalLimit,
            potLimit: betInfo.potLimit,
            playerInfo: this.makeObjects(betInfo.maxPlayer),
            gameState: "",
            discardCard: '',
        };
        logger.info("createTable insertobj : ", insertobj);

        let insertInfo = await PlayingTables.create(insertobj);
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

module.exports.findEmptySeatAndUserSeat = async (table, betInfo, client) => {
    try {
        logger.info("findEmptySeatAndUserSeat table :=> ", table + " betInfo :=> ", betInfo + " client :=> ", client);
        let seatIndex = this.findEmptySeat(table.playerInfo); //finding empty seat
        logger.info("findEmptySeatAndUserSeat seatIndex ::", seatIndex);

        if (seatIndex == "-1") {
            await this.findTable(betInfo, client)
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
        // let tbInfo = await PlayingTables.findOne(wh,{}).lean();
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
            chalValue: 0,
            cards: [],
            turnMissCounter: 0,
            turnCount: 0,
            sck: client.id,
            playerSocketId: client.id,
            playerLostChips: 0,
            isSee: false,
            Iscom:userInfo.Iscom != undefined ? userInfo.Iscom:0
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

        let tableInfo = await PlayingTables.findOneAndUpdate(whereCond, setPlayerInfo, { new: true });
        logger.info("\nfindEmptySeatAndUserSeat tbInfo : ", tableInfo);

        let playerInfo = tableInfo.playerInfo[seatIndex];

        if (!(playerInfo._id.toString() == userInfo._id.toString())) {
            await this.findTable(betInfo, client);
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

        sendEvent(client, CONST.JOIN_SIGN_UP, {});

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
        });

        if(userInfo.Iscom == undefined || userInfo.Iscom == 0)
        client.join(tableInfo._id.toString());

        sendDirectEvent(client.tbid.toString(), CONST.JOIN_TABLE, {
            ap: tableInfo.activePlayer,
            playerDetail: tableInfo.playerInfo[seatIndex],
        });

        delete client.JT;

        if (tableInfo.activePlayer == 2 && tableInfo.gameState == "") {

            let jobId = "LEAVE_SINGLE_USER:" + tableInfo._id;
            clearJob(jobId)

            await gameStartActions.gameTimerStart(tableInfo);
        }else{

            setTimeout(()=>{
                botLogic.JoinRobot(tableInfo,betInfo)
            },2000)
  
        }
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