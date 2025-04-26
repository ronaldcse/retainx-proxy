
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace this with your real MongoDB Atlas URI
const MONGO_URI = "mongodb+srv://retainx_user:retainx123@cluster0.krkxo3h.mongodb.net/retainx?retryWrites=true&w=majority&appName=Cluster0";

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

// 🚀 New Dashboard API clearly calculates RFM and churn
app.get("/dashboard", async (req, res) => {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db("retainx");
    const customers = db.collection("customers");

    const allCustomers = await customers.find({}).toArray();
    
    const today = new Date();

    const calculatedCustomers = allCustomers.map((cust) => {
      const lastOrder = new Date(cust["Last Order Date"]);
      const daysSinceOrder = Math.floor((today - lastOrder) / (1000 * 3600 * 24));

      let rScore = daysSinceOrder <= 30 ? 5 : daysSinceOrder <= 60 ? 4 : daysSinceOrder <= 90 ? 3 : daysSinceOrder <= 120 ? 2 : 1;
      let fScore = cust["Order Frequency"] >= 10 ? 5 : cust["Order Frequency"] >= 7 ? 4 : cust["Order Frequency"] >= 4 ? 3 : cust["Order Frequency"] >= 2 ? 2 : 1;
      let mScore = cust["Total Spend"] >= 10000 ? 5 : cust["Total Spend"] >= 5000 ? 4 : cust["Total Spend"] >= 2000 ? 3 : cust["Total Spend"] >= 1000 ? 2 : 1;

      const totalRFM = rScore + fScore + mScore;
      let churnRisk = totalRFM >= 11 ? "Low" : totalRFM >= 7 ? "Medium" : "High";

      const loyaltyPoints = Math.floor(cust["Total Spend"] / 100);
      const loyaltyTier = loyaltyPoints >= 1501 ? "Gold" : loyaltyPoints >= 501 ? "Silver" : "Bronze";

      let segment = "Occasional";
      if (loyaltyTier === "Gold" && churnRisk === "Low") segment = "VIP";
      else if (churnRisk === "High") segment = "At-Risk";
      else if (cust["Order Frequency"] <= 1 && daysSinceOrder <= 30) segment = "New";

      return {
        customerId: cust["Customer ID"],
        daysSinceOrder,
        churnRisk,
        loyaltyPoints,
        loyaltyTier,
        segment,
        totalSpend: cust["Total Spend"],
        frequency: cust["Order Frequency"],
        lastOrder: cust["Last Order Date"]
      };
    });

    res.json(calculatedCustomers);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Server error");
  } finally {
    await client.close();
  }
});

