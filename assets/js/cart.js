// ========== QUẢN LÝ GIỎ HÀNG BẰNG SUPABASE ==========

class ShoppingCart {
    constructor(supabaseClient = window.supabaseClient) {
        this.supabase = supabaseClient;
        this.user = null;
        this.cartId = null;
        this.cart = [];
        this.isReady = false;
        this.initializationError = null;

        // Các trang khác có thể await shopCart.ready trước khi đọc giỏ hàng.
        this.ready = this.initialize();
    }

    async initialize() {
        try {
            if (!this.supabase) {
                throw new Error('Không tìm thấy kết nối Supabase. Hãy tải supabase-config.js trước cart.js.');
            }

            const { data: authData, error: authError } = await this.supabase.auth.getUser();

            // Không có phiên đăng nhập là trạng thái hợp lệ; lỗi khác mới là lỗi khởi tạo.
            if (authError && authError.name !== 'AuthSessionMissingError') {
                throw authError;
            }

            this.user = authData?.user || null;
            this.cartId = null;
            this.cart = [];

            if (this.user) {
                const activeCart = await this.findActiveCart();

                if (activeCart) {
                    this.cartId = activeCart.id;
                    await this.loadItems();
                }
            }
        } catch (error) {
            this.initializationError = this.toCartError(
                error,
                'Không thể tải giỏ hàng từ database.'
            );
            console.error('Không thể khởi tạo giỏ hàng:', error);
        } finally {
            this.isReady = true;
            this.emitChange();
        }
    }

    async waitUntilReady() {
        await this.ready;

        if (this.initializationError) {
            throw this.initializationError;
        }

        return this;
    }

    isAuthenticated() {
        return Boolean(this.user);
    }

    async requireUser() {
        await this.waitUntilReady();

        if (!this.user) {
            const error = new Error('Vui lòng đăng nhập trước khi sử dụng giỏ hàng.');
            error.code = 'CART_AUTH_REQUIRED';
            throw error;
        }

        return this.user;
    }

    async findActiveCart() {
        const { data, error } = await this.supabase
            .from('carts')
            .select('id, user_id, status, created_at')
            .eq('user_id', this.user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (error) {
            throw this.toCartError(error, 'Không thể tìm giỏ hàng đang hoạt động.');
        }

        return data;
    }

    async ensureActiveCart() {
        await this.requireUser();

        if (this.cartId) {
            return this.cartId;
        }

        const existingCart = await this.findActiveCart();
        if (existingCart) {
            this.cartId = existingCart.id;
            return this.cartId;
        }

        const { data, error } = await this.supabase
            .from('carts')
            .insert({
                user_id: this.user.id,
                status: 'active'
            })
            .select('id')
            .single();

        if (error) {
            // Hai tab có thể đồng thời tạo giỏ. Tab thua unique constraint tải lại giỏ vừa tạo.
            if (error.code === '23505') {
                const concurrentCart = await this.findActiveCart();
                if (concurrentCart) {
                    this.cartId = concurrentCart.id;
                    return this.cartId;
                }
            }

            throw this.toCartError(error, 'Không thể tạo giỏ hàng mới.');
        }

        this.cartId = data.id;
        return this.cartId;
    }

    async loadItems() {
        if (!this.cartId) {
            this.cart = [];
            return this.cart;
        }

        const { data, error } = await this.supabase
            .from('cart_items')
            .select(`
                id,
                cart_id,
                product_id,
                quantity,
                created_at,
                products (
                    id,
                    sku,
                    name,
                    price,
                    image_urls,
                    stock,
                    status
                )
            `)
            .eq('cart_id', this.cartId)
            .order('created_at', { ascending: true });

        if (error) {
            throw this.toCartError(error, 'Không thể tải sản phẩm trong giỏ hàng.');
        }

        this.cart = (data || []).map(row => {
            const product = Array.isArray(row.products)
                ? row.products[0]
                : row.products;
            const stock = Number(product?.stock || 0);
            const quantity = Number(row.quantity || 1);

            return {
                // Giao diện cũ dùng item.id như product_id.
                id: row.product_id,
                productId: row.product_id,
                cartItemId: row.id,
                cartId: row.cart_id,
                name: product?.name || 'Sản phẩm không còn khả dụng',
                price: Number(product?.price || 0),
                quantity,
                image: Array.isArray(product?.image_urls) ? (product.image_urls[0] || '') : '',
                stock,
                status: product?.status || 'unavailable',
                available: Boolean(product && product.status === 'active' && stock > 0),
                hasEnoughStock: Boolean(product && stock >= quantity)
            };
        });

        return this.cart;
    }

    async refresh() {
        await this.requireUser();

        if (!this.cartId) {
            const activeCart = await this.findActiveCart();
            this.cartId = activeCart?.id || null;
        }

        await this.loadItems();
        this.emitChange();
        return this.getCart();
    }

    async getPurchasableProduct(productId) {
        const { data, error } = await this.supabase
            .from('products')
            .select('id, name, price, stock, status, image_urls')
            .eq('id', productId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) {
            throw this.toCartError(error, 'Không thể kiểm tra thông tin sản phẩm.');
        }

        if (!data || Number(data.stock) <= 0) {
            const unavailableError = new Error('Sản phẩm đã hết hàng hoặc không còn được bán.');
            unavailableError.code = 'PRODUCT_UNAVAILABLE';
            throw unavailableError;
        }

        return data;
    }

    async addProduct(product) {
        await this.requireUser();

        const productId = String(product?.id || '').trim();
        if (!this.isUuid(productId)) {
            const invalidProductError = new Error('Sản phẩm không có UUID hợp lệ trong database.');
            invalidProductError.code = 'INVALID_PRODUCT_ID';
            throw invalidProductError;
        }

        const requestedQuantity = Math.max(1, Number.parseInt(product.quantity, 10) || 1);
        const databaseProduct = await this.getPurchasableProduct(productId);
        const cartId = await this.ensureActiveCart();

        const { data: currentItem, error: readError } = await this.supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .maybeSingle();

        if (readError) {
            throw this.toCartError(readError, 'Không thể kiểm tra sản phẩm trong giỏ hàng.');
        }

        const nextQuantity = Number(currentItem?.quantity || 0) + requestedQuantity;
        this.assertStock(databaseProduct, nextQuantity);

        let mutationError = null;

        if (currentItem) {
            const { error } = await this.supabase
                .from('cart_items')
                .update({ quantity: nextQuantity })
                .eq('id', currentItem.id)
                .eq('cart_id', cartId);

            mutationError = error;
        } else {
            const { error } = await this.supabase
                .from('cart_items')
                .insert({
                    cart_id: cartId,
                    product_id: productId,
                    quantity: requestedQuantity
                });

            mutationError = error;

            // Nếu tab khác vừa thêm cùng sản phẩm, tải số lượng mới rồi thử cập nhật một lần.
            if (mutationError?.code === '23505') {
                const { data: concurrentItem, error: concurrentReadError } = await this.supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('cart_id', cartId)
                    .eq('product_id', productId)
                    .single();

                if (concurrentReadError) {
                    throw this.toCartError(concurrentReadError, 'Không thể đồng bộ sản phẩm trong giỏ hàng.');
                }

                const concurrentQuantity = Number(concurrentItem.quantity) + requestedQuantity;
                this.assertStock(databaseProduct, concurrentQuantity);

                const { error: retryError } = await this.supabase
                    .from('cart_items')
                    .update({ quantity: concurrentQuantity })
                    .eq('id', concurrentItem.id)
                    .eq('cart_id', cartId);

                mutationError = retryError;
            }
        }

        if (mutationError) {
            throw this.toCartError(mutationError, 'Không thể thêm sản phẩm vào giỏ hàng.');
        }

        await this.loadItems();
        this.emitChange();
        return this.cart.find(item => item.productId === productId) || null;
    }

    async updateQuantity(productId, quantity) {
        await this.requireUser();

        const normalizedQuantity = Number.parseInt(quantity, 10);
        if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
            throw new Error('Số lượng sản phẩm phải là số nguyên lớn hơn 0.');
        }

        const item = this.cart.find(cartItem => cartItem.productId === productId);
        if (!item) {
            throw new Error('Không tìm thấy sản phẩm trong giỏ hàng.');
        }

        const databaseProduct = await this.getPurchasableProduct(productId);
        this.assertStock(databaseProduct, normalizedQuantity);

        const { error } = await this.supabase
            .from('cart_items')
            .update({ quantity: normalizedQuantity })
            .eq('id', item.cartItemId)
            .eq('cart_id', this.cartId);

        if (error) {
            throw this.toCartError(error, 'Không thể cập nhật số lượng sản phẩm.');
        }

        await this.loadItems();
        this.emitChange();
        return true;
    }

