const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(
    path.join(root, 'pages', 'chitiet-sanpham.html'),
    'utf8'
);
const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'main.js'),
    'utf8'
);
const productSeed = fs.readFileSync(
    path.join(root, 'database', 'seed-techno-products-tgdd-60.sql'),
    'utf8'
);

const requiredIds = [
    'product-detail-name',
    'product-detail-gallery',
    'product-detail-specs',
    'product-detail-description',
    'product-detail-price',
    'product-detail-add-cart',
    'product-review-form',
    'product-review-list',
    'review-summary',
    'review-comment',
    'review-submit',
    'review-form-message',
    'rating-value',
    'rating-description',
    'star-rating'
];

requiredIds.forEach(id => {
    const matches = html.match(new RegExp(`id=["']${id}["']`, 'g')) || [];
    assert.equal(matches.length, 1, `Expected exactly one #${id}.`);
});

assert.doesNotMatch(
    html,
    /btn-buy|>\s*Mua ngay\s*</i,
    'Product detail must not render a Buy Now action.'
);
assert.match(
    html,
    /id="product-detail-add-cart"[\s\S]*?class="[^"]*\bbtn-cart\b[^"]*"|class="[^"]*\bbtn-cart\b[^"]*"[\s\S]*?id="product-detail-add-cart"/,
    'The single cart action must keep the delegated .btn-cart contract.'
);
assert.match(
    html,
    /class="swiper mySwiper"[\s\S]*?id="product-detail-gallery"[\s\S]*?swiper-button-next[\s\S]*?swiper-button-prev[\s\S]*?swiper-pagination/,
    'Swiper gallery structure, navigation and pagination must be present.'
);

const ratingValues = [...html.matchAll(/data-rating="([1-5])"/g)].map(match => Number(match[1]));
assert.deepEqual(ratingValues, [1, 2, 3, 4, 5], 'Rating controls must remain 1 through 5.');

const reviewScriptIndex = html.indexOf('/assets/js/product-reviews.js');
const mainScriptIndex = html.indexOf('/assets/js/main.js');
assert.ok(
    reviewScriptIndex >= 0 && mainScriptIndex > reviewScriptIndex,
    'Reviews must load before main.js initializes the product.'
);

assert.match(
    frontend,
    /addToCartButton\.dataset\.productId[\s\S]*addToCartButton\.dataset\.productName[\s\S]*addToCartButton\.dataset\.productPrice[\s\S]*addToCartButton\.dataset\.productImage/,
    'Renderer must continue attaching the product cart dataset.'
);
assert.match(
    frontend,
    /const isAvailable = product\.status === 'active' && stock > 0[\s\S]*addToCartButton\.disabled = !isAvailable/,
    'Cart action must be gated by live stock.'
);
assert.match(
    frontend,
    /renderProductDetailPrice\(product, priceElement\)/,
    'Product price renderer must support the modern price card.'
);
assert.match(
    frontend,
    /pagination:\s*\{\s*el: '\.swiper-pagination',\s*clickable: true/s,
    'Swiper pagination must be wired.'
);
assert.match(
    frontend,
    /'TGDD-ACC-SAMSUNG-WATCH8-40':\s*\[[\s\S]*?trang-1[\s\S]*?trang-2[\s\S]*?trang-3/,
    'Watch8 must have a multi-image fallback while the database gallery migration is pending.'
);
assert.match(
    frontend,
    /allowTouchMove:\s*slideCount > 1[\s\S]*grabCursor:\s*slideCount > 1/,
    'Multi-image gallery must explicitly support swipe and drag.'
);
assert.doesNotMatch(
    frontend,
    /getLoadableProductImages|canLoadImage/,
    'Valid gallery URLs must not be discarded by a short client-side preload timeout.'
);
assert.match(
    frontend,
    /const imageUrls = \[\.\.\.new Set\([\s\S]*getProductImages\(product\)[\s\S]*\)\]\.slice\(0, 8\)/,
    'Gallery must render normalized database URLs directly.'
);
assert.match(
    frontend,
    /function handleDetailImageError[\s\S]*removeSlide\(slideIndex\)[\s\S]*navigation\?\.update\(\)/,
    'A failed image must remove only its own slide and refresh navigation.'
);
assert.match(
    productSeed,
    /image_urls = CASE[\s\S]*cardinality\(products\.image_urls\)[\s\S]*THEN products\.image_urls[\s\S]*ELSE EXCLUDED\.image_urls/,
    'Product seed must preserve an existing multi-image gallery.'
);

console.log('product-detail-contract: 30 checks passed');
