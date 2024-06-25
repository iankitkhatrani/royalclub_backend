const mongoose = require('mongoose');
const MongoID = mongoose.Types.ObjectId;

const Agent = mongoose.model('agent');
const AdminUser = mongoose.model("admin");
const Users = mongoose.model('users');
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
router.get('/UserList', async (req, res) => {
    try {
        
        console.info('requet => ', req.query);

        let userList = []
        if (req.query.Id == "SuperAdmin") {
            userList = await Users.find({}, {
                name: 1, id: 1, password: 1,
                "counters.totalMatch": 1, isVIP: 1, chips: 1, referralCode: 1, createdAt: 1,
                lastLoginDate: 1, status: 1, authorisedid: 1, authorisedtype: 1, authorisedname: 1,
                uniqueId:1
            }).sort({ createdAt: -1 })
    
        } else {
            userList = await Users.find({authorisedid: MongoID(req.query.Id)}, {
                name: 1, id: 1, password: 1,
                "counters.totalMatch": 1, isVIP: 1, chips: 1, referralCode: 1, createdAt: 1,
                lastLoginDate: 1, status: 1, authorisedid: 1, authorisedtype: 1, authorisedname: 1,
                uniqueId:1
            }).sort({ createdAt: -1 })
            
        }

        logger.info('admin/dahboard.js post dahboard  userList error => ', userList);

        res.json({ userList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/UserData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/UserData', async (req, res) => {
    try {
        console.info('requet => ', req.query);
        //
        const userInfo = await Users.findOne({ _id: new mongoose.Types.ObjectId(req.query.userId) }, { name: 1, id: 1, loginType: 1, profileUrl: 1, mobileNumber: 1, email: 1, uniqueId: 1, "counters.totalMatch": 1, deviceType: 1, chips: 1, referralCode: 1, createdAt: 1, lastLoginDate: 1, status: 1 })

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
router.post('/AddUser', async (req, res) => {
    try {

        if (
            req.body.password != undefined && req.body.password != null && req.body.password != "" &&
            req.body.name != undefined && req.body.name != null && req.body.name != "" &&
            req.body.authorisedid != undefined &&
            req.body.authorisedtype != undefined &&
            req.body.authorisedname != undefined
        ) {

            const Checksubagent = await Users.find({ name: req.body.name });
            console.log("Checksubagent ", Checksubagent)
            if (Checksubagent != undefined && Checksubagent.length > 0) {
                res.json({ status: false, msg: "This Users name is already taken. Please choose a different one." });
                return false
            }

            let response = {
                password: req.body.password,
                name: req.body.name,
                createdAt: new Date(),
                lastLoginDate: new Date(),
                authorisedid: req.body.authorisedid,
                authorisedtype: req.body.authorisedtype,
                authorisedname: req.body.authorisedname,
            }

            let RecentUser = await registerUser(response)

            logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

            res.json({ status: "ok" });
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
router.delete('/DeleteUser/:id', async (req, res) => {
    try {
        console.log("req ", req.params.id)

        const RecentUser = await Users.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })

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
router.put('/addMoney', async (req, res) => {
    try {
        console.log("Add Money ", req.body)
        if (req.body.authorisedtype == "SuperAdmin") {

            //SuperAdmin debit
            
            //User Credit
            await walletActions.addUserWallet(req.body.userId, Number(req.body.money),"credit", "Super Admin Added Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

             

        } else if (req.body.authorisedtype == "Admin") {

            const adminInfo = await AdminUser.findOne({ _id: new mongoose.Types.ObjectId(req.body.authorisedid) }, { name: 1, chips: 1 })

            console.log("adminInfo ", adminInfo)

            if (adminInfo != null && adminInfo.chips < Number(req.body.money)) {
                res.json({ status: false, msg: "not enough chips to adding user wallet" });
                return false
            }

            const UsersInfo = await Users.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1 })

            //await walletActions.deductadminWallet(req.body.adminid, -Number(req.body.money),"debit", "Add Chips to Agent", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);
            await walletActions.deductadminWallet(adminInfo._id, -Number(req.body.money),"debit", "Credited User Chips", "-","", "","",UsersInfo._id,"User",UsersInfo.name);


            await walletActions.addUserWallet(req.body.userId, Number(req.body.money),"credit", "Admin Added Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


        }else if (req.body.authorisedtype == "Agent") {

            const agentInfo = await Agent.findOne({ _id: new mongoose.Types.ObjectId(req.body.authorisedid) }, { name: 1, chips: 1 })

            console.log("agentInfo ", agentInfo)

            if (agentInfo != null && agentInfo.chips < Number(req.body.money)) {
                res.json({ status: false, msg: "not enough chips to adding user wallet" });
                return false
            }

            const UsersInfo = await Users.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1 })

            await walletActions.deductagentWallet(agentInfo._id, -Number(req.body.money),"debit", "Credited User Chips", "-","","","",UsersInfo._id,"User",UsersInfo.name);


            await walletActions.addUserWallet(req.body.userId, Number(req.body.money),"credit", "Agent Added Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

        }


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
router.put('/deductMoney', async (req, res) => {
    try {
        console.log("deductMoney ", req.body)

        const UserInfo = await Users.findOne({ _id: new mongoose.Types.ObjectId(req.body.userId) }, { name: 1,chips:1 })

        if (UserInfo != null && UserInfo.chips < Math.abs(req.body.money)) {
            res.json({ status: false, msg: "not enough chips to adding User wallet" });
            return false
        }


        //const RecentUser = //await Users.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)})
        if (req.body.authorisedtype == "SuperAdmin") {

            //SuperAdmin debit
            
            //User Credit
            await walletActions.deductuserWallet(req.body.userId, -Number(req.body.money),"debit", "Super Admin duduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

            res.json({ status: "ok", msg: "Successfully Debited...!!" });

            return false
             

        } else if (req.body.authorisedtype == "Admin") {

            await walletActions.addadminWalletAdmin(req.body.authorisedid, Number(req.body.money),"credit", "User to deduct Chips", "-","", "","",UserInfo._id,"User",UserInfo.name);


            await walletActions.deductuserWallet(req.body.userId, -Number(req.body.money),"debit", "Admin duduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Debited...!!" });

            return false

        } else if (req.body.authorisedtype == "Agent") {
            
            await walletActions.addagentWalletAdmin(req.body.authorisedid, Number(req.body.money),"credit", "User to deduct Chips", "-","","","",UserInfo._id,"User",UserInfo.name);


            await walletActions.deductuserWallet(req.body.userId, -Number(req.body.money),"debit", "Agent duduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


            logger.info('admin/dahboard.js post dahboard  error => ');

            res.json({ status: "ok", msg: "Successfully Debited...!!" });

            return false

        }
        logger.info('admin/dahboard.js post dahboard  error => ');

        res.json({ status: "ok" });
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