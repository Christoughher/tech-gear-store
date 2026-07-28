const brandData = {
    laptop: ['asus', 'hp', 'dell', 'acer', 'macbook', 'lenovo', 'msi', 'gigabyte'],
    phone: ['iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo'],
    pc: ['asus', 'msi', 'gigabyte'],
    phukien: ['airpods', 'loa', 'camera', 'sac', 'dong-ho', 'man-hinh', 'chuot', 'ban-phim']
};

const filterLabelMap = {
    iphone: 'iPhone',
    samsung: 'Samsung',
    oppo: 'OPPO',
    xiaomi: 'Xiaomi',
    realme: 'realme',
    vivo: 'vivo',
    asus: 'ASUS',
    hp: 'HP',
    dell: 'Dell',
    acer: 'Acer',
    macbook: 'MacBook',
    lenovo: 'Lenovo',
    msi: 'MSI',
    gigabyte: 'Gigabyte',
    rosa: 'ROSA',
    singpc: 'SingPC',
    apple: 'Apple',
    razer: 'Razer',
    logitech: 'Logitech',
    rapoo: 'Rapoo',
    akko: 'Akko',
    hyperx: 'HyperX',
    dareu: 'DareU',
    airpods: 'TAI NGHE',
    loa: 'LOA',
    camera: 'CAMERA',
    sac: 'SẠC',
    'dong-ho': 'ĐỒNG HỒ',
    'man-hinh': 'MÀN HÌNH',
    chuot: 'CHUỘT',
    'ban-phim': 'BÀN PHÍM'
};

const filterModeByCategory = {
    phone: 'brand',
    laptop: 'brand',
    pc: 'brand',
    phukien: 'subcategory'
};

const UNKNOWN_SPEC_VALUE = 'Hãng không công bố';

const productSpecificationTemplates = {
    phone: [
        ['screen', 'Màn hình'],
        ['os', 'Hệ điều hành'],
        ['chip', 'Chip'],
        ['ram', 'RAM'],
        ['storage', 'Dung lượng lưu trữ'],
        ['battery', 'Pin'],
        ['charging', 'Sạc'],
        ['material', 'Chất liệu'],
        ['sim', 'SIM'],
        ['brand', 'Hãng']
    ],
    laptop: [
        ['cpu_technology', 'Công nghệ CPU'],
        ['gpu', 'GPU'],
        ['ram', 'RAM'],
        ['storage', 'Ổ cứng'],
        ['screen_size', 'Kích thước màn hình'],
        ['resolution', 'Độ phân giải'],
        ['refresh_rate', 'Tần số quét'],
        ['keyboard_backlight', 'Đèn bàn phím'],
        ['cooling', 'Tản nhiệt']
    ],
    pc: [
        ['mainboard', 'Mainboard'],
        ['cpu', 'CPU'],
        ['ram', 'RAM'],
        ['storage', 'Ổ cứng'],
        ['gpu', 'Card đồ họa'],
        ['cooling', 'Tản nhiệt'],
        ['case', 'Case'],
        ['power_supply', 'Nguồn'],
        ['os', 'Hệ điều hành']
    ],
    audio: [
        ['charging_time', 'Thời lượng sạc'],
        ['audio_technology', 'Công nghệ âm thanh'],
        ['compatibility', 'Tương thích'],
        ['simultaneous_connections', 'Kết nối cùng lúc'],
        ['dimensions', 'Kích thước'],
        ['weight', 'Khối lượng']
    ],
    watch: [
        ['face_diameter', 'Đường kính mặt'],
        ['strap_material', 'Dây đeo'],
        ['strap_width', 'Độ rộng dây'],
        ['frame_material', 'Khung viền'],
        ['case_thickness', 'Độ dày mặt'],
        ['glass_material', 'Chất liệu mặt kính'],
        ['battery_life', 'Thời gian sử dụng pin']
    ],
    camera: [
        ['resolution', 'Độ phân giải'],
        ['viewing_angle', 'Góc nhìn'],
        ['rotation_angle', 'Góc xoay'],
        ['infrared_range', 'Tầm nhìn xa hồng ngoại']
    ],
    charger: [
        ['input', 'Đầu vào'],
        ['output', 'Đầu ra'],
        ['dimensions', 'Kích thước']
    ],
    speaker: [
        ['battery_life', 'Thời lượng pin'],
        ['audio_technology', 'Công nghệ âm thanh'],
        ['compatibility', 'Tương thích'],
        ['connection', 'Kết nối'],
        ['dimensions', 'Kích thước'],
        ['weight', 'Khối lượng']
    ],
    monitor: [
        ['monitor_type', 'Loại màn hình'],
        ['screen_size', 'Kích thước màn'],
        ['resolution', 'Độ phân giải'],
        ['touchscreen', 'Màn hình cảm ứng'],
        ['panel', 'Tấm nền'],
        ['refresh_rate', 'Tần số quét'],
        ['display_technology', 'Công nghệ màn hình']
    ],
    mouse: [
        ['mouse_type', 'Loại chuột'],
        ['compatibility', 'Tương thích'],
        ['sensor', 'Cảm biến'],
        ['max_resolution', 'Độ phân giải tối đa'],
        ['cable_length', 'Độ dài dây'],
        ['connection', 'Cách kết nối']
    ],
    keyboard: [
        ['compatibility', 'Tương thích'],
        ['connection', 'Cách kết nối'],
        ['cable_length', 'Độ dài dây'],
        ['switch_type', 'Loại switch'],
        ['keycap_material', 'Chất liệu keycaps'],
        ['led', 'Đèn LED']
    ]
};

const genericProductSpecificationTemplate = [
    ['brand', 'Hãng'],
    ['model', 'Dòng sản phẩm'],
    ['origin', 'Xuất xứ'],
    ['warranty', 'Bảo hành']
];

const accessoryProductSpecificationSubcategories = Object.freeze([
    { value: 'airpods', label: 'Tai nghe', templateKey: 'audio' },
    { value: 'dong-ho', label: 'Đồng hồ thông minh', templateKey: 'watch' },
    { value: 'camera', label: 'Camera', templateKey: 'camera' },
    { value: 'sac', label: 'Sạc / Pin dự phòng', templateKey: 'charger' },
    { value: 'loa', label: 'Loa', templateKey: 'speaker' },
    { value: 'man-hinh', label: 'Màn hình', templateKey: 'monitor' },
    { value: 'chuot', label: 'Chuột', templateKey: 'mouse' },
    { value: 'ban-phim', label: 'Bàn phím', templateKey: 'keyboard' }
]);

const accessoryProductSpecificationTemplateMap = Object.freeze(
    Object.fromEntries(
        accessoryProductSpecificationSubcategories.map((item) => [item.value, item.templateKey])
    )
);

window.techNoProductSpecificationConfig = Object.freeze({
    templates: productSpecificationTemplates,
    categoryTemplateKeys: Object.freeze({
        phone: 'phone',
        laptop: 'laptop',
        pc: 'pc'
    }),
    accessorySubcategories: accessoryProductSpecificationSubcategories,
    accessoryTemplateKeys: accessoryProductSpecificationTemplateMap,
    fallbackTemplate: genericProductSpecificationTemplate
});

const productGalleryFallbacks = Object.freeze({
    'TGDD-ACC-SAMSUNG-WATCH8-40': [
        'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/338265/samsung-galaxy-watch8-40mm-trang-1-639087500464157953.jpg',
        'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/338265/samsung-galaxy-watch8-40mm-trang-2-639087500471714490.jpg',
        'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/338265/samsung-galaxy-watch8-40mm-trang-3-639087500479804716.jpg',
        'https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/7077/338265/samsung-galaxy-watch8-40mm-trang-4-639087500485548189.jpg'
    ]
});

const categoryDisplayOrder = ['phone', 'laptop', 'pc', 'phukien'];
const FEATURED_SLIDER_LIMIT = 8;
const FEATURED_SLIDER_INTERVAL_MS = 5000;
const FEATURED_IMAGE_WHITE_TOLERANCE = 238;
const FEATURED_PRODUCT_SKUS = Object.freeze([
    'TGDD-ACC-MONITOR-368265',
    'TGDD-PHN-IPHONE-16E-512',
    'TGDD-LAP-MSI-KATANA-15-HX',
    'TGDD-PHN-OPPO-RENO13-256',
    'TGDD-PC-EXTRA-ROSA-ASUS-I120-358731',
    'TGDD-ACC-MOUSE-357677',
    'TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA',
    'TGDD-PC-EXTRA-APPLE-IMAC-M4-331480'
]);
const featuredSliderCategoryMeta = Object.freeze({
    phone: {
        label: 'Điện thoại',
        path: '/pages/phone.html',
        icon: 'fa-mobile-screen-button',
        description: 'Thiết kế hiện đại, trải nghiệm mượt mà và kết nối linh hoạt.'
    },
    laptop: {
        label: 'Laptop',
        path: '/pages/laptop.html',
        icon: 'fa-laptop',
        description: 'Hiệu năng sẵn sàng cho học tập, làm việc và giải trí.'
    },
    pc: {
        label: 'PC',
        path: '/pages/pc.html',
        icon: 'fa-desktop',
        description: 'Cấu hình mạnh mẽ, tối ưu cho công việc và gaming.'
    },
    phukien: {
        label: 'Phụ kiện',
        path: '/pages/phu-kien.html',
        icon: 'fa-gamepad',
        description: 'Hoàn thiện góc máy với trải nghiệm chính xác và sống động.'
    }
});
const brandContainer = document.getElementById('brand-filter-container');
const productSection = document.querySelector('.products-section');
const categoryProductGrid = document.querySelector('.product-grid');
const featuredProductSlider = document.querySelector('[data-featured-slider]');
const currentCategoryPage = getCurrentCategoryPage();
const isProductDetailPage = window.location.pathname.toLowerCase().endsWith('/pages/chitiet-sanpham.html');
const PRODUCTS_PER_PAGE = 12;
const DEFAULT_EMPTY_PRODUCT_MESSAGE = 'Chưa có sản phẩm phù hợp với bộ lọc này.';
let currentBaseProductList = [];
let currentProductList = [];
let currentProductPage = 1;
let currentSearchKeyword = '';
let currentProductSort = 'default';
let currentCategoryFilterGroups = [];
let currentPhonePriceFilter = 'all';
let currentLaptopPriceFilter = 'all';
let currentPcPriceFilter = 'all';
let currentAccessoryPriceFilter = 'all';
let currentEmptyProductMessage = DEFAULT_EMPTY_PRODUCT_MESSAGE;
let productDetailSwiper = null;
let featuredProductSliderController = null;

function getProductListContainer() {
    return productSection || (currentCategoryPage ? categoryProductGrid : null);
}

function getCurrentCategoryPage() {
    const pathname = window.location.pathname.toLowerCase();

    if (pathname.endsWith('/pages/phone.html')) return 'phone';
    if (pathname.endsWith('/pages/laptop.html')) return 'laptop';
    if (pathname.endsWith('/pages/pc.html')) return 'pc'; 
    if (pathname.endsWith('/pages/phu-kien.html')) return 'phukien';
    return '';
}

function getCategoryDisplayName(categoryId) {
    const labels = {
        phone: 'Điện thoại',
        laptop: 'Laptop',
        pc: 'PC',
        phukien: 'Phụ kiện'
    };

    return labels[categoryId] || 'Sản phẩm';
}

function scrollToProductList() {
    document.querySelector('.shop-section, .category-layout')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.btn-cat').forEach(button => {
    button.addEventListener('click', (e) => {
        // Cập nhật trạng thái active cho nút danh mục
        document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const cat = e.target.getAttribute('data-cat');
        renderBrands(cat);
        loadProductsByFilter(cat, null, 1);
    });
});

