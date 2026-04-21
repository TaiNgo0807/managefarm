const db = require("../database/db");

// Ghi nhận hoạt động chăm sóc mới
exports.addActivity = async (req, res) => {
  // Đã bỏ activity_type
  const { garden_id, action_date, medicine_ids } = req.body;

  if (!garden_id || !action_date) {
    return res
      .status(400)
      .json({ message: "Điền thiếu ngày hoặc vườn kìa ba!" });
  }

  try {
    if (medicine_ids && medicine_ids.length > 0) {
      for (let med_id of medicine_ids) {
        // Sửa lại câu lệnh INSERT, xóa activity_type đi
        await db.execute(
          "INSERT INTO activities (garden_id, action_date, medicine_id) VALUES (?, ?, ?)",
          [garden_id, action_date, med_id],
        );
      }
    } else {
      // Sửa lại câu lệnh INSERT khi không có thuốc
      await db.execute(
        "INSERT INTO activities (garden_id, action_date, medicine_id) VALUES (?, ?, NULL)",
        [garden_id, action_date],
      );
    }
    res.json({ success: true, message: "Đã ghi sổ ngon lành!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Lấy lịch sử dùng thuốc của 1 vườn cụ thể
exports.getHistoryByGarden = async (req, res) => {
    const { garden_id } = req.params;
    try {
        const query = `
            SELECT a.id, m.name AS medicine_name, a.action_date,
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
