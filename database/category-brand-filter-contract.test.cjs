const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pageContracts = {
    phone: {
        file: 'phone.html',
        brands: ['iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo']
    },
    laptop: {
        file: 'laptop.html',
        brands: ['asus', 'hp', 'dell', 'lenovo', 'acer', 'macbook', 'msi', 'gigabyte']
    },
    pc: {
        file: 'pc.html',
        brands: ['asus', 'msi', 'gigabyte']
    }
};

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Object.entries(pageContracts).forEach(([category, contract]) => {
    const html = fs.readFileSync(
        path.join(root, 'pages', contract.file),
        'utf8'
    );
    const brandGroup = html.match(
        /<div class="filter-group filter-group--brands"[^>]*data-filter-field="brand"[^>]*>[\s\S]*?<h4>Thương hiệu<\/h4>[\s\S]*?<\/div>/
    );

    assert.ok(brandGroup, `${contract.file} must expose a brand filter group.`);

    const optionCount = (brandGroup[0].match(/class="brand-filter-option"/g) || []).length;
    assert.equal(
        optionCount,
        contract.brands.length,
        `${contract.file} must render the complete brand set.`
    );

    contract.brands.forEach(brand => {
        const optionPattern = new RegExp(
            `data-brand="${escapeRegExp(brand)}"[\\s\\S]*?` +
            `<input[^>]*value="${escapeRegExp(brand)}"[^>]*>[\\s\\S]*?` +
            `<img[^>]*src="/assets/images/brand-logo/(?:${category}|laptop)/${escapeRegExp(brand)}\\.png"`,
            'i'
        );

        assert.match(
            brandGroup[0],
            optionPattern,
            `${contract.file} must bind ${brand} to its logo and canonical value.`
        );

        const logoFolder = category === 'pc' && brand === 'asus' ? 'laptop' : category;
        const logoPath = path.join(
            root,
            'assets',
            'images',
            'brand-logo',
            logoFolder,
            `${brand}.png`
        );

        assert.ok(fs.existsSync(logoPath), `Missing logo: ${logoPath}`);
        assert.ok(fs.statSync(logoPath).size > 0, `Logo is empty: ${logoPath}`);
    });
});

const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'main.js'),
    'utf8'
);
const categoryStyles = fs.readFileSync(
    path.join(root, 'assets', 'css', 'category.css'),
    'utf8'
);

assert.match(
    frontend,
    /const field = group\.dataset\.filterField \|\| ''[\s\S]*?return field[\s\S]*?input\?\.value/,
    'Category filters must read canonical checkbox values.'
);
assert.match(
    frontend,
    /if \(field === 'brand'\) \{\s*return normalizeProductKey\(product\.brand\) === normalizedValue;\s*\}/,
    'Brand filtering must compare the normalized product brand exactly.'
);
assert.match(
    categoryStyles,
    /\.category-filter:has\(\.filter-group--brands\[data-logo-set="pc"\]\)\s*\{\s*grid-template-columns:\s*max-content repeat\(4,\s*max-content\);/,
    'The PC toolbar must keep all four filter groups on one row.'
);

console.log('category-brand-filter-contract: 17 logo options and PC toolbar layout passed');
