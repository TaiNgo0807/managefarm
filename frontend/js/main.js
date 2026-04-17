const API_URL = "http://localhost:8080/api";

// --- ĐIỀU HƯỚNG SPA ---
function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  if (tabId === "dashboard") loadDashboard();
}

// --- CALL API & RENDER ---

// 1. Load Dashboard & Popup nhắc việc
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/gardens/dashboard`);
    const result = await res.json();

    const tbody = document.querySelector("#garden-table tbody");
    tbody.innerHTML = "";
    let alerts = [];

    if (result.success) {
      result.data.forEach((g) => {
        // Đổ data vào bảng
        let statusClass = "status-normal";
        if (g.days_left < 0) statusClass = "status-danger";
        else if (g.days_left <= 2) statusClass = "status-warning";
        const dateStr = g.action_date
          ? new Date(g.action_date).toLocaleDateString("vi-VN")
          : "Chưa có";
        tbody.innerHTML += `
                    <tr onclick="showGardenDetails('${g.id}')" title="Nhấn để xem lịch sử chăm sóc">
                        <td>${g.id}</td>
                        <td>${g.owner_name}</td>
                        <td>${g.plant_type}</td>
                        <td>${dateStr}</td>
                        <td><strong class="${statusClass}">${g.status}</strong></td>
                    </tr>
                `;
        // Check để pop up
        if (g.status !== "🟢 Bình thường") {
          alerts.push(`- Vườn ${g.id}: ${g.status}`);
        }
      });

      // Hiện Popup nếu có cảnh báo ngay lần đầu load
      if (alerts.length > 0 && !window.hasAlerted) {
        alert("🚨 CẢNH BÁO CHĂM SÓC:\n" + alerts.join("\n"));
        window.hasAlerted = true; // Chỉ báo 1 lần khi mở app
      }
    }
  } catch (error) {
    console.error("Lỗi lấy data:", error);
  }
}

// 2. Thêm Vườn
async function submitGarden(e) {
  e.preventDefault();
  const data = {
    id: document.getElementById("g-id").value,
    owner_name: document.getElementById("g-owner").value,
    plant_type: document.getElementById("g-plant").value,
    plant_year: document.getElementById("g-year").value,
  };

  const res = await fetch(`${API_URL}/gardens/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) document.getElementById("form-garden").reset();
}

// 3. Thêm Thuốc
async function submitMedicine(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById("m-name").value,
    cycle_days: document.getElementById("m-cycle").value,
  };

  const res = await fetch(`${API_URL}/medicines/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) document.getElementById("form-medicine").reset();
}

// 4. Ghi Sổ Tay (Hoạt động)
async function submitActivity(e) {
  e.preventDefault();
  const data = {
    garden_id: document.getElementById("a-garden").value,
    activity_type: document.getElementById("a-type").value,
    action_date: document.getElementById("a-date").value,
    medicine_id: document.getElementById("a-medicine").value || null,
  };

  const res = await fetch(`${API_URL}/activities/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  alert(result.message);
  if (result.success) {
    document.getElementById("form-activity").reset();
    window.hasAlerted = false; // Reset lại trạng thái cảnh báo để check lại khi quay về Dashboard
  }
}

// Chạy loadDashboard ngay khi mở trang
document.addEventListener("DOMContentLoaded", loadDashboard);
// --- XỬ LÝ MODAL CHI TIẾT VƯỜN ---

// Đóng modal
function closeModal() {
  const modal = document.getElementById("garden-modal");
  modal.classList.remove("show");
  // Đợi hiệu ứng mờ xong rồi mới display none
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Bấm ra ngoài vùng trắng (vào vùng tối) thì cũng đóng modal
document.getElementById("garden-modal").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

// Gọi API lấy lịch sử và hiện modal
async function showGardenDetails(gardenId) {
  try {
    const res = await fetch(`${API_URL}/activities/garden/${gardenId}`);
    const result = await res.json();

    document.getElementById("modal-title").innerText =
      `Lịch sử chăm sóc: Vườn ${gardenId}`;
    const tbody = document.getElementById("history-body");
    tbody.innerHTML = "";

    if (result.success) {
      if (result.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Chưa có lịch sử dùng thuốc nào!</td></tr>`;
      } else {
        result.data.forEach((item) => {
          const dateStr = new Date(item.action_date).toLocaleDateString(
            "vi-VN",
          );
          tbody.innerHTML += `
                        <tr>
                            <td><strong>${item.medicine_name}</strong></td>
                            <td>${dateStr}</td>
                            <td><span style="color: #ea580c; font-weight: bold;">${item.days_passed} ngày</span></td>
                        </tr>
                    `;
        });
      }
    }

    // Hiện modal lên
    const modal = document.getElementById("garden-modal");
    modal.style.display = "flex";
    // Delay xíu để CSS transition chạy mượt
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    alert("Lấy dữ liệu thất bại!");
  }
}
