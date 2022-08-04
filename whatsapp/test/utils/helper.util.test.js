const helper = require("../../src/utils/helper.util");

describe("helper util", () => {
  test("Should returns the concatenated whatsapp number", () => {
    const concatenatedNumber = helper.constructWhatsAppNumber("918908908899");
    expect(concatenatedNumber).toBe("whatsapp:+918908908899");
  });

  test("Should returns expected mimeType based on the fileName", () => {
    const mimeType = helper.getFileMimeType("Madhankumar.pdf");
    expect(mimeType).toBe("application/pdf");
  })

  test("Should return the phone without the text whatsapp in it", () => {
    const result = helper.getPhoneNumber("whatspp:9199099909123");
    expect(result).toBe("9199099909123");
  })

  test("Should return true when the user's whatsapp number is already verified", () => {
    const result = helper.isNumberVerified({isOTPVerified: true});
    expect(result).toBeTruthy();
  });

  test("Should return false when the user's whatsapp number is not verified", () => {
    const result = helper.isNumberVerified({isOTPVerified: false});
    expect(result).toBeFalsy();
  });

  test("Should return true when the resend otp is needed", () => {
    
  });

  test("Should return false when the resend otp is not needed", () => {
    const result = helper.isResendOtpNeeded({otpExpireOn: "2022-07-22T10:34:35.470+00:00"});
    expect(result).toBeFalsy();
  });

  test("Should return true when the otp entered is matched successfully", () => {

  });

  test("Should return false when the opt entered is incorrect", () => {

  });

  test("Should return the 6 digit otp", () => {

  });
});
