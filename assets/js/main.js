const brandData = {
    laptop: ['asus', 'hp', 'dell', 'acer', 'macbook', 'lenovo', 'msi', 'gigabyte'],
    phone: ['iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo'],
    pc: ['asus', 'msi', 'gigabyte'],
    phukien: ['airpods', 'loa', 'camera', 'sac', 'dong-ho']
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
    airpods: 'AIRPODS',
    loa: 'LOA',
    camera: 'CAMERA',
    sac: 'SẠC',
    'dong-ho': 'ĐỒNG HỒ'
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
    ]
};

const categoryDisplayOrder = ['phone', 'laptop', 'pc', 'phukien'];
const brandContainer = document.getElementById('brand-filter-container');
const productSection = document.querySelector('.products-section');
const categoryProductGrid = document.querySelector('.product-grid');
const currentCategoryPage = getCurrentCategoryPage();
const isProductDetailPage = window.location.pathname.toLowerCase().endsWith('/pages/chitiet-sanpham.html');
const PRODUCTS_PER_PAGE = 12;
const DEFAULT_EMPTY_PRODUCT_MESSAGE = 'Chưa có sản phẩm phù hợp với bộ lọc này.';
let currentBaseProductList = [];
let currentProductList = [];
let currentProductPage = 1;
let currentSearchKeyword = '';
let currentCategoryFilterGroups = [];
let currentEmptyProductMessage = DEFAULT_EMPTY_PRODUCT_MESSAGE;
let productDetailSwiper = null;

function getProductListContainer() {
    return productSection || (currentCategoryPage ? categoryProductGrid : null);
}

function getCurrentCategoryPage() {
    const pathname = window.location.pathname.toLowerCase();

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
    if (!productListContainer || !window.supabaseClient) return;

    productListContainer.innerHTML = '<div class="products-empty-state">Đang tải sản phẩm...</div>';
    renderPagination(0, 1);

    let query = window.supabaseClient
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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
        return;
    }

    const products = removeDuplicateProducts(data || []);
    const arrangedProducts = category || filterValue ? products : mixProductsByCategoryForPages(products);
    currentBaseProductList = spreadSimilarProductsAcrossPages(arrangedProducts);
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

function normalizeProductKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function applyProductSearch(page = 1) {
    const keyword = normalizeProductKey(currentSearchKeyword);
    let filteredProducts = keyword
        ? currentBaseProductList.filter(product => productMatchesSearch(product, keyword))
        : [...currentBaseProductList];

    filteredProducts = applyCategoryFilterGroups(filteredProducts);
    currentProductList = filteredProducts;
    currentEmptyProductMessage = keyword || hasActiveCategoryFilters()
        ? `Không tìm thấy sản phẩm phù hợp với "${currentSearchKeyword.trim() || 'bộ lọc đã chọn'}".`
        : DEFAULT_EMPTY_PRODUCT_MESSAGE;

    renderProductPage(page);
}

function productMatchesSearch(product, normalizedKeyword) {
    const searchTokens = normalizedKeyword.split(' ').filter(Boolean);
    if (!searchTokens.length) return true;

    const searchableText = normalizeProductKey([
        product.name,
        product.brand,
        product.category_id,
        product.subcategory,
        product.description,
        product.sku
    ].filter(Boolean).join(' '));

    return searchTokens.every(token => searchableText.includes(token));
}

function applyCategoryFilterGroups(products) {
    const activeGroups = currentCategoryFilterGroups.filter(group => group.values.length > 0);
    if (!activeGroups.length) return products;

    return products.filter(product =>
        activeGroups.every(group =>
            group.values.some(value => productMatchesCategoryFilter(product, group.title, value))
        )
    );
}

function hasActiveCategoryFilters() {
    return currentCategoryFilterGroups.some(group => group.values.length > 0);
}

