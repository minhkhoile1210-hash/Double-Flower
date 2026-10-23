// Douple Flower Shop - Quản trị viên (Admin Portal Logic)
const AdminApp = {
  activeTab: "overview",
  currentOrderFilter: "all",
  currentSearchQuery: "",
  currentProductFilter: "all",
  currentProductSearch: "",
  orders: [],
  customRequests: [],
  products: [],
  settings: {},

  init() {
    this.checkAuth();
    this.loadData();
    this.renderStats();
    this.renderRevenueChart();
    this.renderOrdersTable();
    this.renderCustomRequestsTable();
    this.renderProductsTable();
    this.populateCategorySuggestions();
    this.loadSettingsForm();
    this.bindEvents();
  },

  // ================= 1. XÁC THỰC ADMIN =================
  checkAuth() {
    const isLoggedIn = sessionStorage.getItem("douple_admin_auth") === "true";
    const loginWrapper = document.getElementById("adminLoginWrapper");
    const adminLayout = document.getElementById("adminAppLayout");

    if (isLoggedIn) {
      if (loginWrapper) loginWrapper.style.display = "none";
      if (adminLayout) adminLayout.style.display = "flex";
    } else {
      if (loginWrapper) loginWrapper.style.display = "flex";
      if (adminLayout) adminLayout.style.display = "none";
    }
  },

  togglePassVisibility() {
    const input = document.getElementById("adminPasswordInput");
    const icon = document.getElementById("adminPassEyeIcon");
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      }
    }
  },

  login(password) {
    const validPass = localStorage.getItem("douple_admin_pass") || "douple2026";
    if (password === validPass) {
      sessionStorage.setItem("douple_admin_auth", "true");
      this.checkAuth();
      this.showToast("Đăng nhập trang quản trị thành công!", "success");
      this.loadData();
      this.renderStats();
      this.renderRevenueChart();
      this.renderOrdersTable();
    } else {
      this.showToast("Mật khẩu không chính xác! Vui lòng kiểm tra lại", "error");
    }
  },

  logout() {
    sessionStorage.removeItem("douple_admin_auth");
    this.checkAuth();
    this.showToast("Đã đăng xuất trang quản trị", "info");
  },

  // ================= 2. QUẢN LÝ DỮ LIỆU =================
  loadData() {
    // 1. Tải đơn hàng
    try {
      const storedOrders = JSON.parse(localStorage.getItem("douple_orders") || "[]");
      if (storedOrders.length === 0) {
        // Dữ liệu mẫu ban đầu để admin xem ngay
        this.orders = [
          {
            orderId: "DF839102",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            shipping: {
              receiverName: "Nguyễn Thùy Linh",
              receiverPhone: "0987654321",
              city: "Hà Nội",
              district: "Cầu Giấy",
              address: "Số 18 Duy Tân",
              greetingCard: "Chúc mừng sinh nhật em gái yêu quý! Chúc em luôn rạng rỡ và hạnh phúc.",
              deliveryTime: "standard",
              note: "Giao trong giờ hành chính"
            },
            items: [
              { id: "df-01", name: "Bó Hoa Ly Kẽm Nhung Hồng Pastel", price: 380000, quantity: 1, image: "assets/bo_hoa_ly_hong.jpg" }
            ],
            subtotal: 380000,
            shippingFee: 30000,
            total: 410000,
            paymentMethod: "cod_deposit",
            paymentNote: "COD nhận hàng (Đã cọc 50% chuyển khoản)",
            depositAmount: 205000,
            remainAmount: 205000,
            status: "Đã cọc 50% (Đang làm hoa)"
          },
          {
            orderId: "DF942150",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            shipping: {
              receiverName: "Trần Anh Quân",
              receiverPhone: "0912345678",
              city: "Hà Nội",
              district: "Ba Đình",
              address: "Tòa Lancaster, 20 Núi Trúc",
              greetingCard: "Happy Graduation! Chúc mừng tân cử nhân xuất sắc.",
              deliveryTime: "fast",
              note: "Cần hoa trước 11h trưa chụp kỷ yếu"
            },
            items: [
              { id: "df-05", name: "Bó Hoa Hướng Dương Kẽm Nhung Rực Rỡ (Tốt Nghiệp)", price: 420000, quantity: 1, image: "assets/bo_huong_duong.jpg" }
            ],
            subtotal: 420000,
            shippingFee: 30000,
            total: 450000,
            paymentMethod: "vietqr",
            paymentNote: "Chuyển khoản VietQR (100%)",
            depositAmount: 450000,
            remainAmount: 0,
            status: "Đang giao hàng"
          },
          {
            orderId: "DF671932",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            shipping: {
              receiverName: "Lê Minh Khôi",
              receiverPhone: "0393613156",
              city: "TP. Hồ Chí Minh",
              district: "Quận 1",
              address: "45 Lê Thánh Tôn",
              greetingCard: "Kỷ niệm 3 năm ngày yêu nhau ♡",
              deliveryTime: "standard",
              note: ""
            },
            items: [
              { id: "df-03", name: "Hộp Trụ Hoa Ly Kẽm Nhung Kim Tuyến Kèm Đèn LED", price: 520000, quantity: 1, image: "assets/hop_hoa_kim_tuyen.jpg" }
            ],
            subtotal: 520000,
            shippingFee: 0,
            total: 520000,
            paymentMethod: "applepay",
            paymentNote: "Apple Pay (100%)",
            depositAmount: 520000,
            remainAmount: 0,
            status: "Đã hoàn thành"
          }
        ];
        localStorage.setItem("douple_orders", JSON.stringify(this.orders));
      } else {
        this.orders = storedOrders;
      }
    } catch (e) {
      this.orders = [];
    }

    // 2. Tải yêu cầu làm theo mẫu
    try {
      this.customRequests = JSON.parse(localStorage.getItem("douple_custom_requests") || "[]");
      if (this.customRequests.length === 0) {
        this.customRequests = [
          {
            id: "REQ182930",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            customerName: "Hoàng Thảo My",
            customerPhone: "0971234888",
            flowerType: "Hoa Ly Kẽm Nhung",
            colorTheme: "Hồng Pastel",
            packaging: "Hộp Trụ Vintage Có Quai Xách",
            accessories: ["Dây Đèn LED Đom Đóm Phát Sáng", "Thiệp Hoa Khô Viết Tay Theo Yêu Cầu"],
            budget: "Từ 400.000đ - 650.000đ",
            occasion: "Sinh nhật bạn thân",
            notes: "Mình muốn phối thêm vài bông hoa cúc baby trắng và nơ ren vintage màu kem ạ",
            deliveryDate: "2026-10-18",
            status: "Chờ thợ hoa báo giá"
          }
        ];
        localStorage.setItem("douple_custom_requests", JSON.stringify(this.customRequests));
      }
    } catch (e) {
      this.customRequests = [];
    }

    // 3. Tải danh mục sản phẩm
    try {
      const storedProducts = JSON.parse(localStorage.getItem("douple_products") || "[]");
      if (storedProducts.length === 0) {
        this.products = (typeof getActiveProducts === "function") ? [...getActiveProducts()] : [...PRODUCTS_DATA];
        localStorage.setItem("douple_products", JSON.stringify(this.products));
      } else {
        this.products = storedProducts.map((p, idx) => ({
          ...p,
          sku: p.sku || ("DF-" + (p.category ? p.category.substring(0, 3).toUpperCase() : "SP") + "-" + (idx + 1).toString().padStart(2, "0")),
          stockQuantity: (p.stockQuantity !== undefined && p.stockQuantity !== null) ? parseInt(p.stockQuantity) : 20,
          inStock: (p.stockQuantity !== undefined && parseInt(p.stockQuantity) <= 0) ? false : (p.inStock !== false)
        }));
        localStorage.setItem("douple_products", JSON.stringify(this.products));
      }
    } catch (e) {
      this.products = [];
    }

    // 4. Tải cài đặt
    try {
      this.settings = JSON.parse(localStorage.getItem("douple_settings") || JSON.stringify(typeof STORE_INFO !== "undefined" ? STORE_INFO : {}));
    } catch (e) {
      this.settings = {};
    }
  },

  // ================= 3. THỐNG KÊ & KPI =================
  renderStats() {
    const totalRevEl = document.getElementById("statTotalRevenue");
    const totalOrdersEl = document.getElementById("statTotalOrders");
    const depositOrdersEl = document.getElementById("statDepositOrders");
    const customReqsEl = document.getElementById("statCustomRequests");
    const ordersBadgeEl = document.getElementById("navOrdersBadge");
    const reqsBadgeEl = document.getElementById("navReqsBadge");

    const totalRev = this.orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const depositCount = this.orders.filter(ord => (ord.status || "").includes("cọc") || (ord.paymentMethod === "cod_deposit")).length;

    if (totalRevEl) totalRevEl.textContent = this.formatCurrency(totalRev);
    if (totalOrdersEl) totalOrdersEl.textContent = this.orders.length;
    if (depositOrdersEl) depositOrdersEl.textContent = depositCount;
    if (customReqsEl) customReqsEl.textContent = this.customRequests.length;

    if (ordersBadgeEl) ordersBadgeEl.textContent = this.orders.length;
    if (reqsBadgeEl) reqsBadgeEl.textContent = this.customRequests.length;
  },

  renderRevenueChart() {
    const container = document.getElementById("revenueChartBox");
    if (!container) return;

    // Tạo biểu đồ thanh doanh thu 7 ngày bằng SVG
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const revenues = [410000, 780000, 450000, 920000, 1150000, 1420000, 890000];
    const maxRev = Math.max(...revenues);

    container.innerHTML = `
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding: 20px 10px 0; gap: 14px;">
        ${revenues.map((val, idx) => {
          const heightPercent = Math.round((val / maxRev) * 100);
          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; gap: 8px;">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary);">${Math.round(val/1000)}k</span>
              <div style="width: 100%; max-width: 38px; height: ${heightPercent}%; background: linear-gradient(180deg, #D96B7D 0%, #1E3A2F 100%); border-radius: 6px 6px 2px 2px; transition: height 0.5s ease;"></div>
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--admin-text-muted);">${days[idx]}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  // ================= 4. BẢNG ĐƠN HÀNG =================
  renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    let filtered = [...this.orders];

    if (this.currentOrderFilter !== "all") {
      filtered = filtered.filter(ord => {
        const status = (ord.status || "").toLowerCase();
        if (this.currentOrderFilter === "deposit") return status.includes("cọc");
        if (this.currentOrderFilter === "making") return status.includes("làm") || status.includes("chuẩn bị");
        if (this.currentOrderFilter === "shipping") return status.includes("giao");
        if (this.currentOrderFilter === "completed") return status.includes("thành") || status.includes("hoàn tất");
        return true;
      });
    }

    if (this.currentSearchQuery) {
      const q = this.currentSearchQuery.toLowerCase();
      filtered = filtered.filter(ord => 
        (ord.orderId || "").toLowerCase().includes(q) ||
        (ord.shipping?.receiverName || "").toLowerCase().includes(q) ||
        (ord.shipping?.receiverPhone || "").toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
            <i class="bi bi-inbox" style="font-size: 2.2rem; display: block; margin-bottom: 8px;"></i>
            Không tìm thấy đơn hàng nào phù hợp
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(ord => {
      const badgeClass = this.getStatusBadgeClass(ord.status);
      const isDeposit = ord.paymentMethod === "cod_deposit";

      return `
        <tr>
          <td>
            <strong style="font-family: monospace; color: var(--color-primary); font-size: 0.95rem;">${ord.orderId}</strong>
            <div style="font-size: 0.75rem; color: var(--admin-text-light);">${new Date(ord.createdAt).toLocaleDateString("vi-VN")}</div>
          </td>
          <td>
            <strong>${ord.shipping?.receiverName || "Khách hàng"}</strong>
            <div style="font-size: 0.8rem; color: var(--admin-text-muted);">
              <a href="tel:${ord.shipping?.receiverPhone}" style="color: var(--color-primary);"><i class="bi bi-telephone"></i> ${ord.shipping?.receiverPhone}</a>
            </div>
          </td>
          <td>
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ord.items?.map(i => i.name).join(", ")}">
              ${ord.items?.map(i => `${i.name} (x${i.quantity})`).join(", ") || "Hoa kẽm nhung"}
            </div>
          </td>
          <td>
            <strong style="color: var(--color-danger);">${this.formatCurrency(ord.total)}</strong>
            ${isDeposit ? `
              <div style="font-size: 0.75rem; color: var(--color-warning);">
                Cọc 50%: ${this.formatCurrency(ord.depositAmount)}
              </div>
            ` : ""}
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 500;">
              ${ord.paymentMethod === 'vietqr' ? '<i class="bi bi-qr-code"></i> VietQR' : ord.paymentMethod === 'applepay' ? '<i class="bi bi-apple"></i> Apple Pay' : '<i class="bi bi-cash-stack"></i> COD cọc 50%'}
            </span>
          </td>
          <td>
            <span class="admin-badge ${badgeClass}">${ord.status}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-table-action" onclick="AdminApp.viewOrderDetail('${ord.orderId}')" title="Xem chi tiết đơn">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn-table-action" onclick="AdminApp.printInvoice('${ord.orderId}')" title="In hoá đơn">
                <i class="bi bi-printer"></i>
              </button>
              <button class="btn-table-action" onclick="AdminApp.openStatusModal('${ord.orderId}')" title="Cập nhật trạng thái">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn-table-action danger" onclick="AdminApp.deleteOrder('${ord.orderId}')" title="Xoá đơn">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  getStatusBadgeClass(status) {
    status = (status || "").toLowerCase();
    if (status.includes("cọc")) return "badge-deposit";
    if (status.includes("làm") || status.includes("chuẩn bị")) return "badge-making";
    if (status.includes("giao")) return "badge-shipping";
    if (status.includes("thành") || status.includes("hoàn tất")) return "badge-completed";
    if (status.includes("hủy")) return "badge-cancelled";
    return "badge-pending";
  },

  viewOrderDetail(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById("orderDetailModal");
    const body = document.getElementById("orderDetailModalBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border); padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--color-primary);">Mã đơn: <span style="font-family: monospace;">${order.orderId}</span></h3>
            <span style="font-size: 0.85rem; color: var(--admin-text-muted);">Thời gian: ${new Date(order.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <span class="admin-badge ${this.getStatusBadgeClass(order.status)}" style="font-size: 0.9rem; padding: 6px 14px;">
            ${order.status}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #F9FAFB; padding: 14px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--color-primary);"><i class="bi bi-person-fill"></i> Người nhận:</strong>
            <div>Họ tên: <strong>${order.shipping?.receiverName}</strong></div>
            <div>SĐT: <strong>${order.shipping?.receiverPhone}</strong></div>
            <div>Địa chỉ: ${order.shipping?.address}, ${order.shipping?.district}, ${order.shipping?.city}</div>
            <div style="margin-top: 10px; display: flex; gap: 8px;">
              <a href="tel:${order.shipping?.receiverPhone}" class="admin-btn admin-btn-sm admin-btn-outline"><i class="bi bi-telephone-fill"></i> Gọi điện</a>
              <a href="https://zalo.me/${order.shipping?.receiverPhone}" target="_blank" class="admin-btn admin-btn-sm admin-btn-outline"><i class="bi bi-chat-dots-fill"></i> Chat Zalo</a>
            </div>
          </div>

          <div style="background: #F9FAFB; padding: 14px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px; color: var(--color-primary);"><i class="bi bi-credit-card-2-front-fill"></i> Thanh toán & Giao nhận:</strong>
            <div>Hình thức: <strong>${order.paymentNote}</strong></div>
            <div>Hẹn giao: <strong>${order.shipping?.deliveryTime === 'fast' ? 'Giao hỏa tốc trong ngày' : 'Giao tiêu chuẩn (1-2 ngày)'}</strong></div>
            ${order.depositAmount ? `<div>Tiền cọc 50%: <strong style="color: var(--color-primary);">${this.formatCurrency(order.depositAmount)}</strong></div>` : ""}
            ${order.remainAmount ? `<div style="color: var(--color-warning); font-weight: 700;">Shipper cần thu: ${this.formatCurrency(order.remainAmount)}</div>` : ""}
          </div>
        </div>

        ${order.shipping?.greetingCard ? `
          <div style="background: var(--color-rose-soft); padding: 12px 16px; border-radius: 8px; border-left: 4px solid var(--color-rose);">
            <strong style="color: var(--color-rose);"><i class="bi bi-envelope-heart-fill"></i> Lời chúc ghi thiệp đính kèm:</strong>
            <p style="font-style: italic; margin-top: 4px; font-size: 0.92rem;">"${order.shipping.greetingCard}"</p>
          </div>
        ` : ""}

        <div>
          <h4 style="font-size: 1rem; margin-bottom: 10px;">Sản phẩm trong đơn:</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${order.items?.map(it => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${it.image}" alt="${it.name}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;">
                  <div>
                    <strong>${it.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--admin-text-muted);">Đơn giá: ${this.formatCurrency(it.price)} · Số lượng: x${it.quantity}</div>
                  </div>
                </div>
                <strong style="color: var(--color-danger);">${this.formatCurrency(it.price * it.quantity)}</strong>
              </div>
            `).join("")}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--admin-border); padding-top: 16px;">
          <div style="font-size: 1.15rem; font-weight: 800;">Tổng thanh toán: <span style="color: var(--color-danger);">${this.formatCurrency(order.total)}</span></div>
          <div style="display: flex; gap: 10px;">
            <button class="admin-btn admin-btn-outline" onclick="AdminApp.printInvoice('${order.orderId}')"><i class="bi bi-printer"></i> In Hóa Đơn</button>
            <button class="admin-btn admin-btn-primary" onclick="AdminApp.openStatusModal('${order.orderId}')"><i class="bi bi-arrow-repeat"></i> Đổi trạng thái</button>
          </div>
        </div>
      </div>
    `;

    this.openModal("orderDetailModal");
  },

  openStatusModal(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    this.currentEditingOrderId = orderId;
    const modal = document.getElementById("changeStatusModal");
    const select = document.getElementById("orderStatusSelect");
    if (!modal || !select) return;

    select.value = order.status;
    this.openModal("changeStatusModal");
  },

  saveOrderStatus() {
    const select = document.getElementById("orderStatusSelect");
    if (!select || !this.currentEditingOrderId) return;

    const newStatus = select.value;
    const orderIndex = this.orders.findIndex(o => o.orderId === this.currentEditingOrderId);
    if (orderIndex > -1) {
      this.orders[orderIndex].status = newStatus;
      localStorage.setItem("douple_orders", JSON.stringify(this.orders));
      this.renderOrdersTable();
      this.renderStats();
      this.closeModal("changeStatusModal");
      this.closeModal("orderDetailModal");
      this.showToast(`Đã chuyển đơn ${this.currentEditingOrderId} sang "${newStatus}"`, "success");
    }
  },

  deleteOrder(orderId) {
    if (!confirm(`Bạn có chắc chắn muốn xoá đơn hàng ${orderId}?`)) return;
    this.orders = this.orders.filter(o => o.orderId !== orderId);
    localStorage.setItem("douple_orders", JSON.stringify(this.orders));
    this.renderOrdersTable();
    this.renderStats();
    this.showToast(`Đã xoá đơn hàng ${orderId}`, "info");
  },

  printInvoice(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const printBox = document.getElementById("printableInvoice");
    if (!printBox) return;

    printBox.innerHTML = `
      <div class="invoice-box">
        <div class="invoice-header">
          <div class="invoice-logo-group">
            <img src="assets/logo.png" alt="Douple Flower" class="invoice-logo">
            <div>
              <h2 style="font-family: var(--font-serif); color: var(--color-primary); font-size: 1.4rem;">DOUPLE FLOWER SHOP</h2>
              <small style="color: var(--color-rose); text-transform: uppercase; font-weight: 700;">Tiệm Hoa Handmade Kẽm Nhung</small>
            </div>
          </div>
          <div style="text-align: right;">
            <h3 style="color: var(--color-primary); font-size: 1.2rem;">HÓA ĐƠN BÁN HÀNG</h3>
            <div>Mã đơn: <strong>${order.orderId}</strong></div>
            <div>Ngày in: ${new Date().toLocaleDateString("vi-VN")}</div>
          </div>
        </div>

        <div class="invoice-info-grid">
          <div>
            <strong>Đơn vị gửi:</strong>
            <div>DOUPLE FLOWER SHOP</div>
            <div>Hotline: 0393.613.156</div>
            <div>Facebook: Douple Flower Shop</div>
          </div>
          <div>
            <strong>Khách hàng người nhận:</strong>
            <div>Họ tên: <strong>${order.shipping?.receiverName}</strong></div>
            <div>Điện thoại: <strong>${order.shipping?.receiverPhone}</strong></div>
            <div>Địa chỉ: ${order.shipping?.address}, ${order.shipping?.district}, ${order.shipping?.city}</div>
          </div>
        </div>

        ${order.shipping?.greetingCard ? `
          <div style="background: #FFFDF9; border: 1px dashed #D96B7D; padding: 10px; margin-bottom: 16px; border-radius: 4px;">
            <strong>Lời chúc in thiệp tặng kèm:</strong>
            <p style="font-style: italic; margin: 4px 0 0;">"${order.shipping.greetingCard}"</p>
          </div>
        ` : ""}

        <table class="invoice-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm hoa</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td>${it.quantity}</td>
                <td>${this.formatCurrency(it.price)}</td>
                <td style="text-align: right;">${this.formatCurrency(it.price * it.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div style="display: flex; justify-content: space-between;">
            <span>Tạm tính:</span>
            <span>${this.formatCurrency(order.subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Phí giao hàng:</span>
            <span>${order.shippingFee === 0 ? "Miễn phí" : this.formatCurrency(order.shippingFee)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.15rem; border-top: 1px solid #000; padding-top: 6px;">
            <span>Tổng cộng:</span>
            <span style="color: var(--color-danger);">${this.formatCurrency(order.total)}</span>
          </div>
          ${order.depositAmount ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--color-primary);">
              <span>Tiền cọc trước (50%):</span>
              <span><strong>${this.formatCurrency(order.depositAmount)}</strong></span>
            </div>
          ` : ""}
          ${order.remainAmount ? `
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--color-warning);">
              <span>Cần thu shipper khi nhận (COD):</span>
              <span>${this.formatCurrency(order.remainAmount)}</span>
            </div>
          ` : ""}
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 0.85rem; color: var(--admin-text-muted); border-top: 1px dashed var(--admin-border); padding-top: 14px;">
          Cảm ơn bạn đã tin tưởng Douple Flower Shop! Hoa kẽm nhung thủ công bền vĩnh cửu theo thời gian.
        </div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 200);
  },

  // ================= 5. BẢNG YÊU CẦU LÀM THEO MẪU =================
  renderCustomRequestsTable() {
    const tbody = document.getElementById("customRequestsTableBody");
    if (!tbody) return;

    if (this.customRequests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
            Chưa có yêu cầu làm hoa riêng nào
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.customRequests.map(r => `
      <tr>
        <td>
          <strong style="font-family: monospace; color: var(--color-primary);">${r.id}</strong>
          <div style="font-size: 0.75rem; color: var(--admin-text-light);">${new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
        </td>
        <td>
          <strong>${r.customerName}</strong>
          <div style="font-size: 0.8rem; color: var(--admin-text-muted);">
            <a href="tel:${r.customerPhone}" style="color: var(--color-primary);"><i class="bi bi-telephone"></i> ${r.customerPhone}</a>
          </div>
        </td>
        <td>
          <strong>${r.flowerType}</strong> (${r.colorTheme})
          ${r.packaging ? `<div style="font-size: 0.78rem; color: var(--admin-text-muted);">Kiểu gói: ${r.packaging}</div>` : ""}
          ${r.accessories?.length ? `<div style="font-size: 0.75rem; color: var(--color-rose);">Phụ kiện: ${r.accessories.join(", ")}</div>` : ""}
        </td>
        <td>
          <strong style="color: var(--color-primary);">${r.budget}</strong>
          <div style="font-size: 0.78rem; color: var(--admin-text-muted);">Dịp: ${r.occasion || "Tự thưởng"}</div>
        </td>
        <td>
          ${r.imagePreview ? `
            <img src="${r.imagePreview}" alt="Ảnh mẫu" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; cursor: pointer; border: 1px solid var(--admin-border);" onclick="AdminApp.previewImage('${r.imagePreview}')">
          ` : `<span style="font-size: 0.75rem; color: var(--admin-text-light);">Không có ảnh</span>`}
        </td>
        <td>
          <div class="table-actions">
            <a href="https://zalo.me/${r.customerPhone}" target="_blank" class="btn-table-action" title="Nhắn tin Zalo chốt mẫu">
              <i class="bi bi-chat-dots-fill"></i>
            </a>
            <button class="btn-table-action" onclick="AdminApp.openCustomReqDetail('${r.id}')" title="Xem chi tiết">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn-table-action danger" onclick="AdminApp.deleteCustomReq('${r.id}')" title="Xoá">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  previewImage(imgSrc) {
    const modal = document.getElementById("imagePreviewModal");
    const img = document.getElementById("imagePreviewModalImg");
    if (modal && img) {
      img.src = this.resolveAssetUrl(imgSrc);
      this.openModal("imagePreviewModal");
    }
  },

  openCustomReqDetail(reqId) {
    const r = this.customRequests.find(x => x.id === reqId);
    if (!r) return;

    alert(`Chi tiết yêu cầu ${r.id}:\n- Khách hàng: ${r.customerName} (${r.customerPhone})\n- Loại hoa: ${r.flowerType}\n- Tone màu: ${r.colorTheme}${r.packaging ? `\n- Kiểu gói: ${r.packaging}` : ""}\n- Ngân sách: ${r.budget}\n- Ngày cần nhận: ${r.deliveryDate || "Càng sớm càng tốt"}\n- Ghi chú: ${r.notes || "Không có"}`);
  },

  deleteCustomReq(reqId) {
    if (!confirm(`Xoá yêu cầu ${reqId}?`)) return;
    this.customRequests = this.customRequests.filter(r => r.id !== reqId);
    localStorage.setItem("douple_custom_requests", JSON.stringify(this.customRequests));
    this.renderCustomRequestsTable();
    this.renderStats();
    this.showToast("Đã xoá yêu cầu thiết kế riêng", "info");
  },

  // ================= 6. BẢNG SẢN PHẨM & TỒN KHO SKU =================
  renderProductsTable() {
    const tbody = document.getElementById("productsTableBody");
    if (!tbody) return;

    let filtered = [...this.products];

    // Lọc theo trạng thái còn hàng / hết hàng
    if (this.currentProductFilter === "inStock") {
      filtered = filtered.filter(p => p.inStock && p.stockQuantity > 0);
    } else if (this.currentProductFilter === "outOfStock") {
      filtered = filtered.filter(p => !p.inStock || p.stockQuantity <= 0);
    }

    // Tìm kiếm sản phẩm theo tên, danh mục hoặc SKU
    if (this.currentProductSearch) {
      const q = this.currentProductSearch.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q)
      );
    }

    // Cập nhật thống kê tồn kho & sản phẩm
    const countTotal = this.products.length;
    const countInStock = this.products.filter(p => p.inStock && p.stockQuantity > 0).length;
    const countOutStock = countTotal - countInStock;
    const totalInventory = this.products.reduce((acc, p) => acc + (parseInt(p.stockQuantity) || 0), 0);

    const statsEl = document.getElementById("productStatsRow");
    if (statsEl) {
      statsEl.innerHTML = `
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; font-size: 0.85rem;">
          <span style="background: #FFF; padding: 6px 14px; border-radius: 6px; border: 1px solid var(--admin-border);">
            Tổng mẫu hoa: <strong>${countTotal}</strong>
          </span>
          <span style="background: var(--color-success-bg); color: var(--color-success); padding: 6px 14px; border-radius: 6px; border: 1px solid #A7F3D0; font-weight: 600;">
            <i class="bi bi-check-circle-fill"></i> Còn hàng: <strong>${countInStock}</strong>
          </span>
          <span style="background: var(--color-danger-bg); color: var(--color-danger); padding: 6px 14px; border-radius: 6px; border: 1px solid #FECACA; font-weight: 600;">
            <i class="bi bi-exclamation-octagon-fill"></i> Hết hàng: <strong>${countOutStock}</strong>
          </span>
          <span style="background: #EFF6FF; color: #2563EB; padding: 6px 14px; border-radius: 6px; border: 1px solid #BFDBFE; font-weight: 600;">
            <i class="bi bi-boxes"></i> Tổng tồn kho: <strong>${totalInventory} bó</strong>
          </span>
        </div>
      `;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
            <i class="bi bi-flower1" style="font-size: 2.2rem; display: block; margin-bottom: 8px;"></i>
            Không tìm thấy mẫu hoa nào phù hợp
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const isAvailable = p.inStock && (parseInt(p.stockQuantity) > 0);
      return `
        <tr>
          <td>
            <img src="${this.resolveAssetUrl(p.image)}" alt="${p.name}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; cursor: pointer; border: 1px solid var(--admin-border);" onclick="AdminApp.previewImage('${p.image}')" title="Bấm để xem ảnh to">
          </td>
          <td>
            <strong style="color: var(--color-primary); font-size: 0.95rem;">${p.name}</strong>
            <div style="font-size: 0.78rem; color: var(--admin-text-muted); margin-top: 2px;">
              <span style="background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${p.categoryName || "Hoa Kẽm Nhung"}</span>
              ${p.badge ? `<span style="background: var(--color-rose-soft); color: var(--color-rose); padding: 2px 6px; border-radius: 4px; margin-left: 4px; font-weight: 600;">${p.badge}</span>` : ""}
            </div>
          </td>
          <td>
            <span class="sku-badge">${p.sku || "DF-SP-00"}</span>
          </td>
          <td>
            <strong style="color: var(--color-danger); font-size: 0.92rem;">${this.formatCurrency(p.price)}</strong>
            ${p.originalPrice && p.originalPrice > p.price ? `
              <div style="font-size: 0.74rem; color: var(--admin-text-muted); display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                <span style="text-decoration: line-through; color: var(--admin-text-light);">${this.formatCurrency(p.originalPrice)}</span>
                <span style="color: #E11D48; font-weight: 700; font-size: 0.7rem; background: #FFF1F2; padding: 1px 4px; border-radius: 3px; border: 1px solid #FECDD3;">-${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%</span>
              </div>` : ""}
          </td>
          <td>
            <div class="stock-control-box" title="Chỉnh số lượng tồn kho (Tự động chuyển Hết hàng khi = 0)">
              <button type="button" class="btn-stock-adjust" onclick="AdminApp.adjustStock('${p.id}', -1)" title="Giảm 1 bó">-</button>
              <input type="number" class="stock-input" value="${p.stockQuantity || 0}" min="0" onchange="AdminApp.updateStockDirect('${p.id}', this.value)">
              <button type="button" class="btn-stock-adjust" onclick="AdminApp.adjustStock('${p.id}', 1)" title="Tăng 1 bó">+</button>
            </div>
            <div style="font-size: 0.72rem; margin-top: 3px; font-weight: 600; color: ${isAvailable ? (p.stockQuantity <= 5 ? 'var(--color-warning)' : 'var(--color-success)') : 'var(--color-danger)'};">
              ${isAvailable ? (p.stockQuantity <= 5 ? '⚠️ Sắp hết (' + p.stockQuantity + ')' : '✓ Sẵn sàng') : '✕ Hết tồn kho'}
            </div>
          </td>
          <td>
            <button type="button" class="admin-badge ${isAvailable ? 'badge-completed' : 'badge-cancelled'}" style="cursor: pointer; border: none; padding: 6px 12px; font-size: 0.8rem;" onclick="AdminApp.toggleProductStock('${p.id}')" title="Nhấp để chuyển nhanh Còn hàng ⇄ Hết hàng">
              <i class="bi ${isAvailable ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i> ${isAvailable ? 'Còn hàng' : 'Hết hàng'}
            </button>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-table-action" onclick="AdminApp.duplicateProduct('${p.id}')" title="Nhân bản mẫu hoa này (tạo mẫu mới siêu nhanh)">
                <i class="bi bi-copy" style="color: #2563EB;"></i>
              </button>
              <button type="button" class="btn-table-action" onclick="AdminApp.openEditProductModal('${p.id}')" title="Chỉnh sửa thông tin & ảnh hoa">
                <i class="bi bi-pencil-square" style="color: var(--color-primary);"></i>
              </button>
              <button type="button" class="btn-table-action danger" onclick="AdminApp.deleteProduct('${p.id}')" title="Xóa mẫu hoa">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  adjustStock(productId, delta) {
    const p = this.products.find(x => x.id === productId);
    if (!p) return;
    p.stockQuantity = Math.max(0, (parseInt(p.stockQuantity) || 0) + delta);
    if (p.stockQuantity === 0) {
      p.inStock = false;
    } else if (p.stockQuantity > 0 && delta > 0 && !p.inStock) {
      p.inStock = true;
    }
    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.showToast(`Đã cập nhật tồn kho "${p.name}": ${p.stockQuantity} bó (${p.inStock ? 'Còn hàng' : 'Hết hàng'})`, "info");
  },

  updateStockDirect(productId, val) {
    const p = this.products.find(x => x.id === productId);
    if (!p) return;
    const qty = Math.max(0, parseInt(val) || 0);
    p.stockQuantity = qty;
    p.inStock = qty > 0;
    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.showToast(`Tồn kho "${p.name}" đặt thành ${qty} bó (${p.inStock ? 'Còn hàng' : 'Hết hàng'})`, "info");
  },

  toggleProductStock(productId) {
    const p = this.products.find(x => x.id === productId);
    if (!p) return;
    p.inStock = !p.inStock;
    if (p.inStock && (!p.stockQuantity || p.stockQuantity <= 0)) {
      p.stockQuantity = 10; // Tự động thêm 10 bó tồn kho khi bật còn hàng
    } else if (!p.inStock) {
      p.stockQuantity = 0; // Hết hàng thì về 0
    }
    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.showToast(`Đã đổi "${p.name}" thành: ${p.inStock ? 'Còn hàng (Tồn: ' + p.stockQuantity + ')' : 'Hết hàng'}`, "info");
  },

  resolveAssetUrl(url) {
    if (!url) return "assets/bo_hoa_ly_hong.jpg";
    if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
      return url;
    }
    const isInsideAdminFolder = window.location.pathname.replace(/\/+$/, "").endsWith("/admin") || window.location.pathname.includes("/admin/");
    if (isInsideAdminFolder) {
      return url.startsWith("../") ? url : `../${url}`;
    }
    return url.startsWith("../") ? url.replace(/^\.\.\//, "") : url;
  },

  setPriceVal(inputId, val) {
    const el = document.getElementById(inputId);
    if (el) el.value = val;
  },

  calcEditSalePercent(context = 'edit') {
    const isEdit = context === 'edit';
    const priceEl = document.getElementById(isEdit ? "editPPrice" : "pPrice");
    const origPriceEl = document.getElementById(isEdit ? "editPOriginalPrice" : "pOriginalPrice");
    const badgeEl = document.getElementById(isEdit ? "editPBadge" : "pBadge");
    const previewEl = document.getElementById(isEdit ? "editSaleBadgePreview" : "addSaleBadgePreview");

    if (!priceEl || !previewEl) return;

    const price = parseInt(priceEl.value) || 0;
    const origPrice = parseInt(origPriceEl ? origPriceEl.value : 0) || 0;

    if (origPrice > price && price > 0) {
      const discountPercent = Math.round(((origPrice - price) / origPrice) * 100);
      const savings = origPrice - price;
      previewEl.innerHTML = `
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 6px; color: #E11D48; font-weight: 700; font-size: 0.82rem;">
          <i class="bi bi-fire"></i> Đang Sale giảm ${discountPercent}% (Tiết kiệm ${this.formatCurrency(savings)})
        </div>
      `;
      // Nếu ô badge đang trống hoặc đang là "Sale X%", tự cập nhật theo % giảm giá
      if (badgeEl && (!badgeEl.value || /^Sale \d+%/i.test(badgeEl.value.trim()))) {
        badgeEl.value = `Sale ${discountPercent}%`;
      }
    } else if (origPrice > 0 && origPrice <= price) {
      previewEl.innerHTML = `
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 6px; color: #B45309; font-size: 0.78rem;">
          <i class="bi bi-exclamation-triangle"></i> Giá gốc niêm yết đang nhỏ hơn hoặc bằng giá bán (Không gạch ngang)
        </div>
      `;
    } else {
      previewEl.innerHTML = `
        <div style="font-size: 0.78rem; color: var(--admin-text-muted);">
          <i class="bi bi-info-circle"></i> Đang bán giá chuẩn niêm yết (Không áp dụng gạch ngang giảm giá)
        </div>
      `;
      if (badgeEl && /^Sale \d+%/i.test(badgeEl.value.trim())) {
        badgeEl.value = "";
      }
    }
  },

  applyQuickDiscount(percent, context = 'edit') {
    const isEdit = context === 'edit';
    const priceEl = document.getElementById(isEdit ? "editPPrice" : "pPrice");
    const origPriceEl = document.getElementById(isEdit ? "editPOriginalPrice" : "pOriginalPrice");
    const badgeEl = document.getElementById(isEdit ? "editPBadge" : "pBadge");

    if (!priceEl || !origPriceEl) return;

    if (percent === 0) {
      // Tắt Sale: Giá gốc = Giá bán hiện tại
      const currentPrice = parseInt(priceEl.value) || 350000;
      origPriceEl.value = currentPrice;
      if (badgeEl && /^Sale/i.test(badgeEl.value)) {
        badgeEl.value = "";
      }
      this.calcEditSalePercent(context);
      this.showToast("Đã tắt chế độ giảm giá Sale", "info");
      return;
    }

    // Tính nhanh sale:
    let basePrice = parseInt(origPriceEl.value) || 0;
    const currentPrice = parseInt(priceEl.value) || 0;

    if (basePrice <= 0 || basePrice <= currentPrice) {
      basePrice = currentPrice > 0 ? currentPrice : 380000;
      origPriceEl.value = basePrice;
    }

    // Giá sau giảm = basePrice * (1 - percent/100), làm tròn đến nghìn
    const salePrice = Math.round((basePrice * (1 - percent / 100)) / 1000) * 1000;
    priceEl.value = salePrice;

    if (badgeEl) {
      badgeEl.value = `Sale ${percent}%`;
    }

    this.calcEditSalePercent(context);
    this.showToast(`Đã áp dụng giảm ${percent}%: Giá bán ${this.formatCurrency(salePrice)} (Giá gốc ${this.formatCurrency(basePrice)})`, "success");
  },

  generateCategorySlug(name) {
    if (!name) return "hoa-kem-nhung";
    const clean = name.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return clean || "hoa-kem-nhung";
  },

  populateCategorySuggestions() {
    const datalist = document.getElementById("flowerCategorySuggestions");
    if (!datalist) return;
    const baseSuggestions = [
      "Hoa Ly Kẽm Nhung",
      "Hoa Tulip",
      "Hoa Hồng Đỏ",
      "Hoa Hướng Dương",
      "Hoa Tốt Nghiệp",
      "Hộp Hoa LED Cao Cấp",
      "Hoa Cẩm Chướng",
      "Hoa Cúc Tana",
      "Hoa Baby Pastel",
      "Hoa Cưới Handmade",
      "Bó Hoa Khổng Lồ"
    ];
    const set = new Set(baseSuggestions);
    (this.products || []).forEach(p => {
      if (p.categoryName && p.categoryName.trim()) set.add(p.categoryName.trim());
    });
    datalist.innerHTML = Array.from(set).map(name => `<option value="${name}"></option>`).join("");
  },

  handleQuickNameInput(val, context) {
    const text = (val || "").toLowerCase();
    let detectedCatName = null;
    let catCode = "SP";

    if (text.includes("tulip")) {
      detectedCatName = "Hoa Tulip";
      catCode = "TL";
    } else if (text.includes("ly")) {
      detectedCatName = "Hoa Ly Kẽm Nhung";
      catCode = "LY";
    } else if (text.includes("hồng") || text.includes("hong")) {
      detectedCatName = "Hoa Hồng Đỏ";
      catCode = "HD";
    } else if (text.includes("tốt nghiệp") || text.includes("tot nghiep")) {
      detectedCatName = "Hoa Tốt Nghiệp";
      catCode = "TN";
    } else if (text.includes("hướng dương") || text.includes("huong duong")) {
      detectedCatName = "Hoa Hướng Dương";
      catCode = "HD";
    } else if (text.includes("hộp") || text.includes("hop") || text.includes("led")) {
      detectedCatName = "Hộp Hoa LED Cao Cấp";
      catCode = "HH";
    } else if (text.includes("cẩm chướng") || text.includes("cam chuong")) {
      detectedCatName = "Hoa Cẩm Chướng";
      catCode = "CC";
    } else if (text.includes("cúc") || text.includes("cuc")) {
      detectedCatName = "Hoa Cúc Tana";
      catCode = "CT";
    }

    if (context === "modal") {
      if (detectedCatName) {
        const catInput = document.getElementById("pCategory");
        if (catInput && (!catInput.value || catInput.value === "Hoa Ly Kẽm Nhung")) {
          catInput.value = detectedCatName;
        }
      }
      const skuInput = document.getElementById("pSku");
      if (skuInput && (!skuInput.value || skuInput.value.startsWith("DF-"))) {
        const nextIdx = this.products.length + 1;
        skuInput.value = `DF-${catCode}-${nextIdx.toString().padStart(2, "0")}`;
      }
    } else {
      if (detectedCatName) {
        const catInput = document.getElementById("quickPCategory");
        if (catInput && (!catInput.value || catInput.value === "Hoa Ly Kẽm Nhung")) {
          catInput.value = detectedCatName;
        }
      }
    }
  },

  handleCategoryChange(catName, context) {
    if (context === "modal") {
      const slug = this.generateCategorySlug(catName);
      const codeMap = { "hoa-ly": "LY", "hoa-tulip": "TL", "hoa-hong": "HD", "tot-nghiep": "TN", "hop-hoa": "HH", "hoa-huong-duong": "HD" };
      let catCode = codeMap[slug];
      if (!catCode) {
        const words = (catName || "").trim().split(/\s+/);
        if (words.length >= 2) {
          catCode = (words[0][0] + words[1][0]).toUpperCase();
        } else {
          catCode = (catName || "SP").substring(0, 2).toUpperCase();
        }
      }
      const skuInput = document.getElementById("pSku");
      if (skuInput && (!skuInput.value || skuInput.value.startsWith("DF-"))) {
        const nextIdx = this.products.length + 1;
        skuInput.value = `DF-${catCode}-${nextIdx.toString().padStart(2, "0")}`;
      }
    }
  },

  handleQuickImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const hiddenInput = document.getElementById("quickPImage");
        const preview = document.getElementById("quickPImgPreview");
        if (hiddenInput) hiddenInput.value = dataUrl;
        if (preview) preview.src = dataUrl;
        this.showToast("Đã chọn ảnh tải lên thành công!", "info");
      };
      reader.readAsDataURL(file);
    }
  },

  duplicateProduct(productId) {
    const orig = this.products.find(p => p.id === productId);
    if (!orig) return;

    const modal = document.getElementById("addProductModal");
    if (!modal) return;

    const nextIdx = this.products.length + 1;
    const catCode = (orig.category || "sp").replace("hoa-", "").substring(0, 2).toUpperCase();
    const newSku = `DF-${catCode}-${nextIdx.toString().padStart(2, "0")}`;

    document.getElementById("pName").value = orig.name + " (Bản sao)";
    document.getElementById("pCategory").value = orig.categoryName || orig.category || "Hoa Ly Kẽm Nhung";
    document.getElementById("pPrice").value = orig.price || 350000;
    if (document.getElementById("pOriginalPrice")) document.getElementById("pOriginalPrice").value = orig.originalPrice || orig.price;
    if (document.getElementById("pStock")) document.getElementById("pStock").value = "20";
    if (document.getElementById("pSku")) document.getElementById("pSku").value = newSku;
    if (document.getElementById("pBadge")) document.getElementById("pBadge").value = "Mẫu Mới";
    if (document.getElementById("pImage")) document.getElementById("pImage").value = orig.image;
    this.updateImagePreview(orig.image);
    if (document.getElementById("pDescription")) document.getElementById("pDescription").value = orig.description || "";

    this.calcEditSalePercent('add');
    this.openModal("addProductModal");
    this.showToast(`Đã sao chép thông tin từ "${orig.name}". Bạn chỉ cần chỉnh sửa tên/ảnh rồi bấm Hoàn Tất!`, "info");
  },

  openAddProductModal() {
    const nextIdx = this.products.length + 1;
    const skuInput = document.getElementById("pSku");
    if (skuInput) skuInput.value = "DF-SP-" + nextIdx.toString().padStart(2, "0");
    const stockInput = document.getElementById("pStock");
    if (stockInput) stockInput.value = "20";
    const catInput = document.getElementById("pCategory");
    if (catInput && !catInput.value) catInput.value = "Hoa Ly Kẽm Nhung";
    const priceInput = document.getElementById("pPrice");
    if (priceInput && !priceInput.value) priceInput.value = "350000";
    const origPriceInput = document.getElementById("pOriginalPrice");
    if (origPriceInput && !origPriceInput.value) origPriceInput.value = "350000";
    this.calcEditSalePercent('add');
    this.openModal("addProductModal");
  },

  addNewProduct(formData) {
    const newId = "df-" + (this.products.length + 1).toString().padStart(2, "0");
    const stockQty = Math.max(0, parseInt(formData.stock) || 20);
    const sku = formData.sku ? formData.sku.trim().toUpperCase() : ("DF-" + (formData.category ? formData.category.substring(0, 3).toUpperCase() : "SP") + "-" + (this.products.length + 1).toString().padStart(2, "0"));

    const product = {
      id: newId,
      sku: sku,
      name: formData.name,
      category: formData.category,
      categoryName: formData.categoryName || "Hoa Kẽm Nhung",
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
      stockQuantity: stockQty,
      image: formData.image || "assets/bo_hoa_ly_hong.jpg",
      badge: formData.badge || "Mẫu Mới",
      rating: 5.0,
      reviewsCount: 1,
      description: formData.description || "Hoa kẽm nhung thủ công cao cấp tỉ mỉ.",
      features: [
        "Kẽm nhung loại 1 cao cấp mềm mịn",
        "Độ bền vĩnh cửu không phai màu",
        "Tặng kèm thiệp viết tay & túi hoa"
      ],
      inStock: stockQty > 0
    };

    this.products.unshift(product);
    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.populateCategorySuggestions();
    this.closeModal("addProductModal");
    this.showToast(`Đã thêm bó hoa "${product.name}" (SKU: ${product.sku}) thành công!`, "success");
  },

  openEditProductModal(productId) {
    const p = this.products.find(x => x.id === productId);
    if (!p) {
      this.showToast("Không tìm thấy thông tin bó hoa!", "error");
      return;
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : "";
    };

    setVal("editPId", p.id);
    setVal("editPName", p.name);
    setVal("editPSku", p.sku || ("DF-SP-" + p.id));
    setVal("editPCategory", p.categoryName || p.category || "Hoa Ly Kẽm Nhung");
    setVal("editPPrice", p.price);
    setVal("editPOriginalPrice", (p.originalPrice && p.originalPrice > p.price) ? p.originalPrice : (p.originalPrice || p.price));
    setVal("editPStock", p.stockQuantity !== undefined ? p.stockQuantity : 20);
    setVal("editPInStock", (p.inStock && p.stockQuantity > 0) ? "true" : "false");
    setVal("editPBadge", p.badge || "");
    setVal("editPImage", p.image || "assets/bo_hoa_ly_hong.jpg");
    setVal("editPDescription", p.description || "");

    this.updateEditImagePreview(p.image || "assets/bo_hoa_ly_hong.jpg");
    this.calcEditSalePercent('edit');
    this.openModal("editProductModal");
  },

  handleEditStockChange(val) {
    const qty = parseInt(val) || 0;
    const select = document.getElementById("editPInStock");
    if (select) {
      select.value = qty > 0 ? "true" : "false";
    }
  },

  handleEditStatusChange(val) {
    const stockInput = document.getElementById("editPStock");
    if (!stockInput) return;
    if (val === "false") {
      stockInput.value = "0";
    } else if (val === "true" && (parseInt(stockInput.value) || 0) <= 0) {
      stockInput.value = "10";
    }
  },

  saveEditProduct(formData) {
    const p = this.products.find(x => x.id === formData.id);
    if (!p) return;

    p.name = formData.name;
    p.sku = formData.sku ? formData.sku.trim().toUpperCase() : p.sku;
    p.category = formData.category;
    p.categoryName = formData.categoryName;
    const price = parseInt(formData.price) || 0;
    const origPrice = parseInt(formData.originalPrice);
    p.price = price;
    p.originalPrice = (!isNaN(origPrice) && origPrice > 0) ? origPrice : price;
    
    let stockQty = Math.max(0, parseInt(formData.stock) || 0);
    const inStock = formData.inStock === "true";
    if (inStock && stockQty <= 0) {
      stockQty = 10;
    } else if (!inStock) {
      stockQty = 0;
    }
    p.stockQuantity = stockQty;
    p.inStock = inStock && stockQty > 0;
    p.badge = formData.badge ? formData.badge.trim() : "";
    p.image = formData.image;
    p.description = formData.description;

    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.populateCategorySuggestions();
    this.closeModal("editProductModal");
    const isSale = p.originalPrice > p.price;
    const discountNote = isSale ? ` [Giá Sale: ${this.formatCurrency(p.price)} (-${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%)]` : "";
    this.showToast(`Đã lưu thay đổi cho "${p.name}" (SKU: ${p.sku})${discountNote}!`, "success");
  },

  handleEditProductImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const pImageInput = document.getElementById("editPImage");
        if (pImageInput) pImageInput.value = dataUrl;
        this.updateEditImagePreview(dataUrl);
        this.showToast("Đã tải ảnh lên xem trước!", "info");
      };
      reader.readAsDataURL(file);
    }
  },

  selectEditPresetImage(src, el) {
    const input = document.getElementById("editPImage");
    if (input) input.value = src;
    this.updateEditImagePreview(src);
    if (el) {
      document.querySelectorAll("#editProductModal .preset-thumb-item").forEach(item => item.classList.remove("active"));
      el.classList.add("active");
    }
  },

  updateEditImagePreview(src) {
    const preview = document.getElementById("editPImgPreview");
    if (preview) {
      preview.src = this.resolveAssetUrl(src) || this.resolveAssetUrl("assets/bo_hoa_ly_hong.jpg");
    }
  },

  deleteProduct(productId) {
    if (!confirm("Bạn có chắc chắn muốn xoá mẫu hoa này khỏi cửa hàng?")) return;
    this.products = this.products.filter(p => p.id !== productId);
    localStorage.setItem("douple_products", JSON.stringify(this.products));
    this.renderProductsTable();
    this.showToast("Đã xoá mẫu hoa thành công", "info");
  },

  // ================= 7. CÀI ĐẶT CỬA HÀNG =================
  loadSettingsForm() {
    const s = this.settings;
    const phoneInput = document.getElementById("settingPhone");
    const fbInput = document.getElementById("settingFb");
    const bankNameInput = document.getElementById("settingBankName");
    const bankAccInput = document.getElementById("settingBankAcc");
    const bankOwnerInput = document.getElementById("settingBankOwner");
    const freeShipInput = document.getElementById("settingFreeship");

    if (phoneInput) phoneInput.value = s.phone || "0393 613 156";
    if (fbInput) fbInput.value = s.facebookUrl || "https://web.facebook.com/profile.php?id=61593298393972&locale=vi_VN";
    if (bankNameInput) bankNameInput.value = s.bankInfo?.bankName || "MB Bank (Ngân hàng Quân Đội)";
    if (bankAccInput) bankAccInput.value = s.bankInfo?.accountNumber || "0393613156";
    if (bankOwnerInput) bankOwnerInput.value = s.bankInfo?.accountHolder || "DOUPLE FLOWER SHOP";
    if (freeShipInput) freeShipInput.value = s.freeShippingThreshold || 500000;
  },

  saveSettings() {
    const phone = document.getElementById("settingPhone")?.value || "0393 613 156";
    const fb = document.getElementById("settingFb")?.value || "";
    const bankName = document.getElementById("settingBankName")?.value || "MB Bank";
    const bankAcc = document.getElementById("settingBankAcc")?.value || "0393613156";
    const bankOwner = document.getElementById("settingBankOwner")?.value || "DOUPLE FLOWER SHOP";
    const freeShip = parseInt(document.getElementById("settingFreeship")?.value) || 500000;

    // Kiểm tra đổi mật khẩu quản trị nếu người dùng nhập
    const newPass = document.getElementById("settingNewPass")?.value?.trim();
    const confirmPass = document.getElementById("settingConfirmPass")?.value?.trim();
    let passChanged = false;

    if (newPass || confirmPass) {
      if (newPass !== confirmPass) {
        this.showToast("Xác nhận mật khẩu mới không khớp! Vui lòng nhập lại.", "error");
        return;
      }
      if (newPass.length < 6) {
        this.showToast("Mật khẩu mới phải có tối thiểu 6 ký tự để bảo mật!", "error");
        return;
      }
      localStorage.setItem("douple_admin_pass", newPass);
      passChanged = true;
      const newPassInput = document.getElementById("settingNewPass");
      const confirmPassInput = document.getElementById("settingConfirmPass");
      if (newPassInput) newPassInput.value = "";
      if (confirmPassInput) confirmPassInput.value = "";
    }

    this.settings = {
      ...this.settings,
      phone: phone,
      hotlineFormatted: phone,
      facebookUrl: fb,
      freeShippingThreshold: freeShip,
      bankInfo: {
        bankName: bankName,
        accountNumber: bankAcc,
        accountHolder: bankOwner
      }
    };

    localStorage.setItem("douple_settings", JSON.stringify(this.settings));
    if (passChanged) {
      this.showToast("Đã lưu cài đặt và đổi mật khẩu quản trị thành công!", "success");
    } else {
      this.showToast("Đã lưu cập nhật cài đặt cửa hàng thành công!", "success");
    }
  },

  // ================= 8. NAVIGATION & SỰ KIỆN =================
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".nav-item-link").forEach(link => {
      link.classList.toggle("active", link.getAttribute("data-tab") === tabId);
    });

    document.querySelectorAll(".admin-tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `pane_${tabId}`);
    });

    const titles = {
      overview: "Tổng Quan Hoạt Động Cửa Hàng",
      orders: "Quản Lý Đơn Đặt Hàng & Cọc 50%",
      customRequests: "Quản Lý Yêu Cầu Thiết Kế Hoa Riêng",
      products: "Quản Lý Danh Mục Bó Hoa",
      settings: "Cài Đặt Cửa Hàng & Thanh Toán"
    };

    const topbarTitle = document.getElementById("topbarTitle");
    if (topbarTitle) topbarTitle.textContent = titles[tabId] || "Trang Quản Trị";
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = "flex";
    modal.classList.add("active");
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = "none";
    modal.classList.remove("active");
  },

  bindEvents() {
    // Đăng nhập form
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pass = document.getElementById("adminPasswordInput").value;
        this.login(pass);
      });
    }

    // Đăng xuất
    const logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => this.logout());

    // Chuyển tab sidebar
    document.querySelectorAll(".nav-item-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    // Lọc trạng thái đơn hàng
    document.querySelectorAll(".order-filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".order-filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentOrderFilter = pill.getAttribute("data-status");
        this.renderOrdersTable();
      });
    });

    // Tìm kiếm đơn hàng
    const orderSearch = document.getElementById("orderSearchInput");
    if (orderSearch) {
      orderSearch.addEventListener("input", (e) => {
        this.currentSearchQuery = e.target.value.trim();
        this.renderOrdersTable();
      });
    }

    // Lưu cài đặt form
    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Modal close buttons & backdrops
    document.querySelectorAll(".admin-modal-close").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-overlay");
        if (modal) {
          modal.style.display = "none";
          modal.classList.remove("active");
        }
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.style.display = "none";
          overlay.classList.remove("active");
        }
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active, .modal-overlay[style*='display: flex']").forEach(m => {
          m.style.display = "none";
          m.classList.remove("active");
        });
      }
    });

    // Thêm siêu nhanh mẫu hoa (Quick Add Panel trên thanh công cụ)
    const quickAddProductForm = document.getElementById("quickAddProductForm");
    if (quickAddProductForm) {
      quickAddProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("quickPName");
        const catInput = document.getElementById("quickPCategory");
        const priceInput = document.getElementById("quickPPrice");
        const imgInput = document.getElementById("quickPImage");

        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) {
          this.showToast("Vui lòng nhập tên mẫu hoa!", "error");
          return;
        }

        const rawCat = catInput ? catInput.value.trim() : "";
        const categoryName = rawCat || "Hoa Kẽm Nhung";
        const category = this.generateCategorySlug(categoryName);
        const price = priceInput ? (parseInt(priceInput.value) || 350000) : 350000;
        const image = (imgInput && imgInput.value) ? imgInput.value : "assets/bo_hoa_ly_hong.jpg";

        const words = categoryName.trim().split(/\s+/);
        const catCode = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : categoryName.substring(0, 2).toUpperCase();
        const nextIdx = this.products.length + 1;
        const sku = `DF-${catCode}-${nextIdx.toString().padStart(2, "0")}`;

        this.addNewProduct({
          name: name,
          sku: sku,
          category: category,
          categoryName: categoryName,
          price: price,
          originalPrice: price,
          stock: 20,
          badge: "Mẫu Mới",
          image: image,
          description: `Mẫu ${name} làm thủ công từ kẽm nhung cao cấp tỉ mỉ từng chi tiết, bền đẹp vĩnh cửu theo thời gian.`
        });

        quickAddProductForm.reset();
        const preview = document.getElementById("quickPImgPreview");
        if (preview) preview.src = this.resolveAssetUrl("assets/bo_hoa_ly_hong.jpg");
        if (imgInput) imgInput.value = "assets/bo_hoa_ly_hong.jpg";
      });
    }

    // Hỗ trợ kéo & thả ảnh trực tiếp vào khung dropzone
    document.querySelectorAll(".modal-image-dropzone").forEach(dropzone => {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });
      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (!file.type.startsWith("image/")) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            const isEdit = dropzone.closest("#editProductModal") !== null;
            if (isEdit) {
              const editImg = document.getElementById("editPImage");
              if (editImg) editImg.value = dataUrl;
              this.updateEditImagePreview(dataUrl);
            } else {
              const addImg = document.getElementById("pImage");
              if (addImg) addImg.value = dataUrl;
              this.updateImagePreview(dataUrl);
            }
            this.showToast("Đã nhận ảnh mẫu hoa tải lên từ kéo thả!", "info");
          };
          reader.readAsDataURL(file);
        }
      });
    });

    // Thêm sản phẩm form
    const addProductForm = document.getElementById("addProductForm");
    if (addProductForm) {
      addProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("pName").value.trim();
        const sku = document.getElementById("pSku") ? document.getElementById("pSku").value.trim() : "";
        const rawCat = document.getElementById("pCategory") ? document.getElementById("pCategory").value.trim() : "";
        const categoryName = rawCat || "Hoa Kẽm Nhung";
        const category = this.generateCategorySlug(categoryName);
        const price = document.getElementById("pPrice").value;
        const originalPrice = document.getElementById("pOriginalPrice").value;
        const stock = document.getElementById("pStock") ? document.getElementById("pStock").value : 20;
        const badge = document.getElementById("pBadge").value;
        const image = document.getElementById("pImage").value || "assets/bo_hoa_ly_hong.jpg";
        const description = document.getElementById("pDescription").value;

        this.addNewProduct({ name, sku, category, categoryName, price, originalPrice, stock, badge, image, description });
      });
    }

    // Chỉnh sửa sản phẩm form
    const editProductForm = document.getElementById("editProductForm");
    if (editProductForm) {
      editProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("editPId").value;
        const name = document.getElementById("editPName").value.trim();
        const sku = document.getElementById("editPSku").value.trim();
        const rawEditCat = document.getElementById("editPCategory") ? document.getElementById("editPCategory").value.trim() : "";
        const categoryName = rawEditCat || "Hoa Kẽm Nhung";
        const category = this.generateCategorySlug(categoryName);
        const price = document.getElementById("editPPrice").value;
        const originalPrice = document.getElementById("editPOriginalPrice").value;
        const stock = document.getElementById("editPStock").value;
        const inStock = document.getElementById("editPInStock").value;
        const badge = document.getElementById("editPBadge").value;
        const image = document.getElementById("editPImage").value || "assets/bo_hoa_ly_hong.jpg";
        const description = document.getElementById("editPDescription").value;

        this.saveEditProduct({ id, name, sku, category, categoryName, price, originalPrice, stock, inStock, badge, image, description });
      });
    }

    // Bộ lọc danh mục sản phẩm (Tất cả / Còn hàng / Hết hàng)
    document.querySelectorAll(".product-filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".product-filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentProductFilter = pill.getAttribute("data-filter") || "all";
        this.renderProductsTable();
      });
    });

    // Tìm kiếm sản phẩm
    const prodSearch = document.getElementById("productSearchInput");
    if (prodSearch) {
      prodSearch.addEventListener("input", (e) => {
        this.currentProductSearch = e.target.value.trim();
        this.renderProductsTable();
      });
    }

    // Lắng nghe sự kiện storage để đồng bộ real-time khi khách đặt đơn từ tab khác
    window.addEventListener("storage", (e) => {
      if (e.key === "douple_orders" || e.key === "douple_custom_requests") {
        this.loadData();
        this.renderStats();
        this.renderOrdersTable();
        this.renderCustomRequestsTable();
        this.playNotificationSound();
        this.showToast("Có đơn hàng hoặc yêu cầu làm hoa mới vừa được cập nhật!", "success");
      }
    });
  },

  refreshData() {
    this.loadData();
    this.renderStats();
    this.renderRevenueChart();
    this.renderOrdersTable();
    this.renderCustomRequestsTable();
    this.renderProductsTable();
    this.showToast("Đã đồng bộ toàn bộ dữ liệu mới nhất!", "success");
  },

  exportOrdersCSV() {
    if (this.orders.length === 0) {
      this.showToast("Không có đơn hàng nào để xuất file!", "error");
      return;
    }

    const headers = [
      "Mã đơn hàng",
      "Ngày đặt",
      "Tên khách hàng",
      "Số điện thoại",
      "Tỉnh / TP",
      "Quận / Huyện",
      "Địa chỉ chi tiết",
      "Danh sách sản phẩm",
      "Tổng tiền (VNĐ)",
      "Tiền cọc 50% (VNĐ)",
      "Còn lại shipper thu (VNĐ)",
      "Phương thức thanh toán",
      "Trạng thái",
      "Lời chúc thiệp"
    ];

    const rows = this.orders.map(ord => {
      const itemsStr = (ord.items || []).map(i => `${i.name} (x${i.quantity})`).join("; ");
      const escape = (str) => `"${(str || "").toString().replace(/"/g, '""')}"`;
      return [
        ord.orderId,
        new Date(ord.createdAt).toLocaleString("vi-VN"),
        escape(ord.shipping?.receiverName),
        escape(ord.shipping?.receiverPhone),
        escape(ord.shipping?.city),
        escape(ord.shipping?.district),
        escape(ord.shipping?.address),
        escape(itemsStr),
        ord.total || 0,
        ord.depositAmount || 0,
        ord.remainAmount || 0,
        escape(ord.paymentNote || ord.paymentMethod),
        escape(ord.status),
        escape(ord.shipping?.greetingCard || "")
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Douple_Flower_Don_Hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast("Đã xuất file Excel / CSV thành công!", "success");
  },

  handleProductImageUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const pImageInput = document.getElementById("pImage");
        if (pImageInput) pImageInput.value = dataUrl;
        this.updateImagePreview(dataUrl);
        this.showToast("Đã tải ảnh lên thành công!", "info");
      };
      reader.readAsDataURL(file);
    }
  },

  selectPresetImage(src, el) {
    const input = document.getElementById("pImage");
    if (input) input.value = src;
    this.updateImagePreview(src);
    if (el) {
      document.querySelectorAll("#addProductModal .preset-thumb-item").forEach(item => item.classList.remove("active"));
      el.classList.add("active");
    }
  },

  updateImagePreview(src) {
    const preview = document.getElementById("pImgPreview");
    if (preview) {
      preview.src = this.resolveAssetUrl(src) || this.resolveAssetUrl("assets/bo_hoa_ly_hong.jpg");
    }
  },

  playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  },

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#1E3A2F'};
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideInToast 0.3s ease;
    `;
    toast.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.remove) toast.remove();
        else if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  AdminApp.init();
});
