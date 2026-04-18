const db = require("../database/db");

// Lấy danh sách thuốc
exports.getAllMedicines = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM medicines");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm thuốc mới (Có check trùng tên)
exports.addMedicine = async (req, res) => {
  const { name, cycle_days } = req.body;
  if (!name || !cycle_days)
    return res
      .status(400)
      .json({ message: "Nhập đủ tên thuốc và chu kỳ nha!" });

  try {
    const [existing] = await db.execute(
      "SELECT id FROM medicines WHERE name = ?",
      [name],
    );
    if (existing.length > 0)
      return res
        .status(400)
        .json({ message: "Thuốc này có trong kho rồi ông ơi!" });

    await db.execute("INSERT INTO medicines (name, cycle_days) VALUES (?, ?)", [
      name,
      cycle_days,
    ]);
    res.json({ success: true, message: "Thêm thuốc ngon lành!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteMedicine = async (req, res) => {
  const { id } = req.params;
  try {
    // Xóa hoạt động liên quan đến thuốc này trước
    await db.execute("DELETE FROM activities WHERE medicine_id = ?", [id]);
    await db.execute("DELETE FROM medicines WHERE id = ?", [id]);
    res.json({ success: true, message: "Thuốc đã bị xóa khỏi kho!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