function productMatchesCategoryFilter(product, groupTitle, value) {
    const normalizedGroupTitle = normalizeProductKey(groupTitle);
    const normalizedValue = normalizeProductKey(value);

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
    if (!Array.isArray(products) || products.length <= PRODUCTS_PER_PAGE) {
        return products || [];
    }

    const arrangedProducts = [...products];
    const totalPages = Math.ceil(arrangedProducts.length / PRODUCTS_PER_PAGE);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
        const pageStart = pageIndex * PRODUCTS_PER_PAGE;
        const pageEnd = Math.min(pageStart + PRODUCTS_PER_PAGE, arrangedProducts.length);
        const seenFamilies = new Set();

        for (let itemIndex = pageStart; itemIndex < pageEnd; itemIndex += 1) {
            const familyKey = getProductFamilyKey(arrangedProducts[itemIndex]);

            if (!familyKey) continue;

            if (!seenFamilies.has(familyKey)) {
                seenFamilies.add(familyKey);
                continue;
            }

            const swapIndex = findSafeSwapIndex(
                arrangedProducts,
                itemIndex,
                pageEnd,
                familyKey,
                seenFamilies
            );

            if (swapIndex === -1) continue;

            const swapProduct = arrangedProducts[swapIndex];
            arrangedProducts[swapIndex] = arrangedProducts[itemIndex];
            arrangedProducts[itemIndex] = swapProduct;

            const swapFamilyKey = getProductFamilyKey(swapProduct);
            if (swapFamilyKey) {
                seenFamilies.add(swapFamilyKey);
            }
        }
    }

    return arrangedProducts;
}

function findSafeSwapIndex(products, duplicateIndex, searchStart, duplicateFamilyKey, currentPageFamilies) {
    for (let candidateIndex = searchStart; candidateIndex < products.length; candidateIndex += 1) {
        const candidateFamilyKey = getProductFamilyKey(products[candidateIndex]);

        if (!candidateFamilyKey || candidateFamilyKey === duplicateFamilyKey) continue;
        if (currentPageFamilies.has(candidateFamilyKey)) continue;
        if (pageContainsFamily(products, candidateIndex, duplicateFamilyKey)) continue;

        return candidateIndex;
    }

    return -1;
}

function pageContainsFamily(products, candidateIndex, familyKey) {
    const pageStart = Math.floor(candidateIndex / PRODUCTS_PER_PAGE) * PRODUCTS_PER_PAGE;
    const pageEnd = Math.min(pageStart + PRODUCTS_PER_PAGE, products.length);

    for (let itemIndex = pageStart; itemIndex < pageEnd; itemIndex += 1) {
        if (itemIndex === candidateIndex) continue;
        if (getProductFamilyKey(products[itemIndex]) === familyKey) {
            return true;
        }
    }

    return false;
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
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
        return product.image_urls[0];
    }

    return '';
}

function handleProductImageError(image) {
    image.onerror = null;
    image.style.display = 'none';

    const wrapper = image.closest('.product-img');
    if (wrapper) {
        wrapper.classList.add('product-img--missing');
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

const stars = document.querySelectorAll('.stars i');
const ratingInput = document.getElementById('rating-value');

stars.forEach(star => {
    star.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        ratingInput.value = value;  /* ratingInput sẽ được gửi lên backend */

        stars.forEach(s => s.classList.remove('selected'));  /* xóa class 'selected' cũ */

        this.classList.add('selected');   /* thêm class 'selected' mới vào ptử đang chọn */
        let nextSibling = this.nextElementSibling;
        while (nextSibling) {
            nextSibling.classList.add('selected');
            nextSibling = nextSibling.nextElementSibling;
        }
    });
});

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

    document.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-cart');
        if (!button) return;

        event.preventDefault();

        const cartInstance = getShoppingCartInstance();
        if (!cartInstance) {
            showNotification('Không thể thêm sản phẩm vì giỏ hàng chưa được tải.');
            return;
        }

        const product = getCartProductFromButton(button);
        if (!product) {
            showNotification('Không thể đọc thông tin sản phẩm này.');
            return;
        }

        cartInstance.addProduct(product);
        showNotification(`✓ Đã thêm "${product.name}" vào giỏ hàng!`);
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

    const productName = button.dataset.productName || nameElement?.textContent?.trim();
    const productPrice = Number(button.dataset.productPrice)
        || parseInt((priceElement?.textContent || '').replace(/\D/g, ''), 10);

    if (!productName || !Number.isFinite(productPrice)) {
        return null;
    }

    return {
        id: button.dataset.productId || normalizeProductKey(productName).replace(/\s+/g, '-'),
        name: productName,
        price: productPrice,
        quantity: 1,
        image: button.dataset.productImage || imageElement?.getAttribute('src') || ''
    };
}

