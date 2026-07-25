# TECH.NO database

## Quan hệ chính

```text
users 1 --- N carts
users 1 --- N orders
users 1 --- N product_reviews

carts 1 --- N cart_items
carts 1 --- 0..1 orders

orders 1 --- N order_items

categories 1 --- N products
products 1 --- N cart_items
products 1 --- N order_items
products 1 --- N product_reviews
```

- Mỗi user chỉ có tối đa một cart `active`; các cart cũ được giữ làm lịch sử.
- `orders.cart_id` là `NOT NULL + UNIQUE`, nên một order luôn thuộc một cart và một cart chỉ tạo tối đa một order.
- Khóa ngoại kép `(orders.cart_id, orders.user_id)` bảo đảm order và cart cùng chủ sở hữu.
- `cart_items` là dữ liệu nháp có thể sửa trước checkout.
- `order_items` là snapshot cố định của tên, SKU, số lượng và giá tại thời điểm mua.

## Thứ tự chạy trên Supabase mới

1. `create-table.sql`
2. `sync-auth-users.sql`
3. `seed-techno-products-tgdd-60.sql`
4. `update-product-gallery-images-tgdd.sql`
5. `update-product-specifications-tgdd.sql`
6. Tạo tài khoản `123admin@gmail.com` trong Supabase Authentication nếu tài khoản này chưa tồn tại.
7. `cap-quyen-admin.sql`

`sync-auth-users.sql` backfill toàn bộ tài khoản đã có trong `auth.users` sang
`public.users`, giữ nguyên role của hồ sơ hiện có và cài trigger đồng bộ cho các
tài khoản đăng ký sau này. Ở kết quả cuối file, `missing_profiles` phải bằng `0`.

`create-table.sql` đã chứa các cột, constraint và index từng nằm trong
`update-prods-column.sql`, `update-constr-index.sql`, đồng thời đã tích hợp bản sửa
trigger đăng ký từ `fix.sql`. Ba file này được giữ để hỗ trợ database cũ và không
cần chạy khi khởi tạo mới bằng schema hiện tại.

## Checkout

Client không được insert trực tiếp vào `orders` hoặc `order_items`. Gọi RPC:

```js
const { data: orderId, error } = await supabase.rpc('checkout_cart', {
  p_cart_id: cartId,
  p_receiver_name: receiverName,
  p_receiver_phone: receiverPhone,
  p_shipping_address: shippingAddress,
  p_note: note || null,
  p_shipping_method: shippingMethod || 'Tiêu chuẩn'
});
```

RPC tự khóa cart/sản phẩm, kiểm tra tồn kho, tính tổng tiền từ database, tạo order,
sao chép `cart_items` sang `order_items`, lưu hình thức giao hàng, trừ tồn kho và
chuyển cart sang `checked_out` trong cùng một transaction. Trigger ghi
`cart_items` khóa cùng cart cha nên giỏ không thể bị thêm/sửa/xóa giữa lúc RPC
đang tạo snapshot. Retry cùng `cart_id` trả lại order đã có thay vì tạo đơn trùng.

Với database đang chạy, chạy lại `add-shipping-method.sql` để cài phiên bản RPC
và khóa đồng thời mới. Không chạy `create-table.sql` vì đó là full reset. Có thể
kiểm thử logic frontend không ghi dữ liệu thật bằng:

```powershell
node database/checkout-flow.test.cjs
```

## Đơn hàng trong profile và hủy hoàn kho

Trang `pages/profile.html#orders` đọc trực tiếp `orders`/`order_items` theo RLS
để hiển thị danh sách, chi tiết và trạng thái hiện hành. Khách hàng hủy đơn qua
RPC `cancel_pending_order`; client không được tự update `orders.status`.

RPC chỉ cho hủy order của đúng tài khoản khi còn `pending`. State-machine trigger
khóa order và sản phẩm, cộng lại đúng tổng `order_items.quantity`, chuyển sản
phẩm `out_of_stock` về `active` khi có hàng, giữ nguyên sản phẩm `hidden`, rồi
ghi `inventory_restored_at` và `cancelled_at` trong cùng transaction. Retry hoặc
hai request hủy đồng thời không thể hoàn kho hai lần.

