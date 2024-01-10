const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const auth = require('./admin/auth');
const bet = require('./admin/bet');
const dashboard = require('./admin/dashboard');
const user = require('./admin/user');
const games = require('./admin/games');
const userhistory = require('./admin/userhistory');
const social = require('./admin/social');
const noticetext = require('./admin/Noticetext');
const gamementenance = require('./admin/gamementenance');
const notification = require('./admin/notification');
const banner = require('./admin/banner');
const bot = require('./admin/bot');





router.use('/', auth);
router.use('/lobbies', authMiddleware, bet);
router.use('/dashboard', authMiddleware, dashboard);
router.use('/user', user);
router.use('/games', authMiddleware, games);
router.use('/userhistory', authMiddleware, userhistory);
router.use('/social', authMiddleware, social);
router.use('/noticetext', authMiddleware, noticetext);
router.use('/gamementenance', authMiddleware, gamementenance);
router.use('/notification', authMiddleware, notification);
router.use('/banner', authMiddleware, banner);
router.use('/bot', bot);



module.exports = router;
