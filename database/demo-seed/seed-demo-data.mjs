#!/usr/bin/env node

import { createHash } from 'node:crypto';

const DEMO_USER_COUNT = 200;
const DEMO_ORDER_COUNT = 400;
const SEED_SOURCE = 'techno-realistic-demo-v1';
const DEFAULT_SEED = '20260722';
const EMAIL_DOMAIN = 'techno.test';
const EMAIL_PREFIX = 'customer';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const BATCH_SIZE = 120;
const AUTH_CONCURRENCY = 4;

const MONTHLY_ORDER_COUNTS = Object.freeze([
    18, 21, 24, 31, 43, 36, 28, 31, 35, 39, 51, 43
]);

const CATEGORY_LINE_QUOTAS = Object.freeze({
    phone: 180,
    laptop: 102,
    pc: 48,
    phukien: 270
});

const STATUS_QUOTAS = Object.freeze({
    completed: 348,
    cancelled: 28,
    processing: 16,
    pending: 8
});

const SHIPPING_QUOTAS = Object.freeze({
    'Tiêu chuẩn': 328,
    'Hỏa tốc': 72
});

const VIETNAMESE_LAST_NAMES = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ',
    'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'
];

const VIETNAMESE_MIDDLE_NAMES = [
    'Văn', 'Thị', 'Minh', 'Ngọc', 'Hoàng', 'Quốc', 'Thanh', 'Đức', 'Gia',
    'Khánh', 'Hải', 'Phương', 'Tuấn', 'Anh', 'Nhật', 'Bảo'
];

const VIETNAMESE_GIVEN_NAMES = [
    'An', 'Anh', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hân', 'Hiếu', 'Huy',
    'Khánh', 'Khoa', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Ngân', 'Ngọc',
    'Nhung', 'Phát', 'Phong', 'Phúc', 'Quân', 'Quỳnh', 'Sơn', 'Thảo', 'Trang',
    'Trâm', 'Trí', 'Trung', 'Tú', 'Tuấn', 'Vy', 'Yến'
];

const LOCATION_DEFINITIONS = Object.freeze([
    {
        key: 'hcm', count: 64, city: 'TP. Hồ Chí Minh',
        districts: ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Thủ Đức'],
        streets: ['Nguyễn Thị Minh Khai', 'Điện Biên Phủ', 'Lê Văn Sỹ', 'Phan Văn Trị', 'Võ Văn Ngân']
    },
    {
        key: 'hanoi', count: 48, city: 'Hà Nội',
        districts: ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Nam Từ Liêm', 'Hà Đông'],
        streets: ['Xuân Thủy', 'Láng Hạ', 'Minh Khai', 'Nguyễn Trãi', 'Tố Hữu']
    },
    {
        key: 'danang', count: 16, city: 'Đà Nẵng',
        districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Liên Chiểu'],
        streets: ['Nguyễn Văn Linh', 'Điện Biên Phủ', 'Ngô Quyền', 'Tôn Đức Thắng']
    },
    {
        key: 'cantho', count: 10, city: 'Cần Thơ',
        districts: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'],
        streets: ['30 Tháng 4', 'Nguyễn Văn Cừ', 'Võ Văn Kiệt']
    },
    {
        key: 'haiphong', count: 10, city: 'Hải Phòng',
        districts: ['Lê Chân', 'Ngô Quyền', 'Hồng Bàng'],
        streets: ['Tô Hiệu', 'Lạch Tray', 'Cầu Đất']
    },
    {
        key: 'binhduong', count: 10, city: 'Bình Dương',
        districts: ['Thủ Dầu Một', 'Dĩ An', 'Thuận An'],
        streets: ['Đại lộ Bình Dương', 'Lý Thường Kiệt', 'Nguyễn An Ninh']
    },
    {
        key: 'dongnai', count: 10, city: 'Đồng Nai',
        districts: ['Biên Hòa', 'Long Thành', 'Trảng Bom'],
        streets: ['Phạm Văn Thuận', 'Đồng Khởi', 'Nguyễn Ái Quốc']
    },
    {
        key: 'nghean', count: 6, city: 'Nghệ An',
        districts: ['TP. Vinh', 'Diễn Châu', 'Nghi Lộc'],
        streets: ['Lê Lợi', 'Nguyễn Văn Cừ', 'Quang Trung']
    },
    {
        key: 'thanhhoa', count: 6, city: 'Thanh Hóa',
        districts: ['TP. Thanh Hóa', 'Sầm Sơn', 'Bỉm Sơn'],
        streets: ['Trần Phú', 'Lê Hoàn', 'Bà Triệu']
    },
    {
        key: 'khanhhoa', count: 6, city: 'Khánh Hòa',
        districts: ['Nha Trang', 'Cam Ranh', 'Ninh Hòa'],
        streets: ['Lê Hồng Phong', 'Thống Nhất', '23 Tháng 10']
    },
    {
        key: 'lamdong', count: 4, city: 'Lâm Đồng',
        districts: ['Đà Lạt', 'Bảo Lộc'],
        streets: ['Phan Đình Phùng', 'Trần Phú', 'Nguyễn Công Trứ']
    },
    {
        key: 'other', count: 10, city: 'Tỉnh khác',
        districts: ['Quy Nhơn, Bình Định', 'Huế', 'Hạ Long, Quảng Ninh', 'Buôn Ma Thuột, Đắk Lắk', 'Mỹ Tho, Tiền Giang'],
        streets: ['Trần Hưng Đạo', 'Lê Duẩn', 'Hùng Vương', 'Nguyễn Huệ']
    }
]);

const ORDER_NOTES = Object.freeze([
    ...Array(280).fill(null),
    ...Array(60).fill('Giao trong giờ hành chính'),
    ...Array(28).fill('Vui lòng gọi trước khi giao'),
    ...Array(16).fill('Nếu không liên lạc được, gửi tại bảo vệ'),
    ...Array(8).fill('Đóng gói kỹ giúp mình'),
    ...Array(8).fill('Xuất hóa đơn điện tử giúp mình')
]);

const RECENT_STATUS_HEAD = Object.freeze([
    'pending', 'processing', 'completed', 'processing', 'pending'
]);

const argv = process.argv.slice(2);
const flags = new Set(argv);

