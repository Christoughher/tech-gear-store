const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

global.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
    }
};

global.window = {
    dispatchEvent() {},
    supabaseClient: {
        auth: {
            async getUser() {
                return {
                    data: { user: null },
                    error: { name: 'AuthSessionMissingError' }
                };
            }
        }
    }
};

const cartSource = fs.readFileSync(
    path.join(__dirname, '..', 'assets', 'js', 'cart.js'),
    'utf8'
);
vm.runInThisContext(cartSource, { filename: 'assets/js/cart.js' });

const USER_ID = '11111111-1111-4111-8111-111111111111';
const CART_ID = '22222222-2222-4222-8222-222222222222';
const ORDER_ID = '33333333-3333-4333-8333-333333333333';
const PRODUCT_ID = '44444444-4444-4444-8444-444444444444';

function makeResultQuery(result) {
    const query = {
        select() {
            return query;
        },
        eq() {
            return query;
        },
        maybeSingle() {
            return Promise.resolve(result);
        },
        then(resolve, reject) {
            return Promise.resolve(result).then(resolve, reject);
        }
    };

    return query;
}

function makeClient({
    rpcResult,
    totalPrice = 200000,
    cartStatus = 'checked_out',
    orderItemProductId = PRODUCT_ID
}) {
    const calls = [];
    const client = {
        calls,
        auth: {
            async getUser() {
                return {
                    data: { user: null },
                    error: { name: 'AuthSessionMissingError' }
                };
            }
        },
        async rpc(name, args) {
            calls.push({ name, args });
            return rpcResult;
        },
        from(table) {
            calls.push({ table });

            if (table === 'orders') {
                return makeResultQuery({
                    data: {
                        id: ORDER_ID,
                        cart_id: CART_ID,
                        user_id: USER_ID,
                        total_price: totalPrice,
                        status: 'pending',
                        shipping_method: 'Tiêu chuẩn',
                        created_at: '2026-07-24T00:00:00.000Z'
                    },
                    error: null
                });
            }

            if (table === 'order_items') {
                return makeResultQuery({
                    data: [{
                        id: '55555555-5555-4555-8555-555555555555',
                        product_id: orderItemProductId,
                        quantity: 2,
                        price_at_purchase: 100000
                    }],
                    error: null
                });
            }

            if (table === 'carts') {
                return makeResultQuery({
                    data: {
                        id: CART_ID,
                        status: cartStatus,
                        checked_out_at: cartStatus === 'checked_out'
                            ? '2026-07-24T00:00:01.000Z'
                            : null
                    },
                    error: null
                });
            }

            throw new Error(`Unexpected table: ${table}`);
        }
    };

    return client;
}

async function makeReadyCart(client) {
    const cart = new window.ShoppingCart(client);
    await cart.ready;
    cart.user = { id: USER_ID };
    cart.cartId = CART_ID;
    cart.cart = [{
        id: PRODUCT_ID,
        productId: PRODUCT_ID,
        name: 'Sản phẩm kiểm thử',
        price: 100000,
        quantity: 2,
        stock: 10,
        available: true,
        hasEnoughStock: true
    }];

    cart.requireUser = async () => cart.user;
    cart.loadItems = async () => cart.cart;
    return cart;
}

async function testSuccessfulCheckout() {
    const client = makeClient({
        rpcResult: { data: ORDER_ID, error: null }
    });
    const cart = await makeReadyCart(client);

    const order = await cart.checkout({
        receiverName: 'Nguyễn Văn A',
        receiverPhone: '0901234567',
        shippingAddress: '123 Đường Kiểm Thử'
    });

    assert.equal(order.id, ORDER_ID);
    assert.equal(order.itemCount, 1);
    assert.equal(cart.cartId, null);
    assert.deepEqual(cart.cart, []);

    const rpcCalls = client.calls.filter(call => call.name === 'checkout_cart');
    assert.equal(rpcCalls.length, 1);
    assert.equal(rpcCalls[0].args.p_cart_id, CART_ID);
    assert.equal(rpcCalls[0].args.p_shipping_method, 'Tiêu chuẩn');
}

async function testRpcFailurePreservesCart() {
    const client = makeClient({
        rpcResult: {
            data: null,
            error: {
                code: 'P0001',
                message: 'Cart contains an unavailable or insufficient-stock product'
            }
        }
    });
    const cart = await makeReadyCart(client);

    await assert.rejects(
        cart.checkout({
            receiverName: 'Nguyễn Văn A',
            receiverPhone: '0901234567',
            shippingAddress: '123 Đường Kiểm Thử'
        }),
        /hết hàng|đủ số lượng/
    );

    assert.equal(cart.cartId, CART_ID);
    assert.equal(cart.cart.length, 1);
}

async function testVerificationFailurePreservesCart() {
    const client = makeClient({
        rpcResult: { data: ORDER_ID, error: null },
        totalPrice: 199999
    });
    const cart = await makeReadyCart(client);

    await assert.rejects(
        cart.checkout({
            receiverName: 'Nguyễn Văn A',
            receiverPhone: '0901234567',
            shippingAddress: '123 Đường Kiểm Thử'
        }),
        error => error.code === 'CHECKOUT_TOTAL_MISMATCH'
    );

    assert.equal(cart.cartId, CART_ID);
    assert.equal(cart.cart.length, 1);
}

async function testRetryLetsDatabaseResolveExistingOrder() {
    const client = makeClient({
        rpcResult: { data: ORDER_ID, error: null }
    });
    const cart = await makeReadyCart(client);

    // Sau lần checkout đã commit, tồn kho mới có thể khiến snapshot cart cũ
    // trông như không còn mua được. Retry vẫn phải gọi RPC theo cart_id.
    cart.cart[0].available = false;
    cart.cart[0].hasEnoughStock = false;

    const order = await cart.checkout({
        receiverName: 'Nguyễn Văn A',
        receiverPhone: '0901234567',
        shippingAddress: '123 Đường Kiểm Thử'
    });

    assert.equal(order.id, ORDER_ID);
    assert.equal(client.calls.filter(call => call.name === 'checkout_cart').length, 1);
}

async function testOrderItemMismatchPreservesCart() {
    const client = makeClient({
        rpcResult: { data: ORDER_ID, error: null },
        orderItemProductId: '66666666-6666-4666-8666-666666666666'
    });
    const cart = await makeReadyCart(client);

    await assert.rejects(
        cart.checkout({
            receiverName: 'Nguyễn Văn A',
            receiverPhone: '0901234567',
            shippingAddress: '123 Đường Kiểm Thử'
        }),
        error => error.code === 'CHECKOUT_ITEMS_MISMATCH'
    );

    assert.equal(cart.cartId, CART_ID);
    assert.equal(cart.cart.length, 1);
}

async function main() {
    await window.shopCart.ready;
    await testSuccessfulCheckout();
    await testRpcFailurePreservesCart();
    await testVerificationFailurePreservesCart();
    await testRetryLetsDatabaseResolveExistingOrder();
    await testOrderItemMismatchPreservesCart();
    console.log('checkout-flow: 5 tests passed');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
