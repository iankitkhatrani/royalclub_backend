const RtcTokenBuilder = require("../src/RtcTokenBuilder").RtcTokenBuilder;
const RtcRole = require("../src/RtcTokenBuilder").Role;

// Need to set environment variable AGORA_APP_ID
const appId = "2882a472e675475fb09710e134a38977";
// Need to set environment variable AGORA_APP_CERTIFICATE
const appCertificate = "a1e36929d5e84f36b227913768981b82";

const channelName = "Unity";
const uid = 0;
const account = "2882341273";
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

// Build token with uid
//const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);
//console.log("Token With Integer Number Uid:", tokenWithUid);

// Build token with user account
//const tokenWithAccount = RtcTokenBuilder.buildTokenWithAccount(appId, appCertificate, channelName, account, role, privilegeExpiredTs);
//console.log("Token With UserAccount:", tokenWithAccount);

function  getToken(appID, appCERTIFICATE, channelNAME,UID)
{
    if (appId == undefined || appId == "" || appCertificate == undefined || appCertificate == "") {
        console.log("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE");
        process.exit(1);
    }
    
    //const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appID, appCERTIFICATE, channelNAME, UID, role, privilegeExpiredTs);
    const tokenWithUid = RtcTokenBuilder.buildTokenWithAccount(appID, appCERTIFICATE, channelNAME, UID, role, privilegeExpiredTs);
    //console.log("Token No: ", tokenWithUid);  
    return tokenWithUid;
}

module.exports = {
    getToken: getToken
};