function printHelp() {
    console.log(`
Tech.no realistic demo data generator

Usage:
  node seed-demo-data.mjs --self-test
  node --env-file=.env.seed seed-demo-data.mjs --preview
  node --env-file=.env.seed seed-demo-data.mjs --execute
  node --env-file=.env.seed seed-demo-data.mjs --execute --cleanup-only

Safety flags:
  --execute             Required before any remote write or delete.
  --cleanup-only        Delete business data of tagged demo users; keep Auth users.
  --delete-auth-users   With --cleanup-only, also delete tagged Auth users.
  --reset-passwords     Reset all existing tagged demo users to DEMO_USER_PASSWORD.
  --self-test           Generate and validate data locally without Supabase.
  --preview             Read products and calculate expected results without writing.
`);
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function expectEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${expected}, received ${actual}`);
    }
}

function expectSameSet(actualValues, expectedValues, label) {
    const actual = [...new Set(actualValues.map(String))].sort();
    const expected = [...new Set(expectedValues.map(String))].sort();
    expectEqual(actual.length, expected.length, `${label} unique count`);
    for (let index = 0; index < expected.length; index += 1) {
        if (actual[index] !== expected[index]) {
            throw new Error(`${label}: unexpected value ${actual[index] || '(missing)'}.`);
        }
    }
}

function hashToUint32(value) {
    const hash = createHash('sha256').update(String(value)).digest();
    return hash.readUInt32LE(0);
}

function createRandom(seed) {
    let state = hashToUint32(seed);
    return () => {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function randomInteger(random, minimum, maximum) {
    return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function pick(random, values) {
    return values[randomInteger(random, 0, values.length - 1)];
}

function shuffle(values, random) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInteger(random, 0, index);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function repeatValue(value, count) {
    return Array.from({ length: count }, () => value);
}

function stableUuid(value) {
    const hash = createHash('sha256').update(String(value)).digest('hex').slice(0, 32).split('');
    hash[12] = '5';
    hash[16] = ((Number.parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
    const hex = hash.join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function chunk(values, size = BATCH_SIZE) {
    const result = [];
    for (let index = 0; index < values.length; index += size) {
        result.push(values.slice(index, index + size));
    }
    return result;
}

function countBy(values, selector) {
    return values.reduce((counts, value) => {
        const key = selector(value);
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {});
}

function sumBy(values, selector) {
    return values.reduce((total, value) => total + Number(selector(value) || 0), 0);
}

function getCurrentDateText() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = Object.fromEntries(
        formatter.formatToParts(new Date())
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, part.value])
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function getAnchorConfiguration() {
    const configured = String(process.env.DEMO_ANCHOR_DATE || '').trim();
    if (configured) {
        assert(/^\d{4}-\d{2}-\d{2}$/.test(configured), 'DEMO_ANCHOR_DATE must use YYYY-MM-DD.');
        return {
            text: configured,
            instant: new Date(`${configured}T23:59:00+07:00`).toISOString()
        };
    }
    return {
        text: getCurrentDateText(),
        instant: new Date().toISOString()
    };
}

function getZonedTimeParts(date) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        hourCycle: 'h23',
        hour: '2-digit',
        minute: '2-digit'
    });
    return Object.fromEntries(
        formatter.formatToParts(date)
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, Number(part.value)])
    );
}

function parseAnchor(anchorDateText, anchorInstantValue) {
    const [year, month, day] = anchorDateText.split('-').map(Number);
    const instant = new Date(anchorInstantValue || `${anchorDateText}T23:59:00+07:00`);
    assert(!Number.isNaN(instant.getTime()), `Invalid anchor date: ${anchorDateText}`);
    const zonedTime = getZonedTimeParts(instant);
    return {
        text: anchorDateText,
        year,
        month,
        day,
        hour: zonedTime.hour,
        minute: zonedTime.minute,
        instant
    };
}

function shiftMonth(year, month, offset) {
    const zeroBased = year * 12 + (month - 1) + offset;
    return {
        year: Math.floor(zeroBased / 12),
        month: (zeroBased % 12 + 12) % 12 + 1
    };
}

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(value) {
    return String(value).padStart(2, '0');
}

function addMilliseconds(date, milliseconds) {
    return new Date(date.getTime() + milliseconds);
}

function minDate(first, second) {
    return first.getTime() <= second.getTime() ? first : second;
}

function monthKey(dateValue) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit'
    });
    const parts = Object.fromEntries(
        formatter.formatToParts(new Date(dateValue))
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, part.value])
    );
    return `${parts.year}-${parts.month}`;
}

function buildOrderDates(anchor, random) {
    const dates = [];
    MONTHLY_ORDER_COUNTS.forEach((count, oldestIndex) => {
        const monthOffset = oldestIndex - (MONTHLY_ORDER_COUNTS.length - 1);
        const target = shiftMonth(anchor.year, anchor.month, monthOffset);
        const maximumDay = monthOffset === 0
            ? Math.min(anchor.day, daysInMonth(target.year, target.month))
            : daysInMonth(target.year, target.month);

        for (let index = 0; index < count; index += 1) {
            const day = randomInteger(random, 1, maximumDay);
            const isAnchorDay = monthOffset === 0 && day === anchor.day;
            const maximumHour = isAnchorDay ? Math.min(anchor.hour, 21) : 21;
            const minimumHour = Math.min(8, maximumHour);
            const hour = randomInteger(random, minimumHour, maximumHour);
            const maximumMinute = isAnchorDay && hour === anchor.hour ? anchor.minute : 59;
            const minute = randomInteger(random, 0, maximumMinute);
            const second = randomInteger(random, 0, 59);
            dates.push(new Date(
                `${target.year}-${pad2(target.month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+07:00`
            ));
        }
    });
    return dates;
}

function buildLocationPool(random) {
    const locations = [];
    LOCATION_DEFINITIONS.forEach((definition) => {
        for (let index = 0; index < definition.count; index += 1) {
            locations.push(definition);
        }
    });
    expectEqual(locations.length, DEMO_USER_COUNT, 'Location quota');
    return shuffle(locations, random);
}

function createCustomerSpecs(seed) {
    const random = createRandom(`${seed}:customers`);
    const locations = buildLocationPool(random);

    return Array.from({ length: DEMO_USER_COUNT }, (_, zeroIndex) => {
        const index = zeroIndex + 1;
        const personRandom = createRandom(`${seed}:customer:${index}`);
        const location = locations[zeroIndex];
        const displayName = [
            pick(personRandom, VIETNAMESE_LAST_NAMES),
            pick(personRandom, VIETNAMESE_MIDDLE_NAMES),
            pick(personRandom, VIETNAMESE_GIVEN_NAMES)
        ].join(' ');
        const houseNumber = randomInteger(personRandom, 1, 399);
        const street = pick(personRandom, location.streets);
        const district = pick(personRandom, location.districts);
        const address = `${houseNumber} ${street}, ${district}, ${location.city}`;
        const phone = `09${String(10_000_000 + index).slice(-8)}`;
        const email = `${EMAIL_PREFIX}${String(index).padStart(3, '0')}.demo@${EMAIL_DOMAIN}`;

        return {
            index,
            email,
            displayName,
            phone,
            address,
            locationKey: location.key
        };
    });
}

function buildOrderCountPool(random) {
    const counts = [
        ...repeatValue(1, 100),
        ...repeatValue(2, 55),
        ...repeatValue(3, 30),
        ...repeatValue(5, 10),
        ...repeatValue(10, 5)
    ];
    expectEqual(counts.length, DEMO_USER_COUNT, 'Customer purchase-frequency quota');
    expectEqual(sumBy(counts, (value) => value), DEMO_ORDER_COUNT, 'Order quota');
    return shuffle(counts, random);
}

function buildBasketSizePool(random) {
    return shuffle([
        ...repeatValue(1, 256),
        ...repeatValue(2, 100),
        ...repeatValue(3, 32),
        ...repeatValue(4, 12)
    ], random);
}

function buildCategoryPools(random) {
    const mainCategories = shuffle([
        ...repeatValue('phone', 150),
        ...repeatValue('laptop', 88),
        ...repeatValue('pc', 42),
        ...repeatValue('phukien', 120)
    ], random);
    const addOnCategories = shuffle([
        ...repeatValue('phone', 30),
        ...repeatValue('laptop', 14),
        ...repeatValue('pc', 6),
        ...repeatValue('phukien', 150)
    ], random);
    return { mainCategories, addOnCategories };
}

function buildAccessoryQuantityPool(random) {
    return shuffle([
        ...repeatValue(1, 198),
        ...repeatValue(2, 54),
        ...repeatValue(3, 18)
    ], random);
}

function normalizeProducts(products) {
    const normalized = products.map((product) => ({
        id: String(product.id),
        sku: String(product.sku || ''),
        name: String(product.name || ''),
        price: Math.round(Number(product.price)),
        category_id: String(product.category_id || '')
    }));

    assert(normalized.length >= 4, 'At least four active products are required.');
    normalized.forEach((product) => {
        assert(product.id && product.sku && product.name, 'Every product must have id, sku and name.');
        assert(Number.isFinite(product.price) && product.price >= 0, `Invalid price for ${product.sku}.`);
    });

    Object.keys(CATEGORY_LINE_QUOTAS).forEach((categoryId) => {
        assert(
            normalized.some((product) => product.category_id === categoryId),
            `No active product found for category ${categoryId}.`
        );
    });
    return normalized;
}

function zipfProduct(products, categoryId, excludedProductIds, random) {
    const candidates = products.filter(
        (product) => product.category_id === categoryId && !excludedProductIds.has(product.id)
    );
    assert(candidates.length > 0, `Not enough unique products in category ${categoryId}.`);

    const weights = candidates.map((_, index) => 1 / Math.pow(index + 1, 1.05));
    const totalWeight = sumBy(weights, (weight) => weight);
    let cursor = random() * totalWeight;
    for (let index = 0; index < candidates.length; index += 1) {
        cursor -= weights[index];
        if (cursor <= 0) return candidates[index];
    }
    return candidates[candidates.length - 1];
}

function createRecentStatuses(random) {
    const firstTwoDays = shuffle([
        ...repeatValue('pending', 6),
        'processing'
    ], random);
    const remaining = shuffle([
        ...repeatValue('processing', 13),
        ...repeatValue('completed', 4),
        'cancelled'
    ], random);
    return [...RECENT_STATUS_HEAD, ...firstTwoDays, ...remaining];
}

function calculateOrderUpdatedAt(createdAt, status, random, anchorInstant) {
    const hours = status === 'pending'
        ? randomInteger(random, 1, 8)
        : status === 'processing'
            ? randomInteger(random, 12, 72)
            : status === 'cancelled'
                ? randomInteger(random, 2, 48)
                : randomInteger(random, 48, 144);
    return minDate(addMilliseconds(createdAt, hours * 60 * 60 * 1000), anchorInstant);
}

function createAlternateReceiver(customer, seed) {
    const random = createRandom(seed);
    const name = [
        pick(random, VIETNAMESE_LAST_NAMES),
        pick(random, VIETNAMESE_MIDDLE_NAMES),
        pick(random, VIETNAMESE_GIVEN_NAMES)
    ].join(' ');
    const phone = `08${String(20_000_000 + customer.index).slice(-8)}`;
    return { name, phone };
}

function buildDataset(customers, sourceProducts, options) {
    const { seed, anchorDateText, anchorInstant } = options;
    const anchor = parseAnchor(anchorDateText, anchorInstant);
    const products = normalizeProducts(sourceProducts);
    const random = createRandom(`${seed}:dataset:${anchorDateText}`);

    expectEqual(customers.length, DEMO_USER_COUNT, 'Customer count');
    customers.forEach((customer) => assert(customer.id, `Missing Auth id for ${customer.email}.`));

    const orderCounts = buildOrderCountPool(random);
    const datePool = shuffle(buildOrderDates(anchor, random), random);
    const basketSizes = buildBasketSizePool(random);
    const { mainCategories, addOnCategories } = buildCategoryPools(random);
    const accessoryQuantities = buildAccessoryQuantityPool(random);
    const notes = shuffle(ORDER_NOTES, random);

    const orderModels = [];
    let dateCursor = 0;
    customers.forEach((customer, customerIndex) => {
        const count = orderCounts[customerIndex];
        const customerDates = datePool
            .slice(dateCursor, dateCursor + count)
            .sort((first, second) => first.getTime() - second.getTime());
        dateCursor += count;

        customerDates.forEach((createdAt, orderIndex) => {
            orderModels.push({
                customer,
                round: orderIndex,
                createdAt
            });
        });
    });
    expectEqual(orderModels.length, DEMO_ORDER_COUNT, 'Generated orders');

    const newestFirst = [...orderModels].sort(
        (first, second) => second.createdAt.getTime() - first.createdAt.getTime()
    );
    const recentStatuses = createRecentStatuses(random);
    newestFirst.slice(0, 30).forEach((model, index) => {
        model.status = recentStatuses[index];
    });
    const historicalStatuses = shuffle([
        ...repeatValue('completed', 343),
        ...repeatValue('cancelled', 27)
    ], random);
    newestFirst.slice(30).forEach((model, index) => {
        model.status = historicalStatuses[index];
    });

    // Keep pending orders within about two days and processing orders within
    // about five days, while preserving the exact current-month quota.
    const currentMonthStart = new Date(
        `${anchor.year}-${pad2(anchor.month)}-01T00:00:00+07:00`
    );
    const availableCurrentMonthMs = Math.max(
        1,
        anchor.instant.getTime() - currentMonthStart.getTime()
    );
    const recentWindowMs = Math.min(
        5 * 24 * 60 * 60 * 1000,
        Math.max(1, Math.floor(availableCurrentMonthMs * 0.65))
    );
    const recentStepMs = Math.max(1, Math.floor(recentWindowMs / 31));
    newestFirst.slice(0, 30).forEach((model, index) => {
        model.createdAt = addMilliseconds(anchor.instant, -(index + 1) * recentStepMs);
    });

    const currentMonth = `${anchor.year}-${pad2(anchor.month)}`;
    const otherCurrentMonthModels = newestFirst
        .slice(30)
        .filter((model) => monthKey(model.createdAt) === currentMonth);
    const olderCurrentMonthSpan = Math.max(1, availableCurrentMonthMs - recentWindowMs);
    otherCurrentMonthModels.forEach((model, index) => {
        const offset = Math.floor(
            olderCurrentMonthSpan * ((index + 1) / (otherCurrentMonthModels.length + 1))
        );
        model.createdAt = addMilliseconds(currentMonthStart, offset);
    });

    let addOnCursor = 0;
    let accessoryQuantityCursor = 0;
    orderModels.forEach((model, orderIndex) => {
        const orderRandom = createRandom(
            `${seed}:order:${model.customer.email}:${model.round}:${anchorDateText}`
        );
        const basketSize = basketSizes[orderIndex];
        const categories = [mainCategories[orderIndex]];
        for (let itemIndex = 1; itemIndex < basketSize; itemIndex += 1) {
            categories.push(addOnCategories[addOnCursor]);
            addOnCursor += 1;
        }

        const cartId = stableUuid(`${SEED_SOURCE}:${seed}:cart:${model.customer.email}:${model.round}`);
        const orderId = stableUuid(`${SEED_SOURCE}:${seed}:order:${model.customer.email}:${model.round}`);
        const cartCreatedAt = addMilliseconds(
            model.createdAt,
            -randomInteger(orderRandom, basketSize + 2, 45) * 60 * 1000
        );
        const selectedProductIds = new Set();
        const cartItems = [];
        const orderItems = [];

        categories.forEach((categoryId, itemIndex) => {
            const product = zipfProduct(products, categoryId, selectedProductIds, orderRandom);
            selectedProductIds.add(product.id);
            const quantity = categoryId === 'phukien'
                ? accessoryQuantities[accessoryQuantityCursor++]
                : 1;
            const itemCreatedAt = addMilliseconds(cartCreatedAt, (itemIndex + 1) * 60 * 1000);

            cartItems.push({
                id: stableUuid(`${SEED_SOURCE}:${seed}:cart-item:${cartId}:${product.id}`),
                cart_id: cartId,
                product_id: product.id,
                quantity,
                created_at: itemCreatedAt.toISOString(),
                updated_at: itemCreatedAt.toISOString()
            });
            orderItems.push({
                row: {
                    id: stableUuid(`${SEED_SOURCE}:${seed}:order-item:${orderId}:${product.id}`),
                    order_id: orderId,
                    product_id: product.id,
                    product_name: product.name,
                    product_sku: product.sku,
                    quantity,
                    price_at_purchase: product.price,
                    created_at: model.createdAt.toISOString()
                },
                categoryId
            });
        });

        const totalPrice = sumBy(
            orderItems,
            (item) => item.row.quantity * item.row.price_at_purchase
        );
        assert(totalPrice <= 9_000_000_000, `Order ${orderId} exceeds DECIMAL(12,2) safe limit.`);

        const useAlternateReceiver = orderRandom() < 0.1;
        const alternate = createAlternateReceiver(
            model.customer,
            `${seed}:receiver:${model.customer.email}:${model.round}`
        );
        const updatedAt = calculateOrderUpdatedAt(
            model.createdAt,
            model.status,
            orderRandom,
            anchor.instant
        );

        model.basketSize = basketSize;
        model.cart = {
            id: cartId,
            user_id: model.customer.id,
            status: 'active',
            checked_out_at: null,
            created_at: cartCreatedAt.toISOString(),
            updated_at: cartCreatedAt.toISOString()
        };
        model.cartItems = cartItems;
        model.order = {
            id: orderId,
            user_id: model.customer.id,
            cart_id: cartId,
            receiver_name: useAlternateReceiver ? alternate.name : model.customer.displayName,
            receiver_phone: useAlternateReceiver ? alternate.phone : model.customer.phone,
            shipping_address: model.customer.address,
            shipping_method: null,
            total_price: totalPrice,
            status: model.status,
            note: notes[orderIndex],
            created_at: model.createdAt.toISOString(),
            updated_at: updatedAt.toISOString()
        };
        model.orderItems = orderItems;
    });

    expectEqual(addOnCursor, 200, 'Add-on category rows consumed');
    expectEqual(accessoryQuantityCursor, 270, 'Accessory quantities consumed');

    const highValueExpress = [...orderModels]
        .sort((first, second) => second.order.total_price - first.order.total_price)
        .slice(0, 45);
    const expressIds = new Set(highValueExpress.map((model) => model.order.id));
    const remainingForExpress = shuffle(
        orderModels.filter((model) => !expressIds.has(model.order.id)),
        random
    ).slice(0, 27);
    remainingForExpress.forEach((model) => expressIds.add(model.order.id));
    orderModels.forEach((model) => {
        model.order.shipping_method = expressIds.has(model.order.id) ? 'Hỏa tốc' : 'Tiêu chuẩn';
    });

    const currentCartCustomers = shuffle(customers, random);
    const currentCartModels = [];
    currentCartCustomers.slice(0, 52).forEach((customer, index) => {
        const status = index < 32 ? 'active' : 'abandoned';
        const cartRandom = createRandom(`${seed}:current-cart:${customer.email}:${status}`);
        const ageDays = status === 'active'
            ? randomInteger(cartRandom, 0, 14)
            : randomInteger(cartRandom, 15, 90);
        const createdAt = addMilliseconds(
            anchor.instant,
            -ageDays * 24 * 60 * 60 * 1000 - randomInteger(cartRandom, 0, 12) * 60 * 60 * 1000
        );
        const cartId = stableUuid(`${SEED_SOURCE}:${seed}:current-cart:${customer.email}:${status}`);
        const itemCount = randomInteger(cartRandom, 1, 3);
        const selected = new Set();
        const cartItems = [];

        for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
            const categoryId = pick(cartRandom, ['phone', 'laptop', 'pc', 'phukien', 'phukien']);
            const product = zipfProduct(products, categoryId, selected, cartRandom);
            selected.add(product.id);
            const itemCreatedAt = addMilliseconds(createdAt, (itemIndex + 1) * 60 * 1000);
            cartItems.push({
                id: stableUuid(`${SEED_SOURCE}:${seed}:current-cart-item:${cartId}:${product.id}`),
                cart_id: cartId,
                product_id: product.id,
                quantity: categoryId === 'phukien' && cartRandom() < 0.15 ? 2 : 1,
                created_at: itemCreatedAt.toISOString(),
                updated_at: itemCreatedAt.toISOString()
            });
        }

        currentCartModels.push({
            cart: {
                id: cartId,
                user_id: customer.id,
                status,
                checked_out_at: null,
                created_at: createdAt.toISOString(),
                updated_at: createdAt.toISOString()
            },
            cartItems
        });
    });

    return {
        anchor,
        customers,
        products,
        orderModels,
        currentCartModels
    };
}

function summarizeDataset(dataset) {
    const orders = dataset.orderModels.map((model) => model.order);
    const orderItems = dataset.orderModels.flatMap((model) => model.orderItems);
    const historicalCartItems = dataset.orderModels.flatMap((model) => model.cartItems);
    const currentCartItems = dataset.currentCartModels.flatMap((model) => model.cartItems);
    const completedOrders = orders.filter((order) => order.status === 'completed');

    return {
        customers: dataset.customers.length,
        orders: orders.length,
        statuses: countBy(orders, (order) => order.status),
        shipping: countBy(orders, (order) => order.shipping_method),
        basketSizes: countBy(dataset.orderModels, (model) => String(model.basketSize)),
        orderItemRows: orderItems.length,
        categoryLines: countBy(orderItems, (item) => item.categoryId),
        unitsSold: sumBy(orderItems, (item) => item.row.quantity),
        completedRevenue: sumBy(completedOrders, (order) => order.total_price),
        grossOrderValue: sumBy(orders, (order) => order.total_price),
        monthlyOrders: countBy(orders, (order) => monthKey(order.created_at)),
        checkedOutCarts: dataset.orderModels.length,
        historicalCartItems: historicalCartItems.length,
        activeCarts: dataset.currentCartModels.filter((model) => model.cart.status === 'active').length,
        abandonedCarts: dataset.currentCartModels.filter((model) => model.cart.status === 'abandoned').length,
        currentCartItems: currentCartItems.length,
        ordersWithNotes: orders.filter((order) => order.note).length,
        maximumRound: Math.max(...dataset.orderModels.map((model) => model.round)) + 1
    };
}

function validateDataset(dataset) {
    const summary = summarizeDataset(dataset);
    expectEqual(summary.customers, DEMO_USER_COUNT, 'Customers');
    expectEqual(summary.orders, DEMO_ORDER_COUNT, 'Orders');
    expectEqual(new Set(dataset.customers.map((customer) => customer.email)).size, DEMO_USER_COUNT, 'Unique emails');
    expectEqual(new Set(dataset.customers.map((customer) => customer.id)).size, DEMO_USER_COUNT, 'Unique Auth ids');

    Object.entries(STATUS_QUOTAS).forEach(([status, expected]) => {
        expectEqual(summary.statuses[status] || 0, expected, `Order status ${status}`);
    });
    Object.entries(SHIPPING_QUOTAS).forEach(([method, expected]) => {
        expectEqual(summary.shipping[method] || 0, expected, `Shipping method ${method}`);
    });
    Object.entries({ 1: 256, 2: 100, 3: 32, 4: 12 }).forEach(([size, expected]) => {
        expectEqual(summary.basketSizes[size] || 0, expected, `Basket size ${size}`);
    });
    Object.entries(CATEGORY_LINE_QUOTAS).forEach(([categoryId, expected]) => {
        expectEqual(summary.categoryLines[categoryId] || 0, expected, `Category lines ${categoryId}`);
    });

    expectEqual(summary.orderItemRows, 600, 'Order item rows');
    expectEqual(summary.historicalCartItems, 600, 'Historical cart item rows');
    expectEqual(summary.unitsSold, 690, 'Units sold');
    expectEqual(summary.activeCarts, 32, 'Active carts');
    expectEqual(summary.abandonedCarts, 20, 'Abandoned carts');
    expectEqual(summary.ordersWithNotes, 120, 'Orders with notes');

    const expectedMonths = MONTHLY_ORDER_COUNTS.map((count, index) => {
        const offset = index - (MONTHLY_ORDER_COUNTS.length - 1);
        const target = shiftMonth(dataset.anchor.year, dataset.anchor.month, offset);
        return [`${target.year}-${pad2(target.month)}`, count];
    });
    expectedMonths.forEach(([key, expected]) => {
        expectEqual(summary.monthlyOrders[key] || 0, expected, `Orders in ${key}`);
    });

    const orderIds = new Set();
    const cartIds = new Set();
    const ordersPerUser = new Map();
    dataset.orderModels.forEach((model) => {
        assert(!orderIds.has(model.order.id), `Duplicate order id ${model.order.id}.`);
        assert(!cartIds.has(model.cart.id), `Duplicate cart id ${model.cart.id}.`);
        orderIds.add(model.order.id);
        cartIds.add(model.cart.id);
        expectEqual(model.order.cart_id, model.cart.id, 'Order/cart relationship');
        expectEqual(model.order.user_id, model.cart.user_id, 'Order/cart owner');
        expectEqual(model.cartItems.length, model.orderItems.length, 'Cart/order item row count');
        assert(
            model.createdAt.getTime() <= dataset.anchor.instant.getTime(),
            `Order ${model.order.id} is in the future.`
        );
        if (model.order.status === 'pending') {
            assert(
                dataset.anchor.instant.getTime() - model.createdAt.getTime() <= 48 * 60 * 60 * 1000,
                `Pending order ${model.order.id} is older than 48 hours.`
            );
        }
        if (model.order.status === 'processing') {
            assert(
                dataset.anchor.instant.getTime() - model.createdAt.getTime() <= 5 * 24 * 60 * 60 * 1000,
                `Processing order ${model.order.id} is older than five days.`
            );
        }
        expectEqual(
            model.order.total_price,
            sumBy(model.orderItems, (item) => item.row.quantity * item.row.price_at_purchase),
            `Order total ${model.order.id}`
        );

        const cartProducts = new Set(model.cartItems.map((item) => item.product_id));
        expectEqual(cartProducts.size, model.cartItems.length, `Unique cart products ${model.cart.id}`);
        model.cartItems.forEach((item) => {
            assert(
                new Date(item.created_at).getTime() <= model.createdAt.getTime(),
                `Cart item ${item.id} was created after checkout.`
            );
        });
        model.orderItems.forEach((item) => {
            const cartItem = model.cartItems.find((candidate) => candidate.product_id === item.row.product_id);
            assert(cartItem, `Order product missing from cart ${item.row.product_id}.`);
            expectEqual(cartItem.quantity, item.row.quantity, 'Cart/order quantity snapshot');
        });

        ordersPerUser.set(model.order.user_id, (ordersPerUser.get(model.order.user_id) || 0) + 1);
    });
    expectEqual(ordersPerUser.size, DEMO_USER_COUNT, 'Customers with at least one order');

    const activeUserIds = dataset.currentCartModels
        .filter((model) => model.cart.status === 'active')
        .map((model) => model.cart.user_id);
    expectEqual(new Set(activeUserIds).size, activeUserIds.length, 'One active cart per customer');
    assert(summary.completedRevenue > 0, 'Completed revenue must be positive.');
    return summary;
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value));
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(Number(value));
}

function printSummary(summary, title) {
    console.log(`\n${title}`);
    console.log('='.repeat(title.length));
    console.log(`Customers with orders : ${formatNumber(summary.customers)}`);
    console.log(`Orders                : ${formatNumber(summary.orders)}`);
    console.log(`  completed           : ${formatNumber(summary.statuses.completed || 0)}`);
    console.log(`  processing          : ${formatNumber(summary.statuses.processing || 0)}`);
    console.log(`  pending             : ${formatNumber(summary.statuses.pending || 0)}`);
    console.log(`  cancelled           : ${formatNumber(summary.statuses.cancelled || 0)}`);
    console.log(`Completed revenue     : ${formatCurrency(summary.completedRevenue)}`);
    console.log(`Gross order value     : ${formatCurrency(summary.grossOrderValue)}`);
    console.log(`Order item rows       : ${formatNumber(summary.orderItemRows)}`);
    console.log(`Units sold            : ${formatNumber(summary.unitsSold)}`);
    console.log(`Shipping standard     : ${formatNumber(summary.shipping['Tiêu chuẩn'] || 0)}`);
    console.log(`Shipping express      : ${formatNumber(summary.shipping['Hỏa tốc'] || 0)}`);
    console.log(`Active carts          : ${formatNumber(summary.activeCarts)}`);
    console.log(`Abandoned carts       : ${formatNumber(summary.abandonedCarts)}`);
    console.log(`Anchor date           : ${summary.anchorDate || ''}`);
}

function createMockProducts(seed) {
    const definitions = {
        phone: { prefix: 'Điện thoại demo', basePrice: 4_500_000, step: 1_250_000 },
        laptop: { prefix: 'Laptop demo', basePrice: 12_500_000, step: 1_750_000 },
        pc: { prefix: 'PC demo', basePrice: 10_500_000, step: 2_100_000 },
        phukien: { prefix: 'Phụ kiện demo', basePrice: 350_000, step: 420_000 }
    };
    return Object.entries(definitions).flatMap(([categoryId, definition]) => (
        Array.from({ length: 15 }, (_, index) => ({
            id: stableUuid(`${seed}:mock-product:${categoryId}:${index}`),
            sku: `MOCK-${categoryId.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
            name: `${definition.prefix} ${index + 1}`,
            price: definition.basePrice + definition.step * index,
            category_id: categoryId
        }))
    ));
}

