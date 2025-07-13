// routes/aiRoutes.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

router.post("/chat", async (req, res) => {
  const messages = req.body.messages;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528-qwen3-8b", // or another model OpenRouter supports
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("❌ OpenRouter Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

module.exports = router;
