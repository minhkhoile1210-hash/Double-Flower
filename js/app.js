// Douple Flower Shop - Ứng dụng chính & Tương tác giao diện
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  currentCategory: "all",
  searchQuery: "",

  init() {
    this.renderCategories();
    this.renderProducts();
    this.bindEvents();

    // Khởi tạo các module
    AuthManager.init();
    CartManager.init();
    CheckoutManager.init();
    CustomOrderManager.init();
    ChatbotManager.init();

    // Khởi tạo audio context
    initAudio();

    // Đồng bộ tức thời khi admin thay đổi trạng thái kho hàng / thêm mẫu hoa mới
    window.addEventListener("storage", (e) => {
      if (e.key === "douple_products") {
        this.renderCategories();
        this.renderProducts();
      }
    });
  },

  renderCategories() {
    const container = document.getElementById("categoryFiltersList");
    if (!container) return;

    // Lấy danh mục mặc định và tự động bổ sung danh mục mới do Admin tự ghi
    const prods = (typeof getActiveProducts === "function") ? getActiveProducts() : PRODUCTS_DATA;
    const cats = [];
    const seen = new Set();

    CATEGORIES.forEach(c => {
      seen.add(c.id);
      cats.push(c);
    });

    prods.forEach(p => {
      if (p.category && !seen.has(p.category) && p.categoryName) {
        seen.add(p.category);
        cats.push({
          id: p.category,
          name: p.categoryName,
          icon: "bi-flower1"
        });
      }
    });

    container.innerHTML = cats.map(cat => `
      <button class="filter-tab-btn ${cat.id === this.currentCategory ? 'active' : ''}" data-category="${cat.id}">
        <i class="bi ${cat.icon}"></i>
        <span>${cat.name}</span>
      </button>
    `).join("");

    // Gắn sự kiện click danh mục
    container.querySelectorAll(".filter-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentCategory = btn.getAttribute("data-category");
        this.renderProducts();
      });
    });
  },

  renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    let filtered = (typeof getActiveProducts === "function") ? getActiveProducts() : PRODUCTS_DATA;

    if (this.currentCategory !== "all") {
      filtered = filtered.filter(p => p.category === this.currentCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-products-state">
          <i class="bi bi-search"></i>
          <h3>Không tìm thấy mẫu hoa phù hợp</h3>
          <p>Bạn có thể thử tìm kiếm từ khoá khác hoặc gửi mẫu riêng cho tiệm tại mục "Làm theo yêu cầu" nhé!</p>
          <button class="btn btn-outline" onclick="App.resetFilters()">Xem tất cả sản phẩm</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const isAvailable = p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0);
      const stockQty = p.stockQuantity !== undefined ? p.stockQuantity : 10;

      let stockStatusHtml = "";
      if (!isAvailable) {
        stockStatusHtml = `<span class="stock-status-pill out-of-stock"><i class="bi bi-x-circle-fill"></i> Tạm hết hàng</span>`;
      } else if (stockQty <= 3) {
        stockStatusHtml = `<span class="stock-status-pill low-stock"><i class="bi bi-exclamation-circle-fill"></i> Chỉ còn ${stockQty} bó</span>`;
      } else {
        stockStatusHtml = `<span class="stock-status-pill in-stock"><i class="bi bi-check-circle-fill"></i> Còn hàng (${stockQty} bó)</span>`;
      }

      const badgeHtml = !isAvailable 
        ? `<span class="product-badge badge-sold-out">Hết hàng</span>` 
        : (p.badge ? `<span class="product-badge">${p.badge}</span>` : "");

      const actionsHtml = isAvailable ? `
        <button class="btn btn-outline btn-cart-add" onclick="CartManager.addItem('${p.id}')" title="Thêm vào giỏ">
          <i class="bi bi-bag-plus"></i> Thêm giỏ
        </button>
        <button class="btn btn-primary btn-buy-now" onclick="CartManager.buyNow('${p.id}')">
          <i class="bi bi-lightning-charge-fill"></i> Mua ngay
        </button>
      ` : `
        <button class="btn btn-out-of-stock" disabled>
          <i class="bi bi-slash-circle"></i> Tạm hết hàng
        </button>
      `;

      return `
        <div class="product-card ${!isAvailable ? 'out-of-stock' : ''}" data-id="${p.id}">
          <div class="product-card-media">
            <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
            ${badgeHtml}
            <div class="product-card-overlay">
              <button class="btn-quickview" onclick="App.openQuickView('${p.id}')" title="Xem nhanh">
                <i class="bi bi-eye"></i> Xem chi tiết
              </button>
            </div>
          </div>

          <div class="product-card-body">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span class="product-cat-tag">${p.categoryName || 'Hoa kẽm nhung'}</span>
              ${p.sku ? `<span class="product-sku-tag" title="Mã SKU">${p.sku}</span>` : ""}
            </div>
            <h3 class="product-title" onclick="App.openQuickView('${p.id}')">${p.name}</h3>
            
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="rating-val">${(p.rating || 5).toFixed(1)}</span>
              <span class="reviews-count">(${p.reviewsCount || 0})</span>
            </div>

            ${stockStatusHtml}

            <div class="product-price-row">
              <div class="price-box">
                <span class="current-price">${formatCurrency(p.price)}</span>
                ${p.originalPrice && p.originalPrice > p.price ? `<span class="original-price">${formatCurrency(p.originalPrice)}</span>` : ""}
              </div>
            </div>

            <div class="product-card-actions">
              ${actionsHtml}
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  resetFilters() {
    this.currentCategory = "all";
    this.searchQuery = "";
    const searchInput = document.getElementById("productSearchInput");
    if (searchInput) searchInput.value = "";
    this.renderCategories();
    this.renderProducts();
  },

  openQuickView(productId) {
    const products = (typeof getActiveProducts === "function") ? getActiveProducts() : PRODUCTS_DATA;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("quickViewModal");
    const body = document.getElementById("quickViewModalBody");
    if (!modal || !body) return;

    const isAvailable = product.inStock !== false && (product.stockQuantity === undefined || product.stockQuantity > 0);
    const stockQty = product.stockQuantity !== undefined ? product.stockQuantity : 10;

    let stockBadgeHtml = "";
    if (!isAvailable) {
      stockBadgeHtml = `<span class="badge" style="background:#dc2626; color:#fff;"><i class="bi bi-slash-circle"></i> Tạm hết hàng</span>`;
    } else if (stockQty <= 3) {
      stockBadgeHtml = `<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;"><i class="bi bi-exclamation-triangle"></i> Sắp hết: Còn ${stockQty} bó</span>`;
    } else {
      stockBadgeHtml = `<span class="badge badge-success"><i class="bi bi-check-circle"></i> Còn hàng (${stockQty} bó)</span>`;
    }

    const actionsHtml = isAvailable ? `
      <div class="qv-qty-box">
        <label>Số lượng:</label>
        <div class="qty-control">
          <button class="qty-btn" onclick="App.adjustQvQty(-1)">-</button>
          <span class="qty-value" id="qvQtyVal">1</span>
          <button class="qty-btn" onclick="App.adjustQvQty(1)">+</button>
        </div>
      </div>
      <div class="qv-btns-group">
        <button class="btn btn-outline" onclick="App.addCurrentQvToCart('${product.id}')">
          <i class="bi bi-bag-plus"></i> Thêm vào giỏ
        </button>
        <button class="btn btn-primary" onclick="App.buyCurrentQvNow('${product.id}')">
          <i class="bi bi-lightning-charge-fill"></i> Mua ngay
        </button>
      </div>
    ` : `
      <div class="qv-btns-group" style="width: 100%;">
        <button class="btn btn-outline" disabled style="width: 100%; background: #f1f5f9; color: #94a3b8; border-color: #cbd5e1; cursor: not-allowed;">
          <i class="bi bi-slash-circle"></i> Mẫu hoa này hiện đang tạm hết hàng
        </button>
      </div>
    `;

    body.innerHTML = `
      <div class="quickview-container">
        <div class="quickview-gallery">
          <img src="${product.image}" alt="${product.name}" class="quickview-main-img">
          <div class="quickview-trust-tags">
            <span><i class="bi bi-shield-check"></i> Hoa thủ công 100%</span>
            <span><i class="bi bi-infinity"></i> Độ bền vĩnh cửu</span>
            <span><i class="bi bi-gift"></i> Tặng thiệp & túi xinh</span>
          </div>
        </div>

        <div class="quickview-info">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span class="badge badge-primary">${product.categoryName || 'Hoa Handmade'}</span>
            ${product.sku ? `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-family:monospace; font-weight:700;">SKU: ${product.sku}</span>` : ""}
            ${stockBadgeHtml}
          </div>
          <h2 class="qv-title">${product.name}</h2>
          
          <div class="qv-rating-row">
            <span class="stars text-warning">★★★★★</span>
            <strong>${(product.rating || 5).toFixed(1)}</strong>
            <span class="text-muted">(${product.reviewsCount || 0} khách hàng hài lòng)</span>
          </div>

          <div class="qv-price-row">
            <span class="qv-current-price">${formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="qv-original-price">${formatCurrency(product.originalPrice)}</span>` : ""}
            ${product.originalPrice && product.originalPrice > product.price ? `<span class="discount-pill">Tiết kiệm ${formatCurrency(product.originalPrice - product.price)}</span>` : ""}
          </div>

          <p class="qv-description">${product.description || ''}</p>

          <div class="qv-features-list">
            <h4><i class="bi bi-stars"></i> Đặc điểm nổi bật:</h4>
            <ul>
              ${(product.features || ['Kẽm nhung cao cấp', 'Làm thủ công tỉ mỉ', 'Độ bền vĩnh cửu']).map(f => `<li><i class="bi bi-check-circle-fill text-success"></i> ${f}</li>`).join("")}
            </ul>
          </div>

          <div class="qv-actions-row">
            ${actionsHtml}
          </div>

          <div class="qv-support-note">
            <i class="bi bi-telephone"></i> Cần tư vấn đổi màu hoa theo ý thích? <a href="${STORE_INFO.facebookUrl}" target="_blank">Nhắn tin Fanpage</a> hoặc gọi <a href="tel:${STORE_INFO.phone.replace(/\s+/g, '')}">${STORE_INFO.hotlineFormatted}</a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  adjustQvQty(delta) {
    const qtyEl = document.getElementById("qvQtyVal");
    if (!qtyEl) return;
    let val = parseInt(qtyEl.textContent) + delta;
    if (val < 1) val = 1;
    qtyEl.textContent = val;
  },

  addCurrentQvToCart(productId) {
    const qtyEl = document.getElementById("qvQtyVal");
    const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
    CartManager.addItem(productId, qty);
    this.closeQuickView();
  },

  buyCurrentQvNow(productId) {
    const qtyEl = document.getElementById("qvQtyVal");
    const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
    this.closeQuickView();
    CartManager.addItem(productId, qty);
    
    if (!AuthManager.isLoggedIn()) {
      showToast("Vui lòng đăng nhập họ tên và SĐT để tiếp tục đặt hoa", "info");
      AuthManager.openLoginModal(() => {
        CheckoutManager.openCheckoutModal();
      });
    } else {
      CheckoutManager.openCheckoutModal();
    }
  },

  bindEvents() {
    // Tìm kiếm sản phẩm
    const searchInput = document.getElementById("productSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderProducts();
      });
    }

    // Đóng quick view
    const closeQvBtn = document.getElementById("closeQuickViewModal");
    const qvOverlay = document.getElementById("quickViewOverlay");
    if (closeQvBtn) closeQvBtn.addEventListener("click", () => this.closeQuickView());
    if (qvOverlay) qvOverlay.addEventListener("click", () => this.closeQuickView());

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("primaryNavLinks");
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
      });
    }

    // Scroll to top button
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    window.addEventListener("scroll", () => {
      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
      }
    });
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Đóng bất kỳ modal nào khi click vào nền mờ bên ngoài
    document.addEventListener("click", (e) => {
      if (e.target.classList && e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
};

// ================= Tiện ích chung =================

function switchBannerMode(mode) {
  const hdCard = document.getElementById("heroHdCard");
  const rasterCard = document.getElementById("heroRasterCard");
  const btnHd = document.getElementById("btnSwitchHdBanner");
  const btnRaster = document.getElementById("btnSwitchRasterBanner");

  if (mode === "hd") {
    if (hdCard) hdCard.style.display = "grid";
    if (rasterCard) rasterCard.classList.remove("active");
    if (btnHd) btnHd.classList.add("active");
    if (btnRaster) btnRaster.classList.remove("active");
  } else {
    if (hdCard) hdCard.style.display = "none";
    if (rasterCard) rasterCard.classList.add("active");
    if (btnHd) btnHd.classList.remove("active");
    if (btnRaster) btnRaster.classList.add("active");
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const navHeight = document.querySelector(".site-header")?.offsetHeight || 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function copyToClipboard(text, message = "Đã sao chép!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(message, "success");
    playSound("click");
  }).catch(() => {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast(message, "success");
  });
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill"
  };

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.info}"></i>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Web Audio API Synthesizer (tạo âm thanh nhẹ nhàng cho web mà không cần file MP3 ngoài)
let audioCtx = null;
function initAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    audioCtx = new AudioContext();
  }
}

function playSound(type) {
  try {
    if (!audioCtx) initAudio();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "addCart") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "orderSuccess") {
      // Chuông hợp âm chúc mừng
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.15, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.5);
      });
    } else if (type === "message") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (e) {
    // Âm thanh tuỳ chọn, bỏ qua nếu trình duyệt chặn
  }
}

// Confetti Cannon (Pháo hoa ăn mừng khi đặt hàng thành công)
function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confettiCanvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#E88D9C", "#F4B6C2", "#5A7865", "#D4A373", "#FCE38A", "#9AD0EC"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // trọng lực
      p.alpha -= 0.012;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();
}