function createMockCustomers(seed) {
    return createCustomerSpecs(seed).map((customer) => ({
        ...customer,
        id: stableUuid(`${seed}:mock-auth-user:${customer.email}`)
    }));
}

function validateServiceRoleKey(serviceRoleKey) {
    if (/^sb_secret_[a-zA-Z0-9_-]{20,}$/.test(serviceRoleKey)) return;
    if (serviceRoleKey.startsWith('sb_publishable_')) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY contains a publishable key, not a backend secret key.');
    }

    const parts = serviceRoleKey.split('.');
    if (parts.length === 3) {
        try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            if (payload?.role === 'service_role') return;
            throw new Error(`Legacy JWT role is ${payload?.role || 'missing'}, not service_role.`);
        } catch (error) {
            if (/Legacy JWT role/.test(error.message)) throw error;
        }
    }
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be an sb_secret_ key or a legacy JWT with role=service_role.');
}

function readRemoteConfig({ requirePassword }) {
    const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
    const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const confirmProjectRef = String(process.env.DEMO_CONFIRM_PROJECT_REF || '').trim();
    const password = String(process.env.DEMO_USER_PASSWORD || '');
    const seed = String(process.env.DEMO_SEED || DEFAULT_SEED).trim();
    const anchorConfiguration = getAnchorConfiguration();

    assert(supabaseUrl, 'Missing SUPABASE_URL in .env.seed.');
    assert(serviceRoleKey, 'Missing SUPABASE_SERVICE_ROLE_KEY in .env.seed.');
    validateServiceRoleKey(serviceRoleKey);
    const parsedUrl = new URL(supabaseUrl);
    assert(parsedUrl.protocol === 'https:', 'SUPABASE_URL must use https://.');
    assert(!parsedUrl.username && !parsedUrl.password, 'SUPABASE_URL must not contain credentials.');
    assert(!parsedUrl.port, 'SUPABASE_URL must not contain a custom port.');
    assert(parsedUrl.pathname === '/', 'SUPABASE_URL must not contain a path.');
    assert(!parsedUrl.search && !parsedUrl.hash, 'SUPABASE_URL must not contain query or hash values.');
    const hostMatch = /^([a-z0-9-]+)\.supabase\.co$/i.exec(parsedUrl.hostname);
    assert(hostMatch, 'SUPABASE_URL must exactly match https://<project-ref>.supabase.co.');
    const projectRef = hostMatch[1].toLowerCase();
    assert(
        confirmProjectRef.toLowerCase() === projectRef,
        `DEMO_CONFIRM_PROJECT_REF must exactly equal ${projectRef}.`
    );
    if (requirePassword) {
        assert(password.length >= 12, 'DEMO_USER_PASSWORD must contain at least 12 characters.');
        assert(!/REPLACE|CHANGE_ME|YOUR_/i.test(password), 'Replace the placeholder DEMO_USER_PASSWORD.');
    }

    return {
        supabaseUrl,
        serviceRoleKey,
        projectRef,
        password,
        seed,
        anchorDateText: anchorConfiguration.text,
        anchorInstant: anchorConfiguration.instant
    };
}

