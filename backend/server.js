const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const gardenRoutes = require("./routes/gardenRoutes");
app.use("/api/gardens", gardenRoutes);

const medicineRoutes = require("./routes/medicineRoutes");
app.use("/api/medicines", medicineRoutes);

const activityRoutes = require("./routes/activityRoutes");
app.use("/api/activities", activityRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/(.*)", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
