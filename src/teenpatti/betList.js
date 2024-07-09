const mongoose = require('mongoose');
const commandAcions = require("../helper/socketFunctions");
const CONST = require("../../constant");
const logger = require('../../logger');
const BetLists = mongoose.model('betList');

module.exports.getBetList = async (requestData, client) => {
    try {
        let listInfo = await BetLists.aggregate([
            { $sort: { _id: 1 } },
            {
                $project: {
                    "betId": '$_id',
                    "_id": 0,
                    "boot": '$boot',
                    "chalLimit": "$chalLimit",
                    "potLimit": "$potLimit",
                    "maxSeat": "$maxSeat",
                }
            }

        ]);
        logger.info("BetList data : ", JSON.stringify(listInfo));

        let entryFeeSet = new Set();

        listInfo.forEach(item => {
            entryFeeSet.add(item.boot.toString());
        });

        let entryFeeList = Array.from(entryFeeSet);

        let response = {
            "List": listInfo,
            entryFeeList: entryFeeList,
        };

        client.uid = requestData.user_id;
        client.sck = client.id;
        commandAcions.sendEvent(client, CONST.GET_TEEN_PATTI_ROOM_LIST, response);

    } catch (error) {
        logger.info("GET_TEEN_PATTI_ROOM_LIST", error);
    }
}