const twilioClient = require("../configs/twilio.config");
const dialogFlowService = require("../services/dialogFlow.service");
const gDriveService = require("../services/gDrive.service");
const emailService = require("../services/email.service");

const dbServices = require("../services/db.service");
const UserModel = require("../models/user.model");
const JobReferralModal = require("../models/jobReferral.model");

const {
  isNumberVerified, generateOtp, isResendOtpNeeded, otpVerification, getObjKey
} = require("../utils/helper.util");
const { addTenMinsToNow } = require("../utils/date.utils");
const mimeTypes = require("../utils/mimeTypes.util");
const formatter = require("../utils/responseFormatter.util");

/**
 * @name sendWhatsappMessage
 * @description Send a Whatsapp message from one account to anther account
 * @param {string} sender
 * @param {string} receiver
 * @param {string} message
 * @returns {object}
 */
const sendWhatsappMessage = async (sender, receiver, message) => {
  console.log("sendWhatsappMessage Initiated");
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: sender,
      to: receiver,
    });
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * @name deleteMediaMessage
 * @description To delete a media from Twilio's AWS S3 based on messageId
 * @param {string} messageId
 * @returns The response for deletion of media message
 */
const deleteMediaMessage = async (messageId) => {
  console.log("deleteMediaMessage Initiated");
  try {
    const response = await twilioClient.messages(messageId).remove();
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * @name numberVerification
 * @description Whatsapp number verification with OTP process
 * @param {string} phoneNumber
 * @param {string} body
 * @param {string} profileName
 * @returns {string}
 */
const numberVerification = async (phoneNumber, body, profileName, userInfo) => {
  console.log("numberVerification initiated");
  try {
    if (userInfo) {
      if (isNumberVerified(userInfo)) {
        return true;
      } else if (!userInfo.email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(body)) {
          if (body.includes("@ideas2it.com")) {
            const otp = generateOtp();
            await emailService.sendEmail(body, otp);
            await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
              otpForValidation: otp,
              otpExpireOn: addTenMinsToNow(),
              email: body,
              verficationEmailSent: true
            });
            return "OTP Sent to your Email. Please enter it here for verification";
          } else {
            return "Please send valid email address that belongs to Ideas2It";
          }
        } else {
          return "Your Email Id is not yet verified. Please send your Email for verification";
        }
      } else if (userInfo.verficationEmailSent && !isResendOtpNeeded(userInfo)) {
        if (otpVerification(userInfo, body)) {
          await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
            isOTPVerified: true
          });
          return "OTP Verification Successful";
        }
        return "OTP Verification failed. Please enter valid OTP";
      } else {
        const otp = generateOtp();
        await emailService.sendEmail(userInfo.email, otp);
        await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
          otpForValidation: otp,
          otpExpireOn: addTenMinsToNow(),
          verficationEmailSent: true
        });
        return "OTP Sent to your Email. Please enter it here for verification";
      }
    } else {
      await dbServices.insertData(UserModel, {
        whatsappNumber: phoneNumber,
        userName: profileName
      })
      return "Hey, Welcome to the Ideas2IT chatbot. To proceed, you must first complete the required verification. Please send your email for verification.";
    }
  } catch (err) {
    throw err;
  }
};

/**
 * @name replyMessage
 * @description Reply message for user from chatbot
 * @param {object} messageDetails 
 * @returns {*}
 */
const replyMessage = async (messageDetails) => {
  console.log("replyMessage initiated");
  try {
    const { Body, NumMedia, MediaUrl0, WaId, ProfileName, MediaContentType0 } = messageDetails;
    const userInfo = await dbServices.getByOtherField(UserModel, { whatsappNumber: WaId });
    const verficationStatus = await numberVerification(WaId, Body, ProfileName, userInfo);
    if (verficationStatus === true) {
      if (NumMedia === "0") {
        const resultQuery = await dialogFlowService.dialogFlowQuery(Body);
        if (resultQuery[0]?.queryResult?.fulfillmentText) {
          return resultQuery[0].queryResult.fulfillmentText;
        }
        return "Message transmission failed.";
      } else {
        let folderId = userInfo.gDriveFolderId;
        if (!folderId) {
          const createGDriveFolder = await gDriveService.createFolder(userInfo.email);
          folderId = createGDriveFolder.data.id;
          dbServices.updateByOtherField(UserModel, { whatsappNumber: WaId }, {
            gDriveFolderId: folderId
          });
        }

        const fileExtension = getObjKey(mimeTypes, MediaContentType0);
        let fileName = (Body === "") ? (new Date().valueOf() + "." + fileExtension) : Body;

        const uploadResponse = await gDriveService.uploadFile(
          fileName, MediaUrl0, folderId
        );

        const filePublicUrl = await gDriveService.generatePublicUrl(uploadResponse.data.id);

        dbServices.insertData(JobReferralModal, {
          fileId: uploadResponse.data.id,
          fileName: uploadResponse.data.name,
          mimeType: uploadResponse.data.mimeType,
          email: userInfo.email,
          folderId,
          webContentLink: filePublicUrl.data.webContentLink,
          webViewLink: filePublicUrl.data.webViewLink
        });
        return formatter.uploadFileResponse(uploadResponse)
      }
    } else {
      return verficationStatus;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendWhatsappMessage,
  deleteMediaMessage,
  numberVerification,
  replyMessage,
};
