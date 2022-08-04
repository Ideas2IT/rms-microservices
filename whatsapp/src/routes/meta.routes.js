const express = require("express");
const router = express.Router();

const metaController = require("../controllers/meta.controller");

router.get('/callbackurl', (req, res) => {
  try {
    console.log('GET: Someone is pinging me!');

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && process.env.META_WA_VERIFYTOKEN === token) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error({ error })
    return res.sendStatus(500);
  }
});

router.post('/callbackurl', metaController.receivedMessage);

module.exports = router;
