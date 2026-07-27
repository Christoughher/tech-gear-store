-- Chuẩn hóa dấu tiếng Việt cho 60 mô tả sản phẩm TGDD đã có sẵn.
-- Có thể chạy lại an toàn: chỉ UPDATE đúng SKU, không INSERT/DELETE dữ liệu.
-- Các sản phẩm ngoài danh sách (kể cả description NULL/trống) không bị thay đổi.

BEGIN;

WITH localized_descriptions (sku, description) AS (
  VALUES
    ('TGDD-PHN-IPHONE-16E-512', 'iPhone dung lượng lớn, phù hợp người dùng cần máy gọn nhẹ trong hệ sinh thái Apple.'),
    ('TGDD-PHN-OPPO-RENO13-256', 'Smartphone OPPO tầm trung cao cấp, RAM lớn, bộ nhớ rộng và thiết kế trẻ trung.'),
    ('TGDD-PHN-OPPO-RENO15-256', 'Điện thoại OPPO Reno mới, thiết kế hiện đại và camera phù hợp nhu cầu chụp ảnh hằng ngày.'),
    ('TGDD-PHN-REALME-14-256', 'Điện thoại realme hỗ trợ 5G, cấu hình tốt trong phân khúc tầm trung.'),
    ('TGDD-PHN-REALME-C75-256', 'Điện thoại realme pin tốt, bộ nhớ rộng và giá dễ tiếp cận cho nhu cầu phổ thông.'),
    ('TGDD-PHN-SAMSUNG-A26-128', 'Điện thoại Samsung dòng A hỗ trợ 5G, phù hợp nhu cầu học tập, giải trí và liên lạc hằng ngày.'),
    ('TGDD-PHN-SAMSUNG-S25-EDGE', 'Flagship Samsung thiết kế mỏng nhẹ, bộ nhớ lớn và màn hình cao cấp.'),
    ('TGDD-PHN-VIVO-V60-LITE-512', 'Smartphone vivo bộ nhớ lớn, hỗ trợ 5G và phù hợp người dùng thích thiết kế gọn gàng.'),
    ('TGDD-PHN-XIAOMI-15T-512', 'Điện thoại Xiaomi hiệu năng mạnh, dung lượng lưu trữ cao và hỗ trợ 5G.'),
    ('TGDD-PHN-XIAOMI-15T-PRO-512', 'Bản Pro của Xiaomi 15T với hiệu năng cao, bộ nhớ lớn và thiết kế cao cấp.'),
    ('TGDD2-PHN-IPHONE-17PM-256', 'iPhone màn hình lớn, hiệu năng cao và dung lượng 256GB cho người dùng hệ sinh thái Apple.'),
    ('TGDD2-PHN-OPPO-A5-128', 'Điện thoại OPPO A series giá tốt, RAM 8GB và bộ nhớ 128GB cho nhu cầu phổ thông.'),
    ('TGDD2-PHN-OPPO-A6PRO-256', 'OPPO A6 Pro hỗ trợ 5G, RAM 12GB và phù hợp người dùng cần máy mạnh trong tầm giá.'),
    ('TGDD2-PHN-OPPO-RENO14F-256', 'Phiên bản OPPO Reno14 F 256GB cân bằng giữa giá, hiệu năng và camera.'),
    ('TGDD2-PHN-OPPO-RENO14F-512', 'OPPO Reno F dung lượng lớn, hỗ trợ 5G và tối ưu cho chụp ảnh, mạng xã hội.'),
    ('TGDD2-PHN-REALME-15-12-256', 'Smartphone realme 5G với RAM 12GB, phù hợp cho tác vụ đa nhiệm và giải trí.'),
    ('TGDD2-PHN-REALME-15PRO-256', 'realme 15 Pro 5G hiệu năng cao, thiết kế nổi bật và dung lượng 256GB.'),
    ('TGDD2-PHN-SAMSUNG-A07-128', 'Smartphone Samsung phổ thông, dung lượng vừa đủ và pin tốt cho học tập, liên lạc.'),
    ('TGDD2-PHN-SAMSUNG-A17-256', 'Điện thoại Samsung bộ nhớ 256GB, thiết kế trẻ trung và phù hợp người dùng cần lưu trữ nhiều.'),
    ('TGDD2-PHN-SAMSUNG-A36-256', 'Điện thoại Samsung Galaxy A series màn hình lớn, bộ nhớ 256GB và phù hợp nhu cầu giải trí hằng ngày.'),

    ('TGDD-LAP-HP-15-FC0023AU', 'Laptop HP RAM 16GB, SSD 512GB, phù hợp học tập và xử lý công việc hằng ngày.'),
    ('TGDD-LAP-HP-15-FD1037TU', 'Laptop HP Core 7 cho nhu cầu văn phòng, học tập và giải trí.'),
    ('TGDD-LAP-HP-15-FD1043TU', 'Laptop HP 15 inch phù hợp học tập, văn phòng và làm việc online.'),
    ('TGDD-LAP-HP-PAVILION-X360', 'Laptop xoay gập linh hoạt, phù hợp ghi chú, học tập và làm việc di động.'),
    ('TGDD-LAP-MSI-KATANA-15-HX', 'Laptop gaming MSI hiệu năng mạnh, phù hợp chơi game, render và đồ họa.'),
    ('TGDD2-LAP-ACER-ASPIRE-GO14', 'Laptop Acer 14 inch gọn nhẹ, RAM 16GB và SSD 512GB cho công việc hằng ngày.'),
    ('TGDD2-LAP-ACER-ASPIRE-LITE15-R7', 'Laptop Acer Aspire Lite 15 inch, phù hợp học tập, làm việc và giải trí nhẹ.'),
    ('TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA', 'Laptop ASUS Vivobook 16 inch, RAM 16GB, phù hợp làm việc đa nhiệm và học tập.'),
    ('TGDD2-LAP-DELL-15-DC15250-I7', 'Laptop Dell Core i7, RAM 16GB và SSD 512GB cho công việc nặng hơn.'),
    ('TGDD2-LAP-DELL-15-DC15255', 'Laptop Dell 15 inch RAM 16GB, SSD 512GB, phù hợp văn phòng và học tập.'),
    ('TGDD2-LAP-LENOVO-SLIM3-15ARP10', 'Laptop Lenovo RAM 16GB, SSD 512GB, thiết kế mỏng nhẹ cho học tập và văn phòng.'),
    ('TGDD2-LAP-MACBOOK-NEO-13-256', 'MacBook 13 inch gọn nhẹ, phù hợp học tập, làm việc cơ bản và di chuyển nhiều.'),
    ('TGDD2-LAP-MSI-MODERN-15-F13MG', 'Laptop MSI Modern 15 RAM 16GB, phù hợp văn phòng, học tập và di chuyển.'),

    ('TGDD-PC-ASUS-V501MV-C5', 'Máy tính để bàn ASUS Core 5 cân bằng giữa hiệu năng và giá bán.'),
    ('TGDD-PC-ASUS-V501MV-C7', 'Máy tính để bàn ASUS Core 7, phù hợp làm việc đa nhiệm và học tập nâng cao.'),
    ('TGDD-PC-ASUS-V501SV-C5', 'Máy tính để bàn ASUS V501SV dành cho học tập, văn phòng và giải trí tại nhà.'),
    ('TGDD2-PC-ASUS-AIO-V440VA', 'Máy tính AIO ASUS màn hình 23.8 inch, RAM 16GB và SSD 512GB cho góc làm việc gọn gàng.'),
    ('TGDD2-PC-MSI-CUBI-N-ADL', 'MiniPC MSI nhỏ gọn, RAM 8GB, SSD 128GB, phù hợp văn phòng và học tập.'),
    ('TGDD2-PC-MSI-PRO-DP180-I5', 'Desktop MSI Pro Core i5, SSD 512GB, phù hợp văn phòng và xử lý công việc.'),
    ('TGDD2-PC-ROSA-ASUS-REZO-I121', 'Bộ máy desktop ROSA x ASUS RAM 16GB, SSD 500GB và RTX 5060 cho gaming.'),

    ('TGDD-ACC-AIRPODS-MAX-USBC', 'Tai nghe chụp tai Apple với thiết kế cao cấp, kết nối USB C và chất âm tốt.'),
    ('TGDD-ACC-APPLE-WATCH-ULTRA-3', 'Đồng hồ thông minh Apple cao cấp, hỗ trợ kết nối di động và luyện tập ngoài trời.'),
    ('TGDD-ACC-HUAWEI-WATCH-GT5-PRO', 'Đồng hồ thông minh Huawei thiết kế bền bỉ, phù hợp theo dõi sức khỏe và luyện tập.'),
    ('TGDD-ACC-SAMSUNG-BUDS-CORE', 'Tai nghe true wireless Samsung gọn nhẹ, dễ dùng hằng ngày.'),
    ('TGDD-ACC-SAMSUNG-BUDS4-PRO', 'Tai nghe TWS Samsung cao cấp, phù hợp nghe nhạc, họp online và di chuyển.'),
    ('TGDD-ACC-SAMSUNG-EP-T6010NB', 'Củ sạc nhanh Samsung Type C PD 60W, phù hợp điện thoại và thiết bị USB C.'),
    ('TGDD-ACC-SAMSUNG-WATCH8-40', 'Đồng hồ thông minh Samsung nhỏ gọn, hỗ trợ theo dõi sức khỏe và thông báo.'),
    ('TGDD-ACC-SONY-SRS-XB100', 'Loa Bluetooth Sony nhỏ gọn, phù hợp nghe nhạc cá nhân và du lịch.'),
    ('TGDD-ACC-TPLINK-TAPO-C200C', 'Camera trong nhà xoay 360 độ, phù hợp giám sát gia đình và văn phòng.'),
    ('TGDD-ACC-UGREEN-20W-UNO', 'Sạc dự phòng Ugreen nhỏ gọn, hỗ trợ sạc nhanh cho thiết bị di động.'),
    ('TGDD-ACC-XIAOMI-MIBAND-10', 'Vòng đeo tay thông minh Xiaomi, gọn nhẹ và phù hợp theo dõi vận động.'),
    ('TGDD-ACC-XIAOMI-REDMI-WATCH-6', 'Đồng hồ thông minh Xiaomi Redmi Watch, màn hình lớn và phù hợp nhu cầu hằng ngày.'),
    ('TGDD2-ACC-AMAZFIT-BIP-MAX', 'Đồng hồ Amazfit màn hình lớn, pin tốt và phù hợp theo dõi vận động hằng ngày.'),
    ('TGDD2-ACC-APPLE-WATCH-SE3-40', 'Apple Watch SE 3 gọn nhẹ, phù hợp thông báo, tập luyện và theo dõi sức khỏe cơ bản.'),
    ('TGDD2-ACC-HUAWEI-BAND-11', 'Vòng đeo tay Huawei Band 11 nhỏ gọn, theo dõi vận động và giấc ngủ hằng ngày.'),
    ('TGDD2-ACC-HUAWEI-WATCH-FIT-5', 'Đồng hồ Huawei Watch Fit 5 thiết kế mỏng nhẹ, phù hợp theo dõi sức khỏe và luyện tập.'),
    ('TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO', 'Huawei Watch Fit 5 Pro viền cao cấp, phù hợp người dùng thích tập luyện và di chuyển.'),
    ('TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025', 'Đồng hồ Samsung Galaxy Watch Ultra LTE bền bỉ, phù hợp luyện tập ngoài trời.'),
    ('TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC', 'Đồng hồ Samsung Galaxy Watch8 Classic thiết kế cổ điển, theo dõi sức khỏe và thông báo.'),
    ('TGDD2-ACC-XIAOMI-MIBAND-10-PRO', 'Vòng đeo tay Xiaomi Mi Band 10 Pro thiết kế cao cấp, phù hợp theo dõi sức khỏe.')
)
UPDATE public.products AS product
SET description = localized.description
FROM localized_descriptions AS localized
WHERE product.sku = localized.sku
  AND product.description IS DISTINCT FROM localized.description;

