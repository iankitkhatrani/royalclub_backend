const mongoose = require('mongoose');
const MongoID = mongoose.Types.ObjectId;


const Agent = mongoose.model('agent');
const AdminUser = mongoose.model("admin");
const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const { registerUser } = require('../../helper/signups/signupValidation');
const walletActions = require("../../roulette/updateWallet");


/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/AgentList', async (req, res) => {
    try {
        console.log('requet => ', req.query);
        //agentId
        let shopList = []
        if (req.query.agentId == "Admin") {
            shopList = await Agent.find({}, { name: 1, location: 1, chips: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1 })

        } else {
            shopList = await Agent.find({ agentId: MongoID(req.query.agentId) }, { name: 1, location: 1, chips: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1 })
        }
        logger.info('ShopList admin/dahboard.js post dahboard  error => ', shopList);

        res.json({ shopList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/AgentData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/AgentData', async (req, res) => {
    try {
        console.info('requet => ', req.query.agentId);
        //
        const userInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.query.agentId) }, { name: 1, password: 1, chips: 1, location: 1, createdAt: 1, lastLoginDate: 1, status: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', userInfo);

        res.json({ userInfo });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});



/**
* @api {post} /admin/AddUser
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/AgentUpdate', async (req, res) => {
    try {

        console.log("req ", req.body)

        const Checksubagent = await Agent.find({ _id: {$ne: new mongoose.Types.ObjectId(req.body.userId)} , name: req.body.name });
        console.log("Checksubagent ", Checksubagent)
        if (Checksubagent != undefined && Checksubagent.length > 0) {
            res.json({ status: false, msg: "This Sub Agent name is already taken. Please choose a different one." });
            return false
        }


        //currently send rendom number and generate 
        let response = {
            $set: {
                password: req.body.password,
                name: req.body.name,
                status: req.body.status,
                location: req.body.location
            }
        }

        console.log("response ", response)

        console.log("response ", req.body)


        const userInfo = await Agent.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.userId) }, response, { new: true });

        logger.info('admin/dahboard.js post dahboard  error => ', userInfo);

        res.json({ status: "ok" });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});



/**
* @api {post} /admin/AddUser
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.post('/AddAgent', async (req, res) => {
    try {
        //currently send rendom number and generate 
        console.log("req ", req.body)
        //currently send rendom number and generate 
        if (
            req.body.password != undefined && req.body.password != null && req.body.password != "" &&
            req.body.name != undefined && req.body.name != null && req.body.name != "" &&
            req.body.status != undefined && req.body.status != null && req.body.status != "" &&
            req.body.location != undefined && req.body.location != null && req.body.location != ""
        ) {

            const Checksubagent = await Agent.find({ name: req.body.name });
            console.log("Checksubagent ", Checksubagent)
            if (Checksubagent != undefined && Checksubagent.length > 0) {
                res.json({ status: false, msg: "This Sub Agent name is already taken. Please choose a different one." });
                return false
            }


            let response = {
                password: req.body.password,
                name: req.body.name,
                createdAt: new Date(),
                lastLoginDate: new Date(),
                status: req.body.status,
                location: req.body.location,
                agentId: req.body.agentId
            }

            console.log("response ", response)
            let insertRes = await Agent.create(response);

            if (Object.keys(insertRes).length > 0) {
                res.json({ status: "ok" });
            } else {
                logger.info('\nsaveGameUser Error :: ', insertRes);
                res.json({ status: false });
            }
            logger.info('admin/dahboard.js post dahboard  error => ', insertRes);
        } else {
            res.json({ status: false });
        }

    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.delete('/Deleteagent/:id', async (req, res) => {
    try {
        console.log("req ", req.params.id)

        const RecentUser = await Agent.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })

        logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

        res.json({ status: "ok" });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});



/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/AgentAddMoney', async (req, res) => {
    try {
        console.log("AgentAddMoney ", req.body)
        //const RecentUser = //await Users.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)})
        console.log("adminname ",req.body.adminname)
        if (req.body.adminname != 'Super Admin') {
           
            const agentInfo = await AdminUser.findOne({ _id: new mongoose.Types.ObjectId(req.body.adminid) }, { name:1,chips: 1 })

            console.log("agentInfo ", agentInfo)

            if (agentInfo != null && agentInfo.chips < Number(req.body.money)) {
                res.json({ status: false,msg:"not enough chips to adding user wallet" });
                return false
            }   

            const ShopInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1 })

            await walletActions.deductagentWallet(req.body.adminid, -Number(req.body.money), 2, "Add Chips to Sub Agent", "roulette", agentInfo.name, req.body.adminid,req.body.userId,ShopInfo.name);

            await walletActions.addshopWalletAdmin(req.body.userId, Number(req.body.money), 2, "Admin Addeed Chips", "roulette", agentInfo.name, req.body.adminid);

            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok",msg:"Successfully Credited...!!" });

        } else {

            await walletActions.addshopWalletAdmin(req.body.userId, Number(req.body.money), 2, "Admin Addeed Chips", "roulette", req.body.adminname, req.body.adminid);

            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok" ,msg:"Successfully Credited...!!"});
        }
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {post} /admin/shopDeductMoney
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/agentDeductMoney', async (req, res) => {
    try {
        console.log("deductMoney ", req.body)
       
        const userInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name:1,chips: 1 })

        console.log("userInfo ", userInfo)

        if (userInfo != null && userInfo.chips < Number(req.body.money)) {
            res.json({ status: false,msg:"not enough chips to deduct user wallet" });
            return false
        }   

        await walletActions.deductshopWallet(req.body.userId,-Number(req.body.money),2, "Admin duduct Chips","roulette",req.body.adminname,req.body.adminid);

        if (req.body.adminname != 'Super Admin') {
            await walletActions.addagentWalletAdmin(req.body.adminid, Number(req.body.money), 2, "Sub Agent Deduct Chips Added", "roulette", req.body.adminname, req.body.adminid,req.body.userId,userInfo.name);
        }

        logger.info('admin/dahboard.js post dahboard  error => ');

        res.json({ status: "ok",msg:"Successfully Debited...!!" });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

async function createPhoneNumber() {
    const countryCode = "91";

    // Generate a random 9-digit mobile number
    const randomMobileNumber = Math.floor(Math.random() * 9000000000) + 1000000000;

    // Concatenate the country code and the random mobile number
    const indianMobileNumber = countryCode + randomMobileNumber;

    return indianMobileNumber;
}

module.exports = router;