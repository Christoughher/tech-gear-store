const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'main.js'),
    'utf8'
);

const orderingStart = frontend.indexOf('function spreadSimilarProductsAcrossPages');
const orderingEnd = frontend.indexOf('function mixProductsByCategoryForPages');

assert.ok(orderingStart >= 0, 'The visual product spreading function must exist.');
assert.ok(orderingEnd > orderingStart, 'The visual product spreading helpers must be extractable.');

const orderingSource = frontend.slice(orderingStart, orderingEnd);
const context = {
    PRODUCTS_PER_PAGE: 12,
    normalizeProductKey(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
    }
};

vm.createContext(context);
vm.runInContext(
    `${orderingSource}
    this.spreadProducts = spreadSimilarProductsAcrossPages;
    this.getVisualGroup = getProductVisualGroupKey;`,
    context
);

const products = [
    { sku: 'MAC-MINI', name: 'Mac mini M4', brand: 'apple', category_id: 'pc', subcategory: 'mini-pc' },
    { sku: 'IMAC', name: 'iMac 24 inch M4', brand: 'apple', category_id: 'pc', subcategory: 'all-in-one' },
    { sku: 'ASUS-AIO', name: 'ASUS AIO V440VA', brand: 'asus', category_id: 'pc', subcategory: 'all-in-one' },
    { sku: 'SINGPC-AIO', name: 'SingPC AIO M24Ai', brand: 'singpc', category_id: 'pc', subcategory: 'all-in-one' },
    { sku: 'ROSA-I110', name: 'ROSA Rezo I110 RTX 3050', brand: 'rosa', category_id: 'pc', subcategory: 'desktop-gaming' },
    { sku: 'ROSA-I120', name: 'ROSA Rezo I120 RTX 3050', brand: 'rosa', category_id: 'pc', subcategory: 'desktop-gaming' },
    { sku: 'ROSA-I131', name: 'ROSA Rezo I131 RTX 3050', brand: 'rosa', category_id: 'pc', subcategory: 'desktop-gaming' },
    { sku: 'ROSA-RTX5050', name: 'ROSA x ASUS Rezo I120 RTX 5050', brand: 'rosa', category_id: 'pc', subcategory: 'desktop-gaming' },
    { sku: 'SINGPC-NUC', name: 'MiniPC SingPC NUC Ultra 7', brand: 'singpc', category_id: 'pc', subcategory: 'mini-pc' },
    { sku: 'SINGPC-M400', name: 'MiniPC SingPC M400 Core i5', brand: 'singpc', category_id: 'pc', subcategory: 'mini-pc' },
    { sku: 'ASUS-V501-C7', name: 'ASUS V501MV Core 7', brand: 'asus', category_id: 'pc' },
    { sku: 'ASUS-V501-C5', name: 'ASUS V501MV Core 5', brand: 'asus', category_id: 'pc' },
    { sku: 'ASUS-V501S', name: 'ASUS V501SV Core 5', brand: 'asus', category_id: 'pc' },
    { sku: 'ASUS-REZO', name: 'ROSA x ASUS Rezo I121 RTX 5060', brand: 'asus', category_id: 'pc' },
    { sku: 'MSI-CUBI', name: 'MiniPC MSI CUBI N', brand: 'msi', category_id: 'pc' },
    { sku: 'MSI-DP180', name: 'MSI Pro DP180 Core i5', brand: 'msi', category_id: 'pc' },
    { sku: 'ASUS-AIO-OLD', name: 'ASUS AIO V440VA Core 7', brand: 'asus', category_id: 'pc' }
];

const sourceOrder = products.map(product => product.sku);
const arranged = Array.from(context.spreadProducts(products));
const arrangedAgain = Array.from(context.spreadProducts(products));
const arrangedSkus = arranged.map(product => product.sku);

assert.equal(arranged.length, products.length, 'Reordering must preserve the product count.');
assert.deepEqual(
    [...arrangedSkus].sort(),
    [...sourceOrder].sort(),
    'Reordering must preserve every product exactly once.'
);
assert.deepEqual(
    arrangedAgain.map(product => product.sku),
    arrangedSkus,
    'The product order must be deterministic.'
);
assert.deepEqual(
    products.map(product => product.sku),
    sourceOrder,
    'The source product array must not be mutated.'
);

for (let index = 1; index < arranged.length; index += 1) {
    const previous = arranged[index - 1];
    const current = arranged[index];

    assert.notEqual(
        context.getVisualGroup(previous),
        context.getVisualGroup(current),
        `Adjacent products ${previous.sku} and ${current.sku} should not use the same visual group.`
    );
    assert.notEqual(
        previous.brand,
        current.brand,
        `Adjacent products ${previous.sku} and ${current.sku} should not use the same brand.`
    );
}

assert.notEqual(
    context.getVisualGroup(arranged[11]),
    context.getVisualGroup(arranged[12]),
    'The product types at the pagination boundary must also differ.'
);
assert.notEqual(
    arranged[11].brand,
    arranged[12].brand,
    'The product brands at the pagination boundary must also differ.'
);

const compactList = products.slice(0, 6);
const compactArranged = Array.from(context.spreadProducts(compactList));
assert.notDeepEqual(
    compactArranged.map(product => product.sku),
    compactList.map(product => product.sku),
    'Lists shorter than one page must also be visually interleaved.'
);

const unavoidableList = products.filter(product => product.brand === 'rosa');
const unavoidableArranged = Array.from(context.spreadProducts(unavoidableList));
assert.deepEqual(
    unavoidableArranged.map(product => product.sku).sort(),
    unavoidableList.map(product => product.sku).sort(),
    'A single-brand filter must still retain all matching products.'
);

[
    ['MiniPC MSI CUBI N', 'pc:mini-pc'],
    ['Mac mini M4', 'pc:mini-pc'],
    ['SingPC NUC Ultra 7', 'pc:mini-pc'],
    ['ASUS AIO V440VA', 'pc:all-in-one'],
    ['iMac 24 inch M4', 'pc:all-in-one'],
    ['ASUS V501MV Core 7', 'pc:desktop'],
    ['MSI Pro DP180 Core i5', 'pc:desktop'],
    ['ROSA Rezo I120 RTX 3050', 'pc:desktop']
].forEach(([name, expectedGroup]) => {
    assert.equal(
        context.getVisualGroup({ name, brand: '', category_id: 'pc' }),
        expectedGroup,
        `${name} must be classified as ${expectedGroup}.`
    );
});

assert.match(
    frontend,
    /\.order\('created_at', \{ ascending: false \}\)\s*\.order\('sku', \{ ascending: true \}\)/,
    'Supabase product queries must use SKU as a deterministic timestamp tie-breaker.'
);
assert.match(
    frontend,
    /currentBaseProductList = currentCategoryPage\s*\?\s*arrangedProducts\s*:\s*spreadSimilarProductsAcrossPages\(arrangedProducts\)/,
    'Category pages must keep a raw base list so active filters can be rearranged again.'
);
assert.match(
    frontend,
    /currentProductList = currentCategoryPage\s*\?\s*spreadSimilarProductsAcrossPages\(filteredProducts\)\s*:\s*filteredProducts/,
    'Category search and filter results must be rearranged before pagination.'
);

console.log(`product-spread-contract: ${arranged.length} PC products interleaved deterministically`);
