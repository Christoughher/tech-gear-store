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

// =========================================================================
// XỬ LÝ PHÂN QUYỀN HIỂN THỊ TRÊN NAVBAR KHI COMPONENT ĐÃ LOAD XONG
// =========================================================================

window.addEventListener('navbarLoaded', async () => {
    // 1. Truy cập vào các phần tử HTML cần can thiệp trên navbar vừa nạp
    const adminNavLink = document.getElementById('admin-nav-link');
    const authStatusContainer = document.getElementById('auth-status');
    
    // Nếu không tìm thấy phần tử admin-nav-link trên giao diện thì dừng xử lý ngay lập tức
    if (!adminNavLink) {
        return;
    }

    try {
        // Sử dụng chính xác thực thể kết nối bạn đã gán vào window tại file supabase-config.js
        const thucTheSupabaseActive = window.supabaseClient;

        // Kiểm tra phòng hờ trường hợp file supabase-config.js chưa kịp tải xong hoặc bị lỗi
        if (!thucTheSupabaseActive || !thucTheSupabaseActive.auth) {
            console.error("Hệ thống không tìm thấy thực thể 'window.supabaseClient' hợp lệ. Hãy kiểm tra lại thứ tự nhúng file script trong HTML!");
            adminNavLink.style.display = 'none';
            return;
        }

        // 2. Gọi API Supabase lấy thông tin phiên đăng nhập (Session) hiện tại của người dùng từ thực thể chuẩn
        const { data: { session }, error: sessionError } = await thucTheSupabaseActive.auth.getSession();
        
        if (sessionError) {
            console.error("Gặp lỗi trong quá trình lấy Session từ hệ thống Auth:", sessionError.message);
            adminNavLink.style.display = 'none';
            return;
        }

        // 3. TRƯỜNG HỢP 1: Người dùng CHƯA ĐĂNG NHẬP (Không có session)
        if (!session || !session.user) {
            console.log("Hệ thống nhận diện: Khách vãng lai (Chưa đăng nhập).");
            adminNavLink.style.display = 'none'; // Bảo đảm nút Admin luôn ẩn
            
            // Đảm bảo trạng thái hiển thị nút đăng nhập nguyên bản
            if (authStatusContainer) {
                authStatusContainer.innerHTML = '<a href="../pages/login.html" class="login-btn">Đăng nhập</a>';
            }
            return;
        }

        // Nếu có session, lấy thông tin user cơ bản từ cổng Auth
        const currentLoggedInUser = session.user;

        // 4. TRƯỜNG HỢP 2: Đã đăng nhập -> Cần truy vấn bảng public.users để lấy quyền hạn (role) thực tế
        // Thực hiện thay đổi trường select từ 'full_name' thành 'display_name' bám sát theo database thực tế
        const { data: userProfile, error: profileError } = await thucTheSupabaseActive
            .from('users')
            .select('role, display_name')
            .eq('id', currentLoggedInUser.id)
            .single(); // Lấy duy nhất một bản ghi tương thích từ bảng dữ liệu người dùng

        if (profileError) {
            console.error("Không thể lấy dữ quyền hạn từ bảng public.users:", profileError.message);
            adminNavLink.style.display = 'none';
            return;
        }

        // 5. Kiểm tra giá trị cột role từ cơ sở dữ liệu đổ về để quyết định ẩn/hiện nút Admin công khai
        if (userProfile && userProfile.role === 'admin') {
            console.log("Xác thực thành công: Người dùng hiện tại có quyền hạn Admin!");
            adminNavLink.style.display = 'list-item'; // Cho phép hiển thị nút Admin trên thanh Menu
        } else {
            console.log("Xác thực: Tài khoản này là khách hàng thành viên (customer), ẩn nút Admin.");
            adminNavLink.style.display = 'none'; // Người dùng thông thường không được thấy nút này
        }

        // 6. TIỆN ÍCH BỔ SUNG: Thay đổi nút "Đăng nhập" thành Tên Admin/User kèm nút Đăng xuất trực quan
        if (authStatusContainer && userProfile) {
            // Lắng nghe sự kiện click chuột vào nút Đăng xuất vừa tạo mới ngầm bằng JS
            const btnLogout = document.getElementById('navbar-btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', async (event) => {
                    event.preventDefault(); // Chặn hành vi cuộn trang lên đầu của thẻ 'a' mặc định
                    
                    const xácNhận = confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Tech.no?");
                    if (xácNhận) {
                        const { error: signOutError } = await thucTheSupabaseActive.auth.signOut();
                        if (!signOutError) {
                            alert("Bạn đã đăng xuất tài khoản thành công!");
                            // Điều hướng toàn bộ trang web quay trở về trang chủ index để cập nhật lại trạng thái
                            window.location.href = window.location.origin + "/index.html";
                        } else {
                            alert("Hệ thống gặp lỗi khi đăng xuất: " + signOutError.message);
                        }
                    }
                });
            }
        }

    } catch (criticalError) {
        console.error("Hệ thống lỗi phân quyền toàn cục gặp sự cố nghiêm trọng:", criticalError);
        adminNavLink.style.display = 'none';
    }
});
 