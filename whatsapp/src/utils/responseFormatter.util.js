/**
 * @name dialogFlowResponseFormatter
 * @description Format the final response to return
 * @param {object} result 
 * @returns {*} if the result contains queryResult will return the object else will return the string
 */
const dialogFlowResponse = (result) => {
  if (result.queryResult) {
    return {
      fulfillmentText: result.queryResult.fulfillmentText
    };
  }
  res.send("Error in return the matched text");
};

/**
 * @name sendNewMessageResponse
 * @description Format the final response to return
 * @param {object} result 
 * @returns {string} will return about the message transmission status
 */
const sendNewMessageResponse = (result) => {
  if (result.sid) {
    return "Message transmission successful.";
  }
  return "Message transmission failed.";
}

/**
 * @name deleteMediaResponse
 * @description Format the final response to return
 * @param {object} result 
 * @returns {string} will returns whether the message deleted successfully or not
 */
const deleteMediaResponse = (result) => {
  if (result === true) {
    return "Message deleted successfully";
  } else if (result.code === 20404) {
    return "Message not found";
  }
};

/**
 * @name uploadFileResponse
 * @description Format the final response to return
 * @param {object} response 
 * @returns {*} if the response is success will return object else will return the string
 */
const uploadFileResponse = (result) => {
  if (result.status === 200) {
    return "Thanks for sharing document with us...";
  }
  return "Try to re-upload the file again";
};

/**
 * @name replyMessageResponse
 * @description Based on the response from twilio will return the status of message
 * @param {object} twilioResponse 
 * @returns {string}
 */
const replyMessageResponse = (twilioResponse) => {
  if (twilioResponse.sid) {
    return "Message transmission successful.";
  }
  else {
    return "Message transmission failed.";
  }
};

module.exports = {
  dialogFlowResponse,
  sendNewMessageResponse,
  deleteMediaResponse,
  uploadFileResponse,
  replyMessageResponse
};
