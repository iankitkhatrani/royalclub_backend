const server = require('https').createServer();
const schedule = require('node-schedule');

// eslint-disable-next-line no-undef
io = module.exports = require('socket.io')(server, { allowEIO3: true });

const logger = (module.exports = require('../../logger'));
const CONST = require('../../constant');
const signupActions = require('../helper/signups/index');
const commonHelper = require('../helper/commonHelper');
const gamePlayActions = require('../teenpatti/');
const gamePlayActionsRummy = require('../rummy');
const privateActionsRummy = require('../PrivateRummy');
const teenPrivateActions = require('../teenpattiprivate');

const gamePlayActionsLudo = require('../Ludo');
const ludoRe = require('../Ludo/reConnectFunction');

const gamePlayActionsJanta = require('../JantaGame');
const gamePlayActionsRoulette = require('../roulette');
const { userReconnectRoulette } = require('../roulette/reConnectFunction');

const { userReconnectJanta } = require('../JantaGame/reconnect');


const { registerUser } = require('../helper/signups/signupValidation');
const mainCtrl = require('./mainController');
const { sendEvent, sendDirectEvent } = require('../helper/socketFunctions');
const { userReconnect } = require('../teenpatti/reConnectFunction');
const rummyRe = require('../rummy/reConnectFunction');
const rummyPrRe = require('../PrivateRummy/reConnectFunction');
const teenRe = require('../teenpatti/reConnectFunction');
const teenPrRe = require('../teenpattiprivate/reConnectFunction');
const { getBannerList } = require('./adminController');


const myIo = {};

