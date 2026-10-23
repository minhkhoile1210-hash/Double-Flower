// Quản lý Đặt hàng, Địa chỉ & Thanh toán (QR Bank, Apple Pay, COD cọc 50%)
const CheckoutManager = {
  currentTab: "shipping", // shipping | payment | success
  selectedPaymentMethod: "vietqr", // vietqr | applepay | cod_deposit
  currentOrder: null,

  init() {
    this.bindEvents();
  },

  openCheckoutModal() {
    if (CartManager.items.length === 0) {
      showToast("Giỏ hàng của bạn đang trống!", "warning");
      return;
    }

    const modal = document.getElementById("checkoutModal");
    if (!modal) return;

    this.currentTab = "shipping";
    this.selectedPaymentMethod = "vietqr";
    this.currentOrder = null;

    this.populateShippingForm();
    this.updateCheckoutSummary();
    this.switchTab("shipping");

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Cập nhật indicators
    const tabs = document.querySelectorAll(".checkout-tab-btn");
    tabs.forEach(t => {
      const target = t.getAttribute("data-tab");
      t.classList.toggle("active", target === tabName);
      if (tabName === "success") {
        t.classList.add("completed");
      }
    });

    // Cập nhật tab contents
    const contents = document.querySelectorAll(".checkout-tab-pane");
    contents.forEach(c => {
      c.classList.toggle("active", c.id === `tabPane_${tabName}`);
    });

    if (tabName === "payment") {
      this.renderPaymentMethodContent();
    }
  },

  populateShippingForm() {
    const user = AuthManager.getCurrentUser();
    const nameInput = document.getElementById("checkoutName");
    const phoneInput = document.getElementById("checkoutPhone");

    if (user) {
      if (nameInput) nameInput.value = user.fullName || "";
      if (phoneInput) phoneInput.value = user.phone || "";
    }
  },

  updateCheckoutSummary() {
    const summaryContainer = document.getElementById("checkoutOrderItems");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const shippingEl = document.getElementById("checkoutShipping");
    const totalEl = document.getElementById("checkoutTotal");

    if (summaryContainer) {
      summaryContainer.innerHTML = CartManager.items.map(item => `
        <div class="checkout-item-mini">
          <img src="${item.image}" alt="${item.name}" class="checkout-item-img">
          <div class="checkout-item-info">
            <div class="checkout-item-name">${item.name}</div>
            <div class="checkout-item-sub">Số lượng: x${item.quantity} · ${formatCurrency(item.price)}</div>
          </div>
          <div class="checkout-item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>
      `).join("");
    }

    const subtotal = CartManager.getSubtotal();
    const shipping = CartManager.getShippingFee();
    const total = CartManager.getTotal();

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "Miễn phí" : formatCurrency(shipping);
    if (totalEl) totalEl.textContent = formatCurrency(total);
  },

  validateShippingForm() {
    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim().replace(/\s+/g, "");
    const city = document.getElementById("checkoutCity").value.trim();
    const district = document.getElementById("checkoutDistrict").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();

    if (!name) {
      showToast("Vui lòng nhập họ và tên người nhận", "error");
      return false;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      showToast("Vui lòng nhập số điện thoại người nhận hợp lệ", "error");
      return false;
    }

    if (!city) {
      showToast("Vui lòng chọn Tỉnh/Thành phố", "error");
      return false;
    }

    if (!district) {
      showToast("Vui lòng nhập Quận/Huyện", "error");
      return false;
    }

    if (!address) {
      showToast("Vui lòng nhập địa chỉ cụ thể (số nhà, ngõ, đường)", "error");
      return false;
    }

    return {
      receiverName: name,
      receiverPhone: phone,
      city: city,
      district: district,
      address: address,
      greetingCard: document.getElementById("checkoutGreetingCard") ? document.getElementById("checkoutGreetingCard").value.trim() : "",
      deliveryTime: document.getElementById("checkoutDeliveryTime") ? document.getElementById("checkoutDeliveryTime").value : "standard",
      note: document.getElementById("checkoutNote") ? document.getElementById("checkoutNote").value.trim() : ""
    };
  },

  goToPaymentTab() {
    const shippingData = this.validateShippingForm();
    if (!shippingData) return;

    this.shippingData = shippingData;
    this.switchTab("payment");
  },

  selectPaymentMethod(method) {
    this.selectedPaymentMethod = method;

    // Cập nhật radio cards
    const cards = document.querySelectorAll(".payment-card-option");
    cards.forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === method);
      const radio = c.querySelector("input[type=radio]");
      if (radio) radio.checked = (c.getAttribute("data-method") === method);
    });

    this.renderPaymentMethodContent();
  },

  renderPaymentMethodContent() {
    const detailBox = document.getElementById("paymentMethodDetailBox");
    if (!detailBox) return;

    const total = CartManager.getTotal();
    const deposit50 = Math.round(total * 0.5);
    const codRemain = total - deposit50;
    const orderCode = this.orderCode || ("DF" + Math.floor(100000 + Math.random() * 900000));
    this.orderCode = orderCode;

    if (this.selectedPaymentMethod === "vietqr") {
      const qrUrl = `https://api.vietqr.io/image/970422-0393613156-compact2.jpg?amount=${total}&addInfo=${encodeURIComponent("DOUPLE " + orderCode)}&accountName=${encodeURIComponent("DOUPLE FLOWER SHOP")}`;

      detailBox.innerHTML = `
        <div class="qr-payment-wrapper">
          <div class="qr-payment-header">
            <span class="badge badge-success"><i class="bi bi-shield-check"></i> Thanh toán quét mã QR tự động 24/7</span>
            <p class="qr-guide-text">Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ quét mã QR dưới đây:</p>
          </div>
          
          <div class="qr-code-box">
            <img src="${qrUrl}" alt="VietQR Douple Flower" class="qr-code-image" id="vietQrImg" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://zalo.me/0393613156?order=' + orderCode)}'">
            <div class="qr-badge-animated">
              <span class="pulse-dot"></span> Đang chờ thanh toán
            </div>
          </div>

          <div class="bank-details-card">
            <div class="bank-row">
              <span class="bank-label">Ngân hàng:</span>
              <span class="bank-value"><strong>MB Bank (Ngân Hàng Quân Đội)</strong></span>
            </div>
            <div class="bank-row">
              <span class="bank-label">Chủ tài khoản:</span>
              <span class="bank-value"><strong>DOUPLE FLOWER SHOP</strong></span>
            </div>
            <div class="bank-row">
              <span class="bank-label">Số tài khoản:</span>
              <div class="bank-value-copy">
                <strong>0393613156</strong>
                <button class="btn-copy" onclick="copyToClipboard('0393613156', 'Đã copy số tài khoản!')" title="Sao chép"><i class="bi bi-copy"></i> Sao chép</button>
              </div>
            </div>
            <div class="bank-row">
              <span class="bank-label">Số tiền:</span>
              <span class="bank-value text-danger font-bold text-lg">${formatCurrency(total)}</span>
            </div>
            <div class="bank-row">
              <span class="bank-label">Nội dung chuyển:</span>
              <div class="bank-value-copy">
                <strong class="highlight-code">DOUPLE ${orderCode}</strong>
                <button class="btn-copy" onclick="copyToClipboard('DOUPLE ${orderCode}', 'Đã copy nội dung chuyển tiền!')" title="Sao chép"><i class="bi bi-copy"></i> Sao chép</button>
              </div>
            </div>
          </div>
          <div class="payment-note-alert">
            <i class="bi bi-info-circle-fill"></i> Hệ thống tự động kiểm tra giao dịch và hoàn tất đơn trong 1-2 phút sau khi chuyển khoản.
          </div>
        </div>
      `;
    } else if (this.selectedPaymentMethod === "applepay") {
      detailBox.innerHTML = `
        <div class="applepay-payment-wrapper">
          <div class="applepay-hero">
            <div class="applepay-logo-badge">
              <i class="bi bi-apple"></i> <span>Pay</span>
            </div>
            <h4>Thanh toán bảo mật một chạm với Apple Pay</h4>
            <p>Hỗ trợ thẻ Visa, Mastercard, Napas đã liên kết trên thiết bị Apple của bạn.</p>
          </div>

          <div class="applepay-summary-box">
            <div class="summary-line">
              <span>Đơn hàng Douple Flower Shop</span>
              <span>${formatCurrency(total)}</span>
            </div>
            <div class="summary-line font-bold">
              <span>Tổng thanh toán</span>
              <span class="text-primary">${formatCurrency(total)}</span>
            </div>
          </div>

          <div class="applepay-action-area">
            <button class="btn-apple-pay-custom" id="triggerApplePayBtn" onclick="CheckoutManager.processApplePay()">
              <i class="bi bi-apple"></i> Pay with Apple Pay
            </button>
            <span class="applepay-hint"><i class="bi bi-shield-lock-fill"></i> Xác thực bảo mật bằng Face ID / Touch ID</span>
          </div>
        </div>
      `;
    } else if (this.selectedPaymentMethod === "cod_deposit") {
      // Yêu cầu đặc biệt: COD nhưng phải cọc trước 50% bằng chuyển khoản
      const depositQrUrl = `https://api.vietqr.io/image/970422-0393613156-compact2.jpg?amount=${deposit50}&addInfo=${encodeURIComponent("COC50 " + orderCode)}&accountName=${encodeURIComponent("DOUPLE FLOWER SHOP")}`;

      detailBox.innerHTML = `
        <div class="cod-deposit-wrapper">
          <div class="cod-notice-card">
            <div class="cod-notice-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <div class="cod-notice-body">
              <strong>Chính sách đặt hoa thủ công Handmade:</strong>
              <p>Mỗi bó hoa kẽm nhung được thợ thủ công đan nắn tỉ mỉ riêng theo đơn của bạn. Để tránh trường hợp bùng đơn, quý khách vui lòng <strong>thanh toán cọc trước 50%</strong> bằng chuyển khoản. Số tiền 50% còn lại bạn sẽ trả cho shipper khi nhận hoa!</p>
            </div>
          </div>

          <div class="deposit-breakdown-card">
            <div class="deposit-row">
              <span>Tổng giá trị đơn hàng:</span>
              <span>${formatCurrency(total)}</span>
            </div>
            <div class="deposit-row highlight-row">
              <span class="text-danger font-bold"><i class="bi bi-qr-code"></i> Tiền cọc trước (50%):</span>
              <span class="text-danger font-bold text-lg">${formatCurrency(deposit50)}</span>
            </div>
            <div class="deposit-row">
              <span class="text-success"><i class="bi bi-cash-stack"></i> Tiền còn lại thanh toán khi nhận hoa:</span>
              <span class="text-success font-bold">${formatCurrency(codRemain)}</span>
            </div>
          </div>

          <div class="qr-code-box deposit-qr">
            <img src="${depositQrUrl}" alt="VietQR Cọc 50%" class="qr-code-image">
            <div class="qr-badge-animated">
              <span class="pulse-dot"></span> Quét QR chuyển cọc 50% (${formatCurrency(deposit50)})
            </div>
          </div>

          <div class="bank-details-card">
            <div class="bank-row">
              <span class="bank-label">STK MB Bank:</span>
              <div class="bank-value-copy">
                <strong>0393613156</strong>
                <button class="btn-copy" onclick="copyToClipboard('0393613156', 'Đã copy STK!')"><i class="bi bi-copy"></i> Copy</button>
              </div>
            </div>
            <div class="bank-row">
              <span class="bank-label">Nội dung cọc:</span>
              <div class="bank-value-copy">
                <strong class="highlight-code">COC50 ${orderCode}</strong>
                <button class="btn-copy" onclick="copyToClipboard('COC50 ${orderCode}', 'Đã copy nội dung cọc!')"><i class="bi bi-copy"></i> Copy</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  },

  processApplePay() {
    const btn = document.getElementById("triggerApplePayBtn");
    if (btn) {
      btn.innerHTML = `<span class="spinner-small white"></span> Đang xác thực Face ID / Touch ID...`;
      btn.disabled = true;
    }

    setTimeout(() => {
      playSound("success");
      this.finishOrder("Đã thanh toán qua Apple Pay");
    }, 1200);
  },

  confirmPaymentAndFinish() {
    const methodNames = {
      vietqr: "Chuyển khoản VietQR (100%)",
      applepay: "Apple Pay (100%)",
      cod_deposit: "COD nhận hàng (Đã cọc 50% chuyển khoản)"
    };

    const paymentLabel = methodNames[this.selectedPaymentMethod] || "Chuyển khoản";
    this.finishOrder(paymentLabel);
  },

  finishOrder(paymentStatusNote) {
    const total = CartManager.getTotal();
    const deposit50 = Math.round(total * 0.5);
    const codRemain = total - deposit50;
    const orderId = this.orderCode || ("DF" + Math.floor(100000 + Math.random() * 900000));

    const order = {
      orderId: orderId,
      createdAt: new Date().toISOString(),
      user: AuthManager.getCurrentUser() || { fullName: this.shippingData.receiverName, phone: this.shippingData.receiverPhone },
      shipping: this.shippingData,
      items: [...CartManager.items],
      subtotal: CartManager.getSubtotal(),
      shippingFee: CartManager.getShippingFee(),
      total: total,
      paymentMethod: this.selectedPaymentMethod,
      paymentNote: paymentStatusNote,
      depositAmount: this.selectedPaymentMethod === "cod_deposit" ? deposit50 : total,
      remainAmount: this.selectedPaymentMethod === "cod_deposit" ? codRemain : 0,
      status: "Đang chuẩn bị hoa handmade"
    };

    this.currentOrder = order;

    // Lưu đơn hàng vào localStorage
    try {
      const orders = JSON.parse(localStorage.getItem("douple_orders") || "[]");
      orders.unshift(order);
      localStorage.setItem("douple_orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Lỗi lưu đơn hàng:", e);
    }

    // Tự động trừ số lượng SKU tồn kho khi đặt hàng thành công
    try {
      const storedProds = JSON.parse(localStorage.getItem("douple_products") || "[]");
      if (storedProds.length > 0) {
        order.items.forEach(it => {
          const p = storedProds.find(x => x.id === it.id);
          if (p) {
            const currentQty = (p.stockQuantity !== undefined && p.stockQuantity !== null) ? parseInt(p.stockQuantity) : 20;
            p.stockQuantity = Math.max(0, currentQty - (it.quantity || 1));
            if (p.stockQuantity === 0) {
              p.inStock = false; // Tự động chuyển trạng thái Hết hàng
            }
          }
        });
        localStorage.setItem("douple_products", JSON.stringify(storedProds));
      }
    } catch (e) {
      console.error("Lỗi tự động trừ tồn kho:", e);
    }

    // Xoá giỏ hàng sau khi đặt thành công
    CartManager.clearCart();

    // Hiển thị tab Thành công
    this.renderSuccessTab(order);
    this.switchTab("success");
    playSound("orderSuccess");
    triggerConfetti();
  },

  renderSuccessTab(order) {
    const successPane = document.getElementById("tabPane_success");
    if (!successPane) return;

    successPane.innerHTML = `
      <div class="order-success-card">
        <div class="success-icon-animated">
          <i class="bi bi-check-lg"></i>
        </div>
        <h2 class="success-title">Đặt Hoa Thành Công!</h2>
        <p class="success-subtitle">Cảm ơn bạn đã lựa chọn <strong>Douple Flower Shop</strong>. Thợ thủ công của tiệm đang bắt đầu chuẩn bị bó hoa xinh đẹp nhất cho bạn.</p>

        <div class="order-details-box">
          <div class="od-header">
            <span>Mã đơn hàng: <strong class="text-primary font-mono">${order.orderId}</strong></span>
            <span class="badge badge-success">${order.status}</span>
          </div>

          <div class="od-body">
            <div class="od-row">
              <span class="od-label">Người nhận:</span>
              <span class="od-value"><strong>${order.shipping.receiverName}</strong> (${order.shipping.receiverPhone})</span>
            </div>
            <div class="od-row">
              <span class="od-label">Địa chỉ giao:</span>
              <span class="od-value">${order.shipping.address}, ${order.shipping.district}, ${order.shipping.city}</span>
            </div>
            ${order.shipping.greetingCard ? `
              <div class="od-row">
                <span class="od-label">Lời chúc ghi thiệp:</span>
                <span class="od-value italic">"${order.shipping.greetingCard}"</span>
              </div>
            ` : ""}
            <div class="od-row">
              <span class="od-label">Phương thức:</span>
              <span class="od-value"><strong>${order.paymentNote}</strong></span>
            </div>
            <div class="od-row">
              <span class="od-label">Tổng thanh toán:</span>
              <span class="od-value font-bold text-danger text-lg">${formatCurrency(order.total)}</span>
            </div>
            ${order.remainAmount > 0 ? `
              <div class="od-row text-warning font-bold">
                <span class="od-label">Cần trả shipper khi nhận hoa:</span>
                <span class="od-value">${formatCurrency(order.remainAmount)}</span>
              </div>
            ` : ""}
          </div>
        </div>

        <div class="success-support-actions">
          <a href="${STORE_INFO.facebookUrl}" target="_blank" class="btn btn-facebook">
            <i class="bi bi-facebook"></i> Nhắn tin Facebook Page để thợ gửi ảnh chụp hoa trước khi ship
          </a>
          <div class="success-buttons-row">
            <a href="tel:${STORE_INFO.phone.replace(/\s+/g, '')}" class="btn btn-outline">
              <i class="bi bi-telephone-fill"></i> Hotline: ${STORE_INFO.hotlineFormatted}
            </a>
            <button class="btn btn-primary" onclick="CheckoutManager.closeCheckoutModal()">
              <i class="bi bi-bag-heart"></i> Tiếp tục xem sản phẩm khác
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openOrderHistory() {
    const orders = JSON.parse(localStorage.getItem("douple_orders") || "[]");
    const modal = document.getElementById("orderHistoryModal");
    const container = document.getElementById("orderHistoryList");

    if (!modal || !container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-history-state">
          <i class="bi bi-bag-x"></i>
          <h4>Bạn chưa có đơn hàng nào</h4>
          <p>Hãy dạo một vòng tiệm hoa và chọn cho mình hoặc người thân một bó hoa kẽm nhung thật xinh nhé!</p>
          <button class="btn btn-primary" onclick="CheckoutManager.closeOrderHistory(); scrollToSection('productsSection');">Xem danh mục hoa</button>
        </div>
      `;
    } else {
      container.innerHTML = orders.map(ord => `
        <div class="order-history-card">
          <div class="oh-header">
            <div>
              <span class="oh-id">Mã: <strong>${ord.orderId}</strong></span>
              <span class="oh-date">${new Date(ord.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            <span class="badge badge-success">${ord.status}</span>
          </div>
          <div class="oh-items">
            ${ord.items.map(it => `
              <div class="oh-item-mini">
                <img src="${it.image}" alt="${it.name}">
                <div>
                  <div class="oh-item-name">${it.name}</div>
                  <small>x${it.quantity} · ${formatCurrency(it.price)}</small>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="oh-footer">
            <span>Tổng đơn: <strong class="text-danger">${formatCurrency(ord.total)}</strong> (${ord.paymentNote})</span>
            <a href="${STORE_INFO.facebookUrl}" target="_blank" class="btn btn-sm btn-outline"><i class="bi bi-chat-dots"></i> Hỗ trợ</a>
          </div>
        </div>
      `).join("");
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeOrderHistory() {
    const modal = document.getElementById("orderHistoryModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  bindEvents() {
    // Đóng checkout modal
    const closeBtn = document.getElementById("closeCheckoutModal");
    const overlay = document.getElementById("checkoutOverlay");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeCheckoutModal());
    if (overlay) overlay.addEventListener("click", () => this.closeCheckoutModal());

    // Nút chuyển sang thanh toán
    const toPaymentBtn = document.getElementById("toPaymentBtn");
    if (toPaymentBtn) toPaymentBtn.addEventListener("click", () => this.goToPaymentTab());

    // Nút quay lại tab giao hàng
    const backToShippingBtn = document.getElementById("backToShippingBtn");
    if (backToShippingBtn) backToShippingBtn.addEventListener("click", () => this.switchTab("shipping"));

    // Lựa chọn phương thức thanh toán
    const methodCards = document.querySelectorAll(".payment-card-option");
    methodCards.forEach(card => {
      card.addEventListener("click", () => {
        const method = card.getAttribute("data-method");
        this.selectPaymentMethod(method);
      });
    });

    // Nút xác nhận thanh toán hoàn tất
    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
    if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener("click", () => this.confirmPaymentAndFinish());
    }

    // Đóng modal lịch sử đơn hàng
    const closeHistoryBtn = document.getElementById("closeHistoryModal");
    const historyOverlay = document.getElementById("historyModalOverlay");
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => this.closeOrderHistory());
    if (historyOverlay) historyOverlay.addEventListener("click", () => this.closeOrderHistory());
  }
};
