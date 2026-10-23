// Quản lý giỏ hàng Douple Flower Shop
const CartManager = {
  items: [],

  init() {
    this.loadCartFromStorage();
    this.bindEvents();
    this.updateCartUI();
  },

  loadCartFromStorage() {
    try {
      const stored = localStorage.getItem("douple_cart");
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Lỗi đọc giỏ hàng:", e);
      this.items = [];
    }
  },

  saveCartToStorage() {
    localStorage.setItem("douple_cart", JSON.stringify(this.items));
    this.updateCartUI();
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.items }));
  },

  addItem(productId, quantity = 1, options = {}) {
    const products = (typeof getActiveProducts === "function") ? getActiveProducts() : PRODUCTS_DATA;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      showToast(`Mẫu hoa "${product.name}" hiện đã tạm hết hàng!`, "error");
      return;
    }

    const existingIndex = this.items.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.categoryName,
        quantity: quantity,
        note: options.note || ""
      });
    }

    this.saveCartToStorage();
    this.openCartDrawer();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
    playSound("addCart");
  },

  buyNow(productId) {
    const products = (typeof getActiveProducts === "function") ? getActiveProducts() : PRODUCTS_DATA;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0)) {
      showToast(`Mẫu hoa "${product.name}" hiện đã tạm hết hàng!`, "error");
      return;
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa, nếu chưa thì thêm vào
    const existing = this.items.find(item => item.id === productId);
    if (!existing) {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.categoryName,
        quantity: 1,
        note: ""
      });
      this.saveCartToStorage();
    }

    // Yêu cầu đăng nhập trước nếu chưa có tài khoản
    if (!AuthManager.isLoggedIn()) {
      showToast("Vui lòng đăng nhập họ tên và SĐT để tiếp tục đặt hoa", "info");
      AuthManager.openLoginModal(() => {
        CheckoutManager.openCheckoutModal();
      });
    } else {
      CheckoutManager.openCheckoutModal();
    }
  },

  updateQuantity(productId, newQty) {
    newQty = parseInt(newQty);
    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(i => i.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCartToStorage();
    }
  },

  removeItem(productId) {
    const item = this.items.find(i => i.id === productId);
    const itemName = item ? item.name : "sản phẩm";
    this.items = this.items.filter(i => i.id !== productId);
    this.saveCartToStorage();
    showToast(`Đã xoá ${itemName} khỏi giỏ hàng`, "info");
  },

  clearCart() {
    this.items = [];
    this.saveCartToStorage();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= STORE_INFO.freeShippingThreshold ? 0 : STORE_INFO.shippingFee;
  },

  getTotal() {
    return this.getSubtotal() + this.getShippingFee();
  },

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  openCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer && overlay) {
      drawer.classList.add("open");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer && overlay) {
      drawer.classList.remove("open");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  updateCartUI() {
    // Badges
    const count = this.getTotalCount();
    const badges = document.querySelectorAll(".cart-badge-count");
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? "inline-flex" : "none";
    });

    // Render Drawer Content
    const cartContainer = document.getElementById("cartItemsContainer");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const cartShippingEl = document.getElementById("cartShipping");
    const cartTotalEl = document.getElementById("cartTotal");
    const cartEmptyState = document.getElementById("cartEmptyState");
    const cartFooter = document.getElementById("cartFooter");

    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = "";
      if (cartEmptyState) cartEmptyState.style.display = "flex";
      if (cartFooter) cartFooter.style.display = "none";
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = "none";
    if (cartFooter) cartFooter.style.display = "block";

    cartContainer.innerHTML = this.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-category">${item.categoryName}</div>
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">${formatCurrency(item.price)}</div>
          
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="CartManager.removeItem('${item.id}')" title="Xoá">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    const subtotal = this.getSubtotal();
    const shipping = this.getShippingFee();
    const total = this.getTotal();

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(subtotal);
    if (cartShippingEl) {
      cartShippingEl.textContent = shipping === 0 ? "Miễn phí" : formatCurrency(shipping);
      cartShippingEl.className = shipping === 0 ? "text-success font-bold" : "";
    }
    if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);
  },

  bindEvents() {
    // Drawer buttons
    const cartOpenBtns = document.querySelectorAll(".open-cart-btn");
    cartOpenBtns.forEach(btn => btn.addEventListener("click", () => this.openCartDrawer()));

    const cartCloseBtn = document.getElementById("closeCartBtn");
    const cartOverlay = document.getElementById("cartOverlay");
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", () => this.closeCartDrawer());
    if (cartOverlay) cartOverlay.addEventListener("click", () => this.closeCartDrawer());

    // Nút chuyển sang thanh toán từ Drawer
    const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener("click", () => {
        this.closeCartDrawer();
        if (!AuthManager.isLoggedIn()) {
          showToast("Vui lòng đăng nhập họ tên và SĐT để đặt hàng", "info");
          AuthManager.openLoginModal(() => {
            CheckoutManager.openCheckoutModal();
          });
        } else {
          CheckoutManager.openCheckoutModal();
        }
      });
    }
  }
};
