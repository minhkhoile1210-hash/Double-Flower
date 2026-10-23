// Danh mục và sản phẩm Douple Flower Shop - Tiệm hoa Handmade
const PRODUCTS_DATA = [
  {
    id: "df-01",
    sku: "DF-LY-01",
    name: "Bó Hoa Ly Kẽm Nhung Hồng Pastel",
    category: "hoa-ly",
    categoryName: "Hoa Ly Kẽm Nhung",
    price: 380000,
    originalPrice: 450000,
    stockQuantity: 24,
    image: "assets/bo_hoa_ly_hong.jpg",
    badge: "Bán chạy nhất",
    rating: 5.0,
    reviewsCount: 48,
    isHot: true,
    tag: "Bestseller",
    description: "Bó hoa ly kẽm nhung hồng pastel được uốn thủ công tỉ mỉ từng cánh hoa mềm mại, điểm xuyết hoa cúc hoạ mi trắng tinh khôi và lá xanh nhung dịu mát. Gói giấy kraft kem vân nếp cao cấp Hàn Quốc cùng dải ruy băng lụa hồng trang nhã.",
    features: [
      "Kẽm nhung loại 1 cao cấp, sợi bông xù mềm mịn không xơ",
      "Độ bền vĩnh cửu, không phai màu, không héo",
      "Kích thước: Chiều cao ~45cm, đường kính tán hoa ~30cm",
      "Tặng kèm: Thiệp chúc mừng viết tay nghệ thuật & túi đựng hoa trong suốt"
    ],
    inStock: true
  },
  {
    id: "df-02",
    sku: "DF-LY-02",
    name: "Bó Hoa Ly Kẽm Nhung Xanh Baby Dịu Dàng",
    category: "hoa-ly",
    categoryName: "Hoa Ly Kẽm Nhung",
    price: 390000,
    originalPrice: 460000,
    stockQuantity: 18,
    image: "assets/bo_hoa_ly_xanh.jpg",
    badge: "Mẫu mới 2026",
    rating: 4.9,
    reviewsCount: 36,
    isHot: true,
    tag: "New Arrival",
    description: "Sự kết hợp tinh tế giữa tone xanh baby pastel ngọt ngào của hoa ly nhung và hoa cúc baby trắng. Gói bằng giấy tổ ong màu vàng bơ nghệ thuật tạo vẻ đẹp hiện đại, thanh tao và bình yên.",
    features: [
      "Màu xanh baby độc quyền phối chuẩn tone pastel Hàn Quốc",
      "Thích hợp làm quà tặng sinh nhật, người thương, bạn thân",
      "Kích thước: Chiều cao ~42cm, tán hoa ~28cm",
      "Miễn phí in tag tên và thông điệp riêng theo yêu cầu"
    ],
    inStock: true
  },
  {
    id: "df-03",
    sku: "DF-LED-03",
    name: "Hộp Trụ Hoa Ly Kẽm Nhung Kim Tuyến Kèm Đèn LED",
    category: "hop-hoa",
    categoryName: "Hộp Hoa Cao Cấp",
    price: 520000,
    originalPrice: 620000,
    stockQuantity: 12,
    image: "assets/hop_hoa_kim_tuyen.jpg",
    badge: "Hot Trend",
    rating: 5.0,
    reviewsCount: 62,
    isHot: true,
    tag: "Premium Gift",
    description: "Thiết kế hộp tròn vintage cao cấp thêu chữ thủ công, phối hoa ly nhung hồng fuchsia và hồng phấn phủ nhũ kim tuyến lấp lánh. Tích hợp dàn đèn LED đom đóm 3 chế độ sáng cực kỳ lung linh trong đêm.",
    features: [
      "Hộp trụ da/giấy cứng ép kim sang trọng, nơ ren vintage",
      "Tích hợp sẵn dây đèn LED Fairy Light pin cúc áo thay được",
      "Cánh hoa nhũ óng ánh bắt sáng lung linh",
      "Kích thước: Đường kính hộp 18cm, chiều cao tổng 32cm"
    ],
    inStock: true
  },
  {
    id: "df-04",
    sku: "DF-TL-04",
    name: "Bó Hoa Tulip Kẽm Nhung Đa Sắc Ngọt Ngào",
    category: "hoa-tulip",
    categoryName: "Hoa Tulip",
    price: 350000,
    originalPrice: 420000,
    stockQuantity: 20,
    image: "assets/bo_hoa_tulip_pastel.jpg",
    badge: "Yêu thích",
    rating: 4.9,
    reviewsCount: 51,
    isHot: false,
    tag: "Sweet Pastel",
    description: "Bó gồm 15 bông hoa tulip kẽm nhung mix 2 tone màu vàng bơ ấm áp và hồng ombre chuyển sắc. Cánh hoa uốn cong duyên dáng, gói giấy mờ sương trắng phong cách công chúa nhẹ nhàng.",
    features: [
      "Ý nghĩa tượng trưng cho tình yêu chân thành và niềm hy vọng",
      "Giấy gói mờ Hàn Quốc chống thấm nước cao cấp",
      "Kích thước: Chiều cao ~40cm, tán hoa ~26cm",
      "Thích hợp tặng sinh nhật, chụp kỷ yếu, decor phòng ngủ"
    ],
    inStock: true
  },
  {
    id: "df-05",
    sku: "DF-HD-05",
    name: "Bó Hoa Hướng Dương Kẽm Nhung Rực Rỡ (Tốt Nghiệp)",
    category: "tot-nghiep",
    categoryName: "Hoa Tốt Nghiệp",
    price: 420000,
    originalPrice: 490000,
    stockQuantity: 30,
    image: "assets/bo_huong_duong.jpg",
    badge: "Quà Tốt Nghiệp",
    rating: 5.0,
    reviewsCount: 79,
    isHot: true,
    tag: "Graduation",
    description: "Bó hoa hướng dương kẽm nhung vàng tươi rực rỡ, nhuỵ hoa đan tỉ mỉ tạo hiệu ứng 3D chân thực, phối cùng cành khuynh diệp và cúc hoạ mi. Gói giấy đen viền vàng sang trọng cùng tag chúc mừng Congratulations.",
    features: [
      "Tượng trưng cho tương lai tươi sáng và sự thành công",
      "Tặng kèm nón cử nhân mini đính kèm hoa & tag thiệp tốt nghiệp",
      "Kích thước: Chiều cao ~48cm, tán hoa ~32cm",
      "Chất liệu bền đẹp lưu giữ kỷ niệm ngày tốt nghiệp suốt nhiều năm"
    ],
    inStock: true
  },
  {
    id: "df-06",
    sku: "DF-ROSE-06",
    name: "Bó Hoa Hồng Đỏ Kẽm Nhung Quý Phái Velvet Rose",
    category: "hoa-hong",
    categoryName: "Hoa Hồng Nhung",
    price: 450000,
    originalPrice: 530000,
    stockQuantity: 15,
    image: "assets/bo_hoa_hong_do.jpg",
    badge: "Tình Yêu",
    rating: 5.0,
    reviewsCount: 84,
    isHot: true,
    tag: "Romantic",
    description: "Bó hoa hồng đỏ nhung quyến rũ 9 bông tượng trưng cho tình yêu vĩnh cửu. Tone đỏ ruby quý phái kết hợp lớp giấy gói 2 mặt đen và đỏ mận, thắt nơ ruy băng satin đen quyền lực.",
    features: [
      "Chất liệu nhung dày dặn, form hoa cúp tròn tự nhiên như hoa thật",
      "Món quà hoàn hảo cho dịp Valentine, Kỷ niệm ngày yêu, Cầu hôn",
      "Kích thước: Chiều cao ~46cm, tán hoa ~30cm",
      "Miễn phí xịt hương hoa thơm dịu nhẹ lưu hương 30 ngày"
    ],
    inStock: true
  }
];