COMMIT;

-- Kết quả kỳ vọng với bộ seed hiện tại: 60 SKU có mô tả đã chuẩn hóa.
SELECT
  COUNT(*) AS localized_product_count
FROM public.products
WHERE sku IN (
  SELECT localized.sku
  FROM (
    VALUES
      ('TGDD-PHN-IPHONE-16E-512'),
      ('TGDD-PHN-OPPO-RENO13-256'),
      ('TGDD-PHN-OPPO-RENO15-256'),
      ('TGDD-PHN-REALME-14-256'),
      ('TGDD-PHN-REALME-C75-256'),
      ('TGDD-PHN-SAMSUNG-A26-128'),
      ('TGDD-PHN-SAMSUNG-S25-EDGE'),
      ('TGDD-PHN-VIVO-V60-LITE-512'),
      ('TGDD-PHN-XIAOMI-15T-512'),
      ('TGDD-PHN-XIAOMI-15T-PRO-512'),
      ('TGDD2-PHN-IPHONE-17PM-256'),
      ('TGDD2-PHN-OPPO-A5-128'),
      ('TGDD2-PHN-OPPO-A6PRO-256'),
      ('TGDD2-PHN-OPPO-RENO14F-256'),
      ('TGDD2-PHN-OPPO-RENO14F-512'),
      ('TGDD2-PHN-REALME-15-12-256'),
      ('TGDD2-PHN-REALME-15PRO-256'),
      ('TGDD2-PHN-SAMSUNG-A07-128'),
      ('TGDD2-PHN-SAMSUNG-A17-256'),
      ('TGDD2-PHN-SAMSUNG-A36-256'),
      ('TGDD-LAP-HP-15-FC0023AU'),
      ('TGDD-LAP-HP-15-FD1037TU'),
      ('TGDD-LAP-HP-15-FD1043TU'),
      ('TGDD-LAP-HP-PAVILION-X360'),
      ('TGDD-LAP-MSI-KATANA-15-HX'),
      ('TGDD2-LAP-ACER-ASPIRE-GO14'),
      ('TGDD2-LAP-ACER-ASPIRE-LITE15-R7'),
      ('TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA'),
      ('TGDD2-LAP-DELL-15-DC15250-I7'),
      ('TGDD2-LAP-DELL-15-DC15255'),
      ('TGDD2-LAP-LENOVO-SLIM3-15ARP10'),
      ('TGDD2-LAP-MACBOOK-NEO-13-256'),
      ('TGDD2-LAP-MSI-MODERN-15-F13MG'),
      ('TGDD-PC-ASUS-V501MV-C5'),
      ('TGDD-PC-ASUS-V501MV-C7'),
      ('TGDD-PC-ASUS-V501SV-C5'),
      ('TGDD2-PC-ASUS-AIO-V440VA'),
      ('TGDD2-PC-MSI-CUBI-N-ADL'),
      ('TGDD2-PC-MSI-PRO-DP180-I5'),
      ('TGDD2-PC-ROSA-ASUS-REZO-I121'),
      ('TGDD-ACC-AIRPODS-MAX-USBC'),
      ('TGDD-ACC-APPLE-WATCH-ULTRA-3'),
      ('TGDD-ACC-HUAWEI-WATCH-GT5-PRO'),
      ('TGDD-ACC-SAMSUNG-BUDS-CORE'),
      ('TGDD-ACC-SAMSUNG-BUDS4-PRO'),
      ('TGDD-ACC-SAMSUNG-EP-T6010NB'),
      ('TGDD-ACC-SAMSUNG-WATCH8-40'),
      ('TGDD-ACC-SONY-SRS-XB100'),
      ('TGDD-ACC-TPLINK-TAPO-C200C'),
      ('TGDD-ACC-UGREEN-20W-UNO'),
      ('TGDD-ACC-XIAOMI-MIBAND-10'),
      ('TGDD-ACC-XIAOMI-REDMI-WATCH-6'),
      ('TGDD2-ACC-AMAZFIT-BIP-MAX'),
      ('TGDD2-ACC-APPLE-WATCH-SE3-40'),
      ('TGDD2-ACC-HUAWEI-BAND-11'),
      ('TGDD2-ACC-HUAWEI-WATCH-FIT-5'),
      ('TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO'),
      ('TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025'),
      ('TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC'),
      ('TGDD2-ACC-XIAOMI-MIBAND-10-PRO')
  ) AS localized(sku)
);