async function createServerClient(config) {
    let createClient;
    try {
        ({ createClient } = await import('@supabase/supabase-js'));
    } catch (error) {
        throw new Error(`Cannot load @supabase/supabase-js. Run npm install first. ${error.message}`);
    }

    return createClient(config.supabaseUrl, config.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });
}

async function runSchemaPreflight(client) {
    let data;
    try {
        data = await runSupabase(
            'Check database schema prerequisites',
            () => client.rpc('check_demo_seed_schema')
        );
    } catch (error) {
        throw new Error(
            `Database preflight failed. Run database/enable-demo-data-seed.sql in Supabase SQL Editor first. ${error.message}`
        );
    }
    assert(data?.ok === true, 'Database preflight RPC did not return ok=true.');
    console.log(`Schema preflight passed (${data.schema_version || 'unknown version'}).`);
}

function isRetryable(error, resultStatus) {
    const status = Number(resultStatus || error?.status || error?.statusCode || 0);
    const code = String(error?.code || '');
    return status === 429 || status >= 500 || ['ECONNRESET', 'ETIMEDOUT', 'PGRST000'].includes(code);
}

function describeError(error) {
    return [error?.message, error?.code, error?.details, error?.hint]
        .filter(Boolean)
        .join(' | ');
}

async function wait(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function runSupabase(label, operation, maximumAttempts = 5) {
    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
        let result;
        try {
            result = await operation();
        } catch (error) {
            if (attempt < maximumAttempts) {
                const delay = Math.min(8000, 500 * 2 ** (attempt - 1));
                console.warn(`${label}: network retry ${attempt}/${maximumAttempts - 1} after ${delay}ms.`);
                await wait(delay);
                continue;
            }
            throw new Error(`${label}: ${describeError(error) || error.message || String(error)}`);
        }
        if (!result?.error) return result?.data;

        if (attempt < maximumAttempts && isRetryable(result.error, result.status)) {
            const delay = Math.min(8000, 500 * 2 ** (attempt - 1));
            console.warn(`${label}: retry ${attempt}/${maximumAttempts - 1} after ${delay}ms.`);
            await wait(delay);
            continue;
        }
        throw new Error(`${label}: ${describeError(result.error)}`);
    }
    throw new Error(`${label}: retry loop ended unexpectedly.`);
}

