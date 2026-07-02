-- =========================================================
-- TECH.NO TGDD PRODUCT THUMBNAILS + DETAIL GALLERIES
-- image_urls[1] is the stable product thumbnail for listing cards.
-- image_urls[2..] are TGDD detail gallery images for the product detail slider.
-- Run this after seeding products.
-- =========================================================

BEGIN;

-- Samsung Galaxy A26 5G 6GB/128GB
-- Source: https://www.thegioididong.com/dtdd/samsung-galaxy-a26
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335915-600x600-3.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-SAMSUNG-A26-128';

-- OPPO Reno13 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/oppo-reno13-5g
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/332934.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/332934/oppo-reno13-blue-1-638711561210182261.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/332934/oppo-reno13-blue-2-638711561216233130.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/332934/oppo-reno13-blue-3-638711561221708950.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/332934/oppo-reno13-blue-4-638711561227870626.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-OPPO-RENO13-256';

-- Xiaomi 15T 5G 12GB/512GB
-- Source: https://www.thegioididong.com/dtdd/xiaomi-15t
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/42/344645/xiaomi-15t-12gb-512gb-xam-den-thumb-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-XIAOMI-15T-512';

-- iPhone 16e 512GB
-- Source: https://www.thegioididong.com/dtdd/iphone-16e-512gb
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/42/334866/iphone-16e-trang-thumb-1-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334866/iphone-16e-white-1-639174846554461921.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334866/iphone-16e-white-2-639174846566367514.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334866/iphone-16e-white-3-639174846573656340.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334866/iphone-16e-white-4-639174846580896696.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-IPHONE-16E-512';

-- realme C75 8GB/256GB
-- Source: https://www.thegioididong.com/dtdd/realme-c75
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/332235-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-REALME-C75-256';

-- realme 14 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/realme-14-5g
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/336623-600x600-2.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/336623/realme-14-xam-01-638878505457390849.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/336623/realme-14-xam-02-638878505463505808.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/336623/realme-14-xam-03-638878505469355769.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/336623/realme-14-xam-04-638878505475342249.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-REALME-14-256';

-- Samsung Galaxy S25 Edge 5G 12GB/512GB
-- Source: https://www.thegioididong.com/dtdd/samsung-galaxy-s25-edge
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335955.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-SAMSUNG-S25-EDGE';

-- OPPO Reno15 5G 8GB/256GB
-- Source: https://www.thegioididong.com/dtdd/oppo-reno15-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/360238-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-OPPO-RENO15-256';

-- vivo V60 Lite 5G 12GB/512GB
-- Source: https://www.thegioididong.com/dtdd/vivo-v60-lite-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/357577-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-VIVO-V60-LITE-512';

-- Xiaomi 15T Pro 5G 12GB/512GB
-- Source: https://www.thegioididong.com/dtdd/xiaomi-15t-pro-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/42/356739/xiaomi-15t-pro-5g-12gb-512gb-den-thumb-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD-PHN-XIAOMI-15T-PRO-512';

-- HP 15 fd1043TU Core 5 120U (9Z2W9PA)
-- Source: https://www.thegioididong.com/laptop/hp-15-fd1043tu-core-5-120u-9z2w9pa
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-040825-020241-865-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-1-638904628029769735.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-2-638904628024589312.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-3-638904628018806069.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-4-638904628013547452.jpg']::TEXT[]
WHERE sku = 'TGDD-LAP-HP-15-FD1043TU';

-- HP 15 fd1037TU Core 7 150U (9Z2W5PA)
-- Source: https://www.thegioididong.com/laptop/hp-15-fd1037tu-core-7-150u-9z2w5pa
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1037tu-core-7-150u-9z2w5pa-thumb-2-638943948968294518-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1043tu-core-5-120u-9z2w9pa-1-638904633351128208.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1043tu-core-5-120u-9z2w9pa-2-638904633345951000.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1043tu-core-5-120u-9z2w9pa-3-638904633340321258.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1043tu-core-5-120u-9z2w9pa-4-638904633334723647.jpg']::TEXT[]
WHERE sku = 'TGDD-LAP-HP-15-FD1037TU';

