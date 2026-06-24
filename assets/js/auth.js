document.addEventListener('DOMContentLoaded', () => {
    // 1. Xử lý chuyển đổi form Login/Register (chỉ chạy ở trang login.html)
    const loginBox = document.getElementById('login-box');
    const registerBox = document.getElementById('register-box');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    if (showRegister && showLogin && loginBox && registerBox) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }

    // 2. Xử lý Form Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                alert('Đăng nhập thất bại: ' + error.message);
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/index.html';
            }
        });
    }

    // 3. Xử lý Form Đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const fullname = document.getElementById('register-fullname').value;

            if (password !== confirmPassword) {
                alert('Mật khẩu không khớp!');
                return;
            }

            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: { data: { full_name: fullname } }
            });

            if (error) {
                alert('Đăng ký thất bại: ' + error.message);
            } else {
                alert('Đăng ký thành công!');
                document.getElementById('register-box').style.display = 'none';
                document.getElementById('login-box').style.display = 'block';
            }
        });
    }

    // Kiểm tra Auth ban đầu
    checkAuth();
    
    // Kiểm tra navbar nếu nó đã tồn tại sẵn trong HTML
    if (document.getElementById('auth-status')) {
        checkAndDisplayUser();
    }
});

// --- Các hàm tiện ích ---

async function checkAuth() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (user) {
        console.log('User đang đăng nhập:', user.email);
    }
}

async function checkAndDisplayUser() {
    const authContainer = document.getElementById('auth-status');
    if (!authContainer) return;
    
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (user) {
        // Vẽ giao diện dropdown chuẩn hiện đại
        authContainer.innerHTML = `
            <div class="user-dropdown">
                <div class="dropdown-trigger">
                    <i class="fa-regular fa-circle-user avatar-icon"></i>
                    <span class="user-name">${user.user_metadata.full_name || user.email.split('@')[0]}</span>
                    <i class="fa-solid fa-chevron-down caret-icon"></i>
                </div>
                <div class="dropdown-content">
                    <div class="dropdown-header">
                        <span class="user-email">${user.email}</span>
                    </div>
                    <a href="/pages/profile.html">
                        <i class="fa-regular fa-id-card"></i> Thông tin cá nhân
                    </a>
                    <hr class="dropdown-divider">
                    <a href="#" onclick="logout()" class="logout-btn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
                    </a>
                </div>
            </div>
        `;
    } else {
        authContainer.innerHTML = `<a href="/pages/login.html" class="login-btn">Đăng nhập</a>`;
    }
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.reload();
}

// Lắng nghe tín hiệu từ main.js khi navbar được nạp xong
window.addEventListener('navbarLoaded', async () => {
    await checkAndDisplayUser();
});