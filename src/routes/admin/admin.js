const mongoose = require('mongoose');
const AdminUser = mongoose.model('admin');
const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const { registerUser } = require('../../helper/signups/signupValidation');
const walletActions = require("../../common-function/walletTrackTransaction");
const Users = mongoose.model('users');
const Agent = mongoose.model('agent');


/**
 * @api {post} /admin/lobbies
 * @apiName  add-bet-list
 * @apiGroup  Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badges Array of badges document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/dashboardDataAdmin', async (req, res) => {
    try {
      console.log('requet dashboardDataAdmin1111111111111111 => ', req.query);
      let totalUser = 0;
      let totalAgent = 0
        
      if (req.query.Id == undefined || req.query.Id == "undefined" || req.query.Id == "Admin") {
        totalUser = await Users.find().count()
      } else {
        totalUser = await Users.find({ authorisedid: req.query.Id.toString() }).count()
  
    }
        
        if (req.query.Id == undefined || req.query.Id == "undefined" || req.query.Id == "Admin") {
            totalAgent = await Agent.find().count()
  
          } else {
            totalAgent = await Agent.find({authorisedid: req.query.Id.toString()}).count()
  
        }
        
        console.log("totalUser ",totalUser,totalAgent)
      

      res.json({totalUser , totalAgent});
    } catch (error) {
      logger.error('admin/dahboard.js post bet-list error => ', error);
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
router.get('/AdminList', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const adminList = await AdminUser.find({}, {
            name: 1, location: 1, createdAt: 1, lastLoginDate: 1, status: 1, password: 1, chips: 1,
            partnerpercentagejanata : 1 ,
            partnerpercentageroulette : 1 ,
            commission:1
         })

        logger.info('admin/dahboard.js post dahboard   adminList ', adminList);

        res.json({ adminList });
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
                partnerpercentagejanata: req.body.partnerpercentagejanata,
                partnerpercentageroulette: req.body.partnerpercentageroulette,
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
            req.body.commission != undefined &&
            req.body.partnerpercentagejanata != undefined &&
            req.body.partnerpercentageroulette != undefined &&
            req.body.status != undefined
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
                commission: req.body.commission,
                partnerpercentagejanata: req.body.partnerpercentagejanata,
                partnerpercentageroulette: req.body.partnerpercentageroulette,
                status: req.body.status,
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

        await walletActions.addadminWalletAdmin(req.body.userId, Number(req.body.money),"credit", "Super Admin Addeed Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);

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

        await walletActions.deductadminWallet(req.body.userId, -Number(req.body.money),"debit", "Super Admin duduct Chips", "-",req.body.authorisedid, req.body.authorisedtype,req.body.authorisedname);


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