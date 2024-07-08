const mongoose = require('mongoose');
const CONST = require("../../constant");
const logger = require('../../logger');
const { sendEvent } = require('../helper/socketFunctions');
const RummyBetLists = mongoose.model('rummyBetList');

module.exports.rummyGetBetList = async (requestData, socket) => {
    try {
        let listInfo = await RummyBetLists.aggregate([
            // Convert entryFee to a numeric value
            {
                $addFields: {
                    entryFeeNumeric: { $toDouble: "$entryFee" }
                }
            },
            // Sort by the numeric entryFee
            { $sort: { entryFeeNumeric: 1 } },
            // Project the required fields
            {
                $project: {
                    _id: 1,
                    entryFee: 1,
                    gamePlayType: 1,
                    maxSeat: 1,
                    entryFeeNumeric: 1 // Include the temporary numeric field for now
                }
            },
            // Exclude the temporary numeric field in a second projection stage
            {
                $project: {
                    entryFeeNumeric: 0
                }
            }
        ]);

        // Parse the list info as needed
        const parsedListInfo = listInfo.map(item => ({
            _id: item._id,
            entryFee: parseFloat(item.entryFee),
            gamePlayType: item.gamePlayType,
            maxSeat: item.maxSeat
        }));

        let response = {
            List: parsedListInfo,
        };

        socket.uid = requestData.playerId;
        socket.sck = socket.id;
        sendEvent(socket, CONST.R_GET_BET_LIST, response);
    } catch (error) {
        logger.error('betList.js getBetList error=> ', error, requestData);
    }


};