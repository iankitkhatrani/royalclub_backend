const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;

const GameUser = mongoose.model("users");

const CONST = require("../../constant");
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");
const JantaTables = mongoose.model('JantaTables');

const walletActions = require("./updateWallet");

/*
    bet : 10,
    object:{
        item:0,    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        bet:10,
        type:"NORMAL" || Odd || Even || onetofive || sixtozero


    }

*/
module.exports.actionJanta = async (requestData, client) => {
    try {
        logger.info("action requestData : ", requestData);
        if (typeof client.tbid == "undefined" || typeof client.uid == "undefined" || typeof client.seatIndex == "undefined" || typeof requestData.bet == "undefined" || typeof requestData.type == "undefined") {
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONJANTA, requestData, false, "User session not set, please restart game!");
            return false;
        }
        if (typeof client.action != "undefined" && client.action) return false;

        client.action = true;

        const wh = {
            _id: MongoID(client.tbid.toString()),
            //status:"JantaGameStartTimer"
        }
        const project = {

        }
        const tabInfo = await JantaTables.findOne(wh, project).lean();
        logger.info("action tabInfo : ", tabInfo);

        if (tabInfo == null) {
            logger.info("action user not turn ::", tabInfo);
            delete client.action;
            return false
        }
       
        
        let playerInfo = tabInfo.playerInfo[client.seatIndex];
        let currentBet = Number(requestData.bet);
       
        logger.info("action currentBet ::", currentBet);

        let gwh = {
            _id: MongoID(client.uid)
        }
        let UserInfo = await GameUser.findOne(gwh, {}).lean();
        logger.info("action UserInfo : ", gwh, JSON.stringify(UserInfo));

        let updateData = {
            $set: {

            },
            $inc:{
                
            }
        }
        let chalvalue =currentBet;
        updateData.$set["playerInfo.$.playStatus"] = "action"
    
        let totalWallet = Number(UserInfo.chips) + Number(UserInfo.winningChips)

        if (Number(chalvalue) > Number(totalWallet)) {
            logger.info("action client.su ::", client.seatIndex);
            delete client.action;
            commandAcions.sendDirectEvent(client.sck, CONST.ACTIONJANTA, requestData, false, "Please add wallet!!");
            return false;
        }
        chalvalue = Number(Number(chalvalue).toFixed(2))

        await walletActions.deductWallet(client.uid, -chalvalue, 2, "Janta Bet", tabInfo, client.id, client.seatIndex,"Janta");

        if(requestData.type == "NORMAL"){
            updateData.$inc["playerInfo.$.selectObj."+requestData.item] = chalvalue;
        }else if(requestData.type == "Odd"){
            updateData.$inc["playerInfo.$.selectObj.1"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.3"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.5"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.7"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.9"] = chalvalue;

        }else if(requestData.type == "Even"){
            updateData.$inc["playerInfo.$.selectObj.2"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.4"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.6"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.8"] = chalvalue;
        }else if(requestData.type == "onetofive"){
            updateData.$inc["playerInfo.$.selectObj.1"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.2"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.3"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.4"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.5"] = chalvalue;
        }else if(requestData.type == "sixtozero"){
            updateData.$inc["playerInfo.$.selectObj.6"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.7"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.8"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.9"] = chalvalue;
            updateData.$inc["playerInfo.$.selectObj.0"] = chalvalue;
        }
        
        updateData.$inc["playerInfo.$.totalbet"] = chalvalue;


        updateData.$inc["totalbet"] = chalvalue;
        updateData.$set["turnDone"] = true;
        commandAcions.clearJob(tabInfo.job_id);

        const upWh = {
            _id: MongoID(client.tbid.toString()),
            "playerInfo.seatIndex": Number(client.seatIndex)
        }
        logger.info("action upWh updateData :: ", upWh, updateData);

        const tb = await JantaTables.findOneAndUpdate(upWh, updateData, { new: true });
        logger.info("action tb : ", tb);

        let response = {
            bet: chalvalue,
            item:requestData.item
        }

        commandAcions.sendEvent(client, CONST.ACTIONJANTA, response, false, "");

      
        delete client.action;
        
       
        
        return true;
    } catch (e) {
        logger.info("Exception action : ", e);
    }
}




