const express = require("express");
const router = express.Router();
const dialogFlowController = require("../controllers/dialogFlow.controller");

router.get("/text_query", dialogFlowController.getTextQueryResult);

module.exports = router;