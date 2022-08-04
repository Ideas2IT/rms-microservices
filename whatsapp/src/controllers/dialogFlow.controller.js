const dialogFlowServices = require("../services/dialogFlow.service");
const formatter = require("../utils/responseFormatter.util");

/**
 * @name getTextQueryResult
 * @description To get the response from dialogflow based on user text query
 * @param {object} req 
 * @param {object} res 
 */
const getTextQueryResult = async (req, res) => {
  console.log("getTextQueryResult initiated");
  try {
    const { text } = req.body;
    const resultQuery = await dialogFlowServices.dialogFlowQuery(text);
    const result = resultQuery[0];
    res.send(formatter.dialogFlowResponse(result));
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  getTextQueryResult
};