// Hiển thị thông báo khi thêm sản phẩm
function showNotification(message) {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', async () => {
    const navbarReady = loadComponent('navbar-container', 'navbar.html');
    const paginationReady = loadComponent('pagination-container', 'pagination.html');
    loadComponent('footer-container', 'footer.html'); 
    loadComponent('admin-sidebar-container', 'admin-sidebar.html');
    
    // Thiết lập sự kiện cho nút "Thêm giỏ"
    setupAddToCartButtons();
    setupCategoryFilterGroups();

    await navbarReady;
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
}

async function renderProductDetail(product) {
    const productNameElement = document.getElementById('product-detail-name');
    const galleryElement = document.getElementById('product-detail-gallery');
    const specsElement = document.getElementById('product-detail-specs');
    const descriptionElement = document.getElementById('product-detail-description');
    const priceElement = document.getElementById('product-detail-price');
    const addToCartButton = document.getElementById('product-detail-add-cart');

    const productImages = getProductImages(product);
    const primaryImage = getProductImage(product) || productImages[0] || '';

    document.title = `${product.name} - Tech.no`;
    productNameElement.textContent = product.name;
    galleryElement.innerHTML = '<div class="swiper-slide product-detail-image-empty">Dang tai anh...</div>';

    specsElement.innerHTML = buildProductDetailSpecs(product)
        .map(([label, value]) => `
            <li>
                <span>${escapeHtml(label)}:</span>
                ${escapeHtml(value)}
            </li>
        `).join('');

    if (descriptionElement) {
        descriptionElement.textContent = product.description || 'Thông tin sản phẩm đang được cập nhật.';
    }

    priceElement.innerHTML = `${formatCurrency(product.price)}<sup><u>đ</u></sup>`;

    if (addToCartButton) {
        addToCartButton.dataset.productId = product.id || product.sku || product.name;
        addToCartButton.dataset.productName = product.name;
        addToCartButton.dataset.productPrice = Number(product.price || 0);
        addToCartButton.dataset.productImage = primaryImage;
        addToCartButton.disabled = false;
    }

    await renderProductDetailGallery(product, galleryElement);
    setupProductDetailTabs();
}

