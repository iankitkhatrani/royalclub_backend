const mongoose = require('mongoose');

const GameUser = mongoose.model('users');
const CONST = require('../../constant');
const commandAcions = require('../helper/socketFunctions');
const logger = require('../../logger');
const adminWalletTracks = require('../models/adminWalletTracks');
const MongoID = mongoose.Types.ObjectId;
const AdminUser = mongoose.model("admin");
const Agent = mongoose.model('agent');
const Superadmin = mongoose.model('superadmin');


const AgentWalletTracks = mongoose.model("agentWalletTracks");
const AdminWalletTracks = mongoose.model("adminWalletTracks");
const SuperAdminWalletTracks = mongoose.model("superadminWalletTracks");
const UserWalletTracks = mongoose.model('userWalletTracks');




//==========================================================================================================================================
// User Game =========================

module.exports.deductuserWalletGame = async (id, deductChips, tType, t, game, tableid) => {
  try {
    logger.info('\deductuserWallet : call.-->>>', id, deductChips, t);
    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };

    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return 0;
    }

    deductChips = Number(deductChips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1,
      sckId: 1,
      flags: 1,
      _id:1
    }

    const adminInfo = await GameUser.findOne(wh, projection);
    logger.info("deductuserWallet adminInfo : ", adminInfo);

    if (adminInfo == null) {
      return false;
    }
    logger.info("deductuserWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    logger.info("deductuserWallet.chips =>", adminInfo.chips)

    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = deductChips;

    if (adminInfo.chips > 0 && deductChips < 0) {

      setInfo['$inc']['chips'] = (adminInfo.chips + deductChips) >= 0 ? Number(deductChips) : Number(-adminInfo.chips);
      setInfo['$inc']['chips'] = Number(setInfo['$inc']['chips'].toFixed(2))

      let chips = adminInfo.chips;

      adminInfo.chips = (adminInfo.chips + deductChips) >= 0 ? (Number(adminInfo.chips) + Number(deductChips)) : 0;
      adminInfo.chips = Number(Number(adminInfo.chips).toFixed(2));

      deductChips = (deductChips + adminInfo.chips) >= 0 ? 0 : (Number(deductChips) + Number(chips));
      deductChips = Number(Number(deductChips).toFixed(2));
    }

    logger.info("\deductuserWallet setInfo :: --->", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("deductuserWallet adminInfo :: ==>", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\deductuserWallet wh :: ", wh, setInfo);
    let upReps = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\deductuserWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    //upReps.winningChips = (typeof upReps.winningChips == 'undefined' || isNaN(upReps.winningChips)) ? 0 : Number(upReps.winningChips);
    let totalRemaningAmount = upReps.chips //+ upReps.winningChips;

    if (typeof tType != 'undefined') {

      let walletTrack = {
        userId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        tbaleid: tableid
      }
      await this.trackUserWallet(walletTrack);




    }

    if ((typeof upReps.chips.toString().split(".")[1] != "undefined" && upReps.chips.toString().split(".")[1].length > 2)) {

      let updateData = {
        $set: {}
      }
      updateData["$set"]["chips"] = parseFloat(upReps.chips.toFixed(2))
      if (Object.keys(updateData.$set).length > 0) {
        let upRepss = await GameUser.findOneAndUpdate(wh, updateData, { new: true });
        logger.info("\ndedudctWallet upRepss  :: ", upRepss);
      }
    }

    logger.info(" adminInfo.sckId.toString() => ", adminInfo.sckId)
    logger.info(" upReps adminInfo.sckId => ", upReps.sckId)

    commandAcions.sendDirectEvent(adminInfo.sckId, CONST.WALLET_UPDATE, {
      chips: upReps.chips,
      totalWallet: totalRemaningAmount,
      msg: t,
      userid:upReps._id.toString()
    });

    return totalRemaningAmount;
  } catch (e) {
    logger.info("deductuserWallet : 1 : Exception : 1", e)
    return 0
  }
}


module.exports.addUserWalletGame = async (id, added_chips, tType, t, game, tableid) => {
  try {
    logger.info('\n addUserWallet : call.-->>>', id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname);

    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return false;
    }
    added_chips = Number(added_chips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1,
      sckId:1
    }

    const adminInfo = await GameUser.findOne(wh, projection);
    logger.info("addUserWallet adminInfo : ", adminInfo);
    if (adminInfo == null) {
      return false;
    }
    logger.info("addUserWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = added_chips;

    setInfo['$inc']['chips'] = Number(Number(added_chips).toFixed(2));

    adminInfo.chips = Number(adminInfo.chips) + Number(added_chips);
    adminInfo.chips = Number(adminInfo.chips.toFixed(2))


    logger.info("\addUserWallet setInfo :: ", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("addUserWallet adminInfo :: ", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\addUserWallet wh :: ", wh, setInfo);
    let upReps = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\addUserWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    let totalRemaningAmount = upReps.chips

    if (typeof tType != 'undefined') {

      let walletTrack = {
        userId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        tbaleid: tableid
      }
      await this.trackUserWallet(walletTrack);
    }

    commandAcions.sendDirectEvent(adminInfo.sckId, CONST.WALLET_UPDATE, {
      // winningChips: upReps.winningChips,
       chips: upReps.chips,
       totalWallet: totalRemaningAmount,
       msg: t,
       userid:upReps._id.toString()
   });

    return totalRemaningAmount;
  } catch (e) {
    logger.info("addUserWallet : 1 : Exception : 1", e)
    return 0
  }
}


//==========================================================================================================================================
// User =========================

module.exports.deductuserWallet = async (id, deductChips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\deductuserWallet : call.-->>>', id, deductChips, t);
    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };

    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return 0;
    }

    deductChips = Number(deductChips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await GameUser.findOne(wh, projection);
    logger.info("deductuserWallet adminInfo : ", adminInfo);

    if (adminInfo == null) {
      return false;
    }
    logger.info("deductuserWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    logger.info("deductuserWallet.chips =>", adminInfo.chips)

    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = deductChips;

    if (adminInfo.chips > 0 && deductChips < 0) {

      setInfo['$inc']['chips'] = (adminInfo.chips + deductChips) >= 0 ? Number(deductChips) : Number(-adminInfo.chips);
      setInfo['$inc']['chips'] = Number(setInfo['$inc']['chips'].toFixed(2))

      let chips = adminInfo.chips;

      adminInfo.chips = (adminInfo.chips + deductChips) >= 0 ? (Number(adminInfo.chips) + Number(deductChips)) : 0;
      adminInfo.chips = Number(Number(adminInfo.chips).toFixed(2));

      deductChips = (deductChips + adminInfo.chips) >= 0 ? 0 : (Number(deductChips) + Number(chips));
      deductChips = Number(Number(deductChips).toFixed(2));
    }

    logger.info("\deductuserWallet setInfo :: --->", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("deductuserWallet adminInfo :: ==>", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\deductuserWallet wh :: ", wh, setInfo);
    let upReps = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\deductuserWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    //upReps.winningChips = (typeof upReps.winningChips == 'undefined' || isNaN(upReps.winningChips)) ? 0 : Number(upReps.winningChips);
    let totalRemaningAmount = upReps.chips //+ upReps.winningChips;

    if (typeof tType != 'undefined') {

      let walletTrack = {
        userId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackUserWallet(walletTrack);


      if (authorisedtype != undefined && authorisedtype == "SuperAdmin") {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "credit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: Math.abs(tranferAmount),
          id: wh._id.toString(),
          type: "User",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }

    return totalRemaningAmount;
  } catch (e) {
    logger.info("deductuserWallet : 1 : Exception : 1", e)
    return 0
  }
}


module.exports.addUserWallet = async (id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\n addUserWallet : call.-->>>', id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname);

    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return false;
    }
    added_chips = Number(added_chips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await GameUser.findOne(wh, projection);
    logger.info("addUserWallet adminInfo : ", adminInfo);
    if (adminInfo == null) {
      return false;
    }
    logger.info("addUserWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = added_chips;

    setInfo['$inc']['chips'] = Number(Number(added_chips).toFixed(2));

    adminInfo.chips = Number(adminInfo.chips) + Number(added_chips);
    adminInfo.chips = Number(adminInfo.chips.toFixed(2))


    logger.info("\addUserWallet setInfo :: ", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("addUserWallet adminInfo :: ", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\addUserWallet wh :: ", wh, setInfo);
    let upReps = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\addUserWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    let totalRemaningAmount = upReps.chips

    if (typeof tType != 'undefined') {

      let walletTrack = {
        userId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackUserWallet(walletTrack);


      if (authorisedtype != undefined && authorisedtype == "SuperAdmin") {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "debit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: tranferAmount,
          id: wh._id.toString(),
          type: "User",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }


    return totalRemaningAmount;
  } catch (e) {
    logger.info("addUserWallet : 1 : Exception : 1", e)
    return 0
  }
}

//==========================================================================================================================================
// Admin =========================

module.exports.deductadminWallet = async (id, deductChips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\ndedudctWallet : call.-->>>', id, deductChips, t);
    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };

    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return 0;
    }

    deductChips = Number(deductChips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await AdminUser.findOne(wh, projection);
    logger.info("dedudctWallet adminInfo : ", adminInfo);

    if (adminInfo == null) {
      return false;
    }
    logger.info("dedudctWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    logger.info("adminInfo.chips =>", adminInfo.chips)

    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = deductChips;

    if (adminInfo.chips > 0 && deductChips < 0) {

      setInfo['$inc']['chips'] = (adminInfo.chips + deductChips) >= 0 ? Number(deductChips) : Number(-adminInfo.chips);
      setInfo['$inc']['chips'] = Number(setInfo['$inc']['chips'].toFixed(2))

      let chips = adminInfo.chips;

      adminInfo.chips = (adminInfo.chips + deductChips) >= 0 ? (Number(adminInfo.chips) + Number(deductChips)) : 0;
      adminInfo.chips = Number(Number(adminInfo.chips).toFixed(2));

      deductChips = (deductChips + adminInfo.chips) >= 0 ? 0 : (Number(deductChips) + Number(chips));
      deductChips = Number(Number(deductChips).toFixed(2));
    }

    logger.info("\ndedudctWallet setInfo :: --->", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("dedudctWallet adminInfo :: ==>", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\ndedudctWallet wh :: ", wh, setInfo);
    let upReps = await AdminUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\ndedudctWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    //upReps.winningChips = (typeof upReps.winningChips == 'undefined' || isNaN(upReps.winningChips)) ? 0 : Number(upReps.winningChips);
    let totalRemaningAmount = upReps.chips //+ upReps.winningChips;

    // if (typeof tType != 'undefined') {

    //   let walletTrack = {
    //     name: adminInfo.name,
    //     agentId: wh._id.toString(),
    //     trnxType: tType,
    //     trnxTypeTxt: t,
    //     trnxAmount: tranferAmount,
    //     oppChips: opChips,
    //     chips: upReps.chips,
    //     totalBucket: totalRemaningAmount,
    //     gameType: game,
    //     adminname: adminname != undefined ? adminname : "",
    //     adminid: adminid != undefined ? adminid : "",
    //     shopid: shopid != undefined ? shopid : "",
    //     shopname: shopname != undefined ? shopname : "",
    //   }
    //   await this.trackAgentWallet(walletTrack);

    //   if (shopid == undefined || shopid == "") {
    //     let walletTrack1 = {
    //       trnxType: tType,
    //       trnxTypeTxt: t,
    //       trnxAmount: tranferAmount,
    //       gameType: game,
    //       adminname: adminname != undefined ? adminname : "",
    //       adminid: adminid != undefined ? adminid : "",
    //       agentid: wh._id.toString(),
    //       agentname: adminInfo.name,
    //     }
    //     await this.trackAdminWallet(walletTrack1);
    //   }

    // }

    if (typeof tType != 'undefined') {

      let walletTrack = {
        adminId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackAdmintWallet(walletTrack);


      if (authorisedid != undefined) {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "credit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: Math.abs(tranferAmount),
          id: wh._id.toString(),
          type: "admin",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }

    return totalRemaningAmount;
  } catch (e) {
    logger.info("deductWallet : 1 : Exception : 1", e)
    return 0
  }
}


module.exports.addadminWalletAdmin = async (id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\addadminWalletAdmin : call.-->>>', id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname);

    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return false;
    }
    added_chips = Number(added_chips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await AdminUser.findOne(wh, projection);
    logger.info("addadminWalletAdmin adminInfo : ", adminInfo);
    if (adminInfo == null) {
      return false;
    }
    logger.info("addadminWalletAdmin adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = added_chips;

    setInfo['$inc']['chips'] = Number(Number(added_chips).toFixed(2));

    adminInfo.chips = Number(adminInfo.chips) + Number(added_chips);
    adminInfo.chips = Number(adminInfo.chips.toFixed(2))


    logger.info("\addadminWalletAdmin setInfo :: ", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("addadminWalletAdmin adminInfo :: ", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\addadminWalletAdmin wh :: ", wh, setInfo);
    let upReps = await AdminUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\addadminWalletAdmin upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    let totalRemaningAmount = upReps.chips

    if (typeof tType != 'undefined') {

      let walletTrack = {
        adminId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackAdmintWallet(walletTrack);


      if (authorisedid != undefined) {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "debit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: tranferAmount,
          id: wh._id.toString(),
          type: "admin",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }


    return totalRemaningAmount;
  } catch (e) {
    logger.info("addagentWalletAdmin : 1 : Exception : 1", e)
    return 0
  }
}


// Agent ================================

// module.exports.deductshopWallet = async (id, deductChips, tType, t, game, adminname, adminid, userid, username) => {
//   try {
//     logger.info('\ndedudctWallet : call.-->>>', id, deductChips, t);
//     const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };

//     if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
//       return 0;
//     }

//     deductChips = Number(deductChips.toFixed(2));
//     let projection = {
//       name: 1,
//       chips: 1
//     }

//     const ShopInfo = await Shop.findOne(wh, projection);
//     logger.info("dedudctWallet ShopInfo : ", ShopInfo);

//     if (ShopInfo == null) {
//       return false;
//     }
//     logger.info("dedudctWallet ShopInfo :: ", ShopInfo);

//     ShopInfo.chips = (typeof ShopInfo.chips == 'undefined' || isNaN(ShopInfo.chips)) ? 0 : Number(ShopInfo.chips);

//     let opChips = ShopInfo.chips;


//     logger.info("ShopInfo.chips =>", ShopInfo.chips)

//     let setInfo = {
//       $inc: {}
//     };
//     let totalDeductChips = deductChips;

//     if (ShopInfo.chips > 0 && deductChips < 0) {

//       setInfo['$inc']['chips'] = (ShopInfo.chips + deductChips) >= 0 ? Number(deductChips) : Number(-ShopInfo.chips);
//       setInfo['$inc']['chips'] = Number(setInfo['$inc']['chips'].toFixed(2))

//       let chips = ShopInfo.chips;

//       ShopInfo.chips = (ShopInfo.chips + deductChips) >= 0 ? (Number(ShopInfo.chips) + Number(deductChips)) : 0;
//       ShopInfo.chips = Number(Number(ShopInfo.chips).toFixed(2));

//       deductChips = (deductChips + ShopInfo.chips) >= 0 ? 0 : (Number(deductChips) + Number(chips));
//       deductChips = Number(Number(deductChips).toFixed(2));
//     }

//     logger.info("\ndedudctWallet setInfo :: --->", setInfo);
//     let tranferAmount = totalDeductChips;
//     logger.info("dedudctWallet ShopInfo :: ==>", ShopInfo);

//     if (Object.keys(setInfo["$inc"]).length > 0) {
//       for (let key in setInfo["$inc"]) {
//         setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
//       }
//     }
//     if (Object.keys(setInfo["$inc"]).length == 0) {
//       delete setInfo["$inc"];
//     }

//     logger.info("\ndedudctWallet wh :: ", wh, setInfo);
//     let upReps = await Shop.findOneAndUpdate(wh, setInfo, { new: true });
//     logger.info("\ndedudctWallet upReps :: ", upReps);

//     upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
//     //upReps.winningChips = (typeof upReps.winningChips == 'undefined' || isNaN(upReps.winningChips)) ? 0 : Number(upReps.winningChips);
//     let totalRemaningAmount = upReps.chips //+ upReps.winningChips;

//     if (typeof tType != 'undefined') {

//       let walletTrack = {
//         name: ShopInfo.name,
//         shopId: wh._id.toString(),
//         userid: userid,
//         username: username,
//         trnxType: tType,
//         trnxTypeTxt: t,
//         trnxAmount: tranferAmount,
//         oppChips: opChips,
//         chips: upReps.chips,
//         totalBucket: totalRemaningAmount,
//         gameType: game,
//         adminname: adminname != undefined ? adminname : "",
//         adminid: adminid != undefined ? adminid : "",
//         userid: userid != undefined ? userid : "",
//         username: username != undefined ? username : ""
//       }
//       await this.trackShopWallet(walletTrack);
//     }



//     return totalRemaningAmount;
//   } catch (e) {
//     logger.info("deductWallet : 1 : Exception : 1", e)
//     return 0
//   }
// }


// module.exports.addshopWalletAdmin = async (id, added_chips, tType, t, game, adminname, adminid, userid, username) => {
//   try {
//     logger.info('\addagentWalletAdmin : call.-->>>', id, added_chips, t);
//     const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
//     if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
//       return false;
//     }
//     added_chips = Number(added_chips.toFixed(2));
//     let projection = {
//       name: 1,
//       email: 1,
//       chips: 1
//     }

//     const ShopInfo = await Shop.findOne(wh, projection);
//     logger.info("addagentWalletAdmin ShopInfo : ", ShopInfo);
//     if (ShopInfo == null) {
//       return false;
//     }
//     logger.info("addagentWalletAdmin ShopInfo :: ", ShopInfo);

//     ShopInfo.chips = (typeof ShopInfo.chips == 'undefined' || isNaN(ShopInfo.chips)) ? 0 : Number(ShopInfo.chips);
//     //ShopInfo.winningChips = (typeof ShopInfo.winningChips == 'undefined' || isNaN(ShopInfo.winningChips)) ? 0 : Number(ShopInfo.winningChips);

//     //let opGameWinning = ShopInfo.winningChips;
//     let opChips = ShopInfo.chips;


//     let setInfo = {
//       $inc: {}
//     };
//     let totalDeductChips = added_chips;

//     setInfo['$inc']['chips'] = Number(Number(added_chips).toFixed(2));

//     ShopInfo.chips = Number(ShopInfo.chips) + Number(added_chips);
//     ShopInfo.chips = Number(ShopInfo.chips.toFixed(2))


//     logger.info("\addagentWalletAdmin setInfo :: ", setInfo);
//     let tranferAmount = totalDeductChips;
//     logger.info("addagentWalletAdmin ShopInfo :: ", ShopInfo);

//     if (Object.keys(setInfo["$inc"]).length > 0) {
//       for (let key in setInfo["$inc"]) {
//         setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
//       }
//     }
//     if (Object.keys(setInfo["$inc"]).length == 0) {
//       delete setInfo["$inc"];
//     }

//     logger.info("\addagentWalletAdmin wh :: ", wh, setInfo);
//     let upReps = await Shop.findOneAndUpdate(wh, setInfo, { new: true });
//     logger.info("\addagentWalletAdmin upReps :: ", upReps);

//     upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
//     let totalRemaningAmount = upReps.chips

//     if (typeof tType != 'undefined') {

//       let walletTrack = {
//         name: ShopInfo.name,
//         shopId: wh._id.toString(),
//         trnxType: tType,
//         trnxTypeTxt: t,
//         trnxAmount: tranferAmount,
//         oppChips: opChips,
//         chips: upReps.chips,
//         totalBucket: totalRemaningAmount,
//         gameType: game,
//         adminname: adminname != undefined ? adminname : "",
//         adminid: adminid != undefined ? adminid : "",
//         userid: userid != undefined ? userid : "",
//         username: username != undefined ? username : ""
//       }
//       await this.trackShopWallet(walletTrack);
//     }


//     return totalRemaningAmount;
//   } catch (e) {
//     logger.info("addagentWalletAdmin : 1 : Exception : 1", e)
//     return 0
//   }
// }

module.exports.deductagentWallet = async (id, deductChips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\ndedudctWallet : call.-->>>', id, deductChips, t);
    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };

    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return 0;
    }

    deductChips = Number(deductChips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await Agent.findOne(wh, projection);
    logger.info("dedudctWallet adminInfo : ", adminInfo);

    if (adminInfo == null) {
      return false;
    }
    logger.info("dedudctWallet adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    logger.info("adminInfo.chips =>", adminInfo.chips)

    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = deductChips;

    if (adminInfo.chips > 0 && deductChips < 0) {

      setInfo['$inc']['chips'] = (adminInfo.chips + deductChips) >= 0 ? Number(deductChips) : Number(-adminInfo.chips);
      setInfo['$inc']['chips'] = Number(setInfo['$inc']['chips'].toFixed(2))

      let chips = adminInfo.chips;

      adminInfo.chips = (adminInfo.chips + deductChips) >= 0 ? (Number(adminInfo.chips) + Number(deductChips)) : 0;
      adminInfo.chips = Number(Number(adminInfo.chips).toFixed(2));

      deductChips = (deductChips + adminInfo.chips) >= 0 ? 0 : (Number(deductChips) + Number(chips));
      deductChips = Number(Number(deductChips).toFixed(2));
    }

    logger.info("\ndedudctWallet setInfo :: --->", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("dedudctWallet adminInfo :: ==>", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\ndedudctWallet wh :: ", wh, setInfo);
    let upReps = await Agent.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\ndedudctWallet upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    //upReps.winningChips = (typeof upReps.winningChips == 'undefined' || isNaN(upReps.winningChips)) ? 0 : Number(upReps.winningChips);
    let totalRemaningAmount = upReps.chips //+ upReps.winningChips;

    // if (typeof tType != 'undefined') {

    //   let walletTrack = {
    //     name: adminInfo.name,
    //     agentId: wh._id.toString(),
    //     trnxType: tType,
    //     trnxTypeTxt: t,
    //     trnxAmount: tranferAmount,
    //     oppChips: opChips,
    //     chips: upReps.chips,
    //     totalBucket: totalRemaningAmount,
    //     gameType: game,
    //     adminname: adminname != undefined ? adminname : "",
    //     adminid: adminid != undefined ? adminid : "",
    //     shopid: shopid != undefined ? shopid : "",
    //     shopname: shopname != undefined ? shopname : "",
    //   }
    //   await this.trackAgentWallet(walletTrack);

    //   if (shopid == undefined || shopid == "") {
    //     let walletTrack1 = {
    //       trnxType: tType,
    //       trnxTypeTxt: t,
    //       trnxAmount: tranferAmount,
    //       gameType: game,
    //       adminname: adminname != undefined ? adminname : "",
    //       adminid: adminid != undefined ? adminid : "",
    //       agentid: wh._id.toString(),
    //       agentname: adminInfo.name,
    //     }
    //     await this.trackAdminWallet(walletTrack1);
    //   }

    // }

    if (typeof tType != 'undefined') {

      let walletTrack = {
        agentId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackAgentWallet(walletTrack);


      if (authorisedtype != undefined && authorisedtype == "SuperAdmin") {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "credit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: Math.abs(tranferAmount),
          id: wh._id.toString(),
          type: "Agent",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }

    return totalRemaningAmount;
  } catch (e) {
    logger.info("deductWallet : 1 : Exception : 1", e)
    return 0
  }
}


module.exports.addagentWalletAdmin = async (id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname, added_id, type, name) => {
  try {
    logger.info('\addadminWalletAdmin : call.-->>>', id, added_chips, tType, t, game, authorisedid, authorisedtype, authorisedname);

    const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
    if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
      return false;
    }
    added_chips = Number(added_chips.toFixed(2));
    let projection = {
      name: 1,
      chips: 1
    }

    const adminInfo = await Agent.findOne(wh, projection);
    logger.info("addadminWalletAdmin adminInfo : ", adminInfo);
    if (adminInfo == null) {
      return false;
    }
    logger.info("addadminWalletAdmin adminInfo :: ", adminInfo);

    adminInfo.chips = (typeof adminInfo.chips == 'undefined' || isNaN(adminInfo.chips)) ? 0 : Number(adminInfo.chips);

    let opChips = adminInfo.chips;


    let setInfo = {
      $inc: {}
    };
    let totalDeductChips = added_chips;

    setInfo['$inc']['chips'] = Number(Number(added_chips).toFixed(2));

    adminInfo.chips = Number(adminInfo.chips) + Number(added_chips);
    adminInfo.chips = Number(adminInfo.chips.toFixed(2))


    logger.info("\addadminWalletAdmin setInfo :: ", setInfo);
    let tranferAmount = totalDeductChips;
    logger.info("addadminWalletAdmin adminInfo :: ", adminInfo);

    if (Object.keys(setInfo["$inc"]).length > 0) {
      for (let key in setInfo["$inc"]) {
        setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
      }
    }
    if (Object.keys(setInfo["$inc"]).length == 0) {
      delete setInfo["$inc"];
    }

    logger.info("\addadminWalletAdmin wh :: ", wh, setInfo);
    let upReps = await Agent.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info("\addadminWalletAdmin upReps :: ", upReps);

    upReps.chips = (typeof upReps.chips == 'undefined' || isNaN(upReps.chips)) ? 0 : Number(upReps.chips);
    let totalRemaningAmount = upReps.chips

    if (typeof tType != 'undefined') {

      let walletTrack = {
        agentId: wh._id.toString(),
        name: adminInfo.name,
        trnxType: tType,
        trnxTypeTxt: t,
        trnxAmount: tranferAmount,
        oppChips: opChips,
        chips: upReps.chips,
        totalBucket: totalRemaningAmount,
        gameType: game,
        authorisedid: authorisedid,
        authorisedtype: authorisedtype,
        authorisedname: authorisedname,
        id: added_id != undefined ? added_id : "",
        type: type != undefined ? type : "",
        trackname: name != undefined ? name : ""
      }
      await this.trackAgentWallet(walletTrack);


      if (authorisedtype != undefined && authorisedtype == "SuperAdmin") {
        let walletTrack1 = {
          adminid: authorisedid,
          name: authorisedname,
          trnxType: "credit",
          trnxTypeTxt: t,
          gameType: game,
          trnxAmount: tranferAmount,
          id: wh._id.toString(),
          type: "Agent",
          name: adminInfo.name
        }
        await this.trackSuperAdminWallet(walletTrack1);
      }

    }


    return totalRemaningAmount;
  } catch (e) {
    logger.info("addagentWalletAdmin : 1 : Exception : 1", e)
    return 0
  }
}

//================================

module.exports.trackAgentWallet = async (obj) => {
  logger.info("\n AgentWalletTracks  obj ::", obj);

  await AgentWalletTracks.create(obj)
  return true;
}


module.exports.trackUserWallet = async (obj) => {
  logger.info("\ntrackUserWallet obj ::", obj);

  await UserWalletTracks.create(obj)
  return true;
}

module.exports.trackSuperAdminWallet = async (obj) => {
  logger.info("\n SuperAdminWalletTracks obj ::", obj);

  await SuperAdminWalletTracks.create(obj)
  return true;
}

module.exports.trackAdmintWallet = async (obj) => {
  logger.info("\n trackAdmintWallet obj ::", obj);

  await adminWalletTracks.create(obj)
  return true;
}



//================================== Not Use =================================================================================================

module.exports.deductWallet = async (id, deductChips, tType, t, tblInfo) => {
  let tbInfo = tblInfo;
  try {
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }

    let upReps = await GameUser.findOne(wh, {}).lean();

    if (upReps === null) {
      return false;
    }

    let totalRemaningAmount = Number(upReps.chips);

    if (typeof tType !== 'undefined' && !upReps.isBot) {
      let walletTrack = {
        uniqueId: upReps.uniqueId,
        userId: upReps._id,
        username: upReps.name,
        transType: tType,
        transTypeText: t,
        transAmount: deductChips,
        chips: upReps.chips,
        winningChips: upReps.winningChips,
        totalBucket: Number(totalRemaningAmount),
        gameId: tbInfo && tbInfo.gameId ? tbInfo.gameId : '',
        gameType: tbInfo && tbInfo.gamePlayType ? tbInfo.gamePlayType : '', //Game Type
        maxSeat: tbInfo && tbInfo.maxSeat ? tbInfo.maxSeat : 0, //Maxumum Player.
        betValue: tbInfo && tbInfo.entryFee ? tbInfo.entryFee : 0,
        tableId: tbInfo && tbInfo._id ? tbInfo._id.toString() : '',
      };
      await this.trackUserWallet(walletTrack);
    }

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks deductWallet Exception error => ', e);
    return 0;
  }
};

//withdrawableChips 
module.exports.deductWalletPayOut = async (id, deductChips, tType, t, wType, paymentGateway) => {
  logger.info("check dedcut function call ===>", id);
  logger.info("check dedcut function call ===> typeof ", typeof id);
  logger.info("check dedcut function call ===> tType ", tType);
  logger.info("check dedcut function call ===> deductChips ", deductChips);

  try {
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      logger.info("returnr wh  ===>", id);
      return false;
    }

    let upReps = await GameUser.findOne(wh, {}).lean();

    if (upReps === null) {
      logger.info("upReps wh  ===>", upReps);

      return false;
    }
    if (upReps.winningChips < deductChips) {
      logger.info("upReps.winningChips < deductChips");
      return false
    }

    let setInfo = {
      $inc: {
        winningChips: deductChips
      },
    };

    logger.info('\n Dedudct* Wallet wh :: ==>', wh);
    logger.info('\n Dedudct* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Dedudct* Wallet deductChips :: ==>', deductChips);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Dedudct Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.winningChips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !upReps.isBot) {
      let walletTrack = {
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: deductChips,
        chips: tbl.chips,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,
        type: wType,
        paymentGateway: paymentGateway !== undefined ? paymentGateway : 'null',

        // referralChips: tbl.referralChips, // referarl Chips
        // unlockreferralChips: tbl.unlockreferralChips, // referarl Chips unlock Chips  
        // lockreferralChips: tbl.lockreferralChips, // referarl Chips lock Chips 
        // withdrawableChips: tbl.withdrawableChips,
        totalBucket: Number(totalRemaningAmount),
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)

    const totalChips = Number(tbl.chips) + Number(tbl.winningChips) + Number(tbl.bonusChips) + Number(tbl.lockbonusChips);
    const formattedBalance = totalChips.toFixed(2);

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: formattedBalance });

    // commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: Number(tbl.chips + tbl.winningChips + tbl.bonusChips + tbl.lockbonusChips).toFixed(2) });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks deductWalletPayout Exception error => ', e);
    return 0;
  }
};

module.exports.addWallet = async (id, addCoins, tType, t, Wtype, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }

    let setInfo = {
      $inc: {
        winningChips: Number(tabInfo.tableAmount - tabInfo.entryFee),
        'counters.gameWin': 1,
      },
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins, '\n tabInfo.tableAmount :: ==>', tabInfo.tableAmount);
    const uWh = {
      _id: MongoID(tabInfo.playerInfo[tabInfo.currentPlayerTurnIndex]._id),
    };
    logger.info('\n AddWallet wh ::---> ', uWh);
    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: userInfo.chips,
        winningChips: userInfo.winningChips,
        type: Wtype,
        totalBucket: Number(totalRemaningAmount),
        gameId: tabInfo && tabInfo.gameId ? tabInfo.gameId : '',
        gameType: tabInfo && tabInfo.gamePlayType ? tabInfo.gamePlayType : '', //Game Type
        maxSeat: tabInfo && tabInfo.maxSeat ? tabInfo.maxSeat : 0, //Maxumum Player.
        betValue: tabInfo && tabInfo.entryFee ? tabInfo.entryFee : 0,
        tableId: tabInfo && tabInfo._id ? tabInfo._id.toString() : '',
      };
      await this.trackUserWallet(walletTrack);
    }
    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

module.exports.userAddWallet = async (authType, authName, authId, id, addCoins, tType, t, Wtype, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }

    let setInfo = {
      $inc: {
        winningChips: Number(tabInfo.tableAmount - tabInfo.entryFee),
        'counters.gameWin': 1,
      },
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins, '\n tabInfo.tableAmount :: ==>', tabInfo.tableAmount);
    const uWh = {
      _id: MongoID(tabInfo.playerInfo[tabInfo.currentPlayerTurnIndex]._id),
    };
    logger.info('\n AddWallet wh ::---> ', uWh);
    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: userInfo.chips,
        winningChips: userInfo.winningChips,
        type: Wtype,
        totalBucket: Number(totalRemaningAmount),
        gameId: tabInfo && tabInfo.gameId ? tabInfo.gameId : '',
        gameType: tabInfo && tabInfo.gamePlayType ? tabInfo.gamePlayType : '', //Game Type
        maxSeat: tabInfo && tabInfo.maxSeat ? tabInfo.maxSeat : 0, //Maxumum Player.
        betValue: tabInfo && tabInfo.entryFee ? tabInfo.entryFee : 0,
        tableId: tabInfo && tabInfo._id ? tabInfo._id.toString() : '',
      };
      await this.trackUserWallet(walletTrack);
    }
    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

//Winning Chips 
module.exports.addWalletWinngChpis = async (id, addCoins, tType, t, Wtype, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }

    let setInfo = {
      $inc: {
        winningChips: addedCoins
      },
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.winningChips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: tbl.chips,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,
        type: Wtype,
        // referralChips: tbl.referralChips, // referarl Chips
        // unlockreferralChips: tbl.unlockreferralChips, // referarl Chips unlock Chips  
        // lockreferralChips: tbl.lockreferralChips, // referarl Chips lock Chips 
        // withdrawableChips: tbl.withdrawableChips,
        totalBucket: Number(totalRemaningAmount),
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)
    const totalChips = Number(tbl.chips) + Number(tbl.winningChips) //+ Number(tbl.bonusChips) + Number(tbl.lockbonusChips);
    const formattedBalance = totalChips.toFixed(2);

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: formattedBalance });


    // commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

//Diduct Chips in winning chips
module.exports.addWalletWinningPayin = async (id, addCoins, tType, t, Wtype, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }

    let setInfo = {
      $inc: {
        winningChips: addedCoins
      },
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: tbl.chips,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,
        totalBucket: Number(totalRemaningAmount),
        type: Wtype,
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)
    const totalChips = Number(tbl.chips) + Number(tbl.winningChips) + Number(tbl.bonusChips) + Number(tbl.lockbonusChips);
    const formattedBalance = totalChips.toFixed(2);

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: formattedBalance, addCoins: addCoins });


    // commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips, addCoins: addCoins });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

//Depotit Chips 
module.exports.addWalletPayin = async (id, addCoins, tType, t, Wtype, paymentGateway, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }

    let setInfo = {
      $inc: {
        chips: addedCoins
      },
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: tbl.chips,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,
        totalBucket: Number(totalRemaningAmount),
        type: Wtype,
        paymentGateway: paymentGateway !== undefined ? paymentGateway : 'null',
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)
    const totalChips = Number(tbl.chips) + Number(tbl.winningChips) + Number(tbl.bonusChips) + Number(tbl.lockbonusChips);
    const formattedBalance = totalChips.toFixed(2);

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: formattedBalance, addCoins: addCoins });

    // commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips, addCoins: addCoins });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

/*
  lock bonus check 
  > 500 

  addCoins > lock bonus == lock bonus 
  
  unlock ma add thasse 


*/
module.exports.locktounlockbonus = async (id, addCoins, tType, t, Wtype, tabInfo) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }
    logger.info('userInfo.lockbonusChips ', userInfo.lockbonusChips)

    if (userInfo.lockbonusChips < 500) {
      logger.info('return false ::::::::::::::::::::::::', userInfo.lockbonusChips)

      return false
    }
    addedCoins = (userInfo.lockbonusChips > addCoins) ? addCoins : userInfo.lockbonusChips;

    logger.info('addedCoins ::=> ', addedCoins)

    let setInfo = {
      $inc: {
        lockbonusChips: -addedCoins,
        bonusChips: addCoins
      }
    };

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: tbl.chips,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,
        type: Wtype,
        paymentGateway: paymentGateway !== undefined ? paymentGateway : 'null',
        // referralChips: tbl.referralChips, // referarl Chips
        // unlockreferralChips: tbl.unlockreferralChips, // referarl Chips unlock Chips  
        // lockreferralChips: tbl.lockreferralChips, // referarl Chips lock Chips 
        // withdrawableChips: tbl.withdrawableChips,
        totalBucket: Number(totalRemaningAmount),
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips, addCoins: addCoins });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};

// //Sinup Bonus & Deposit Bonus 
// module.exports.addReffralBonusDeposit = async (id, addCoins, tType, t) => {
//   try {
//     logger.info('\n add addReffralBonusDeposit : call -->>>', id, addCoins, t);
//     const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
//     logger.info('Wh  =  ==  ==>', wh);

//     if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
//       return false;
//     }
//     const addedCoins = Number(addCoins.toFixed(2));

//     const whr = typeof id === 'string' ? { referalUserId: MongoID(id).toString(), reffralStatus: false } : { _id: id };
//     const UserReferTrackInfo = await UserReferTracks.findOne(whr, {}).lean();
//     if (UserReferTrackInfo) {
//       const userInfo = await GameUser.findOne(wh, {}).lean();
//       logger.info('Add addReffralBonusDeposit userInfo ::=> ', userInfo);

//       if (userInfo === null) {
//         return false;
//       }

//       let setInfo = {
//         $inc: {
//           referralChips: addedCoins
//         },
//       };

//       logger.info('\n Add* addReffralBonusDeposit setInfo :: ==>', setInfo);
//       logger.info('\n Add* addReffralBonusDeposit addedCoins :: ==>', addedCoins);

//       let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
//       logger.info('\n Add addReffralBonusDeposit up Reps :::: ', tbl);

//       let setInfos = {
//         $set: {
//           reffralStatus: true
//         },
//       };
//       let updatereffralSatus = await UserReferTracks.findOneAndUpdate(wh, setInfos, { new: true });
//       logger.info('\n Add addReffralBonusDeposit updatereffralSatus Reps :::: ', updatereffralSatus);

//       let totalRemaningAmount = Number(tbl.chips);
//       logger.info('\n Dedudct addReffralBonusDeposit total RemaningAmount :: ', Number(totalRemaningAmount));

//       if (typeof tType !== 'undefined') {
//         logger.info('\n AddWallet tType :: ', tType);

//         let walletTrack = {
//           // id: userInfo._id,
//           uniqueId: tbl.uniqueId,
//           userId: tbl._id,
//           transType: tType,
//           transTypeText: t,
//           transAmount: addedCoins,
//           chips: tbl.chips,
//           winningChips: tbl.winningChips,
//           bonusChips: tbl.bonusChips,
//           referralChips: tbl.referralChips, // referarl Chips
//           unlockreferralChips: tbl.unlockreferralChips, // referarl Chips unlock Chips  
//           lockreferralChips: tbl.lockreferralChips, // referarl Chips lock Chips 
//           // withdrawableChips: tbl.withdrawableChips,
//           totalBucket: Number(totalRemaningAmount),
//           gameId: '',
//           gameType: '', //Game Type
//           maxSeat: 0, //Maxumum Player.
//           betValue: 0,
//           tableId: '',
//         };
//         await this.trackUserWallet(walletTrack);
//       }
//       console.log("tbl.sckId ", tbl.sckId)

//       commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips, addCoins: addCoins });

//       return totalRemaningAmount;
//     } else {
//       logger.info("reffral id or user not found")
//     }

//   } catch (e) {
//     logger.error('userWalletTracks.js addWallet error =>', e);
//     return 0;
//   }
// };

//Sinup Bonus & Deposit Bonus 
module.exports.addWalletBonusDeposit = async (id, addCoins, tType, t, Wtype) => {
  try {
    logger.info('\n add Wallet : call -->>>', id, addCoins, t);
    const wh = typeof id === 'string' ? { _id: MongoID(id).toString() } : { _id: id };
    logger.info('Wh  =  ==  ==>', wh);

    if (typeof wh === 'undefined' || typeof wh._id === 'undefined' || wh._id === null || typeof tType === 'undefined') {
      return false;
    }
    const addedCoins = Number(addCoins.toFixed(2));

    const userInfo = await GameUser.findOne(wh, {}).lean();
    logger.info('Add Wallet userInfo ::=> ', userInfo);
    if (userInfo === null) {
      return false;
    }
    let setInfo = {

    }
    if (userInfo.bonusChips + userInfo.lockbonusChips + addedCoins >= 500) {
      setInfo = {
        $inc: {
          lockbonusChips: addedCoins
        }
      };
    } else {
      setInfo = {
        $inc: {
          bonusChips: addedCoins
        }
      };
    }

    logger.info('\n Add* Wallet setInfo :: ==>', setInfo);
    logger.info('\n Add* Wallet addedCoins :: ==>', addedCoins);

    let tbl = await GameUser.findOneAndUpdate(wh, setInfo, { new: true });
    logger.info('\n Add Wallet up Reps :::: ', tbl);

    let totalRemaningAmount = Number(tbl.chips);
    logger.info('\n Dedudct Wallet total RemaningAmount :: ', Number(totalRemaningAmount));

    if (typeof tType !== 'undefined' && !userInfo.isBot) {
      logger.info('\n AddWallet tType :: ', tType);

      let walletTrack = {
        // id: userInfo._id,
        uniqueId: tbl.uniqueId,
        userId: tbl._id,
        username: tbl.name,
        transType: tType,
        transTypeText: t,
        transAmount: addedCoins,
        chips: tbl.chips,
        type: Wtype,
        winningChips: tbl.winningChips,
        bonusChips: tbl.bonusChips,
        lockbonusChips: tbl.lockbonusChips,

        //referralChips: tbl.referralChips, // referarl Chips
        //unlockreferralChips: tbl.unlockreferralChips, // referarl Chips unlock Chips  
        //lockreferralChips: tbl.lockreferralChips, // referarl Chips lock Chips 
        //withdrawableChips: tbl.withdrawableChips,
        totalBucket: Number(totalRemaningAmount),
        gameId: '',
        gameType: '', //Game Type
        maxSeat: 0, //Maxumum Player.
        betValue: 0,
        tableId: '',
      };
      await this.trackUserWallet(walletTrack);
    }
    // console.log("tbl.sckId ", tbl.sckId)

    const totalChips = Number(tbl.chips) + Number(tbl.winningChips) + Number(tbl.bonusChips) + Number(tbl.lockbonusChips);
    const formattedBalance = totalChips.toFixed(2);

    commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: formattedBalance, addCoins: addCoins });

    // commandAcions.sendDirectEvent(tbl.sckId, CONST.PLAYER_BALANCE, { chips: tbl.chips, addCoins: addCoins });

    return totalRemaningAmount;
  } catch (e) {
    logger.error('userWalletTracks.js addWallet error =>', e);
    return 0;
  }
};