async function mapWithConcurrency(values, concurrency, worker) {
    const results = new Array(values.length);
    let nextIndex = 0;

    async function runWorker() {
        while (true) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            if (currentIndex >= values.length) return;
            results[currentIndex] = await worker(values[currentIndex], currentIndex);
        }
    }

    await Promise.all(Array.from(
        { length: Math.min(concurrency, values.length) },
        () => runWorker()
    ));
    return results;
}

async function listAllAuthUsers(client) {
    const users = [];
    const perPage = 1000;
    for (let page = 1; page <= 1000; page += 1) {
        const data = await runSupabase(
            `List Auth users page ${page}`,
            () => client.auth.admin.listUsers({ page, perPage })
        );
        const pageUsers = data?.users || [];
        users.push(...pageUsers);
        if (pageUsers.length < perPage) return users;
    }
    throw new Error('Auth pagination exceeded 1000 pages.');
}

function isExpectedDemoEmail(email) {
    return new RegExp(`^${EMAIL_PREFIX}\\d{3}\\.demo@${EMAIL_DOMAIN.replace('.', '\\.')}$$`, 'i')
        .test(String(email || ''));
}

function getTaggedAuthUsers(allAuthUsers, expectedEmailSet) {
    const conflicts = allAuthUsers.filter((user) => (
        expectedEmailSet.has(String(user.email || '').toLowerCase())
        && user.app_metadata?.seed_source !== SEED_SOURCE
    ));
    if (conflicts.length) {
        throw new Error(
            `Safety stop: ${conflicts.length} expected demo email(s) already exist without seed_source=${SEED_SOURCE}.`
        );
    }

    return allAuthUsers.filter((user) => (
        expectedEmailSet.has(String(user.email || '').toLowerCase())
        && isExpectedDemoEmail(user.email)
        && user.app_metadata?.seed_source === SEED_SOURCE
    ));
}

