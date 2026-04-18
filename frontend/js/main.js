const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api"
    : "/api";
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show");
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const toggleBtn = document.querySelector(".menu-toggle");

  if (
    menu.classList.contains("show") &&
    !menu.contains(e.target) &&
    !toggleBtn.contains(e.target)
  ) {
    menu.classList.remove("show");
  }
});

// --- ĐIỀU HƯỚNG SPA ---
function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  if (tabId === "dashboard") loadDashboard();

  if (tabId === "add-activity") {
    loadMedicines();
    loadGardensForList();
  }
  if (tabId === "add-garden") loadGardensForManage();
  if (tabId === "add-medicine") loadMedicinesForManage();
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
        let statusClass = "status-none"; // Class CSS mới màu xám

        if (g.days_left !== null && g.days_left !== undefined) {
          statusClass = "status-normal"; // Đổi thành màu xanh nếu đã có thuốc
          if (g.days_left < 0) statusClass = "status-danger";
          else if (g.days_left <= 2) statusClass = "status-warning";
        }

        const dateStr = g.action_date
          ? new Date(g.action_date).toLocaleDateString("vi-VN")
          : "Chưa có";
        //ngày xổ nhụy:
        const pollDateStr = g.pollination_end_date
          ? new Date(g.pollination_end_date).toLocaleDateString("vi-VN")
          : "---";

        tbody.innerHTML += `
            <tr onclick="showGardenDetails('${g.id}')" title="Nhấn để xem lịch sử chăm sóc">
                <td>${g.id}</td>
                <td>${g.owner_name}</td>
                <td>${g.plant_type}</td>
                <td><strong>${pollDateStr}</strong></td> <td>${dateStr}</td>
                <td><strong class="${statusClass}">${g.status}</strong></td>
            </tr>
        `;
        // Check để pop up
        if (g.status === "🔴 Quá hạn" || g.status === "🟡 Sắp tới hạn") {
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
    // Thêm dòng này để lấy giá trị ngày:
    pollination_end_date:
      document.getElementById("g-pollination").value || null,
  };
  // ... phần fetch giữ nguyên ...

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
  if (result.success) {
    document.getElementById("form-medicine").reset();
    loadMedicines(); // Load lại ngay và luôn
  }
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
// --- XỬ LÝ CLICK CHỌN VƯỜN & THUỐC ---
function selectGarden(id, name) {
  document.getElementById("a-garden-id").value = id;
  document.getElementById("display-garden").innerText = `${id} - ${name}`;

  // Đổi màu để nhận diện mục đang chọn
  document
    .querySelectorAll("#list-gardens li")
    .forEach((li) => li.classList.remove("selected"));
  document.getElementById(`li-garden-${id}`).classList.add("selected");
}

function selectMedicine(id, name) {
  document.getElementById("a-medicine-id").value = id;
  document.getElementById("display-medicine").innerText = name;

  document
    .querySelectorAll("#list-medicines li")
    .forEach((li) => li.classList.remove("selected"));
  document.getElementById(`li-med-${id}`).classList.add("selected");
}

// Bón phân/Tưới nước thì không cần thuốc
function clearMedicine() {
  document.getElementById("a-medicine-id").value = "";
  document.getElementById("display-medicine").innerText =
    "Chưa chọn (Không bắt buộc)";
  document
    .querySelectorAll("#list-medicines li")
    .forEach((li) => li.classList.remove("selected"));
}

// --- LOAD DANH SÁCH VÀO GIAO DIỆN CHỌN ---
async function loadGardensForList() {
  try {
    const res = await fetch(`${API_URL}/gardens`);
    const result = await res.json();
    const listGarden = document.getElementById("list-gardens");
    listGarden.innerHTML = "";

    if (result.success) {
      result.data.forEach((g) => {
        listGarden.innerHTML += `<li id="li-garden-${g.id}" onclick="selectGarden('${g.id}', '${g.owner_name}')"> ${g.id} - ${g.owner_name}</li>`;
      });
    }
  } catch (error) {
    console.error("Lỗi tải list vườn:", error);
  }
}

async function loadMedicines() {
  try {
    const res = await fetch(`${API_URL}/medicines`);
    const result = await res.json();
    const listMedicine = document.getElementById("list-medicines");
    listMedicine.innerHTML = "";

    if (result.success) {
      result.data.forEach((med) => {
        listMedicine.innerHTML += `<li id="li-med-${med.id}" onclick="selectMedicine('${med.id}', '${med.name}')"> ${med.name} (${med.cycle_days} ngày)</li>`;
      });
    }
  } catch (error) {
    console.error("Lỗi tải list thuốc:", error);
  }
}

// --- SUBMIT GHI SỔ TAY ---
async function submitActivity(e) {
  e.preventDefault();

  const gardenId = document.getElementById("a-garden-id").value;
  if (!gardenId) {
    alert("Khoan! Ông chưa click chọn Vườn nào bên danh sách kìa!");
    return;
  }

  const data = {
    garden_id: gardenId,
    activity_type: document.getElementById("a-type").value,
    action_date: document.getElementById("a-date").value,
    medicine_id: document.getElementById("a-medicine-id").value || null,
  };

  const res = await fetch(`${API_URL}/activities/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  alert(result.message);

  if (result.success) {
    // Reset sạch sẽ form sau khi thêm
    document.getElementById("form-activity").reset();
    document.getElementById("a-garden-id").value = "";
    document.getElementById("display-garden").innerText = "Chưa chọn";
    clearMedicine();
    document
      .querySelectorAll(".selectable-list li")
      .forEach((li) => li.classList.remove("selected"));
    window.hasAlerted = false;
  }
}
// --- XÓA VƯỜN ---
async function deleteGarden(id) {
  if (
    !confirm(
      `Ông chắc chắn muốn xóa vườn ${id} chứ? Mọi lịch sử sẽ mất hết đấy!`,
    )
  )
    return;
  const res = await fetch(`${API_URL}/gardens/${id}`, { method: "DELETE" });
  const result = await res.json();
  alert(result.message);
  loadGardensForManage(); // Load lại list
}

// --- XÓA THUỐC ---
async function deleteMedicine(id) {
  if (
    !confirm(`Xóa thuốc này là mất hết lịch sử xịt thuốc liên quan, ok không?`)
  )
    return;
  const res = await fetch(`${API_URL}/medicines/${id}`, { method: "DELETE" });
  const result = await res.json();
  alert(result.message);
  loadMedicinesForManage(); // Load lại list
}

// --- LOAD DANH SÁCH ĐỂ QUẢN LÝ ---
async function loadGardensForManage() {
  const res = await fetch(`${API_URL}/gardens`);
  const result = await res.json();
  const tbody = document.querySelector("#manage-garden-table tbody");
  tbody.innerHTML = result.data
    .map(
      (g) => `
        <tr>
            <td>${g.id}</td>
            <td>${g.owner_name}</td>
            <td><button onclick="deleteGarden('${g.id}')" class="btn-clear">Xóa</button></td>
        </tr>
    `,
    )
    .join("");
}

async function loadMedicinesForManage() {
  const res = await fetch(`${API_URL}/medicines`);
  const result = await res.json();
  const tbody = document.querySelector("#manage-medicine-table tbody");
  tbody.innerHTML = result.data
    .map(
      (m) => `
        <tr>
            <td>${m.name}</td>
            <td>${m.cycle_days} ngày</td>
            <td><button onclick="deleteMedicine(${m.id})" class="btn-clear">Xóa</button></td>
        </tr>
    `,
    )
    .join("");
}