// Hàm lấy danh sách sản phẩm mới nhất đã đồng bộ từ localStorage hoặc mặc định
function getActiveProducts() {
  try {
    const raw = localStorage.getItem("douple_products");
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((p, idx) => {
          if (!p.sku) p.sku = "DF-" + (p.category ? p.category.substring(0, 3).toUpperCase() : "SP") + "-" + (idx + 1).toString().padStart(2, "0");
          if (p.stockQuantity === undefined || p.stockQuantity === null) p.stockQuantity = 20;
          if (p.stockQuantity <= 0) p.inStock = false;
        });
        return list;
      }
    }
  } catch(e) {}
  return PRODUCTS_DATA;
}

// Tự động gán SKU và số lượng tồn kho vào localStorage nếu trước đó chưa có
(function syncProductsInventory() {
  try {
    const raw = localStorage.getItem("douple_products");
    if (raw) {
      const list = JSON.parse(raw);
      let changed = false;
      list.forEach((p, idx) => {
        if (!p.sku) {
          p.sku = "DF-" + (p.category ? p.category.substring(0, 3).toUpperCase() : "SP") + "-" + (idx + 1).toString().padStart(2, "0");
          changed = true;
        }
        if (p.stockQuantity === undefined || p.stockQuantity === null) {
          p.stockQuantity = 20;
          changed = true;
        }
        if (p.stockQuantity <= 0 && p.inStock !== false) {
          p.inStock = false;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("douple_products", JSON.stringify(list));
      }
    } else {
      localStorage.setItem("douple_products", JSON.stringify(PRODUCTS_DATA));
    }
  } catch (e) {}
})();

// Danh mục hoa
const CATEGORIES = [
  { id: "all", name: "Tất cả sản phẩm", icon: "bi-grid-fill" },
  { id: "hoa-ly", name: "Hoa Ly Kẽm Nhung", icon: "bi-flower1" },
  { id: "hoa-tulip", name: "Hoa Tulip", icon: "bi-flower2" },
  { id: "hoa-hong", name: "Hoa Hồng Đỏ", icon: "bi-heart-fill" },
  { id: "tot-nghiep", name: "Hoa Tốt Nghiệp", icon: "bi-mortarboard-fill" },
  { id: "hop-hoa", name: "Hộp Hoa LED Cao Cấp", icon: "bi-box-seam-fill" }
];

// Dịch vụ đặt làm theo yêu cầu options
const CUSTOM_ORDER_OPTIONS = {
  flowerTypes: [
    { id: "ly", name: "Hoa Ly Kẽm Nhung", desc: "Thanh tao, quý phái" },
    { id: "tulip", name: "Hoa Tulip Kẽm Nhung", desc: "Ngọt ngào, nhẹ nhàng" },
    { id: "hong", name: "Hoa Hồng Nhung", desc: "Lãng mạn, nồng nàn" },
    { id: "huongduong", name: "Hoa Hướng Dương", desc: "Rạng rỡ, tương lai sáng" },
    { id: "camtucau", name: "Cẩm Tú Cầu Kẽm Nhung", desc: "Tròn đầy, biết ơn" },
    { id: "mix", name: "Bó Phối Mix Đa Dạng Theo Ý", desc: "Độc đáo, duy nhất" }
  ],
  colorThemes: [
    { id: "pink-pastel", name: "Hồng Pastel", color: "#F7B5CA" },
    { id: "blue-baby", name: "Xanh Baby Pastel", color: "#9AD0EC" },
    { id: "yellow-warm", name: "Vàng Nắng Rực Rỡ", color: "#FCE38A" },
    { id: "red-ruby", name: "Đỏ Ruby Quyến Rũ", color: "#C70039" },
    { id: "purple-lavender", name: "Tím Mộng Mơ", color: "#D1C4E9" },
    { id: "cream-minimal", name: "Kem Vintage Tinh Khôi", color: "#F7E6C4" }
  ],
  packagingStyles: [
    { id: "korean-paper", name: "Bó Giấy Hàn Quốc Mờ / Vân Nếp", priceNote: "Chuẩn thanh lịch" },
    { id: "vintage-box", name: "Hộp Trụ Vintage Có Quai Xách", priceNote: "+40.000đ" },
    { id: "honeycomb", name: "Gói Giấy Tổ Ong Bồ Đào Nha", priceNote: "+25.000đ" },
    { id: "wooden-basket", name: "Giỏ Gỗ Mộc Kèm Nơ Ren", priceNote: "+50.000đ" },
    { id: "pressed-frame", name: "Khung Tranh Kính Gỗ Hoa Ép Cánh", priceNote: "+70.000đ" }
  ],
  accessories: [
    { id: "led-light", name: "Dây Đèn LED Đom Đóm Phát Sáng", price: 25000 },
    { id: "mini-bear", name: "Gấu Bông Cử Nhân / Mini Đính Kèm", price: 35000 },
    { id: "handwritten-card", name: "Thiệp Hoa Khô Viết Tay Theo Yêu Cầu", price: 0, free: true },
    { id: "clear-bag", name: "Túi Kính Quai Trắng Trong Suốt Cao Cấp", price: 20000 }
  ],
  budgets: [
    "Từ 250.000đ - 400.000đ",
    "Từ 400.000đ - 650.000đ",
    "Từ 650.000đ - 1.000.000đ",
    "Thiết kế cao cấp trên 1.000.000đ"
  ],
  occasions: [
    "Sinh nhật",
    "Lễ Tốt nghiệp (Graduation)",
    "Ngày Phụ nữ (8/3 - 20/10)",
    "Ngày lễ Tình nhân (Valentine)",
    "Kỷ niệm ngày cưới / Ngày yêu",
    "Tri ân Thầy Cô (20/11)",
    "Trang trí phòng / Tự thưởng bản thân"
  ]
};

// Thông tin cửa hàng
const STORE_INFO = {
  name: "Douple Flower Shop - Tiệm hoa Handmade",
  slogan: "Những bó hoa nhỏ - Gửi trao yêu thương lớn",
  phone: "0393 613 156",
  hotlineFormatted: "0393.613.156",
  zalo: "https://zalo.me/0393613156",
  facebookUrl: "https://web.facebook.com/profile.php?id=61593298393972&locale=vi_VN",
  facebookId: "61593298393972",
  address: "Douple Flower Workshop - Giao hàng toàn quốc",
  shippingFee: 30000,
  freeShippingThreshold: 500000,
  bankInfo: {
    bankName: "MB Bank (Ngân hàng Quân Đội)",
    accountNumber: "0393613156",
    accountHolder: "DOUPLE FLOWER SHOP",
    branch: "Hà Nội"
  }
};

// Tự động đồng bộ số điện thoại và STK mới nhất vào localStorage nếu đang lưu số cũ
(function syncStoreSettings() {
  try {
    const raw = localStorage.getItem("douple_settings");
    if (raw) {
      const s = JSON.parse(raw);
      if (s.phone === "0968 839 972" || s.bankInfo?.accountNumber === "0968839972") {
        s.phone = "0393 613 156";
        s.hotlineFormatted = "0393.613.156";
        s.zalo = "https://zalo.me/0393613156";
        if (s.bankInfo) s.bankInfo.accountNumber = "0393613156";
        localStorage.setItem("douple_settings", JSON.stringify(s));
      }
    } else {
      localStorage.setItem("douple_settings", JSON.stringify(STORE_INFO));
    }
  } catch (e) {}
})();