async function upsertRows(client, table, rows, label, size = BATCH_SIZE) {
    for (const [index, rowsChunk] of chunk(rows, size).entries()) {
        await runSupabase(
            `${label} batch ${index + 1}`,
            () => client.from(table).upsert(rowsChunk, { onConflict: 'id' })
        );
    }
}

async function insertRows(client, table, rows, label, size = BATCH_SIZE) {
    for (const [index, rowsChunk] of chunk(rows, size).entries()) {
        await runSupabase(
            `${label} batch ${index + 1}`,
            () => client.from(table).insert(rowsChunk)
        );
    }
}

async function deleteByIds(client, table, column, ids, label) {
    for (const [index, idsChunk] of chunk(ids, 40).entries()) {
        await runSupabase(
            `${label} batch ${index + 1}`,
            () => client.from(table).delete().in(column, idsChunk)
        );
    }
}

async function selectByIds(client, table, columns, column, ids, label) {
    const rows = [];
    for (const [index, idsChunk] of chunk(ids, 40).entries()) {
        const data = await runSupabase(
            `${label} batch ${index + 1}`,
            () => client.from(table).select(columns).in(column, idsChunk)
        );
        rows.push(...(data || []));
    }
    return rows;
}

async function fetchProducts(client) {
    const products = [];
    const pageSize = 1000;
    for (let page = 0; page < 1000; page += 1) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const data = await runSupabase(
            `Load active products page ${page + 1}`,
            () => client
                .from('products')
                .select('id, sku, name, price, category_id, stock, status, created_at')
                .eq('status', 'active')
                .gt('stock', 0)
                .order('created_at', { ascending: false })
                .order('sku', { ascending: true })
                .range(from, to)
        );
        const rows = data || [];
        products.push(...rows);
        if (rows.length < pageSize) return normalizeProducts(products);
    }
    throw new Error('Product pagination exceeded 1000 pages.');
}

async function ensureAuthCustomers(client, specs, password, resetPasswords) {
    console.log('\nChecking tagged Auth users...');
    const allAuthUsers = await listAllAuthUsers(client);
    const expectedEmailSet = new Set(specs.map((spec) => spec.email.toLowerCase()));
    const existing = getTaggedAuthUsers(allAuthUsers, expectedEmailSet);
    const byEmail = new Map(existing.map((user) => [String(user.email).toLowerCase(), user]));
    const missing = specs.filter((spec) => !byEmail.has(spec.email.toLowerCase()));
    console.log(`Existing tagged users: ${existing.length}; missing: ${missing.length}.`);

    let createdCount = 0;
    const createdUsers = await mapWithConcurrency(missing, AUTH_CONCURRENCY, async (spec) => {
        const data = await runSupabase(
            `Create Auth user ${spec.email}`,
            () => client.auth.admin.createUser({
                email: spec.email,
                password,
                email_confirm: true,
                app_metadata: {
                    seed_source: SEED_SOURCE,
                    seed_index: spec.index
                },
                user_metadata: {
                    display_name: spec.displayName,
                    phone: spec.phone,
                    address: spec.address
                }
            })
        );
        createdCount += 1;
        if (createdCount % 10 === 0 || createdCount === missing.length) {
            console.log(`Created ${createdCount}/${missing.length} Auth users.`);
        }
        return data.user;
    });
    createdUsers.forEach((user) => byEmail.set(String(user.email).toLowerCase(), user));

    if (resetPasswords && existing.length) {
        console.log(`Resetting passwords for ${existing.length} existing tagged users...`);
        let updatedCount = 0;
        await mapWithConcurrency(existing, AUTH_CONCURRENCY, async (user) => {
            const spec = specs.find((candidate) => candidate.email.toLowerCase() === user.email.toLowerCase());
            await runSupabase(
                `Update Auth user ${user.email}`,
                () => client.auth.admin.updateUserById(user.id, {
                    password,
                    email_confirm: true,
                    app_metadata: {
                        ...(user.app_metadata || {}),
                        seed_source: SEED_SOURCE,
                        seed_index: spec.index
                    },
                    user_metadata: {
                        ...(user.user_metadata || {}),
                        display_name: spec.displayName,
                        phone: spec.phone,
                        address: spec.address
                    }
                })
            );
            updatedCount += 1;
            if (updatedCount % 20 === 0 || updatedCount === existing.length) {
                console.log(`Updated ${updatedCount}/${existing.length} existing Auth users.`);
            }
        });
    }

    const customers = specs.map((spec) => {
        const authUser = byEmail.get(spec.email.toLowerCase());
        assert(authUser?.id, `Auth user missing after create: ${spec.email}.`);
        return { ...spec, id: authUser.id };
    });

    await upsertRows(
        client,
        'users',
        customers.map((customer) => ({
            id: customer.id,
            email: customer.email,
            display_name: customer.displayName,
            phone: customer.phone,
            address: customer.address,
            role: 'customer'
        })),
        'Upsert public user profiles'
    );
    return customers;
}

