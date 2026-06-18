// ========== QUẢN LÝ GIỎ HÀNG ==========

class ShoppingCart {
    constructor() {
        this.storageKey = 'techno_cart';
        this.cart = this.loadCart();
    }

    // Lấy giỏ hàng từ localStorage
    loadCart() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Lưu giỏ hàng vào localStorage
    saveCart() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    }

    // Thêm sản phẩm vào giỏ hàng
    addProduct(product) {
        // Kiểm tra sản phẩm đã tồn tại trong giỏ
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            // Nếu đã có, tăng số lượng
            existingItem.quantity += product.quantity || 1;
        } else {
            // Nếu chưa có, thêm mới
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity || 1,
                image: product.image || ''
            });
        }

        this.saveCart();
        return true;
    }

    // Cập nhật số lượng sản phẩm
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity); // Tối thiểu 1 sản phẩm
            this.saveCart();
            return true;
        }
        return false;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Xóa toàn bộ giỏ hàng
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Lấy tổng tiền
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Lấy số lượng sản phẩm
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Lấy dữ liệu giỏ hàng
    getCart() {
        return this.cart;
    }
}

// Tạo instance giỏ hàng toàn cầu
const shopCart = new ShoppingCart();
