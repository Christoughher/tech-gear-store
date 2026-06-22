const brandData = {
    laptop: ['asus', 'hp', 'dell', 'acer', 'macbook', 'lenovo', 'msi', 'gigabyte'],
    phone: ['iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo'],
    pc: ['msi', 'gigabyte'],
    watch: ['casio', 'g-shock', 'citizen', 'baby-g', 'nakzen', 'lacoste', 'ferrari'],
    phukien: ['airpods', 'loa', 'camera', 'sạc'] 
};

const brandContainer = document.getElementById('brand-filter-container');

document.querySelectorAll('.btn-cat').forEach(button => {
    button.addEventListener('click', (e) => {
        // Cập nhật trạng thái active cho nút danh mục
        document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const cat = e.target.getAttribute('data-cat');
        renderBrands(cat);
    });
});

function renderBrands(category) {
    brandContainer.innerHTML = ''; 
    const brands = brandData[category] || [];

    if (brands.length === 0) return;

    // Render các nút logo
    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'btn-brand';

        const imagePath = `assets/images/brand-logo/${category}/${brand}.png`;
        btn.innerHTML = `<img src="${imagePath}" alt="${brand}" 
                            onerror="this.style.display='none'; this.nextSibling.textContent='${brand.toUpperCase()}'">
                         <span></span>`;
        brandContainer.appendChild(btn);
    });

    // Tạo nút đóng "X"
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close-filter';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    
    closeBtn.addEventListener('click', () => {
        brandContainer.innerHTML = '';
        document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
    });
    
    brandContainer.appendChild(closeBtn);
}

const stars = document.querySelectorAll('.stars i');
const ratingInput = document.getElementById('rating-value');

stars.forEach(star => {
    star.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        ratingInput.value = value;  /* ratingInput sẽ được gửi lên backend */

        stars.forEach(s => s.classList.remove('selected'));  /* xóa class 'selected' cũ */

        this.classList.add('selected');   /* thêm class 'selected' mới vào ptử đang chọn */
        let nextSibling = this.nextElementSibling;
        while (nextSibling) {
            nextSibling.classList.add('selected');
            nextSibling = nextSibling.nextElementSibling;
        }
    });
});

// Hàm để load một file HTML vào một phần tử có ID cho trước
async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (element) {
        try {
            const response = await fetch(window.location.origin + '/components/' + file);
            const data = await response.text();
            element.innerHTML = data;
            // NẾU ĐÃ LOAD XONG NAVBAR, THÌ GỌI HÀM KIỂM TRA ĐĂNG NHẬP
            if (file === 'navbar.html') {
                console.log("Navbar đã được nạp, đang phát tín hiệu 'navbarLoaded'...");
                const event = new CustomEvent('navbarLoaded');
                window.dispatchEvent(event);  
            }
        } catch (error) {
            console.error(`Lỗi khi load component ${file}:`, error);
        }
    }
}

// ========== XỬ LÝ GIỎ HÀNG ==========

// Thêm sản phẩm vào giỏ hàng
function setupAddToCartButtons() {
    document.querySelectorAll('.btn-cart').forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Lấy thông tin sản phẩm từ card
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseInt(productCard.querySelector('.product-price').textContent.replace(/\D/g, ''));

            // Tạo ID sản phẩm duy nhất (có thể kết hợp tên + giá)
            const productId = productName.toLowerCase().replace(/\s+/g, '-') + '-' + index;

            // Thêm vào giỏ hàng
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            };

            shopCart.addProduct(product);

            // Hiển thị thông báo
            showNotification(`✓ Đã thêm "${productName}" vào giỏ hàng!`);
        });
    });
}

// Hiển thị thông báo khi thêm sản phẩm
function showNotification(message) {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-container', 'navbar.html'); 
    loadComponent('pagination-container', 'pagination.html'); 
    loadComponent('footer-container', 'footer.html'); 
    loadComponent('admin-sidebar-container', 'admin-sidebar.html');
    
    // Thiết lập sự kiện cho nút "Thêm giỏ"
    setupAddToCartButtons();
});

function focusOnSearchBar() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

 