const express = require("express");
const router = express.Router();
const { generateEsewaSignature } = require("../controller/PaymentController");
const {verifyEsewaPayment}= require("../controller/PaymentController");

router.post("/generate-signature", generateEsewaSignature);
router.post("/verify", verifyEsewaPayment);


module.exports = router;