-- MSI Gaming Katana 15 HX B14WEK i7 14650HX (027VN)
-- Source: https://www.thegioididong.com/laptop/msi-katana-15-hx-b14wek-i7-14650hx-027vn
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-thumb02-638897277627603509-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-1-638903522330487725.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-2-638903522324108575.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-3-638903469274003391.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-4-638903469279970319.jpg']::TEXT[]
WHERE sku = 'TGDD-LAP-MSI-KATANA-15-HX';

-- HP Pavilion X360 14 ek2013TU Core 7 150U (9Z2V4PA)
-- Source: https://www.thegioididong.com/laptop/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-638900119982403211-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-1-638880871471727503.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-2-638880871478562031.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-3-638880871485697821.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-4-638880871492479793.jpg']::TEXT[]
WHERE sku = 'TGDD-LAP-HP-PAVILION-X360';

-- HP 15 fc0023AU R5 7520U (D0BH1PA)
-- Source: https://www.thegioididong.com/laptop/hp-15-fc0023au-r5-7520u-d0bh1pa
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-thumb-639030592238863081-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-1-639033802508702931.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-2-639033802501725882.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-3-639033802493189488.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-4-639033802566519971.jpg']::TEXT[]
WHERE sku = 'TGDD-LAP-HP-15-FC0023AU';

-- ASUS V501MV Core 7 240H (V501MV-07240H073W)
-- Source: https://www.thegioididong.com/may-tinh-de-ban/asus-v501mv-core-7-240h-v501mv-07240h073w
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-thumb-639111802841934471-300x300.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-1-639111809693015940.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-2-639112371972126108.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-3-639112371981542759.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-4-639112371993166230.jpg']::TEXT[]
WHERE sku = 'TGDD-PC-ASUS-V501MV-C7';

-- ASUS V501MV Core 5 210H (V501MV-05210H048W)
-- Source: https://www.thegioididong.com/may-tinh-de-ban/asus-v501mv-core-5-210h-v501mv-05210h048w
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-thumb-639093114325603581-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-1-639093114455912321.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-3-639093641362334386.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-2-639093641355477303.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-4-639093641369103411.jpg']::TEXT[]
WHERE sku = 'TGDD-PC-ASUS-V501MV-C5';

-- ASUS V501SV Core 5 210H (V501SV-05210H040W)
-- Source: https://www.thegioididong.com/may-tinh-de-ban/asus-v501sv-core-5-210h-v501sv-05210h040w
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-thumb-639093118678835998-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-1-639093118778369454.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-2-639093644812228581.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-3-639093644818962315.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-4-639093644827634366.jpg']::TEXT[]
WHERE sku = 'TGDD-PC-ASUS-V501SV-C5';

-- AirPods Max cong USB C
-- Source: https://www.thegioididong.com/tai-nghe/airpods-max-cong-usb-c
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/54/329161/airpods-max-cong-usb-c-den-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/329161/airpods-max-cong-usb-c-xanh-1-638930224209100976.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/329161/airpods-max-cong-usb-c-xanh-2-638930224216129658.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/329161/airpods-max-cong-usb-c-xanh-3-638930224224295509.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/329161/airpods-max-cong-usb-c-tem-99-638979560904640578.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-AIRPODS-MAX-USBC';

-- Tai nghe TWS Samsung Galaxy Buds Core R410N
-- Source: https://www.thegioididong.com/tai-nghe/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-thumb-639026914590017606-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-den-1-638917139326060212.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-den-2-638917139333796415.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-den-3-638917139340823898.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-den-4-638917139346157989.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-SAMSUNG-BUDS-CORE';

