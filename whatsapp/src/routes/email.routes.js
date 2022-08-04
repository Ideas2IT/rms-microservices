const express = require("express");
const router = express.Router();
const emailController = require("../controllers/email.controller");

router.post("/send", emailController.sendAnEmail);

module.exports = router;