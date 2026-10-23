// Quản lý Dịch vụ Nhận Làm Hoa Kẽm Nhung Theo Yêu Cầu Riêng (Bespoke Floral Craft)
const CustomOrderManager = {
  uploadedImageBase64: null,

  init() {
    this.renderOptions();
    this.bindEvents();
  },

  renderOptions() {
    // 1. Render Loại hoa
    const flowerTypesContainer = document.getElementById("customFlowerTypes");
    if (flowerTypesContainer) {
      flowerTypesContainer.innerHTML = CUSTOM_ORDER_OPTIONS.flowerTypes.map((item, idx) => `
        <label class="custom-pill-option ${idx === 0 ? 'selected' : ''}">
          <input type="radio" name="customFlowerType" value="${item.name}" ${idx === 0 ? 'checked' : ''}>
          <span class="custom-pill-content">
            <strong>${item.name}</strong>
            <small>${item.desc}</small>
          </span>
        </label>
      `).join("");
    }

    // 2. Render Tông màu
    const colorThemesContainer = document.getElementById("customColorThemes");
    if (colorThemesContainer) {
      colorThemesContainer.innerHTML = CUSTOM_ORDER_OPTIONS.colorThemes.map((item, idx) => `
        <label class="custom-color-chip ${idx === 0 ? 'selected' : ''}" title="${item.name}">
          <input type="radio" name="customColorTheme" value="${item.name}" ${idx === 0 ? 'checked' : ''}>
          <span class="color-swatch" style="background-color: ${item.color}"></span>
          <span class="color-name">${item.name}</span>
        </label>
      `).join("");
    }

    // 3. Render Phụ kiện
    const accessoriesContainer = document.getElementById("customAccessories");
    if (accessoriesContainer) {
      accessoriesContainer.innerHTML = CUSTOM_ORDER_OPTIONS.accessories.map((item) => `
        <label class="custom-checkbox-option ${item.free ? 'checked' : ''}">
          <input type="checkbox" name="customAccessories" value="${item.name}" ${item.free ? 'checked' : ''} data-price="${item.price}">
          <span class="checkbox-box"><i class="bi bi-check2"></i></span>
          <span class="checkbox-label">
            <strong>${item.name}</strong>
            <small>${item.free ? 'Miễn phí tặng kèm' : '+' + formatCurrency(item.price)}</small>
          </span>
        </label>
      `).join("");
    }

    // 5. Render Ngân sách
    const budgetSelect = document.getElementById("customBudget");
    if (budgetSelect) {
      budgetSelect.innerHTML = CUSTOM_ORDER_OPTIONS.budgets.map(b => `<option value="${b}">${b}</option>`).join("");
    }

    // 6. Render Dịp tặng
    const occasionSelect = document.getElementById("customOccasion");
    if (occasionSelect) {
      occasionSelect.innerHTML = CUSTOM_ORDER_OPTIONS.occasions.map(o => `<option value="${o}">${o}</option>`).join("");
    }
  },

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng tải lên định dạng hình ảnh (PNG, JPG, JPEG)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Kích thước ảnh tối đa 5MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageBase64 = e.target.result;
      const previewBox = document.getElementById("customImagePreviewBox");
      const previewImg = document.getElementById("customImagePreview");
      const uploadPlaceholder = document.getElementById("customUploadPlaceholder");

      if (previewBox && previewImg) {
        previewImg.src = e.target.result;
        previewBox.style.display = "block";
        if (uploadPlaceholder) uploadPlaceholder.style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  },

  removeUploadedImage() {
    this.uploadedImageBase64 = null;
    const fileInput = document.getElementById("customImageInput");
    const previewBox = document.getElementById("customImagePreviewBox");
    const uploadPlaceholder = document.getElementById("customUploadPlaceholder");

    if (fileInput) fileInput.value = "";
    if (previewBox) previewBox.style.display = "none";
    if (uploadPlaceholder) uploadPlaceholder.style.display = "flex";
  },

  submitCustomOrder() {
    const user = AuthManager.getCurrentUser();

    const nameInput = document.getElementById("customCustomerName");
    const phoneInput = document.getElementById("customCustomerPhone");
    const notesInput = document.getElementById("customNotes");
    const dateInput = document.getElementById("customDeliveryDate");

    let customerName = nameInput ? nameInput.value.trim() : "";
    let customerPhone = phoneInput ? phoneInput.value.trim().replace(/\s+/g, "") : "";

    if (user) {
      if (!customerName) customerName = user.fullName;
      if (!customerPhone) customerPhone = user.phone;
    }

    if (!customerName) {
      showToast("Vui lòng nhập họ và tên của bạn", "error");
      if (nameInput) nameInput.focus();
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(customerPhone)) {
      showToast("Vui lòng nhập số điện thoại hợp lệ để thợ hoa liên hệ", "error");
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Thu thập lựa chọn
    const flowerTypeEl = document.querySelector('input[name="customFlowerType"]:checked');
    const colorThemeEl = document.querySelector('input[name="customColorTheme"]:checked');
    const budgetEl = document.getElementById("customBudget");
    const occasionEl = document.getElementById("customOccasion");

    const accessories = [];
    document.querySelectorAll('input[name="customAccessories"]:checked').forEach(c => {
      accessories.push(c.value);
    });

    const requestId = "REQ" + Math.floor(100000 + Math.random() * 900000);

    const customRequest = {
      id: requestId,
      createdAt: new Date().toISOString(),
      customerName: customerName,
      customerPhone: customerPhone,
      flowerType: flowerTypeEl ? flowerTypeEl.value : "Hoa phối mix",
      colorTheme: colorThemeEl ? colorThemeEl.value : "Hồng Pastel",
      accessories: accessories,
      budget: budgetEl ? budgetEl.value : "Từ 350.000đ - 500.000đ",
      occasion: occasionEl ? occasionEl.value : "Sinh nhật",
      notes: notesInput ? notesInput.value.trim() : "",
      deliveryDate: dateInput ? dateInput.value : "Giao sớm nhất có thể",
      hasCustomImage: !!this.uploadedImageBase64,
      imagePreview: this.uploadedImageBase64,
      status: "Đang chờ thợ hoa báo giá chi tiết"
    };

    // Lưu vào localStorage
    try {
      const requests = JSON.parse(localStorage.getItem("douple_custom_requests") || "[]");
      requests.unshift(customRequest);
      localStorage.setItem("douple_custom_requests", JSON.stringify(requests));
    } catch (e) {
      console.error("Lỗi lưu yêu cầu:", e);
    }

    // Hiển thị modal thông báo thành công
    this.showSuccessModal(customRequest);
    playSound("orderSuccess");
    triggerConfetti();

    // Reset form
    this.resetForm();
  },

  showSuccessModal(req) {
    const modal = document.getElementById("customSuccessModal");
    const body = document.getElementById("customSuccessModalBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="custom-success-content">
        <div class="success-icon-animated"><i class="bi bi-stars"></i></div>
        <h3>Đã Tiếp Nhận Yêu Cầu Thiết Kế Hoa!</h3>
        <p>Mã yêu cầu: <strong class="text-primary font-mono">${req.id}</strong></p>
        <p class="text-muted">Tiệm hoa Douple sẽ liên hệ qua số điện thoại <strong>${req.customerPhone}</strong> trong vòng 15-30 phút để chốt bản phác thảo và gửi ảnh hoa hoàn thiện cho bạn duyệt.</p>

        <div class="custom-summary-card">
          <div><strong>Loại hoa:</strong> ${req.flowerType}</div>
          <div><strong>Tone màu:</strong> ${req.colorTheme}</div>
          <div><strong>Ngân sách:</strong> ${req.budget}</div>
          ${req.deliveryDate ? `<div><strong>Ngày cần nhận:</strong> ${req.deliveryDate}</div>` : ""}
          ${req.accessories.length > 0 ? `<div><strong>Phụ kiện:</strong> ${req.accessories.join(", ")}</div>` : ""}
        </div>

        <div class="custom-modal-actions">
          <a href="${STORE_INFO.facebookUrl}" target="_blank" class="btn btn-facebook">
            <i class="bi bi-facebook"></i> Nhắn tin Facebook Page để thợ chốt mẫu ngay
          </a>
          <a href="tel:${STORE_INFO.phone.replace(/\s+/g, '')}" class="btn btn-outline">
            <i class="bi bi-telephone-fill"></i> Gọi hotline tiệm: ${STORE_INFO.hotlineFormatted}
          </a>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeSuccessModal() {
    const modal = document.getElementById("customSuccessModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  openMyRequests() {
    const requests = JSON.parse(localStorage.getItem("douple_custom_requests") || "[]");
    const modal = document.getElementById("customHistoryModal");
    const list = document.getElementById("customHistoryList");

    if (!modal || !list) return;

    if (requests.length === 0) {
      list.innerHTML = `
        <div class="empty-history-state">
          <i class="bi bi-palette"></i>
          <h4>Bạn chưa có yêu cầu thiết kế hoa nào</h4>
          <p>Hãy gửi ý tưởng của bạn, thợ thủ công của Douple Flower sẽ biến nó thành bó hoa kẽm nhung xinh xắn nhất!</p>
          <button class="btn btn-primary" onclick="CustomOrderManager.closeMyRequests(); scrollToSection('customOrderSection');">Tạo yêu cầu làm theo mẫu</button>
        </div>
      `;
    } else {
      list.innerHTML = requests.map(r => `
        <div class="custom-req-card">
          <div class="req-header">
            <div>
              <span class="req-id">Mã: <strong>${r.id}</strong></span>
              <small class="req-date">${new Date(r.createdAt).toLocaleString("vi-VN")}</small>
            </div>
            <span class="badge badge-warning">${r.status}</span>
          </div>
          <div class="req-body">
            <div><strong>Hoa:</strong> ${r.flowerType} (${r.colorTheme})</div>
            <div>${r.packaging ? `<strong>Kiểu gói:</strong> ${r.packaging} · ` : ""}<strong>Ngân sách:</strong> ${r.budget}</div>
            ${r.notes ? `<div class="italic text-muted">"${r.notes}"</div>` : ""}
          </div>
          <div class="req-footer">
            <a href="${STORE_INFO.facebookUrl}" target="_blank" class="btn btn-sm btn-outline"><i class="bi bi-chat-dots"></i> Nhắn Fanpage theo dõi</a>
          </div>
        </div>
      `).join("");
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeMyRequests() {
    const modal = document.getElementById("customHistoryModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  resetForm() {
    this.removeUploadedImage();
    const notesInput = document.getElementById("customNotes");
    const dateInput = document.getElementById("customDeliveryDate");
    if (notesInput) notesInput.value = "";
    if (dateInput) dateInput.value = "";
  },

  bindEvents() {
    // Tải ảnh lên
    const imageInput = document.getElementById("customImageInput");
    if (imageInput) {
      imageInput.addEventListener("change", (e) => this.handleImageUpload(e));
    }

    // Xoá ảnh tải lên
    const removeImgBtn = document.getElementById("removeCustomImageBtn");
    if (removeImgBtn) {
      removeImgBtn.addEventListener("click", () => this.removeUploadedImage());
    }

    // Nút Gửi yêu cầu
    const submitBtn = document.getElementById("submitCustomOrderBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.submitCustomOrder());
    }

    // Đóng modals
    const closeSuccessBtn = document.getElementById("closeCustomSuccessModal");
    const successOverlay = document.getElementById("customSuccessOverlay");
    if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", () => this.closeSuccessModal());
    if (successOverlay) successOverlay.addEventListener("click", () => this.closeSuccessModal());

    const closeHistoryBtn = document.getElementById("closeCustomHistoryModal");
    const historyOverlay = document.getElementById("customHistoryOverlay");
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => this.closeMyRequests());
    if (historyOverlay) historyOverlay.addEventListener("click", () => this.closeMyRequests());

    // Highlight radio cards on change
    document.addEventListener("change", (e) => {
      if (e.target.name === "customFlowerType") {
        document.querySelectorAll(`input[name="${e.target.name}"]`).forEach(inp => {
          inp.closest(".custom-pill-option")?.classList.toggle("selected", inp.checked);
        });
      }
      if (e.target.name === "customColorTheme") {
        document.querySelectorAll(`input[name="customColorTheme"]`).forEach(inp => {
          inp.closest(".custom-color-chip")?.classList.toggle("selected", inp.checked);
        });
      }
      if (e.target.name === "customAccessories") {
        e.target.closest(".custom-checkbox-option")?.classList.toggle("checked", e.target.checked);
      }
    });
  }
};
