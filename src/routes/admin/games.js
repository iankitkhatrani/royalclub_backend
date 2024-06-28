const mongoose = require('mongoose');
const Users = mongoose.model('users');
const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const fs = require("fs")
const RouletteTables = mongoose.model('RouletteTables');
/**
* @api {get} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/rummyGameHistory', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const gameHistoryData = [
            {
                "SrNo": 1,
                "DateTime": "2023-10-10 08:30 AM",
                "Name": "Alice",
                "PhoneNumber": "123-456-7890",
                "RoomId": "GRoom1",
                "Amount": 100, // Amount in this example (can be credit or debit)
                "Type": "Credit", // "Credit" or "Debit"
                "Club": "Club A"
            },
            {
                "SrNo": 2,
                "DateTime": "2023-10-09 10:15 AM",
                "Name": "Bob",
                "PhoneNumber": "987-654-3210",
                "RoomId": "GRoom2",
                "Amount": 50, // Amount in this example (can be credit or debit)
                "Type": "Debit", // "Credit" or "Debit"
                "Club": "Club B"
            },
            {
                "SrNo": 3,
                "DateTime": "2023-10-09 10:15 AM",
                "Name": "Bob",
                "PhoneNumber": "987-654-3210",
                "RoomId": "GRoom2",
                "Amount": 50, // Amount in this example (can be credit or debit)
                "Type": "Debit", // "Credit" or "Debit"
                "Club": "Club Bd"
            },
            // Add more game history entries here
        ]

        //await Users.find({}, { username: 1, id: 1, mobileNumber: 1, "counters.totalMatch": 1, chips: 1, referralCode: 1, createdAt: 1, lastLoginDate: 1, status: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', gameHistoryData);

        res.json({ gameHistoryData });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {get} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/ludoGameHistory', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const gameHistoryData = [
            {
                "SrNo": 1,
                "DateTime": "2023-10-10 08:30 AM",
                "Name": "Alice",
                "PhoneNumber": "123-456-7890",
                "RoomId": "LRoom1",
                "Amount": 100, // Amount in this example (can be credit or debit)
                "Type": "Credit", // "Credit" or "Debit"
                "Club": "Club A"
            },
            {
                "SrNo": 2,
                "DateTime": "2023-10-09 10:15 AM",
                "Name": "Bob",
                "PhoneNumber": "987-654-3210",
                "RoomId": "LRoom2",
                "Amount": 50, // Amount in this example (can be credit or debit)
                "Type": "Debit", // "Credit" or "Debit"
                "Club": "Club B"
            },
            {
                "SrNo": 3,
                "DateTime": "2023-10-09 10:15 AM",
                "Name": "Bob",
                "PhoneNumber": "987-654-3210",
                "RoomId": "LRoom2",
                "Amount": 50, // Amount in this example (can be credit or debit)
                "Type": "Debit", // "Credit" or "Debit"
                "Club": "Club Bd"
            },
            // Add more game history entries here
        ]

        //await Users.find({}, { username: 1, id: 1, mobileNumber: 1, "counters.totalMatch": 1, chips: 1, referralCode: 1, createdAt: 1, lastLoginDate: 1, status: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', gameHistoryData);

        res.json({ gameHistoryData });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});



/**
* @api {get} /admin/lobbies
* @apiName  GetGameBetInfo
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.

{
  seatIndex: 0,
  _id: 661e505b68b64c705150e769,
  playerId: 661e505b68b64c705150e769,
  username: 'USER_15',
  profile: null,
  coins: 21420,
  status: '',
  playerStatus: '',
  selectObj: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0
  ],
  betObject: [
    { number: [Array], type: 'number', bet: 2, betIndex: '1' },
    { number: [Array], type: '2_number', bet: 2, betIndex: '49' },
    { number: [Array], type: '3_number', bet: 2, betIndex: '134' }
  ],
  totalbet: 78,
  turnMissCounter: 0,
  turnCount: 0,
  sck: 'EJ7Z3he8KJ2XjYHmAABZ',
  playerSocketId: 'EJ7Z3he8KJ2XjYHmAABZ',
  playerLostChips: 0,
  Iscom: 0,
  playStatus: 'action'
}

[
  { playerInfo: [ [Object] ], _id: 66378e4a716086941dea9fb3 },
  { playerInfo: [ [Object] ], _id: 66387427716086941deab504 }
]


*/
router.get('/GetGameBetInfo', async (req, res) => {
    try {
        console.info('requet => ', req.body);

        //tabInfo = await RouletteTables.find({},{"playerInfo":1});

        //console.info('tabInfo => ', tabInfo);

        const responseData = await RouletteTables.aggregate([
            { $unwind: "$playerInfo" },
            { $unwind: "$playerInfo.betObject" },
            {
                $group: {
                    _id: "$playerInfo.betObject.betIndex",
                    type: { $first: "$playerInfo.betObject.type" },
                    number: { $first: "$playerInfo.betObject.number" },
                    bet: { $sum: "$playerInfo.betObject.bet" }
                }
            }
        ]);

        console.log("responseData ", responseData)

        res.json({ tabInfo: responseData });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {get} /admin/lobbies
* @apiName  gameLogicSet
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/gameLogicSet', async (req, res) => {
    try {
        console.info('requet => ', req.body);
        // console.log("req.body.gamelogic", CONST.AVIATORLOGIC)


        console.log("req.body.gamename  1", req.body.gamename)

        if (req.body.gamename == "SORAT") {
            GAMELOGICCONFIG.SORAT = req.body.gamelogic

            console.log("GAMELOGICCONFIG ", GAMELOGICCONFIG)

            let link = "./gamelogic.json"
            console.log("link ", link)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }

            });

        } else if (req.body.gamename == "SPIN") {
            GAMELOGICCONFIG.SPIN = req.body.gamelogic


            let link = "./gamelogic.json"
            console.log("link ", link)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }

            });

        } else if (req.body.gamename == "ANDARBAHAR") {
            GAMELOGICCONFIG.ANDARBAHAR = req.body.gamelogic

            console.log("GAMELOGICCONFIG ", GAMELOGICCONFIG)

            let link = "./gamelogic.json"
            console.log("link ", link)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }

            });

        } else if (req.body.gamename == "WHEELOFFORTUNE") {
            GAMELOGICCONFIG.WHEELOFFORTUNE = req.body.gamelogic


            let link = "./gamelogic.json"
            console.log("link ", link)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }

            });

        } else if (req.body.gamename == "BARAKADUM") {
            GAMELOGICCONFIG.BARAKADUM = req.body.gamelogic

            console.log("GAMELOGICCONFIG ", GAMELOGICCONFIG)

            let link = "./gamelogic.json"
            console.log("link ", link)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }

            });

        } else if (req.body.gamename == "ROULETTE") {

            console.log("req.body ", req.body)

            GAMELOGICCONFIG.ROULETTE = req.body.selectedMode
            GAMELOGICCONFIG.GREENFIXNUMBERWON = parseInt(req.body.greenfixnumberwon)
            GAMELOGICCONFIG.BLUEFIXNUMBERWON = parseInt(req.body.bluefixnumberwon)
            GAMELOGICCONFIG.PERCENTAGE = parseInt(req.body.PERCENTAGE)
            GAMELOGICCONFIG.DAY = parseInt(req.body.DAY)

            let link = "./gamelogic.json"
            console.log("GAMELOGICCONFIG ", GAMELOGICCONFIG)
            fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
                console.log("erre", err)
                if (err) {
                    console.log(err);
                }
            });
        }
        res.json({ falgs: true });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {get} /admin/lobbies
