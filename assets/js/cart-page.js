// ========== GIAO DIỆN TRANG GIỎ HÀNG ==========

function formatCartCurrency(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
}

function escapeCartHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function showCartEmptyState(message, linkText, href) {
    const emptyMessage = document.getElementById('empty-cart-message');
    const messageElement = emptyMessage.querySelector('p');
    const linkElement = emptyMessage.querySelector('a');

    messageElement.textContent = message;
    linkElement.textContent = linkText;
    linkElement.href = href;
    emptyMessage.style.display = 'block';
    document.getElementById('cart-summary-section').style.display = 'none';
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary-section');

    container.innerHTML = '';

    if (!window.shopCart?.isReady) {
        showCartEmptyState('Đang tải giỏ hàng...', 'Tiếp tục mua sắm', '../index.html');
        return;
    }

    const initializationError = window.shopCart.getInitializationError();
    if (initializationError) {
        showCartEmptyState(
            `Không thể tải giỏ hàng: ${initializationError.message}`,
            'Tải lại trang',
            window.location.href
        );
        return;
    }

    if (!window.shopCart.isAuthenticated()) {
        showCartEmptyState(
            'Bạn cần đăng nhập để xem và lưu giỏ hàng.',
            'Đăng nhập',
            '/pages/login.html'
        );
        return;
    }

    const cartItems = window.shopCart.getCart();
    if (cartItems.length === 0) {
        showCartEmptyState('Giỏ hàng của bạn trống', 'Tiếp tục mua sắm', '../index.html');
        return;
    }

    emptyMessage.style.display = 'none';
    cartSummary.style.display = 'block';

    cartItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';

        const itemTotal = item.price * item.quantity;
        const itemImage = item.image || '../assets/images/products/default-product.png';
        const unavailableText = !item.available
            ? '<div class="item-stock-warning">Sản phẩm không còn khả dụng</div>'
            : (!item.hasEnoughStock
                ? `<div class="item-stock-warning">Kho chỉ còn ${escapeCartHtml(item.stock)} sản phẩm</div>`
                : '');
        const quantityDisabled = item.available ? '' : 'disabled';

        itemElement.innerHTML = `
            <div class="item-image">
                <img
                    src="${escapeCartHtml(itemImage)}"
                    alt="${escapeCartHtml(item.name)}"
                    onerror="this.src='../assets/images/products/default-product.png'"
                >
            </div>

            <div class="item-details">
                <div class="item-name">${escapeCartHtml(item.name)}</div>
                <div class="item-price">${formatCartCurrency(item.price)}</div>
                ${unavailableText}
            </div>

            <div class="item-quantity">
                <button class="qty-btn qty-minus" data-product-id="${escapeCartHtml(item.productId)}" ${quantityDisabled}>−</button>
                <input
                    type="number"
                    value="${escapeCartHtml(item.quantity)}"
                    min="1"
                    max="${escapeCartHtml(Math.max(1, item.stock))}"
                    data-product-id="${escapeCartHtml(item.productId)}"
                    ${quantityDisabled}
                >
                <button class="qty-btn qty-plus" data-product-id="${escapeCartHtml(item.productId)}" ${quantityDisabled}>+</button>
            </div>

            <div class="item-total">${formatCartCurrency(itemTotal)}</div>

            <button class="item-remove" data-product-id="${escapeCartHtml(item.productId)}" title="Xóa">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        container.appendChild(itemElement);
    });

    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = window.shopCart.getTotal();
    const shipping = subtotal === 0 || subtotal > 1000000 ? 0 : 30000;
    const total = subtotal + shipping;
    const cartItems = window.shopCart.getCart();
    const canCheckout = cartItems.length > 0
        && cartItems.every(item => item.available && item.hasEnoughStock);
    const checkoutButton = document.getElementById('checkout-btn');

    document.getElementById('subtotal-price').textContent = formatCartCurrency(subtotal);
    document.getElementById('shipping-price').textContent = shipping === 0
        ? 'Miễn phí'
        : formatCartCurrency(shipping);
    document.getElementById('total-price').textContent = formatCartCurrency(total);
    checkoutButton.disabled = !canCheckout;
    checkoutButton.title = canCheckout
        ? ''
        : 'Hãy xóa hoặc điều chỉnh các sản phẩm không còn đủ hàng.';
}

function setCartControlsDisabled(disabled) {
    document.querySelectorAll('.qty-btn, .item-quantity input, .item-remove').forEach(control => {
        control.disabled = disabled;
    });
}

async function runCartMutation(mutation) {
    setCartControlsDisabled(true);

    try {
        await mutation();
    } catch (error) {
        console.error('Không thể cập nhật giỏ hàng:', error);
        alert(error.message || 'Không thể cập nhật giỏ hàng.');
    } finally {
        setCartControlsDisabled(false);
        renderCart();
    }
}

function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal-overlay');
    if (!modal) return;

    modal.hidden = false;
    const firstField = modal.querySelector('input[name="fullName"]');
    firstField?.focus();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal-overlay');
    const form = document.getElementById('checkout-form');
    if (!modal) return;

    modal.hidden = true;
    form?.reset();
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('cart-items-container');
    const checkoutButton = document.getElementById('checkout-btn');
    const modal = document.getElementById('checkout-modal-overlay');
    const closeButton = document.getElementById('checkout-modal-close');
    const cancelButton = document.getElementById('checkout-cancel-btn');
    const form = document.getElementById('checkout-form');

    renderCart();
    await window.shopCart.ready;
    renderCart();

    window.addEventListener('cartUpdated', renderCart);

    container.addEventListener('click', async event => {
        const button = event.target.closest('button[data-product-id]');
        if (!button) return;

        const productId = button.dataset.productId;
        const input = container.querySelector(`input[data-product-id="${productId}"]`);
        const currentQuantity = Number.parseInt(input?.value, 10) || 1;

        if (button.classList.contains('qty-plus')) {
            await runCartMutation(() => window.shopCart.updateQuantity(productId, currentQuantity + 1));
        } else if (button.classList.contains('qty-minus') && currentQuantity > 1) {
            await runCartMutation(() => window.shopCart.updateQuantity(productId, currentQuantity - 1));
        } else if (button.classList.contains('item-remove')) {
            await runCartMutation(() => window.shopCart.removeProduct(productId));
        }
    });

    container.addEventListener('change', async event => {
        const input = event.target.closest('.item-quantity input[data-product-id]');
        if (!input) return;

        const productId = input.dataset.productId;
        const quantity = Number.parseInt(input.value, 10);
        await runCartMutation(() => window.shopCart.updateQuantity(productId, quantity));
    });

    checkoutButton.addEventListener('click', () => {
        if (checkoutButton.disabled) return;
        openCheckoutModal();
    });

    closeButton?.addEventListener('click', closeCheckoutModal);
    cancelButton?.addEventListener('click', closeCheckoutModal);

    modal?.addEventListener('click', event => {
        if (event.target === modal) {
            closeCheckoutModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal && modal.hidden === false) {
            closeCheckoutModal();
        }
    });

    form?.addEventListener('submit', event => {
        event.preventDefault();
        alert('Bạn đã đặt hàng thành công !');
        closeCheckoutModal();
    });
});
