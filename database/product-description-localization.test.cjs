const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const databaseDir = __dirname;
const migrationSql = fs.readFileSync(
  path.join(databaseDir, 'fix-product-descriptions-vietnamese.sql'),
  'utf8'
);
const seedSql = fs.readFileSync(
  path.join(databaseDir, 'seed-techno-products-tgdd-60.sql'),
  'utf8'
);

const localizedRows = [
  ...migrationSql.matchAll(/^\s*\('([^']+)',\s*'([^']+)'\),?$/gm)
].map((match) => ({
  sku: match[1],
  description: match[2]
}));

assert.equal(
  localizedRows.length,
  60,
  'Migration phải chứa đúng 60 cặp SKU/description'
);

const localizedBySku = new Map(
  localizedRows.map(({ sku, description }) => [sku, description])
);
assert.equal(localizedBySku.size, 60, 'Không được có SKU trùng trong migration');

const categoryCounts = localizedRows.reduce(
  (counts, { sku }) => {
    if (sku.includes('-PHN-')) counts.phone += 1;
    if (sku.includes('-LAP-')) counts.laptop += 1;
    if (sku.includes('-PC-')) counts.pc += 1;
    if (sku.includes('-ACC-')) counts.accessory += 1;
    return counts;
  },
  { phone: 0, laptop: 0, pc: 0, accessory: 0 }
);

assert.deepEqual(categoryCounts, {
  phone: 20,
  laptop: 13,
  pc: 7,
  accessory: 20
});

const hasVietnameseDiacritic =
  /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵýỷỹ]/u;
const mojibakePattern = /(?:Ã.|Ä.|Æ.|áº|á»|â€)/u;

for (const { sku, description } of localizedRows) {
  assert.ok(description.trim(), `${sku}: description không được rỗng`);
  assert.ok(
    hasVietnameseDiacritic.test(description),
    `${sku}: description vẫn chưa có dấu tiếng Việt`
  );
  assert.equal(
    description,
    description.normalize('NFC'),
    `${sku}: description phải dùng Unicode NFC`
  );
  assert.doesNotMatch(
    description,
    mojibakePattern,
    `${sku}: description có dấu hiệu lỗi mã hóa UTF-8`
  );
}

const seedRows = [
  ...seedSql.matchAll(
    /^\('([^']+)',\s*'[^']*',\s*'([^']*)',\s*\d+,\s*\d+,\s*'(phone|laptop|pc|phukien)'/gm
  )
].map((match) => ({
  sku: match[1],
  description: match[2]
}));

assert.equal(seedRows.length, 60, 'Seed TGDD phải giữ nguyên đúng 60 sản phẩm');

for (const { sku, description } of seedRows) {
  assert.equal(
    description,
    localizedBySku.get(sku),
    `${sku}: description trong seed chưa đồng bộ với migration`
  );
}

const sqlWithoutComments = migrationSql.replace(/--.*$/gm, '');
assert.doesNotMatch(
  sqlWithoutComments,
  /\b(?:DELETE|TRUNCATE|DROP|INSERT|CREATE|ALTER)\b/i,
  'Migration chỉ được cập nhật description, không được thay đổi cấu trúc hay xóa/thêm dữ liệu'
);
assert.match(
  sqlWithoutComments,
  /UPDATE\s+public\.products[\s\S]*?SET\s+description\s*=/i,
  'Migration phải cập nhật public.products.description'
);
assert.match(
  sqlWithoutComments,
  /WHERE\s+product\.sku\s*=\s*localized\.sku/i,
  'Migration phải giới hạn cập nhật theo đúng SKU'
);
assert.equal(
  (sqlWithoutComments.match(/\bUPDATE\s+public\.products\b/gi) || []).length,
  1,
  'Migration chỉ nên có một câu UPDATE public.products'
);

console.log(
  'PASS product-description-localization: 60 mô tả có dấu, đồng bộ seed và migration an toàn'
);
