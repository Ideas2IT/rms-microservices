const mongoose = require("mongoose");

const JobReferralSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  folderId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  referralPosition: String,
  webContentLink: String,
  webViewLink: String,
  status: {
    type: String,
    default: "NEW"
  }
}, {
  timestamps: true
});

JobReferralSchema.index({
  fileId: 1,
  folderId: 1,
  email: 1
});

module.exports = mongoose.model("JobReferral", JobReferralSchema);
