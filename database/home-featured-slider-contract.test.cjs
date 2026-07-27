const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const indexMarkup = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const frontend = fs.readFileSync(path.join(projectRoot, 'assets', 'js', 'main.js'), 'utf8');
const styles = fs.readFileSync(path.join(projectRoot, 'assets', 'css', 'index.css'), 'utf8');

assert.doesNotMatch(indexMarkup, /banner[12]\.png/, 'Homepage must not render the old static ad images.');
assert.match(indexMarkup, /data-featured-slider/, 'Homepage must expose a featured-product carousel root.');
assert.match(indexMarkup, /aria-roledescription="carousel"/, 'Carousel root must be identified to assistive technology.');
assert.match(indexMarkup, /class="shop-section" id="products"/, 'Carousel fallback must have a valid product-list target.');

const skuBlock = frontend.match(/const FEATURED_PRODUCT_SKUS = Object\.freeze\(\[([\s\S]*?)\]\);/);
assert.ok(skuBlock, 'A curated featured SKU list must exist.');
const featuredSkus = [...skuBlock[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
assert.equal(featuredSkus.length, 8, 'Homepage carousel must curate exactly eight products.');
assert.equal(new Set(featuredSkus).size, featuredSkus.length, 'Featured product SKUs must be unique.');

[
    'TGDD-LAP-MSI-KATANA-15-HX',
    'TGDD-PHN-OPPO-RENO13-256',
    'TGDD-PC-EXTRA-ROSA-ASUS-I120-358731',
    'TGDD-ACC-MONITOR-368265',
    'TGDD-PHN-IPHONE-16E-512',
    'TGDD-ACC-MOUSE-357677',
    'TGDD2-LAP-ASUS-VIVOBOOK-16-A1607QA',
    'TGDD-PC-EXTRA-APPLE-IMAC-M4-331480'
].forEach(sku => {
    assert.ok(featuredSkus.includes(sku), `${sku} must be included in the curated carousel.`);
});

assert.match(
    frontend,
    /const FEATURED_SLIDER_INTERVAL_MS = 5000;/,
    'Carousel must advance automatically every five seconds.'
);
assert.match(
    frontend,
    /const shouldInitializeHomeSlider = Boolean\(featuredProductSlider && !category && !filterValue\)/,
    'Carousel data must initialize only from the unfiltered homepage product load.'
);
assert.match(
    frontend,
    /renderFeaturedProductSlider\(products\)/,
    'Carousel must reuse real products returned by Supabase.'
);
assert.match(
    frontend,
    /getProductDetailUrl\(product\)/,
    'Every featured product must use the canonical SKU-aware detail URL.'
);
assert.match(
    frontend,
    /data-fallback-sources="\$\{escapeHtml\(imageUrls\.join\('\|'\)\)\}"/,
    'Featured images must retain their gallery URLs for automatic fallback.'
);
assert.match(
    frontend,
    /fallbackSources\[nextFallbackIndex\][\s\S]*?image\.src = fallbackSources\[nextFallbackIndex\]/,
    'A failed featured image must retry the next gallery image before showing a placeholder.'
);
assert.match(frontend, /window\.setInterval\([\s\S]*?FEATURED_SLIDER_INTERVAL_MS/, 'Autoplay interval must be created.');
assert.match(frontend, /mouseenter[\s\S]*?mouseleave/, 'Autoplay must respond to pointer hover.');
assert.match(frontend, /focusin[\s\S]*?focusout/, 'Autoplay must pause while keyboard focus is inside.');
assert.match(frontend, /visibilitychange/, 'Autoplay must pause while the browser tab is hidden.');
assert.match(frontend, /prefers-reduced-motion: reduce/, 'Autoplay must respect reduced-motion preferences.');
assert.match(frontend, /touchstart[\s\S]*?touchend/, 'Carousel must support touch swiping.');
assert.match(frontend, /ArrowLeft[\s\S]*?ArrowRight[\s\S]*?Home[\s\S]*?End/, 'Carousel must support keyboard navigation.');
assert.match(frontend, /data-featured-autoplay/, 'Carousel must provide a visible play/pause control.');
assert.match(frontend, /aria-hidden="\$\{isActive \? 'false' : 'true'\}"/, 'Inactive slides must be hidden from assistive technology.');

assert.match(styles, /\.featured-slider__track[\s\S]*?transition:/, 'Carousel track must animate between slides.');
assert.match(styles, /\.featured-slide__image[\s\S]*?object-fit:\s*contain/, 'Product images must never be cropped.');
assert.match(styles, /@media \(max-width: 900px\)/, 'Carousel must have a tablet layout.');
assert.match(styles, /@media \(max-width: 576px\)/, 'Carousel must have a mobile layout.');
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/, 'Carousel animation must respect reduced motion.');

console.log(`home-featured-slider-contract: ${featuredSkus.length} curated products with 5-second autoplay`);
