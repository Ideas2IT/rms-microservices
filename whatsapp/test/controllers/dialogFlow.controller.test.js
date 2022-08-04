const sinon = require("sinon");
const dialogFlowController = require("../../src/controllers/dialogFlow.controller");
const dialogFlowServices = require("../../src/services/dialogFlow.service");
const { mockRequest, mockResponse } = require("../utils/interceptor");

describe("dialogFlow.controller", () => {
  test("should return the fullfillmentText when the dialogFlow return the messge", async () => {
    sinon.stub(dialogFlowServices, "dialogFlowQuery").returns(dialogFlowMockResponse);
    const req = mockRequest();
    req.params.body = {
      text: "Hello"
    };
    
    const res= mockResponse();

    const response = await dialogFlowController.getTextQueryResult(req, res);
    console.log("response", response)
    // expect(res.send).toHaveBeenCalledWith('Hello i am todo controller');
  });

  // test("should return error message when the dialogFlow service was failed", async () => {
  //   sinon.stub(dialogFlowServices, "dialogFlowQuery").returns({});
  //   const req = {
  //     body: {
  //       text: ""
  //     }
  //   }
  //   const res = {};
  // });
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