async function cleanupBusinessData(client, userIds) {
    if (!userIds.length) {
        console.log('No tagged demo users found; nothing to clean.');
        return;
    }
    console.log(`\nCleaning business data for ${userIds.length} tagged demo users...`);
    await deleteByIds(client, 'product_reviews', 'user_id', userIds, 'Delete demo reviews');
    await deleteByIds(client, 'orders', 'user_id', userIds, 'Delete demo orders');
    await deleteByIds(client, 'carts', 'user_id', userIds, 'Delete demo carts');
    console.log('Demo business data cleaned. Auth users and public profiles were kept.');
}

async function seedBusinessData(client, dataset) {
    const maximumRound = Math.max(...dataset.orderModels.map((model) => model.round));
    console.log(`\nSeeding ${dataset.orderModels.length} orders in ${maximumRound + 1} safe cart round(s)...`);

    for (let round = 0; round <= maximumRound; round += 1) {
        const models = dataset.orderModels.filter((model) => model.round === round);
        if (!models.length) continue;
        console.log(`Round ${round + 1}/${maximumRound + 1}: ${models.length} order(s).`);

        await insertRows(client, 'carts', models.map((model) => model.cart), `Insert carts round ${round + 1}`);
        await insertRows(
            client,
            'cart_items',
            models.flatMap((model) => model.cartItems),
            `Insert cart items round ${round + 1}`
        );
        await insertRows(client, 'orders', models.map((model) => model.order), `Insert orders round ${round + 1}`);
        await insertRows(
            client,
            'order_items',
            models.flatMap((model) => model.orderItems.map((item) => item.row)),
            `Insert order items round ${round + 1}`
        );

        await upsertRows(
            client,
            'carts',
            models.map((model) => ({
                ...model.cart,
                status: 'checked_out',
                checked_out_at: model.order.created_at
            })),
            `Backfill checkout time round ${round + 1}`
        );
    }

    console.log(`Adding ${dataset.currentCartModels.length} active/abandoned carts...`);
    await insertRows(
        client,
        'carts',
        dataset.currentCartModels.map((model) => model.cart),
        'Insert current carts'
    );
    await insertRows(
        client,
        'cart_items',
        dataset.currentCartModels.flatMap((model) => model.cartItems),
        'Insert current cart items'
    );
}

async function verifyRemoteData(client, dataset) {
    console.log('\nVerifying remote rows...');
    const userIds = dataset.customers.map((customer) => customer.id);
    const profiles = await selectByIds(client, 'users', 'id', 'id', userIds, 'Verify profiles');
    const orders = await selectByIds(
        client,
        'orders',
        'id, user_id, cart_id, status, shipping_method, total_price, created_at',
        'user_id',
        userIds,
        'Verify orders'
    );
    const carts = await selectByIds(
        client,
        'carts',
        'id, user_id, status, checked_out_at',
        'user_id',
        userIds,
        'Verify carts'
    );
    const orderItems = await selectByIds(
        client,
        'order_items',
        'id, order_id, product_id, product_name, product_sku, quantity, price_at_purchase',
        'order_id',
        orders.map((order) => order.id),
        'Verify order items'
    );
    const cartItems = await selectByIds(
        client,
        'cart_items',
        'id, cart_id, product_id, quantity',
        'cart_id',
        carts.map((cart) => cart.id),
        'Verify cart items'
    );

    const expectedSummary = summarizeDataset(dataset);
    const expectedOrders = dataset.orderModels.map((model) => model.order);
    const expectedCarts = [
        ...dataset.orderModels.map((model) => ({
            ...model.cart,
            status: 'checked_out',
            checked_out_at: model.order.created_at
        })),
        ...dataset.currentCartModels.map((model) => model.cart)
    ];
    const expectedOrderItems = dataset.orderModels.flatMap(
        (model) => model.orderItems.map((item) => item.row)
    );
    const expectedCartItems = [
        ...dataset.orderModels.flatMap((model) => model.cartItems),
        ...dataset.currentCartModels.flatMap((model) => model.cartItems)
    ];

    expectEqual(profiles.length, DEMO_USER_COUNT, 'Remote public profiles');
    expectEqual(orders.length, DEMO_ORDER_COUNT, 'Remote orders');
    expectEqual(carts.length, DEMO_ORDER_COUNT + 52, 'Remote carts');
    expectEqual(orderItems.length, 600, 'Remote order items');
    expectEqual(
        cartItems.length,
        expectedSummary.historicalCartItems + expectedSummary.currentCartItems,
        'Remote cart items'
    );
    expectSameSet(profiles.map((row) => row.id), userIds, 'Remote profile ids');
    expectSameSet(orders.map((row) => row.id), expectedOrders.map((row) => row.id), 'Remote order ids');
    expectSameSet(carts.map((row) => row.id), expectedCarts.map((row) => row.id), 'Remote cart ids');
    expectSameSet(orderItems.map((row) => row.id), expectedOrderItems.map((row) => row.id), 'Remote order item ids');
    expectSameSet(cartItems.map((row) => row.id), expectedCartItems.map((row) => row.id), 'Remote cart item ids');
    expectEqual(new Set(orders.map((order) => order.user_id)).size, DEMO_USER_COUNT, 'Remote customers with orders');

    const remoteStatuses = countBy(orders, (order) => order.status);
    const remoteShipping = countBy(orders, (order) => order.shipping_method);
    Object.entries(STATUS_QUOTAS).forEach(([status, expected]) => {
        expectEqual(remoteStatuses[status] || 0, expected, `Remote status ${status}`);
    });
    Object.entries(SHIPPING_QUOTAS).forEach(([method, expected]) => {
        expectEqual(remoteShipping[method] || 0, expected, `Remote shipping ${method}`);
    });

    const remoteCartStatuses = countBy(carts, (cart) => cart.status);
    expectEqual(remoteCartStatuses.checked_out || 0, DEMO_ORDER_COUNT, 'Remote checked-out carts');
    expectEqual(remoteCartStatuses.active || 0, 32, 'Remote active carts');
    expectEqual(remoteCartStatuses.abandoned || 0, 20, 'Remote abandoned carts');
    carts.filter((cart) => cart.status === 'checked_out').forEach((cart) => {
        assert(cart.checked_out_at, `Checked-out cart ${cart.id} has no checked_out_at.`);
    });
    const expectedCartById = new Map(expectedCarts.map((cart) => [cart.id, cart]));
    carts.forEach((cart) => {
        const expected = expectedCartById.get(cart.id);
        assert(expected, `Unexpected remote cart ${cart.id}.`);
        expectEqual(cart.user_id, expected.user_id, `Cart owner ${cart.id}`);
        expectEqual(cart.status, expected.status, `Cart status ${cart.id}`);
        if (expected.checked_out_at) {
            expectEqual(
                new Date(cart.checked_out_at).getTime(),
                new Date(expected.checked_out_at).getTime(),
                `Cart checkout time ${cart.id}`
            );
        }
    });

    const expectedOrderById = new Map(expectedOrders.map((order) => [order.id, order]));
    orders.forEach((order) => {
        const expected = expectedOrderById.get(order.id);
        assert(expected, `Unexpected remote order ${order.id}.`);
        expectEqual(order.user_id, expected.user_id, `Order owner ${order.id}`);
        expectEqual(order.cart_id, expected.cart_id, `Order cart ${order.id}`);
        expectEqual(order.status, expected.status, `Order status ${order.id}`);
        expectEqual(order.shipping_method, expected.shipping_method, `Order shipping ${order.id}`);
        expectEqual(Number(order.total_price), expected.total_price, `Order total ${order.id}`);
        expectEqual(
            new Date(order.created_at).getTime(),
            new Date(expected.created_at).getTime(),
            `Order created_at ${order.id}`
        );
    });

    const expectedOrderItemById = new Map(expectedOrderItems.map((item) => [item.id, item]));
    orderItems.forEach((item) => {
        const expected = expectedOrderItemById.get(item.id);
        assert(expected, `Unexpected remote order item ${item.id}.`);
        expectEqual(item.order_id, expected.order_id, `Order item order ${item.id}`);
        expectEqual(item.product_id, expected.product_id, `Order item product ${item.id}`);
        expectEqual(item.product_name, expected.product_name, `Order item name ${item.id}`);
        expectEqual(item.product_sku || '', expected.product_sku || '', `Order item SKU ${item.id}`);
        expectEqual(Number(item.quantity), expected.quantity, `Order item quantity ${item.id}`);
        expectEqual(Number(item.price_at_purchase), expected.price_at_purchase, `Order item price ${item.id}`);
    });

    const expectedCartItemById = new Map(expectedCartItems.map((item) => [item.id, item]));
    cartItems.forEach((item) => {
        const expected = expectedCartItemById.get(item.id);
        assert(expected, `Unexpected remote cart item ${item.id}.`);
        expectEqual(item.cart_id, expected.cart_id, `Cart item cart ${item.id}`);
        expectEqual(item.product_id, expected.product_id, `Cart item product ${item.id}`);
        expectEqual(Number(item.quantity), expected.quantity, `Cart item quantity ${item.id}`);
    });

    const remoteOrderItemGroups = new Map();
    orderItems.forEach((item) => {
        if (!remoteOrderItemGroups.has(item.order_id)) remoteOrderItemGroups.set(item.order_id, []);
        remoteOrderItemGroups.get(item.order_id).push(item);
    });
    orders.forEach((order) => {
        const items = remoteOrderItemGroups.get(order.id) || [];
        expectEqual(
            sumBy(items, (item) => Number(item.quantity) * Number(item.price_at_purchase)),
            Number(order.total_price),
            `Remote item sum for order ${order.id}`
        );
    });
    expectEqual(sumBy(orderItems, (item) => Number(item.quantity)), 690, 'Remote units sold');

    const remoteMonthlyOrders = countBy(orders, (order) => monthKey(order.created_at));
    Object.entries(expectedSummary.monthlyOrders).forEach(([month, expected]) => {
        expectEqual(remoteMonthlyOrders[month] || 0, expected, `Remote orders in ${month}`);
    });

    const completedRevenue = sumBy(
        orders.filter((order) => order.status === 'completed'),
        (order) => Number(order.total_price)
    );
    expectEqual(completedRevenue, expectedSummary.completedRevenue, 'Remote completed revenue');
    console.log('Remote verification passed.');
}

