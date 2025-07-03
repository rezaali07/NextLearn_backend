const express = require("express");
const router = express.Router();

const {
  updateGlobalSettings,
  getGlobalSettings,
  calculateFinalPrice,
  updateGlobalCoupon,
  deleteGlobalCoupon,
  deleteGlobalOffer
} = require("../controller/globalSettingsController");

const { isAuthenticatedUser, authorizedRoles } = require('../middleware/auth');


router.put("/admin/global-settings",isAuthenticatedUser, authorizedRoles('admin'), updateGlobalSettings);
router.put("/admin/global-settings/coupon", isAuthenticatedUser, authorizedRoles('admin'), updateGlobalCoupon);
router.delete("/admin/global-settings/coupon", isAuthenticatedUser, authorizedRoles('admin'), deleteGlobalCoupon);
router.delete("/admin/global-settings/offer", isAuthenticatedUser, authorizedRoles('admin'), deleteGlobalOffer);
router.get("/global-settings", getGlobalSettings);
router.post("/checkout/price", isAuthenticatedUser, calculateFinalPrice);

module.exports = router;
