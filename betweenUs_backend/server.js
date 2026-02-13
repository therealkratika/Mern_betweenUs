const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const spaceRoutes = require("./src/routes/spaceRoutes");
const dayMemoryRoutes = require("./src/routes/dayMemoryRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const letterRoutes = require("./src/routes/letterRoutes");
require("dotenv").config();

const app = express();

// Cron
require("./src/cron/deleteAccount");

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-betweenus-1.onrender.com" 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
// API routes
app.use("/auth", authRoutes);
app.use("/spaces", spaceRoutes);
app.use("/memories", dayMemoryRoutes);
app.use("/upload", uploadRoutes);
app.use("/letters", letterRoutes);


app.get("/health", (req, res) => {
  res.json({ status: "Backend running" });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
