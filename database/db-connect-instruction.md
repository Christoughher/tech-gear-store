# Hướng dẫn trình bày kết nối database

## Câu trả lời tổng quan

Dự án của em dùng Supabase làm backend database. Database thực tế là PostgreSQL,
nhưng frontend không kết nối trực tiếp bằng connection string. Em dùng thư viện
`@supabase/supabase-js` để kết nối tới Supabase Data API bằng Project URL và anon
key.

Sau khi tạo `supabaseClient`, em dùng `.from('tên_bảng')` để đọc hoặc ghi dữ liệu.
Khi người dùng đăng nhập, Supabase tự gửi access token và database dùng RLS để
kiểm tra quyền truy cập.

## 1. Show thư viện Supabase

Mở [`index.html` dòng 224](../index.html#L224) và chỉ đoạn:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/js/supabase-config.js"></script>
```

Giải thích:

- Dòng đầu tải Supabase JavaScript SDK.
- Dòng thứ hai chạy file cấu hình kết nối.
- SDK phải được tải trước `supabase-config.js`.

## 2. Show code tạo kết nối

Mở [`supabase-config.js` dòng 1](../assets/js/supabase-config.js#L1):

```js
const SUPABASE_URL = 'https://...supabase.co';
const SUPABASE_ANON_KEY = '...';

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
```

Giải thích:

- `SUPABASE_URL`: địa chỉ project Supabase.
- `SUPABASE_ANON_KEY`: khóa công khai dành cho frontend.
- `createClient(...)`: tạo đối tượng kết nối.
- Lưu vào `window.supabaseClient` để các file JavaScript khác sử dụng.

Nếu thầy hỏi khóa database/password ở đâu, trả lời:

> Frontend không được chứa mật khẩu PostgreSQL hoặc `service_role` key. Frontend
> chỉ dùng anon key; quyền truy cập được bảo vệ bằng RLS.

## 3. Show code lấy dữ liệu

Mở [`main.js` dòng 215](../assets/js/main.js#L215) và chỉ đoạn:

```js
const { data, error } = await window.supabaseClient
    .from('products')
    .select('*');
```

Giải thích truy vấn trên tương đương với SQL:

```sql
SELECT *
FROM public.products;
```

Trong đó:

```text
.from('products') → bảng public.products
.select('*')      → lấy tất cả thuộc tính
data              → các bản ghi trả về
error             → lỗi truy vấn nếu có
```

Mỗi bản ghi trả về là một object JavaScript:

```js
{
    id: 'uuid',
    name: 'Laptop Acer',
    price: 18000000,
    category_id: 'laptop'
}
```

## 4. Show code thêm dữ liệu

Mở [`admin-add-product.js` dòng 203](../assets/js/admin-add-product.js#L203):

```js
const { data, error } = await supabase
    .from('products')
    .insert([
        {
            sku: sku,
            name: name,
            price: price,
            category_id: category_id,
            stock: stock
        }
    ])
    .select();
```

Giải thích đây là thao tác tương đương:

```sql
INSERT INTO public.products (...)
VALUES (...);
```

## 5. Chứng minh kết nối trực tiếp khi thầy kiểm tra

Mở website, nhấn **F12 → Console**, sau đó chạy:

```js
window.supabaseClient
    .from('products')
    .select('id, name, price')
    .limit(3)
    .then(console.log);
```

Nếu kết nối thành công, Console sẽ trả về kết quả tương tự:

```js
{
    data: [
        { id: '...', name: '...', price: ... },
        { id: '...', name: '...', price: ... }
    ],
    error: null
}
```

Sau đó có thể mở **Supabase Dashboard → Table Editor → products** để cho thấy dữ
liệu trên giao diện khớp với kết quả trả về.

## Nếu thầy hỏi dự án đã dùng những bảng nào

Hãy trả lời đúng hiện trạng:

> Hiện tại frontend đã kết nối và sử dụng trực tiếp các bảng `users`, `products`,
> `carts` và `cart_items`. Bảng `categories` được dùng gián tiếp qua
> `products.category_id`. Giỏ hàng yêu cầu đăng nhập và các thao tác thêm, sửa số
> lượng, xóa đều lưu vào Supabase. Hai bảng `orders` và `order_items` đã được thiết
> kế nhưng nút thanh toán chưa kết nối để tạo đơn hàng.

Đừng nói tất cả bảng đã hoạt động nếu chưa tích hợp, vì thầy có thể yêu cầu thao
tác thử ngay.