function renderBrands(category) {
    if (!brandContainer) return;

    brandContainer.innerHTML = ''; 
    const brands = brandData[category] || [];

    if (brands.length === 0) return;

    // Render các nút logo
    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'btn-brand';
        btn.type = 'button';
        btn.dataset.category = category;
        btn.dataset.value = brand;

        const imagePath = `assets/images/brand-logo/${category}/${brand}.png`;
        btn.innerHTML = `<img src="${imagePath}" alt="${brand}" 
                            onerror="this.style.display='none'; this.nextElementSibling.textContent='${filterLabelMap[brand] || brand.toUpperCase()}'">
                         <span></span>`;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-brand').forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
            loadProductsByFilter(category, brand, 1);
        });

        brandContainer.appendChild(btn);
    });

    // Tạo nút đóng "X"
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close-filter';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    
    closeBtn.addEventListener('click', () => {
        brandContainer.innerHTML = '';
        document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
        loadProductsByFilter(null, null, 1);
    });
    
    brandContainer.appendChild(closeBtn);
}

async function loadProductsByFilter(category, filterValue, page = 1) {
    const productListContainer = getProductListContainer();
    const shouldInitializeHomeSlider = Boolean(featuredProductSlider && !category && !filterValue);
    if (!productListContainer || !window.supabaseClient) {
        if (shouldInitializeHomeSlider) {
            renderFeaturedProductSliderFallback();
        }
        return;
    }

    productListContainer.innerHTML = '<div class="products-empty-state">Đang tải sản phẩm...</div>';
    renderPagination(0, 1);

    let query = window.supabaseClient
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .order('sku', { ascending: true });

    if (category) {
        query = query.eq('category_id', category);
    }

    if (category && filterValue) {
        const filterMode = filterModeByCategory[category] || 'brand';
        query = query.eq(filterMode, filterValue);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Không thể tải sản phẩm từ Supabase:', error.message);
        productListContainer.innerHTML = '<div class="products-empty-state">Không thể tải sản phẩm. Vui lòng kiểm tra database hoặc kết nối Supabase.</div>';
        if (shouldInitializeHomeSlider) {
            renderFeaturedProductSliderFallback();
        }
        return;
    }

    const products = removeDuplicateProducts(data || []);
    if (shouldInitializeHomeSlider) {
        renderFeaturedProductSlider(products);
    }
    const arrangedProducts = category || filterValue ? products : mixProductsByCategoryForPages(products);
    currentBaseProductList = currentCategoryPage
        ? arrangedProducts
        : spreadSimilarProductsAcrossPages(arrangedProducts);
    applyProductSearch(page);
}

function removeDuplicateProducts(products) {
    const seenNames = new Set();
    const seenImages = new Set();

    return products.filter(product => {
        const nameKey = normalizeProductKey(product.name);
        const imageKey = normalizeProductKey(getProductImage(product));

        if ((nameKey && seenNames.has(nameKey)) || (imageKey && seenImages.has(imageKey))) {
            return false;
        }

        if (nameKey) {
            seenNames.add(nameKey);
        }

        if (imageKey) {
            seenImages.add(imageKey);
        }

        return true;
    });
}

function selectFeaturedProducts(products) {
    const availableProducts = (Array.isArray(products) ? products : [])
        .filter(product => (
            product?.status === 'active'
            && Math.max(0, Number(product.stock) || 0) > 0
            && Boolean(getProductImage(product))
        ));
    const availableBySku = new Map(
        availableProducts.map(product => [String(product.sku || ''), product])
    );
    const selectedProducts = FEATURED_PRODUCT_SKUS
        .map(sku => availableBySku.get(sku))
        .filter(Boolean);
    const selectedSkus = new Set(selectedProducts.map(product => product.sku));

    if (selectedProducts.length < FEATURED_SLIDER_LIMIT) {
        const fallbackProducts = availableProducts
            .filter(product => !selectedSkus.has(product.sku))
            .sort((firstProduct, secondProduct) => (
                normalizeProductImageUrls(secondProduct.image_urls).length
                - normalizeProductImageUrls(firstProduct.image_urls).length
                || Number(secondProduct.discount_percent || 0) - Number(firstProduct.discount_percent || 0)
                || Number(secondProduct.stock || 0) - Number(firstProduct.stock || 0)
                || normalizeProductKey(firstProduct.name).localeCompare(
                    normalizeProductKey(secondProduct.name),
                    'vi',
                    { numeric: true, sensitivity: 'base' }
                )
            ));

        for (const fallbackProduct of fallbackProducts) {
            selectedProducts.push(fallbackProduct);
            selectedSkus.add(fallbackProduct.sku);

            if (selectedProducts.length >= FEATURED_SLIDER_LIMIT) break;
        }
    }

    return selectedProducts.slice(0, FEATURED_SLIDER_LIMIT);
}

function getFeaturedSliderCategoryMeta(categoryId) {
    return featuredSliderCategoryMeta[categoryId] || {
        label: 'Sản phẩm',
        path: '#products',
        icon: 'fa-star',
        description: 'Sản phẩm công nghệ nổi bật được lựa chọn tại TECH.NO.'
    };
}

function renderFeaturedProductSlider(products) {
    if (!featuredProductSlider) return;

    const featuredProducts = selectFeaturedProducts(products);
    if (!featuredProducts.length) {
        renderFeaturedProductSliderFallback();
        return;
    }

    featuredProductSliderController?.destroy();

    const slidesMarkup = featuredProducts.map((product, index) => {
        const categoryMeta = getFeaturedSliderCategoryMeta(product.category_id);
        const detailUrl = getProductDetailUrl(product);
        const imageUrls = normalizeProductImageUrls(product.image_urls);
        const imageUrl = imageUrls[0] || '';
        const price = Math.max(0, Number(product.price) || 0);
        const originalPrice = Math.max(0, Number(product.original_price) || 0);
        const discountPercent = Math.max(0, Number(product.discount_percent) || 0);
        const stock = Math.max(0, Number(product.stock) || 0);
        const isActive = index === 0;

        return `
            <article
                class="featured-slide ${isActive ? 'is-active' : ''}"
                data-featured-slide
                data-category="${escapeHtml(product.category_id)}"
                role="group"
                aria-roledescription="slide"
                aria-label="${index + 1} trên ${featuredProducts.length}: ${escapeHtml(product.name)}"
                aria-hidden="${isActive ? 'false' : 'true'}"
            >
                <div class="featured-slide__content">
                    <span class="featured-slide__eyebrow">
                        <i class="fa-solid ${escapeHtml(categoryMeta.icon)}" aria-hidden="true"></i>
                        Sản phẩm nổi bật · ${escapeHtml(categoryMeta.label)}
                    </span>

                    <h2 class="featured-slide__title">
                        <a href="${escapeHtml(detailUrl)}" tabindex="${isActive ? '0' : '-1'}">
                            ${escapeHtml(product.name)}
                        </a>
                    </h2>

                    <p class="featured-slide__description">${escapeHtml(categoryMeta.description)}</p>

                    <div class="featured-slide__benefits" aria-label="Quyền lợi">
                        <span class="featured-slide__benefit">
                            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
                            Chính hãng 100%
                        </span>
                        <span class="featured-slide__benefit">
                            <i class="fa-solid fa-truck-fast" aria-hidden="true"></i>
                            Giao hàng toàn quốc
                        </span>
                        <span class="featured-slide__benefit">
                            <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                            Còn ${stock.toLocaleString('vi-VN')} sản phẩm
                        </span>
                    </div>

                    <div class="featured-slide__commerce">
                        <strong class="featured-slide__price">${formatCurrency(price)}đ</strong>
                        ${originalPrice > price ? `
                            <del class="featured-slide__original-price">${formatCurrency(originalPrice)}đ</del>
                        ` : ''}
                        ${discountPercent > 0 ? `
                            <span class="featured-slide__discount">-${discountPercent}%</span>
                        ` : ''}
                    </div>

                    <div class="featured-slide__actions">
                        <a
                            class="featured-slide__cta featured-slide__cta--primary"
                            href="${escapeHtml(detailUrl)}"
                            tabindex="${isActive ? '0' : '-1'}"
                        >
                            Xem chi tiết
                            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </a>
                        <a
                            class="featured-slide__cta"
                            href="${escapeHtml(categoryMeta.path)}"
                            tabindex="${isActive ? '0' : '-1'}"
                        >
                            Xem ${escapeHtml(categoryMeta.label.toLowerCase())}
                        </a>
                    </div>
                </div>

                <div class="featured-slide__visual">
                    <a
                        class="featured-slide__image-link"
                        href="${escapeHtml(detailUrl)}"
                        aria-label="Xem ${escapeHtml(product.name)}"
                        tabindex="${isActive ? '0' : '-1'}"
                    >
                        <img
                            class="featured-slide__image"
                            src="${escapeHtml(imageUrl)}"
                            alt="${escapeHtml(product.name)}"
                            ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}
                            decoding="async"
                            referrerpolicy="no-referrer"
                            data-fallback-index="0"
                            data-fallback-sources="${escapeHtml(imageUrls.join('|'))}"
                            onerror="handleProductImageError(this);"
                            onload="processFeaturedSlideImage(this);"
                        >
                    </a>
                </div>
            </article>
        `;
    }).join('');

    const controlsMarkup = featuredProducts.length > 1 ? `
        <button
            class="featured-slider__arrow featured-slider__arrow--previous"
            type="button"
            data-featured-previous
            aria-label="Sản phẩm trước"
        >
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button
            class="featured-slider__arrow featured-slider__arrow--next"
            type="button"
            data-featured-next
            aria-label="Sản phẩm tiếp theo"
        >
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
        <div class="featured-slider__footer">
            <div class="featured-slider__dots" role="group" aria-label="Chọn sản phẩm nổi bật">
                ${featuredProducts.map((product, index) => `
                    <button
                        class="featured-slider__dot"
                        type="button"
                        data-featured-dot="${index}"
                        aria-label="Đi đến sản phẩm ${index + 1}: ${escapeHtml(product.name)}"
                        aria-current="${index === 0 ? 'true' : 'false'}"
                    ></button>
                `).join('')}
            </div>
            <button
                class="featured-slider__autoplay"
                type="button"
                data-featured-autoplay
                aria-label="Tạm dừng tự động chuyển"
                aria-pressed="false"
            >
                <i class="fa-solid fa-pause" aria-hidden="true"></i>
            </button>
        </div>
        <p class="featured-slider__status" data-featured-status aria-live="polite"></p>
    ` : '';

    featuredProductSlider.innerHTML = `
        <div class="featured-slider__viewport">
            <div class="featured-slider__track" data-featured-track aria-live="off">
                ${slidesMarkup}
            </div>
        </div>
        ${controlsMarkup}
    `;
    featuredProductSlider.dataset.slideCount = String(featuredProducts.length);
    featuredProductSlider.dataset.autoplayInterval = String(FEATURED_SLIDER_INTERVAL_MS);
    featuredProductSliderController = setupFeaturedProductSlider(featuredProductSlider, featuredProducts);
    setupFeaturedSlideImages(featuredProductSlider);
}

function renderFeaturedProductSliderFallback() {
    if (!featuredProductSlider) return;

    featuredProductSliderController?.destroy();
    featuredProductSliderController = null;
    featuredProductSlider.removeAttribute('data-slide-count');
    featuredProductSlider.dataset.autoplayState = 'stopped';
    featuredProductSlider.innerHTML = `
        <div class="featured-slider__fallback" role="status">
            <strong>Chưa thể tải sản phẩm nổi bật</strong>
            <span>Bạn vẫn có thể khám phá toàn bộ sản phẩm đang có tại TECH.NO.</span>
            <a class="featured-slider__fallback-link" href="#products">Xem tất cả sản phẩm</a>
        </div>
    `;
}

