const express = require("express");
const rootRouter = express.Router();

const dialogFlowRouter = require("./dialogFlow.routes");
const twilioRouter = require("./twilio.routes");
const gDriveRouter = require("./gDrive.routes");
const emailRouter = require("./email.routes");
const dbRouter = require("./db.routes");
const metaRouter = require("./meta.routes");

rootRouter.use("/dialogflow", dialogFlowRouter);
rootRouter.use("/twilio", twilioRouter);
rootRouter.use("/gdrive", gDriveRouter);
rootRouter.use("/email", emailRouter);
rootRouter.use("/db", dbRouter);
rootRouter.use("/meta", metaRouter);

module.exports = rootRouter;
