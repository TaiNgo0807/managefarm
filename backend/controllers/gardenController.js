const db = require("../database/db");

// Lấy danh sách vườn kèm trạng thái nhắc lịch
exports.getDashboard = async (req, res) => {
  try {
    const query = `
            SELECT g.id, g.owner_name, g.plant_type, a.action_date, m.cycle_days,
            DATEDIFF(CURDATE(), a.action_date) AS days_passed,
            (m.cycle_days - DATEDIFF(CURDATE(), a.action_date)) AS days_left
            FROM gardens g
            LEFT JOIN activities a ON g.id = a.garden_id
            LEFT JOIN medicines m ON a.medicine_id = m.id
        `;
    const [rows] = await db.execute(query);

    // Phân loại trạng thái (Logic chính ông cần)
    const result = rows.map((row) => {
      let status = "🟢 Bình thường";
      if (row.days_left < 0) status = "🔴 Quá hạn";
      else if (row.days_left <= 2) status = "🟡 Sắp tới hạn"; // Sắp tới hạn trong 2 ngày

      return { ...row, status };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm vườn mới (có Validation ID)
exports.addGarden = async (req, res) => {
  const { id, owner_name, plant_type, plant_year } = req.body;
  if (!id || !owner_name)
    return res.status(400).json({ message: "Thiếu thông tin!" });

  try {
    const [existing] = await db.execute("SELECT id FROM gardens WHERE id = ?", [
      id,
    ]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Trùng ID vườn rùi bro!" });

    await db.execute(
      "INSERT INTO gardens (id, owner_name, plant_type, plant_year) VALUES (?, ?, ?, ?)",
      [id, owner_name, plant_type, plant_year],
    );
    res.json({ success: true, message: "Thêm vườn ngon lành!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
