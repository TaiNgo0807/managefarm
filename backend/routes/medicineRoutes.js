const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");

router.get("/", medicineController.getAllMedicines);
router.post("/add", medicineController.addMedicine);
router.delete("/:id", medicineController.deleteMedicine);

module.exports = router;
