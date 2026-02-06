const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
const authRoutes = require("./src/routes/authRoutes");
const spaceRoutes = require("./src/routes/spaceRoutes");
const dayMemoryRoutes = require("./src/routes/dayMemoryRoutes");

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/spaces", spaceRoutes);
app.use("/memories", dayMemoryRoutes);
app.use("/upload", require("./src/routes/uploadRoutes"));
app.use("/letters", require("./src/routes/letterRoutes"));
app.get("/",(req,res)=>{
    res.send("BetweenUs bakend running")
});
require("./src/cron/deleteAccount");
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("MongoDB connected");
    app.listen(5000,()=>{
        console.log("server is running on port 5000");
    });
}).catch((err)=>{
    console.error("DB connection failed",err);
});



