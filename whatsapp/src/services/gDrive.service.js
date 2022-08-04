const driveConfig = require("../configs/gDrive.config");
const { getFileMimeType } = require("../utils/helper.util");
const axios = require("axios");
const stream = require('stream');
const { createReadStream } = require("fs");

/**
 * @name uploadFile
 * @description To upload a file to Google Drive
 * @param {string} fileName 
 * @param {string} fileStorageUrl 
 * @returns 
 */
const uploadFile = async (fileName, fileStorageUrl, folderId, isUrl = false) => {
  console.log("upload file service initiated");
  try {
    const response = await driveConfig.files.create({
      requestBody: {
        name: fileName,
        mimeType: getFileMimeType(fileName),
        parents: [folderId],
      },
      media: {
        mimeType: getFileMimeType(fileName),
        body: isUrl ? downloadDataFromUrl(fileStorageUrl) : createReadStream(fileStorageUrl),
        fields: 'id'
      }
    });
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * @name downloadDataFromUrl
 * @description Download the content from the given url
 * @param {String} url 
 * @returns the content of the media file from the URL
 */
const downloadDataFromUrl = (url) => {
  const res = axios.get(url);
  const data = new stream.PassThrough();
  data.on("error", (err) => console.log(err));
  data.on("end", () => console.log("Data from the media downloaded"));
  res.pipe(data);
  return data;
};

/**
 * @name createFolder
 * @description To create a folder in Google Drive
 * @param {string} folderName 
 * @returns {object}
 */
const createFolder = async (folderName) => {
  try {
    const response = await driveConfig.files.create({
      fields: "id",
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * @name generatePublicUrl
 * @description To make the file in Google drive public
 * @param {string} fileId 
 * @returns {object}
 */
const generatePublicUrl = async (fileId) => {
  try {
    await driveConfig.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      }
    });

    const result = await driveConfig.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  uploadFile,
  createFolder,
  generatePublicUrl
};
