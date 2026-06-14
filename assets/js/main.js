fetch('/components/footer.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('footer-container');
        if (container) {
            container.innerHTML = data;
        }
    });

fetch('/components/navbar.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('navbar-container');
        if (container) {
            container.innerHTML = data;
        }
    });

fetch('/components/admin-sidebar.html')
    .then(response => response.text())
    .then(data => {
        const container = document.getElementById('admin-sidebar-container');
        if (container) {
            container.innerHTML = data;
        }
    })
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
            const response = await fetch(`/components/${file}`);
            const data = await response.text();
            element.innerHTML = data;
        } catch (error) {
            console.error(`Lỗi khi load component ${file}:`, error);
        }
    }
}

// Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('pagination-container', 'pagination.html'); 
});

function focusOnSearchBar() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.focus();
    }
}

 