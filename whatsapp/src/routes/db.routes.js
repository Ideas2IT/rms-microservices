const express = require("express");
const router = express.Router();
const userController = require("../controllers/database/user.controller");

router.post("/createuser", userController.createUser);
router.put("/updatebywanumber/:whatsappNumber", userController.updateByWhatsappNumber);
router.get("/getbywanumber/:whatsappNumber", userController.getByWhatsappNumber);

module.exports = router;