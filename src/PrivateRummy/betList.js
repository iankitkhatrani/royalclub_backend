const mongoose = require('mongoose');
const CONST = require("../../constant");
const logger = require('../../logger');
const { sendEvent } = require('../helper/socketFunctions');
const RummyBetLists = mongoose.model('rummyBetList');

module.exports.rummyGetBetList = async (requestData, socket) => {
    try {
        let listInfo = await RummyBetLists.aggregate([
            { $sort: { entryFee: 1 } },
            {
                $project: {
                    entryFee: '$entryFee',
                    gamePlayType: '$gamePlayType',
                    maxSeat: '$maxSeat',
                },
            },
        ]);


        const parsedListInfo = listInfo.map(item => ({
            _id: item._id,
            entryFee: parseFloat(item.entryFee.toString()),
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