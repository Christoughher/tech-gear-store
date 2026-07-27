-- =========================================================
-- TECH.NO - 30 TGDD ACCESSORIES
-- 10 monitors, 10 mice and 10 keyboards.
-- Safe to rerun: inserts new SKUs and updates product content in place.
-- It never drops, truncates, deletes or rewrites users/orders.
-- =========================================================

BEGIN;

CREATE TEMP TABLE _techno_accessory_seed_guard ON COMMIT DROP AS
SELECT
  (SELECT count(*) FROM public.users) AS users_before,
  (SELECT count(*) FROM public.orders) AS orders_before;

WITH seed_products (
  sku,
  name,
  description,
  price,
  original_price,
  discount_percent,
  brand,
  subcategory,
  image_urls,
  stock,
  specifications,
  source_url
) AS (
  VALUES
  -- =======================================================
  -- MONITORS
  -- =======================================================
  (
    'TGDD-ACC-MONITOR-365874',
    'Màn hình Xiaomi A27i 2026 (27 inch Full HD, IPS, 144Hz, 6ms)',
    'Màn hình 27 inch tối giản, viền mỏng, IPS 144 Hz và HDR10, phù hợp cả làm việc lẫn giải trí.',
    2590000, 3090000, 16, 'xiaomi', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/365874/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-full-hd-144hz-6ms-den-1-639120150412185722-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/365874/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-full-hd-144hz-6ms-den-2-639120150454457146-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/365874/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-full-hd-144hz-6ms-den-3-639120150516995061-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/365874/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-full-hd-144hz-6ms-den-4-639120150537220282-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/365874/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-full-hd-144hz-6ms-99-639124655236923185-750x500.jpg'
    ]::text[],
    8,
    '{"monitor_type":"Phẳng","screen_size":"27 inch","resolution":"Full HD (1920 x 1080)","touchscreen":"Không cảm ứng","panel":"IPS","refresh_rate":"144 Hz","display_technology":"Giảm ánh sáng xanh; HDR10"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/man-hinh-xiaomi-a27i-2026-27-inch-full-hd-ips-144hz-6ms'
  ),
  (
    'TGDD-ACC-MONITOR-358519',
    'Màn hình Asus ProArt PA248QFV (24.1 inch, WUXGA, IPS, 100Hz, 5ms)',
    'ProArt tông đen bạc thanh lịch, màn 16:10 chuẩn màu và chân đế công thái học cho sáng tạo nội dung.',
    4990000, 5490000, 9, 'asus', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-1-638977777943800032-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-2-638977777951274022-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-3-638977777958509793-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-4-638977777968500201-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-5-638977777974624514-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-6-638977777981811841-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/358519/asus-proart-24-1-inch-full-hd-pa248qfv-7-638977777988152564-750x500.jpg'
    ]::text[],
    6,
    '{"monitor_type":"Phẳng","screen_size":"24.1 inch","resolution":"WUXGA (1920 x 1200)","touchscreen":"Không cảm ứng","panel":"IPS","refresh_rate":"100 Hz","display_technology":"Điều chỉnh màu RGB; Điều chỉnh Gamma; Tùy chỉnh nhiệt độ màu; ProArt Preset; ProArt Palette; Flicker-free; Adaptive Sync; DisplayWidget Center; QuickFit Plus; HDCP 1.4; Trace Free; Chế độ HDR; ASUS Power Sync; Low Blue Light; Sai lệch màu Delta E"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/asus-proart-24-1-inch-full-hd-pa248qfv'
  ),
  (
    'TGDD-ACC-MONITOR-363460',
    'Màn hình Gaming Asus TUF VG27AQE5A (27 inch, QHD, IPS, 165Hz, 0.3ms)',
    'Màn QHD 27 inch sắc nét, dáng TUF gaming mạnh mẽ, 165 Hz và phản hồi 0.3 ms.',
    3590000, 4290000, 16, 'asus', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-1-639086448648781008-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-2-639086448657484727-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-3-639086448667967173-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-4-639086448675253029-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-5-639086448681851759-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-6-639086448690406788-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/363460/asus-gaming-tuf-27-inch-qhd-vg27aqe5a-7-639086448697578800-750x500.jpg'
    ]::text[],
    9,
    '{"monitor_type":"Phẳng","screen_size":"27 inch","resolution":"QHD (2560 x 1440)","touchscreen":"Không cảm ứng","panel":"IPS","refresh_rate":"165 Hz","display_technology":"Dynamic Crosshair; AI Visual; DisplayWidget Center; Shadow Boost; HDCP 2.2; GameFast Input; 4 chế độ nhiệt độ màu; Game Visual; Trace Free; ASUS Power Sync; ASUS Dynamic Shadow Boost; GamePlus; ASUS Extreme Low Motion Blur; Low Blue Light; Adaptive-Sync"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/asus-gaming-tuf-27-inch-qhd-vg27aqe5a'
  ),
  (
    'TGDD-ACC-MONITOR-342368',
    'Màn hình Gaming Asus TUF VG249QM5A 23.8 inch FHD/Fast IPS/240Hz/0.3ms',
    'Màn TUF gọn gàng dành cho FPS, Fast IPS 240 Hz, phản hồi 0.3 ms và loa tích hợp.',
    2990000, 3690000, 18, 'asus', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-1-638914607458292011-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-2-638914607465912592-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-3-638914607472068661-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-4-638914607480620953-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-5-638914607487183537-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-6-638914607493279155-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/342368/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a-den-7-638914607501642864-750x500.jpg'
    ]::text[],
    10,
    '{"monitor_type":"Phẳng","screen_size":"23.8 inch","resolution":"Full HD (1920 x 1080)","touchscreen":"Không cảm ứng","panel":"Fast IPS","refresh_rate":"240 Hz","display_technology":"HDCP 2.3; DisplayWidget Center; Shadow Boost; GameVisual; GameFast Input; 4 chế độ nhiệt độ màu; Trace Free; GamePlus; ASUS Extreme Low Motion Blur; Low Blue Light; ELMB Sync; Adaptive-Sync"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/asus-gaming-tuf-23-8-inch-full-hd-vg249qm5a'
  ),
  (
    'TGDD-ACC-MONITOR-362353',
    'Màn hình Gaming Samsung Odyssey G5 G50F LS27FG502EEXXV (27 inch QHD, IPS, 180Hz, 1ms)',
    'Odyssey G5 phẳng viền mỏng, QHD 180 Hz, chân đế linh hoạt cho góc máy gaming hiện đại.',
    4590000, 5590000, 17, 'samsung', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-01-639051105237007864-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-2-639056200877907290-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-3-639056200999565523-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-4-639056201073766495-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-5-639056201152535104-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-6-639056201278663947-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/362353/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv-den-8-639056201339683104-750x500.jpg'
    ]::text[],
    7,
    '{"monitor_type":"Phẳng","screen_size":"27 inch","resolution":"QHD (2560 x 1440)","touchscreen":"Không cảm ứng","panel":"IPS","refresh_rate":"180 Hz","display_technology":"Eye Saver Mode; Flicker-free; Super Arena Gaming UX; Auto Source Switch; Energy Saving Solution; Image Size; FreeSync"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/samsung-gaming-odyssey-g5-g50f-27-inch-qhd-ls27fg502eexxv'
  ),
  (
    'TGDD-ACC-MONITOR-322533',
    'Màn hình Gaming Samsung Odyssey G5 G55C LS27CG552EEXXV 27 inch 2K/VA/165Hz/1ms',
    'Odyssey G5 cong 1000R đậm chất gaming, QHD 165 Hz, HDR10 cho trải nghiệm đắm chìm.',
    4590000, 5190000, 11, 'samsung', 'man-hinh',
    ARRAY[
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg55-den-1-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg55-den-2-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg55-den-3-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg55-den-4-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg55-den-5-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg552e-den-6-1-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/5697/322533/samsung-odyssey-g5-g55c-ls27cg552eexxv-7-1-750x500.jpg'
    ]::text[],
    8,
    '{"monitor_type":"Cong","screen_size":"27 inch","resolution":"QHD (2560 x 1440)","touchscreen":"Không cảm ứng","panel":"VA","refresh_rate":"165 Hz","display_technology":"Eye Saver Mode; Flicker-free; Auto Source Switch+; Black Equalizer; AMD FreeSync; HDR10; Curved Screen 1000R"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/samsung-odyssey-g5-g55c-ls27cg552eexxv-27-inch-2k'
  ),
  (
    'TGDD-ACC-MONITOR-368265',
    'Màn hình Gaming Samsung Odyssey OLED G6 G61SH LS27HG612SEXXV (27 inch QHD, OLED, 240Hz, 0.03ms)',
    'Odyssey OLED G6 mỏng hiện đại, OLED QHD 240 Hz và phản hồi 0.03 ms cho gaming cao cấp.',
    12890000, 14990000, 14, 'samsung', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-1-639177171617114344-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-2-639177171626258089-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-3-639177171642251958-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-4-639177171649227388-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-5-639177171666560530-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-6-639177171680870734-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/368265/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv-7-639177171690012431-750x500.jpg'
    ]::text[],
    4,
    '{"monitor_type":"Phẳng","screen_size":"27 inch","resolution":"QHD (2560 x 1440)","touchscreen":"Không cảm ứng","panel":"OLED","refresh_rate":"240 Hz","display_technology":"Eye Saver Mode; Super Arena Gaming UX; Auto Source Switch+; Off Timer Plus; Virtual AIM Point; Energy Saving Solution; Black Equalizer; Image Size; Flicker free Technology; FreeSync Premium; G-Sync Compatible"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/samsung-gaming-odyssey-oled-g6-g61sh-27-inch-qhd-ls27hg612sexxv'
  ),
  (
    'TGDD-ACC-MONITOR-337314',
    'Màn hình Gaming MSI MAG 255F-E20 24.5 inch FHD/Rapid IPS/200Hz/0.5ms',
    'Màn MSI MAG chân đế góc cạnh, Rapid IPS 200 Hz và FreeSync Premium, tối ưu cho game FPS.',
    2690000, 3190000, 15, 'msi', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-1-638810061422364039-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-2-638810061429051669-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-3-638810061435448268-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-4-638810061440650187-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-5-638810061446313441-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/337314/msi-mag-255f-e20-24-5fhd-ips-200hz-0-5ms-den-tem-30-638810135682517137-750x500.jpg'
    ]::text[],
    12,
    '{"monitor_type":"Phẳng","screen_size":"24.5 inch","resolution":"Full HD (1920 x 1080)","touchscreen":"Không cảm ứng","panel":"Rapid IPS","refresh_rate":"200 Hz","display_technology":"HDR Ready; AMD FreeSync Premium"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/msi-mag-255f-e20-24-5-inch-fhd-rapid-ips-200hz-0-5ms'
  ),
  (
    'TGDD-ACC-MONITOR-341853',
    'Màn hình Gaming MSI MAG 273QP QD-OLED X24 26.5 inch 2K/QD-OLED/240Hz/0.03ms',
    'Màn QD-OLED cao cấp 2K 240 Hz, sắc đen sâu và phản hồi 0.03 ms trong thiết kế gaming tinh gọn.',
    14390000, 16590000, 13, 'msi', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/341853/msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms-den-1-638903368919460518-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/341853/msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms-den-2-638903368927048015-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/341853/msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms-den-3-638903368935753557-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/341853/msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms-den-4-638903368943596992-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/341853/man-hinh-msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms-tem-638899917498094492-750x500.jpg'
    ]::text[],
    4,
    '{"monitor_type":"Phẳng","screen_size":"26.5 inch","resolution":"WQHD (2560 x 1440)","touchscreen":"Không cảm ứng","panel":"QD-OLED","refresh_rate":"240 Hz","display_technology":"Anti-Reflection; DisplayHDR True Black 400; Adaptive Sync"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/msi-mag-273qp-qd-oled-x24-26-5-inch-2k-qd-oled-240hz-0-03ms'
  ),
  (
    'TGDD-ACC-MONITOR-335630',
    'Màn hình Gaming GIGABYTE GS27FA 27 inch FHD/IPS/180Hz/1ms',
    'Màn Gigabyte 27 inch dáng tối giản, IPS 180 Hz, 105% sRGB và FreeSync cho gaming mượt.',
    2990000, 3490000, 14, 'gigabyte', 'man-hinh',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-1-638773923811538255-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-2-638773923823271965-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-3-638773923829748409-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-4-638773923835964142-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-5-638773923841430267-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5697/335630/gigabyte-gs27fa-27fhd-ips-180hz-1ms-den-tem-53-638773925509808277-750x500.jpg'
    ]::text[],
    10,
    '{"monitor_type":"Phẳng","screen_size":"27 inch","resolution":"Full HD (1920 x 1080)","touchscreen":"Không cảm ứng","panel":"IPS","refresh_rate":"180 Hz","display_technology":"Giảm ánh sáng xanh; FreeSync"}'::jsonb,
    'https://www.thegioididong.com/man-hinh-may-tinh/gigabyte-gs27fa-27fhd-ips-180hz-1ms'
  ),

  -- =======================================================
  -- MICE
  -- =======================================================
  (
    'TGDD-ACC-MOUSE-357685',
    'Chuột sạc Bluetooth Gaming Razer Cobra Pro',
    'Chuột gaming ba chế độ kết nối với thiết kế gọn, cảm biến Focus Pro 30K và hệ thống Razer Chroma RGB nổi bật.',
    2540000, 3190000, 20, 'razer', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357685/chuot-sac-bluetooth-gaming-razer-cobra-pro-den-1-638960529660115685.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357685/chuot-sac-bluetooth-gaming-razer-cobra-pro-den-2-638960529669266461.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357685/chuot-sac-bluetooth-gaming-razer-cobra-pro-den-3-638960529678127032.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357685/chuot-sac-bluetooth-gaming-razer-cobra-pro-den-4-638960529686110329.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357685/chuot-sac-bluetooth-gaming-razer-cobra-pro-den-5-638960529693485469.jpg'
    ]::text[],
    10,
    '{"mouse_type":"Không dây Gaming Bluetooth","compatibility":"macOS (MacBook, iMac), Windows, Linux","sensor":"Focus Pro 30K","max_resolution":"30000 DPI","cable_length":"Dây dài 190 cm","connection":"Bluetooth, Đầu thu USB Receiver, Wired Cable"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-sac-bluetooth-gaming-razer-cobra-pro'
  ),
  (
    'TGDD-ACC-MOUSE-357673',
    'Chuột Có dây Gaming Razer Basilisk V3 35K',
    'Chuột gaming công thái học cho tay phải, cảm biến 35K, con lăn HyperScroll và hệ thống RGB đặc trưng của Razer.',
    1840000, 2290000, 19, 'razer', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357673/chuot-co-day-gaming-razer-basilisk-v3-35k-den-1-638960497773937520-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357673/chuot-co-day-gaming-razer-basilisk-v3-35k-den-2-638960497782269088-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357673/chuot-co-day-gaming-razer-basilisk-v3-35k-den-3-638960497788515119-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357673/chuot-co-day-gaming-razer-v3-35k-99-638956218044673768-750x500.jpg'
    ]::text[],
    12,
    '{"mouse_type":"Có dây Gaming","compatibility":"Windows","sensor":"Focus Pro 35K (Optical Gen-2)","max_resolution":"35000 DPI","cable_length":"Dây dài 180 cm","connection":"Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-co-day-gaming-razer-basilisk-v3-35k'
  ),
  (
    'TGDD-ACC-MOUSE-357677',
    'Chuột sạc Bluetooth Gaming Razer Basilisk V3 Pro 35K Phantom Green Edition',
    'Phiên bản Phantom Green cá tính với vỏ xanh nổi bật, kết nối ba chế độ, cảm biến 35K và Razer Chroma RGB.',
    3790000, 4590000, 17, 'razer', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-1-638990594456320972.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-2-638990594463745540.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-3-638990594471390295.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-4-638990594479671776.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-5-638990594485796500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-6-638990594492259870.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357677/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition-14-638990594555866722.jpg'
    ]::text[],
    7,
    '{"mouse_type":"Không dây Gaming Bluetooth","compatibility":"macOS (MacBook, iMac), Windows, Linux","sensor":"Focus Pro 35K","max_resolution":"35000 DPI","cable_length":"Dây dài 190 cm","connection":"Bluetooth, Đầu thu USB Receiver, Wired Cable"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-sac-bluetooth-gaming-razer-basilisk-v3-pro-35k-phantom-green-edition'
  ),
  (
    'TGDD-ACC-MOUSE-357719',
    'Chuột sạc Không dây Gaming Razer Viper V3 Pro',
    'Mẫu chuột eSports siêu nhẹ 54 g, sử dụng cảm biến Focus Pro 35K và kết nối HyperSpeed độ trễ thấp.',
    3290000, 4290000, 23, 'razer', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-1-638990605325711062.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-2-638990605667868521.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-3-638990605675459880.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-4-638990605682988350.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-5-638990605690064608.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-6-638990605696833744.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/357719/chuot-sac-khong-day-gaming-razer-viper-v3-pro-7-638990605705454729.jpg'
    ]::text[],
    6,
    '{"mouse_type":"Không dây Gaming","compatibility":"Windows, Linux, macOS","sensor":"Focus Pro 35K","max_resolution":"35000 DPI","cable_length":"Hãng không công bố","connection":"Đầu thu USB Receiver"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-sac-khong-day-gaming-razer-viper-v3-pro'
  ),
  (
    'TGDD-ACC-MOUSE-361575',
    'Chuột không dây Gaming RAZER Orochi V2 - Đen',
    'Chuột gaming di động dưới 60 g, hỗ trợ Bluetooth và USB Receiver, phù hợp cho cả chơi game lẫn mang theo laptop.',
    710000, 890000, 20, 'razer', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/86/361575/chuot-khong-day-gaming-razer-orochi-v2-den-h-1-639107473167950833.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/86/361575/chuot-khong-day-gaming-razer-orochi-v2-den-h-2-639107473175499995.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/86/361575/chuot-khong-day-gaming-razer-orochi-v2-den-h-3-639107473185183327.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/86/361575/chuot-khong-day-gaming-razer-orochi-v2-den-h-4-639107473193030619.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/86/361575/chuot-khong-day-gaming-razer-orochi-v2-den-h-5-639107473201152063.jpg'
    ]::text[],
    15,
    '{"mouse_type":"Không dây Gaming Bluetooth","compatibility":"Windows, macOS","sensor":"Advanced Optical","max_resolution":"18000 DPI","cable_length":"Hãng không công bố","connection":"Bluetooth, Đầu thu USB Receiver"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-khong-day-gaming-razer-orochi-v2-den'
  ),
  (
    'TGDD-ACC-MOUSE-337338',
    'Chuột sạc Bluetooth Asus ROG Harpe Ace Aim Lab Edition',
    'Chuột eSports màu trắng siêu nhẹ 54 g, được tối ưu cùng Aim Lab và trang bị cảm biến ROG AimPoint 36K.',
    2440000, 2640000, 7, 'asus', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/337338/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition-trang-1-638811054870596819.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/337338/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition-trang-2-638811054875830430.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/337338/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition-trang-3-638811054880715720.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/337338/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition-trang-4-638811054886408806.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/337338/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition-trang-5-638811054893970958.jpg'
    ]::text[],
    8,
    '{"mouse_type":"Không dây Bluetooth","compatibility":"macOS (MacBook, iMac), Windows","sensor":"ROG AimPoint (optical)","max_resolution":"36000 DPI","cable_length":"Hãng không công bố","connection":"Bluetooth, Đầu thu USB Receiver, Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-sac-bluetooth-asus-rog-harpe-ace-aim-lab-edition'
  ),
  (
    'TGDD-ACC-MOUSE-326734',
    'Chuột sạc Không dây Gaming Logitech G502 X Plus Lightspeed',
    'Chuột gaming công thái học với 13 nút, dải LIGHTSYNC RGB bắt mắt và kết nối LIGHTSPEED độ trễ thấp.',
    3065000, 3815000, 19, 'logitech', 'chuot',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-1-638635635216252176.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-2-638635635221779671.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-3-638635635233791038.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-4-638635635239597259.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-5-638635635246185537.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-6-638635635253610521.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/86/326734/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed-den-7-638635635259518886.jpg'
    ]::text[],
    7,
    '{"mouse_type":"Không dây Gaming","compatibility":"macOS (MacBook, iMac), Windows","sensor":"Hãng không công bố","max_resolution":"25600 DPI","cable_length":"Hãng không công bố","connection":"Đầu thu USB Receiver, Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-khong-day-gaming-logitech-g502-x-plus-lightspeed'
  ),
  (
    'TGDD-ACC-MOUSE-326732',
    'Chuột Sạc Không dây Gaming Logitech Pro X Superlight 2 Lightspeed',
    'Chuột eSports không dây chỉ 60 g, độ phân giải tối đa 32K và thời lượng pin được công bố đến 95 giờ.',
    3190000, 3815000, 16, 'logitech', 'chuot',
    ARRAY[
      'https://cdn.tgdd.vn/Products/Images/86/326732/chuot-khong-day-gaming-logitech-pro-x-superlight-2-lightspeed-den-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/326732/chuot-khong-day-gaming-logitech-pro-x-superlight-2-lightspeed-den-3.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/326732/chuot-khong-day-gaming-logitech-pro-x-superlight-2-lightspeed-den-4.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/326732/chuot-khong-day-gaming-logitech-pro-x-superlight-2-lightspeed-den-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/326732/chuot-khong-day-gaming-logitech-g-pro-x-superlight-2-99.jpg'
    ]::text[],
    7,
    '{"mouse_type":"Không dây Gaming","compatibility":"Windows","sensor":"Hãng không công bố","max_resolution":"32000 DPI","cable_length":"Hãng không công bố","connection":"Đầu thu USB Receiver, Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-khong-day-gaming-logitech-pro-x-superlight-2-lightspeed'
  ),
  (
    'TGDD-ACC-MOUSE-313220',
    'Chuột Có dây Gaming MSI Clutch GM41 Lightweight V2',
    'Chuột gaming có dây nặng 65 g, độ phân giải 16K và logo rồng MSI với hiệu ứng RGB.',
    1125000, NULL, 0, 'msi', 'chuot',
    ARRAY[
      'https://cdn.tgdd.vn/Products/Images/86/313220/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2-1-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/313220/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2-2-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/313220/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2-3-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/313220/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2-4-750x500.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/313220/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2-5-750x500.jpg'
    ]::text[],
    11,
    '{"mouse_type":"Hãng không công bố","compatibility":"Windows","sensor":"Hãng không công bố","max_resolution":"16000 DPI","cable_length":"Dây dài 200 cm","connection":"Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-co-day-gaming-msi-clutch-gm41-lightweight-v2'
  ),
  (
    'TGDD-ACC-MOUSE-234490',
    'Chuột Có dây Gaming Logitech G102 Gen2 Lightsync',
    'Mẫu chuột gaming phổ thông với kiểu dáng cổ điển, 6 nút, độ phân giải 8K và dải LIGHTSYNC RGB 16,8 triệu màu.',
    380000, 590000, 35, 'logitech', 'chuot',
    ARRAY[
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-1-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-2-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-3-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-4-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-5-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-6-org.jpg',
      'https://cdn.tgdd.vn/Products/Images/86/234490/chuot-gaming-logitech-g102-gen2-lightsync-den-7-org.jpg'
    ]::text[],
    18,
    '{"mouse_type":"Có dây Gaming","compatibility":"Windows","sensor":"Hãng không công bố","max_resolution":"8000 DPI","cable_length":"Dây dài 209 cm","connection":"Dây cắm USB"}'::jsonb,
    'https://www.thegioididong.com/chuot-may-tinh/chuot-gaming-logitech-g102-gen2-lightsync'
  ),

  -- =======================================================
  -- KEYBOARDS
  -- =======================================================
  (
    'TGDD-ACC-KEYBOARD-337343',
    'Bàn Phím Cơ Bluetooth Asus ROG Strix Scope II 96 Snow',
    'Bàn phím gaming 96% cao cấp, ba chế độ kết nối, Snow Switch mượt, keycap PBT và LED RGB.',
    3705000, 4465000, 17, 'asus', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-1-638811118185724858-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-2-638811118194256882-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-3-638811118203501230-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-4-638811118211601174-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-5-638811118217072143-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337343/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow-den-6-638811119696528053-750x500.jpg'
    ]::text[],
    6,
    '{"compatibility":"Windows, macOS","connection":"USB Receiver (đầu thu USB), Dây cắm USB, Bluetooth","cable_length":"2 m","switch_type":"Snow Switch","keycap_material":"PBT","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-bluetooth-asus-rog-strix-scope-ii-96-snow'
  ),
  (
    'TGDD-ACC-KEYBOARD-337339',
    'Bàn Phím Cơ Bluetooth Asus ROG Azoth Wireless Mechanical Gaming Snow',
    'Bàn phím cơ gaming 75% cao cấp, Snow Switch, ba chế độ kết nối, màn hình hiển thị và RGB.',
    6350000, 7420000, 14, 'asus', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-1-638811744138567627.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-2-638811744145609358.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-3-638811744151778395.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-4-638811744157878116.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-5-638811744163256336.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/337339/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow-den-6-638811744169054135.jpg'
    ]::text[],
    5,
    '{"compatibility":"Windows, macOS","connection":"USB Receiver (đầu thu USB), Dây cắm USB, Bluetooth","cable_length":"2 m","switch_type":"Snow Switch","keycap_material":"PBT","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-bluetooth-asus-rog-azoth-wireless-mechanical-gaming-snow'
  ),
  (
    'TGDD-ACC-KEYBOARD-359228',
    'Bàn Phím Cơ Bluetooth Rapoo V700DIY 75',
    'Bàn phím cơ 75% phối màu nổi bật, kết nối ba chế độ, switch Linear, keycap PBT và LED.',
    1190000, 1490000, 20, 'rapoo', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/359228/ban-phim-co-bluetooth-rapoo-v700diy-75-xanh-duong-xam-hong-1-638996027307225854.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/359228/ban-phim-co-bluetooth-rapoo-v700diy-75-xanh-duong-xam-hong-2-638996027317082899.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/359228/ban-phim-co-bluetooth-rapoo-v700diy-75-xanh-duong-xam-hong-3-638996027323815266.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/359228/ban-phim-co-bluetooth-rapoo-v700diy-75-xanh-duong-xam-hong-4-638996027329745745.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/359228/ban-phim-co-bluetooth-rapoo-v700diy-75-xanh-duong-xam-hong-5-638996027337566104.jpg'
    ]::text[],
    11,
    '{"compatibility":"Windows, macOS","connection":"USB Receiver (đầu thu USB), Dây cắm USB, Bluetooth","cable_length":"Hãng không công bố","switch_type":"Linear","keycap_material":"PBT","led":"Có"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-bluetooth-rapoo-v700diy-75'
  ),
  (
    'TGDD-ACC-KEYBOARD-335191',
    'Bàn Phím Cơ Có Dây Rapoo V500 Pro 98',
    'Bàn phím cơ compact 98 phím, Red Switch êm, keycap PBT bền và đèn nền nổi bật.',
    685000, 785000, 12, 'rapoo', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/335191/ban-phim-co-co-day-rapoo-v500-pro-98-den-1-638784242650240969.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/335191/ban-phim-co-co-day-rapoo-v500-pro-98-den-2-638784242659097720.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/335191/ban-phim-co-co-day-rapoo-v500-pro-98-den-3-638784242664579255.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/335191/ban-phim-co-co-day-rapoo-v500-pro-98-den-4-638784242672981469.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/335191/ban-phim-co-co-day-rapoo-v500-pro-98-den-5-638784242679634538.jpg'
    ]::text[],
    15,
    '{"compatibility":"Windows, macOS","connection":"Dây cắm USB","cable_length":"1 m","switch_type":"Red Switch","keycap_material":"PBT","led":"Có"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-co-day-rapoo-v500-pro-98'
  ),
  (
    'TGDD-ACC-KEYBOARD-364801',
    'Bàn Phím Cơ Có Dây Rapoo V501 87',
    'Bàn phím cơ TKL 86 phím gọn chắc, Mechanical Switch, keycap ABS và LED RGB.',
    550000, 590000, 6, 'rapoo', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/364801/ban-phim-co-co-day-rapoo-v501-87-1-639108237829116830.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/364801/ban-phim-co-co-day-rapoo-v501-87-2-639108237835145509.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/364801/ban-phim-co-co-day-rapoo-v501-87-3-639108237841693886.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/364801/ban-phim-co-co-day-rapoo-v501-87-4-639108237848278052.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/364801/ban-phim-co-co-day-rapoo-v501-87-5-639108237855455989.jpg'
    ]::text[],
    14,
    '{"compatibility":"Windows","connection":"Dây cắm USB","cable_length":"1.8 m","switch_type":"Mechanical Switch","keycap_material":"ABS","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-co-day-rapoo-v501-87'
  ),
  (
    'TGDD-ACC-KEYBOARD-342573',
    'Bàn Phím Cơ Có Dây Akko FUN60 Pro SP White Akko Glare Magnetic Switches 5936',
    'Bàn phím gaming 60% màu trắng, Glare Magnetic Switch phản hồi nhanh, keycap PBT và RGB.',
    600000, 700000, 14, 'akko', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/342573/ban-phim-co-co-day-akko-fun60-pro-sp-white-1-638941329146326981.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/342573/ban-phim-co-co-day-akko-fun60-pro-sp-white-2-638941329154828581.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/342573/ban-phim-co-co-day-akko-fun60-pro-sp-white-3-638941329161800181.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/342573/ban-phim-co-co-day-akko-fun60-pro-sp-white-4-638941329169830742.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/342573/ban-phim-co-co-day-akko-fun60-pro-sp-white-5-638941329179669461.jpg'
    ]::text[],
    16,
    '{"compatibility":"Windows, macOS, Linux","connection":"Kết nối có dây qua cổng Type-C","cable_length":"1 m","switch_type":"Glare Magnetic","keycap_material":"PBT","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-co-day-akko-fun60-pro-sp-white'
  ),
  (
    'TGDD-ACC-KEYBOARD-339155',
    'Bàn Phím Cơ Bluetooth Logitech G515',
    'Bàn phím cơ gaming TKL low-profile mỏng đẹp, Switch cơ GL, kết nối đa chế độ và LED tùy biến.',
    2690000, 3425000, 21, 'logitech', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339155/ban-phim-co-bluetooth-logitech-g515-den-1-638850764294341508.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339155/ban-phim-co-bluetooth-logitech-g515-den-2-638850764300188412.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339155/ban-phim-co-bluetooth-logitech-g515-den-3-638850764306131214.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339155/ban-phim-co-bluetooth-logitech-g515-den-4-638850764312269572.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339155/ban-phim-co-bluetooth-logitech-g515-den-5-638850764317698729.jpg'
    ]::text[],
    8,
    '{"compatibility":"macOS 12 trở lên, iOS 10 trở lên, Windows 10 trở lên, Android 4.3 trở lên, Chrome OS","connection":"USB Receiver (đầu thu USB), Dây cắm USB, Bluetooth","cable_length":"1.8 m","switch_type":"Switch cơ GL","keycap_material":"Hãng không công bố","led":"Có"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-bluetooth-logitech-g515'
  ),
  (
    'TGDD-ACC-KEYBOARD-327809',
    'Bàn Phím Cơ Có Dây Gaming HP HyperX Alloy Origins Core 4P5P1AA',
    'Bàn phím gaming TKL khung chắc, HyperX Aqua tactile, LED RGB và phần mềm HyperX NGENUITY.',
    2050000, NULL, 0, 'hyperx', 'ban-phim',
    ARRAY[
      'https://cdn.tgdd.vn/Products/Images/4547/327809/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/4547/327809/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/4547/327809/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa-3.jpg',
      'https://cdn.tgdd.vn/Products/Images/4547/327809/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa-4.jpg',
      'https://cdn.tgdd.vn/Products/Images/4547/327809/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa-99.jpg'
    ]::text[],
    9,
    '{"compatibility":"Windows, macOS, Linux","connection":"Dây cắm USB","cable_length":"1.8 m","switch_type":"HyperX Aqua","keycap_material":"Hãng không công bố","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-co-day-gaming-hp-hyperx-alloy-origins-core-4p5p1aa'
  ),
  (
    'TGDD-ACC-KEYBOARD-339122',
    'Bàn Phím Cơ Bluetooth Dareu EK98 Pro',
    'Bàn phím 97 phím phối màu đẹp, Gasket-Mount, DareU Cloud switch, triple-mode, PBT và RGB.',
    1260000, 1560000, 19, 'dareu', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-1-638846446273140285.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-2-638846446279618532.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-3-638846446286353364.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-4-638846446293518431.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-5-638846446299417219.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/339122/ban-phim-co-bluetooth-dareu-ek98-pro-den-6-638846446305778328.jpg'
    ]::text[],
    12,
    '{"compatibility":"Windows, Mobile, macOS","connection":"USB Receiver (đầu thu USB), Bluetooth, Dây","cable_length":"1.8 m","switch_type":"DareU Cloud switch","keycap_material":"PBT","led":"RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-bluetooth-dareu-ek98-pro'
  ),
  (
    'TGDD-ACC-KEYBOARD-357603',
    'Bàn Phím Cơ Có Dây Gaming Razer BlackWidow V3 Green Switch',
    'Bàn phím gaming full-size, Razer Green Switch clicky, keycap ABS Doubleshot, Chroma RGB và núm media.',
    1890000, 2190000, 13, 'razer', 'ban-phim',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357603/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch-den-1-638959527106015190.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357603/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch-den-2-638959527113688723.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357603/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch-den-3-638959527120659141.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357603/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch-den-4-638959527128259828.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/357603/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch-99-638956897628577663.jpg'
    ]::text[],
    10,
    '{"compatibility":"Windows, macOS, Linux","connection":"Dây cắm USB","cable_length":"2 m","switch_type":"Razer Green Switch","keycap_material":"ABS Doubleshot","led":"Razer Chroma RGB"}'::jsonb,
    'https://www.thegioididong.com/ban-phim/ban-phim-co-co-day-gaming-razer-blackwidow-v3-green-switch'
  )
)