-- Tai nghe TWS Samsung Galaxy Buds4 Pro R640N
-- Source: https://www.thegioididong.com/tai-nghe/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-thumb-639076639855476853-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-den-1-639087580780099778.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-den-2-639087580786937457.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-den-3-639087580793934731.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-den-4-639087580802805623.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-SAMSUNG-BUDS4-PRO';

-- Loa Bluetooth Sony SRS-XB100
-- Source: https://www.thegioididong.com/loa-laptop/loa-bluetooth-sony-srs-xb100
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-050325-015315-823-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-den-1-638646020813403204.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-den-2-638646020819442592.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-den-3-638646020825631220.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-den-4-638646020835235651.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-SONY-SRS-XB100';

-- Camera IP 360 Do TP-Link Tapo C200C
-- Source: https://www.thegioididong.com/camera-giam-sat/camera-ip-360-do-tp-link-tapo-c200c
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/327948.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-TPLINK-TAPO-C200C';

-- Ugreen 20W Uno PB764
-- Source: https://www.thegioididong.com/sac-dtdd/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-thumb-638781903605511945-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-xam-1-638781705310951319.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-xam-2-638781705317689032.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-xam-3-638781705304220116.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-xam-4-638781705324277235.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-UGREEN-20W-UNO';

-- Sac nhanh Samsung EP-T6010NB
-- Source: https://www.thegioididong.com/sac-dtdd/sac-nhanh-type-c-pd-60w-samsung-ep-t6010nb
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/9499/362999/sac-nhanh-type-c-pd-60w-samsung-ep-t6010nb-thumb-639063206180981245-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-SAMSUNG-EP-T6010NB';

-- Apple Watch Ultra 3 GPS + Cellular 49mm vien Titanium day Ocean
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-tu-nhien-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-den-1-638931950391226626.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-den-2-638931950398035319.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-den-3-639177440164136319.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-den-4-639177440171341864.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-APPLE-WATCH-ULTRA-3';

-- Samsung Galaxy Watch8 40mm day silicone
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-40mm-day-silicone
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/338265.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-SAMSUNG-WATCH8-40';

-- Xiaomi Mi Band 10 vien nhom day TPU
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/mi-band-10-den
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/336899/mi-band-10-den-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-XIAOMI-MIBAND-10';

-- Huawei Watch GT 5 Pro 46mm vien Titanium day cao su
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-tb-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-1-638627737540846978.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-2-638627737547044420.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-3-638627737552861441.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-4-638627737528309727.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-HUAWEI-WATCH-GT5-PRO';

-- Xiaomi Redmi Watch 6
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/xiaomi-redmi-watch-6-den
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/365217/xiaomi-redmi-watch-6-den-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD-ACC-XIAOMI-REDMI-WATCH-6';

-- Samsung Galaxy A36 5G 8GB/256GB
-- Source: https://www.thegioididong.com/dtdd/samsung-galaxy-a36-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335174-600x600-3.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-SAMSUNG-A36-256';

-- Samsung Galaxy A07 6GB/128GB
-- Source: https://www.thegioididong.com/dtdd/samsung-galaxy-a07
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341804-600x600-4.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-SAMSUNG-A07-128';

-- Samsung Galaxy A17 8GB/256GB
-- Source: https://www.thegioididong.com/dtdd/samsung-galaxy-a17
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341800.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-SAMSUNG-A17-256';

-- OPPO Reno14 F 5G 12GB/512GB
-- Source: https://www.thegioididong.com/dtdd/oppo-reno14-f-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/339178-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-OPPO-RENO14F-512';

-- OPPO Reno14 F 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/oppo-reno14-f-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/339177-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-OPPO-RENO14F-256';

-- OPPO A5 8GB/128GB
-- Source: https://www.thegioididong.com/dtdd/oppo-a5
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341378-600x600-3.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-OPPO-A5-128';

-- OPPO A6 Pro 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/oppo-a6-pro-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/344649-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-OPPO-A6PRO-256';

-- realme 15 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/realme-15-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/343066-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-REALME-15-12-256';

