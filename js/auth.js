// Quản lý Đăng nhập / Đăng ký tài khoản khách hàng Douple Flower
const AuthManager = {
  currentUser: null,
  pendingAction: null, // Hành động chờ sau khi đăng nhập (ví dụ: mở checkout)

  init() {
    this.loadUserFromStorage();
    this.bindEvents();
    this.updateUserUI();
  },

  loadUserFromStorage() {
    try {
      const stored = localStorage.getItem("douple_user");
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Lỗi đọc tài khoản:", e);
      this.currentUser = null;
    }
  },

  saveUserToStorage(user) {
    this.currentUser = user;
    localStorage.setItem("douple_user", JSON.stringify(user));
    this.updateUserUI();
    window.dispatchEvent(new CustomEvent("userAuthChanged", { detail: user }));
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  getCurrentUser() {
    return this.currentUser;
  },

  // Mở modal đăng nhập, có thể truyền callback để thực hiện sau khi đăng nhập thành công
  openLoginModal(actionAfterLogin = null) {
    this.pendingAction = actionAfterLogin;
    const modal = document.getElementById("authModal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      const nameInput = document.getElementById("authFullName");
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    }
  },

  closeLoginModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  // Đăng nhập bằng Tên & Số điện thoại
  loginWithPhone(fullName, phoneNumber) {
    fullName = fullName.trim();
    phoneNumber = phoneNumber.trim().replace(/\s+/g, "");

    if (!fullName) {
      showToast("Vui lòng nhập Họ và tên của bạn", "error");
      return false;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
      showToast("Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số)", "error");
      return false;
    }

    const user = {
      id: "usr_" + Date.now(),
      fullName: fullName,
      phone: phoneNumber,
      email: `${phoneNumber}@doupleflower.customer`,
      loginMethod: "phone",
      avatar: this.generateAvatar(fullName),
      createdAt: new Date().toISOString()
    };

    this.saveUserToStorage(user);
    this.closeLoginModal();
    showToast(`Chào mừng bạn, ${user.fullName}! Đăng nhập thành công`, "success");

    // Thực hiện hành động chờ (như mở checkout)
    if (typeof this.pendingAction === "function") {
      const action = this.pendingAction;
      this.pendingAction = null;
      action(user);
    }
    return true;
  },

  // Đăng nhập bằng Google / Gmail
  loginWithGoogle() {
    // Hiển thị hiệu ứng loading kết nối Google
    const googleBtn = document.getElementById("googleAuthBtn");
    const originalText = googleBtn ? googleBtn.innerHTML : "";
    if (googleBtn) {
      googleBtn.innerHTML = `<span class="spinner-small"></span> Đang kết nối Google...`;
      googleBtn.disabled = true;
    }

    setTimeout(() => {
      // Mock Google OAuth profile hoặc lấy từ email đã lưu
      const googleMockProfiles = [
        { name: "Lê Minh Khôi", email: "leminhkhoi.handmade@gmail.com" },
        { name: "Khách hàng Douple", email: "customer@gmail.com" }
      ];
      const randomProfile = googleMockProfiles[0];

      const user = {
        id: "google_" + Date.now(),
        fullName: randomProfile.name,
        phone: "0393613156",
        email: randomProfile.email,
        loginMethod: "google",
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(randomProfile.name)}&backgroundColor=fbe8eb`,
        createdAt: new Date().toISOString()
      };

      this.saveUserToStorage(user);
      if (googleBtn) {
        googleBtn.innerHTML = originalText;
        googleBtn.disabled = false;
      }
      this.closeLoginModal();
      showToast(`Đăng nhập Google thành công! Chào ${user.fullName}`, "success");

      if (typeof this.pendingAction === "function") {
        const action = this.pendingAction;
        this.pendingAction = null;
        action(user);
      }
    }, 700);
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem("douple_user");
    this.updateUserUI();
    window.dispatchEvent(new CustomEvent("userAuthChanged", { detail: null }));
    showToast("Bạn đã đăng xuất tài khoản", "info");
  },

  generateAvatar(name) {
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map(n => n[0])
      .slice(-2)
      .join("")
      .toUpperCase();
    return initials || "DF";
  },

  updateUserUI() {
    const userBtn = document.getElementById("userHeaderBtn");
    const userText = document.getElementById("userHeaderText");
    const userAvatar = document.getElementById("userHeaderAvatar");

    if (!userBtn || !userText) return;

    if (this.currentUser) {
      userText.textContent = this.currentUser.fullName.split(" ").slice(-1)[0] || "Tài khoản";
      if (userAvatar) {
        if (this.currentUser.avatar.startsWith("http")) {
          userAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar" class="header-avatar-img">`;
        } else {
          userAvatar.innerHTML = `<span class="header-avatar-badge">${this.currentUser.avatar}</span>`;
        }
      }
      userBtn.classList.add("logged-in");
    } else {
      userText.textContent = "Đăng nhập";
      if (userAvatar) {
        userAvatar.innerHTML = `<i class="bi bi-person-circle"></i>`;
      }
      userBtn.classList.remove("logged-in");
    }
  },

  bindEvents() {
    // Form submit
    const authForm = document.getElementById("authPhoneForm");
    if (authForm) {
      authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fullName = document.getElementById("authFullName").value;
        const phone = document.getElementById("authPhone").value;
        this.loginWithPhone(fullName, phone);
      });
    }

    // Google button
    const googleBtn = document.getElementById("googleAuthBtn");
    if (googleBtn) {
      googleBtn.addEventListener("click", () => {
        this.loginWithGoogle();
      });
    }

    // Close button & overlay
    const closeBtn = document.getElementById("closeAuthModal");
    const overlay = document.getElementById("authModalOverlay");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeLoginModal());
    if (overlay) overlay.addEventListener("click", () => this.closeLoginModal());

    // User header button click
    const userBtn = document.getElementById("userHeaderBtn");
    if (userBtn) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.isLoggedIn()) {
          this.toggleUserDropdown();
        } else {
          this.openLoginModal();
        }
      });
    }

    // Click outside to close user dropdown
    document.addEventListener("click", () => {
      const dropdown = document.getElementById("userDropdownMenu");
      if (dropdown) dropdown.classList.remove("show");
    });
  },

  toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdownMenu");
    if (dropdown) {
      dropdown.classList.toggle("show");
      this.populateUserDropdown();
    }
  },

  populateUserDropdown() {
    const container = document.getElementById("userDropdownContent");
    if (!container || !this.currentUser) return;

    container.innerHTML = `
      <div class="user-dropdown-header">
        <div class="user-dd-avatar">${this.currentUser.avatar.startsWith("http") ? `<img src="${this.currentUser.avatar}">` : this.currentUser.avatar}</div>
        <div class="user-dd-info">
          <strong>${this.currentUser.fullName}</strong>
          <span>${this.currentUser.phone || this.currentUser.email}</span>
        </div>
      </div>
      <div class="user-dropdown-divider"></div>
      <button class="user-dd-item" onclick="CheckoutManager.openOrderHistory()">
        <i class="bi bi-bag-check"></i> Đơn hàng của tôi
      </button>
      <button class="user-dd-item" onclick="CustomOrderManager.openMyRequests()">
        <i class="bi bi-stars"></i> Yêu cầu làm hoa đã gửi
      </button>
      ${(this.currentUser.phone === "0393613156" || this.currentUser.role === "admin") ? `
      <a href="admin.html" class="user-dd-item" style="color: var(--color-primary); font-weight: 600;">
        <i class="bi bi-speedometer2" style="color: var(--color-primary);"></i> Trang Quản Trị (Admin)
      </a>` : ""}
      <div class="user-dropdown-divider"></div>
      <button class="user-dd-item text-danger" onclick="AuthManager.logout()">
        <i class="bi bi-box-arrow-right"></i> Đăng xuất
      </button>
    `;
  }
};
