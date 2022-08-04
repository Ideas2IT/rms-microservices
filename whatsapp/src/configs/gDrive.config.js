const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GDRIVE_CLIENT_ID,
  process.env.GRIVE_CLIENT_SECRET,
  process.env.GDRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GDRIVE_REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

module.exports = drive;
