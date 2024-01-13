
const _ = require("underscore")

console.log("valueOfCard ",RobotAction({},
    {
        playerId:"1222",
        kukaris:{
            k1:-1,
            k2:-1,
            k3:30,
            k4:-1  
        }
    },{
        playerId:"1222",
        kukaris:{
            k1:-1,
            k2:35,
            k3:-1,
            k4:-1  
        }
    },5))


function RobotAction(tableInfo,BetInfo,OppPlayer,movenumber){
 
    
        // Play Robot Logic 
        console.log("PlayRobot ",tableInfo)
        console.log("BetInfo ",BetInfo)

        if(BetInfo != undefined && BetInfo.playerId != undefined){
            let mykukaris = BetInfo.kukaris
            let oppkukaris = OppPlayer.kukaris

            console.log("mykukaris ",mykukaris)
            console.log("oppkukaris ",oppkukaris)

            //Ek kukari j hoi to Move j kari devani 
            let totalkukariinHome = []
            _.mapObject(mykukaris, function(val, key) {

                console.log("val ",val)
                console.log("key ",key)

                if(val == -1){
                    totalkukariinHome.push(key)
                }

            });

            console.log("totalkukarioutofhome ",totalkukariinHome)
            
            let totalkukarinOutHome = []
            _.mapObject(mykukaris, function(val, key) {

                if(val != -1){
                    totalkukarinOutHome.push(key)
                }
                
            });

            console.log("totalkukarinOutHome ",totalkukarinOutHome)
            //All kukari home ma hoi and 6 aave to kukari nikalvani Kukari number aapani 
            
            //pela koi ni kukari kill thati hoi ae 

            var killoppkukari = []
                _.mapObject(mykukaris, function(val, key) {

                    _.mapObject(oppkukaris, function(val1, key1) {

                        if(val != -1 && val1 != -1 && val+movenumber == val1)  
                        killoppkukari.push(key)

                    });
                });

            console.log("killoppkukari ",killoppkukari)

            // Win thati hoi aevi kukari 


            // var TotalWinkukari  = []
            //     _.mapObject(mykukaris, function(val, key) {

            //         _.mapObject(oppkukaris, function(val1, key1) {

            //             if(val != -1 && val1 != -1 && val == val1)  
            //             killoppkukari.push(key)

            //         });
            //     });

            //console.log("TotalWinkukari ",TotalWinkukari)
            

            // mari kukari ni aagal no hoi ae kukari 

            // ae ek karta vadhare hoi to safe hoi ae nai biji 

            

            

        }

        return false
}


 
function GetRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}






