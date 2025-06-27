const crypto = require("crypto");
const axios = require("axios");

// Signature Generation for eSewa payment
exports.generateEsewaSignature = async (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

    const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("base64");

    res.status(200).json({ signature: hmac });
  } catch (error) {
    console.error("❌ Error generating signature:", error);
    res.status(500).json({ message: "Signature generation failed" });
  }
};
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { encodedData, transactionId } = req.body;
    const decoded = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));

    if (decoded.status !== "COMPLETE") {
      return res.status(400).json({ success: false, message: "Payment not completed." });
    }

    const serverSignature = crypto
      .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
      .update(decoded.signed_field_names.split(",").map(f => decoded[f]).join(","))
      .digest("base64");

    if (serverSignature !== decoded.signature) {
      return res.status(400).json({ success: false, message: "Invalid signature." });
    }

    // ✅ TODO: Mark course as purchased in DB
    // You can look up by `transaction_uuid`, or attach courseId during payment

    return res.status(200).json({
      success: true,
      message: "Payment verified",
      courseId: "your-course-id", // Replace dynamically
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// (Optional) Verify Payment after redirect (for safety)
exports.verifyEsewaTransaction = async (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({ message: "Missing fields for verification" });
    }

    const statusUrl = `https://rc.esewa.com.np/api/epay/transaction/status?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;

    const { data } = await axios.get(statusUrl);

    res.status(200).json({ status: data.status, reference_id: data.ref_id || null });
  } catch (error) {
    console.error("❌ Error verifying transaction:", error);
    res.status(500).json({ message: "Transaction verification failed" });
  }
};
