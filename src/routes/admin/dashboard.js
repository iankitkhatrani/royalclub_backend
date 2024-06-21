const mongoose = require('mongoose');
const Users = mongoose.model('users');
const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const UserWalletTracks = mongoose.model("userWalletTracks");
const AgentWalletTracks = mongoose.model("agentWalletTracks");
const AdminWalletTracks = mongoose.model("adminWalletTracks");
const SuperAdminWalletTracks = mongoose.model("adminWalletTracks");
const gamePlayActionsRoulette = require('../../roulette/gamePlay');
const adminwinloss = mongoose.model('adminwinloss');
const RouletteUserHistory = mongoose.model('RouletteUserHistory');
const moment = require('moment');
const AdminUser = mongoose.model("admin");
const Agent = mongoose.model('agent');

/**
 * @api {post} /admin/lobbies
 * @apiName  add-bet-list
 * @apiGroup  Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badges Array of badges document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/', async (req, res) => {
    try {
      //console.info('requet => ', req);
      const totalUser = await Users.find().count()
      const totalDeposit = 100;
      const totalWithdraw = 15100;
      const todayDeposit = 151;
      const todayWithdraw = 494;
      const todayKYC = 65464;
      const totalGamePay = 41654;


      logger.info('admin/dahboard.js post dahboard  error => ', totalUser);

      res.json({totalUser,totalDeposit,totalWithdraw,todayDeposit,todayWithdraw,todayKYC,totalGamePay});
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
router.get('/latatestUser', async (req, res) => {
    try {
      //console.info('requet => ', req);
      let t = new Date().setSeconds(new Date().getSeconds() - 604800);
        
        logger.info('admin/dahboard.js post dahboard  error => ', t);
      const RecentUser = await Users.find({ createdAt :{$gte: new Date(t) } },{username:1,id:1,createdAt:1})
      
      logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

      res.json({RecentUser});
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
router.get('/latatestAdmin', async (req, res) => {
  try {
    console.log('requet => latatestShop ', req.query);
    let t = new Date().setSeconds(new Date().getSeconds() - 604800);

    logger.info('admin/dahboard.js post dahboard  error => ', t);
    let RecentUser = []

    RecentUser = await AdminUser.find({ createdAt: { $gte: new Date(t) } }, { name: 1, id: 1, createdAt: 1 })

    logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

    res.json({ RecentUser });
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
router.get('/latatestAgent', async (req, res) => {
  try {
    console.log('requet => latatestAgent ', req.query);
    let t = new Date().setSeconds(new Date().getSeconds() - 604800);

    logger.info('admin/dahboard.js post dahboard  error => ', t);
    let RecentUser = []

    RecentUser = await Agent.find({ createdAt: { $gte: new Date(t) } }, { name: 1, id: 1, createdAt: 1 })

    logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

    res.json({ RecentUser });
  } catch (error) {
    logger.error('admin/dahboard.js post bet-list error => ', error);
    res.status(config.INTERNAL_SERVER_ERROR).json(error);
  }
});

function AddTime(sec) {
  let t = new Date();
  return t.setSeconds(t.getSeconds() + sec);
}


module.exports.AddTimeLAST = (t) => {
  try {
      const ut = new Date();
      ut.setUTCHours(23);
      ut.setUTCMinutes(59);
      ut.setUTCSeconds(0);
      ut.setSeconds(ut.getSeconds() + Number(t));

      ut.setUTCHours(0);
      ut.setUTCMinutes(0);
      ut.setUTCSeconds(0);
      ut.setUTCMilliseconds(0);



      return ut;
  } catch (error) {
      logger.error('socketFunction.js AddTime error :--> ' + error);
  }
};


  
  module.exports = router;