-- realme 15 Pro 5G 12GB/256GB
-- Source: https://www.thegioididong.com/dtdd/realme-15-pro-5g
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/343067-600x600-2.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-REALME-15PRO-256';

-- iPhone 17 Pro Max 256GB
-- Source: https://www.thegioididong.com/dtdd/iphone-17-pro-max-256gb
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/42/342679/iphone-17-pro-max-cam-thumb-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-PHN-IPHONE-17PM-256';

-- MacBook Neo 13 inch A18 Pro 8GB/256GB
-- Source: https://www.thegioididong.com/laptop/macbook-neo-13-inch-a18-pro-8gb-256gb
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-hong-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-bai-viet-8-639089943823967538.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-bai-viet-5-639089938397645373.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-bai-viet-1-639089938359744585.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-bai-viet-4-639089938387734470.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-MACBOOK-NEO-13-256';

-- Dell 15 DC15255 R5 7530U (DC5R5802W1)
-- Source: https://www.thegioididong.com/laptop/dell-15-dc15255-r5-7530u-dc5r5802w1
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-thumb-638920698565049808-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-1-638918053001287034.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-2-638918052995688169.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-3-638918052989690163.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-4-638918052983732856.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-DELL-15-DC15255';

-- Acer Aspire Go 14 AG14-72P-54DF Core 5 120U
-- Source: https://www.thegioididong.com/laptop/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-thumb-639088184873844833-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-1-639088229828887183.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-2-639088229819995923.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-3-639088229835973976.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-4-639088229812363723.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-ACER-ASPIRE-GO14';

-- Acer Aspire Lite 15 AL15 41P R3QL R7 5700U
-- Source: https://www.thegioididong.com/laptop/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-thumb-638828183898800384-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-1-638763383162404629.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-2-638763383168735232.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-3-638763383174528924.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-4-638763383181189320.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-ACER-ASPIRE-LITE15-R7';

-- Lenovo IdeaPad Slim 3 15ARP10 R5 7535HS
-- Source: https://www.thegioididong.com/laptop/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-thumb-639040845973149920-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-1-639039007119979825.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-2-639039007056249163.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-3-639039007113318134.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-4-639039007049811199.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-LENOVO-SLIM3-15ARP10';

-- Asus Vivobook 16 A1607QA X1 26 100
-- Source: https://www.thegioididong.com/laptop/asus-vivobook-16-a1607qa-x1-26-100-mb067w
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-thumb-2-639155694743786038-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-1-639094284869406469.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-2-639094284876130869.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-3-639094284883322298.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-4-639094284890133599.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA';

-- Dell 15 DC15250 i7 1355U (DC5I7748W1)
-- Source: https://www.thegioididong.com/laptop/dell-15-dc15250-i7-dc5i7748w1
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-638900114799182560-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-1-638881962027075213.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-2-638881962034458241.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-3-638881962040646558.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-4-638881962047401013.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-DELL-15-DC15250-I7';

-- MSI Modern 15 F13MG i5 1334U (667VN_16GB)
-- Source: https://www.thegioididong.com/laptop/msi-modern-15-f13mg-i5-1334u-667vn-16gb
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-thumb-2-638981132535627040-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-1-638919735568016358.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-2-638919735560772083.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-3-638919735516427677.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-4-638919735480560044.jpg']::TEXT[]
WHERE sku = 'TGDD2-LAP-MSI-MODERN-15-F13MG';

-- ROSA x ASUS Rezo I121 Core i5 12400F RTX 5060
-- Source: https://www.thegioididong.com/may-tinh-de-ban/rosa-x-asus-rezo-i121-core-i5-12400f-16gb-500gb-rtx-5060-8gb-win11pro
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-12400f-16gb-500gb-rtx-5060-8gb-win11pro-thumb-638993426979699750-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-1-638993353258334112.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-2-638993353266590368.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-3-638993353274029522.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-4-638993353280695152.jpg']::TEXT[]
WHERE sku = 'TGDD2-PC-ROSA-ASUS-REZO-I121';

