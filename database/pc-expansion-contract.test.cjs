const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const seed = fs.readFileSync(
    path.join(root, 'database', 'seed-tgdd-pc-extra-10.sql'),
    'utf8'
);
const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'main.js'),
    'utf8'
);

const expectedSkus = [
    'TGDD-PC-EXTRA-ROSA-REZO-I110-335909',
    'TGDD-PC-EXTRA-ROSA-REZO-I120-335910',
    'TGDD-PC-EXTRA-ROSA-REZO-I131-358730',
    'TGDD-PC-EXTRA-ROSA-ASUS-I120-358731',
    'TGDD-PC-EXTRA-SINGPC-NUC-U715U695-357649',
    'TGDD-PC-EXTRA-SINGPC-I12450H682-334320',
    'TGDD-PC-EXTRA-APPLE-MAC-MINI-M4-331494',
    'TGDD-PC-EXTRA-APPLE-IMAC-M4-331480',
    'TGDD-PC-EXTRA-ASUS-AIO-V440VAT-364501',
    'TGDD-PC-EXTRA-SINGPC-AIO-M24AI-361290'
];
const requiredSpecifications = [
    'mainboard',
    'cpu',
    'ram',
    'storage',
    'gpu',
    'cooling',
    'case',
    'power_supply',
    'os'
];

const seededSkus = [...seed.matchAll(/'(TGDD-PC-EXTRA-[A-Z0-9-]+)'/g)]
    .map(match => match[1]);

assert.deepEqual(
    seededSkus,
    expectedSkus,
    'The seed must contain exactly the 10 reviewed PC SKUs in the expected order.'
);
assert.equal(new Set(seededSkus).size, 10, 'Every seeded PC SKU must be unique.');

const sourceUrls = [...seed.matchAll(
    /'(https:\/\/www\.thegioididong\.com\/may-tinh-de-ban\/[^']+)'/g
)].map(match => match[1]);

assert.equal(sourceUrls.length, 10, 'Every seeded PC must have one TGDD source URL.');
assert.equal(new Set(sourceUrls).size, 10, 'Every TGDD source URL must be unique.');

const galleryBlocks = [...seed.matchAll(/ARRAY\[(?<urls>[\s\S]*?)\]::text\[\]/g)];
assert.equal(galleryBlocks.length, 10, 'Every seeded PC must have one gallery array.');

let galleryImageCount = 0;
galleryBlocks.forEach((block, index) => {
    const urls = [...block.groups.urls.matchAll(
        /'(https:\/\/cdn(?:v2)?\.tgdd\.vn\/[^']+)'/g
    )].map(match => match[1]);

    galleryImageCount += urls.length;
    assert.ok(
        urls.length >= 2 && urls.length <= 7,
        `Gallery ${index + 1} must contain between 2 and 7 TGDD images.`
    );
    assert.equal(
        new Set(urls).size,
        urls.length,
        `Gallery ${index + 1} must not contain duplicate image URLs.`
    );
});

const specificationBlocks = [...seed.matchAll(/'(\{[^'\r\n]+\})'::jsonb/g)]
    .map(match => JSON.parse(match[1]));
assert.equal(specificationBlocks.length, 10, 'Every seeded PC needs a specification object.');

specificationBlocks.forEach((specifications, index) => {
    assert.deepEqual(
        Object.keys(specifications),
        requiredSpecifications,
        `Specification object ${index + 1} must follow the PC detail contract.`
    );

    Object.values(specifications).forEach(value => {
        assert.ok(String(value).trim(), `Specification object ${index + 1} has an empty value.`);
    });
});

assert.equal(
    (seed.match(/'desktop-gaming'/g) || []).length,
    4,
    'The seed must contain four gaming desktops.'
);
assert.equal(
    (seed.match(/'mini-pc'/g) || []).length,
    3,
    'The seed must contain three mini PCs.'
);
assert.equal(
    (seed.match(/'all-in-one'/g) || []).length,
    3,
    'The seed must contain three all-in-one computers.'
);

assert.doesNotMatch(
    seed,
    /^\s*(?:DROP|TRUNCATE|DELETE)\b/im,
    'The additive seed must not remove existing data.'
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
assert.match(
    seed,
    /category_id <> 'pc'[\s\S]*status <> 'active'[\s\S]*source_url NOT LIKE/,
    'The database validation must enforce visible PC rows with TGDD sources.'
);

[
    ["rosa", "ROSA"],
    ["singpc", "SingPC"],
    ["apple", "Apple"]
].forEach(([brand, label]) => {
    assert.match(
        frontend,
        new RegExp(`${brand}: '${label}'`),
        `Product details must render the ${label} brand label correctly.`
    );
});

console.log(
    `pc-expansion-contract: 10 products and ${galleryImageCount} gallery images passed`
);