module.exports.trackUserWallet = async (obj) => {
  try {
    logger.info('\ntrackUserWallet obj ::', obj);

    let insertInfo = await UserWalletTracks.create(obj);
    logger.info('createTable UserWalletTracks : ', insertInfo);
    return true;
  } catch (e) {
    logger.error('userWalletTracks.js trackUserWallet error=> ', e);
    return false;
  }
};

module.exports.getWalletDetails = async (obj, client) => {
  try {
    logger.info('\n get Wallet Details ::', obj);

    let wh = { _id: obj };

    let walletDetails = await GameUser.findOne(wh, {}).lean();
    logger.info('getWalletDetails walletDetails : ', walletDetails);

    //"wb":WinningsBalance ||    "db": DepositBalance ||tw: TotalWinningBalance
    let response;
    if (walletDetails !== null) {
      response = {
        db: Number(walletDetails.chips.toFixed(2)),
        wb: Number(walletDetails.winningChips.toFixed(2)),
        // wb: userCoinInfoData.winningAmount,
        tw: (walletDetails.chips.toFixed(2) + walletDetails.winningChips.toFixed(2)),
      };
      logger.info('get Wallet Details Response : ', response);
      commandAcions.sendDirectEvent(client.id, CONST.PLAYER_BALANCE, response);
    } else {
      logger.info('At userWalletTracks.js:182 getWalletDetails => ', JSON.stringify(obj));
      commandAcions.sendDirectEvent(client.id, CONST.PLAYER_BALANCE, {}, false, 'user data not found');
    }
    return response;
  } catch (e) {
    logger.error('userWalletTracks.js getWalletDetails error => ', e);
    return false;
  }
};


