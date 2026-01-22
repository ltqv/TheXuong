const API_URL = "http://localhost:8080/api";

// 1. Kiểm tra Auth và Render Icon User
async function checkAuth() {
    const userArea = document.getElementById('userArea');
    userArea.innerHTML = ''; // Reset nội dung cũ

    let menuContent = '';

    try {
        const response = await fetch(`${API_URL}/auth/profile`);

        if (response.ok) {
            // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (Thành công) ---
            const data = await response.json();
            let displayName = data.name;
            if(displayName.length > 10) {
                displayName = displayName.substring(0, 10) + "...";
            }
            menuContent = `
                <li><h6 class="dropdown-header">Xin chào, ${displayName}</h6></li>
                <li>
                    <a class="dropdown-item" href="#">
                        <i class="fa-solid fa-id-card me-2"></i> Tài khoản
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="#">
                        <i class="fa-solid fa-gear me-2"></i> Cài đặt
                    </a>
                </li>
                <li><hr class="dropdown-divider bg-light opacity-25 mx-2"></li>
                <li>
                    <a class="dropdown-item text-danger fw-bold" href="#" onclick="logout()">
                        <i class="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                    </a>
                </li>
            `;
        } else {
            // --- TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (Token lỗi/hết hạn) ---
            menuContent = getGuestMenu();
        }

    } catch (e) {
        console.error("Lỗi Auth:", e);
        // --- TRƯỜNG HỢP 3: LỖI MẠNG / SERVER TẮT ---
        // Vẫn hiện menu Đăng nhập đầy đủ để người dùng thao tác
        menuContent = getGuestMenu();
    }

    // --- RENDER RA HTML CUỐI CÙNG ---
    // Luôn giữ cấu trúc .user-dropdown để ăn CSS Hover
    userArea.innerHTML = `
        <div class="user-dropdown">
            <div class="user-icon-trigger">
                <i class="fa-solid fa-user"></i>
            </div>

            <ul class="dropdown-menu dropdown-menu-end">
                ${menuContent}
            </ul>
        </div>
    `;
}

// --- HÀM PHỤ: Trả về Menu cho Khách (Để dùng chung cho cả lỗi mạng và chưa login) ---
function getGuestMenu() {
    return `
        <li><h6 class="dropdown-header">Khách truy cập</h6></li>
        <li>
            <a class="dropdown-item" href="login.html">
                <i class="fa-solid fa-right-to-bracket me-2"></i> Đăng nhập
            </a>
        </li>
        <li>
            <a class="dropdown-item" href="register.html">
                <i class="fa-solid fa-user-plus me-2"></i> Đăng ký
            </a>
        </li>
    `;
}

// 2. Hàm Đăng nhập (Dùng cho Login.html)
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (!email || !password) {
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Vui lòng nhập đầy đủ Email và Mật khẩu!';
        }
        return; // Dừng lại, không gọi API
    }

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
        if (errorMsg) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = 'Lỗi kết nối server!';
        }
    }
}

// 3. Hàm Load Sản phẩm (Gọi API Products)
// Biến toàn cục để theo dõi trang hiện tại
let currentPage = 0;

// 3. Hàm Load Sản phẩm (CÓ PHÂN TRANG)
async function loadProducts(page = 0) {
    const grid = document.getElementById('productList');
    const paginationArea = document.getElementById('paginationArea');

    if (!grid) return;

    try {
        // Gọi API với tham số page và size=12
        const response = await fetch(`${API_URL}/products?page=${page}&size=12`);
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");

        // Spring trả về đối tượng Page (gồm content, totalPages, number,...)
        const data = await response.json();
        const products = data.content; // Đây là danh sách sản phẩm của trang này

        // 1. Render Sản phẩm
        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center">Chưa có sản phẩm.</div>';
            paginationArea.style.display = 'none';
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="col-12 col-sm-6 col-md-3">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${p.imageUrl}" class="card-img-top product-img-custom" alt="${p.name}" 
                         onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                    <div class="card-body d-flex flex-column">
                        <small class="text-muted text-uppercase mb-1">${p.category || 'Thể thao'}</small>
                        <h5 class="card-title fw-bold" style="font-size: 1rem;">${p.name}</h5>
                        <p class="card-text text-danger fw-bold fs-5 mb-3">
                            ${new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(p.price)}
                        </p>
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-outline-dark" title="Thêm vào giỏ">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </button>
                            <button class="btn btn-light flex-grow-1 fw-bold">Mua ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // 2. Render Phân Trang (Giống hình mẫu)
        renderPagination(data);

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div class="col-12 text-center text-danger">Không thể tải dữ liệu server.</div>';
    }
}

// Hàm vẽ nút phân trang
function renderPagination(data) {
    const paginationArea = document.getElementById('paginationArea');
    const totalPages = data.totalPages;
    const currPage = data.number; // Trang hiện tại (bắt đầu từ 0)
    currentPage = currPage; // Cập nhật biến toàn cục

    if (totalPages <= 1) {
        paginationArea.style.display = 'none';
        return;
    }

    paginationArea.style.display = 'flex';

    // Nút Previous & First
    // Disable nếu đang ở trang đầu
    const prevDisabled = data.first ? 'disabled' : '';
    const prevAction = data.first ? '' : `onclick="loadProducts(${currPage - 1})"`;
    const firstAction = data.first ? '' : `onclick="loadProducts(0)"`;

    // Nút Next & Last
    // Disable nếu đang ở trang cuối
    const nextDisabled = data.last ? 'disabled' : '';
    const nextAction = data.last ? '' : `onclick="loadProducts(${currPage + 1})"`;
    const lastAction = data.last ? '' : `onclick="loadProducts(${totalPages - 1})"`;

    // HTML chuẩn theo style nút đen
    paginationArea.innerHTML = `
        <div class="d-flex gap-2">
            <button class="pagination-btn" ${prevDisabled} ${firstAction}>
                <i class="fa-solid fa-angles-left"></i>
            </button>
            <button class="pagination-btn" ${prevDisabled} ${prevAction}>
                PREVIOUS
            </button>
        </div>

        <span class="page-info">Trang: ${currPage + 1} of ${totalPages}</span>

        <div class="d-flex gap-2">
            <button class="pagination-btn" ${nextDisabled} ${nextAction}>
                NEXT
            </button>
            <button class="pagination-btn" ${nextDisabled} ${lastAction}>
                <i class="fa-solid fa-angles-right"></i>
            </button>
        </div>
    `;
}

// 4. Hàm Đăng xuất
async function logout() {
    try {
        // 1. gọi api để server xóa cookie
        await fetch(`${API_URL}/auth/logout`, {method: 'POST'});

        const userArea = document.getElementById('userArea');
        userArea.innerHTML = `
            <a href="login.html" class="btn btn-outline-light btn-sm fw-bold rounded-pill px-3">
                <i class="fa-regular fa-user me-1"></i> Đăng nhập
            </a>
        `;
        showToast("Đã đăng xuất thành công!");
    } catch (e) {
        console.error("Lỗi logout: ", e);
        alert("Có xảy ra lỗi khi đăng xuất");
    }
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
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
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

// Hàm thông báo nhỏ
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "custom-toast";
    toast.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> ${message}`;
    document.body.appendChild(toast);

    // tự động ẩn sau 3 giây
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 3000);

}