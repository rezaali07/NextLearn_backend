const GlobalSettings = require("../models/GlobalSettings");
const Course = require("../models/Course");

// PUT /api/admin/global-settings
exports.updateGlobalSettings = async (req, res) => {
  try {
    const {
      globalOfferPercentage,
      globalOfferStart,
      globalOfferEnd,
      globalCoupon
    } = req.body;

    let settings = await GlobalSettings.findOne();
    if (!settings) settings = new GlobalSettings();

    settings.globalOfferPercentage = globalOfferPercentage;
    settings.globalOfferStart = globalOfferStart;
    settings.globalOfferEnd = globalOfferEnd;
    settings.globalCoupon = globalCoupon;

    await settings.save();
    res.status(200).json({ success: true, message: "Global settings updated", settings });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET /api/global-settings
exports.getGlobalSettings = async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/checkout/price
exports.calculateFinalPrice = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    const now = new Date();

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    const settings = await GlobalSettings.findOne();
    let offerPrice = course.price;
    let discountApplied = 0;

    // Apply global offer
    if (
      settings?.globalOfferPercentage &&
      settings.globalOfferStart <= now &&
      settings.globalOfferEnd >= now
    ) {
      offerPrice = course.price - (course.price * settings.globalOfferPercentage) / 100;
    }

    let finalPrice = offerPrice;

    // Apply global coupon
    if (
      couponCode &&
      settings?.globalCoupon?.code?.toUpperCase() === couponCode.toUpperCase() &&
      settings.globalCoupon.expiry >= now
    ) {
      const coupon = settings.globalCoupon;
      if (coupon.discountType === "percentage") {
        discountApplied = (coupon.discountValue / 100) * offerPrice;
      } else {
        discountApplied = coupon.discountValue;
      }
      finalPrice = Math.max(offerPrice - discountApplied, 0);
    }

    res.status(200).json({
      originalPrice: course.price,
      offerPrice: offerPrice !== course.price ? offerPrice : null,
      discountApplied,
      finalPrice
    });
  } catch (err) {
    console.error("Price calculation error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// PUT /api/admin/global-settings/coupon
exports.updateGlobalCoupon = async (req, res) => {
  try {
    const { globalCoupon } = req.body;

    let settings = await GlobalSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Global settings not found" });

    settings.globalCoupon = globalCoupon;
    await settings.save();

    res.json({ success: true, message: "Global coupon updated", globalCoupon });
  } catch (err) {
    console.error("Update coupon error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// DELETE /api/admin/global-settings/coupon
exports.deleteGlobalCoupon = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Global settings not found" });

    settings.globalCoupon = undefined;
    await settings.save();

    res.json({ success: true, message: "Global coupon deleted" });
  } catch (err) {
    console.error("Delete coupon error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// DELETE /api/admin/global-settings/offer
exports.deleteGlobalOffer = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) return res.status(404).json({ error: "Global settings not found" });

    settings.globalOfferPercentage = undefined;
    settings.globalOfferStart = undefined;
    settings.globalOfferEnd = undefined;

    await settings.save();

    res.json({ success: true, message: "Global offer deleted" });
  } catch (err) {
    console.error("Delete offer error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
