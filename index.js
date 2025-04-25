
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace this with your real MongoDB Atlas URI
const MONGO_URI = "mongodb+srv://retainx_user:retainx123@cluster0.8hhzh2.mongodb.net/retainx?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

app.post("/sync", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db("retainx");
    const collection = db.collection("customers");

    const rows = req.body.rows;
    if (!Array.isArray(rows)) throw new Error("Invalid data");

    await collection.insertMany(rows);
    res.send("✅ Data synced to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB Insert Error:", err.message);
    res.status(500).send("❌ Failed to insert data into MongoDB");
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ RetainX MongoDB Proxy running on port ${PORT}`);
});
