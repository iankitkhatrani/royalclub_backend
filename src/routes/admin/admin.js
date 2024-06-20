const mongoose = require('mongoose');
const AdminUser = mongoose.model('admin');
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
router.get('/AdminList', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const agentList = await AdminUser.find({}, { name: 1, location: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1, chips: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', agentList);

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
router.get('/AdminData', async (req, res) => {
    try {
        console.info('requet => ', req.query);
        //
        const userInfo = await AdminUser.findOne({ _id: new mongoose.Types.ObjectId(req.query.userId) }, { name: 1, password: 1, location: 1, createdAt: 1, lastLoginDate: 1, status: 1 })

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
router.put('/AdminUpdate', async (req, res) => {
    try {

        const Checkagent = await AdminUser.find({ _id: { $ne: new mongoose.Types.ObjectId(req.body.userId) },name: req.body.name });
        console.log("Checkagent ", Checkagent)
        if (Checkagent != undefined && Checkagent.length > 0) {
            res.json({ status: false, msg: "This Admin User name is already taken. Please choose a different one." });
            return false
        }

        console.log("req ", req.body)
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


        const userInfo = await AdminUser.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.userId) }, response, { new: true });

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
router.post('/AddAdmin', async (req, res) => {
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

            const Checkagent = await AdminUser.find({ name: req.body.name });
            console.log("Checkagent ", Checkagent)
            if (Checkagent != undefined && Checkagent.length > 0) {
                res.json({ status: false, msg: "This Admin User name is already taken. Please choose a different one." });
                return false
            }

            let response = {
                password: req.body.password,
                name: req.body.name,
                createdAt: new Date(),
                lastLoginDate: new Date(),
                status: req.body.status,
                location: req.body.location
            }

            console.log("response ", response)
            let insertRes = await AdminUser.create(response);

            console.log("insertRes ", Object.keys(insertRes).length)

            if (Object.keys(insertRes).length > 0) {
                res.json({ res: true, status: "ok" });
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
router.delete('/Deleteadmin/:id', async (req, res) => {
    try {
        console.log("req ", req.params.id)

        const RecentUser = await AdminUser.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })

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
router.put('/adminAddMoney', async (req, res) => {
    try {
        console.log("Add Money ", req.body)
        //const RecentUser = //await Users.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)})

        await walletActions.addagentWalletAdmin(req.body.userId, Number(req.body.money), 2, "Super Admin Addeed Chips", "roulette", req.body.adminname, req.body.adminid);

        logger.info('admin/dahboard.js post dahboard  error => ');

        res.json({ status: "ok", msg: "Successfully Credited...!!" });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {post} /admin/deductMoney
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/adminDeductMoney', async (req, res) => {
    try {
        console.log("adminDeductMoney ", req.body)
        //const RecentUser = //await Users.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)})

        await walletActions.deductagentWallet(req.body.userId, -Number(req.body.money), 2, "Super Admin duduct Chips", "roulette", req.body.adminname, req.body.adminid);


        logger.info('admin/dahboard.js post dahboard  error => ');

        res.json({ status: "ok", msg: "Successfully Credited...!!" });
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