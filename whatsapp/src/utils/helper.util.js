const mimeTypes = require("./mimeTypes.util");
const dateUtils = require("./date.utils");
const otpGenerator = require("otp-generator");

/**
 * @name constructWhatsAppNumber
 * @description Concat the number with the string whatsapp to send and receive messages
 * @param {string} number 
 * @returns {string} concatenated number  
 */
const constructWhatsAppNumber = (number) => {
  return "whatsapp:+" + number;
};

/**
 * @name getPhoneNumber
 * @description Get the phone number of sender/receiver by removing whatsapp: from the string
 * @param {string} whatsappString 
 * @returns {string} phoneNumber
 */
const getPhoneNumber = (whatsappString) => {
  return whatsappString.replace("whatspp:", "");
}

/**
 * @name getFileMimeType
 * @description Get the file mimetype based on the filename
 * @param {string} fileName 
 * @returns {string} fileMimeType
 */
const getFileMimeType = (fileName) => {
  const file = fileName.split(".");
  const fileType = file[file.length - 1].trim();
  return mimeTypes[fileType];
};

/**
 * @name isNumberVerified
 * @description To determine whether the number has already been verified or not
 * @param {object} userInfo 
 * @returns {boolean}
 */
const isNumberVerified = (userInfo) => {
  if (userInfo.isOTPVerified) {
    return true;
  }
  return false;
};

/**
 * @name isResendOtpNeeded
 * @description To determine whether an OTP resend is required or not.
 * @param {object} userInfo 
 * @returns {boolen}
 */
const isResendOtpNeeded = (userInfo) => {
  const now = new Date();
  const isExpiryBefore = dateUtils.isDateBefore(now, new Date(userInfo.otpExpireOn))
  return !isExpiryBefore;
};

/**
 * @name otpVerification
 * @description Comparing the OTP sent and entered values
 * @param {object} userInfo 
 * @param {string} OTP 
 * @returns {boolean}
 */
const otpVerification = (userInfo, OTP) => {
  if (userInfo.otpForValidation === OTP) {
    return true;
  }
  return false;
};

/**
 * @name generateOtp
 * @description Will generate a 6 digit OTP using otp-generator
 * @returns {string}
 */
const generateOtp = () => {
  return otpGenerator.generate(6, { specialChars: false });
};

/**
 * @name getObjKey
 * @description To the Key of the object by comparing the value
 * @param {object} obj 
 * @param {string} value 
 * @returns 
 */
const getObjKey = (obj, value) => {
  return Object.keys(obj).find(key => obj[key] === value);
};

const generateLocalFileName = (userInfo, incomingMessage, isImage) => {
  const userId = userInfo._id;
  let fileExtension = "";
  if (isImage) {
    fileExtension = getObjKey(mimeTypes, incomingMessage.image.mime_type);
  } else {
    fileExtension = getObjKey(mimeTypes, incomingMessage.document.mime_type);
  }
  return userId + new Date().valueOf() + "." + fileExtension;
};

const getMessageBody = (messageDetail) => {
  if(messageDetail.type === "text_message") {
    return messageDetail?.text?.body;
  } else if(messageDetail.type === "simple_button_message") {
    return messageDetail.button_reply.id;
  }
};

module.exports = {
  constructWhatsAppNumber,
  getPhoneNumber,
  getFileMimeType,
  isNumberVerified,
  otpVerification,
  isResendOtpNeeded,
  generateOtp,
  getObjKey,
  generateLocalFileName,
  getMessageBody
};
