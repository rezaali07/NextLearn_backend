const mongoose = require("mongoose");

const globalSettingsSchema = new mongoose.Schema({
  globalOfferPercentage: Number,
  globalOfferStart: Date,
  globalOfferEnd: Date,
  globalCoupon: {
    code: String,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage"
    },
    discountValue: Number,
    expiry: Date
  }
});

module.exports = mongoose.model("GlobalSettings", globalSettingsSchema);
