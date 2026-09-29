# Tech.no - Cửa hàng công nghệ cao cấp

## Giới thiệu
Tech.no là website cửa hàng bán lẻ sản phẩm công nghệ (Laptop, PC, Điện thoại, Phụ kiện), mang đến trải nghiệm mua sắm trực tuyến toàn diện. Dự án sở hữu giao diện bán hàng hiện đại, giỏ hàng động, hệ thống thanh toán, khu vực quản lý cá nhân cho người dùng và dashboard quản trị toàn quyền dành cho admin.

## Tính năng chính
- **Giao diện người dùng (Storefront):**
  - Trang chủ với Slider sản phẩm nổi bật, banner quảng cáo.
  - Danh mục đa dạng (Điện thoại, Laptop, PC, Phụ kiện) với bộ lọc theo thương hiệu và tính năng sắp xếp.
  - Trang chi tiết sản phẩm hiển thị thông số kỹ thuật, hình ảnh gallery và hệ thống đánh giá/nhận xét (Product Reviews).
- **Trải nghiệm mua sắm:**
  - Giỏ hàng (Cart) với số lượng realtime trên Navbar.
  - Hệ thống thanh toán (Checkout) tích hợp chọn phương thức giao hàng.
- **Quản lý tài khoản (Profile):**
  - Đăng ký / Đăng nhập an toàn.
  - Quản lý hồ sơ cá nhân và theo dõi lịch sử đơn hàng (User Order Management).
  - Hệ thống thông báo (Notifications).
- **Khu vực Quản trị (Admin Dashboard):**
  - Thống kê tổng quan (Admin Data/Export).
  - Quản lý sản phẩm (thêm, sửa, xóa, quản lý tồn kho).
  - Quản lý đơn hàng (cập nhật trạng thái `pending -> processing -> completed`).

## Cấu trúc dự án
- `index.html` - Trang chủ chính của cửa hàng.
- `assets/css/` - Chứa các file CSS thuần quản lý giao diện (`style.css`, `index.css`, `admin.css`, v.v.).
- `assets/js/` - Mã nguồn Vanilla JS xử lý logic Frontend (Auth, Cart, API, Admin, v.v.).
- `assets/images/` - Hình ảnh tĩnh, logo và banner.
- `pages/` - Các trang phụ trợ (Chi tiết sản phẩm, Giỏ hàng, Admin, Quản lý đơn hàng,...).
- `database/` - Chứa các script SQL (khởi tạo bảng, RPC, phân quyền, trigger, seed data) và các file test logic database (`.test.cjs`).
- `components/` - Các thành phần giao diện dùng chung.

## Công nghệ sử dụng
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6)
- **Backend / Database:** Supabase (PostgreSQL, Supabase Auth, REST API, RPC)
- **UI / Design:** Font Awesome (Icons), Google Fonts (Manrope)
- **Kiểm thử (Testing):** Mocha/Chai/Jest cho database contracts (`.test.cjs`)

## Triển khai
Dự án được triển khai tự động qua Vercel và có thể truy cập trực tiếp tại:

👉 **[https://tech-gear-store.vercel.app](https://tech-gear-store.vercel.app)**

## Hướng dẫn truy cập
1. Mở trình duyệt web.
2. Truy cập vào đường dẫn `https://tech-gear-store.vercel.app`.
3. Khám phá các sản phẩm, thêm vào giỏ hàng hoặc đăng nhập để trải nghiệm đầy đủ tính năng mua sắm và quản lý cá nhân.
4. Tài khoản Admin (nếu được cấp quyền) có thể truy cập trang Quản trị thông qua menu tài khoản.

## Hướng dẫn thiết lập & Lưu ý (Dành cho Developer)
- **Kết nối Supabase:** Frontend kết nối với Supabase thông qua thư viện `@supabase/supabase-js`. Cần cấu hình Project URL và Anon Key trong `assets/js/supabase-config.js` (hoặc `.env` nếu chạy local server).
- **Luồng Checkout (Giao dịch an toàn):** Khi người dùng thanh toán, hệ thống gọi hàm RPC `checkout_cart` để tự động tạo `orders` và `order_items`, đồng thời trừ tồn kho và dọn sạch giỏ hàng trong **cùng một database transaction**, đảm bảo tính toàn vẹn dữ liệu.
- **Cập nhật Database:** Để dự án hoạt động với đầy đủ tính năng mới nhất, cần chạy lần lượt các script SQL trong thư mục `database/` trên Supabase SQL Editor:
  1. Chạy các file khởi tạo bảng cơ bản (`create-table.sql`).
  2. Cài đặt các tính năng nâng cao: `add-shipping-method.sql`, `enable-user-order-management.sql`, `enable-admin-dashboard.sql`, `enable-product-reviews.sql`, `enable-notifications.sql`.
  3. Phân quyền Admin cho tài khoản mong muốn thông qua `cap-quyen-admin.sql`.
  4. Nạp dữ liệu mẫu (Seed data) bằng các script `seed-*.sql` (VD: `seed-techno-products-tgdd-60.sql`).
- **Bảo mật & Phân quyền (RLS):** RLS (Row Level Security) được thiết lập chặt chẽ cho từng bảng. Profile người dùng chỉ có thể đọc lịch sử đơn, hủy đơn (ở trạng thái `pending` - hoàn tồn kho nguyên tử), trong khi Admin có toàn quyền thao tác chuyển đổi trạng thái đơn hàng và chỉnh sửa sản phẩm.
