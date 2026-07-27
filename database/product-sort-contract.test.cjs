const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const frontendPath = path.join(projectRoot, 'assets', 'js', 'main.js');
const frontend = fs.readFileSync(frontendPath, 'utf8');
const helperStart = frontend.indexOf('function normalizeProductKey');
const helperEnd = frontend.indexOf('function applyProductSearch');

assert.notEqual(helperStart, -1, 'Product normalization helper must exist.');
assert.notEqual(helperEnd, -1, 'Product search function must exist.');

const context = vm.createContext({});
vm.runInContext(
    `${frontend.slice(helperStart, helperEnd)}
    this.normalizeProductSortMode = normalizeProductSortMode;
    this.sortProducts = sortProducts;`,
    context
);

const products = [
    { sku: 'LAP-03', name: 'Gamma', price: '30000000', created_at: '2026-07-20T08:00:00Z' },
    { sku: 'LAP-01', name: 'Alpha', price: 10000000, created_at: '2026-07-24T08:00:00Z' },
    { sku: 'LAP-04', name: 'Delta', price: '20000000', created_at: '2026-07-22T08:00:00Z' },
    { sku: 'LAP-02', name: 'Beta', price: 10000000, created_at: '2026-07-26T08:00:00Z' }
];
const originalOrder = products.map(product => product.sku);

assert.equal(context.normalizeProductSortMode('price-asc'), 'price-asc');
assert.equal(context.normalizeProductSortMode('unsupported'), 'default');

const defaultResult = Array.from(context.sortProducts(products, 'default'));
assert.deepEqual(defaultResult.map(product => product.sku), originalOrder);
assert.notEqual(defaultResult, products, 'Sorting must return a new array.');

const ascending = Array.from(context.sortProducts(products, 'price-asc'));
assert.deepEqual(
    ascending.map(product => Number(product.price)),
    [10000000, 10000000, 20000000, 30000000],
    'Ascending price sort must compare numeric values.'
);

const descending = Array.from(context.sortProducts(products, 'price-desc'));
assert.deepEqual(
    descending.map(product => Number(product.price)),
    [30000000, 20000000, 10000000, 10000000],
    'Descending price sort must compare numeric values.'
);

const newest = Array.from(context.sortProducts(products, 'newest'));
assert.deepEqual(
    newest.map(product => product.sku),
    ['LAP-02', 'LAP-01', 'LAP-04', 'LAP-03'],
    'Newest sort must compare created_at from newest to oldest.'
);
assert.deepEqual(
    products.map(product => product.sku),
    originalOrder,
    'Sorting must not mutate the database result array.'
);

const categoryPages = ['phone.html', 'laptop.html', 'pc.html', 'phu-kien.html'];
categoryPages.forEach(filename => {
    const markup = fs.readFileSync(path.join(projectRoot, 'pages', filename), 'utf8');

    assert.match(markup, /<select[^>]*data-product-sort[^>]*>/, `${filename} must expose its product sort control.`);
    ['default', 'price-asc', 'price-desc', 'newest'].forEach(value => {
        assert.match(
            markup,
            new RegExp(`<option value="${value}">`),
            `${filename} must support the ${value} sort mode.`
        );
    });
});

assert.match(
    frontend,
    /sortSelect\.addEventListener\('change',[\s\S]*?applyProductSearch\(1\)/,
    'Changing the sort dropdown must rerender from the first page.'
);
assert.match(
    frontend,
    /setupCategoryProductSort\(\);\s*setupCategoryFilterGroups\(\);/,
    'Product sorting must be initialized on category pages.'
);

console.log('product-sort-contract: four category pages support deterministic sorting');
