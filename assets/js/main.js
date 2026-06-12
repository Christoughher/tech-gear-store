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

const brandData = {
    laptop: ['asus', 'hp', 'dell', 'acer', 'macbook', 'lenovo', 'msi', 'gigabyte'],
    phone: ['samsung', 'apple', 'xiaomi'],
    pc: ['msi', 'gigabyte'],
    watch: ['apple', 'samsung'],
    phukien: ['airpods', 'loa'] 
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

    // Render các nút logo...
    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'btn-brand';
        btn.innerHTML = `<img src="assets/images/${brand}.png" alt="${brand}" 
                         onerror="this.style.display='none'; this.nextSibling.textContent='${brand.toUpperCase()}'">
                         <span></span>`;
        brandContainer.appendChild(btn);
    });

    // Tạo nút đóng "X"
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close-filter';
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    
    // Sự kiện đóng
    closeBtn.addEventListener('click', () => {
        brandContainer.innerHTML = '';
        // Bỏ active của các nút danh mục nếu cần
        document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('active'));
    });
    
    brandContainer.appendChild(closeBtn);
}