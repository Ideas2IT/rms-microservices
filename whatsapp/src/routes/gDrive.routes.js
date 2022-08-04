const express = require("express");
const router = express.Router();
const gDriveController = require("../controllers/gDrive.controller");

router.post("/uploadfile", gDriveController.uploadFileToDrive);
router.post("/createfolder/:foldername", gDriveController.createFolderInDrive);
router.get("/getpublicurl/:fileId", gDriveController.getGeneratedPublicUrl);

module.exports = router;
