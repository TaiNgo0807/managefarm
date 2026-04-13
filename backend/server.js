const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/farmers", require("./routes/farmerRoutes"));
app.use("/api/farm-products", require("./routes/farmProductRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy ngon ơ tại port ${PORT} nha!`);
});