`inventory_deducted_at` chỉ được ghi bởi checkout thật. Không backfill cột này
hàng loạt: order demo được seed trực tiếp không hề trừ kho, nên cố hoàn các đơn
đó sẽ làm tồn kho tăng sai. Đơn cũ có marker `NULL` bị từ chối hủy tự động.

Trang quản lý đơn hàng của admin chuyển trạng thái qua RPC
`advance_order_status`, không update trực tiếp từ trình duyệt. RPC kiểm tra role
admin, khóa order và yêu cầu trạng thái mà giao diện vừa đọc còn khớp trước khi
chuyển `pending -> processing -> completed`; profile khách hàng tự làm mới trạng
thái từ database.

## Đánh giá sản phẩm

Schema mới trong `create-table.sql` đã có đầy đủ bảng, RLS và hai RPC đánh giá:

- `list_product_reviews`: đọc tối đa 100 đánh giá hiển thị và chỉ công khai tên hiển thị an toàn.
- `create_product_review`: tự lấy `user_id` từ access token, kiểm tra rating `1..5` và comment `1..1000` ký tự.

Với database đang sử dụng, chỉ chạy `enable-product-reviews.sql` một lần trong
Supabase SQL Editor. Không chạy lại `create-table.sql` chỉ để bật tính năng này.

## Dashboard admin và ngưỡng tồn kho

Ngưỡng sắp hết hàng được thống nhất là `50`:

- `stock > 50`: còn hàng.
- `stock` từ `1` đến `50`: sắp hết hàng.
- `stock = 0`: hết hàng.

Ba trang admin dùng `assets/js/admin-data.js` để lấy KPI thật từ các RPC bảo vệ
bằng quyền admin. Doanh thu chỉ cộng các đơn có `status = 'completed'`; khách
hàng là số `user_id` khác nhau đã có đơn hàng.

Với database đang sử dụng, chạy theo thứ tự:

1. Chạy `add-shipping-method.sql` để thêm/chuẩn hóa `shipping_method`, bắt buộc
   `stock NOT NULL`, khóa thay đổi cart khi checkout và cập nhật RPC. File này
   an toàn khi chạy lại.
2. Chạy `enable-user-order-management.sql` để bật lịch sử đơn, state machine,
   RPC hủy đơn có hoàn kho và RPC chuyển trạng thái dành riêng cho admin.
3. `enable-admin-dashboard.sql` để tạo ba RPC thống kê an toàn.
4. Chạy lại `seed-techno-products-tgdd-60.sql` để cập nhật stock cho 60 SKU mẫu.
5. Nếu gallery từng bị mất do đã chạy bản seed cũ, chạy lại
   `update-product-gallery-images-tgdd.sql` một lần để khôi phục các mảng ảnh.
   Kết quả cuối file phải trả về `products_with_gallery=33` với bộ seed chuẩn.
6. Trước khi dùng công cụ sinh 200 khách hàng demo, chạy
   `enable-demo-data-seed.sql` để tạo RPC kiểm tra schema chỉ dành cho backend.

Trang quản lý đơn hàng hiển thị riêng `pending`, `processing`, `completed` và
`cancelled`, vì vậy tổng các card trạng thái luôn bằng card tổng đơn hàng.

Kết quả cuối file seed phải là `total=60`, `stock_above_50=45`,
`stock_below_50=15`, `stock_equal_50=0`. Seed là upsert nên không xóa sản phẩm
khác ngoài danh sách 60 SKU mẫu và không ghi đè gallery nhiều ảnh đã tồn tại.
Nếu bảng đã có thêm sản phẩm ngoài seed, các
card vẫn tính toàn bộ dữ liệu thật trong bảng.

## Dữ liệu demo cho dashboard

Muốn tạo 200 tài khoản Auth và 400 đơn hàng giả lập có quan hệ đầy đủ, xem
[`demo-seed/README.md`](demo-seed/README.md). Công cụ này chạy bằng Node.js ở
backend, chỉ đọc `service_role key` từ file môi trường local đã được Git bỏ qua,
và không thay đổi tồn kho sản phẩm.

## Cảnh báo

`create-table.sql` là full-reset script và xóa dữ liệu bảng nghiệp vụ. Không chạy
trên database đang có dữ liệu cần giữ. Database cũ cần một migration/backfill riêng
vì các order cũ chưa có `cart_id`.
