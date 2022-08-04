const gDriveService = require("../services/gDrive.service");

/**
 * @name uploadFileToDrive
 * @description To upload a file to Google Drive
 * @param {object} req 
 * @param {object} res 
 */
const uploadFileToDrive = async (req, res) => {
  try {
    const { fileName, fileStorageUrl, driveFolderId } = req.body;
    const uploadResponse = await gDriveService.uploadFile(fileName, fileStorageUrl, driveFolderId);

    res.send(uploadResponse);
  } catch (err) {
    res.send(err);
  }
};

/**
 * @name createFolderInDrive
 * @description To create a folder in Google Drive
 * @param {object} req 
 * @param {object} res 
 */
const createFolderInDrive = async(req,res) => {
  console.log("createFolderInDrive controller initiated");
  try {
    const { foldername } = req.params;
    const folderDetails = await gDriveService.createFolder(foldername);
    res.send(folderDetails);
  } catch(err) {
    res.send(err);
  }
};

/**
 * @description To convert access and generate a public url for a file in drive
 * @param {object} req 
 * @param {object} res 
 */
const getGeneratedPublicUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await gDriveService.generatePublicUrl(fileId);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  uploadFileToDrive,
  createFolderInDrive,
  getGeneratedPublicUrl
};
