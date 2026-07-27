-- =========================================================
-- TECH.NO - 10 EXTRA TGDD PC PRODUCTS
-- 4 gaming desktops, 3 mini PCs and 3 all-in-one computers.
-- Safe to rerun: inserts new SKUs and updates product content in place.
-- It never drops, truncates, deletes or rewrites users/orders.
-- Existing live stock is intentionally preserved on conflict.
-- Source data checked on thegioididong.com on 27/07/2026.
-- =========================================================

BEGIN;

CREATE TEMP TABLE _techno_pc_expansion_guard ON COMMIT DROP AS
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
  -- GAMING DESKTOPS
  -- =======================================================
  (
    'TGDD-PC-EXTRA-ROSA-REZO-I110-335909',
    'ROSA Rezo I110 Core i3 12100F/8GB/256GB/RTX 3050 6GB/Win11 Pro',
    'Bộ PC gaming ROSA gọn gàng với RTX 3050 6 GB, phù hợp chơi game Full HD, học tập và làm việc hằng ngày.',
    18590000, 19790000, 6, 'rosa', 'desktop-gaming',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-1-638995742797525070-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-2-638995742805659443-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-3-638995742812112831-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-4-638995742818873652-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-5-638995742826699527-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-6-638995742833173066-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335909/rosa-rezo-i110-core-i3-12100f-7-638995742840610806-750x500.jpg'
    ]::text[],
    8,
    '{"mainboard":"ASUS PRIME H610M-K D4","cpu":"Intel Core i3 12100F (3.3 GHz, Turbo 4.3 GHz, 4 nhân 8 luồng, 12 MB, LGA 1700)","ram":"DDR4 8 GB 3200 MHz tản nhôm","storage":"SSD 256 GB SATA 2.5 inch","gpu":"ASUS Dual GeForce RTX 3050 6 GB","cooling":"Tản nhiệt khí ID-COOLING SE-903-XT","case":"MORAX 3FA BLACK","power_supply":"Segotep U5 SG-D600A 500W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/rosa-rezo-i110-core-i3-12100f-8gb-ssd-256gb-rtx3050-6gb-win11'
  ),
  (
    'TGDD-PC-EXTRA-ROSA-REZO-I120-335910',
    'ROSA Rezo I120 Core i5 12400F/16GB/500GB/RTX 3050 6GB/Win11 Pro',
    'Bộ PC gaming ROSA cấu hình cân bằng với Core i5, RAM 16 GB và RTX 3050, đáp ứng tốt game eSports lẫn công việc sáng tạo.',
    25290000, 26290000, 4, 'rosa', 'desktop-gaming',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-1-638995751878452529-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-2-638995751886031685-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-3-638995751894179176-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-4-638995751901273986-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-5-638995751909484943-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-6-638995751918762969-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/335910/rosa-rezo-i120-core-i5-12400f-7-638995751928112005-750x500.jpg'
    ]::text[],
    7,
    '{"mainboard":"ASUS PRIME B760M-K D4","cpu":"Intel Core i5 12400F (2.5 GHz, Turbo 4.4 GHz, 6 nhân 12 luồng, 18 MB, LGA 1700)","ram":"DDR4 16 GB 3200 MHz tản nhôm","storage":"SSD 500 GB M.2 PCIe Gen 3 x4","gpu":"ASUS Dual GeForce RTX 3050 6 GB","cooling":"Tản nhiệt khí ID-COOLING SE-903-XT","case":"MORAX 3FA BLACK","power_supply":"Segotep U5 SG-D600A 500W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/rosa-rezo-i120-core-i5-12400f-16gb-ssd-500gb-rtx3050-6gb-win11'
  ),
  (
    'TGDD-PC-EXTRA-ROSA-REZO-I131-358730',
    'ROSA Rezo I131 Core i7 12700F/16GB/500GB/RTX 3050 6GB/Win11 Pro',
    'Bộ PC ROSA hiệu năng cao với Core i7 12 nhân, DDR5 và RTX 3050, phù hợp đa nhiệm, dựng nội dung và gaming Full HD.',
    29990000, 34990000, 14, 'rosa', 'desktop-gaming',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-1-638992455663090908-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-2-638992455671532398-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-3-638992455680030900-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-4-638992455686658194-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-5-638992455697385366-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-6-638992455704237887-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358730/rosa-rezo-i131-core-i7-12700f-den-7-638992455710608812-750x500.jpg'
    ]::text[],
    6,
    '{"mainboard":"ASUS PRIME B760M-K D5","cpu":"Intel Core i7 12700F (2.1 GHz, Turbo 4.8 GHz, 12 nhân 20 luồng, 25 MB, LGA 1700)","ram":"DDR5 16 GB 5600 MHz tản nhôm","storage":"SSD 500 GB M.2 PCIe Gen 3 x4","gpu":"ASUS Dual GeForce RTX 3050 6 GB","cooling":"Tản nhiệt khí ID-COOLING SE-903-XT","case":"MORAX 3FA BLACK","power_supply":"Segotep U5 SG-D600A 500W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/rosa-rezo-i131-core-i7-12700f-16gb-500gb-rtx-3050-6gb-win11pro'
  ),
  (
    'TGDD-PC-EXTRA-ROSA-ASUS-I120-358731',
    'ROSA x ASUS Rezo I120 Core i5 12400F/16GB/500GB/RTX 5050 8GB/Win11 Pro',
    'Bộ PC gaming ROSA x ASUS nổi bật với case ASUS AP21 và RTX 5050 8 GB, mang lại góc máy hiện đại cùng hiệu năng đồ họa mạnh.',
    29990000, 30990000, 3, 'rosa', 'desktop-gaming',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-1-638992469969651841-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-2-638992469976807502-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-3-638992469984097132-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-4-638992469989551353-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-5-638992469995692587-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-6-638992470001276276-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/358731/rosa-x-asus-rezo-i120-core-i5-12400f-7-638992470008138438-750x500.jpg'
    ]::text[],
    5,
    '{"mainboard":"ASUS PRIME B760M-K D4","cpu":"Intel Core i5 12400F (2.5 GHz, Turbo 4.4 GHz, 6 nhân 12 luồng, 18 MB, LGA 1700)","ram":"DDR4 16 GB 3200 MHz tản nhôm","storage":"SSD 500 GB M.2 PCIe Gen 3 x4","gpu":"ASUS Dual GeForce RTX 5050 8 GB","cooling":"Tản nhiệt khí ID-COOLING SE-903-XT","case":"ASUS AP21","power_supply":"Segotep U6 SG-D750A 650W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/rosa-x-asus-rezo-i120-core-i5-12400f-16gb-500gb-rtx-5050-8gb-win11pro'
  ),

  -- =======================================================
  -- MINI PCS
  -- =======================================================
  (
    'TGDD-PC-EXTRA-SINGPC-NUC-U715U695-357649',
    'MiniPC SingPC NUC U715U695-W Ultra 7 155U/16GB/512GB/Win11 Pro',
    'Mini PC SingPC nhỏ gọn với Core Ultra 7, RAM DDR5 và Windows 11 Pro, phù hợp bàn làm việc tối giản nhưng vẫn cần hiệu năng tốt.',
    17790000, 19300000, 7, 'singpc', 'mini-pc',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-1-638960526870283169.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-2-638960526878450096.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-3-638960526887222957.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-4-638960526893544552.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-5-638960526904170974.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-6-638960526911489972.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/357649/minipc-singpc-nuc-u715u695-w-ultra-7-155u-den-7-638960526919015488.jpg'
    ]::text[],
    10,
    '{"mainboard":"Bo mạch chủ SingPC Ultra 7 155U cho Mini PC","cpu":"Intel Core Ultra 7 155U (1.7 GHz, Turbo 4.8 GHz, 12 nhân 14 luồng, 12 MB)","ram":"Kingston DDR5 16 GB 5600 MHz CL46","storage":"HIKSEMI SSD 512 GB M.2 PCIe","gpu":"Intel Graphics tích hợp","cooling":"Không","case":"SingPC NUC BE-UL01","power_supply":"Adapter 19V 4.74A","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/minipc-singpc-nuc-u715u695-w-ultra-7-155u'
  ),
  (
    'TGDD-PC-EXTRA-SINGPC-I12450H682-334320',
    'MiniPC SingPC i12450H682-W Core i5 12450H/8GB/256GB/Win11 Pro',
    'Mini PC SingPC M400 có kiểu dáng gọn, Core i5 dòng H và Windows 11 Pro, thích hợp học tập, văn phòng và giải trí nhẹ.',
    11290000, 12500000, 9, 'singpc', 'mini-pc',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-1-638750531627392750.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-2-638750531635013676.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-3-638750531643431647.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-5-638750531649848448.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-6-638750531657280686.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-7-638750531666307431.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/334320/singpc-minipc-i12450h682-w-i5-12450h-den-8-638750531675541747.jpg'
    ]::text[],
    12,
    '{"mainboard":"Bo mạch chủ ITX SingPC Core i5 12450H","cpu":"Intel Core i5 12450H (2.0 GHz, Turbo 4.4 GHz, 8 nhân 12 luồng, 12 MB)","ram":"SingPC DDR4 8 GB 3200 MHz CL22 SO-DIMM","storage":"HIKSEMI SSD 256 GB M.2 PCIe","gpu":"Intel UHD Graphics tích hợp","cooling":"Không","case":"SingPC M400","power_supply":"Adapter SingPC 19V 4.74A 90W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/minipc-singpc-i12450h682-w-i5-12450h'
  ),
  (
    'TGDD-PC-EXTRA-APPLE-MAC-MINI-M4-331494',
    'Mac mini M4 16GB/512GB',
    'Mac mini M4 có thiết kế nhôm cực kỳ nhỏ gọn, hiệu năng cao và bộ nhớ 512 GB, phù hợp góc làm việc hiện đại trong hệ sinh thái Apple.',
    26990000, 27490000, 0, 'apple', 'mini-pc',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-2-638660046734788776.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-256gb-bac-3-638660046727099757.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-3-638660046741553453.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-4-639179972042457350.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-5-639179972035931684.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-6-639179972028928181.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331494/mac-mini-m4-16gb-512gb-bac-7-639179972022580401.jpg'
    ]::text[],
    9,
    '{"mainboard":"Hãng không công bố","cpu":"Apple M4","ram":"16 GB","storage":"512 GB SSD","gpu":"GPU 10 lõi tích hợp","cooling":"Hãng không công bố","case":"Hãng không công bố","power_supply":"155W","os":"macOS"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/mac-mini-m4-16gb-512gb'
  ),

  -- =======================================================
  -- ALL-IN-ONE COMPUTERS
  -- =======================================================
  (
    'TGDD-PC-EXTRA-APPLE-IMAC-M4-331480',
    'iMac 24 inch M4 16GB/256GB',
    'iMac M4 màu vàng nổi bật với màn hình 24 inch, thân máy siêu mỏng và thiết kế đồng bộ, tạo điểm nhấn đẹp cho không gian làm việc.',
    40990000, 41490000, 0, 'apple', 'all-in-one',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-vang-1-638659707347586044-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-vang-2-638659707356088711-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-vang-3-638659707362708709-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-16gb-256gb-vang-4-639177166379887731-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-16gb-256gb-vang-5-639177166391040754-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-16gb-256gb-vang-6-639177166401468120-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/331480/imac-24-inch-m4-16gb-256gb-vang-7-639177166410034741-750x500.jpg'
    ]::text[],
    4,
    '{"mainboard":"Hãng không công bố","cpu":"Apple M4","ram":"16 GB","storage":"256 GB SSD","gpu":"GPU 8 lõi tích hợp","cooling":"Hãng không công bố","case":"Hãng không công bố","power_supply":"143W","os":"macOS"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/imac-24-inch-m4-16gb-256gb'
  ),
  (
    'TGDD-PC-EXTRA-ASUS-AIO-V440VAT-364501',
    'ASUS AIO V440VA Core 5 210H/16GB/512GB/23.8 inch cảm ứng (V440VAT-WPD089W)',
    'ASUS AIO màu trắng với màn hình cảm ứng 23.8 inch, thiết kế thanh lịch và Core 5 hiệu năng tốt cho góc học tập hoặc văn phòng.',
    25990000, 34990000, 25, 'asus', 'all-in-one',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-1-639105461381164516-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-2-639105511126376086-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-3-639105511134987764-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-4-639105511142469783-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-5-639105511151092768-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-6-639105511162329386-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/364501/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w-99-639105480157375451-750x500.jpg'
    ]::text[],
    6,
    '{"mainboard":"Hãng không công bố","cpu":"Intel Core 5 210H (Raptor Lake)","ram":"16 GB DDR5","storage":"512 GB SSD M.2 NVMe PCIe 4.0","gpu":"Intel Graphics tích hợp","cooling":"Hãng không công bố","case":"Hãng không công bố","power_supply":"120W","os":"Windows 11 Home"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/asus-aio-v440va-core-5-210h-23-8-inch-v440vat-wpd089w'
  ),
  (
    'TGDD-PC-EXTRA-SINGPC-AIO-M24AI-361290',
    'SingPC AIO M24Ai512H9M5-W Core i5 12450H/16GB/512GB/23.8 inch/Win11 Pro',
    'SingPC AIO màu bạc có đường nét tối giản, RAM 16 GB và màn hình 23.8 inch, giúp bàn làm việc gọn gàng mà vẫn đủ mạnh cho đa nhiệm.',
    17990000, 20500000, 12, 'singpc', 'all-in-one',
    ARRAY[
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-1-639033766560258655-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-2-639033766570429906-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-3-639033766577128496-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-4-639033766584075762-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-5-639033766590218104-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-6-639033766596307382-750x500.jpg',
      'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/5698/361290/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch-bac-7-639033766603255263-750x500.jpg'
    ]::text[],
    8,
    '{"mainboard":"Intel SoC","cpu":"Intel Core i5 12450H","ram":"16 GB DDR5 SO-DIMM","storage":"512 GB SSD, hỗ trợ tối đa 2 TB, M.2 SATA","gpu":"Intel UHD Graphics tích hợp","cooling":"Hãng không công bố","case":"Hãng không công bố","power_supply":"90W","os":"Windows 11 Pro"}'::jsonb,
    'https://www.thegioididong.com/may-tinh-de-ban/singpc-aio-m24ai512h9m5-w-i5-12450h-23-8-inch'
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
  'pc',
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
  WHERE sku LIKE 'TGDD-PC-EXTRA-%';

  IF seeded_count <> 10 THEN
    RAISE EXCEPTION 'Expected exactly 10 extra PC products, found %', seeded_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku LIKE 'TGDD-PC-EXTRA-%'
      AND (
        category_id <> 'pc'
        OR status <> 'active'
        OR source_url NOT LIKE 'https://www.thegioididong.com/%'
        OR COALESCE(cardinality(image_urls), 0) NOT BETWEEN 2 AND 7
      )
  ) THEN
    RAISE EXCEPTION 'An extra PC product has invalid category, status, source or gallery';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku LIKE 'TGDD-PC-EXTRA-%'
      AND NOT specifications ?& ARRAY[
        'mainboard',
        'cpu',
        'ram',
        'storage',
        'gpu',
        'cooling',
        'case',
        'power_supply',
        'os'
      ]
  ) THEN
    RAISE EXCEPTION 'An extra PC product is missing a required specification';
  END IF;

  SELECT guard.users_before, guard.orders_before
  INTO expected_users, expected_orders
  FROM _techno_pc_expansion_guard AS guard;

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
WHERE sku LIKE 'TGDD-PC-EXTRA-%'
GROUP BY subcategory
ORDER BY subcategory;