// create a init function for initlize the socket object
myIo.init = function (server) {
    // attach server with socket
    // eslint-disable-next-line no-undef
    io.attach(server);

    // eslint-disable-next-line no-undef
    io.on('connection', async (socket) => {

        try {
            //logger.info("Socket connected ===> ", socket.id);
            sendEvent(socket, CONST.DONE, {});

            socket.on('req', async (data) => {
                const decryptObj = commonHelper.decrypt(data.payload);
                const payload = JSON.parse(decryptObj);

                switch (payload.eventName) {

                    case CONST.PING: {
                        sendEvent(socket, CONST.PONG, {});
                        break;
                    }

                    case CONST.CHECK_MOBILE_NUMBER: {
                        try {
                            signupActions.checkMobileNumber(payload.data, socket);
                        } catch (error) {
                            logger.error('socketServer.js check Mobile Number User error => ', error);
                        }
                        break;
                    }

                    case CONST.REGISTER_USER: {
                        try {
                            await registerUser(payload.data, socket);
                        } catch (error) {
                            logger.error('socketServer.js Register User Table error => ', error);
                        }
                        break;
                    }

                    case CONST.SEND_OTP: {
                        try {
                            let result = await mainCtrl.otpSend(payload.data);
                            sendEvent(socket, CONST.SEND_OTP, result);
                        } catch (error) {
                            logger.error('socketServer.js Send Otp error => ', error);
                        }
                        break;
                    }

                    case CONST.VERIFY_OTP: {
                        try {
                            const result = await mainCtrl.verifyOTP(payload.data);
                            if (result.status && payload.data.otpType === 'signup') {
                                sendEvent(socket, CONST.VERIFY_OTP, result.data);
                                await registerUser(payload.data, socket);
                            }
                            else if (result.status && payload.data.otpType == 'login') {
                                await signupActions.userLogin(payload.data, socket);
                            }
                            else {
                                sendEvent(socket, CONST.VERIFY_OTP, { verified: false });
                            }
                        } catch (error) {
                            logger.error('socketServer.js Verify Otp error => ', error);
                        }
                        break;
                    }

                    case CONST.LOGIN: {
                        try {
                            await signupActions.userLogin(payload.data, socket);
                        } catch (e) {
                            logger.info('Exception userLogin :', e);
                        }
                        break;
                    }

                    case CONST.CHANGE_PASSWORD: {
                        try {
                            await signupActions.changePassword(payload.data, socket);
                        } catch (e) {
                            logger.info('Exception userLogin :', e);
                        }
                        break;
                    }

                    case CONST.DASHBOARD: {
                        try {
                            await signupActions.appLunchDetail(payload.data, socket);
                        } catch (e) {
                            logger.info('CONST.DASHBOARD Exception appLunchDetail :', e);
                        }
                        break;
                    }



                    case CONST.GET_TEEN_PATTI_ROOM_LIST: {
                        try {
                            await gamePlayActions.getBetList(payload.data, socket);
                        } catch (error) {
                            logger.error('socketServer.js GET_TEEN_PATTI_ROOM_LIST error => ', error);
                        }
                        break;
                    }

                    case CONST.TEEN_PATTI_SIGN_UP: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActions.joinTable(payload.data, socket);
                        break;
                    }

                    case CONST.TEEN_PATTI_SHOW: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.TEEN_GAME_TYPE.SIMPLE_TEEN:
                                    await gamePlayActions.show(payload.data, socket);
                                    break;

                                case CONST.TEEN_GAME_TYPE.PRIVATE_TEEN:
                                    await teenPrivateActions.show(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.TEEN_PATTI_CHAL: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.TEEN_GAME_TYPE.SIMPLE_TEEN:
                                    await gamePlayActions.chal(payload.data, socket);
                                    break;

                                case CONST.TEEN_GAME_TYPE.PRIVATE_TEEN:
                                    await teenPrivateActions.chal(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.TEEN_PATTI_PACK: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.TEEN_GAME_TYPE.SIMPLE_TEEN:
                                    await gamePlayActions.cardPack(payload.data, socket);
                                    break;

                                case CONST.TEEN_GAME_TYPE.PRIVATE_TEEN:
                                    await teenPrivateActions.cardPack(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.TEEN_PATTI_CARD_SEEN: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.TEEN_GAME_TYPE.SIMPLE_TEEN:
                                    await gamePlayActions.seeCard(payload.data, socket);
                                    break;

                                case CONST.TEEN_GAME_TYPE.PRIVATE_TEEN:
                                    await teenPrivateActions.seeCard(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.TEEN_PATTI_LEAVE_TABLE: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.TEEN_GAME_TYPE.SIMPLE_TEEN:
                                    await gamePlayActions.leaveTable(payload.data, socket);
                                    break;

                                case CONST.TEEN_GAME_TYPE.PRIVATE_TEEN:
                                    await teenPrivateActions.leaveTable(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.RECONNECT: {
                        await userReconnect(payload.data, socket);
                        break;
                    }

                    // TEEN PATTI Private Table
                    case CONST.CREATE_TEEN_PRIVATE_TABLE_ID: {
                        try {
                            await teenPrivateActions.privateTableCreate(payload.data, socket)
                        } catch (error) {
                            logger.error('socketServer.js R_CREATE_RUMMY_PRIVATE_TABLE_ID => ', error);
                        }
                        break;
                    }

                    case CONST.T_PRIVATE_TABLE_EXISTS: {
                        try {
                            let res = await teenPrivateActions.checkPrivateTableExists(payload.data, socket)
                            sendEvent(socket, CONST.T_PRIVATE_TABLE_EXISTS, res)
                        } catch (error) {
                            logger.error('socketServer.js T_PRIVATE_TABLE_EXISTS => ', error);
                        }
                        break;
                    }

                    case CONST.T_JOIN_PRIVATE_TABLE: {
                        try {
                            // console.log("SP called");
                            socket.uid = payload.data.playerId;
                            socket.sck = socket.id;
                            logger.info('Join Privaet table payload.data => ', payload.data);
                            await teenPrivateActions.joinTable(payload.data, socket);

                        } catch (error) {
                            socket.emit("req", { eventName: CONST.ERROR, error });
                        }

                        break;
                    }

                    case CONST.T_PRIVATE_TABLE_START: {
                        if (payload.data.gamePlayType == "TeenPrivateTable") {
                            try {
                                logger.info("private Table Game Start----->>>>", payload.data);
                                await teenPrivateActions.gameStart(payload.data, socket);

                            } catch (error) {
                                console.log('private Table Pic card error => ', error);
                            }
                        }
                        break;
                    }

                    // JANTA GAME Event 
                    case CONST.JANTA_GAME_PLAYGAME: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActionsJanta.JANTA_JOIN_TABLE(payload.data, socket);
                        break;
                    }

                    case CONST.ACTIONJANTA: {
                        await gamePlayActionsJanta.actionJanta(false, payload.data, socket);
                        break;
                    }

                    case CONST.REMOVEBETJANTA: {
                        await gamePlayActionsJanta.REMOVEBETJANTA(payload.data, socket);
                        break;
                    }


                    case CONST.ClearBetJANTA: {
                        await gamePlayActionsJanta.ClearBetJANTA(payload.data, socket);
                        break;
                    }

                    case CONST.PASTBETJANTA: {
                        await gamePlayActionsJanta.PASTBET(payload.data, socket);
                        break;
                    }

                    case CONST.PASTBETSAVE: {
                        await gamePlayActionsJanta.PASTBETSAVE(payload.data, socket);
                        break;
                    }

                    case CONST.BETACTIONCALL: {
                        await gamePlayActionsJanta.BETACTIONCALL(payload.data, socket);
                        break;
                    }

                    case CONST.LEAVETABLESJANTA: {
                        await gamePlayActionsJanta.leaveTable(payload.data, socket);
                        break;
                    }

                    case CONST.RECONNECTJANTA: {
                        await userReconnectJanta(payload.data, socket);
                        break;
                    }


                    // ROULETTE GAME Event 
                    case CONST.ROULETTE_JOIN_TABLE: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;
                        logger.info("Table Name =======> ", payload.data.whichTable);
                        await gamePlayActionsRoulette.ROULETTE_GAME_JOIN_TABLE(payload.data, socket);
                        break;
                    }

                    case CONST.ACTIONROULETTE: {
                        await gamePlayActionsRoulette.actionSpin(payload.data, socket);
                        break;
                    }

                    case CONST.REMOVEBETROULETTE: {
                        await gamePlayActionsRoulette.REMOVEBETROULETTE(payload.data, socket);
                        break;
                    }


                    case CONST.ClearBet: {
                        await gamePlayActionsRoulette.ClearBet(payload.data, socket);
                        break;
                    }

                    case CONST.DoubleBet: {
                        await gamePlayActionsRoulette.DoubleBet(payload.data, socket);
                        break;
                    }

                    case CONST.NEIGHBORBET: {
                        await gamePlayActionsRoulette.NEIGHBORBET(payload.data, socket);
                        break;
                    }

                    case CONST.PASTBET: {
                        await gamePlayActionsRoulette.PASTBET(payload.data, socket);
                        break;
                    }


                    case CONST.LEAVETABLEROULETTE: {
                        await gamePlayActionsRoulette.leaveTable(payload.data, socket);
                        break;
                    }

                    case CONST.RECONNECTROULETTE: {
                        await userReconnectRoulette(payload.data, socket);
                        break;
                    }


                    case CONST.HISTORY: {
                        await gamePlayActionsRoulette.HISTORY(payload.data, socket);
                        break;
                    }



                    //====================================

                    case CONST.BANNER: {
                        const result = await getBannerList(payload.data, socket);
                        sendEvent(socket, CONST.BANNER, result);
                        break;
                    }

                    case CONST.GET_LUDO_ROOM_LIST: {
                        try {
                            await gamePlayActionsLudo.getBetList(payload.data, socket);
                        } catch (error) {
                            logger.error('socketServer.js GET_TEEN_PATTI_ROOM_LIST error => ', error);
                        }
                        break;
                    }

                    case CONST.L_PRIVATE_TABLE_EXISTS: {
                        try {
                            let res = await gamePlayActionsLudo.checkPrivateTableExists(payload.data, socket)
                            sendEvent(socket, CONST.L_PRIVATE_TABLE_EXISTS, res)
                        } catch (error) {
                            logger.error('socketServer.js R_PRIVATE_TABLE_EXISTS => ', error);
                        }
                        break;
                    }
                    case CONST.JOINLUDO: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActionsLudo.joinTable(payload.data, socket);
                        break;
                    }

                    //Create Ludo Private Table 
                    case CONST.CLPT: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        // await gamePlayActionsLudo.CLPT(payload.data, socket);
                        await gamePlayActionsLudo.privateTableCreate(payload.data, socket);
                        break;
                    }

                    //:"RPT",
                    //REMOVE Private Table 
                    case CONST.RPT: {

                        await gamePlayActionsLudo.RPT(payload.data, socket);
                        break;
                    }

                    //Start Private Ludo Table 
                    case CONST.SPLT: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActionsLudo.SPLT(payload.data, socket);
                        break;
                    }

                    //Join Private Table Ludo
                    case CONST.JPTL: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActionsLudo.JPTL(payload.data, socket);
                        break;
                    }


                    //Join To Code Ludo Table 
                    case CONST.JTOFC: {
                        socket.uid = payload.data.playerId;
                        socket.sck = socket.id;

                        await gamePlayActionsLudo.JTOFC(payload.data, socket);
                        break;
                    }

                    case CONST.RollDice: {
                        await gamePlayActionsLudo.RollDice(payload.data, socket);
                        break;
                    }

                    case CONST.MOVEKUKARI: {
                        await gamePlayActionsLudo.MOVEKUKARI(payload.data, socket);
                        break;
                    }


                    case CONST.LEAVETABLELUDO: {
                        await gamePlayActionsLudo.leaveTable(payload.data, socket);
                        break;
                    }


                    case CONST.L_RECONNECT: {
                        await ludoRe.userReconnect(payload.data, socket);
                        break;
                    }



                    //Rummy ------------------------------
                    case CONST.R_GET_BET_LIST: {
                        try {
                            await gamePlayActionsRummy.rummyGetBetList(payload.data, socket);
                        } catch (error) {
                            logger.error('socketServer.js GET_BET_LIST error => ', error);
                        }
                        break;
                    }

                    case CONST.R_JOIN_SIGN_UP: {
                        try {
                            socket.uid = payload.data.playerId;
                            socket.sck = socket.id;

                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.joinTable(payload.data, socket);
                                    break;
                            }
                        } catch (error) {
                            logger.error('socketServer.js JOIN_SIGN_UP error => ', error);
                            sendEvent(socket, CONST.ERROR, error);
                        }
                        break;
                    }

                    case CONST.R_PICK_CARD: {
                        try {
                            switch (payload.data.gamePlayType) {
                                // POINT RUMMY
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.pickCard(payload.data, socket);
                                    break;
                                //PRIVATE RUMMY
                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.pickCard(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('socketServer.js PICK_CARD error => ', error);
                        }
                        break;
                    }

                    case CONST.R_DISCARD: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.disCard(payload.data, socket);
                                    break;

                                //PRIVATE RUMMY
                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.disCard(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('Disk card Card error => ', error);
                        }
                        break;
                    }

                    case CONST.R_CARD_GROUP: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.cardGroup(payload.data, socket);
                                    break;

                                //PRIVATE RUMMY 
                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.cardGroup(payload.data, socket);
                                    break;
                            }
                        } catch (error) {
                            logger.error('socketServer.js Group Card error => ', error);
                        }
                        break;
                    }

                    case CONST.R_DECLARE: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.declare(payload.data, socket);
                                    break;

                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.declare(payload.data, socket);
                                    break;


                            }
                        } catch (error) {
                            logger.error('socketServer.js Declare Table error => ', error);
                        }
                        break;
                    }

                    case CONST.R_DROPPED: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.playerDrop(payload.data, socket);
                                    break;

                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.playerDrop(payload.data, socket);
                                    break;


                            }
                        } catch (error) {
                            console.log('DROP Table error => ', error);
                        }

                        break;
                    }

                    case CONST.R_PLAYER_FINISH_DECLARE_TIMER: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.playerFinishDeclare(payload.data, socket);
                                    break;

                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.playerFinishDeclare(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('CONST.PLAYER_FINISH_DECLARE_TIMER:', error);
                        }
                        break;
                    }

                    case CONST.R_FINISH: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.playerFinish(payload.data, socket);
                                    break;

                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.playerFinish(payload.data, socket);
                                    break;

                            }
                        } catch (error) {
                            logger.error('Finsih Table error => ', error);
                        }
                        break;
                    }

                    case CONST.R_LEAVE: {
                        try {
                            switch (payload.data.gamePlayType) {
                                case CONST.GAME_TYPE.POINT_RUMMY:
                                    await gamePlayActionsRummy.leaveTable(payload.data, socket);
                                    break;

                                case CONST.GAME_TYPE.PRIVATE_RUMMY:
                                    await privateActionsRummy.leaveTable(payload.data, socket);
                                    break;


                            }
                        } catch (error) {
                            logger.error('socketServer.js LEAVE Table error => ', error);
                        }
                        break;
                    }

                    case CONST.R_RECONNECT: {
                        await rummyRe.userReconnect(payload.data, socket);
                        break;
                    }
                    case CONST.R_PRIVATE_RECONNECT: {
                        await rummyPrRe.userReconnect(payload.data, socket);
                        break;
                    }

                    case CONST.TEEN_RECONNECT: {
                        await teenRe.userReconnect(payload.data, socket);
                        break;
                    }
                    case CONST.T_PRIVATE_RECONNECT: {
                        await teenPrRe.userReconnect(payload.data, socket);
                        break;
                    }

                    // Rummy Private Table
                    case CONST.R_CREATE_RUMMY_PRIVATE_TABLE_ID: {
                        try {
                            await privateActionsRummy.privateTableCreate(payload.data, socket)
                        } catch (error) {
                            logger.error('socketServer.js R_CREATE_RUMMY_PRIVATE_TABLE_ID => ', error);
                        }
                        break;
                    }

                    case CONST.R_PRIVATE_TABLE_EXISTS: {
                        try {
                            let res = await privateActionsRummy.checkPrivateTableExists(payload.data, socket)
                            sendEvent(socket, CONST.R_PRIVATE_TABLE_EXISTS, res)
                        } catch (error) {
                            logger.error('socketServer.js R_PRIVATE_TABLE_EXISTS => ', error);
                        }
                        break;
                    }

                    case CONST.R_JOIN_PRIVATE_TABLE: {
                        try {
                            // console.log("SP called");
                            socket.uid = payload.data.playerId;
                            socket.sck = socket.id;
                            logger.info('Join Privaet table payload.data => ', payload.data);
                            await privateActionsRummy.joinTable(payload.data, socket);

                        } catch (error) {
                            socket.emit("req", { eventName: CONST.ERROR, error });
                        }

                        break;
                    }

                    case CONST.R_PRIVATE_TABLE_START: {
                        if (payload.data.gamePlayType == "RummyPrivateTable") {
                            try {
                                logger.info("private teen Table Game Start----->>>>", payload.data);
                                await privateActionsRummy.gameStart(payload.data, socket);

                            } catch (error) {
                                console.log('private Table Pic card error => ', error);
                            }
                        }
                        break;
                    }


                    case CONST.PLAYER_TRANSACTION_HISTORY: {
                        try {
                            let res = await mainCtrl.getTransactiobDetailByUserId(payload.data, socket);
                            sendEvent(socket, CONST.PLAYER_TRANSACTION_HISTORY, res.data);

                        } catch (error) {
                            logger.error('socketServer.js GET_BANK_DETAILS => ', error);
                        }
                        break;
                    }

                    default:
                        sendEvent(socket, CONST.INVALID_EVENT, {
                            msg: 'This Event Is Nothing',
                        });
                        break;
                }
            });

            /* Disconnect socket */
            socket.on('disconnect', async () => {
                try {
                    logger.info('\n<==== disconnect socket id ===>', socket.id, '\n Disconnect Table Id =>', socket.tbid);

                    const playerId = socket.uid;
                    let jobId = CONST.DISCONNECT + playerId;
                    logger.info('schedule USER Start DISCONNECTED jobId typeof : ', jobId, typeof jobId);

                    //object player is disconnect or not

                    let timerSet = Date.now() + 60000;
                    //await setDelay(jobId, new Date(delay), 'disconnect');
                    schedule.scheduleJob(jobId.toString(), timerSet, async function () {
                        const result = schedule.cancelJob(jobId);

                        logger.info('after USER JOB CANCELLED scheduleJob: ', result);
                        await gamePlayActions.disconnectTableHandle(socket);
                    });
                } catch (error) {
                    logger.error('socketServer.js error when user disconnect => ', error);
                }
            });
        } catch (err) {
            logger.info('socketServer.js error => ', err);
        }
    });
};

module.exports = myIo;