function setupFeaturedProductSlider(sliderRoot, products) {
    const track = sliderRoot.querySelector('[data-featured-track]');
    const slides = [...sliderRoot.querySelectorAll('[data-featured-slide]')];
    const previousButton = sliderRoot.querySelector('[data-featured-previous]');
    const nextButton = sliderRoot.querySelector('[data-featured-next]');
    const autoplayButton = sliderRoot.querySelector('[data-featured-autoplay]');
    const dots = [...sliderRoot.querySelectorAll('[data-featured-dot]')];
    const statusElement = sliderRoot.querySelector('[data-featured-status]');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = 0;
    let timerId = null;
    let isHovered = false;
    let hasFocusWithin = false;
    let isTouching = false;
    let isInViewport = true;
    let userPaused = false;
    let touchStartX = null;
    let touchStartY = null;

    const stopAutoplay = () => {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
        sliderRoot.dataset.autoplayState = 'paused';
    };

    const canAutoplay = () => (
        slides.length > 1
        && !reducedMotionQuery.matches
        && !userPaused
        && !isHovered
        && !hasFocusWithin
        && !isTouching
        && isInViewport
        && !document.hidden
    );

    const startAutoplay = () => {
        stopAutoplay();
        if (!canAutoplay()) return;

        timerId = window.setInterval(() => {
            updateActiveSlide(activeIndex + 1);
        }, FEATURED_SLIDER_INTERVAL_MS);
        sliderRoot.dataset.autoplayState = 'running';
    };

    const updateAutoplayButton = () => {
        if (!autoplayButton) return;

        const autoplayDisabled = reducedMotionQuery.matches;
        autoplayButton.disabled = autoplayDisabled;
        autoplayButton.setAttribute('aria-pressed', String(userPaused));
        autoplayButton.setAttribute(
            'aria-label',
            autoplayDisabled
                ? 'Tự động chuyển đã tắt theo cài đặt giảm chuyển động'
                : userPaused
                    ? 'Tiếp tục tự động chuyển'
                    : 'Tạm dừng tự động chuyển'
        );
        autoplayButton.innerHTML = `
            <i class="fa-solid ${userPaused ? 'fa-play' : 'fa-pause'}" aria-hidden="true"></i>
        `;
    };

    const updateActiveSlide = (nextIndex, announce = false) => {
        activeIndex = (nextIndex + slides.length) % slides.length;
        track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
        sliderRoot.dataset.activeIndex = String(activeIndex);

        slides.forEach((slide, index) => {
            const isActive = index === activeIndex;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));

            if ('inert' in slide) {
                slide.inert = !isActive;
            }

            slide.querySelectorAll('a, button').forEach(element => {
                element.tabIndex = isActive ? 0 : -1;
            });
        });

        dots.forEach((dot, index) => {
            dot.setAttribute('aria-current', String(index === activeIndex));
        });

        const activeSlide = slides[activeIndex];
        const activeCategory = activeSlide?.dataset.category || 'phone';
        const activeMeta = getFeaturedSliderCategoryMeta(activeCategory);
        sliderRoot.style.setProperty(
            '--featured-accent',
            getComputedStyle(activeSlide).getPropertyValue('--featured-accent').trim() || '#2563eb'
        );

        if (announce && statusElement) {
            statusElement.textContent = `Đang xem sản phẩm ${activeIndex + 1} trên ${slides.length}: ${products[activeIndex].name}`;
        }

        sliderRoot.setAttribute(
            'aria-label',
            `Sản phẩm nổi bật · ${activeMeta.label} · ${activeIndex + 1} trên ${slides.length}`
        );
    };

    const moveManually = (nextIndex) => {
        updateActiveSlide(nextIndex, true);
        startAutoplay();
    };

    const handlePrevious = () => moveManually(activeIndex - 1);
    const handleNext = () => moveManually(activeIndex + 1);
    const handleAutoplayToggle = () => {
        userPaused = !userPaused;
        updateAutoplayButton();
        startAutoplay();
    };
    const handleMouseEnter = () => {
        isHovered = true;
        stopAutoplay();
    };
    const handleMouseLeave = () => {
        isHovered = false;
        startAutoplay();
    };
    const handleFocusIn = () => {
        hasFocusWithin = true;
        stopAutoplay();
    };
    const handleFocusOut = () => {
        window.setTimeout(() => {
            hasFocusWithin = sliderRoot.contains(document.activeElement);
            startAutoplay();
        }, 0);
    };
    const handleVisibilityChange = () => {
        startAutoplay();
    };
    const handleReducedMotionChange = () => {
        if (reducedMotionQuery.matches) stopAutoplay();
        updateAutoplayButton();
        startAutoplay();
    };
    const handleKeyDown = (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            moveManually(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            moveManually(activeIndex + 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            moveManually(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            moveManually(slides.length - 1);
        }
    };
    const handleTouchStart = (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        isTouching = true;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        stopAutoplay();
    };
    const handleTouchEnd = (event) => {
        const touch = event.changedTouches[0];
        const horizontalDistance = touch && touchStartX !== null ? touch.clientX - touchStartX : 0;
        const verticalDistance = touch && touchStartY !== null ? touch.clientY - touchStartY : 0;

        isTouching = false;
        touchStartX = null;
        touchStartY = null;

        if (Math.abs(horizontalDistance) >= 48 && Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
            moveManually(activeIndex + (horizontalDistance < 0 ? 1 : -1));
        } else {
            startAutoplay();
        }
    };

    previousButton?.addEventListener('click', handlePrevious);
    nextButton?.addEventListener('click', handleNext);
    autoplayButton?.addEventListener('click', handleAutoplayToggle);
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => moveManually(index));
    });
    sliderRoot.addEventListener('mouseenter', handleMouseEnter);
    sliderRoot.addEventListener('mouseleave', handleMouseLeave);
    sliderRoot.addEventListener('focusin', handleFocusIn);
    sliderRoot.addEventListener('focusout', handleFocusOut);
    sliderRoot.addEventListener('keydown', handleKeyDown);
    sliderRoot.addEventListener('touchstart', handleTouchStart, { passive: true });
    sliderRoot.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    } else {
        reducedMotionQuery.addListener(handleReducedMotionChange);
    }

    const viewportObserver = typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            isInViewport = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
            startAutoplay();
        }, { threshold: [0, 0.35] })
        : null;
    viewportObserver?.observe(sliderRoot);

    updateActiveSlide(0);
    updateAutoplayButton();
    startAutoplay();

    return {
        destroy() {
            stopAutoplay();
            previousButton?.removeEventListener('click', handlePrevious);
            nextButton?.removeEventListener('click', handleNext);
            autoplayButton?.removeEventListener('click', handleAutoplayToggle);
            sliderRoot.removeEventListener('mouseenter', handleMouseEnter);
            sliderRoot.removeEventListener('mouseleave', handleMouseLeave);
            sliderRoot.removeEventListener('focusin', handleFocusIn);
            sliderRoot.removeEventListener('focusout', handleFocusOut);
            sliderRoot.removeEventListener('keydown', handleKeyDown);
            sliderRoot.removeEventListener('touchstart', handleTouchStart);
            sliderRoot.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            viewportObserver?.disconnect();

            if (typeof reducedMotionQuery.removeEventListener === 'function') {
                reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
            } else {
                reducedMotionQuery.removeListener(handleReducedMotionChange);
            }
        }
    };
}

function normalizeProductKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function normalizeProductSortMode(value) {
    const supportedModes = new Set(['default', 'price-asc', 'price-desc', 'newest']);
    return supportedModes.has(value) ? value : 'default';
}

function getProductSortPrice(product) {
    const price = Number(product?.price);
    return Number.isFinite(price) ? price : 0;
}

function getProductCreatedTime(product) {
    const createdTime = Date.parse(product?.created_at || '');
    return Number.isFinite(createdTime) ? createdTime : 0;
}

function compareProductIdentity(firstProduct, secondProduct) {
    const firstIdentity = `${normalizeProductKey(firstProduct?.name)} ${normalizeProductKey(firstProduct?.sku)}`;
    const secondIdentity = `${normalizeProductKey(secondProduct?.name)} ${normalizeProductKey(secondProduct?.sku)}`;

    return firstIdentity.localeCompare(secondIdentity, 'vi', {
        numeric: true,
        sensitivity: 'base'
    });
}

function sortProducts(products, sortMode = 'default') {
    const sortedProducts = Array.isArray(products) ? [...products] : [];
    const normalizedMode = normalizeProductSortMode(sortMode);

    if (normalizedMode === 'price-asc') {
        return sortedProducts.sort((firstProduct, secondProduct) => (
            getProductSortPrice(firstProduct) - getProductSortPrice(secondProduct)
            || compareProductIdentity(firstProduct, secondProduct)
        ));
    }

    if (normalizedMode === 'price-desc') {
        return sortedProducts.sort((firstProduct, secondProduct) => (
            getProductSortPrice(secondProduct) - getProductSortPrice(firstProduct)
            || compareProductIdentity(firstProduct, secondProduct)
        ));
    }

    if (normalizedMode === 'newest') {
        return sortedProducts.sort((firstProduct, secondProduct) => (
            getProductCreatedTime(secondProduct) - getProductCreatedTime(firstProduct)
            || compareProductIdentity(firstProduct, secondProduct)
        ));
    }

    return sortedProducts;
}

function applyProductSearch(page = 1) {
    const keyword = normalizeProductKey(currentSearchKeyword);
    let filteredProducts = keyword
        ? currentBaseProductList.filter(product => productMatchesSearch(product, keyword))
        : [...currentBaseProductList];

    filteredProducts = applyCategoryFilterGroups(filteredProducts);
    filteredProducts = applyPhoneHeroPriceFilter(filteredProducts);
    filteredProducts = applyLaptopHeroPriceFilter(filteredProducts);
    filteredProducts = applyPcHeroPriceFilter(filteredProducts);
    filteredProducts = applyAccessoryHeroPriceFilter(filteredProducts);
    if (currentCategoryPage && currentProductSort === 'default') {
        currentProductList = spreadSimilarProductsAcrossPages(filteredProducts);
    } else if (currentCategoryPage) {
        currentProductList = sortProducts(filteredProducts, currentProductSort);
    } else {
        currentProductList = filteredProducts;
    }
    currentEmptyProductMessage = keyword
        || hasActiveCategoryFilters()
        || currentPhonePriceFilter !== 'all'
        || currentLaptopPriceFilter !== 'all'
        || currentPcPriceFilter !== 'all'
        || currentAccessoryPriceFilter !== 'all'
        ? `Không tìm thấy sản phẩm phù hợp với "${currentSearchKeyword.trim() || 'bộ lọc đã chọn'}".`
        : DEFAULT_EMPTY_PRODUCT_MESSAGE;

    renderProductPage(page);
}

function productMatchesSearch(product, normalizedKeyword) {
    const searchTokens = normalizedKeyword.split(' ').filter(Boolean);
    if (!searchTokens.length) return true;

    const specificationValues = Object.values(getProductSpecifications(product))
        .filter((value) => ['string', 'number'].includes(typeof value))
        .join(' ');
    const searchableText = normalizeProductKey([
        product.name,
        product.brand,
        product.category_id,
        product.subcategory,
        product.short_description,
        product.description,
        product.sku,
        specificationValues
    ].filter(Boolean).join(' '));

    return searchTokens.every(token => searchableText.includes(token));
}

function applyCategoryFilterGroups(products) {
    const activeGroups = currentCategoryFilterGroups.filter(group => group.values.length > 0);
    if (!activeGroups.length) return products;

    return products.filter(product =>
        activeGroups.every(group =>
            group.values.some(value =>
                productMatchesCategoryFilter(product, group.title, value, group.field)
            )
        )
    );
}

