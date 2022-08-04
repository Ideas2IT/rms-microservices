const emailService = require("../services/email.service");
const gDriveService = require("../services/gDrive.service");
const dbServices = require("../services/db.service");
const UserModel = require("../models/user.model");
const JobReferralModal = require("../models/jobReferral.model");

const {
  generateOtp, isNumberVerified, isResendOtpNeeded, otpVerification, getObjKey
} = require("../utils/helper.util");
const { addTenMinsToNow } = require("../utils/date.utils");
const mimeTypes = require("../utils/mimeTypes.util");

const alreadyVerfiedEmailMsg = () => {
  return {
    message: "This email address has already been verified. Would you like to change the phone number associated with your email address?",
    listOfButtons: [
      {
        title: "Yes",
        id: "yes_change_phonenumber"
      }
    ],
    type: "simple_button_message"
  }
};

const otpSentMessage = () => {
  return {
    message: "For verification, kindly send the OTP that was delivered to your email address.",
    listOfButtons: [{
      title: "Resend the OTP",
      id: "yes_resend_otp"
    }, {
      title: "Change the Email",
      id: "yes_change_email"
    }],
    type: "simple_button_message"
  };
};

const sendOtp = async (email, phoneNumber) => {
  try {
    const otp = generateOtp();
    await emailService.sendEmail(email, otp);
    await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
      otpForValidation: otp,
      otpExpireOn: addTenMinsToNow(),
      email: email,
      verficationEmailSent: true,
      isOTPVerified: false
    });
    return otpSentMessage();
  } catch (err) {
    throw err;
  }
};

const validateEmailAddress = async (email, phoneNumber) => {
  try {
    if (!await dbServices.getByOtherField(UserModel, { email, isActive: true })) {
      return await sendOtp(email, phoneNumber);
    } else {
      await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
        email
      });
      return alreadyVerfiedEmailMsg();
    }
  } catch (err) {
    return err;
  }
};

const otpVerificationSuccessMsg = () => {
  return {
    message: "Verification successful.",
    type: "text_message"
  }
};

const otpVerificationFailedMsg = () => {
  return {
    message: "OTP Verification failed. To complete the verification, enter a valid OTP.",
    listOfButtons: [{
      title: "Resend the OTP",
      id: "yes_resend_otp"
    }],
    type: "simple_button_message"
  }
};

const changeEmailAddress = async (userInfo) => {
  try {
    await dbServices.updateByOtherField(UserModel, { whatsappNumber: userInfo.whatsappNumber }, {
      email: null,
      verficationEmailSent: false,
      isOTPVerified: false
    })
    return {
      message: "Please provide your new email address for verfication",
      type: "text_message"
    }
  } catch (err) {
    throw err;
  }
};

const updateAndResendOTP = async (userInfo, phoneNumber) => {
  try {
    const otp = generateOtp();
    await emailService.sendEmail(userInfo.email, otp);
    await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
      otpForValidation: otp,
      otpExpireOn: addTenMinsToNow(),
      verficationEmailSent: true
    });
    return otpSentMessage();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const verification = async (phoneNumber, body, profileName, userInfo) => {
  console.log("verifcation check initiated")
  try {
    if (userInfo) {
      if (isNumberVerified(userInfo)) {
        return true;
      } else if (!userInfo.email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(body)) {
          if (body.includes("@ideas2it.com")) {
            return await validateEmailAddress(body, phoneNumber);
          } else {
            return {
              message: `Dear ${profileName}, in order to continue, please enter the email address associated with the ideas2it domain.`,
              type: "text_message"
            }
          }
        } else {
          return {
            message: `Hello ${profileName}, Your email address hasn't been verified yet. Send a valid email address to move forward with the verification process.`,
            type: "text_message"
          }
        }
      } else if (userInfo.verficationEmailSent && !isResendOtpNeeded(userInfo)) {
        if (body === "yes_resend_otp") {
          return await updateAndResendOTP(userInfo, phoneNumber);
        } else if (body === "yes_change_email") {
          return await changeEmailAddress(userInfo);
        } else if (otpVerification(userInfo, body)) {
          let gDriveFolderId = null;
          const oldEmailRelatedData = await dbServices.getByOtherField(UserModel, { email: userInfo.email, whatsappNumber: { $ne: phoneNumber } });
          if (oldEmailRelatedData) {
            gDriveFolderId = oldEmailRelatedData.gDriveFolderId;
          }
          await dbServices.updateByOtherField(UserModel, { whatsappNumber: phoneNumber }, {
            isOTPVerified: true,
            isActive: true,
            gDriveFolderId
          });
          await dbServices.deleteMany(UserModel,
            { email: userInfo.email, whatsappNumber: { $ne: phoneNumber } });
          return otpVerificationSuccessMsg();
        }
        return otpVerificationFailedMsg();
      } else {
        return await updateAndResendOTP(userInfo, phoneNumber);
      }
    } else {
      dbServices.insertData(UserModel, {
        whatsappNumber: phoneNumber,
        userName: profileName
      })
      return {
        message: `Hey ${profileName}, \nWelcome to the Ideas2IT chatbot. You must finish the verification in order to move forward. Please provide your email for verification.`,
        type: "text_message"
      }
    }
  } catch (err) {
    throw err;
  }
};

