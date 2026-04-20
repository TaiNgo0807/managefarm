const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");

router.post("/add", activityController.addActivity);
router.get("/garden/:garden_id", activityController.getHistoryByGarden);
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
