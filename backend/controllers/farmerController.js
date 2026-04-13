const db = require("../database/db");
const { v4: uuidv4 } = require("uuid");

exports.getAllFarmers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Farmer");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFarmer = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const id = uuidv4();
    await db.query("INSERT INTO Farmer (id, name, phone) VALUES (?, ?, ?)", [
      id,
      name,
      phone,
    ]);
    res.status(201).json({ message: "Thêm nông dân thành công!", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
