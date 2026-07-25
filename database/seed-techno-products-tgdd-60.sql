-- =========================================================
-- TECH.NO TGDD SAMPLE PRODUCTS SEED - 60 PRODUCTS
-- Chay file nay trong Supabase SQL Editor sau khi da tao schema.
-- Ten/gia/anh dai dien tham khao tu cac card san pham cong khai tren
-- thegioididong.com ngay 27/06/2026. Mo ta duoc viet lai cho demo.
-- Ton kho sau khi seed: 45/60 san pham co stock = 100 (> 50),
-- 15/60 san pham co stock = 25 (< 50), khong co san pham o bien stock = 50.
-- =========================================================

BEGIN;

INSERT INTO public.categories (id, name) VALUES
('phone', 'Dien thoai'),
('laptop', 'Laptop'),
('pc', 'PC'),
('phukien', 'Phu kien')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

INSERT INTO public.products
  (sku, name, description, price, discount_percent, category_id, brand, subcategory, image_urls, stock, status)
VALUES
-- Dien thoai
('TGDD-PHN-SAMSUNG-A26-128', 'Samsung Galaxy A26 5G 6GB/128GB', 'Dien thoai Samsung dong A ho tro 5G, phu hop nhu cau hoc tap, giai tri va lien lac hang ngay.', 6140000, 12, 'phone', 'samsung', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335915-600x600-3.jpg'], 15, 'active'),
('TGDD-PHN-OPPO-RENO13-256', 'OPPO Reno13 5G 12GB/256GB', 'Smartphone OPPO tam trung cao cap, RAM lon, bo nho rong va thiet ke tre trung.', 12700000, 19, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/332934.jpg'], 10, 'active'),
('TGDD-PHN-XIAOMI-15T-512', 'Xiaomi 15T 5G 12GB/512GB', 'Dien thoai Xiaomi hieu nang manh, dung luong luu tru cao va ho tro 5G.', 12440000, 17, 'phone', 'xiaomi', NULL, ARRAY['https://cdn.tgdd.vn/Products/Images/42/344645/xiaomi-15t-12gb-512gb-xam-den-thumb-600x600.jpg'], 8, 'active'),
('TGDD-PHN-IPHONE-16E-512', 'iPhone 16e 512GB', 'iPhone dung luong lon, phu hop nguoi dung can may gon nhe trong he sinh thai Apple.', 21990000, 16, 'phone', 'iphone', NULL, ARRAY['https://cdn.tgdd.vn/Products/Images/42/334866/iphone-16e-trang-thumb-1-600x600.jpg'], 9, 'active'),
('TGDD-PHN-REALME-C75-256', 'realme C75 8GB/256GB', 'Dien thoai realme pin tot, bo nho rong va gia de tiep can cho nhu cau pho thong.', 4980000, 21, 'phone', 'realme', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/332235-600x600-2.jpg'], 12, 'active'),
('TGDD-PHN-REALME-14-256', 'realme 14 5G 12GB/256GB', 'Dien thoai realme ho tro 5G, cau hinh tot trong phan khuc tam trung.', 8450000, 17, 'phone', 'realme', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/336623-600x600-2.jpg'], 12, 'active'),
('TGDD-PHN-SAMSUNG-S25-EDGE', 'Samsung Galaxy S25 Edge 5G 12GB/512GB', 'Flagship Samsung thiet ke mong nhe, bo nho lon va man hinh cao cap.', 19490000, 45, 'phone', 'samsung', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335955.jpg'], 7, 'active'),
('TGDD-PHN-OPPO-RENO15-256', 'OPPO Reno15 5G 8GB/256GB', 'Dien thoai OPPO Reno moi, thiet ke hien dai va camera phu hop nhu cau chup anh hang ngay.', 15490000, 3, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/360238-600x600-2.jpg'], 10, 'active'),
('TGDD-PHN-VIVO-V60-LITE-512', 'vivo V60 Lite 5G 12GB/512GB', 'Smartphone vivo bo nho lon, ho tro 5G va phu hop nguoi dung thich thiet ke gon gang.', 11840000, 8, 'phone', 'vivo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/357577-600x600-2.jpg'], 6, 'active'),
('TGDD-PHN-XIAOMI-15T-PRO-512', 'Xiaomi 15T Pro 5G 12GB/512GB', 'Ban Pro cua Xiaomi 15T voi hieu nang cao, bo nho lon va thiet ke cao cap.', 16020000, 17, 'phone', 'xiaomi', NULL, ARRAY['https://cdn.tgdd.vn/Products/Images/42/356739/xiaomi-15t-pro-5g-12gb-512gb-den-thumb-600x600.jpg'], 5, 'active'),

-- Laptop
('TGDD-LAP-HP-15-FD1043TU', 'HP 15 fd1043TU Core 5 120U (9Z2W9PA)', 'Laptop HP 15 inch phu hop hoc tap, van phong va lam viec online.', 18490000, 13, 'laptop', 'hp', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341620/hp-15-fd1043tu-core-5-120u-9z2w9pa-040825-020241-865-600x600.jpg'], 6, 'active'),
('TGDD-LAP-HP-15-FD1037TU', 'HP 15 fd1037TU Core 7 150U (9Z2W5PA)', 'Laptop HP Core 7 cho nhu cau van phong, hoc tap va giai tri.', 21990000, 10, 'laptop', 'hp', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341621/hp-15-fd1037tu-core-7-150u-9z2w5pa-thumb-2-638943948968294518-600x600.jpg'], 5, 'active'),
('TGDD-LAP-MSI-KATANA-15-HX', 'MSI Gaming Katana 15 HX B14WEK i7 14650HX (027VN)', 'Laptop gaming MSI hieu nang manh, phu hop choi game, render va do hoa.', 39990000, 21, 'laptop', 'msi', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/341613/msi-katana-15-hx-b14wek-i7-14650hx-027vn-thumb02-638897277627603509-600x600.jpg'], 5, 'active'),
('TGDD-LAP-HP-PAVILION-X360', 'HP Pavilion X360 14 ek2013TU Core 7 150U (9Z2V4PA)', 'Laptop xoay gap linh hoat, phu hop ghi chu, hoc tap va lam viec di dong.', 24390000, 11, 'laptop', 'hp', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340481/hp-pavilion-x360-14-ek2013tu-core-7-9z2v4pa-638900119982403211-600x600.jpg'], 5, 'active'),
('TGDD-LAP-HP-15-FC0023AU', 'HP 15 fc0023AU R5 7520U (D0BH1PA)', 'Laptop HP RAM 16GB, SSD 512GB, phu hop hoc tap va xu ly cong viec hang ngay.', 16790000, 8, 'laptop', 'hp', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361311/hp-15-fc0023au-r5-7520u-d0bh1pa-thumb-639030592238863081-600x600.jpg'], 7, 'active'),

-- PC / may tinh de ban
('TGDD-PC-ASUS-V501MV-C7', 'ASUS V501MV Core 7 240H (V501MV-07240H073W)', 'May tinh de ban ASUS Core 7, phu hop lam viec da nhiem va hoc tap nang cao.', 24490000, 19, 'pc', 'asus', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/5698/364994/asus-v501mv-core-7-240h-v501mv-07240h073w-thumb-639111802841934471-300x300.jpg'], 5, 'active'),
('TGDD-PC-ASUS-V501MV-C5', 'ASUS V501MV Core 5 210H (V501MV-05210H048W)', 'May tinh de ban ASUS Core 5 can bang giua hieu nang va gia ban.', 17490000, 24, 'pc', 'asus', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363816/asus-v501mv-core-5-210h-v501mv-05210h048w-thumb-639093114325603581-600x600.jpg'], 6, 'active'),
('TGDD-PC-ASUS-V501SV-C5', 'ASUS V501SV Core 5 210H (V501SV-05210H040W)', 'May tinh de ban ASUS V501SV danh cho hoc tap, van phong va giai tri tai nha.', 19790000, 26, 'pc', 'asus', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/363817/asus-v501sv-core-5-210h-v501sv-05210h040w-thumb-639093118678835998-600x600.jpg'], 5, 'active'),

-- Phu kien: AirPods / tai nghe TWS
('TGDD-ACC-AIRPODS-MAX-USBC', 'AirPods Max cong USB C', 'Tai nghe chup tai Apple voi thiet ke cao cap, ket noi USB C va chat am tot.', 12890000, 14, 'phukien', 'apple', 'airpods', ARRAY['https://cdn.tgdd.vn/Products/Images/54/329161/airpods-max-cong-usb-c-den-600x600.jpg'], 10, 'active'),
('TGDD-ACC-SAMSUNG-BUDS-CORE', 'Tai nghe TWS Samsung Galaxy Buds Core R410N', 'Tai nghe true wireless Samsung gon nhe, de dung hang ngay.', 990000, 16, 'phukien', 'samsung', 'airpods', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/342707/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds-core-r410n-thumb-639026914590017606-600x600.jpg'], 20, 'active'),
('TGDD-ACC-SAMSUNG-BUDS4-PRO', 'Tai nghe TWS Samsung Galaxy Buds4 Pro R640N', 'Tai nghe TWS Samsung cao cap, phu hop nghe nhac, hop online va di chuyen.', 6290000, 7, 'phukien', 'samsung', 'airpods', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/363188/tai-nghe-bluetooth-true-wireless-samsung-galaxy-buds4-pro-r640n-thumb-639076639855476853-600x600.jpg'], 8, 'active'),

-- Phu kien: loa
('TGDD-ACC-SONY-SRS-XB100', 'Loa Bluetooth Sony SRS-XB100', 'Loa Bluetooth Sony nho gon, phu hop nghe nhac ca nhan va du lich.', 1090000, 25, 'phukien', 'sony', 'loa', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/2162/312682/loa-bluetooth-sony-srs-xb100-050325-015315-823-600x600.jpg'], 6, 'active'),

-- Phu kien: camera
('TGDD-ACC-TPLINK-TAPO-C200C', 'Camera IP 360 Do TP-Link Tapo C200C', 'Camera trong nha xoay 360 do, phu hop giam sat gia dinh va van phong.', 350000, 40, 'phukien', 'tplink', 'camera', ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/327948.jpg'], 30, 'active'),

-- Phu kien: sac
('TGDD-ACC-UGREEN-20W-UNO', 'Ugreen 20W Uno PB764', 'Sac du phong Ugreen nho gon, ho tro sac nhanh cho thiet bi di dong.', 890000, 40, 'phukien', 'ugreen', 'sac', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/335788/sac-du-phong-polymer-10000mah-khong-day-qi2-type-c-pd-20w-ugreen-uno-pb764-thumb-638781903605511945-600x600.jpg'], 10, 'active'),
('TGDD-ACC-SAMSUNG-EP-T6010NB', 'Sac nhanh Samsung EP-T6010NB', 'Cu sac nhanh Samsung Type C PD 60W, phu hop dien thoai va thiet bi USB C.', 890000, 18, 'phukien', 'samsung', 'sac', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/9499/362999/sac-nhanh-type-c-pd-60w-samsung-ep-t6010nb-thumb-639063206180981245-600x600.jpg'], 10, 'active'),

-- Phu kien: dong ho
('TGDD-ACC-APPLE-WATCH-ULTRA-3', 'Apple Watch Ultra 3 GPS + Cellular 49mm vien Titanium day Ocean', 'Dong ho thong minh Apple cao cap, ho tro ket noi di dong va luyen tap ngoai troi.', 22990000, 4, 'phukien', 'apple', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/344764/apple-watch-ultra-3-gps-cellular-49mm-vien-titanium-day-ocean-tu-nhien-600x600.jpg'], 5, 'active'),
('TGDD-ACC-SAMSUNG-WATCH8-40', 'Samsung Galaxy Watch8 40mm day silicone', 'Dong ho thong minh Samsung nho gon, ho tro theo doi suc khoe va thong bao.', 5990000, 33, 'phukien', 'samsung', 'dong-ho', ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/338265.jpg'], 5, 'active'),
('TGDD-ACC-XIAOMI-MIBAND-10', 'Xiaomi Mi Band 10 vien nhom day TPU', 'Vong deo tay thong minh Xiaomi, gon nhe va phu hop theo doi van dong.', 990000, 15, 'phukien', 'xiaomi', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/336899/mi-band-10-den-600x600.jpg'], 20, 'active'),
('TGDD-ACC-HUAWEI-WATCH-GT5-PRO', 'Huawei Watch GT 5 Pro 46mm vien Titanium day cao su', 'Dong ho thong minh Huawei thiet ke ben bi, phu hop theo doi suc khoe va luyen tap.', 5490000, 34, 'phukien', 'huawei', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/330173/huawei-watch-gt-5-pro-46mm-vien-titanium-day-cao-su-tb-600x600.jpg'], 6, 'active'),
('TGDD-ACC-XIAOMI-REDMI-WATCH-6', 'Xiaomi Redmi Watch 6', 'Dong ho thong minh Xiaomi Redmi Watch, man hinh lon va phu hop nhu cau hang ngay.', 2790000, 12, 'phukien', 'xiaomi', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/365217/xiaomi-redmi-watch-6-den-600x600.jpg'], 10, 'active'),
('TGDD2-PHN-SAMSUNG-A36-256', 'Samsung Galaxy A36 5G 8GB/256GB', 'Dien thoai Samsung Galaxy A series man hinh lon, bo nho 256GB va phu hop nhu cau giai tri hang ngay.', 7730000, 15, 'phone', 'samsung', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/335174-600x600-3.jpg'], 14, 'active'),
('TGDD2-PHN-SAMSUNG-A07-128', 'Samsung Galaxy A07 6GB/128GB', 'Smartphone Samsung pho thong, dung luong vua du va pin tot cho hoc tap, lien lac.', 3590000, 7, 'phone', 'samsung', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341804-600x600-4.jpg'], 18, 'active'),
('TGDD2-PHN-SAMSUNG-A17-256', 'Samsung Galaxy A17 8GB/256GB', 'Dien thoai Samsung bo nho 256GB, thiet ke tre trung va phu hop nguoi dung can luu tru nhieu.', 5790000, 4, 'phone', 'samsung', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341800.jpg'], 16, 'active'),
('TGDD2-PHN-OPPO-RENO14F-512', 'OPPO Reno14 F 5G 12GB/512GB', 'OPPO Reno F dung luong lon, ho tro 5G va toi uu cho chup anh, mang xa hoi.', 11760000, 7, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/339178-600x600-2.jpg'], 10, 'active'),
('TGDD2-PHN-OPPO-RENO14F-256', 'OPPO Reno14 F 5G 12GB/256GB', 'Phien ban OPPO Reno14 F 256GB can bang giua gia, hieu nang va camera.', 10590000, 6, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/339177-600x600-2.jpg'], 12, 'active'),
('TGDD2-PHN-OPPO-A5-128', 'OPPO A5 8GB/128GB', 'Dien thoai OPPO A series gia tot, RAM 8GB va bo nho 128GB cho nhu cau pho thong.', 5990000, 4, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/341378-600x600-3.jpg'], 15, 'active'),
('TGDD2-PHN-OPPO-A6PRO-256', 'OPPO A6 Pro 5G 12GB/256GB', 'OPPO A6 Pro ho tro 5G, RAM 12GB va phu hop nguoi dung can may manh trong tam gia.', 10490000, 12, 'phone', 'oppo', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/344649-600x600-2.jpg'], 9, 'active'),
('TGDD2-PHN-REALME-15-12-256', 'realme 15 5G 12GB/256GB', 'Smartphone realme 5G voi RAM 12GB, phu hop cho tac vu da nhiem va giai tri.', 8790000, 23, 'phone', 'realme', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/343066-600x600-2.jpg'], 11, 'active'),
('TGDD2-PHN-REALME-15PRO-256', 'realme 15 Pro 5G 12GB/256GB', 'realme 15 Pro 5G hieu nang cao, thiet ke noi bat va dung luong 256GB.', 11190000, 25, 'phone', 'realme', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/343067-600x600-2.jpg'], 8, 'active'),
('TGDD2-PHN-IPHONE-17PM-256', 'iPhone 17 Pro Max 256GB', 'iPhone man hinh lon, hieu nang cao va dung luong 256GB cho nguoi dung he sinh thai Apple.', 35990000, 5, 'phone', 'iphone', NULL, ARRAY['https://cdn.tgdd.vn/Products/Images/42/342679/iphone-17-pro-max-cam-thumb-600x600.jpg'], 6, 'active'),

-- Laptop
('TGDD2-LAP-MACBOOK-NEO-13-256', 'MacBook Neo 13 inch A18 Pro 8GB/256GB', 'MacBook 13 inch gon nhe, phu hop hoc tap, lam viec co ban va di chuyen nhieu.', 16490000, 0, 'laptop', 'macbook', NULL, ARRAY['https://cdn.tgdd.vn/Products/Images/44/363537/macbook-neo-13-inch-a18-pro-8gb-256gb-hong-600x600.jpg'], 5, 'active'),
('TGDD2-LAP-DELL-15-DC15255', 'Dell 15 DC15255 R5 7530U (DC5R5802W1)', 'Laptop Dell 15 inch RAM 16GB, SSD 512GB, phu hop van phong va hoc tap.', 20090000, 4, 'laptop', 'dell', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342755/dell-15-dc15255-r5-7530u-dc5r5802w1-thumb-638920698565049808-600x600.jpg'], 6, 'active'),
('TGDD2-LAP-ACER-ASPIRE-GO14', 'Acer Aspire Go 14 AG14-72P-54DF Core 5 120U', 'Laptop Acer 14 inch gon nhe, RAM 16GB va SSD 512GB cho cong viec hang ngay.', 18190000, 24, 'laptop', 'acer', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/363261/acer-aspire-go-14-ag14-72p-54df-core-5-120u-nx-jsbsv-009-thumb-639088184873844833-600x600.jpg'], 7, 'active'),
('TGDD2-LAP-ACER-ASPIRE-LITE15-R7', 'Acer Aspire Lite 15 AL15 41P R3QL R7 5700U', 'Laptop Acer Aspire Lite 15 inch, phu hop hoc tap, lam viec va giai tri nhe.', 13990000, 9, 'laptop', 'acer', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/334999/acer-aspire-lite-15-al15-41p-r3ql-r7-nxj54sv001-thumb-638828183898800384-600x600.jpg'], 9, 'active'),
('TGDD2-LAP-LENOVO-SLIM3-15ARP10', 'Lenovo IdeaPad Slim 3 15ARP10 R5 7535HS', 'Laptop Lenovo RAM 16GB, SSD 512GB, thiet ke mong nhe cho hoc tap va van phong.', 17990000, 28, 'laptop', 'lenovo', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/361632/lenovo-ideapad-slim-3-15arp10-r5-7535hs-83k700epvn-thumb-639040845973149920-600x600.jpg'], 6, 'active'),
('TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA', 'Asus Vivobook 16 A1607QA X1 26 100', 'Laptop ASUS Vivobook 16 inch, RAM 16GB, phu hop lam viec da nhiem va hoc tap.', 17790000, 22, 'laptop', 'asus', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/364397/asus-vivobook-16-a1607qa-x1-26-100-mb067w-thumb-2-639155694743786038-600x600.jpg'], 6, 'active'),
('TGDD2-LAP-DELL-15-DC15250-I7', 'Dell 15 DC15250 i7 1355U (DC5I7748W1)', 'Laptop Dell Core i7, RAM 16GB va SSD 512GB cho cong viec nang hon.', 23490000, 9, 'laptop', 'dell', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/340562/dell-15-dc15250-i7-dc5i7748w1-638900114799182560-600x600.jpg'], 5, 'active'),
('TGDD2-LAP-MSI-MODERN-15-F13MG', 'MSI Modern 15 F13MG i5 1334U (667VN_16GB)', 'Laptop MSI Modern 15 RAM 16GB, phu hop van phong, hoc tap va di chuyen.', 17690000, 12, 'laptop', 'msi', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/342941/msi-modern-15-f13mg-i5-1334u-667vn-16gb-thumb-2-638981132535627040-600x600.jpg'], 6, 'active'),

-- PC / may tinh de ban
('TGDD2-PC-ROSA-ASUS-REZO-I121', 'ROSA x ASUS Rezo I121 Core i5 12400F RTX 5060', 'Bo may desktop ROSA x ASUS RAM 16GB, SSD 500GB va RTX 5060 cho gaming.', 30990000, 12, 'pc', 'asus', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358732/rosa-x-asus-rezo-i121-core-i5-12400f-16gb-500gb-rtx-5060-8gb-win11pro-thumb-638993426979699750-600x600.jpg'], 4, 'active'),
('TGDD2-PC-MSI-CUBI-N-ADL', 'MiniPC MSI CUBI N ADL-235XVN N100', 'MiniPC MSI nho gon, RAM 8GB, SSD 128GB, phu hop van phong va hoc tap.', 6590000, 7, 'pc', 'msi', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/360061/minipc-msi-cubi-n-adl-235xvn-n100-thumb-639005316398817754-600x600.jpg'], 10, 'active'),
('TGDD2-PC-MSI-PRO-DP180-I5', 'MSI Pro DP180 i5 14400 (9S6-B0A761-1220)', 'Desktop MSI Pro Core i5, SSD 512GB, phu hop van phong va xu ly cong viec.', 14990000, 6, 'pc', 'msi', NULL, ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361943/msi-pro-dp180-i5-14400-9s6-b0a761-1220-thumb-639046714306698581-600x600.jpg'], 6, 'active'),
('TGDD2-PC-ASUS-AIO-V440VA', 'ASUS AIO V440VA Core 7 240H 23.8 inch', 'May tinh AIO ASUS man hinh 23.8 inch, RAM 16GB va SSD 512GB cho goc lam viec gon gang.', 26890000, 23, 'pc', 'asus', NULL, ARRAY['https://cdn.tgdd.vn/2026/06/timerseo/364500.png'], 5, 'active'),

-- Phu kien: dong ho thong minh
('TGDD2-ACC-HUAWEI-WATCH-FIT-5', 'Huawei Watch Fit 5 42.9mm day nylon', 'Dong ho Huawei Watch Fit 5 thiet ke mong nhe, phu hop theo doi suc khoe va luyen tap.', 3290000, 15, 'phukien', 'huawei', 'dong-ho', ARRAY['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/366954/huawei-watch-fit-5-42-9mm-day-nylon-thumb-3-639144521826494787-600x600.jpg'], 8, 'active'),
('TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO', 'Huawei Watch Fit 5 Pro 44.5mm day nylon', 'Huawei Watch Fit 5 Pro vien cao cap, phu hop nguoi dung thich tap luyen va di chuyen.', 4990000, 9, 'phukien', 'huawei', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/366955/huawei-watch-fit-5-pro-44-5mm-day-nylon-thumb-600x600.jpg'], 7, 'active'),
('TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC', 'Samsung Galaxy Watch8 Classic 46mm day da', 'Dong ho Samsung Galaxy Watch8 Classic thiet ke co dien, theo doi suc khoe va thong bao.', 8990000, 30, 'phukien', 'samsung', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/338266/samsung-galaxy-watch8-classic-trang-tn-600x600.jpg'], 6, 'active'),
('TGDD2-ACC-APPLE-WATCH-SE3-40', 'Apple Watch SE 3 GPS 40mm vien nhom day the thao', 'Apple Watch SE 3 gon nhe, phu hop thong bao, tap luyen va theo doi suc khoe co ban.', 6790000, 3, 'phukien', 'apple', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/344767/apple-watch-se-3-40mm-vien-nhom-day-the-thao-trang-600x600.jpg'], 8, 'active'),
('TGDD2-ACC-HUAWEI-BAND-11', 'Huawei Band 11 vien nhom day Fluor', 'Vong deo tay Huawei Band 11 nho gon, theo doi van dong va giac ngu hang ngay.', 990000, 9, 'phukien', 'huawei', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/362941/vong-deo-tay-thong-minh-huawei-band-11-vien-nhom-day-cao-su-xanh-thumb-600x600.jpg'], 16, 'active'),
('TGDD2-ACC-XIAOMI-MIBAND-10-PRO', 'Xiaomi Mi Band 10 Pro vien gom day cao su Fluoro', 'Vong deo tay Xiaomi Mi Band 10 Pro thiet ke cao cap, phu hop theo doi suc khoe.', 2590000, 4, 'phukien', 'xiaomi', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/367410/vong-deo-tay-thong-minh-mi-band-10-pro-vien-gom-thumb-600x600.jpg'], 12, 'active'),
('TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025', 'Samsung Galaxy Watch Ultra LTE 47mm 2025 day silicone', 'Dong ho Samsung Galaxy Watch Ultra LTE ben bi, phu hop luyen tap ngoai troi.', 12490000, 26, 'phukien', 'samsung', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/338267/galaxy-watch-ultra-2025-xanh-tn-600x600.jpg'], 5, 'active'),
('TGDD2-ACC-AMAZFIT-BIP-MAX', 'Amazfit Bip Max 49.5mm day silicone', 'Dong ho Amazfit man hinh lon, pin tot va phu hop theo doi van dong hang ngay.', 2590000, 18, 'phukien', 'amazfit', 'dong-ho', ARRAY['https://cdn.tgdd.vn/Products/Images/7077/367947/amazfit-bip-max-49-5mm-day-silicone-thumb-600x600.jpg'], 9, 'active')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  discount_percent = EXCLUDED.discount_percent,
  category_id = EXCLUDED.category_id,
  brand = EXCLUDED.brand,
  subcategory = EXCLUDED.subcategory,
  -- Giữ gallery đã được migration; seed chỉ cấp thumbnail khi sản phẩm chưa có gallery.
  image_urls = CASE
    WHEN COALESCE(cardinality(products.image_urls), 0) > 1 THEN products.image_urls
    ELSE EXCLUDED.image_urls
  END,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status;

-- Sap xep lai created_at de trang mac dinh khong bi gom theo tung danh muc.
-- Frontend dang order created_at DESC, nen rank nho hon se hien truoc.
WITH display_order(sku, sort_rank) AS (
  VALUES
    ('TGDD-PHN-SAMSUNG-A26-128', 1),
    ('TGDD-LAP-HP-15-FD1043TU', 2),
    ('TGDD-PC-ASUS-V501MV-C7', 3),
    ('TGDD-ACC-AIRPODS-MAX-USBC', 4),
    ('TGDD-PHN-OPPO-RENO13-256', 5),
    ('TGDD-LAP-HP-15-FD1037TU', 6),
    ('TGDD-PC-ASUS-V501MV-C5', 7),
    ('TGDD-ACC-SAMSUNG-BUDS-CORE', 8),
    ('TGDD-PHN-XIAOMI-15T-512', 9),
    ('TGDD-LAP-MSI-KATANA-15-HX', 10),
    ('TGDD-ACC-SAMSUNG-BUDS4-PRO', 11),
    ('TGDD-PHN-IPHONE-16E-512', 12),
    ('TGDD-PHN-REALME-C75-256', 13),
    ('TGDD-LAP-HP-PAVILION-X360', 14),
    ('TGDD-PC-ASUS-V501SV-C5', 15),
    ('TGDD-ACC-SONY-SRS-XB100', 16),
    ('TGDD-PHN-REALME-14-256', 17),
    ('TGDD-LAP-HP-15-FC0023AU', 18),
    ('TGDD2-PC-ROSA-ASUS-REZO-I121', 19),
    ('TGDD-ACC-TPLINK-TAPO-C200C', 20),
    ('TGDD-PHN-SAMSUNG-S25-EDGE', 21),
    ('TGDD2-LAP-MACBOOK-NEO-13-256', 22),
    ('TGDD-ACC-UGREEN-20W-UNO', 23),
    ('TGDD-PHN-OPPO-RENO15-256', 24),
    ('TGDD-PHN-VIVO-V60-LITE-512', 25),
    ('TGDD2-LAP-DELL-15-DC15255', 26),
    ('TGDD2-PC-MSI-CUBI-N-ADL', 27),
    ('TGDD-ACC-SAMSUNG-EP-T6010NB', 28),
    ('TGDD-PHN-XIAOMI-15T-PRO-512', 29),
    ('TGDD2-LAP-ACER-ASPIRE-GO14', 30),
    ('TGDD-ACC-APPLE-WATCH-ULTRA-3', 31),
    ('TGDD2-PHN-SAMSUNG-A36-256', 32),
    ('TGDD2-LAP-ACER-ASPIRE-LITE15-R7', 33),
    ('TGDD-ACC-SAMSUNG-WATCH8-40', 34),
    ('TGDD2-PHN-SAMSUNG-A07-128', 35),
    ('TGDD-ACC-XIAOMI-MIBAND-10', 36),
    ('TGDD2-PHN-SAMSUNG-A17-256', 37),
    ('TGDD2-LAP-LENOVO-SLIM3-15ARP10', 38),
    ('TGDD2-PC-MSI-PRO-DP180-I5', 39),
    ('TGDD-ACC-HUAWEI-WATCH-GT5-PRO', 40),
    ('TGDD2-PHN-OPPO-RENO14F-512', 41),
    ('TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA', 42),
    ('TGDD-ACC-XIAOMI-REDMI-WATCH-6', 43),
    ('TGDD2-PHN-OPPO-RENO14F-256', 44),
    ('TGDD2-ACC-HUAWEI-WATCH-FIT-5', 45),
    ('TGDD2-PHN-OPPO-A5-128', 46),
    ('TGDD2-ACC-HUAWEI-WATCH-FIT-5-PRO', 47),
    ('TGDD2-ACC-SAMSUNG-WATCH8-CLASSIC', 48),
    ('TGDD2-PHN-OPPO-A6PRO-256', 49),
    ('TGDD2-LAP-DELL-15-DC15250-I7', 50),
    ('TGDD2-PC-ASUS-AIO-V440VA', 51),
    ('TGDD2-ACC-APPLE-WATCH-SE3-40', 52),
    ('TGDD2-PHN-REALME-15-12-256', 53),
    ('TGDD2-LAP-MSI-MODERN-15-F13MG', 54),
    ('TGDD2-ACC-HUAWEI-BAND-11', 55),
    ('TGDD2-PHN-REALME-15PRO-256', 56),
    ('TGDD2-ACC-XIAOMI-MIBAND-10-PRO', 57),
    ('TGDD2-PHN-IPHONE-17PM-256', 58),
    ('TGDD2-ACC-SAMSUNG-WATCH-ULTRA-2025', 59),
    ('TGDD2-ACC-AMAZFIT-BIP-MAX', 60)
),
updated_products AS (
UPDATE public.products AS product
SET
  -- Moi san pham thu 4 nam trong nhom sap het hang: 15/60 = 1/4.
  stock = CASE
    WHEN display_order.sort_rank % 4 = 0 THEN 25
    ELSE 100
  END,
  status = 'active',
  created_at = TIMESTAMPTZ '2026-06-27 22:00:00+07'
    - ((display_order.sort_rank - 1) * INTERVAL '1 minute'),
  updated_at = now()
FROM display_order
WHERE product.sku = display_order.sku
RETURNING product.stock
)
-- Ket qua mong doi: total=60, stock_above_50=45, stock_below_50=15, stock_equal_50=0.
SELECT
  COUNT(*) AS total_seeded_products,
  COUNT(*) FILTER (WHERE stock > 50) AS stock_above_50,
  COUNT(*) FILTER (WHERE stock < 50) AS stock_below_50,
  COUNT(*) FILTER (WHERE stock = 50) AS stock_equal_50
FROM updated_products;

COMMIT;