* @apiName  gameLogicSet
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/getgamelogic', async (req, res) => {
    try {
        console.info('requet => ', req.query);
        // console.log("req.body.gamelogic", CONST.AVIATORLOGIC)

        console.log("dddddddddddddddddddd 1", process.env.AVIATORLOGIC)

        console.log("req.query.gameName", req.query.gamename)
        //"SORAT":"Client","SPIN":"Normal","":"","":"","":"","":"",
        if (req.query.gamename == "SORAT") {

            res.json({ logic: GAMELOGICCONFIG.SORAT });

        } else if (req.query.gamename == "SPIN") {


            res.json({ logic: GAMELOGICCONFIG.SPIN });

        } else if (req.query.gamename == "ANDARBAHAR") {


            res.json({ logic: GAMELOGICCONFIG.ANDARBAHAR });

        } else if (req.query.gamename == "WHEELOFFORTUNE") {


            res.json({ logic: GAMELOGICCONFIG.WHEELOFFORTUNE });

        } else if (req.query.gamename == "BARAKADUM") {


            res.json({ logic: GAMELOGICCONFIG.BARAKADUM });

        } else if (req.query.gamename == "ROULETTE") {


            res.json({
                logic: {
                    selectedMode: GAMELOGICCONFIG.ROULETTE,
                    greenfixnumberwon: GAMELOGICCONFIG.GREENFIXNUMBERWON,
                    bluefixnumberwon: GAMELOGICCONFIG.BLUEFIXNUMBERWON,
                    PERCENTAGE: parseInt(GAMELOGICCONFIG.PERCENTAGE),
                    DAY:parseInt(GAMELOGICCONFIG.DAY)
                }
            });

        } else {
            res.json({ logic: "" });
        }

        logger.info('admin/dahboard.js post dahboard  error => ');


    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});




//========================

/**
* @api {get} /admin/GameComSet
* @apiName  GameComSet
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/GameComSet', async (req, res) => {
    try {
        console.info('requet => ', req.body);
        // console.log("req.body.gamelogic", CONST.Commission)

        console.log("dddddddddddddddddddd 1", process.env.Commission)

        GAMELOGICCONFIG.TEENPATTICOM= parseFloat(req.body.TEENPATTICOM),
        GAMELOGICCONFIG.RUMMYCOM= parseFloat(req.body.RUMMYCOM),
        GAMELOGICCONFIG.LUDOCOM= parseFloat(req.body.LUDOCOM)
        

        console.log("GAMELOGICCONFIG ", GAMELOGICCONFIG)

        let link = "./gamelogic.json"
        console.log("link ", link)
        fs.writeFile(link, JSON.stringify(GAMELOGICCONFIG), function (err) {
            console.log("erre", err)
            if (err) {
                console.log(err);
            }

        });

        res.json({ falgs: true });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {get} /admin/lobbies
* @apiName  gameLogicSet
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/getgamecom', async (req, res) => {
    try {
        console.info('requet => ', req.query);

        console.log("dddddddddddddddddddd 1", process.env.Commission)

        res.json({
            TEENPATTICOM: parseFloat(GAMELOGICCONFIG.TEENPATTICOM),
            RUMMYCOM: parseFloat(GAMELOGICCONFIG.RUMMYCOM),
            LUDOCOM: parseFloat(GAMELOGICCONFIG.LUDOCOM)
        });

        logger.info('admin/dahboard.js post dahboard  error => ', CONST);


    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


module.exports = router;