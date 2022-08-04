const emailServices = require("../services/email.service");

/**
 * @name sendAnEmail
 * @description To Send an Email
 * @param {object} req 
 * @param {object} res 
 */
const sendAnEmail = async (req, res) => {
  try {
    const { sendTo, OTP } = req.body;
    const response = await emailServices.sendEmail(sendTo, OTP);

    if(response.messageId) {
      res.send("Email transmission successful");
    } else {
      res.send("Email transmission failed");
    }
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  sendAnEmail
};
