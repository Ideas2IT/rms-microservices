const emailConfig = require("../configs/email.config");

/**
 * @name sendEmail
 * @description To the send a email
 * @param {string} sendTo 
 * @param {string} OTP 
 * @returns 
 */
const sendEmail = async (sendTo, OTP) => {
  try {
    const response = await emailConfig.sendMail({
      from: process.env.EMAIL_ID,
      to: sendTo,
      subject: "OTP for Chatbot",
      html: `Dear Customer, Your OTP for accessing Ideas2IT Whatsapp Chatbot application is <b>${OTP}</b>. Use this passcode to complete the verification process. Thank you.`
    });
    return response;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendEmail
};
