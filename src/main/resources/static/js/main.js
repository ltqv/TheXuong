const API_URL = "http://localhost:8080/api";

//1. Ktr token khi load cho index.html
async function checkAuth() {
    //TH 1: login gg xóa token trên url

    const userArea = document.getElementById('userArea');
    try {
        const response = await fetch(`${API_URL}/auth/profile`);
        if (response.ok) {
            const data = await response.json();
            userArea.innerHTML = `
            <span class="navbar-text text-light me-3">Xin chào, <b>${data.name}</b></span>
            <button onclick="logout()" class="btn btn-outline-light btn-sm">
            <i class="fa-solid fa-right-from-bracket me-1"></i> Đăng xuất
        </button>
        `;
        } else {
            //chưa login/hết hạn token hiện login
            userArea.innerHTML = `<a href="login.html" class="btn btn-light btn-sm fw-bold">Đăng nhập ngay</a>`;
        }
    } catch (e) {
        console.error("Lỗi kiểm tra Auth: ", e);
        //Lỗi do mạng hiện nút login
        userArea.innerHTML = `<a href="login.html" class="btn btn-light btn-sm fw-bold">Đăng nhập ngay</a>`;
    }
}

// 2. Hàm Đăng nhập (Dùng cho Login.html)
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            window.location.href = 'index.html'; // Chuyển về trang chủ
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Sai tài khoản hoặc mật khẩu!';
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi kết nối server!');
    }
}

// 3. Hàm Load Sản phẩm (Gọi API Products)
async function loadProducts() {
    const grid = document.getElementById('productList');
    if (!grid) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");
        const products = await response.json();
        // Clear spinner cũ
        grid.innerHTML = '';

        if (products.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center">Chưa có sản phẩm.</div>';
            return;
        }

        // Render HTML chuẩn Bootstrap Card
        grid.innerHTML = products.map(p => `
            <div class="col-12 col-sm-6 col-md-3">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${p.imageUrl}" class="card-img-top product-img-custom" alt="${p.name}" 
                         onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                    <div class="card-body d-flex flex-column">
                        <small class="text-muted text-uppercase mb-1">${p.category || 'Thể thao'}</small>
                        <h5 class="card-title fw-bold">${p.name}</h5>
                        <p class="card-text text-danger fw-bold fs-5 mb-3">
                            ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(p.price)}
                        </p>
                        <div class="d-flex gap-2 mt-auto">
    <button class="btn btn-outline-dark" title="Thêm vào giỏ">
        <i class="fa-solid fa-cart-shopping"></i>
    </button>
    
    <button class="btn btn-warning flex-grow-1">Mua ngay</button>
</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div class="col-12 text-center text-danger">Không thể tải dữ liệu server.</div>';
    }
}

// 4. Hàm Đăng xuất
async function logout() {
    await fetch(`${API_URL}/auth/logout`, {method: 'POST'}); // Gọi server để xóa cookie
    window.location.href = 'login.html';
}

// Tự động chạy khi load trang
document.addEventListener("DOMContentLoaded", () => {
    // Chạy checkAuth ở cả trang chủ và các trang khác (trừ login) để hiện Navbar đúng
    if (!window.location.pathname.includes('login.html')) {
        checkAuth();
    }
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        loadProducts();
    }
});

// 5. Hàm Đăng ký (Dành cho register.html)
async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const rePassword = document.getElementById('reg-repassword').value;
    const alertMsg = document.getElementById('alertMsg');

    // Reset thông báo
    alertMsg.style.display = 'none';
    alertMsg.className = 'error-msg'; // Mặc định là style lỗi

    // 1. Validate cơ bản
    if (!email || !password || !rePassword) {
        showError(alertMsg, 'Vui lòng điền đầy đủ thông tin!');
        return;
    }
    if (password !== rePassword) {
        showError(alertMsg, 'Mật khẩu nhập lại không khớp!');
        return;
    }

    // 2. Gọi API đăng ký
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const message = await response.text();

        if (response.ok) {
            // Thành công: Đổi màu thông báo sang xanh (tùy chỉnh inline cho nhanh)
            alertMsg.style.background = '#d4edda';
            alertMsg.style.color = '#155724';
            alertMsg.style.borderColor = '#c3e6cb';
            alertMsg.innerText = 'Đăng ký thành công! Đang chuyển hướng...';
            alertMsg.style.display = 'block';

            // Chuyển về trang login sau 1.5 giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            // Lỗi từ server (VD: Email đã tồn tại)
            showError(alertMsg, message || 'Đăng ký thất bại.');
        }
    } catch (e) {
        console.error(e);
        showError(alertMsg, 'Lỗi kết nối server!');
    }
}

// Hàm phụ hiển thị lỗi
function showError(element, msg) {
    element.innerText = msg;
    element.style.background = '#ffe6e6'; // Màu nền đỏ nhạt
    element.style.color = '#d63031';      // Chữ đỏ đậm
    element.style.display = 'block';
}