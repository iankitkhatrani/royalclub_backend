const mongoose = require('mongoose');
const GameUser = mongoose.model('users');
const commonHelper = require('../helper/commonHelper');
const commandAcions = require("../helper/socketFunctions");
const CONST = require("../../constant");
const logger = require('../../logger');
const joinTable = require("./joinTableLudo");
const gamePlay = require("./gamePlayLudo");
const cardLogic = require("./cardLogic");



module.exports.JoinRobot = async (tableInfo,BetInfo) => {
    try {

        let user_wh = {
            Iscom: 1
        }

        let robotInfo = await GameUser.findOne(user_wh, {});
        logger.info("JoinRobot ROBOT Info : ", robotInfo)


        await joinTable.findEmptySeatAndUserSeat(tableInfo, BetInfo, {uid:robotInfo._id});

    } catch (error) {
        logger.info("Robot Logic Join", error);
    }
}

module.exports.PlayRobot = async (tableInfo,BetInfo,OppPlayer,playerInGame) => {
    try {

        // Play Robot Logic 
        logger.info("PlayRobot ",tableInfo)
        logger.info("BetInfo ",BetInfo)

        if(BetInfo != undefined && BetInfo.playerId != undefined && tableInfo._id != undefined){
            let mykukaris = BetInfo.kukaris
            let oppkukaris = OppPlayer.kukaris

            console.log("mykukaris ",mykukaris)
            console.log("oppkukaris ",oppkukaris)

            //Ek kukari j hoi to Move j kari devani 
            let totalkukariinHome = _.mapObject(mykukaris, function(val, key) {

                if(val == -1)
                return key
              
            });

            console.log("totalkukarioutofhome ",totalkukarioutofhome)
            let totalkukarinOutHome = _.mapObject(mykukaris, function(val, key) {

                if(val != -1)
                return key
              
            });

            //All kukari home ma hoi and 6 aave to kukari nikalvani Kukari number aapani 
            
            //pela koi ni kukari kill thati hoi ae 

            var killoppkukari = _.mapObject(mykukaris, function(val, key) {

                _.mapObject(oppkukaris, function(val1, key1) {

                    if(val != -1 && val1 != -1 && val == val1)  
                    return key

                });
            });

            console.log("killoppkukari ",killoppkukari)

            // Win thati hoi aevi kukari 
            

            // mari kukari ni aagal no hoi ae kukari 

            // ae ek karta vadhare hoi to safe hoi ae nai biji 

            

            

        }else{
            logger.info("PlayRobot else  Robot ", tableInfo,BetInfo);

        }
        
    } catch (error) {
        logger.info("Play Robot ", error);
    }
}