const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const frontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'profile-orders.js'),
    'utf8'
);
const migration = fs.readFileSync(
    path.join(__dirname, 'enable-user-order-management.sql'),
    'utf8'
);
const checkoutMigration = fs.readFileSync(
    path.join(__dirname, 'add-shipping-method.sql'),
    'utf8'
);
const adminFrontend = fs.readFileSync(
    path.join(root, 'assets', 'js', 'admin-management.js'),
    'utf8'
);

assert.match(
    frontend,
    /order\.status === 'pending' && Boolean\(order\.inventory_deducted_at\)/,
    'Cancel button must require pending status and a verified inventory deduction.'
);
assert.match(
    frontend,
    /\.rpc\('cancel_pending_order',\s*\{\s*p_order_id: order\.id/s,
    'Frontend must cancel through the atomic RPC.'
);
assert.match(
    frontend,
    /\.eq\('user_id', state\.user\.id\)/,
    'Order list/detail must explicitly scope rows to the signed-in user.'
);
assert.match(
    frontend,
    /\.from\('order_items'\)/,
    'Order details must use immutable order_items snapshots.'
);
assert.doesNotMatch(
    frontend,
    /\.from\('products'\)/,
    'Order history must not depend on current product visibility or pricing.'
);
assert.doesNotMatch(
    frontend,
    /\.from\('orders'\)[\s\S]{0,180}\.update\(/,
    'Frontend must not update orders directly.'
);

assert.match(
    migration,
    /inventory_deducted_at IS NULL[\s\S]+Cannot cancel: inventory deduction/s,
    'Database must reject cancellation when stock deduction cannot be verified.'
);
assert.match(
    migration,
    /OLD\.status = 'pending' AND NEW\.status = 'cancelled'/,
    'State machine must own the cancellation transition.'
);
assert.match(
    migration,
    /OLD\.status = 'pending' AND NEW\.status = 'processing'/,
    'State machine must support pending to processing.'
);
assert.match(
    migration,
    /OLD\.status = 'processing' AND NEW\.status = 'completed'/,
    'State machine must support processing to completed.'
);
assert.match(
    migration,
    /REVOKE INSERT, DELETE ON public\.orders FROM PUBLIC, anon, authenticated/,
    'Authenticated clients must not insert or delete orders.'
);
assert.match(
    migration,
    /REVOKE UPDATE \(status, note\) ON public\.orders FROM authenticated/,
    'Authenticated clients must not update order status directly.'
);
assert.match(
    migration,
    /IF NOT public\.is_admin\(\)[\s\S]+current_order_status IS DISTINCT FROM p_expected_status[\s\S]+WHEN 'pending' THEN 'processing'[\s\S]+WHEN 'processing' THEN 'completed'/,
    'Admin transition RPC must verify the admin role, expected state and allowed progression.'
);
assert.match(
    adminFrontend,
    /\.rpc\('advance_order_status',\s*\{[\s\S]+p_order_id: order\.id,[\s\S]+p_expected_status: order\.status/s,
    'Admin order actions must use the guarded status-transition RPC.'
);
assert.match(
    checkoutMigration,
    /inventory_deducted_at[\s\S]+statement_timestamp\(\)/,
    'Checkout migration must mark inventory deduction in the checkout transaction.'
);

console.log('profile-order-contract: 15 tests passed');
