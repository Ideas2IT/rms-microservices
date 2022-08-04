const request = require("supertest");
const sinon = require("sinon");
const app = require("../../index");
const dialogFlowServices = require("../../src/services/dialogFlow.service");

jest.mock('uuid', () => ({ v4: () => 'hjhj87878' }));
describe("dialogFlow routes", () => {
  test("should respond 200 for /dialogflow/text_query", async () => {
    sinon.stub(dialogFlowServices, "dialogFlowQuery").returns(dialogFlowMockResponse)
    const response = await request(app).get("/dialogflow/text_query").send({
      text: "Hi"
    });

    expect(response.status).toBe(200);
    expect(response._body.fulfillmentText).toBe("How can I help you?")
  });
});

const dialogFlowMockResponse = [
  {
    responseId: '2ec906dc-aa00-4006-bfcc-27b59bae157f-91801cb0',
    queryResult: {
      fulfillmentMessages: [Array],
      outputContexts: [],
      queryText: 'Hi',
      speechRecognitionConfidence: 0,
      action: '',
      parameters: [Object],
      allRequiredParamsPresent: true,
      fulfillmentText: 'How can I help you?',
      webhookSource: '',
      webhookPayload: null,
      intent: [Object],
      intentDetectionConfidence: 1,
      diagnosticInfo: null,
      languageCode: 'en',
      sentimentAnalysisResult: null,
      cancelsSlotFilling: false
    },
    webhookStatus: null,
    outputAudioConfig: null
  },
  null,
  null
];
