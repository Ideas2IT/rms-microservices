const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userName: {
    type: String
  },
  email: {
    type: String,
    lowercase: true,
    index: true
  },
  verficationEmailSent: {
    type: Boolean,
    default: false
  },
  otpForValidation: String,
  isOTPVerified: {
    type: Boolean,
    default: false
  },
  otpExpireOn: Date,
  gDriveFolderId: String,
  isActive: {
    type: Boolean,
    default: true
  }
},
  { timestamps: true }
);

UserSchema.index({
  whatsappNumber: 1,
  email: 1
}, {
  unique: true
});

module.exports = mongoose.model("User", UserSchema);