-- MiniPC MSI CUBI N ADL-235XVN N100
-- Source: https://www.thegioididong.com/may-tinh-de-ban/minipc-msi-cubi-n-adl-235xvn-n100
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-thumb-639005316398817754-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-den-1-639005508575528628.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-den-2-639005508623702217.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-3den-3-639005508479088909.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-3den-4-639005508528360366.jpg']::TEXT[]
WHERE sku = 'TGDD2-PC-MSI-CUBI-N-ADL';

-- MSI Pro DP180 i5 14400 (9S6-B0A761-1220)
-- Source: https://www.thegioididong.com/may-tinh-de-ban/msi-pro-dp180-i5-14400-9s6-b0a761-1220
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-thumb-639046714306698581-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-1-639046714395720428.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-den-2-639051049687351577.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-den-3-639051049694902298.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-den-4-639051049701554555.jpg']::TEXT[]
WHERE sku = 'TGDD2-PC-MSI-PRO-DP180-I5';

-- ASUS AIO V440VA Core 7 240H 23.8 inch
-- Source: https://www.thegioididong.com/may-tinh-de-ban/asus-aio-v440va-core-7-240h-23-8-inch
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/364500.png']::TEXT[]
WHERE sku = 'TGDD2-PC-ASUS-AIO-V440VA';

-- Huawei Watch Fit 5 42.9mm day nylon
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-fit-5-42-9mm-day-nylon
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-thumb-3-639144521826494787-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-180526-093730-456.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-180526-093732-081.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-180526-093733-596.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-180526-093734-728.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-HUAWEI-WATCH-FIT-5';

-- Huawei Watch Fit 5 Pro 44.5mm day nylon
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/huawei-watch-fit-5-pro-44-5mm-day-nylon
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-thumb-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-180526-100514-440.png', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-180526-100528-546.png', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-180526-100548-252.png', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-180526-100521-632.png']::TEXT[]
WHERE sku = 'TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO';

-- Samsung Galaxy Watch8 Classic 46mm day da
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/samsung-galaxy-watch8-classic-trang
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/338266/samsung-galaxy-watch8-classic-trang-tn-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC';

-- Apple Watch SE 3 GPS 40mm vien nhom day the thao
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/apple-watch-se-3-40mm-vien-nhom-day-the-thao-trang
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/344767/apple-watch-se-3-40mm-vien-nhom-day-the-thao-trang-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-APPLE-WATCH-SE3-40';

-- Huawei Band 11 vien nhom day Fluor
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/vong-deo-tay-thong-minh-huawei-band-11-vien-nhom-day-cao-su-xanh
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/362941/vong-deo-tay-thong-minh-huawei-band-11-vien-nhom-day-cao-su-xanh-thumb-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-HUAWEI-BAND-11';

-- Xiaomi Mi Band 10 Pro vien gom day cao su Fluoro
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom
-- Thumbnail: 1, gallery images: 4
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-thumb-600x600.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-1-639147973274872839.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-2-639147973282060228.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-3-639147973290630320.jpg', 'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-4-639147973296910758.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-XIAOMI-MIBAND-10-PRO';

-- Samsung Galaxy Watch Ultra LTE 47mm 2025 day silicone
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/galaxy-watch-ultra-2025-xanh
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/338267/galaxy-watch-ultra-2025-xanh-tn-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025';

-- Amazfit Bip Max 49.5mm day silicone
-- Source: https://www.thegioididong.com/dong-ho-thong-minh/amazfit-bip-max-49-5mm-day-silicone
-- Thumbnail: 1, gallery images: 0
UPDATE public.products
SET image_urls = ARRAY['https://cdn.tgdd.vn/Products/Images/7077/367947/amazfit-bip-max-49-5mm-day-silicone-thumb-600x600.jpg']::TEXT[]
WHERE sku = 'TGDD2-ACC-AMAZFIT-BIP-MAX';

COMMIT;
