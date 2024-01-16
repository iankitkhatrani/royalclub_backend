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

module.exports.PlayRobot = async (tableInfo, BetInfo, OppPlayer, movenumber) => {
    try {

        // Play Robot Logic 
        logger.info("PlayRobot ",tableInfo)
        logger.info("BetInfo ",BetInfo)

        if (BetInfo != undefined && BetInfo.playerId != undefined) {
            let WinnerNumber = BetInfo.seatIndex == 0 ? tableInfo.playerRoutePos1[tableInfo.playerRoutePos1.length - 1] : tableInfo.playerRoutePos3[tableInfo.playerRoutePos3.length - 1];
            let mykukaris = BetInfo.kukaris
            let oppkukaris = OppPlayer.kukaris
    
            let mykukarisIndex = BetInfo.kukarisindex
            let oppkukarisIndex = OppPlayer.kukarisindex
    
            console.log("mykukaris ", mykukaris)
            console.log("oppkukaris ", oppkukaris)
    
            //Ek kukari j hoi to Move j kari devani 
            let totalkukariinHome = []
            _.mapObject(mykukaris, function (val, key) {
    
                console.log("val ", val)
                console.log("key ", key)
    
                if (val == -1) {
                    totalkukariinHome.push(key)
                }
    
            });
    
            console.log("totalkukarioutofhome ", totalkukariinHome)
    
            let totalkukarinOutHome = []
            _.mapObject(mykukaris, function (val, key) {
    
                if (val != -1) {
                    totalkukarinOutHome.push(key)
                }
    
            });
    
            console.log("totalkukarinOutHome ", totalkukarinOutHome)
            //All kukari home ma hoi and 6 aave to kukari nikalvani Kukari number aapani 
    
            //pela koi ni kukari kill thati hoi ae 
    
            var killoppkukari = []
            _.mapObject(mykukaris, function (val, key) {
    
                _.mapObject(oppkukaris, function (val1, key1) {
    
                    if (val != -1 && val1 != -1 && val + movenumber == val1)
                        killoppkukari.push(key)
    
                });
            });
    
            console.log("killoppkukari ", killoppkukari)
    
            // Win thati hoi aevi kukari 
    
    
            var TotalWinkukari = []
            _.mapObject(mykukaris, function (val, key) {
    
                if (val + movenumber ==   WinnerNumber){
                    TotalWinkukari.push(key) 
                }
                    
    
            });
            console.log("WinnerNumber ",WinnerNumber)
            console.log("TotalWinkukari ", TotalWinkukari)
    
    
            // mari kukari ni aagal no hoi ae kukari 
    
            var nomorekukari = []
    
            _.mapObject(mykukarisIndex, function (val, key) {
    
                _.mapObject(oppkukarisIndex, function (val1, key1) {
    
                    if (val != -1 && val1 != -1 && val+movenumber >= val1){
                        nomorekukari.push(key)
                    }
                    if(val == -1){
                        nomorekukari.push(key)
                    }
    
                });
            });
            console.log("nomorekukari ",nomorekukari)
            nomorekukari = _.difference(["k1","k2","k3","k4"],nomorekukari)
    
            console.log("nomorekukari ",nomorekukari)
       
            
    
            // ae ek karta vadhare hoi to safe hoi ae nai biji 
            // win thavama najik hoi aene first send karo 
    
    
    
    
    
        }else{
            logger.info("PlayRobot else  Robot ", tableInfo,BetInfo);

        }
        
    } catch (error) {
        logger.info("Play Robot ", error);
    }
}