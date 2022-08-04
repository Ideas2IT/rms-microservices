const request = require("supertest");
const sinon = require("sinon");
const app = require("../../index");
const twilioService = require("../../src/services/twilio.service");

describe("twilio routes", () => {

  beforeAll(()=> {
    sinon.stub(twilioService, "sendWhatsappMessage").returns(twilioMockResponse);
  });

  test("should return Message send successful as a response for sending new message", async() => {
    const response = await request(app).post("/twilio/sendnewmessage").send({
      "message": "Hello!",
      "receiver": "918098989898"
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Message transmission successful.")
  });

  test("should return Message send successful as a response for replying a message", async() => {
    const response = await request(app).post("/twilio/reply").send({
      "message": "Hello!",
      "receiver": "918098989898"
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Message transmission successful.")
  });
});

const twilioMockResponse = {
  "sid": "SMb626c65c626f4e57a33533dee14276cd",
  "date_created": "Thu, 14 Jul 2022 05:06:30 +0000",
  "date_updated": "Thu, 14 Jul 2022 05:06:30 +0000",
  "date_sent": null,
  "account_sid": "ACee61c3256c702d4a2f72427882fd161b",
  "to": "whatsapp:+918098989898",
  "from": "whatsapp:+14155238886",
  "messaging_service_sid": null,
  "body": "Hello!",
  "status": "queued",
  "num_segments": "1",
  "num_media": "0",
  "direction": "outbound-api",
  "api_version": "2010-04-01",
  "price": null,
  "price_unit": null,
  "error_code": null,
  "error_message": null,
  "uri": "/2010-04-01/Accounts/ACee61c3256c702d4a2f72427882fd161b/Messages/SMb626c65c626f4e57a33533dee14276cd.json",
  "subresource_uris": {
    "media": "/2010-04-01/Accounts/ACee61c3256c702d4a2f72427882fd161b/Messages/SMb626c65c626f4e57a33533dee14276cd/Media.json"
  }
};