    async removeProduct(productId) {
        await this.requireUser();

        const item = this.cart.find(cartItem => cartItem.productId === productId);
        if (!item) {
            return false;
        }

        const { error } = await this.supabase
            .from('cart_items')
            .delete()
            .eq('id', item.cartItemId)
            .eq('cart_id', this.cartId);

        if (error) {
            throw this.toCartError(error, 'Không thể xóa sản phẩm khỏi giỏ hàng.');
        }

        await this.loadItems();
        this.emitChange();
        return true;
    }

    async clearCart() {
        await this.requireUser();

        if (!this.cartId) {
            return true;
        }

        const { error } = await this.supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', this.cartId);

        if (error) {
            throw this.toCartError(error, 'Không thể làm trống giỏ hàng.');
        }

        this.cart = [];
        this.emitChange();
        return true;
    }

    getTotal() {
        return this.cart.reduce(
            (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
            0
        );
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + Number(item.quantity), 0);
    }

    getCart() {
        return this.cart.map(item => ({ ...item }));
    }

    getCartId() {
        return this.cartId;
    }

    getInitializationError() {
        return this.initializationError;
    }

    assertStock(product, quantity) {
        if (quantity > Number(product.stock)) {
            const stockError = new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho.`);
            stockError.code = 'INSUFFICIENT_STOCK';
            throw stockError;
        }
    }

    isUuid(value) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    toCartError(error, fallbackMessage) {
        let message = error?.message || fallbackMessage;

        if (error?.code === '23503') {
            message = 'Tài khoản chưa có hồ sơ trong public.users. Hãy chạy database/sync-auth-users.sql.';
        } else if (error?.code === '42501') {
            message = 'Bạn không có quyền thao tác với giỏ hàng này.';
        }

        const cartError = new Error(message);
        cartError.code = error?.code || 'CART_DATABASE_ERROR';
        cartError.cause = error;
        return cartError;
    }

    emitChange() {
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                cartId: this.cartId,
                itemCount: this.getItemCount(),
                total: this.getTotal(),
                authenticated: this.isAuthenticated()
            }
        }));
    }
}

window.ShoppingCart = ShoppingCart;
window.shopCart = new ShoppingCart();