module.exports.getWalletDetailsNew = async (obj, client) => {
  try {
    logger.info('\n MYWALLET get Wallet Details ::', obj);

    let wh = { _id: obj };

    let walletDetails = await GameUser.findOne(wh, {}).lean();
    logger.info('MYWALLET getWalletDetails walletDetails : ', walletDetails);

    //"wb":WinningsBalance ||    "db": DepositBalance ||tw: TotalWinningBalance
    let response;
    logger.info(" walletDetails.bonusChips ", walletDetails)
    //+ walletDetails.withdrawableChips //+ walletDetails.referralChips
    if (walletDetails !== null) {
      response = {
        tb: Number(Number(walletDetails.chips + walletDetails.winningChips + walletDetails.bonusChips).toFixed(2)),
        mb: Number(walletDetails.chips.toFixed(2)),
        sb_db: Number(walletDetails.bonusChips.toFixed(2)),
        wb: Number(walletDetails.winningChips.toFixed(2)),
        ulb: Number(walletDetails.lockbonusChips)
        //wc: (walletDetails.withdrawableChips.toFixed(2)),
      };
      logger.info('get MYWALLET Wallet Details Response : ', response);
      commandAcions.sendDirectEvent(client.id, CONST.MYWALLET, response);
    } else {
      logger.info('At MYWALLET userWalletTracks.js:182 getWalletDetails => ', JSON.stringify(obj));
      commandAcions.sendDirectEvent(client.id, CONST.MYWALLET, {}, false, 'user data not found');
    }
    return response;
  } catch (e) {
    logger.error('MYWALLET userWalletTracks.js getWalletDetails error => ', e);
    return false;
  }
};

