const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const allRoutes = require("./routes/allRoutes");

const app = express();

// Behind Vercel's proxy: use the visitor's IP (X-Forwarded-For) for the
// login / register rate limits, not the proxy's.
app.set("trust proxy", 1);

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

/* -------------------- ROUTES -------------------- */

app.use("/api", allRoutes);


/* -------------------- EXPORT -------------------- */

const PORT = process.env.PORT || 4444;

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:");
  console.error(err);

  // The stack trace helps locally but mustn't reach the public
  // (Vercel sets NODE_ENV=production).
  res.status(500).json({
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;