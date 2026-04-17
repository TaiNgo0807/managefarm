const express = require("express");
const router = express.Router();
const gardenController = require("../controllers/gardenController");

router.get("/dashboard", gardenController.getDashboard);
router.post("/add", gardenController.addGarden);
// Thêm dòng này để gọi hàm vừa tạo:
router.get("/", gardenController.getAllGardens);

module.exports = router;
