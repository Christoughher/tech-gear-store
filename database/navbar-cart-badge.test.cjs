const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.join(__dirname, '..');
const navbar = fs.readFileSync(
    path.join(projectRoot, 'components', 'navbar.html'),
    'utf8'
);
const styles = fs.readFileSync(
    path.join(projectRoot, 'assets', 'css', 'style.css'),
    'utf8'
);
const loginPage = fs.readFileSync(
    path.join(projectRoot, 'pages', 'login.html'),
    'utf8'
);
const profilePage = fs.readFileSync(
    path.join(projectRoot, 'pages', 'profile.html'),
    'utf8'
);

assert.match(navbar, /data-cart-nav-link/, 'Navbar must expose the cart link hook.');
assert.match(navbar, /data-cart-count[\s\S]*?hidden/, 'Cart badge must start hidden.');
assert.match(styles, /\.nav-cart-badge\s*\{[\s\S]*?background:\s*#ef233c/, 'Badge must be red.');
assert.match(styles, /\.nav-cart-badge\[hidden\]\s*\{[\s\S]*?display:\s*none/, 'Empty badge must be hidden.');
assert.match(loginPage, /<script src="\/assets\/js\/cart\.js"><\/script>/, 'Login page must load cart state.');
assert.match(profilePage, /<script src="\/assets\/js\/cart\.js"><\/script>/, 'Profile page must load cart state.');

const badge = {
    hidden: true,
    textContent: '0'
};
const cartLinkAttributes = new Map();
const cartLinkClasses = new Set();
const cartLink = {
    classList: {
        toggle(className, force) {
            if (force) cartLinkClasses.add(className);
            else cartLinkClasses.delete(className);
        }
    },
    setAttribute(name, value) {
        cartLinkAttributes.set(name, value);
    }
};
const listeners = new Map();

global.document = {
    querySelector(selector) {
        if (selector === '[data-cart-nav-link]') return cartLink;
        if (selector === '[data-cart-count]') return badge;
        return null;
    }
};
global.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
    }
};
global.window = {
    addEventListener(type, listener) {
        const eventListeners = listeners.get(type) || [];
        eventListeners.push(listener);
        listeners.set(type, eventListeners);
    },
    dispatchEvent(event) {
        (listeners.get(event.type) || []).forEach(listener => listener(event));
    },
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
    path.join(projectRoot, 'assets', 'js', 'cart.js'),
    'utf8'
);
vm.runInThisContext(cartSource, { filename: 'assets/js/cart.js' });

async function main() {
    await window.shopCart.ready;

    window.updateNavbarCartBadge(3);
    assert.equal(badge.hidden, false);
    assert.equal(badge.textContent, '3');
    assert.equal(cartLinkClasses.has('has-items'), true);
    assert.equal(cartLinkAttributes.get('aria-label'), 'Giỏ hàng, 3 sản phẩm');

    window.updateNavbarCartBadge(0);
    assert.equal(badge.hidden, true);
    assert.equal(badge.textContent, '0');
    assert.equal(cartLinkClasses.has('has-items'), false);
    assert.equal(cartLinkAttributes.get('aria-label'), 'Giỏ hàng');

    console.log('navbar-cart-badge: quantity badge and empty state passed');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