INSERT INTO public.products (
  sku,
  name,
  description,
  short_description,
  price,
  original_price,
  discount_percent,
  category_id,
  brand,
  subcategory,
  image_urls,
  stock,
  status,
  specifications,
  source_url,
  specifications_updated_at,
  updated_at
)
SELECT
  sku,
  name,
  description,
  description,
  price,
  original_price,
  discount_percent,
  'phukien',
  brand,
  subcategory,
  image_urls,
  stock,
  'active',
  specifications,
  source_url,
  now(),
  now()
FROM seed_products
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  subcategory = EXCLUDED.subcategory,
  image_urls = EXCLUDED.image_urls,
  status = EXCLUDED.status,
  specifications = EXCLUDED.specifications,
  source_url = EXCLUDED.source_url,
  specifications_updated_at = EXCLUDED.specifications_updated_at,
  updated_at = now();

DO $$
DECLARE
  seeded_count integer;
  users_after bigint;
  orders_after bigint;
  expected_users bigint;
  expected_orders bigint;
BEGIN
  SELECT count(*)
  INTO seeded_count
  FROM public.products
  WHERE sku LIKE 'TGDD-ACC-MONITOR-%'
     OR sku LIKE 'TGDD-ACC-MOUSE-%'
     OR sku LIKE 'TGDD-ACC-KEYBOARD-%';

  IF seeded_count <> 30 THEN
    RAISE EXCEPTION 'Expected 30 seeded accessories, found %', seeded_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE (
      sku LIKE 'TGDD-ACC-MONITOR-%'
      OR sku LIKE 'TGDD-ACC-MOUSE-%'
      OR sku LIKE 'TGDD-ACC-KEYBOARD-%'
    )
      AND COALESCE(cardinality(image_urls), 0) NOT BETWEEN 2 AND 7
  ) THEN
    RAISE EXCEPTION 'Every seeded accessory must have between 2 and 7 gallery images';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku LIKE 'TGDD-ACC-MONITOR-%'
      AND NOT specifications ?& ARRAY[
        'monitor_type',
        'screen_size',
        'resolution',
        'touchscreen',
        'panel',
        'refresh_rate',
        'display_technology'
      ]
  ) THEN
    RAISE EXCEPTION 'A monitor is missing a required specification';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku LIKE 'TGDD-ACC-MOUSE-%'
      AND NOT specifications ?& ARRAY[
        'mouse_type',
        'compatibility',
        'sensor',
        'max_resolution',
        'cable_length',
        'connection'
      ]
  ) THEN
    RAISE EXCEPTION 'A mouse is missing a required specification';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku LIKE 'TGDD-ACC-KEYBOARD-%'
      AND NOT specifications ?& ARRAY[
        'compatibility',
        'connection',
        'cable_length',
        'switch_type',
        'keycap_material',
        'led'
      ]
  ) THEN
    RAISE EXCEPTION 'A keyboard is missing a required specification';
  END IF;

  SELECT guard.users_before, guard.orders_before
  INTO expected_users, expected_orders
  FROM _techno_accessory_seed_guard AS guard;

  SELECT count(*) INTO users_after FROM public.users;
  SELECT count(*) INTO orders_after FROM public.orders;

  IF users_after <> expected_users OR orders_after <> expected_orders THEN
    RAISE EXCEPTION
      'Safety check failed: users/orders count changed (%/% -> %/%)',
      expected_users,
      expected_orders,
      users_after,
      orders_after;
  END IF;
END;
$$;

COMMIT;

SELECT
  subcategory,
  count(*) AS products,
  min(cardinality(image_urls)) AS min_gallery_images,
  max(cardinality(image_urls)) AS max_gallery_images
FROM public.products
WHERE sku LIKE 'TGDD-ACC-MONITOR-%'
   OR sku LIKE 'TGDD-ACC-MOUSE-%'
   OR sku LIKE 'TGDD-ACC-KEYBOARD-%'
GROUP BY subcategory
ORDER BY subcategory;
