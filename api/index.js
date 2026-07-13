const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const allRoutes = require("./routes/allRoutes");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

app.use(
cors({
origin: true,
credentials: true,
})
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* -------------------- DATABASE -------------------- */

async function connectToDB() {
try {
await mongoose.connect(process.env.MONGO);
console.log("✅ Connected to MongoDB");
} catch (err) {
console.error("☢️ MongoDB connection error:", err.message);
process.exit(1);
}
}

connectToDB();

/* -------------------- CLOUDINARY -------------------- */

const cloudinary = require("cloudinary").v2;

const {
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
} = process.env;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn("⚠️ Cloudinary not configured - image uploads disabled");
} else {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  (async () => {
    try {
      const response = await cloudinary.api.ping();
      console.log("☁️ Cloudinary connected:", response.status || response);
    } catch (error) {
  console.error("☁️ Cloudinary connection failed:");
  console.dir(error, { depth: null });
}
  })();
}

module.exports.cloudinary = cloudinary;

/* -------------------- ROUTES -------------------- */

app.use("/api", allRoutes);

/* -------------------- FRONTEND (PROD BUILD) -------------------- */

if (process.env.NODE_ENV === "production") {
const path = require("path");

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
res.sendFile(path.join(__dirname, "dist", "index.html"));
});
}

/* -------------------- EXPORT -------------------- */

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;