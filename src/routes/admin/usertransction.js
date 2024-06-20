const mongoose = require('mongoose');
const MongoID = mongoose.Types.ObjectId;

const Users = mongoose.model('users');
const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const UserWalletTracks = mongoose.model('userWalletTracks');
// const Userdeposit = mongoose.model('userdeposit');
// const Userpayout = mongoose.model('userpayout');
const ShopWalletTracks = mongoose.model("shopWalletTracks");
const AdminWalletTracks = mongoose.model("adminWalletTracks");
const SuperAdminWalletTracks = mongoose.model("superadminWalletTracks");


const AdminUser = mongoose.model("admin");
const Agent = mongoose.model('agent');



/**
* @api {post} /admin/AgentTranscationData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/AdminTranscationData', async (req, res) => {
    try {
        console.log('requet => ', req.query.Id);
        console.log('requet => type ', req.query.type);

        // const DepositeList = await ShopWalletTracks.find({  }, {
        //     DateandTime: 1, userId: 1, oppChips: 1, oppWinningChips: 1, chips: 1, winningChips: 1, trnxAmount: 1, gameType: 1, trnxTypeTxt: 1,
        //     adminname:1,adminid:1
        // }).sort({ DateandTime: -1 })
        

        let DepositeList = []
        if (req.query.type == "Admin") {

            DepositeList = await AdminWalletTracks.find({}, { createdAt: 1, name: 1, trnxTypeTxt: 1, trnxAmount: 1, oppChips: 1, chips: 1, adminname: 1, adminid: 1, shopid: 1, shopname: 1 }).sort({createdAt:-1})

        }
        // else if (req.query.type == "Agent") {

        //     let totalsubagent  = await Agent.find({ agentId: MongoID(req.query.Id) }, { _id: 1 })

        //     console.log("totalsubagent ",totalsubagent)
        //     let totalid = []
        //     for (let i = 0; i <= totalsubagent.length - 1; i++){
        //         totalid.push(MongoID(totalsubagent[i]._id))
        //     }

        //     DepositeList = await AgentWalletTracks.find({ shopId: {$in:totalid} }, { DateandTime:1,name:1,trnxTypeTxt:1,trnxAmount:1,oppChips:1,chips:1,adminname:1,adminid:1,shopid:1,shopname:1 })
        
        // }
        
        else if (req.query.type == "Agent") {

            DepositeList = await AdminWalletTracks.find({ agentId: MongoID(req.query.Id) }, { createdAt:1,name:1,trnxTypeTxt:1,trnxAmount:1,oppChips:1,chips:1,adminname:1,adminid:1,shopid:1,shopname:1 }).sort({createdAt:-1})
        }


        logger.info('admin/dahboard.js post dahboard  error => ', DepositeList);

        res.json({ DepositeList:DepositeList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/AdminTranscationData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/SuperAdminTranscationData', async (req, res) => {
    try {
        console.log('requet => ', req.query.Id);
        console.log('requet => type ', req.query.type);

        // const DepositeList = await ShopWalletTracks.find({  }, {
        //     DateandTime: 1, userId: 1, oppChips: 1, oppWinningChips: 1, chips: 1, winningChips: 1, trnxAmount: 1, gameType: 1, trnxTypeTxt: 1,
        //     adminname:1,adminid:1
        // }).sort({ DateandTime: -1 })
        

        let DepositeList = []
       
        DepositeList = await SuperAdminWalletTracks.find({}, { createdAt:1,name:1,trnxTypeTxt:1,trnxAmount:1,adminname:1,adminid:1,agentid:1,agentname:1 }).sort({createdAt:-1})

        logger.info('admin/dahboard.js post dahboard  error => ', DepositeList);

        res.json({ DepositeList:DepositeList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/SubAgentTranscationData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/SubAgentTranscationData', async (req, res) => {
    try {
        console.log('requet => ', req.query.Id);
        console.log('requet => type ', req.query.type);

        // const DepositeList = await ShopWalletTracks.find({  }, {
        //     DateandTime: 1, userId: 1, oppChips: 1, oppWinningChips: 1, chips: 1, winningChips: 1, trnxAmount: 1, gameType: 1, trnxTypeTxt: 1,
        //     adminname:1,adminid:1
        // }).sort({ DateandTime: -1 })
        

        let DepositeList = []
        if (req.query.type == "Admin") {

            DepositeList = await ShopWalletTracks.find({}, { createdAt:1,name:1,trnxTypeTxt:1,trnxAmount:1,oppChips:1,chips:1,adminname:1,adminid:1,userid:1,username:1 }).sort({createdAt:-1})

        } else if(req.query.type == "Agent") {

            let totalsubagent  = await Agent.find({ agentId: MongoID(req.query.Id) }, { _id: 1 })

            console.log("totalsubagent ",totalsubagent)
            let totalid = []
            for (let i = 0; i <= totalsubagent.length - 1; i++){
                totalid.push(MongoID(totalsubagent[i]._id))
            }

            DepositeList = await ShopWalletTracks.find({ shopId: {$in:totalid} }, { createdAt:1,name:1,trnxTypeTxt:1,trnxAmount:1,oppChips:1,chips:1,adminname:1,adminid:1,userid:1,username:1 }).sort({createdAt:-1})
        
        } else if (req.query.type == "Agent") {

            DepositeList = await ShopWalletTracks.find({ shopId: MongoID(req.query.Id) }, { createdAt:1,name:1,trnxTypeTxt:1,trnxAmount:1,oppChips:1,chips:1,adminname:1,adminid:1,userid:1,username:1 }).sort({createdAt:-1})
        }


        logger.info('admin/dahboard.js post dahboard  error => ', DepositeList);

        res.json({ DepositeList:DepositeList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/DepositList', async (req, res) => {
    try {
        //console.info('requet => ', req);

        //Agent Addeed Chips

        const DepositeList = await UserWalletTracks.find({ trnxTypeTxt:"Admin Addeed Chips" }, {
            DateandTime: 1, userId: 1, oppChips: 1, oppWinningChips: 1, chips: 1, winningChips: 1, trnxAmount: 1, gameType: 1, trnxTypeTxt: 1,
            adminname:1,adminid:1
        }).sort({DateandTime:-1})

        logger.info('admin/dahboard.js post dahboard  error => ', DepositeList);

        res.json({ DepositeList:DepositeList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {post} /admin/AcceptList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/AcceptList', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const AcceptList = await Userdeposit.find({ approve: 1, reject: 0 }, {
            name: 1, userId: 1, email: 1, "mobileno": 1, screenshort: 1, depositamount: 1, bankAc: 1, IFSCcode: 1,
            acname: 1, upi_id: 1, paymentmode: 1, status: 1, approve: 1, reject: 1, dateOfdeposit: 1
        })

        logger.info('admin/dahboard.js post dahboard  error => ', AcceptList);

        res.json({ AcceptList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/RejectList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/RejectList', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const RejectList = await Userdeposit.find({ approve: 0, reject: 1 }, {
            name: 1, userId: 1, email: 1, "mobileno": 1, screenshort: 1, depositamount: 1, bankAc: 1, IFSCcode: 1,
            acname: 1, upi_id: 1, paymentmode: 1, status: 1, approve: 1, reject: 1, dateOfdeposit: 1
        })

        logger.info('admin/dahboard.js post dahboard  error => ', RejectList);

        res.json({ RejectList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/DepositData', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const DepositeData = await Userdeposit.find({ _id: new mongoose.Types.ObjectId(req.query.id) }, { screenshort: 1, status: 1, approve: 1, reject: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', DepositeData);

        res.json({ DepositeData });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositeInsert
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.post('/DepositeInsert', async (req, res) => {
    try {
        console.log("req ", req.body)
        //currently send rendom number and generate 
        let response = {
            name: req.body.name,
            userId: req.body.userId,
            email: req.body.email,
            mobileno: req.body.mobileno,
            screenshort: req.body.screenshort,
            depositamount: req.body.depositamount,
            bankAc: req.body.bankAc,
            IFSCcode: req.body.IFSCcode,
            acname: req.body.acname,
            upi_id: req.body.upi_id,
            dateOfdeposit: new Date(),
            paymentmode: req.body.paymentmode,
            status: req.body.status,
            approve: req.body.approve,
            reject: req.body.reject
        }

        let RecentUser = await Userdeposit.create(response)

        logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);
        if (RecentUser != undefined) {
            res.json({ status: "ok" });
        } else {
            res.status(config.INTERNAL_SERVER_ERROR).json(error);
        }
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

var multer = require('multer')
var storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/deposite')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg') //Appending .jpg
    }
});
var upload = multer({ storage: storage1 })

router.post('/UploadScreenShort', upload.single('image'), async (req, res) => {
    try {
        console.log("(req.file ", req.file)
        if (req.file.path != 'undefined' && req.file.path != '' && req.file.path != null) {

            res.json({ flag: true, path: req.file.path.substr(7) });
        } else {
            res.json({ flag: false, path: "" });
        }

        logger.info('admin/dahboard.js post dahboard  inf o::: => ');

    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositeUpdate
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/DepositeUpdate', async (req, res) => {
    try {

        if (req.body.trnsId == undefined) {
            res.json({ status: false });
            return false;
        }
        console.log("req ", req.body)
        //currently send rendom number and generate 
        let response = {
            $set: {}
        }
        if (req.body.status != undefined) {
            response["$set"]["status"] = req.body.status
        }
        if (req.body.approve != undefined) {
            response["$set"]["approve"] = req.body.approve

        }
        if (req.body.reject != undefined) {
            response["$set"]["reject"] = req.body.reject

        }

        console.log("response ", response)

        console.log("response ", req.body)


        const userInfo = await Userdeposit.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.trnsId) }, response, { new: true });

        logger.info('admin/dahboard.js post dahboard  error => ', userInfo);


        res.json({ status: "ok" });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

//============================== Payout ===================================================

/**
* @api {post} /admin/PayoutList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/PayoutList', async (req, res) => {
    try {
        console.log('PayoutList requet => ', req);

        // const PayoutList = await Userpayout.find({ status: -1 }, {
        //     name: 1, userId: 1, email: 1, "mobileno": 1, screenshort: 1, payoutamount: 1, bankAc: 1, IFSCcode: 1,
        //     acname: 1, upi_id: 1, dateOfpayout: 1, paymentmode: 1, status: 1, approve: 1, reject: 1
        // })

        logger.info('admin/dahboard.js post dahboard  error => ', PayoutList);

        res.json({ PayoutList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});

/**
* @api {post} /admin/AcceptList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/PayoutAcceptList', async (req, res) => {
    try {
        console.log('PayoutAcceptList requet => ');

        const AcceptList = await UserWalletTracks.find({ trnxTypeTxt:"Admin duduct Chips" }, {
            DateandTime: 1, userId: 1, oppChips: 1, oppWinningChips: 1, chips: 1, winningChips: 1, trnxAmount: 1, gameType: 1, trnxTypeTxt: 1,
            adminname:1,adminid:1
        }).sort({DateandTime:-1})

        console.log('AcceptList requet => ', AcceptList);


        logger.info('admin/dahboard.js PayoutAcceptList post dahboard  error => ', AcceptList);

        res.json({ AcceptList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/RejectList
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/PayoutRejectList', async (req, res) => {
    try {
        console.log('PayoutRejectList requet => ', req);

        const RejectList = await Userpayout.find({ status: 0 }, {
            name: 1, userId: 1, email: 1, "mobileno": 1, screenshort: 1, payoutamount: 1, bankAc: 1, IFSCcode: 1,
            acname: 1, upi_id: 1, paymentmode: 1, status: 1, approve: 1, reject: 1, dateOfpayout: 1
        })

        logger.info('admin/dahboard.js post dahboard  error => ', RejectList);

        res.json({ RejectList });
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositeInsert
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.post('/PayoutInsert', async (req, res) => {
    try {
        console.log("req ", req.body)
        //currently send rendom number and generate 
        let response = {
            name: req.body.name,
            userId: req.body.userId,
            email: req.body.email,
            mobileno: req.body.mobileno,
            depositamount: req.body.depositamount,
            bankAc: req.body.bankAc,
            IFSCcode: req.body.IFSCcode,
            acname: req.body.acname,
            upi_id: req.body.upi_id,
            dateOfpayout: new Date(),
            paymentmode: req.body.paymentmode,
            status: req.body.status,
            approve: req.body.approve,
            reject: req.body.reject
        }

        let RecentUser = await Userpayout.create(response)

        logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);
        if (RecentUser != undefined) {
            res.json({ status: "ok" });
        } else {
            res.status(config.INTERNAL_SERVER_ERROR).json(error);
        }
    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/PayoutData
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/PayoutData', async (req, res) => {
    try {
        //console.info('requet => ', req);

        const PayouteData = await Userpayout.find({ _id: new mongoose.Types.ObjectId(req.query.id) }, { screenshort: 1, status: 1, approve: 1, reject: 1 })

        logger.info('admin/dahboard.js post dahboard  error => ', PayouteData);

        res.json({ PayouteData });
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

var multer = require('multer')
var storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/payout')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.jpg') //Appending .jpg
    }
});
var upload = multer({ storage: storage1 })

router.post('/UploadScreenShortPayOut', upload.single('image'), async (req, res) => {
    try {
        console.log("(req.file ", req.file)
        if (req.file.path != 'undefined' && req.file.path != '' && req.file.path != null) {

            res.json({ flag: true, path: req.file.path.substr(7) });
        } else {
            res.json({ flag: false, path: "" });
        }

        logger.info('admin/dahboard.js post dahboard  inf o::: => ');

    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


/**
* @api {post} /admin/DepositeUpdate
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.put('/PayoutUpdate', async (req, res) => {
    try {

        if (req.body.trnsId == undefined) {
            res.json({ status: false });
            return false;
        }
        console.log("req ", req.body)
        //currently send rendom number and generate 
        let response = {
            $set: {}
        }
        if (req.body.status != undefined) {
            response["$set"]["status"] = parseInt(req.body.status)
        }

        if (req.body.reject != undefined) {
            response["$set"]["reject"] = req.body.reject
        }

        if (req.body.approve != undefined) {
            response["$set"]["approve"] = req.body.approve
        }

        if (req.body.screenshort != undefined) {
            response["$set"]["screenshort"] = req.body.screenshort

        }

        console.log("response ", response)

        console.log("response ", req.body)


        const userInfo = await Userpayout.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(req.body.trnsId) }, response, { new: true });

        console.log("User INFO ", userInfo)

        logger.info('admin/dahboard.js post dahboard  error => ', userInfo);

        if (userInfo)
            res.json({ status: "ok" });
        else
            res.json({ status: "" });

    } catch (error) {
        logger.error('admin/dahboard.js post bet-list error => ', error);
        //res.send("error");

        res.status(config.INTERNAL_SERVER_ERROR).json(error);
    }
});


module.exports = router;