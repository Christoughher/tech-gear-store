# Seed 200 khách hàng và dữ liệu mua hàng thực tế

Thư mục này chỉ chạy ở backend/local bằng Node.js. Script tạo tài khoản Supabase
Auth thật, nhưng không cần đăng nhập 200 lần. `service_role key` không được đưa
vào frontend, ảnh chụp, GitHub hoặc gửi qua chat.

## Dữ liệu được tạo

- 200 tài khoản customer có thể đăng nhập, email từ
  `customer001.demo@techno.test` đến `customer200.demo@techno.test`.
- 400 đơn trong 12 tháng; mỗi customer có ít nhất một đơn.
- 348 `completed`, 16 `processing`, 8 `pending`, 28 `cancelled`.
- 328 đơn giao `Tiêu chuẩn`, 72 đơn giao `Hỏa tốc`.
- 400 carts đã checkout, 600 cart_items và 600 order_items khớp nhau.
- 32 carts đang hoạt động và 20 carts bị bỏ dở.
- 600 dòng sản phẩm, tương đương khoảng 690 sản phẩm đã bán.
- Tên, số điện thoại, địa chỉ và ghi chú bằng dữ liệu Việt Nam giả lập.

Doanh thu được tính từ giá thật hiện tại trong `products`; chỉ đơn
`completed` được cộng vào card doanh thu. Script không thay đổi `products.stock`
để giữ phân bố 45 sản phẩm còn hàng và 15 sản phẩm sắp hết hàng.

Nếu database đã có dữ liệu thật, các card admin sẽ hiển thị tổng của dữ liệu
thật cộng với dữ liệu demo.

## Điều kiện trước khi chạy

Database hiện tại phải có đủ `users`, `products`, `carts`, `cart_items`,
`orders`, `order_items` và `product_reviews`. Trên database hiện có, chạy các
file migration/seed theo hướng dẫn trong `database/README.md` trước.

Sau đó chạy thêm file sau một lần trong Supabase SQL Editor:

```text
database/enable-demo-data-seed.sql
```

File này chỉ tạo RPC preflight dành riêng cho `service_role`; nó không sửa hoặc
xóa dữ liệu nghiệp vụ. Script luôn gọi RPC này trước khi tạo Auth user hoặc dọn
dữ liệu cũ.

Máy cần Node.js 22 trở lên. Dự án hiện đã kiểm tra bằng Node.js 24.

## 1. Tạo file môi trường local

Mở PowerShell tại thư mục này:

```powershell
Set-Location -LiteralPath 'C:\Users\lenovo\OneDrive\Desktop\tech-gear-store\database\demo-seed'
Copy-Item -LiteralPath '.env.seed.example' -Destination '.env.seed'
```

Mở `.env.seed` và điền bốn giá trị bắt buộc:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_BACKEND_SERVICE_ROLE_KEY
DEMO_CONFIRM_PROJECT_REF=YOUR_PROJECT_REF
DEMO_USER_PASSWORD=YOUR_STRONG_DEMO_PASSWORD
```

`DEMO_CONFIRM_PROJECT_REF` phải trùng chính xác phần đầu của URL. Ví dụ URL là
`https://abcxyz.supabase.co` thì project ref là `abcxyz`.

Không dùng `anon key` ở vị trí `SUPABASE_SERVICE_ROLE_KEY`. Theo tài liệu
Supabase, các hàm Admin Auth chỉ được gọi ở server và không được để service role
key trong trình duyệt:

- <https://supabase.com/docs/reference/javascript/auth-admin-createuser>
- <https://supabase.com/docs/reference/javascript/auth-admin-listusers>

`.env.seed` đã được `.gitignore` loại khỏi Git.

## 2. Cài dependency

```powershell
npm install
```

Dependency duy nhất là `@supabase/supabase-js`. Không dùng Faker và không cần
`dotenv`.

## 3. Kiểm tra local

```powershell
npm run self-test
```

Lệnh này dùng 60 sản phẩm mock trong bộ nhớ, xác minh toàn bộ quota, tổng tiền,
FK logic và tính duy nhất. Nó không kết nối Supabase.

## 4. Preview bằng sản phẩm thật

```powershell
npm run preview
```

Lệnh này chỉ đọc bảng `products`, tính doanh thu dự kiến và không tạo, sửa hoặc
xóa tài khoản/bản ghi nào.

## 5. Tạo dữ liệu trên Supabase

```powershell
npm run seed
```

Script sẽ:

1. Xác nhận đúng project ref.
2. Tạo các Auth user còn thiếu bằng `auth.admin.createUser()`.
3. Đồng bộ profile vào `public.users`.
4. Chỉ xóa carts/orders cũ của đúng 200 user có `seed_source` riêng.
5. Sinh lại dữ liệu theo từng vòng để không vi phạm một active cart/user.
6. Đọc lại Supabase và kiểm tra số lượng, trạng thái, tổng doanh thu.

Chạy lại `npm run seed` không nhân đôi dữ liệu. Nếu lần chạy bị ngắt giữa chừng,
sửa nguyên nhân rồi chạy lại cùng lệnh.

Mặc định password chỉ áp dụng khi tài khoản được tạo lần đầu. Muốn đồng bộ lại
password cho toàn bộ 200 tài khoản demo đã tồn tại:

```powershell
npm run seed -- --reset-passwords
```

## Dọn dữ liệu demo

Xóa carts, cart_items, orders, order_items và reviews của nhóm demo nhưng vẫn
giữ các tài khoản Auth:

```powershell
npm run cleanup
```

Chỉ khi thật sự muốn xóa luôn 200 Auth users:

```powershell
node --env-file=.env.seed seed-demo-data.mjs --execute --cleanup-only --delete-auth-users
```

Script nhận diện bằng cả email cố định và
`app_metadata.seed_source = techno-realistic-demo-v1`. `app_metadata` chỉ backend
có quyền sửa. Nếu một email dự kiến đã
tồn tại nhưng không có nhãn này, script dừng để tránh tác động tài khoản khác.

## Kết quả card dự kiến

Nếu database trước đó không có đơn hàng:

| Card | Giá trị |
|---|---:|
| Khách hàng đã đặt | 200 |
| Tổng đơn hàng | 400 |
| Hoàn thành | 348 |
| Đang giao | 16 |
| Chờ duyệt | 8 |
| Đã hủy | 28 |
| Doanh thu | Được tính từ sản phẩm thật và in sau khi chạy |

Các tài khoản và thông tin giao nhận đều là dữ liệu giả lập, không phải thông
tin cá nhân thật.
