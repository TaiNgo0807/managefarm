const express = require("express");
const router = express.Router();
const farmProductController = require("../controllers/farmProductController");

router.get("/reminders", farmProductController.getReminders);
router.post("/", farmProductController.createFarmProduct);

module.exports = router;