function buildProductDetailSpecs(product) {
    const specifications = getProductSpecifications(product);
    const template = getProductSpecificationTemplate(product);

    return template.map(([key, label]) => [
        label,
        getSpecificationValue(specifications, key, product)
    ]);
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
    if (product.category_id === 'phone') return productSpecificationTemplates.phone;
    if (product.category_id === 'laptop') return productSpecificationTemplates.laptop;
    if (product.category_id === 'pc') return productSpecificationTemplates.pc;

    if (product.category_id === 'phukien') {
        if (product.subcategory === 'airpods' || product.subcategory === 'tai-nghe') {
            return productSpecificationTemplates.audio;
        }

        if (product.subcategory === 'dong-ho') return productSpecificationTemplates.watch;
        if (product.subcategory === 'camera') return productSpecificationTemplates.camera;
        if (product.subcategory === 'sac') return productSpecificationTemplates.charger;
        if (product.subcategory === 'loa') return productSpecificationTemplates.speaker;
    }

    return [
        ['brand', 'Hãng'],
        ['model', 'Dòng sản phẩm'],
        ['origin', 'Xuất xứ'],
        ['warranty', 'Bảo hành']
    ];
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

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.productTab;

            tabs.forEach(item => {
                const isActive = item === tab;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });

            document.querySelectorAll('.product-detail-panel').forEach(panel => {
                const isActive = panel.id === `product-${target}-panel`;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
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

    if (productNameElement) {
        productNameElement.textContent = message;
    }

    if (galleryElement) {
        galleryElement.innerHTML = '<div class="swiper-slide product-detail-image-empty">TECH.NO</div>';
    }

    if (specsElement) {
        specsElement.innerHTML = '<li><span>Trạng thái:</span> Không có dữ liệu để hiển thị.</li>';
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
}

function getProductImages(product) {
    if (Array.isArray(product?.image_urls)) {
        const images = product.image_urls.filter(Boolean);
        return images.length ? images : [];
    }

    return getProductImage(product) ? [getProductImage(product)] : [];
}

async function renderProductDetailGallery(product, galleryElement) {
    const imageUrls = await getLoadableProductImages(product);

    galleryElement.innerHTML = imageUrls.length
        ? imageUrls.map(imageUrl => `
            <div class="swiper-slide">
                <img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(product.name)}"
                    referrerpolicy="no-referrer"
                    data-fallback-src="${escapeHtml(getProductImage(product))}"
                    onerror="handleDetailImageError(this);"
                >
            </div>
        `).join('')
        : '<div class="swiper-slide product-detail-image-empty">TECH.NO</div>';

    initProductDetailSwiper();
}

async function getLoadableProductImages(product, timeoutMs = 2800) {
    const primaryImage = getProductImage(product);
    const candidates = [...new Set([primaryImage, ...getProductImages(product)].filter(Boolean))].slice(0, 8);

    // Preload first so broken or slow TGDD gallery links do not create blank slides.
    const checkedImages = await Promise.all(
        candidates.map(async imageUrl => ({
            imageUrl,
            canLoad: await canLoadImage(imageUrl, timeoutMs)
        }))
    );

    const loadableImages = checkedImages
        .filter(({ canLoad }) => canLoad)
        .map(({ imageUrl }) => imageUrl)
        .slice(0, 4);

    return loadableImages.length ? loadableImages : (primaryImage ? [primaryImage] : []);
}

function canLoadImage(imageUrl, timeoutMs = 2800) {
    return new Promise(resolve => {
        if (!imageUrl) {
            resolve(false);
            return;
        }

        const image = new Image();
        let settled = false;
        const timeoutId = window.setTimeout(() => done(false), timeoutMs);

        function done(canLoad) {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            resolve(canLoad);
        }

        image.onload = () => done(Boolean(image.naturalWidth && image.naturalHeight));
        image.onerror = () => done(false);
        image.referrerPolicy = 'no-referrer';
        image.src = imageUrl;
    });
}

function initProductDetailSwiper() {
    if (!isProductDetailPage || typeof Swiper === 'undefined') return;

    if (productDetailSwiper) {
        productDetailSwiper.destroy(true, true);
    }

    const slideCount = document.querySelectorAll('.mySwiper .swiper-slide').length;

    productDetailSwiper = new Swiper('.mySwiper', {
        loop: slideCount > 1,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });
}

function handleDetailImageError(image) {
    image.onerror = null;
    const fallbackSrc = image.dataset.fallbackSrc;

    if (fallbackSrc && image.src !== fallbackSrc) {
        image.src = fallbackSrc;
        return;
    }

    const slide = image.closest('.swiper-slide');
    if (slide) {
        slide.classList.add('product-detail-image-empty');
        slide.textContent = 'TECH.NO';
    }

    image.remove();
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

function updateCategoryFilterGroups(shouldRender = true) {
    const groups = [...document.querySelectorAll('.category-filter .filter-group')];

    currentCategoryFilterGroups = groups.map(group => {
        const values = [...group.querySelectorAll('label')]
            .filter(label => label.querySelector('input')?.checked)
            .map(label => label.textContent.trim())
            .filter(Boolean);

        group.classList.toggle('has-selection', values.length > 0);

        return {
            title: group.querySelector('h4')?.textContent.trim() || '',
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
            console.log("Xác thực thành công: Người dùng hiện tại có quyền hạn Admin!");
            adminNavLink.style.display = 'list-item'; // Cho phép hiển thị nút Admin trên thanh Menu
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
                    event.preventDefault(); // Chặn hành vi cuộn trang lên đầu của thẻ 'a' mặc định
                    
                    const xácNhận = confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Tech.no?");
                    if (xácNhận) {
                        const { error: signOutError } = await thucTheSupabaseActive.auth.signOut();
                        if (!signOutError) {
                            alert("Bạn đã đăng xuất tài khoản thành công!");
                            // Điều hướng toàn bộ trang web quay trở về trang chủ index để cập nhật lại trạng thái
                            window.location.href = window.location.origin + "/index.html";
                        } else {
                            alert("Hệ thống gặp lỗi khi đăng xuất: " + signOutError.message);
                        }
                    }
                });
            }
        }

    } catch (criticalError) {
        console.error("Hệ thống lỗi phân quyền toàn cục gặp sự cố nghiêm trọng:", criticalError);
        adminNavLink.style.display = 'none';
    }
});

/* =============== BIỂU ĐỒ ================== */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof Chart === 'undefined') return;

    const revenueCanvas = document.getElementById('revenueChart');
    const categoryCanvas = document.getElementById('categoryChart');

    if (!revenueCanvas || !categoryCanvas) return;
    // 1. CẤU HÌNH BIỂU ĐỒ DOANH THU & ĐƠN HÀNG (KẾT HỢP ĐƯỜNG VÀ CỘT)
    const ctxRevenue = revenueCanvas.getContext('2d');
    new Chart(ctxRevenue, {
        type: 'bar', // Loại biểu đồ chính là Cột
        data: {
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
            datasets: [
                {
                    label: 'Doanh thu ($)',
                    data: [12000, 19000, 15000, 25000, 22000, 43287], // Dữ liệu doanh thu
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', // Màu xanh lam dương giống card gốc
                    borderRadius: 6,
                    yAxisID: 'y',
                },
                {
                    label: 'Số đơn hàng',
                    data: [120, 190, 160, 280, 240, 398], // Dữ liệu đơn hàng
                    type: 'line', // Chuyển riêng dataset này thành đường
                    borderColor: '#10b981', // Màu xanh lá dương giống card đơn hàng
                    backgroundColor: '#10b981',
                    borderWidth: 3,
                    tension: 0.3, // Bo tròn đường cong
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#f1f5f9' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false } // Ẩn grid line trùng lặp
                }
            }
        }
    });

    // 2. CẤU HÌNH BIỂU ĐỒ TỶ TRỌNG DANH MỤC (DOUGHNUT)
    const ctxCategory = categoryCanvas.getContext('2d');
    new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: ['Laptop', 'Điện thoại', 'Linh kiện PC', 'Phụ kiện'],
            datasets: [{
                data: [40, 30, 20, 10], // Tỷ lệ phần trăm %
                backgroundColor: [
                    '#3b82f6', // Xanh lam (Laptop)
                    '#10b981', // Xanh lá (Điện thoại)
                    '#f59e0b', // Vàng (Linh kiện)
                    '#ef4444'  // Đỏ (Phụ kiện)
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom', // Đưa chú thích xuống dưới cho thoáng
                    labels: { boxWidth: 12, padding: 15 }
                }
            },
            cutout: '70%' // Làm rỗng ruột biểu đồ tròn nhìn hiện đại hơn
        }
    });
});
