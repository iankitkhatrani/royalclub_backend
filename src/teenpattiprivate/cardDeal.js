const mongoose = require("mongoose")
const MongoID = mongoose.Types.ObjectId;

const fortuna = require('javascript-fortuna');
fortuna.init();
const CONST = require('../../constant');
const logger = require("../../logger");
const commandAcions = require("../helper/socketFunctions");
const roundStartActions = require("./roundStart");
const PlayingTables = mongoose.model("TeenPrivatePlayingTables");
const _ = require("underscore")
const cardLogic = require("./cardLogic");
const { createDealer } = require("../helper/helperFunction");


module.exports.cardDealStart = async (tbid) => {
    logger.info("collectBoot tbid : ", tbid);
    let wh = {
        _id: tbid
    };
    let tb = await PlayingTables.findOne(wh, {}).lean();
    logger.info("collectBoot tb : ", tb);

    let cardDetails = this.getCards(tb.playerInfo);
    logger.info("collectBoot cardDetails : ", cardDetails);
    let dealerSeatIndex = createDealer(tb.activePlayer - 1);

    const update = {
        $set: {
            hukum: cardDetails.hukum,
            dealerSeatIndex,
            currentPlayerTurnIndex: dealerSeatIndex,
            gameState: CONST.CARD_DEALING,
        }
    }
    const cardDealIndexs = await this.setUserCards(cardDetails, tb);
    logger.info("initRoundState cardDealIndexs : ", cardDealIndexs);

    logger.info("initRoundState update : ", update);

    const tabInfo = await PlayingTables.findOneAndUpdate(wh, update, { new: true });
    logger.info("findTableAndJoin tabInfo : ", tabInfo);

    const eventResponse = {
        hukum: tabInfo.hukum,
        di: tabInfo.dealerSeatIndex,
        cardDealIndexs: cardDealIndexs
    }
    commandAcions.sendEventInTable(tabInfo._id.toString(), CONST.TEEN_PATTI_GAME_CARD_DISTRIBUTION, eventResponse);

    let tbId = tabInfo._id;
    let jobId = commandAcions.GetRandomString(10);
    let delay = commandAcions.AddTime(5);
    const delayRes = await commandAcions.setDelay(jobId, new Date(delay));

    await roundStartActions.roundStarted(tbId)
}


module.exports.setUserCards = async (cardsInfo, tb) => {
    try {
        logger.info("setUserCards cardsInfo : ", cardsInfo);
        logger.info("setUserCards tb : ", tb);

        const playerInfo = tb.playerInfo;
        let activePlayer = 0;
        let cardDealIndexs = [];

        for (let i = 0; i < playerInfo.length; i++)
            if (typeof playerInfo[i].seatIndex != "undefined" && playerInfo[i].status == "play") {
                let update = {
                    $set: {
                        "playerInfo.$.cards": cardsInfo.cards[activePlayer],
                    }
                }

                let uWh = { _id: MongoID(tb._id.toString()), "playerInfo.seatIndex": Number(playerInfo[i].seatIndex) }
                logger.info("serUserCards uWh update ::", uWh, update)

                await PlayingTables.updateOne(uWh, update);

                // commandAcions.sendDirectEvent(playerInfo[i].sck, CONST.USER_CARD , { cards : cardsInfo.cards[activePlayer] }); 
                cardDealIndexs.push(Number(playerInfo[i].seatIndex))
                activePlayer++;
            }

        return cardDealIndexs;
    } catch (err) {
        logger.info("Exception setUserCards : 1 ::", err)
    }
}

module.exports.getCards = (playerInfo) => {
    let deckCards = Object.assign([], CONST.deckOne);

    //deckCards = deckCards.slice(0, deckCards.length);

    logger.info("getCards deckCards ::", deckCards);

    let cards = [];

    let color = ['H', 'S', 'D', 'C'];
    let number = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

    for (let i = 0; i < playerInfo.length; i++) {
        if (typeof playerInfo[i].seatIndex != "undefined" && playerInfo[i].status == "play") {
            let card = [];

            console.log(playerInfo[i].Iscom)


            if (typeof playerInfo[i].seatIndex != "undefined" && playerInfo[i].Iscom == 0) {
                for (let i = 0; i < 3; i++) {
                    let ran = parseInt(fortuna.random() * deckCards.length);
                    card.push(deckCards[ran])
                    deckCards.splice(ran, 1);
                }

                cards[playerInfo[i].seatIndex] = card;
            }

        }
    }

    let ran = parseInt(fortuna.random() * deckCards.length);
    let hukum = deckCards[ran];
    deckCards.splice(ran, 1);

    logger.info("getCards hukum ::", hukum);
    console.log("cards cards ", cards)
    return {
        hukum: hukum,
        cards: cards
    }
}