const msgBasedOnSimpleButtonId = async (buttonId, userInfo, phoneNumber) => {
  switch (buttonId) {
    case "candidate_referral": {
      return {
        message: "Please provide the candidate's CV.",
        type: "text_message"
      }
    }
    case "yes_change_phonenumber": {
      await dbServices.updateByOtherField(UserModel, { email: userInfo.email }, {
        whatsappNumber: phoneNumber
      });
      await dbServices.updateOldData(UserModel, { email: userInfo.email, isActive: true }, {
        isActive: false
      });
      return await sendOtp(userInfo.email, phoneNumber);
    }
    case "yes_resend_otp": {
      return await updateAndResendOTP(userInfo, phoneNumber)
    }
    case "email_change": {
      return {
        message: "Please provide your new Email address",
        type: "text_message"
      }
    }
    case "reactivate_account": {
      return await sendOtp(userInfo.email, phoneNumber);
    }
    default: ""
  }
};

const downloadAndUploadToDrive = async (params) => {
  try {
    const { incomingMessage, isImage, userInfo, localFilePathName } = params;

    let fileName, fileExtension, mimeType;
    if (isImage) {
      mimeType = incomingMessage.image.mime_type;
      fileExtension = getObjKey(mimeTypes, incomingMessage.image.mime_type);
      fileName = new Date().valueOf() + "." + fileExtension
    } else {
      mimeType = incomingMessage.document.mime_type;
      fileExtension = getObjKey(mimeTypes, incomingMessage.document.mime_type);
      fileName = incomingMessage.document.filename;
    }

    let folderId = userInfo.gDriveFolderId;
    if (!folderId) {
      const createGDriveFolder = await gDriveService.createFolder(userInfo.email);
      folderId = createGDriveFolder.data.id;
      dbServices.updateByOtherField(UserModel, { whatsappNumber: userInfo.whatsappNumber }, {
        gDriveFolderId: folderId
      });
    }

    const uploadResponse = await gDriveService.uploadFile(
      fileName, localFilePathName, folderId
    );
    if (uploadResponse) {
      const filePublicUrl = await gDriveService.generatePublicUrl(uploadResponse.data.id);
      dbServices.insertData(JobReferralModal, {
        fileId: uploadResponse.data.id,
        fileName: fileName,
        mimeType,
        email: userInfo.email,
        folderId,
        webContentLink: filePublicUrl.data.webContentLink,
        webViewLink: filePublicUrl.data.webViewLink,
        status: "NEW"
      });

      return {
        message: "Thanks for sharing document with us.",
        type: "text_message"
      }
    }

    return {
      message: "Some error occured. Please share the document again",
      type: "text_message"
    };

  } catch (err) {
    console.log("Error at downloadAndUploadToDrive", err);
    throw err;
  }
};



module.exports = {
  verification,
  msgBasedOnSimpleButtonId,
  changeEmailAddress,
  downloadAndUploadToDrive
};