function hasActiveCategoryFilters() {
    return currentCategoryFilterGroups.some(group => group.values.length > 0);
}

function applyPhoneHeroPriceFilter(products) {
    if (currentCategoryPage !== 'phone' || currentPhonePriceFilter === 'all') {
        return products;
    }

    const priceBoundary = 10_000_000;

    return products.filter(product => {
        const price = Number(product.price || 0);

        if (currentPhonePriceFilter === 'under-10') {
            return price < priceBoundary;
        }

        if (currentPhonePriceFilter === 'from-10') {
            return price >= priceBoundary;
        }

        return true;
    });
}

function applyLaptopHeroPriceFilter(products) {
    if (currentCategoryPage !== 'laptop' || currentLaptopPriceFilter === 'all') {
        return products;
    }

    const priceBoundary = 20_000_000;

    return products.filter(product => {
        const price = Number(product.price || 0);

        if (currentLaptopPriceFilter === 'under-20') {
            return price < priceBoundary;
        }

        if (currentLaptopPriceFilter === 'from-20') {
            return price >= priceBoundary;
        }

        return true;
    });
}

function applyPcHeroPriceFilter(products) {
    if (currentCategoryPage !== 'pc' || currentPcPriceFilter === 'all') {
        return products;
    }

    const priceBoundary = 20_000_000;

    return products.filter(product => {
        const price = Number(product.price || 0);

        if (currentPcPriceFilter === 'under-20') {
            return price < priceBoundary;
        }

        if (currentPcPriceFilter === 'from-20') {
            return price >= priceBoundary;
        }

        return true;
    });
}

function applyAccessoryHeroPriceFilter(products) {
    if (currentCategoryPage !== 'phukien' || currentAccessoryPriceFilter === 'all') {
        return products;
    }

    const priceBoundary = 2_000_000;

    return products.filter(product => {
        const price = Number(product.price || 0);

        if (currentAccessoryPriceFilter === 'under-2') {
            return price < priceBoundary;
        }

        if (currentAccessoryPriceFilter === 'from-2') {
            return price >= priceBoundary;
        }

        return true;
    });
}

function productMatchesCategoryFilter(product, groupTitle, value, field = '') {
    const normalizedGroupTitle = normalizeProductKey(groupTitle);
    const normalizedValue = normalizeProductKey(value);

    if (field === 'brand') {
        return normalizeProductKey(product.brand) === normalizedValue;
    }

    if (field === 'subcategory') {
        const productSubcategory = normalizeProductKey(product.subcategory);

        // Dữ liệu hiện tại dùng "airpods" cho nhóm tai nghe. Đồng thời hỗ trợ
        // cả mã "tai-nghe" để các sản phẩm được thêm mới sau này vẫn lọc đúng.
        if (normalizedValue === 'airpods') {
            return productSubcategory === 'airpods' || productSubcategory === 'tai-nghe';
        }

        return productSubcategory === normalizedValue;
    }

    if (normalizedGroupTitle.includes('gia')) {
        return productMatchesPriceFilter(product, normalizedValue);
    }

    return productMatchesSearch(product, normalizedValue);
}

function productMatchesPriceFilter(product, normalizedValue) {
    const price = Number(product.price || 0);
    const million = 1000000;

    if (normalizedValue.includes('duoi 500 nghin')) return price < 500000;
    if (normalizedValue.includes('500 nghin') && normalizedValue.includes('2 trieu')) {
        return price >= 500000 && price <= 2 * million;
    }

    if (normalizedValue.includes('duoi 15 trieu')) return price < 15 * million;
    if (normalizedValue.includes('15') && normalizedValue.includes('25')) {
        return price >= 15 * million && price <= 25 * million;
    }
    if (normalizedValue.includes('duoi 20 trieu')) return price < 20 * million;
    if (normalizedValue.includes('20') && normalizedValue.includes('35')) {
        return price >= 20 * million && price <= 35 * million;
    }
    if (normalizedValue.includes('tren 35 trieu')) return price > 35 * million;
    if (normalizedValue.includes('tren 25 trieu')) return price > 25 * million;
    if (normalizedValue.includes('tren 2 trieu')) return price > 2 * million;

    return true;
}

function spreadSimilarProductsAcrossPages(products) {
    if (!Array.isArray(products) || products.length <= 1) {
        return products || [];
    }

    const remainingProducts = products.map((product, sourceIndex) => ({
        product,
        sourceIndex
    }));
    const arrangedProducts = [];

    while (remainingProducts.length) {
        let bestCandidateIndex = 0;
        let bestCandidateScore = null;

        remainingProducts.forEach((candidate, candidateIndex) => {
            const score = getProductPlacementScore(
                candidate,
                arrangedProducts,
                remainingProducts
            );

            if (
                !bestCandidateScore
                || compareProductPlacementScores(score, bestCandidateScore) < 0
            ) {
                bestCandidateIndex = candidateIndex;
                bestCandidateScore = score;
            }
        });

        const [selectedCandidate] = remainingProducts.splice(bestCandidateIndex, 1);
        if (selectedCandidate?.product) {
            arrangedProducts.push(selectedCandidate.product);
        }
    }

    return arrangedProducts;
}

function getProductPlacementScore(candidate, arrangedProducts, remainingProducts) {
    const product = candidate.product;
    const familyKey = getProductFamilyKey(product);
    const visualGroupKey = getProductVisualGroupKey(product);
    const brandKey = normalizeProductKey(product?.brand || '');
    const previousProduct = arrangedProducts[arrangedProducts.length - 1];
    const sameVisualGroup = Boolean(
        previousProduct
        && visualGroupKey
        && visualGroupKey === getProductVisualGroupKey(previousProduct)
    );
    const sameBrand = Boolean(
        previousProduct
        && brandKey
        && brandKey === normalizeProductKey(previousProduct.brand || '')
    );
    const sameFamily = Boolean(
        previousProduct
        && familyKey
        && familyKey === getProductFamilyKey(previousProduct)
    );
    const remainingVisualGroupCount = remainingProducts.filter(
        item => getProductVisualGroupKey(item.product) === visualGroupKey
    ).length;
    const remainingBrandCount = brandKey
        ? remainingProducts.filter(
            item => normalizeProductKey(item.product?.brand || '') === brandKey
        ).length
        : 0;

    return [
        Number(sameVisualGroup) + Number(sameBrand),
        Number(sameVisualGroup),
        Number(sameFamily),
        -remainingVisualGroupCount,
        -remainingBrandCount,
        candidate.sourceIndex
    ];
}

function compareProductPlacementScores(leftScore, rightScore) {
    const scoreLength = Math.max(leftScore.length, rightScore.length);

    for (let scoreIndex = 0; scoreIndex < scoreLength; scoreIndex += 1) {
        const difference = (leftScore[scoreIndex] || 0) - (rightScore[scoreIndex] || 0);
        if (difference !== 0) {
            return difference;
        }
    }

    return 0;
}

function getProductVisualGroupKey(product) {
    if (!product) return '';

    const category = normalizeProductKey(product.category_id || 'other');
    const explicitSubcategory = normalizeProductKey(product.subcategory || '');

    if (category !== 'pc') {
        return `${category}:${explicitSubcategory || 'general'}`;
    }

    if (explicitSubcategory) {
        if (explicitSubcategory.includes('mini')) {
            return 'pc:mini-pc';
        }

        if (
            explicitSubcategory.includes('all-in-one')
            || explicitSubcategory.includes('aio')
        ) {
            return 'pc:all-in-one';
        }

        return 'pc:desktop';
    }

    const normalizedName = normalizeProductKey(product.name)
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    if (/\b(aio|all in one|imac)\b/.test(normalizedName)) {
        return 'pc:all-in-one';
    }

    if (/\b(minipc|mini pc|mac mini|cubi|nuc)\b/.test(normalizedName)) {
        return 'pc:mini-pc';
    }

    if (/\b(gaming|rosa|rezo|rtx|gtx)\b/.test(normalizedName)) {
        return 'pc:desktop';
    }

    return 'pc:desktop';
}

function getProductFamilyKey(product) {
    if (!product) return '';

    const category = product.category_id || 'other';
    const brand = normalizeProductKey(product.brand || '');
    const rawName = normalizeProductKey(product.name)
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ');
    const tokens = rawName
        .split(' ')
        .filter(Boolean)
        .filter(token => !isProductSpecToken(token));

    if (!tokens.length) {
        return '';
    }

    const brandIndex = brand ? tokens.indexOf(brand) : -1;
    const modelTokens = brandIndex >= 0 ? tokens.slice(brandIndex + 1) : tokens.slice(1);
    const brandKey = brand || tokens[0];

    if (category === 'laptop' || category === 'pc') {
        return `${category}:${brandKey}:${buildComputerFamily(modelTokens)}`;
    }

    if (category === 'phone') {
        return `${category}:${brandKey}:${modelTokens.slice(0, 3).join(' ')}`;
    }

    return `${category}:${product.subcategory || 'general'}:${brandKey}:${modelTokens.slice(0, 2).join(' ')}`;
}

function buildComputerFamily(modelTokens) {
    if (!modelTokens.length) return 'unknown';

    const firstToken = modelTokens[0];

    if (/^\d/.test(firstToken)) {
        return firstToken;
    }

    if (/^[a-z]+[a-z0-9]*\d[a-z0-9]*$/.test(firstToken)) {
        return firstToken;
    }

    return modelTokens.slice(0, 2).join(' ');
}

function isProductSpecToken(token) {
    return /^(core|intel|amd|ryzen|ram|ssd|win11pro|win11|wifi|gps|cellular|lte|type|pd|usb|cong|day|vien|mau|pin|den|trang|xam|xanh|hong|vang|bac|do)$/.test(token)
        || /^[ir]\d{1,2}$/.test(token)
        || /^\d+(gb|tb|mah|w|hz|mm|inch|x|u|h|hs|hx|g)$/.test(token)
        || /^\d+gb$/.test(token)
        || /^\d+mah$/.test(token)
        || /^\d+w$/.test(token)
        || /^\d+hz$/.test(token)
        || /^\d+mm$/.test(token);
}

