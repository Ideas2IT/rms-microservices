const metaServices = require("../services/meta.service");

const receivedMessage = async (req, res) => {
  try {
    await metaServices.receivedMessage(req.body);
    return res.sendStatus(200);

  } catch (err) {
    return res.sendStatus(500);
  }
};

const getMedia = async(req,res) => {
  try {
    await metaServices.downloadMediaFromUrl(req.body);
    return res.sendStatus(200);
  } catch(err) {
    res.sendStatus(500);
  }
}

module.exports = {
  receivedMessage,
  getMedia
};