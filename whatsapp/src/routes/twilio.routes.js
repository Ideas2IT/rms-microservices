const express = require("express");
const router = express.Router();
const twilioController = require("../controllers/twilio.controller")

router.post("/sendnewmessage", twilioController.sendNewMessage); // send a new message in postman
router.post("/reply", twilioController.replyForAMessage); // This will trigger when an event happened to twilio configured number
router.delete("/deletemedia",twilioController.deleteMedia); // To delete a media from twilio AWS S3

module.exports = router;