function mixProductsByCategoryForPages(products) {
    if (!Array.isArray(products) || products.length <= PRODUCTS_PER_PAGE) {
        return products || [];
    }

    const sourceOrder = [...categoryDisplayOrder, 'other'];
    const buckets = sourceOrder.reduce((result, category) => {
        result[category] = [];
        return result;
    }, {});

    products.forEach(product => {
        const category = categoryDisplayOrder.includes(product.category_id)
            ? product.category_id
            : 'other';
        buckets[category].push(product);
    });

    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const pageLimits = Array.from({ length: totalPages }, (_, pageIndex) =>
        Math.min(PRODUCTS_PER_PAGE, products.length - pageIndex * PRODUCTS_PER_PAGE)
    );

    const allocations = {};
    const minAllocation = {};
    const surplus = sourceOrder.reduce((result, category) => {
        result[category] = 0;
        return result;
    }, {});

    sourceOrder.forEach(category => {
        const count = buckets[category].length;
        const baseCount = Math.floor(count / totalPages);
        const extraCount = count % totalPages;

        minAllocation[category] = category !== 'other' && count >= totalPages ? 1 : 0;
        allocations[category] = pageLimits.map((_, pageIndex) =>
            baseCount + (pageIndex < extraCount ? 1 : 0)
        );
    });

    const getPageTotal = (pageIndex) =>
        sourceOrder.reduce((total, category) => total + allocations[category][pageIndex], 0);

    pageLimits.forEach((pageLimit, pageIndex) => {
        while (getPageTotal(pageIndex) > pageLimit) {
            const nextCategory = sourceOrder
                .filter(category => allocations[category][pageIndex] > minAllocation[category])
                .sort((a, b) => {
                    const countDiff = allocations[b][pageIndex] - allocations[a][pageIndex];
                    if (countDiff !== 0) return countDiff;

                    const bucketDiff = buckets[b].length - buckets[a].length;
                    if (bucketDiff !== 0) return bucketDiff;

                    return sourceOrder.indexOf(b) - sourceOrder.indexOf(a);
                })[0];

            if (!nextCategory) break;

            allocations[nextCategory][pageIndex] -= 1;
            surplus[nextCategory] += 1;
        }
    });

    pageLimits.forEach((pageLimit, pageIndex) => {
        while (getPageTotal(pageIndex) < pageLimit) {
            const nextCategory = sourceOrder
                .filter(category => surplus[category] > 0)
                .sort((a, b) => {
                    const surplusDiff = surplus[b] - surplus[a];
                    if (surplusDiff !== 0) return surplusDiff;

                    const pageDiff = allocations[a][pageIndex] - allocations[b][pageIndex];
                    if (pageDiff !== 0) return pageDiff;

                    return sourceOrder.indexOf(a) - sourceOrder.indexOf(b);
                })[0];

            if (!nextCategory) break;

            allocations[nextCategory][pageIndex] += 1;
            surplus[nextCategory] -= 1;
        }
    });

    const bucketIndexes = sourceOrder.reduce((result, category) => {
        result[category] = 0;
        return result;
    }, {});

    const pages = pageLimits.map((pageLimit, pageIndex) => {
        const page = [];
        const pageAllocation = sourceOrder.reduce((result, category) => {
            result[category] = allocations[category][pageIndex];
            return result;
        }, {});

        while (page.length < pageLimit) {
            let hasAddedProduct = false;

            sourceOrder.forEach(category => {
                if (pageAllocation[category] <= 0 || page.length >= pageLimit) return;

                const product = buckets[category][bucketIndexes[category]];
                if (product) {
                    page.push(product);
                    bucketIndexes[category] += 1;
                }

                pageAllocation[category] -= 1;
                hasAddedProduct = true;
            });

            if (!hasAddedProduct) break;
        }

        return page;
    });

    const leftovers = sourceOrder.flatMap(category => buckets[category].slice(bucketIndexes[category]));
    return pages.flat().concat(leftovers);
}

function renderProductPage(page = 1) {
    if (!getProductListContainer()) return;

    if (!currentProductList.length) {
        currentProductPage = 1;
        renderProducts([]);
        renderPagination(0, 1);
        return;
    }

    const totalPages = Math.ceil(currentProductList.length / PRODUCTS_PER_PAGE);
    currentProductPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    const startIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = currentProductList.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    renderProducts(pageProducts);
    renderPagination(currentProductList.length, currentProductPage);
}

function renderPagination(totalProducts, activePage) {
    const paginationHost = document.getElementById('pagination-container');
    if (!paginationHost) return;

    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    if (totalPages <= 1) {
        paginationHost.innerHTML = '';
        paginationHost.classList.add('is-hidden');
        return;
    }

    paginationHost.classList.remove('is-hidden');
    const pageParts = buildPaginationParts(activePage, totalPages);

    paginationHost.innerHTML = `
        <div class="pagination-container" aria-label="Phân trang sản phẩm">
            <button class="page-btn prev" type="button" data-page="${activePage - 1}" ${activePage === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            ${pageParts.map(part => {
                if (part === 'dots') {
                    return '<span class="page-dots">...</span>';
                }

                return `
                    <button class="page-btn ${part === activePage ? 'active' : ''}" type="button" data-page="${part}">
                        ${part}
                    </button>
                `;
            }).join('')}
            <button class="page-btn next" type="button" data-page="${activePage + 1}" ${activePage === totalPages ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    `;

    paginationHost.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            renderProductPage(Number(button.dataset.page));
            scrollToProductList();
        });
    });
}

