const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;
const RouletteTables = mongoose.model('RouletteTables');

const commandAcions = require("../helper/socketFunctions");
const gameStartActions = require("./gameStart");
const logger = require("../../logger");

module.exports.roundFinish = async (tb) => {
    try {
        logger.info("\n roundFinish tb :: ", tb);

        let wh = {
            _id: MongoID(tb._id.toString())
        }
        let update = {
            $set: {
                gameTracks: [],
                gameId: "",
                gameState: "",
                isLastUserFinish: false,
                isFinalWinner: false,
                callFinalWinner: false,
                turnSeatIndex: -1,
                hukum: "",
                chalValue: 0,
                potValue: 0,
                turnDone: false,
                jobId: "",
            },
            $unset: {
                gameTimer: 1
            }
        }
        logger.info("roundFinish wh :: ", wh, update);

        let tbInfo = await RouletteTables.findOneAndUpdate(wh, update, { new: true });
        logger.info("roundFinish tbInfo : ", tbInfo);
        let tableId = tbInfo._id;

        let jobId = commandAcions.GetRandomString(10);
        let delay = commandAcions.AddTime(5);
        const delayRes = await commandAcions.setDelay(jobId, new Date(delay));
        logger.info("roundFinish delayRes : ", delayRes);

        const wh1 = {
            _id: MongoID(tableId.toString())
        }
        const tabInfo = await RouletteTables.findOne(wh1, {}).lean();
        if (tabInfo.activePlayer >= 2)
            await gameStartActions.gameTimerStart(tabInfo);

        return true;
    } catch (err) {
        logger.info("Exception roundFinish : ", err)
    }
}