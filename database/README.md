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
  p_note: note || null
});
```

RPC tự khóa cart/sản phẩm, kiểm tra tồn kho, tính tổng tiền từ database, tạo order,
sao chép `cart_items` sang `order_items`, trừ tồn kho và chuyển cart sang
`checked_out` trong cùng một transaction.

## Cảnh báo

`create-table.sql` là full-reset script và xóa dữ liệu bảng nghiệp vụ. Không chạy
trên database đang có dữ liệu cần giữ. Database cũ cần một migration/backfill riêng
vì các order cũ chưa có `cart_id`.
