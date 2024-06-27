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

const walletActions = require("../../common-function/walletTrackTransaction");

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
        let agentList = []
        if (req.query.agentId == "SuperAdmin") {
            agentList = await Agent.find({}, { name: 1, chips: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1, authorisedid: 1, authorisedtype: 1, authorisedname: 1, commission: 1, partnerpercentagejanata: 1,partnerpercentageroulette:1, type: 1 })

        } else {
            agentList = await Agent.find({ authorisedid: MongoID(req.query.agentId) }, { name: 1, chips: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1, authorisedid: 1, authorisedtype: 1, authorisedname: 1, commission: 1, partnerpercentagejanata: 1,partnerpercentageroulette:1, type: 1 })
        }
        logger.info('ShopList admin/dahboard.js post dahboard  error => ', agentList);

        res.json({ agentList });
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

        const Checksubagent = await Agent.find({ _id: { $ne: new mongoose.Types.ObjectId(req.body.userId) }, name: req.body.name });
        console.log("Checksubagent ", Checksubagent)
        if (Checksubagent != undefined && Checksubagent.length > 0) {
            res.json({ status: false, msg: "This Agent name is already taken. Please choose a different one." });
            return false
        }


        //currently send rendom number and generate 
        let response = {
            $set: {
                password: req.body.password,
                name: req.body.name,
                status: req.body.status,
                commission: req.body.commission,
                partnerpercentagejanata: req.body.partnerpercentagejanata,
                partnerpercentageroulette:req.body.partnerpercentageroulette
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
            req.body.status != undefined &&
            req.body.commission != undefined &&
            req.body.partnerpercentagejanata != undefined &&
            req.body.partnerpercentageroulette != undefined &&
            req.body.authorisedid != undefined &&
            req.body.authorisedtype != undefined &&
            req.body.authorisedname != undefined
        ) {

            const Checksubagent = await Agent.find({ name: req.body.name });
            console.log("Checksubagent ", Checksubagent)
            if (Checksubagent != undefined && Checksubagent.length > 0) {
                res.json({ status: false, msg: "This Agent name is already taken. Please choose a different one." });
                return false
            }


            let response = {
                password: req.body.password,
                name: req.body.name,
                createdAt: new Date(),
                lastLoginDate: new Date(),
                status: req.body.status,
                commission: req.body.commission,
                partnerpercentagejanata: req.body.partnerpercentagejanata,
                partnerpercentageroulette: req.body.partnerpercentageroulette,
                authorisedid :req.body.authorisedid,
                authorisedtype: req.body.authorisedtype,
                authorisedname: req.body.authorisedname,
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
        console.log("adminname ", req.body.authorisedtype)
        if (req.body.authorisedtype == 'Admin') {

            const adminInfo = await AdminUser.findOne({ _id: new mongoose.Types.ObjectId(req.body.authorisedid) }, { name: 1, chips: 1 })

            console.log("adminInfo ", adminInfo)

            if (adminInfo != null && adminInfo.chips < Number(req.body.money)) {
                res.json({ status: false, msg: "not enough chips to adding user wallet" });
                return false
            }

            const AgentInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1 })

            //await walletActions.deductadminWallet(req.body.adminid, -Number(req.body.money),"debit", "Add Chips to Agent", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);
            await walletActions.deductadminWallet(adminInfo._id, -Number(req.body.money),"debit", "Credited Agent Chips", "-","", "","",AgentInfo._id,"Agent",AgentInfo.name);


            await walletActions.addagentWalletAdmin(req.body.userId, Number(req.body.money),"credit", "Admin Addeed Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Credited...!!" });

        } else {

            await walletActions.addagentWalletAdmin(req.body.userId, Number(req.body.money),"credit", "Super Admin Addeed Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Credited...!!" });
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

        const AgentInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1,chips:1 })

        if (AgentInfo != null && AgentInfo.chips < Math.abs(req.body.money)) {
            res.json({ status: false, msg: "not enough chips to adding Agent wallet" });
            return false
        }

        console.log("adminname ", req.body.adminname)
        if (req.body.authorisedtype == 'Admin') {

            await walletActions.addadminWalletAdmin(req.body.authorisedid, Number(req.body.money),"credit", "Agent to deduct Chips", "-","", "","",AgentInfo._id,"Agent",AgentInfo.name);


            await walletActions.deductagentWallet(req.body.userId, -Number(req.body.money),"debit", " Admin deduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Debited...!!" });

            
        } else {

            await walletActions.deductagentWallet(req.body.userId, -Number(req.body.money),"debit", "Super Admin deduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Debited...!!" });
        }

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