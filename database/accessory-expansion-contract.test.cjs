const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const seed = fs.readFileSync(
    path.join(root, 'database', 'seed-tgdd-accessories-30.sql'),
    'utf8'
);
const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'main.js'),
    'utf8'
);
const accessoryPage = fs.readFileSync(
    path.join(root, 'pages', 'phu-kien.html'),
    'utf8'
);

const prefixes = {
    monitor: 'TGDD-ACC-MONITOR-',
    mouse: 'TGDD-ACC-MOUSE-',
    keyboard: 'TGDD-ACC-KEYBOARD-'
};
const requiredSpecifications = {
    monitor: [
        'monitor_type',
        'screen_size',
        'resolution',
        'touchscreen',
        'panel',
        'refresh_rate',
        'display_technology'
    ],
    mouse: [
        'mouse_type',
        'compatibility',
        'sensor',
        'max_resolution',
        'cable_length',
        'connection'
    ],
    keyboard: [
        'compatibility',
        'connection',
        'cable_length',
        'switch_type',
        'keycap_material',
        'led'
    ]
};

const skus = [...seed.matchAll(/'(TGDD-ACC-(?:MONITOR|MOUSE|KEYBOARD)-\d+)'/g)]
    .map(match => match[1]);
assert.equal(skus.length, 30, 'The accessory seed must contain exactly 30 SKU rows.');
assert.equal(new Set(skus).size, 30, 'Every accessory SKU must be unique.');

Object.entries(prefixes).forEach(([type, prefix]) => {
    assert.equal(
        skus.filter(sku => sku.startsWith(prefix)).length,
        10,
        `The seed must contain exactly 10 ${type} products.`
    );
});

const sourceUrls = [...seed.matchAll(
    /'(https:\/\/www\.thegioididong\.com\/(?:man-hinh-may-tinh|chuot-may-tinh|ban-phim)\/[^']+)'/g
)].map(match => match[1]);
assert.equal(sourceUrls.length, 30, 'Every seeded product must have a TGDD source URL.');
assert.equal(new Set(sourceUrls).size, 30, 'Every source URL must be unique.');

const galleryBlocks = [...seed.matchAll(/ARRAY\[(?<urls>[\s\S]*?)\]::text\[\]/g)];
assert.equal(galleryBlocks.length, 30, 'Every product must have one gallery array.');
let galleryImageCount = 0;
galleryBlocks.forEach((block, index) => {
    const urls = [...block.groups.urls.matchAll(/'(https:\/\/cdn(?:v2)?\.tgdd\.vn\/[^']+)'/g)]
        .map(match => match[1]);
    galleryImageCount += urls.length;

    assert.ok(
        urls.length >= 2 && urls.length <= 7,
        `Gallery ${index + 1} must contain between 2 and 7 TGDD images.`
    );
    assert.equal(
        new Set(urls).size,
        urls.length,
        `Gallery ${index + 1} must not contain duplicate URLs.`
    );
});

const specificationBlocks = [...seed.matchAll(/'(\{[^'\r\n]+\})'::jsonb/g)]
    .map(match => JSON.parse(match[1]));
assert.equal(specificationBlocks.length, 30, 'Every product must have a JSON specification object.');

specificationBlocks.forEach((specifications, index) => {
    const type = index < 10 ? 'monitor' : index < 20 ? 'mouse' : 'keyboard';

    assert.deepEqual(
        Object.keys(specifications),
        requiredSpecifications[type],
        `Specification object ${index + 1} must use the exact ${type} field contract.`
    );
    Object.values(specifications).forEach(value => {
        assert.ok(String(value).trim(), `Specification object ${index + 1} has an empty value.`);
    });
});

assert.doesNotMatch(
    seed,
    /^\s*(?:DROP|TRUNCATE|DELETE)\b/im,
    'The additive seed must not delete existing data.'
);
assert.match(seed, /ON CONFLICT \(sku\) DO UPDATE SET/, 'The seed must be safely rerunnable.');
assert.doesNotMatch(
    seed,
    /stock\s*=\s*EXCLUDED\.stock/i,
    'A rerun must preserve live inventory for existing products.'
);
assert.match(
    seed,
    /users_before[\s\S]*orders_before[\s\S]*users_after[\s\S]*orders_after/,
    'The seed must guard user and order counts.'
);

['man-hinh', 'chuot', 'ban-phim'].forEach(subcategory => {
    assert.match(
        accessoryPage,
        new RegExp(`value="${subcategory}"`),
        `Accessory page must expose the ${subcategory} filter.`
    );
    assert.match(
        frontend,
        new RegExp(`value: '${subcategory}'[\\s\\S]*?templateKey:`),
        `Frontend must map ${subcategory} to a specification template.`
    );
});

['monitor', 'mouse', 'keyboard'].forEach(template => {
    assert.match(
        frontend,
        new RegExp(`\\n\\s{4}${template}: \\[`),
        `Frontend must define the ${template} specification template.`
    );
});

assert.doesNotMatch(
    frontend,
    /\.filter\(\(\[, value\]\) => value !== UNKNOWN_SPEC_VALUE\)/,
    'Product detail must display "Hãng không công bố" instead of hiding required spec rows.'
);

console.log(
    `accessory-expansion-contract: 30 products, ${galleryImageCount} gallery images and 3 templates passed`
);