async function deleteTaggedAuthUsers(client, authUsers) {
    if (!authUsers.length) return;
    console.log(`Deleting ${authUsers.length} tagged Auth users...`);
    let deletedCount = 0;
    await mapWithConcurrency(authUsers, AUTH_CONCURRENCY, async (user) => {
        await runSupabase(
            `Delete Auth user ${user.email}`,
            () => client.auth.admin.deleteUser(user.id)
        );
        deletedCount += 1;
        if (deletedCount % 20 === 0 || deletedCount === authUsers.length) {
            console.log(`Deleted ${deletedCount}/${authUsers.length} Auth users.`);
        }
    });
}

async function runSelfTest() {
    const seed = DEFAULT_SEED;
    const anchorDateText = '2026-07-22';
    const dataset = buildDataset(
        createMockCustomers(seed),
        createMockProducts(seed),
        {
            seed,
            anchorDateText,
            anchorInstant: '2026-07-22T16:59:00.000Z'
        }
    );
    const summary = validateDataset(dataset);
    summary.anchorDate = anchorDateText;
    printSummary(summary, 'LOCAL SELF-TEST PASSED');
    console.log('\nNo network call or database write was performed.');
}

async function runPreview() {
    const config = readRemoteConfig({ requirePassword: false });
    const client = await createServerClient(config);
    await runSchemaPreflight(client);
    const products = await fetchProducts(client);
    const dataset = buildDataset(
        createMockCustomers(config.seed),
        products,
        {
            seed: config.seed,
            anchorDateText: config.anchorDateText,
            anchorInstant: config.anchorInstant
        }
    );
    const summary = validateDataset(dataset);
    summary.anchorDate = config.anchorDateText;
    printSummary(summary, `REMOTE PREVIEW FOR ${config.projectRef}`);
    console.log('\nPreview only: no Auth user or business row was created, updated or deleted.');
}

async function runCleanupOnly() {
    const config = readRemoteConfig({ requirePassword: false });
    const client = await createServerClient(config);
    await runSchemaPreflight(client);
    const specs = createCustomerSpecs(config.seed);
    const expectedEmailSet = new Set(specs.map((spec) => spec.email.toLowerCase()));
    const allAuthUsers = await listAllAuthUsers(client);
    const taggedUsers = getTaggedAuthUsers(allAuthUsers, expectedEmailSet);
    await cleanupBusinessData(client, taggedUsers.map((user) => user.id));

    if (flags.has('--delete-auth-users')) {
        await deleteTaggedAuthUsers(client, taggedUsers);
    }
    console.log('\nCleanup completed.');
}

async function runExecute() {
    const config = readRemoteConfig({ requirePassword: true });
    const client = await createServerClient(config);
    console.log(`Target project: ${config.projectRef}`);
    console.log(`Seed source   : ${SEED_SOURCE}`);
    console.log(`Anchor date   : ${config.anchorDateText}`);
    console.log('The service-role key will not be printed.');

    await runSchemaPreflight(client);
    const products = await fetchProducts(client);
    const specs = createCustomerSpecs(config.seed);

    const previewDataset = buildDataset(
        createMockCustomers(config.seed),
        products,
        {
            seed: config.seed,
            anchorDateText: config.anchorDateText,
            anchorInstant: config.anchorInstant
        }
    );
    const previewSummary = validateDataset(previewDataset);
    previewSummary.anchorDate = config.anchorDateText;
    printSummary(previewSummary, 'PRE-WRITE VALIDATION PASSED');

    const customers = await ensureAuthCustomers(
        client,
        specs,
        config.password,
        flags.has('--reset-passwords')
    );
    const dataset = buildDataset(
        customers,
        products,
        {
            seed: config.seed,
            anchorDateText: config.anchorDateText,
            anchorInstant: config.anchorInstant
        }
    );
    const summary = validateDataset(dataset);
    summary.anchorDate = config.anchorDateText;

    await cleanupBusinessData(client, customers.map((customer) => customer.id));
    await seedBusinessData(client, dataset);
    await verifyRemoteData(client, dataset);
    printSummary(summary, 'DEMO DATA SEED COMPLETED');
    console.log('\nCurrent product stock was intentionally left unchanged.');
    console.log('The dashboard may include additional real data already present in the project.');
}

async function main() {
    const allowedFlags = new Set([
        '--help', '-h', '--self-test', '--preview', '--execute',
        '--cleanup-only', '--delete-auth-users', '--reset-passwords'
    ]);
    const unknownFlags = argv.filter((argument) => !allowedFlags.has(argument));
    assert(!unknownFlags.length, `Unknown argument(s): ${unknownFlags.join(', ')}.`);

    if (flags.has('--help') || flags.has('-h')) {
        printHelp();
        return;
    }

    const modes = ['--self-test', '--preview', '--execute'].filter((flag) => flags.has(flag));
    assert(modes.length === 1, 'Choose exactly one mode: --self-test, --preview or --execute.');
    assert(!flags.has('--cleanup-only') || flags.has('--execute'), '--cleanup-only requires --execute.');
    assert(!flags.has('--delete-auth-users') || flags.has('--cleanup-only'), '--delete-auth-users requires --cleanup-only.');
    assert(
        !flags.has('--reset-passwords') || (flags.has('--execute') && !flags.has('--cleanup-only')),
        '--reset-passwords requires normal --execute mode.'
    );

    if (flags.has('--self-test')) {
        await runSelfTest();
    } else if (flags.has('--preview')) {
        await runPreview();
    } else if (flags.has('--cleanup-only')) {
        await runCleanupOnly();
    } else {
        await runExecute();
    }
}

main().catch((error) => {
    console.error(`\nFAILED: ${error.message}`);
    console.error('The script is rerunnable. Fix the cause and run the same command again.');
    process.exitCode = 1;
});
