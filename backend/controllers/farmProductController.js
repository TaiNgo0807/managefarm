const db = require("../database/db");
const { v4: uuidv4 } = require("uuid");

// Lấy danh sách nhắc nhở phun thuốc (Logic tính ngày)
exports.getReminders = async (req, res) => {
  try {
    const query = `
            SELECT fp.id, f.name AS farmerName, p.name AS productName, 
                   fp.usageDate, p.dayRe,
                   DATE_ADD(fp.usageDate, INTERVAL p.dayRe DAY) AS nextSprayDate
            FROM FarmProduct fp
            JOIN Farmer f ON fp.farmerId = f.id
            JOIN Product p ON fp.productId = p.id
            -- Nhắc trước 2 ngày hoặc đã quá hạn
            WHERE DATE_ADD(fp.usageDate, INTERVAL p.dayRe DAY) <= DATE_ADD(NOW(), INTERVAL 2 DAY)
            ORDER BY nextSprayDate ASC;
        `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFarmProduct = async (req, res) => {
  try {
    const { farmerId, productId, usageDate, quantity, note } = req.body;
    const id = uuidv4();
    await db.query(
      "INSERT INTO FarmProduct (id, farmerId, productId, usageDate, quantity, note) VALUES (?, ?, ?, ?, ?, ?)",
      [id, farmerId, productId, usageDate, quantity, note],
    );
    res.status(201).json({ message: "Đã ghi nhận phun thuốc!", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
