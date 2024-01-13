
const _ = require("underscore")

console.log("valueOfCard ", RobotAction({
    playerRoutePos1: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57
    ],
    playerRoutePos2: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 51, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 58, 59, 60, 61, 62, 63
    ],
    playerRoutePos3: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 64, 65, 66, 67, 68, 69
    ],
    playerRoutePos4: [
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 70, 71, 72, 73, 74, 75
    ],
    safeDice: [9, 22, 35, 48, 1, 14, 27, 40]
    },
    {
        seatIndex: 0,
        playerId: "1222",
        kukaris: {
            k1: -1,
            k2: 52,
            k3: 30,
            k4: -1
        },
        kukarisindex:{
            k1:10,
            k2:-1,
            k3:-1,
            k4:-1
        },
    }, {
    seatIndex: 2,
    playerId: "1222",
    kukaris: {
        k1: -1,
        k2: 35,
        k3: -1,
        k4: -1
    },
    kukarisindex:{
        k1:25,
        k2:-1,
        k3:-1,
        k4:-1
    },
}, 5))


function RobotAction(tableInfo, BetInfo, OppPlayer, movenumber) {


    // Play Robot Logic 
    console.log("PlayRobot ", tableInfo)
    console.log("BetInfo ", BetInfo)

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


        




    }

    return false
}



function GetRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}






