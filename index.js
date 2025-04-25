const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Use your real Web App URL here
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-NiCxB6a3CIlDzZxc5JWvUjH_cjEYdP0xd02YbommprqCe3HXLX_weRu9uLmWZp0N/exec";

app.use(cors());
app.use(express.json());

app.post("/sync", async (req, res) => {
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, req.body, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("✅ Google Sheet response:", response.data);
    res.send("✅ Synced to Google Sheet!");
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    res.status(500).send("❌ Sync failed: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ RetainX Proxy running on port ${PORT}`);
});
