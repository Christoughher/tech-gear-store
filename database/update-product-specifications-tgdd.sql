-- =========================================================
-- TECH.NO TGDD PRODUCT SPECIFICATIONS
-- Generated from source URLs in update-product-gallery-images-tgdd.sql
-- Run after adding columns: source_url, specifications, specifications_updated_at.
-- Descriptions are intentionally not overwritten to avoid copying long TGDD content verbatim.
-- =========================================================

BEGIN;

WITH updates(sku, source_url, specifications, original_price) AS (
VALUES
  ('TGDD-PHN-SAMSUNG-A26-128', 'https://www.thegioididong.com/dtdd/samsung-galaxy-a26', '{"screen":"Super AMOLED - 6.7\" - Tần số quét 120 Hz - Full HD+ (1080 x 2340 Pixels)","os":"Android 15","chip":"Exynos 1380 8 nhân","ram":"8 GB","storage":"256 GB","battery":"5000 mAh","charging":"25 W","material":"Khung nhựa & Mặt lưng kính","sim":"2 Nano SIM (SIM 2 chung khe thẻ nhớ)","brand":"Samsung. Xem thông tin hãng"}'::jsonb, 8281000),
  ('TGDD-PHN-OPPO-RENO13-256', 'https://www.thegioididong.com/dtdd/oppo-reno13-5g', '{"screen":"AMOLED - 6.59\" - Tần số quét 120 Hz - 1.5K (1256 x 2760 Pixels)","os":"Android 15","chip":"MediaTek Dimensity 8350 5G 8 nhân","ram":"12 GB","storage":"256 GB","battery":"5600 mAh","charging":"80 W","material":"Khung kim loại & Mặt lưng kính","sim":"2 Nano SIM","brand":"OPPO. Xem thông tin hãng"}'::jsonb, 15436000),
  ('TGDD-PHN-XIAOMI-15T-512', 'https://www.thegioididong.com/dtdd/xiaomi-15t', '{}'::jsonb, NULL),
  ('TGDD-PHN-IPHONE-16E-512', 'https://www.thegioididong.com/dtdd/iphone-16e-512gb', '{"screen":"OLED - 6.1\" - Tần số quét 60 Hz - Super Retina XDR (1170 x 2532 Pixels)","os":"iOS 18","chip":"Apple A18 6 nhân","ram":"8 GB","storage":"512 GB","battery":"26 giờ","charging":"20 W","material":"Khung nhôm & Mặt lưng kính cường lực","sim":"1 Nano SIM & 1 eSIM","brand":"iPhone (Apple). Xem thông tin hãng"}'::jsonb, 26179000),
  ('TGDD-PHN-REALME-C75-256', 'https://www.thegioididong.com/dtdd/realme-c75', '{}'::jsonb, NULL),
  ('TGDD-PHN-REALME-14-256', 'https://www.thegioididong.com/dtdd/realme-14-5g', '{"screen":"AMOLED - 6.67\" - Tần số quét 120 Hz - Full HD+ (1080 x 2400 Pixels)","os":"Android 15","chip":"Snapdragon 6 Gen 4 5G 8 nhân","ram":"12 GB","storage":"256 GB","battery":"6000 mAh","charging":"45 W","material":"Khung & Mặt lưng nhựa","sim":"2 Nano SIM (SIM 2 chung khe thẻ nhớ)","brand":"realme. Xem thông tin hãng"}'::jsonb, 10164000),
  ('TGDD-PHN-SAMSUNG-S25-EDGE', 'https://www.thegioididong.com/dtdd/samsung-galaxy-s25-edge', '{}'::jsonb, NULL),
  ('TGDD-PHN-OPPO-RENO15-256', 'https://www.thegioididong.com/dtdd/oppo-reno15-5g', '{"os":"đa chức năng, khả năng tùy biến cao, đáp ứng mọi nhu cầu","brand":"oppo"}'::jsonb, 6490000),
  ('TGDD-PHN-VIVO-V60-LITE-512', 'https://www.thegioididong.com/dtdd/vivo-v60-lite-5g', '{}'::jsonb, NULL),
  ('TGDD-PHN-XIAOMI-15T-PRO-512', 'https://www.thegioididong.com/dtdd/xiaomi-15t-pro-5g', '{}'::jsonb, NULL),
  ('TGDD-LAP-HP-15-FD1043TU', 'https://www.thegioididong.com/laptop/hp-15-fd1043tu-core-5-120u-9z2w9pa', '{"cpu_technology":"Intel Core 5 Raptor Lake - 120U","gpu":"Card tích hợp - Intel Iris Xe Graphics","ram":"16 GB","storage":"1 TB SSD NVMe PCIe","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"Hãng không công bố","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 21101000),
  ('TGDD-LAP-HP-15-FD1037TU', 'https://www.thegioididong.com/laptop/hp-15-fd1037tu-core-7-150u-9z2w5pa', '{"cpu_technology":"Intel Core 7 Raptor Lake - 150U","gpu":"Card tích hợp - Intel Graphics","ram":"16 GB","storage":"1 TB SSD NVMe M.2 PCIe","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"Hãng không công bố","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 24433000),
  ('TGDD-LAP-MSI-KATANA-15-HX', 'https://www.thegioididong.com/laptop/msi-katana-15-hx-b14wek-i7-14650hx-027vn', '{"cpu_technology":"Intel Core i7 Raptor Lake - 14650HX","gpu":"Card rời - NVIDIA GeForce RTX 5050, 8 GB","ram":"32 GB","storage":"512 GB SSD NVMe M.2 PCIe Gen 4.0","screen_size":"15.6\"","resolution":"QHD","refresh_rate":"165 Hz","keyboard_backlight":"Đèn chuyển màu RGB - 4 vùng","cooling":"Cooler Boost 5"}'::jsonb, 50620000),
  ('TGDD-LAP-HP-PAVILION-X360', 'https://www.thegioididong.com/laptop/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa', '{"cpu_technology":"Intel Core 7 Raptor Lake - 150U","gpu":"Card tích hợp - Intel Graphics","ram":"16 GB","storage":"512 GB SSD NVMe PCIe (Có thể tháo ra, lắp thanh khác tối đa 1 TB)","screen_size":"14\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"Hãng không công bố","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 27404000),
  ('TGDD-LAP-HP-15-FC0023AU', 'https://www.thegioididong.com/laptop/hp-15-fc0023au-r5-7520u-d0bh1pa', '{"cpu_technology":"AMD Ryzen 5 - 7520U","gpu":"Card tích hợp - AMD Radeon 610M Graphics","ram":"16 GB","storage":"512 GB SSD M.2 NVMe PCIe","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"Hãng không công bố","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 23947000),
  ('TGDD-PC-ASUS-V501MV-C7', 'https://www.thegioididong.com/may-tinh-de-ban/asus-v501mv-core-7-240h-v501mv-07240h073w', '{"cpu":"Intel Core 7 Raptor Lake","ram":"16 GB","storage":"512 GB SSD M.2 NVMe PCIe 4.0","gpu":"Intel UHD","os":"Windows 11 Home"}'::jsonb, 30235000),
  ('TGDD-PC-ASUS-V501MV-C5', 'https://www.thegioididong.com/may-tinh-de-ban/asus-v501mv-core-5-210h-v501mv-05210h048w', '{"cpu":"Intel Core 5 Raptor Lake","ram":"8 GB","storage":"512 GB SSD M.2 2280 NVMe PCIe 4.0","gpu":"Intel UHD","os":"Windows 11 Home"}'::jsonb, 23013000),
  ('TGDD-PC-ASUS-V501SV-C5', 'https://www.thegioididong.com/may-tinh-de-ban/asus-v501sv-core-5-210h-v501sv-05210h040w', '{"cpu":"Intel Core 5 Raptor Lake","ram":"16 GB","storage":"512 GB SSD M.2 2280 NVMe PCIe 4.0","gpu":"Intel Graphics","os":"Windows 11 Home"}'::jsonb, 26743000),
  ('TGDD-ACC-AIRPODS-MAX-USBC', 'https://www.thegioididong.com/tai-nghe/airpods-max-cong-usb-c', '{"charging_time":"Dùng 20 giờ - Sạc 3 giờ","audio_technology":"Spatial AudioActive Noise CancellationChip Apple H1Adaptive EQTransparency Mode","compatibility":"Android iOS (iPhone)iPadOS (iPad)macOS (Macbook, iMac)","simultaneous_connections":"1 thiết bị","weight":"386.2 g"}'::jsonb, 14988000),
  ('TGDD-ACC-SAMSUNG-BUDS-CORE', 'https://www.thegioididong.com/tai-nghe/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n', '{"charging_time":"Dùng Khoảng 8.5 giờ (khi tắt ANC) - Sạc Khoảng 1.7 giờ","audio_technology":"Active Noise CancellationCông nghệ ENC Ambient Sound","compatibility":"Thiết bị Android phiên bản 8.0 trở lên iOS (iPhone)macOS (Macbook, iMac)Windows","simultaneous_connections":"1 thiết bị","dimensions":"Dài 1.92 cm - Rộng 1.71 cm - Cao 2.22 cm","weight":"5.3 g"}'::jsonb, 1179000),
  ('TGDD-ACC-SAMSUNG-BUDS4-PRO', 'https://www.thegioididong.com/tai-nghe/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n', '{"charging_time":"Dùng 7 giờ - Sạc Hãng không công bố","audio_technology":"Chống ồn chủ động Âm thanh Hi-Fi","compatibility":"MacOSAndroid, iOS, Windows","simultaneous_connections":"2 thiết bị","dimensions":"Dài 3 cm - Rộng 2 cm - Cao 2.3 cm"}'::jsonb, 6763000),
  ('TGDD-ACC-SONY-SRS-XB100', 'https://www.thegioididong.com/loa-laptop/loa-bluetooth-sony-srs-xb100', '{"battery_life":"Dùng khoảng 16 tiếng","audio_technology":"DSP X-Balanced Speaker Unit Khử tiếng vọng (cho micro tích hợp)","dimensions":"Ngang 7.6 cm - Sâu 7.6 cm - Cao 9.5 cm - Nặng 0.274 kg"}'::jsonb, 1453000),
  ('TGDD-ACC-TPLINK-TAPO-C200C', 'https://www.thegioididong.com/camera-giam-sat/camera-ip-360-do-tp-link-tapo-c200c', '{}'::jsonb, NULL),
  ('TGDD-ACC-UGREEN-20W-UNO', 'https://www.thegioididong.com/sac-dtdd/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764', '{"input":"Type C: 5V - 3A, 9V - 2.22A, 12V - 1.5A (Max 20W)","output":"Sạc không dây: 5W - 7.5W - 10W - 15W Type C: 5V - 3A, 9V - 2.22A, 12V - 1.5A (Max 20W)","dimensions":"Dày 2.2 cm - Rộng 7 cm - Dài 10.6 cm"}'::jsonb, 1483000),
  ('TGDD-ACC-SAMSUNG-EP-T6010NB', 'https://www.thegioididong.com/sac-dtdd/sac-nhanh-type-c-pd-60w-samsung-ep-t6010nb', '{}'::jsonb, NULL),
  ('TGDD-ACC-APPLE-WATCH-ULTRA-3', 'https://www.thegioididong.com/dong-ho-thong-minh/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean', '{"strap_material":"Cao su","strap_width":"Hãng không công bố","frame_material":"Titanium","battery_life":"Khoảng 42 giờ sử dụng cơ bản Khoảng 72 giờ ở chế độ tiết kiệm pin"}'::jsonb, 23902000),
  ('TGDD-ACC-SAMSUNG-WATCH8-40', 'https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-40mm-day-silicone', '{}'::jsonb, NULL),
  ('TGDD-ACC-XIAOMI-MIBAND-10', 'https://www.thegioididong.com/dong-ho-thong-minh/mi-band-10-den', '{}'::jsonb, NULL),
  ('TGDD-ACC-HUAWEI-WATCH-GT5-PRO', 'https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su', '{"strap_material":"Cao su","strap_width":"2.2 cm","frame_material":"Hợp kim Titanium","battery_life":"Khoảng 5 ngày (ở chế độ Always-On-Display)Khoảng 14 ngày (thời gian sử dụng tối đa)"}'::jsonb, 8306000),
  ('TGDD-ACC-XIAOMI-REDMI-WATCH-6', 'https://www.thegioididong.com/dong-ho-thong-minh/xiaomi-redmi-watch-6-den', '{}'::jsonb, NULL),
  ('TGDD2-PHN-SAMSUNG-A36-256', 'https://www.thegioididong.com/dtdd/samsung-galaxy-a36-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-SAMSUNG-A07-128', 'https://www.thegioididong.com/dtdd/samsung-galaxy-a07', '{}'::jsonb, NULL),
  ('TGDD2-PHN-SAMSUNG-A17-256', 'https://www.thegioididong.com/dtdd/samsung-galaxy-a17', '{}'::jsonb, NULL),
  ('TGDD2-PHN-OPPO-RENO14F-512', 'https://www.thegioididong.com/dtdd/oppo-reno14-f-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-OPPO-RENO14F-256', 'https://www.thegioididong.com/dtdd/oppo-reno14-f-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-OPPO-A5-128', 'https://www.thegioididong.com/dtdd/oppo-a5', '{"screen":"IPS LCD - HD+ (720 x 1520 Pixels)","chip":"Snapdragon 450","ram":"4 GB","storage":"64 GB","battery":"4230 mAh","charging":"Tiết kiệm pin","material":"Khung & Mặt lưng nhựa","sim":"2 Nano SIM","brand":"OPPO. Xem thông tin hãng"}'::jsonb, 6240000),
  ('TGDD2-PHN-OPPO-A6PRO-256', 'https://www.thegioididong.com/dtdd/oppo-a6-pro-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-REALME-15-12-256', 'https://www.thegioididong.com/dtdd/realme-15-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-REALME-15PRO-256', 'https://www.thegioididong.com/dtdd/realme-15-pro-5g', '{}'::jsonb, NULL),
  ('TGDD2-PHN-IPHONE-17PM-256', 'https://www.thegioididong.com/dtdd/iphone-17-pro-max-256gb', '{}'::jsonb, NULL),
  ('TGDD2-LAP-MACBOOK-NEO-13-256', 'https://www.thegioididong.com/laptop/macbook-neo-13-inch-a18-pro-8gb-256gb', '{}'::jsonb, NULL),
  ('TGDD2-LAP-DELL-15-DC15255', 'https://www.thegioididong.com/laptop/dell-15-dc15255-r5-7530u-dc5r5802w1', '{"cpu_technology":"AMD Ryzen 5 - 7530U","gpu":"Card tích hợp - AMD Radeon Graphics","ram":"16 GB","storage":"512 GB SSD M.2 NVMe PCIe (Có thể tháo ra, lắp thanh khác tối đa 1 TB)","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"120Hz","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 20932000),
  ('TGDD2-LAP-ACER-ASPIRE-GO14', 'https://www.thegioididong.com/laptop/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009', '{"cpu_technology":"Intel Core 5 Raptor Lake - 120U","gpu":"Card tích hợp - Intel UHD Graphics","ram":"16 GB","storage":"512 GB SSD NVMe PCIe (Có thể tháo ra, lắp thanh khác tối đa 2 TB)","screen_size":"14\"","resolution":"Full HD+ (1920 x 1200)","refresh_rate":"60Hz","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 23934000),
  ('TGDD2-LAP-ACER-ASPIRE-LITE15-R7', 'https://www.thegioididong.com/laptop/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001', '{"cpu_technology":"AMD Ryzen 7 - 5700U","gpu":"Card tích hợp - AMD Radeon Graphics","ram":"8 GB","storage":"512 GB SSD NVMe PCIe (Có thể tháo ra, lắp thanh khác tối đa 2 TB)","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"60Hz","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 15300000),
  ('TGDD2-LAP-LENOVO-SLIM3-15ARP10', 'https://www.thegioididong.com/laptop/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn', '{"cpu_technology":"AMD Ryzen 5 - 7535HS","gpu":"Card tích hợp - AMD Radeon 660M Graphics","ram":"16 GB","storage":"Hỗ trợ thêm 1 khe cắm SSD M.2 mở rộng (nâng cấp tối đa 1 TB)512 GB SSD NVMe M.2 PCIe Gen 4.0 (Có thể tháo ra, lắp thanh khác tối đa 1 TB (2242))","screen_size":"15.3\"","resolution":"WUXGA (1920 x 1200)","refresh_rate":"60Hz","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 24986000),
  ('TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA', 'https://www.thegioididong.com/laptop/asus-vivobook-16-a1607qa-x1-26-100-mb067w', '{"cpu_technology":"Snapdragon X - X1 26 100","gpu":"Card tích hợp - Qualcomm Adreno GPU","ram":"16 GB","storage":"512 GB SSD M.2 NVMe PCIe 4.0","screen_size":"16\"","resolution":"WUXGA (1920 x 1200)","refresh_rate":"60Hz","keyboard_backlight":"Đơn sắc - Màu trắng","cooling":"Hãng không công bố"}'::jsonb, 22763000),
  ('TGDD2-LAP-DELL-15-DC15250-I7', 'https://www.thegioididong.com/laptop/dell-15-dc15250-i7-dc5i7748w1', '{"cpu_technology":"Intel Core i7 Raptor Lake - 1355U","gpu":"Card tích hợp - Intel UHD Graphics","ram":"16 GB","storage":"512 GB SSD NVMe PCIe","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"120Hz","keyboard_backlight":"Không có đèn","cooling":"Hãng không công bố"}'::jsonb, 25813000),
  ('TGDD2-LAP-MSI-MODERN-15-F13MG', 'https://www.thegioididong.com/laptop/msi-modern-15-f13mg-i5-1334u-667vn-16gb', '{"cpu_technology":"Intel Core i5 Raptor Lake - 1334U","gpu":"Card tích hợp - Intel Iris Xe Graphics","ram":"16 GB","storage":"512 GB SSD PCIe M.2 (2280) (Có thể tháo rời, lắp thanh khác tối đa 4 TB (2280))","screen_size":"15.6\"","resolution":"Full HD (1920 x 1080)","refresh_rate":"60Hz","keyboard_backlight":"Đơn sắc - Màu trắng","cooling":"Hãng không công bố"}'::jsonb, 20092000),
  ('TGDD2-PC-ROSA-ASUS-REZO-I121', 'https://www.thegioididong.com/may-tinh-de-ban/rosa-x-asus-rezo-i121-core-i5-12400f-16gb-500gb-rtx-5060-8gb-win11pro', '{"mainboard":"Mini-ITX Micro-ATX","cpu":"i5","ram":"16 GB","storage":"500 GB","cooling":"Có","os":"Windows 11 Pro"}'::jsonb, 35216000),
  ('TGDD2-PC-MSI-CUBI-N-ADL', 'https://www.thegioididong.com/may-tinh-de-ban/minipc-msi-cubi-n-adl-235xvn-n100', '{"cpu":"Intel Processor","ram":"8 GB (1 thanh)","storage":"128 GB SSD M.2 NVMe PCIe Gen 3x2/SATA","os":"Windows 11 Home"}'::jsonb, 7086000),
  ('TGDD2-PC-MSI-PRO-DP180-I5', 'https://www.thegioididong.com/may-tinh-de-ban/msi-pro-dp180-i5-14400-9s6-b0a761-1220', '{"cpu":"i5","ram":"8 GB","storage":"512 GB SSD M.2 PCIe Gen 3 x 4","gpu":"Intel UHD","os":"Windows 11 Home"}'::jsonb, 15947000),
  ('TGDD2-PC-ASUS-AIO-V440VA', 'https://www.thegioididong.com/may-tinh-de-ban/asus-aio-v440va-core-7-240h-23-8-inch', '{}'::jsonb, NULL),
  ('TGDD2-ACC-HUAWEI-WATCH-FIT-5', 'https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-fit-5-42-9mm-day-nylon', '{"strap_material":"Nylon","strap_width":"2 cm","frame_material":"Nhôm","battery_life":"Khoảng 4 ngày (ở chế độ Always On Display)Khoảng 7 ngày (khi sử dụng thường xuyên)Khoảng 10 ngày (thời gian sử dụng tối đa)"}'::jsonb, 3871000),
  ('TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO', 'https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-fit-5-pro-44-5mm-day-nylon', '{"strap_material":"Nylon","strap_width":"2 cm","frame_material":"Khung Nhôm - Viền Titanium","battery_life":"Khoảng 4 ngày (ở chế độ Always On Display)Khoảng 10 ngày Khoảng 7 ngày (khi sử dụng thường xuyên)"}'::jsonb, 5484000),
  ('TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC', 'https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-classic-trang', '{}'::jsonb, NULL),
  ('TGDD2-ACC-APPLE-WATCH-SE3-40', 'https://www.thegioididong.com/dong-ho-thong-minh/apple-watch-se-3-40mm-vien-nhom-day-the-thao-trang', '{}'::jsonb, NULL),
  ('TGDD2-ACC-HUAWEI-BAND-11', 'https://www.thegioididong.com/dong-ho-thong-minh/vong-deo-tay-thong-minh-huawei-band-11-vien-nhom-day-cao-su-xanh', '{}'::jsonb, NULL),
  ('TGDD2-ACC-XIAOMI-MIBAND-10-PRO', 'https://www.thegioididong.com/dong-ho-thong-minh/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom', '{"strap_material":"Fluoro","strap_width":"2 cm","frame_material":"Gốm ceramic","battery_life":"Khoảng 7 ngày (khi bật Always On Display)Khoảng 21 ngày (ở chế độ cơ bản)"}'::jsonb, 2698000),
  ('TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025', 'https://www.thegioididong.com/dong-ho-thong-minh/galaxy-watch-ultra-2025-xanh', '{}'::jsonb, NULL),
  ('TGDD2-ACC-AMAZFIT-BIP-MAX', 'https://www.thegioididong.com/dong-ho-thong-minh/amazfit-bip-max-49-5mm-day-silicone', '{"strap_material":"Silicone","strap_width":"2.2 cm","frame_material":"Hợp kim nhôm","battery_life":"Khoảng 7 ngày (khi bật Always On Display)Khoảng 20 ngày (Chế độ cơ bản)"}'::jsonb, 3159000)
)
UPDATE public.products AS p
SET
  source_url = updates.source_url,
  original_price = CASE
    WHEN p.discount_percent > 0 AND p.discount_percent < 100 THEN
      ROUND(p.price / ((100 - p.discount_percent) / 100.0), 0)
    ELSE p.original_price
  END,
  specifications = COALESCE(p.specifications, '{}'::jsonb) || updates.specifications,
  specifications_updated_at = now()
FROM updates
WHERE p.sku = updates.sku;

COMMIT;

-- Fetch summary:
-- Generated update rows: 60
-- Source fetch failures: 24
-- Failed: TGDD-PHN-XIAOMI-15T-512 | https://www.thegioididong.com/dtdd/xiaomi-15t | TGDD source returned 404
-- Failed: TGDD-PHN-REALME-C75-256 | https://www.thegioididong.com/dtdd/realme-c75 | TGDD source returned 404
-- Failed: TGDD-PHN-SAMSUNG-S25-EDGE | https://www.thegioididong.com/dtdd/samsung-galaxy-s25-edge | TGDD source returned 404
-- Failed: TGDD-PHN-VIVO-V60-LITE-512 | https://www.thegioididong.com/dtdd/vivo-v60-lite-5g | TGDD source returned 404
-- Failed: TGDD-PHN-XIAOMI-15T-PRO-512 | https://www.thegioididong.com/dtdd/xiaomi-15t-pro-5g | TGDD source returned 404
-- Failed: TGDD-ACC-TPLINK-TAPO-C200C | https://www.thegioididong.com/camera-giam-sat/camera-ip-360-do-tp-link-tapo-c200c | TGDD source returned 404
-- Failed: TGDD-ACC-SAMSUNG-EP-T6010NB | https://www.thegioididong.com/sac-dtdd/sac-nhanh-type-c-pd-60w-samsung-ep-t6010nb | TGDD source returned 404
-- Failed: TGDD-ACC-SAMSUNG-WATCH8-40 | https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-40mm-day-silicone | TGDD source returned 404
-- Failed: TGDD-ACC-XIAOMI-MIBAND-10 | https://www.thegioididong.com/dong-ho-thong-minh/mi-band-10-den | TGDD source returned 404
-- Failed: TGDD-ACC-XIAOMI-REDMI-WATCH-6 | https://www.thegioididong.com/dong-ho-thong-minh/xiaomi-redmi-watch-6-den | TGDD source returned 404
-- Failed: TGDD2-PHN-SAMSUNG-A36-256 | https://www.thegioididong.com/dtdd/samsung-galaxy-a36-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-SAMSUNG-A07-128 | https://www.thegioididong.com/dtdd/samsung-galaxy-a07 | TGDD source returned 404
-- Failed: TGDD2-PHN-SAMSUNG-A17-256 | https://www.thegioididong.com/dtdd/samsung-galaxy-a17 | TGDD source returned 404
-- Failed: TGDD2-PHN-OPPO-RENO14F-512 | https://www.thegioididong.com/dtdd/oppo-reno14-f-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-OPPO-RENO14F-256 | https://www.thegioididong.com/dtdd/oppo-reno14-f-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-OPPO-A6PRO-256 | https://www.thegioididong.com/dtdd/oppo-a6-pro-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-REALME-15-12-256 | https://www.thegioididong.com/dtdd/realme-15-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-REALME-15PRO-256 | https://www.thegioididong.com/dtdd/realme-15-pro-5g | TGDD source returned 404
-- Failed: TGDD2-PHN-IPHONE-17PM-256 | https://www.thegioididong.com/dtdd/iphone-17-pro-max-256gb | TGDD source returned 404
-- Failed: TGDD2-PC-ASUS-AIO-V440VA | https://www.thegioididong.com/may-tinh-de-ban/asus-aio-v440va-core-7-240h-23-8-inch | TGDD source returned 404
-- Failed: TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC | https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-classic-trang | TGDD source returned 404
-- Failed: TGDD2-ACC-APPLE-WATCH-SE3-40 | https://www.thegioididong.com/dong-ho-thong-minh/apple-watch-se-3-40mm-vien-nhom-day-the-thao-trang | TGDD source returned 404
-- Failed: TGDD2-ACC-HUAWEI-BAND-11 | https://www.thegioididong.com/dong-ho-thong-minh/vong-deo-tay-thong-minh-huawei-band-11-vien-nhom-day-cao-su-xanh | TGDD source returned 404
-- Failed: TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025 | https://www.thegioididong.com/dong-ho-thong-minh/galaxy-watch-ultra-2025-xanh | TGDD source returned 404
