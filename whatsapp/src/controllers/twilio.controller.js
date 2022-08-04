const twilioService = require("../services/twilio.service");
const helper = require("../utils/helper.util");
const formatter = require("../utils/responseFormatter.util");

require('dotenv').config();

/**
 * @name sendNewMessage
 * @description To send a new message on whatsapp to a user
 * @param {object} req 
 * @param {object} res 
 */
const sendNewMessage = async (req, res) => {
  console.log("sendNewMessage initiated");
  try {
    const { message, receiver } = req.body;
    const constructedNumber = helper.constructWhatsAppNumber(receiver);
    const result = await twilioService.sendWhatsappMessage(
      process.env.TWILIO_CONFIGURED_NUMBER, constructedNumber, message
    );

    res.send(formatter.sendNewMessageResponse(result));
  } catch (err) {
    res.send(err);
  }
};

/**
 * @name replyForAMessage
 * @description To send a reply message for a user in whatsapp
 * @param {object} req 
 * @param {object} res 
 */
const replyForAMessage = async (req, res) => {
  console.log("replyForAMessage initiated");
  try {
    const { From, NumMedia, MediaUrl0, MessageSid } = req.body;
    let replyMessage = await twilioService.replyMessage(req.body);
    const formattedReplyMessage = replyMessage;
    const twilioResponse = await twilioService.sendWhatsappMessage(
      process.env.TWILIO_CONFIGURED_NUMBER, From, formattedReplyMessage
    );
    if(NumMedia !== "0") {
      twilioService.deleteMediaMessage(MessageSid);
    }

    res.send(formatter.replyMessageResponse(twilioResponse));
  } catch (err) {
    res.send(err);
  }
};

/**
 * @name deleteMedia
 * @description To delete a media from Twilio's AWS S3 account
 * @param {object} req 
 * @param {object} res 
 */
const deleteMedia = async (req, res) => {
  console.log("deleteMedia initiated");
  try {
    const { messageId } = req.body;
    const twilioResponse = await twilioService.deleteMediaMessage(messageId);
    res.send(formatter.deleteMediaResponse(twilioResponse));
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  sendNewMessage,
  replyForAMessage,
  deleteMedia
};
