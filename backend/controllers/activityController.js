const db = require("../database/db");

// Ghi nhận hoạt động chăm sóc mới
exports.addActivity = async (req, res) => {
  // medicine_id có thể null nếu chỉ bón phân/tưới gốc bình thường
  const { garden_id, medicine_id, activity_type, action_date } = req.body;

  if (!garden_id || !activity_type || !action_date) {
    return res.status(400).json({ message: "Điền thiếu thông tin rùi kìa!" });
  }

  try {
    await db.execute(
      "INSERT INTO activities (garden_id, medicine_id, activity_type, action_date) VALUES (?, ?, ?, ?)",
      [garden_id, medicine_id || null, activity_type, action_date],
    );
    res.json({ success: true, message: "Đã chốt đơn vào sổ tay!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Lấy lịch sử dùng thuốc của 1 vườn cụ thể
exports.getHistoryByGarden = async (req, res) => {
  const { garden_id } = req.params;
  try {
    const query = `
            SELECT a.id, a.activity_type, m.name AS medicine_name, a.action_date,
            DATEDIFF(CURDATE(), a.action_date) AS days_passed
            FROM activities a
            LEFT JOIN medicines m ON a.medicine_id = m.id
            WHERE a.garden_id = ?
            ORDER BY a.action_date DESC
        `;
    const [rows] = await db.execute(query, [garden_id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Xóa một lịch sử hoạt động
exports.deleteActivity = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM activities WHERE id = ?", [id]);
    res.json({ success: true, message: "Đã xóa lịch sử này!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
