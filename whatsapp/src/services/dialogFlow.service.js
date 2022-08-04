const uuid = require("uuid");
const dfSessionClient = require("../configs/dialogFlow.config");

/**
 * @name dialogFlowQuery
 * @description Get the response message from Dialogflow for the matched text
 * @param {string} userText 
 * @returns {string} the matched text
 */
const dialogFlowQuery = async (userText) => {
  const sessionPath = dfSessionClient.projectAgentSessionPath(process.env.DF_PROJECT_ID, uuid.v4());

  const request = {
    session: sessionPath,
    queryInput: { // The query to send to the dialogflow agent
      text: {
        text: userText,
        languageCode: "en-US", // The language used by the client (en-US)
      },
    },
  };

  try {
    const response = await dfSessionClient.detectIntent(request);
    return response;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  dialogFlowQuery
};