function buildPaginationParts(activePage, totalPages) {
    const pages = new Set([1, totalPages, activePage, activePage - 1, activePage + 1]);

    if (activePage <= 3) {
        pages.add(2);
        pages.add(3);
        pages.add(4);
    }

    if (activePage >= totalPages - 2) {
        pages.add(totalPages - 3);
        pages.add(totalPages - 2);
        pages.add(totalPages - 1);
    }

    const visiblePages = [...pages]
        .filter(page => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    return visiblePages.reduce((parts, page, index) => {
        if (index > 0 && page - visiblePages[index - 1] > 1) {
            parts.push('dots');
        }

        parts.push(page);
        return parts;
    }, []);
}

function renderProducts(products) {
    const productListContainer = getProductListContainer();
    if (!productListContainer) return;

    if (!products.length) {
        productListContainer.innerHTML = `<div class="products-empty-state">${escapeHtml(currentEmptyProductMessage)}</div>`;
        return;
    }

    if (categoryProductGrid && currentCategoryPage && !productSection) {
        renderCategoryProducts(products);
        return;
    }

    productSection.innerHTML = products.map(product => {
        const imageUrl = getProductImage(product);
        const discount = Number(product.discount_percent || 0);
        const detailUrl = getProductDetailUrl(product);
        const imageMarkup = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" referrerpolicy="no-referrer" onerror="handleProductImageError(this);">`
            : '';
        const description = product.short_description || product.description;
        return `
            <div class="product-item">
                <div class="product-img ${imageUrl ? '' : 'product-img--missing'}">
                    <a href="${escapeHtml(detailUrl)}">${imageMarkup}</a>
                </div>

                <div class="product-name">
                    <h3>
                        <a href="${escapeHtml(detailUrl)}">${escapeHtml(product.name)}</a>
                    </h3>
                </div>
                <p class="product-desc">${escapeHtml(description)}</p>
                <div class="product-price">
                    <span class="price-amount">${formatCurrency(product.price)}<sup><u>đ</u></sup></span>
                    ${discount > 0 ? `
                        <div class="discount-badge">
                            <i class="fa-solid fa-certificate"></i>
                            <span>-${discount}%</span>
                        </div>
                    ` : ''}
                </div>

                <div class="product-actions product-actions--home">
                    <a href="${escapeHtml(detailUrl)}" class="btn-detail">Chi tiết</a>
                    <button
                        class="btn-cart"
                        type="button"
                        data-product-id="${escapeHtml(product.id || product.sku || product.name)}"
                        data-product-name="${escapeHtml(product.name)}"
                        data-product-price="${Number(product.price || 0)}"
                        data-product-image="${escapeHtml(imageUrl)}"
                    >Thêm giỏ</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderCategoryProducts(products) {
    const categoryLabel = getCategoryDisplayName(currentCategoryPage);

    categoryProductGrid.innerHTML = products.map(product => {
        const imageUrl = getProductImage(product);
        const detailUrl = getProductDetailUrl(product);
        const discount = Number(product.discount_percent || 0);
        const description = product.short_description || product.description
            || [filterLabelMap[product.brand] || product.brand, filterLabelMap[product.subcategory] || product.subcategory]
                .filter(Boolean)
                .join(' - ')
            || categoryLabel;
        const imageMarkup = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" referrerpolicy="no-referrer" onerror="handleProductImageError(this);">`
            : '';

        return `
            <article class="product-card">
                <div class="product-image ${imageUrl ? '' : 'product-img--missing'}">
                    <a href="${escapeHtml(detailUrl)}">${imageMarkup}</a>
                </div>

                <div class="product-info">
                    <span class="product-tag">${escapeHtml(categoryLabel)}</span>
                    <h3><a href="${escapeHtml(detailUrl)}">${escapeHtml(product.name)}</a></h3>
                    <p class="product-desc">${escapeHtml(description)}</p>

                    <div class="product-price-row">
                        <p class="product-price">${formatCurrency(product.price)}đ</p>
                        ${discount > 0 ? `
                            <div class="discount-badge">
                                <i class="fa-solid fa-certificate"></i>
                                <span>-${discount}%</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="product-actions">
                        <a href="${escapeHtml(detailUrl)}" class="btn-detail">Chi tiết</a>
                        <button
                            class="btn-cart"
                            type="button"
                            data-product-id="${escapeHtml(product.id || product.sku || product.name)}"
                            data-product-name="${escapeHtml(product.name)}"
                            data-product-price="${Number(product.price || 0)}"
                            data-product-image="${escapeHtml(imageUrl)}"
                        >Thêm giỏ</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function getProductDetailUrl(product) {
    const sku = product?.sku;
    const id = product?.id;

    if (sku) {
        return `/pages/chitiet-sanpham.html?sku=${encodeURIComponent(sku)}`;
    }

    if (id) {
        return `/pages/chitiet-sanpham.html?id=${encodeURIComponent(id)}`;
    }

    return '/pages/chitiet-sanpham.html';
}

function getProductImage(product) {
    return normalizeProductImageUrls(product?.image_urls)[0] || '';
}

function normalizeProductImageUrls(imageUrls) {
    if (!Array.isArray(imageUrls)) return [];

    return [...new Set(
        imageUrls
            .map(imageUrl => String(imageUrl || '').trim())
            .filter(imageUrl => /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('/'))
    )];
}

function canProcessImageWithCanvas(image) {
    const source = String(image.currentSrc || image.src || '').trim();
    if (!source) return false;

    try {
        const imageUrl = new URL(source, window.location.href);
        return imageUrl.origin === window.location.origin;
    } catch (error) {
        return false;
    }
}

function markFeaturedSlideImageFallback(image) {
    image.classList.add('featured-slide__image--blend-fallback');
    image.closest('.featured-slide__image-link')?.classList.add('featured-slide__image-link--blend-fallback');
}

function stripNearWhiteBackgroundFromImage(image) {
    if (!image?.naturalWidth || !image?.naturalHeight) return false;

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const tolerance = FEATURED_IMAGE_WHITE_TOLERANCE;
    const featherStart = tolerance - 18;

    for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const minimumChannel = Math.min(red, green, blue);

        if (minimumChannel >= tolerance) {
            pixels[index + 3] = 0;
            continue;
        }

        if (minimumChannel >= featherStart) {
            const fadeRatio = (tolerance - minimumChannel) / (tolerance - featherStart);
            pixels[index + 3] = Math.round(pixels[index + 3] * fadeRatio);
        }
    }

    context.putImageData(imageData, 0, 0);
    image.src = canvas.toDataURL('image/png');
    return true;
}

function processFeaturedSlideImage(image) {
    if (!image?.classList?.contains('featured-slide__image')) return;
    if (image.dataset.whiteBgProcessed === 'true') return;

    const applyCssFallback = () => {
        markFeaturedSlideImageFallback(image);
        image.dataset.whiteBgProcessed = 'fallback';
    };

    const runProcessing = () => {
        if (!image.naturalWidth) {
            applyCssFallback();
            return;
        }

        if (!canProcessImageWithCanvas(image)) {
            applyCssFallback();
            return;
        }

        try {
            const processed = stripNearWhiteBackgroundFromImage(image);
            if (!processed) {
                applyCssFallback();
                return;
            }

            image.classList.add('featured-slide__image--processed');
            image.dataset.whiteBgProcessed = 'true';
        } catch (error) {
            console.warn('Không thể xóa nền trắng ảnh slider, dùng CSS fallback.', error);
            applyCssFallback();
        }
    };

    if (image.complete) {
        runProcessing();
        return;
    }

    image.addEventListener('load', runProcessing, { once: true });
}

function setupFeaturedSlideImages(sliderRoot) {
    if (!sliderRoot) return;

    sliderRoot.querySelectorAll('.featured-slide__image').forEach(processFeaturedSlideImage);
}

function handleProductImageError(image) {
    const fallbackSources = String(image.dataset.fallbackSources || '')
        .split('|')
        .map(source => source.trim())
        .filter(Boolean);
    const currentFallbackIndex = Math.max(0, Number(image.dataset.fallbackIndex) || 0);
    const nextFallbackIndex = currentFallbackIndex + 1;

    if (fallbackSources[nextFallbackIndex]) {
        image.dataset.fallbackIndex = String(nextFallbackIndex);
        image.dataset.whiteBgProcessed = 'false';
        image.classList.remove(
            'featured-slide__image--processed',
            'featured-slide__image--blend-fallback'
        );
        image.closest('.featured-slide__image-link')?.classList.remove('featured-slide__image-link--blend-fallback');
        image.src = fallbackSources[nextFallbackIndex];
        return;
    }

    image.onerror = null;
    image.style.display = 'none';

    const wrapper = image.closest('.product-img, .featured-slide__visual');
    if (wrapper) {
        wrapper.classList.add(
            wrapper.classList.contains('featured-slide__visual')
                ? 'is-image-missing'
                : 'product-img--missing'
        );
    }
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let notificationCenterScriptPromise = null;

function loadNotificationCenterScript() {
    if (!document.getElementById('navbar-container')) {
        return Promise.resolve(null);
    }

    if (window.TechnoNotifications) {
        return Promise.resolve(window.TechnoNotifications);
    }

    if (notificationCenterScriptPromise) {
        return notificationCenterScriptPromise;
    }

    notificationCenterScriptPromise = new Promise((resolve) => {
        const existingScript = document.querySelector('script[data-techno-notifications]');

        const handleReady = () => resolve(window.TechnoNotifications || null);
        const handleError = () => {
            console.error('Không thể tải trung tâm thông báo.');
            resolve(null);
        };

        if (existingScript) {
            existingScript.addEventListener('load', handleReady, { once: true });
            existingScript.addEventListener('error', handleError, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = '/assets/js/notifications.js';
        script.dataset.technoNotifications = 'true';
        script.async = true;
        script.addEventListener('load', handleReady, { once: true });
        script.addEventListener('error', handleError, { once: true });
        document.head.appendChild(script);
    });

    return notificationCenterScriptPromise;
}

// Hàm để load một file HTML vào một phần tử có ID cho trước
async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        try {
            const response = await fetch(window.location.origin + '/components/' + file);
            const data = await response.text();
            element.innerHTML = data;
            // NẾU ĐÃ LOAD XONG NAVBAR, THÌ GỌI HÀM KIỂM TRA ĐĂNG NHẬP
            if (file === 'navbar.html') {
                console.log("Navbar đã được nạp, đang phát tín hiệu 'navbarLoaded'...");
                const event = new CustomEvent('navbarLoaded');
                window.dispatchEvent(event);  
            }
            // NẾU ĐÃ LOAD XONG ADMIN SIDEBAR, THÌ SETUP LOGOUT
            if (file === 'admin-sidebar.html') {
                console.log("Admin sidebar đã được nạp, setup logout button...");
                setupAdminLogout();
            }
        } catch (error) {
            console.error(`Lỗi khi load component ${file}:`, error);
        }
    }
}

// ========== XỬ LÝ GIỎ HÀNG ==========

// Thêm sản phẩm vào giỏ hàng
function setupAddToCartButtons() {
    if (window.__technoAddToCartReady) return;
    window.__technoAddToCartReady = true;

    document.addEventListener('click', async (event) => {
        const button = event.target.closest('.btn-cart');
        if (!button) return;

        event.preventDefault();

        const cartInstance = getShoppingCartInstance();
        if (!cartInstance) {
            showNotification('Không thể thêm sản phẩm vì giỏ hàng chưa được tải.', 'error');
            return;
        }

        const product = getCartProductFromButton(button);
        if (!product) {
            showNotification('Không thể đọc thông tin sản phẩm này.', 'error');
            return;
        }

        const wasDisabled = button.disabled;
        button.disabled = true;

        try {
            await cartInstance.addProduct(product);
            showNotification(`"${product.name}" đã được thêm vào giỏ hàng.`);
        } catch (error) {
            console.error('Không thể thêm sản phẩm vào giỏ hàng:', error);
            showNotification(error.message || 'Không thể thêm sản phẩm vào giỏ hàng.', 'error');
        } finally {
            button.disabled = wasDisabled;
        }
    });
}

function getShoppingCartInstance() {
    if (window.shopCart) return window.shopCart;
    if (typeof shopCart !== 'undefined') return shopCart;
    return null;
}

function getCartProductFromButton(button) {
    const productCard = button.closest('.product-card, .product-item');
    const nameElement = productCard?.querySelector('h3, .product-name');
    const priceElement = productCard?.querySelector('.product-price, .price-amount');
    const imageElement = productCard?.querySelector('img');

    const productId = String(button.dataset.productId || '').trim();
    const productName = button.dataset.productName || nameElement?.textContent?.trim();
    const productPrice = Number(button.dataset.productPrice)
        || parseInt((priceElement?.textContent || '').replace(/\D/g, ''), 10);

    const isDatabaseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);

    if (!isDatabaseUuid || !productName || !Number.isFinite(productPrice)) {
        return null;
    }

    return {
        id: productId,
        name: productName,
        price: productPrice,
        quantity: 1,
        image: button.dataset.productImage || imageElement?.getAttribute('src') || ''
    };
}

// Hiển thị toast nhỏ ở cuối màn hình để không che thanh điều hướng.
function showNotification(message, type = 'success', customTitle = '') {
    const normalizedType = type === 'error' ? 'error' : 'success';
    const duration = normalizedType === 'error' ? 5000 : 3600;
    let notificationStack = document.querySelector('.cart-notification-stack');

    if (!notificationStack) {
        notificationStack = document.createElement('div');
        notificationStack.className = 'cart-notification-stack';
        notificationStack.setAttribute('aria-live', 'polite');
        notificationStack.setAttribute('aria-atomic', 'false');
        document.body.appendChild(notificationStack);
    }

    // Chỉ giữ tối đa ba toast để màn hình không bị chật khi người dùng bấm liên tục.
    while (notificationStack.children.length >= 3) {
        notificationStack.firstElementChild?.remove();
    }

    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification--${normalizedType}`;
    notification.setAttribute('role', normalizedType === 'error' ? 'alert' : 'status');
    notification.style.setProperty('--toast-duration', `${duration}ms`);

    const icon = document.createElement('span');
    icon.className = 'cart-notification__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = normalizedType === 'error' ? '!' : '✓';

    const content = document.createElement('div');
    content.className = 'cart-notification__content';

    const title = document.createElement('strong');
    title.className = 'cart-notification__title';
    title.textContent = customTitle || (
        normalizedType === 'error'
            ? 'Không thể thêm sản phẩm'
            : 'Đã thêm vào giỏ hàng'
    );

    const messageElement = document.createElement('p');
    messageElement.className = 'cart-notification__message';
    messageElement.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'cart-notification__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Đóng thông báo');
    closeButton.textContent = '×';

    const progress = document.createElement('span');
    progress.className = 'cart-notification__progress';
    progress.setAttribute('aria-hidden', 'true');

    content.append(title, messageElement);
    notification.append(icon, content, closeButton, progress);
    notificationStack.appendChild(notification);

    let removeTimer;

    const dismissNotification = () => {
        if (notification.classList.contains('is-leaving')) return;

        clearTimeout(removeTimer);
        notification.classList.add('is-leaving');

        setTimeout(() => {
            notification.remove();

            if (!notificationStack.children.length) {
                notificationStack.remove();
            }
        }, 240);
    };

    closeButton.addEventListener('click', dismissNotification);
    removeTimer = setTimeout(dismissNotification, duration);
}

// Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', async () => {
    const notificationCenterReady = loadNotificationCenterScript();
    const navbarReady = loadComponent('navbar-container', 'navbar.html');
    const paginationReady = loadComponent('pagination-container', 'pagination.html');
    loadComponent('footer-container', 'footer.html'); 
    loadComponent('admin-sidebar-container', 'admin-sidebar.html');
    
    // Thiết lập sự kiện cho nút "Thêm giỏ"
    setupAddToCartButtons();
    setupCategoryProductSort();
    setupCategoryFilterGroups();
    setupPhoneHeroPriceFilters();
    setupLaptopHeroPriceFilters();
    setupPcHeroPriceFilters();
    setupAccessoryHeroPriceFilters();

    await Promise.all([navbarReady, notificationCenterReady]);
    await window.TechnoNotifications?.init?.();
    setupNavbarSearch();

    await paginationReady;

    if (isProductDetailPage) {
        await loadProductDetailPage();
    }

    if (productSection) {
        loadProductsByFilter(null, null, 1);
    } else if (currentCategoryPage && categoryProductGrid) {
        loadProductsByFilter(currentCategoryPage, null, 1);
    }
});

async function loadProductDetailPage() {
    const productNameElement = document.getElementById('product-detail-name');
    const galleryElement = document.getElementById('product-detail-gallery');
    const specsElement = document.getElementById('product-detail-specs');
    const priceElement = document.getElementById('product-detail-price');
    const addToCartButton = document.getElementById('product-detail-add-cart');

    if (!productNameElement || !galleryElement || !specsElement || !priceElement) return;

    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku');
    const id = params.get('id');

    if (!sku && !id) {
        renderProductDetailError('Không tìm thấy mã sản phẩm. Vui lòng quay lại danh sách và chọn lại sản phẩm.');
        initProductDetailSwiper();
        return;
    }

    if (!window.supabaseClient) {
        renderProductDetailError('Không thể kết nối Supabase để tải chi tiết sản phẩm.');
        initProductDetailSwiper();
        return;
    }

    let query = window.supabaseClient
        .from('products')
        .select('*')
        .eq('status', 'active');

    query = sku ? query.eq('sku', sku) : query.eq('id', id);

    const { data: product, error } = await query.maybeSingle();

    if (error || !product) {
        console.error('Không thể tải chi tiết sản phẩm:', error?.message || 'Không có dữ liệu');
        renderProductDetailError('Không tìm thấy sản phẩm phù hợp trong database.');
        initProductDetailSwiper();
        return;
    }

    await renderProductDetail(product);
    await window.ProductReviews?.init(product);
}

async function renderProductDetail(product) {
    const productNameElement = document.getElementById('product-detail-name');
    const galleryElement = document.getElementById('product-detail-gallery');
    const specsElement = document.getElementById('product-detail-specs');
    const descriptionElement = document.getElementById('product-detail-description');
    const priceElement = document.getElementById('product-detail-price');
    const addToCartButton = document.getElementById('product-detail-add-cart');
    const addToCartLabel = document.getElementById('product-detail-add-cart-label');
    const categoryElement = document.getElementById('product-detail-category');
    const breadcrumbCategory = document.getElementById('product-detail-breadcrumb-category');
    const brandElement = document.getElementById('product-detail-brand');
    const skuElement = document.getElementById('product-detail-sku');
    const stockElement = document.getElementById('product-detail-stock');
    const shortDescriptionElement = document.getElementById('product-detail-short-description');
    const metaDescription = document.getElementById('product-meta-description');

    const productImages = getProductImages(product);
    const primaryImage = getProductImage(product) || productImages[0] || '';
    const stock = Math.max(0, Number(product.stock) || 0);
    const isAvailable = product.status === 'active' && stock > 0;
    const categoryLabel = getCategoryDisplayName(product.category_id);
    const brandLabel = filterLabelMap[product.brand] || product.brand || 'Đang cập nhật';
    const productSummary = String(
        product.short_description
        || product.description
        || 'Thông tin nổi bật của sản phẩm đang được cập nhật.'
    ).trim();
    const compactSummary = productSummary.length > 220
        ? `${productSummary.slice(0, 217).trim()}...`
        : productSummary;

    document.title = `${product.name} - Tech.no`;
    productNameElement.textContent = product.name;
    galleryElement.innerHTML = '<div class="swiper-slide product-detail-image-empty">Dang tai anh...</div>';

    specsElement.innerHTML = buildProductDetailSpecs(product)
        .map(([label, value]) => `
            <li>
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
            </li>
        `).join('');

    if (descriptionElement) {
        descriptionElement.textContent = product.description || 'Thông tin sản phẩm đang được cập nhật.';
    }

    renderProductDetailPrice(product, priceElement);

    if (categoryElement) categoryElement.textContent = categoryLabel;
    if (breadcrumbCategory) breadcrumbCategory.textContent = categoryLabel;
    if (brandElement) brandElement.textContent = brandLabel;
    if (skuElement) skuElement.textContent = product.sku || 'Chưa cập nhật';
    if (shortDescriptionElement) shortDescriptionElement.textContent = compactSummary;
    if (metaDescription) metaDescription.content = compactSummary;

    if (stockElement) {
        stockElement.classList.remove('is-loading', 'is-out-of-stock');
        stockElement.textContent = isAvailable
            ? `Còn ${stock.toLocaleString('vi-VN')} sản phẩm`
            : 'Tạm hết hàng';
        stockElement.classList.toggle('is-out-of-stock', !isAvailable);
    }

    if (addToCartButton) {
        addToCartButton.dataset.productId = product.id || product.sku || product.name;
        addToCartButton.dataset.productName = product.name;
        addToCartButton.dataset.productPrice = Number(product.price || 0);
        addToCartButton.dataset.productImage = primaryImage;
        addToCartButton.disabled = !isAvailable;
    }
    if (addToCartLabel) {
        addToCartLabel.textContent = isAvailable ? 'Thêm vào giỏ hàng' : 'Sản phẩm tạm hết hàng';
    }

    await renderProductDetailGallery(product, galleryElement);
    setupProductDetailTabs();
}

function renderProductDetailPrice(product, priceElement) {
    if (!priceElement) return;

    const price = Math.max(0, Number(product.price) || 0);
    const originalPrice = Math.max(0, Number(product.original_price) || 0);
    const discountPercent = Math.max(0, Number(product.discount_percent) || 0);
    const hasDiscount = originalPrice > price;
    const effectiveDiscount = discountPercent > 0
        ? Math.round(discountPercent)
        : (hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0);

    priceElement.innerHTML = `
        <span class="product-price-current">
            ${formatCurrency(price)}<span class="product-price-currency">đ</span>
        </span>
        ${hasDiscount ? `
            <span class="product-price-original">${formatCurrency(originalPrice)}đ</span>
        ` : ''}
        ${hasDiscount && effectiveDiscount > 0 ? `
            <span class="product-price-discount">-${effectiveDiscount}%</span>
        ` : ''}
    `;
}

function buildProductDetailSpecs(product) {
    const specifications = getProductSpecifications(product);
    const template = getProductSpecificationTemplate(product);

    const rows = template
        .map(([key, label]) => [
            label,
            getSpecificationValue(specifications, key, product)
        ]);

    if (rows.length) return rows;

    return [
        ['Thương hiệu', filterLabelMap[product.brand] || product.brand || 'Đang cập nhật'],
        ['Mã sản phẩm', product.sku || 'Đang cập nhật']
    ];
}

function getProductSpecifications(product) {
    if (!product?.specifications) return {};

    if (typeof product.specifications === 'string') {
        try {
            const parsed = JSON.parse(product.specifications);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (error) {
            console.warn('Không thể đọc specifications:', error);
            return {};
        }
    }

    return typeof product.specifications === 'object' && !Array.isArray(product.specifications)
        ? product.specifications
        : {};
}

function getProductSpecificationTemplate(product) {
    const directTemplateKey = window.techNoProductSpecificationConfig
        .categoryTemplateKeys[product.category_id];
    if (directTemplateKey) return productSpecificationTemplates[directTemplateKey];

    if (product.category_id === 'phukien') {
        const accessoryTemplateKey = product.subcategory === 'tai-nghe'
            ? 'audio'
            : window.techNoProductSpecificationConfig
                .accessoryTemplateKeys[product.subcategory];
        if (accessoryTemplateKey) return productSpecificationTemplates[accessoryTemplateKey];
    }

    return genericProductSpecificationTemplate;
}

function getSpecificationValue(specifications, key, product) {
    const value = specifications[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
    }

    if (key === 'brand' && product.brand) {
        return filterLabelMap[product.brand] || product.brand;
    }

    return UNKNOWN_SPEC_VALUE;
}

function setupProductDetailTabs() {
    const tabs = [...document.querySelectorAll('[data-product-tab]')];
    if (!tabs.length) return;

    const activateTab = tab => {
        const target = tab.dataset.productTab;

        tabs.forEach(item => {
            const isActive = item === tab;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-selected', String(isActive));
            item.tabIndex = isActive ? 0 : -1;
        });

        document.querySelectorAll('.product-detail-panel').forEach(panel => {
            const isActive = panel.id === `product-${target}-panel`;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', event => {
            let targetIndex = null;

            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                targetIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                targetIndex = (index + 1) % tabs.length;
            } else if (event.key === 'Home') {
                targetIndex = 0;
            } else if (event.key === 'End') {
                targetIndex = tabs.length - 1;
            }

            if (targetIndex === null) return;
            event.preventDefault();
            activateTab(tabs[targetIndex]);
            tabs[targetIndex].focus();
        });
    });
}

function renderProductDetailError(message) {
    const productNameElement = document.getElementById('product-detail-name');
    const galleryElement = document.getElementById('product-detail-gallery');
    const specsElement = document.getElementById('product-detail-specs');
    const descriptionElement = document.getElementById('product-detail-description');
    const priceElement = document.getElementById('product-detail-price');
    const addToCartButton = document.getElementById('product-detail-add-cart');
    const addToCartLabel = document.getElementById('product-detail-add-cart-label');
    const categoryElement = document.getElementById('product-detail-category');
    const breadcrumbCategory = document.getElementById('product-detail-breadcrumb-category');
    const brandElement = document.getElementById('product-detail-brand');
    const skuElement = document.getElementById('product-detail-sku');
    const stockElement = document.getElementById('product-detail-stock');
    const shortDescriptionElement = document.getElementById('product-detail-short-description');

    if (productNameElement) {
        productNameElement.textContent = message;
    }

    if (galleryElement) {
        galleryElement.innerHTML = '<div class="swiper-slide product-detail-image-empty">TECH.NO</div>';
    }

    if (specsElement) {
        specsElement.innerHTML = '<li><span>Trạng thái</span><strong>Không có dữ liệu để hiển thị.</strong></li>';
    }

    if (descriptionElement) {
        descriptionElement.textContent = 'Không có thông tin sản phẩm để hiển thị.';
    }

    if (priceElement) {
        priceElement.textContent = '';
    }

    if (addToCartButton) {
        addToCartButton.disabled = true;
    }
    if (addToCartLabel) addToCartLabel.textContent = 'Không thể thêm vào giỏ hàng';
    if (categoryElement) categoryElement.textContent = 'Không có dữ liệu';
    if (breadcrumbCategory) breadcrumbCategory.textContent = 'Sản phẩm';
    if (brandElement) brandElement.textContent = 'Không có dữ liệu';
    if (skuElement) skuElement.textContent = 'Không có dữ liệu';
    if (stockElement) {
        stockElement.textContent = 'Không khả dụng';
        stockElement.classList.remove('is-loading');
        stockElement.classList.add('is-out-of-stock');
    }
    if (shortDescriptionElement) {
        shortDescriptionElement.textContent = 'Không có thông tin sản phẩm để hiển thị.';
    }
}

function getProductImages(product) {
    const databaseImages = normalizeProductImageUrls(product?.image_urls);

    if (databaseImages.length > 1) return databaseImages;

    const fallbackImages = normalizeProductImageUrls(productGalleryFallbacks[product?.sku] || []);
    return [...new Set([...databaseImages, ...fallbackImages])];
}

function renderProductDetailGallery(product, galleryElement) {
    const primaryImage = getProductImage(product);
    const imageUrls = [...new Set(
        [primaryImage, ...getProductImages(product)].filter(Boolean)
    )].slice(0, 8);

    galleryElement.innerHTML = imageUrls.length
        ? imageUrls.map((imageUrl, index) => `
            <div class="swiper-slide">
                <img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(product.name)} - ảnh ${index + 1}"
                    referrerpolicy="no-referrer"
                    loading="${index === 0 ? 'eager' : 'lazy'}"
                    fetchpriority="${index === 0 ? 'high' : 'auto'}"
                    decoding="async"
                    onerror="handleDetailImageError(this);"
                >
            </div>
        `).join('')
        : '<div class="swiper-slide product-detail-image-empty">TECH.NO</div>';

    initProductDetailSwiper();
}

function initProductDetailSwiper() {
    if (!isProductDetailPage || typeof Swiper === 'undefined') return;

    if (productDetailSwiper) {
        productDetailSwiper.destroy(true, true);
    }

    const slideCount = document.querySelectorAll('.mySwiper .swiper-slide').length;

    productDetailSwiper = new Swiper('.mySwiper', {
        loop: false,
        rewind: slideCount > 1,
        allowTouchMove: slideCount > 1,
        grabCursor: slideCount > 1,
        watchOverflow: true,
        keyboard: {
            enabled: true,
            onlyInViewport: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        }
    });
}

function handleDetailImageError(image) {
    image.onerror = null;
    const slide = image.closest('.swiper-slide');
    const gallery = document.getElementById('product-detail-gallery');
    const slides = gallery ? [...gallery.children] : [];
    const slideIndex = slide ? slides.indexOf(slide) : -1;

    if (slide && slides.length > 1) {
        if (productDetailSwiper && slideIndex >= 0 && typeof productDetailSwiper.removeSlide === 'function') {
            productDetailSwiper.removeSlide(slideIndex);
            productDetailSwiper.update();
            productDetailSwiper.navigation?.update();
        } else {
            slide.remove();
        }

        return;
    }

    if (!slide) {
        image.remove();
        return;
    }

    slide.classList.add('product-detail-image-empty');
    slide.textContent = 'TECH.NO';
}

function focusOnSearchBar() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

function setupNavbarSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('.search-btn');
    const categorySearchInput = document.querySelector('.category-search input');
    if (!searchInput) return;

    const initialKeyword = new URLSearchParams(window.location.search).get('q') || '';
    const hasLocalProductList = Boolean(getProductListContainer());
    if (initialKeyword && hasLocalProductList) {
        searchInput.value = initialKeyword;
        if (categorySearchInput) {
            categorySearchInput.value = initialKeyword;
        }
    }

    const redirectToSearchPage = () => {
        const keyword = searchInput.value.trim();
        if (!keyword) return;

        window.location.href = `/index.html?q=${encodeURIComponent(keyword)}`;
    };

    const runSearch = ({ value = searchInput.value, redirectIfNeeded = false } = {}) => {
        currentSearchKeyword = value || '';
        searchInput.value = currentSearchKeyword;
        if (categorySearchInput && categorySearchInput.value !== currentSearchKeyword) {
            categorySearchInput.value = currentSearchKeyword;
        }

        if (!hasLocalProductList) {
            if (redirectIfNeeded) {
                redirectToSearchPage();
            }
            return;
        }

        applyProductSearch(1);
    };

    currentSearchKeyword = searchInput.value || '';
    searchInput.addEventListener('input', () => runSearch({ value: searchInput.value }));
    searchInput.addEventListener('search', () => runSearch({ value: searchInput.value }));
    searchInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        runSearch({ redirectIfNeeded: true });
        scrollToProductList();
    });

    categorySearchInput?.addEventListener('input', () => runSearch({ value: categorySearchInput.value }));
    categorySearchInput?.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        runSearch({ value: categorySearchInput.value });
        scrollToProductList();
    });

    searchButton?.addEventListener('click', () => {
        runSearch({ redirectIfNeeded: true });
        scrollToProductList();
    });
}

function setupCategoryFilterGroups() {
    const filterRoot = document.querySelector('.category-filter');
    if (!filterRoot) return;

    const groups = [...filterRoot.querySelectorAll('.filter-group')];
    if (!groups.length) return;

    groups.forEach((group, index) => {
        const title = group.querySelector('h4');
        if (!title) return;

        const optionPanel = document.createElement('div');
        optionPanel.className = 'filter-options';
        [...group.children]
            .filter(child => child.tagName === 'LABEL')
            .forEach(label => optionPanel.appendChild(label));
        group.appendChild(optionPanel);

        group.dataset.filterGroupIndex = String(index);
        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');
        title.setAttribute('aria-expanded', 'false');

        const toggleGroup = () => {
            const shouldOpen = !group.classList.contains('is-open');
            groups.forEach(item => {
                item.classList.remove('is-open');
                item.querySelector('h4')?.setAttribute('aria-expanded', 'false');
            });

            group.classList.toggle('is-open', shouldOpen);
            title.setAttribute('aria-expanded', String(shouldOpen));
        };

        title.addEventListener('click', toggleGroup);
        title.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            toggleGroup();
        });

        optionPanel.querySelectorAll('label').forEach(label => {
            const input = label.querySelector('input');
            if (!input) return;

            input.addEventListener('change', () => {
                label.classList.toggle('is-selected', input.checked);
                updateCategoryFilterGroups();
            });
        });
    });

    updateCategoryFilterGroups(false);
}

function setupCategoryProductSort() {
    const sortSelect = document.querySelector('[data-product-sort]');
    if (!sortSelect || !currentCategoryPage) return;

    currentProductSort = normalizeProductSortMode(sortSelect.value);
    sortSelect.value = currentProductSort;

    sortSelect.addEventListener('change', () => {
        currentProductSort = normalizeProductSortMode(sortSelect.value);
        sortSelect.value = currentProductSort;
        applyProductSearch(1);
        scrollToProductList();
    });
}

function setupPhoneHeroPriceFilters() {
    const buttons = [...document.querySelectorAll('[data-phone-price-filter]')];
    if (currentCategoryPage !== 'phone' || !buttons.length) return;

    const updateButtonState = () => {
        buttons.forEach(button => {
            const isActive = button.dataset.phonePriceFilter === currentPhonePriceFilter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentPhonePriceFilter = button.dataset.phonePriceFilter || 'all';
            updateButtonState();
            applyProductSearch(1);
            scrollToProductList();
        });
    });

    updateButtonState();
}

function setupLaptopHeroPriceFilters() {
    const buttons = [...document.querySelectorAll('[data-laptop-price-filter]')];
    if (currentCategoryPage !== 'laptop' || !buttons.length) return;

    const updateButtonState = () => {
        buttons.forEach(button => {
            const isActive = button.dataset.laptopPriceFilter === currentLaptopPriceFilter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentLaptopPriceFilter = button.dataset.laptopPriceFilter || 'all';
            updateButtonState();
            applyProductSearch(1);
            scrollToProductList();
        });
    });

    updateButtonState();
}

function setupPcHeroPriceFilters() {
    const buttons = [...document.querySelectorAll('[data-pc-price-filter]')];
    if (currentCategoryPage !== 'pc' || !buttons.length) return;

    const updateButtonState = () => {
        buttons.forEach(button => {
            const isActive = button.dataset.pcPriceFilter === currentPcPriceFilter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentPcPriceFilter = button.dataset.pcPriceFilter || 'all';
            updateButtonState();
            applyProductSearch(1);
            scrollToProductList();
        });
    });

    updateButtonState();
}

function setupAccessoryHeroPriceFilters() {
    const buttons = [...document.querySelectorAll('[data-accessory-price-filter]')];
    if (currentCategoryPage !== 'phukien' || !buttons.length) return;

    const updateButtonState = () => {
        buttons.forEach(button => {
            const isActive = button.dataset.accessoryPriceFilter === currentAccessoryPriceFilter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentAccessoryPriceFilter = button.dataset.accessoryPriceFilter || 'all';
            updateButtonState();
            applyProductSearch(1);
            scrollToProductList();
        });
    });

    updateButtonState();
}

function updateCategoryFilterGroups(shouldRender = true) {
    const groups = [...document.querySelectorAll('.category-filter .filter-group')];

    currentCategoryFilterGroups = groups.map(group => {
        const field = group.dataset.filterField || '';
        const values = [...group.querySelectorAll('label')]
            .filter(label => label.querySelector('input')?.checked)
            .map(label => {
                const input = label.querySelector('input');

                return field
                    ? String(input?.value || '').trim()
                    : label.textContent.trim();
            })
            .filter(Boolean);

        group.classList.toggle('has-selection', values.length > 0);

        return {
            title: group.querySelector('h4')?.textContent.trim() || '',
            field,
            values
        };
    });

    if (shouldRender) {
        applyProductSearch(1);
    }
}

// =========================================================================
// XỬ LÝ PHÂN QUYỀN HIỂN THỊ TRÊN NAVBAR KHI COMPONENT ĐÃ LOAD XONG
// =========================================================================

window.addEventListener('navbarLoaded', async () => {
    // 1. Truy cập vào các phần tử HTML cần can thiệp trên navbar vừa nạp
    const adminNavLink = document.getElementById('admin-nav-link');
    const authStatusContainer = document.getElementById('auth-status');
    
    // Nếu không tìm thấy phần tử admin-nav-link trên giao diện thì dừng xử lý ngay lập tức
    if (!adminNavLink) {
        return;
    }

    try {
        // Sử dụng chính xác thực thể kết nối bạn đã gán vào window tại file supabase-config.js
        const thucTheSupabaseActive = window.supabaseClient;

        // Kiểm tra phòng hờ trường hợp file supabase-config.js chưa kịp tải xong hoặc bị lỗi
        if (!thucTheSupabaseActive || !thucTheSupabaseActive.auth) {
            console.error("Hệ thống không tìm thấy thực thể 'window.supabaseClient' hợp lệ. Hãy kiểm tra lại thứ tự nhúng file script trong HTML!");
            adminNavLink.style.display = 'none';
            return;
        }

        // 2. Gọi API Supabase lấy thông tin phiên đăng nhập (Session) hiện tại của người dùng từ thực thể chuẩn
        const { data: { session }, error: sessionError } = await thucTheSupabaseActive.auth.getSession();
        
        if (sessionError) {
            console.error("Gặp lỗi trong quá trình lấy Session từ hệ thống Auth:", sessionError.message);
            adminNavLink.style.display = 'none';
            return;
        }

        // 3. TRƯỜNG HỢP 1: Người dùng CHƯA ĐĂNG NHẬP (Không có session)
        if (!session || !session.user) {
            console.log("Hệ thống nhận diện: Khách vãng lai (Chưa đăng nhập).");
            adminNavLink.style.display = 'none'; // Bảo đảm nút Admin luôn ẩn
            
            // Đảm bảo trạng thái hiển thị nút đăng nhập nguyên bản
            if (authStatusContainer) {
                authStatusContainer.innerHTML = '<a href="../pages/login.html" class="login-btn">Đăng nhập</a>';
            }
            return;
        }

        // Nếu có session, lấy thông tin user cơ bản từ cổng Auth
        const currentLoggedInUser = session.user;

        // 4. TRƯỜNG HỢP 2: Đã đăng nhập -> Cần truy vấn bảng public.users để lấy quyền hạn (role) thực tế
        // Thực hiện thay đổi trường select từ 'full_name' thành 'display_name' bám sát theo database thực tế
        const { data: userProfile, error: profileError } = await thucTheSupabaseActive
            .from('users')
            .select('role, display_name')
            .eq('id', currentLoggedInUser.id)
            .single(); // Lấy duy nhất một bản ghi tương thích từ bảng dữ liệu người dùng

        if (profileError) {
            console.error("Không thể lấy dữ quyền hạn từ bảng public.users:", profileError.message);
            adminNavLink.style.display = 'none';
            return;
        }

        // 5. Kiểm tra giá trị cột role từ cơ sở dữ liệu đổ về để quyết định ẩn/hiện nút Admin công khai
        if (userProfile && userProfile.role === 'admin') {
            console.log("Xác thực thành công: hiển thị lối tắt về trang tổng quan Admin.");
            console.log("userProfile.role =", userProfile.role);
            adminNavLink.style.display = 'none'; // Ẩn nút Admin cũ
            
            // Thay đổi nút "Trang chủ" thành "Admin" cho user admin (luôn luôn thay đổi, không phụ thuộc redirect)
            const homeNavLink = document.getElementById('home-nav-link');
            console.log("homeNavLink found:", homeNavLink);
            if (homeNavLink) {
                const homeLink = homeNavLink.querySelector('a');
                console.log("homeLink found:", homeLink);
                if (homeLink) {
                    console.log("Changing home link to Admin");
                    homeLink.textContent = 'Admin';
                    homeLink.href = '/pages/admin/admin-tongquan.html';  // Absolute path
                }
            }
            
        } else {
            console.log("Xác thực: Tài khoản này là khách hàng thành viên (customer), ẩn nút Admin.");
            adminNavLink.style.display = 'none'; // Người dùng thông thường không được thấy nút này
        }

        // 6. TIỆN ÍCH BỔ SUNG: Thay đổi nút "Đăng nhập" thành Tên Admin/User kèm nút Đăng xuất trực quan
        if (authStatusContainer && userProfile) {
            // Lắng nghe sự kiện click chuột vào nút Đăng xuất vừa tạo mới ngầm bằng JS
            const btnLogout = document.getElementById('navbar-btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', async (event) => {
                    event.preventDefault();
                    
                    const { error: signOutError } = await thucTheSupabaseActive.auth.signOut();
                    if (!signOutError) {
                        // Restore home link
                        const homeNavLink = document.getElementById('home-nav-link');
                        if (homeNavLink) {
                            const homeLink = homeNavLink.querySelector('a');
                            if (homeLink) {
                                homeLink.textContent = 'Trang chủ';
                                homeLink.href = '/index.html';
                            }
                        }
                        window.location.href = window.location.origin + "/index.html";
                    } else {
                        alert("Hệ thống gặp lỗi khi đăng xuất: " + signOutError.message);
                    }
                });
            }
        }

        // 7. Setup event listener cho nút logout trong sidebar admin
        // (Được setup sau khi sidebar load trong hàm setupAdminLogout())

    } catch (criticalError) {
        console.error("Hệ thống lỗi phân quyền toàn cục gặp sự cố nghiêm trọng:", criticalError);
        adminNavLink.style.display = 'none';
    }
});

// =========================================================================
// SETUP ADMIN LOGOUT BUTTON
// =========================================================================

async function setupAdminLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (!logoutBtn) {
        console.warn('Logout button not found in admin sidebar');
        return;
    }
    
    logoutBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        try {
            const { error: signOutError } = await window.supabaseClient.auth.signOut();
            if (!signOutError) {
                // Restore home link in navbar
                const homeNavLink = document.getElementById('home-nav-link');
                if (homeNavLink) {
                    const homeLink = homeNavLink.querySelector('a');
                    if (homeLink) {
                        homeLink.textContent = 'Trang chủ';
                        homeLink.href = '/index.html';
                    }
                }
                window.location.href = "/index.html";
            } else {
                alert("Hệ thống gặp lỗi khi đăng xuất: " + signOutError.message);
            }
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            alert("Hệ thống gặp lỗi khi đăng xuất!");
        }
    });
    console.log("Admin logout button setup completed");
}

/* Biểu đồ và KPI admin được tải từ Supabase trong assets/js/admin-data.js. */
