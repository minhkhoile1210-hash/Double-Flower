// Trợ lý AI Douple Flower - Tư vấn hoa kẽm nhung thông minh
const ChatbotManager = {
  isOpen: false,
  messages: [],

  knowledgeBase: [
    {
      keywords: ["tốt nghiệp", "cử nhân", "kỷ yếu", "bằng"],
      reply: `Dịp tốt nghiệp là dịp cực kỳ ý nghĩa! Tiệm gợi ý cho bạn:
🌻 **Bó Hoa Hướng Dương Kẽm Nhung Rực Rỡ** (420.000đ): Biểu tượng của niềm tin, ý chí và con đường tương lai tươi sáng rộng mở.
🎓 Đặc biệt tiệm tặng kèm **nón cử nhân mini đính kèm hoa** và thiệp chúc mừng thiết kế riêng. Bạn có muốn xem chi tiết bó hoa này không?`
    },
    {
      keywords: ["người yêu", "bạn gái", "tình yêu", "crush", "valentine", "kỷ niệm"],
      reply: `Để tặng người thương, bạn có thể tham khảo 2 mẫu hot nhất tại tiệm:
🌹 **Bó Hoa Hồng Đỏ Velvet Rose** (450.000đ): Tượng trưng cho tình yêu chân thành, nồng nàn và vĩnh cửu.
🌸 **Bó Hoa Ly Kẽm Nhung Hồng Pastel** (380.000đ) hoặc **Bó Tulip Hồng Vàng**: Ngọt ngào, nhẹ nhàng và thanh lịch.
✨ Tiệm có nhận xịt tinh dầu thơm cao cấp lưu hương 30 ngày hoàn toàn miễn phí nhé!`
    },
    {
      keywords: ["bao lâu", "độ bền", "hỏng", "tàn", "bảo quản"],
      reply: `Hoa kẽm nhung tại **Douple Flower** là **hoa vĩnh cửu (Forever Flower)**, không bao giờ tàn!
✨ **Chất liệu:** Kẽm nhung loại 1 sợi bông tuyết dày mịn, uốn thủ công từng cánh hoa.
🧹 **Cách bảo quản:** Để nơi khô ráo, tránh ngâm nước. Nếu có bụi nhẹ chỉ cần dùng chổi cọ mềm quét nhẹ hoặc dùng máy sấy tóc bật chế độ gió mát thổi nhẹ là hoa lại như mới!`
    },
    {
      keywords: ["cọc", "50%", "thanh toán", "tại sao phải cọc", "đặt cọc"],
      reply: `Dạ, về **chính sách cọc 50%**:
🌸 Vì mỗi bó hoa kẽm nhung là **sản phẩm thủ công làm tay 100%** theo mẫu và yêu cầu riêng của bạn, tốn nhiều giờ uốn nắn tỉ mỉ của thợ hoa.
💳 Tiệm xin phép nhận cọc 50% qua chuyển khoản (có mã QR tiện lợi) để thợ hoa chuẩn bị nguyên liệu và tiến hành cắm hoa cho bạn.
📦 **50% số tiền còn lại**, bạn chỉ cần thanh toán cho shipper khi nhận và kiểm tra hoa tận tay ạ!`
    },
    {
      keywords: ["theo yêu cầu", "làm theo mẫu", "tự thiết kế", "riêng"],
      reply: `Tiệm có hẳn chuyên mục **"Nhận làm theo yêu cầu"** đấy ạ!
🎨 Bạn có thể tự chọn: Loại hoa, tone màu, số lượng bông, kiểu giấy gói và gắn thêm đèn LED đom đóm lung linh.
📸 Nếu bạn đã có ảnh mẫu hoa muốn làm, hãy gửi ảnh qua form "Làm theo yêu cầu" hoặc nhắn trực tiếp qua Fanpage Facebook của tiệm nhé!`
    },
    {
      keywords: ["ship", "vận chuyển", "giao hàng", "phí ship", "nội thành", "toàn quốc"],
      reply: `📦 **Chính sách giao hoa:**
🚚 Tiệm nhận giao hoa toàn quốc. Đóng gói thùng carton 5 lớp chống móp méo form hoa cực kỳ cẩn thận.
💰 Phí ship tiêu chuẩn: 30.000đ.
🎁 **ĐẶC BIỆT:** Đơn hàng từ **500.000đ** trở lên sẽ được **MIỄN PHÍ SHIP HOÀN TOÀN**!`
    },
    {
      keywords: ["giá", "bao nhiêu", "bảng giá"],
      reply: `Bảng giá hoa kẽm nhung tại Douple Flower rất phải chăng cho sản phẩm thủ công cao cấp:
• Bó hoa tulip ngọt ngào: từ 350.000đ
• Bó hoa ly hồng/xanh pastel: 380.000đ - 390.000đ
• Bó hoa hướng dương tốt nghiệp: 420.000đ
• Bó hoa hồng nhung đỏ tình yêu: 450.000đ
• Hộp hoa kim tuyến phát sáng LED: 520.000đ
🎁 Tất cả sản phẩm đều được tặng kèm thiệp viết tay nghệ thuật & túi đựng hoa trong suốt!`
    },
    {
      keywords: ["nhân viên", "tư vấn viên", "gặp người", "hotline", "facebook", "sđt"],
      reply: `Dạ bạn có thể kết nối ngay với đội ngũ thợ hoa Douple Flower qua các kênh sau ạ:
👉 **Facebook Page:** [Douple Flower Shop](https://web.facebook.com/profile.php?id=61593298393972&locale=vi_VN)
📞 **Hotline/Zalo:** **0393 613 156** (Tư vấn 24/7)
Thợ hoa của tiệm sẽ gửi ảnh thực tế và chụp video hoa cho bạn xem ngay nhé!`
    }
  ],

  defaultReply: `Cảm ơn bạn đã nhắn tin cho Douple Flower! 🌸 
Tôi là trợ lý AI của tiệm hoa kẽm nhung thủ công. Bạn có thể hỏi tôi về:
• Tư vấn chọn hoa theo dịp (Sinh nhật, Tốt nghiệp, 8/3 - 20/10, Valentine...)
• Báo giá và kích thước các bó hoa
• Đặt làm theo mẫu riêng & chính sách cọc 50%
Hoặc nhắn tin trực tiếp qua **Facebook Page** hay gọi **Hotline 0393 613 156** để thợ hoa hỗ trợ bạn ngay lập tức!`,

  init() {
    this.bindEvents();
    // Tin nhắn chào mừng ban đầu
    this.messages.push({
      sender: "bot",
      text: "Xin chào! 🌷 Em là trợ lý AI của **Douple Flower Shop**. Bạn đang cần tư vấn bó hoa kẽm nhung cho dịp đặc biệt nào để em gợi ý mẫu xinh nhất nhé?",
      time: this.getCurrentTime()
    });
    this.renderMessages();
  },

  getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatbox = document.getElementById("aiChatboxContainer");
    const launcher = document.getElementById("aiChatLauncher");

    if (chatbox) chatbox.classList.toggle("active", this.isOpen);
    if (launcher) launcher.classList.toggle("active", this.isOpen);

    if (this.isOpen) {
      setTimeout(() => {
        const input = document.getElementById("chatInput");
        if (input) input.focus();
        this.scrollToBottom();
      }, 200);
    }
  },

  closeChat() {
    this.isOpen = false;
    const chatbox = document.getElementById("aiChatboxContainer");
    const launcher = document.getElementById("aiChatLauncher");
    if (chatbox) chatbox.classList.remove("active");
    if (launcher) launcher.classList.remove("active");
  },

  sendMessage(text) {
    text = (text || "").trim();
    if (!text) return;

    // Thêm tin nhắn của người dùng
    this.messages.push({
      sender: "user",
      text: text,
      time: this.getCurrentTime()
    });
    this.renderMessages();

    // Hiển thị typing indicator
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      const botResponse = this.generateResponse(text);
      this.messages.push({
        sender: "bot",
        text: botResponse,
        time: this.getCurrentTime()
      });
      this.renderMessages();
      playSound("message");
    }, 600);
  },

  generateResponse(input) {
    const lower = input.toLowerCase();

    for (const item of this.knowledgeBase) {
      const match = item.keywords.some(kw => lower.includes(kw));
      if (match) {
        return item.reply;
      }
    }

    return this.defaultReply;
  },

  showTypingIndicator() {
    const list = document.getElementById("chatMessagesList");
    if (!list) return;

    let typingEl = document.getElementById("chatTypingIndicator");
    if (!typingEl) {
      typingEl = document.createElement("div");
      typingEl.id = "chatTypingIndicator";
      typingEl.className = "chat-msg-row bot-msg typing-row";
      typingEl.innerHTML = `
        <div class="chat-avatar"><i class="bi bi-robot"></i></div>
        <div class="chat-bubble typing-bubble">
          <span></span><span></span><span></span>
        </div>
      `;
      list.appendChild(typingEl);
    }
    typingEl.style.display = "flex";
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const typingEl = document.getElementById("chatTypingIndicator");
    if (typingEl) typingEl.style.display = "none";
  },

  renderMessages() {
    const list = document.getElementById("chatMessagesList");
    if (!list) return;

    const html = this.messages.map(msg => `
      <div class="chat-msg-row ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}">
        ${msg.sender === 'bot' ? `<div class="chat-avatar"><img src="assets/logo.png" alt="Douple AI"></div>` : ''}
        <div class="chat-bubble">
          <div class="chat-text">${this.formatMarkdown(msg.text)}</div>
          <span class="chat-time">${msg.time}</span>
        </div>
      </div>
    `).join("");

    list.innerHTML = html;
    this.scrollToBottom();
  },

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  },

  scrollToBottom() {
    const list = document.getElementById("chatMessagesList");
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  },

  bindEvents() {
    // Nút mở/đóng launcher
    const launcher = document.getElementById("aiChatLauncher");
    if (launcher) launcher.addEventListener("click", () => this.toggleChat());

    const closeBtn = document.getElementById("closeChatBtn");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeChat());

    // Gửi tin nhắn từ input
    const form = document.getElementById("chatInputForm");
    const input = document.getElementById("chatInput");

    if (form && input) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = input.value;
        input.value = "";
        this.sendMessage(val);
      });
    }

    // Các chip gợi ý nhanh
    document.addEventListener("click", (e) => {
      const chip = e.target.closest(".chat-quick-chip");
      if (chip) {
        const text = chip.getAttribute("data-query") || chip.textContent;
        this.sendMessage(text);
      }
    });
  }
};
