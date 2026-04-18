const express = require("express");
const router = express.Router();
const gardenController = require("../controllers/gardenController");

router.get("/dashboard", gardenController.getDashboard);
router.post("/add", gardenController.addGarden);
router.get("/", gardenController.getAllGardens);
router.delete("/:id", gardenController.deleteGarden);

module.exports = router;
