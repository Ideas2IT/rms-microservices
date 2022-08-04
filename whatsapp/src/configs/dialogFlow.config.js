const dialogFlow = require('@google-cloud/dialogflow');
require('dotenv').config();

const credentials = {
  "project_id": process.env.DF_PROJECT_ID,
  "private_key_id": process.env.DF_PRIVATE_KEY_ID,
  "private_key": process.env.DF_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.DF_CLIENT_EMAIL,
  "client_id": process.env.DF_CLIENT_ID
}

const dfSessionClient = new dialogFlow.SessionsClient({ credentials });

module.exports = dfSessionClient;
