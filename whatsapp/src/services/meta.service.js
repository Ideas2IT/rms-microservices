const whatsappConfig = require("../configs/whatspp.config");
const messagingServices = require("./messaging.service");
const dialogFlowService = require("../services/dialogFlow.service");
const dbServices = require("../services/db.service");
const UserModel = require("../models/user.model");
const { getMessageBody, generateLocalFileName } = require("../utils/helper.util");
const { unlink } = require("fs");

const sendTextMessage = async (recipientPhone, message) => {
  try {
    await whatsappConfig.sendText({
      recipientPhone,
      message
    });
  } catch (err) {
    console.log("Error at sendTextMessage", err);
    throw err;
  }
};

const sendSimpleButtonMessage = async (recipientPhone, message, listOfButtons = []) => {
  try {
    await whatsappConfig.sendSimpleButtons({
      message, recipientPhone, listOfButtons
    });
  } catch (err) {
    throw err;
  }
};

const sendMessageBasedOnType = async (phoneNumber, messageContent) => {
  const { type, message, listOfButtons } = messageContent;
  try {
    if (type === "text_message") {
      await sendTextMessage(phoneNumber, message);
    }
    if (type === "simple_button_message") {
      await sendSimpleButtonMessage(phoneNumber, message, listOfButtons);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const helpTextMessage = (profileName) => {
  return {
    message: profileName ? `Hey ${profileName}, Welcome to Ideas2IT Chatbot. How can i help you?` : "How can i help you?",
    listOfButtons: [{
      title: "Refer a candidate",
      id: "candidate_referral"
    }],
    type: "simple_button_message"
  }
};



const removeFileFromLocal = (localFilePathName) => {
  unlink(localFilePathName, (err => {
    if (err) console.log(err);
    else {
      console.log("\nFile deleted from local");
    }
  }));
};

const receivedMessage = async (req) => {
  let data = whatsappConfig.parseMessage(req);
  if (data.isMessage) {
    console.log("Received a message");
    const incomingMessage = data.message;
    const recipientPhone = incomingMessage.from.phone;
    const recipientName = incomingMessage.from.name;
    const typeOfMsg = incomingMessage.type;
    try {
      await whatsappConfig.markMessageAsRead({ message_id: incomingMessage.message_id });
      let userInfo = await dbServices.getByOtherField(UserModel, { whatsappNumber: recipientPhone });
      const messageBody = getMessageBody(incomingMessage);
      const verificationResult = await messagingServices.verification(recipientPhone, messageBody, recipientName, userInfo);
      if (verificationResult === true) {
        if (incomingMessage?.type === "text_message") {
          const messageBody = String(incomingMessage?.text?.body).toLowerCase();
          if (messageBody.includes("hi") || messageBody.includes("hello")) {
            await sendTextMessage(recipientPhone, `Hey ${recipientName}, Welcome to Ideas2IT Chatbot`)
            await sendMessageBasedOnType(recipientPhone, helpTextMessage());
          } else {
            const resultQuery = await dialogFlowService.dialogFlowQuery(incomingMessage?.text?.body);
            if (resultQuery[0]?.queryResult?.fulfillmentText) {
              return await sendMessageBasedOnType(recipientPhone, {
                message: resultQuery[0].queryResult.fulfillmentText,
                type: "text_message"
              })
            }
          }
        } else if (typeOfMsg === "simple_button_message") {
          console.log("Received a simple button message");
          const { button_reply: { id } } = incomingMessage;
          const response = await messagingServices.msgBasedOnSimpleButtonId(id, userInfo, recipientPhone);
          await sendMessageBasedOnType(recipientPhone, response);
        } else if (typeOfMsg === "media_message" || !typeOfMsg) {
          console.log("Received a media message");
          const isImage = incomingMessage.image;
          const mediaDetails = await whatsappConfig._retrieveMediaUrl({
            media_id: isImage ? incomingMessage.image.id : incomingMessage.document.id
          });

          const localFilePathName = process.cwd() + "/public/localfiles/" + generateLocalFileName(userInfo, incomingMessage, isImage);

          await downloadMediaFromUrl(mediaDetails.url, localFilePathName);
          await messagingServices.downloadAndUploadToDrive({
            mediaDetails, incomingMessage, isImage, userInfo, localFilePathName
          });
          await sendMessageBasedOnType(recipientPhone, {
            message: "Thanks for sharing document with us.",
            type: "text_message"
          });
          whatsappConfig.deleteMedia({ media_id: isImage ? incomingMessage.image.id : incomingMessage.document.id });
          removeFileFromLocal(localFilePathName);
        }
      } else {
        await sendMessageBasedOnType(recipientPhone, verificationResult);
        if (verificationResult.message === "Verification successful.") {
          await sendMessageBasedOnType(recipientPhone, helpTextMessage());
        }
      }
      return true;
    } catch (err) {
      console.log(err)
      throw err;
    }
  }
};

const downloadMediaFromUrl = async (url, localFilePathName) => {
  try {
    return await whatsappConfig.downloadMediaViaUrl({ media_url: url, localFilePath: localFilePathName });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  receivedMessage
};
