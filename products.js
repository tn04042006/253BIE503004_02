const API_URL = "http://localhost:5000/api/products";
const container = document.getElementById('products-list');
const paginationCtrl = document.getElementById('pagination-ctrl'); // Khung chứa nút chuyển trang

// --- Cấu hình phân trang ---
let allProductsData = [];  // Lưu toàn bộ sản phẩm sau khi fetch hoặc lọc về
let currentPage = 1;       // Trang hiện tại đang xem
const itemsPerPage = 12;    // Số lượng sản phẩm hiển thị trên mỗi trang

// 1. Hàm hiển thị sản phẩm
function renderProducts(products) {
    // ƯU TIÊN: Nếu trang này có định nghĩa hàm render riêng (như trang Sale), dùng nó luôn
    if (typeof window.customRender === 'function') {
        window.customRender(products);
        return;
    }

    // Nếu không có customRender, chạy logic render mặc định của trang thường
    const container = document.getElementById('products-list'); 
    if (!container) return; // Không có chỗ chứa nào thì thoát hẳn

    if (!products || products.length === 0) {
        container.innerHTML = "<div class='loading-text'>Rất tiếc, không có sản phẩm nào phù hợp! 🛍️</div>";
        return;
    }

    // Render giao diện mặc định cho trang thường (Không Sale)
    container.innerHTML = products.map(sp => {
        let linkAnh = sp.hinh_anh_chinh;
        if (!linkAnh && sp.mau_sac && sp.mau_sac.length > 0) {
            const temp = sp.mau_sac[0].hinh_anh;
            linkAnh = Array.isArray(temp) ? temp[0] : temp;
        }
        if (!linkAnh) linkAnh = 'media/placeholder.png';

        return `
            <div class="product-card" onclick="location.href='sp-detail.html?id=${sp.ma_sp}'">
                <div class="product-image">
                    <img src="${linkAnh}" loading="lazy" onerror="this.src='https://via.placeholder.com/250?text=MatMo+Eyewear'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${sp.ten_sp}</h3>
                    <div class="product-meta">
                        <p class="product-price">${sp.gia.toLocaleString()}đ</p>
                        <div class="product-buttons">
                            <img src="images/add.svg" class="add-icon" title="Thêm vào giỏ" onclick="addToCart(event, '${sp.ma_sp}', '${sp.ten_sp}', ${sp.gia}, '${linkAnh}')">
                            <img src="images/VR.svg" class="vr-icon" title="Thử kính online" onclick="openVRModal(event)">                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 2. Hàm cắt mảng sản phẩm để hiển thị đúng trang hiện tại
function displayPage(page) {
    currentPage = page;
    
    // Tính toán vị trí cắt mảng dữ liệu
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allProductsData.slice(start, end);

    // Gọi lại hàm render giao diện
    renderProducts(paginatedItems); 
    
    // Cập nhật lại trạng thái active của các nút số 1, 2, 3
    renderPaginationControls();
    
    // Cuộn mượt lên đầu danh sách sản phẩm để tiện xem
    if (container) {
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

// 3. Hàm tự động sinh ra các nút số 1, 2, 3 dựa trên tổng số sản phẩm
function renderPaginationControls() {
    if (!paginationCtrl) return;
    const totalPages = Math.ceil(allProductsData.length / itemsPerPage);
    
    // Nếu tổng số sản phẩm quá ít (chỉ có 1 trang hoặc không có), ẩn luôn thanh phân trang
    if (totalPages <= 1) {
        paginationCtrl.innerHTML = "";
        return;
    }

    let buttonsHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? "class='active'" : "";
        buttonsHTML += `<button ${activeClass} onclick="displayPage(${i})">${i}</button>`;
    }

    paginationCtrl.innerHTML = buttonsHTML;
}

// 4. Hàm gọi API lấy dữ liệu từ Server
async function fetchProducts(query = "") {
    if (container) {
        container.innerHTML = "<div class='loading-text'>Đang tải sản phẩm...</div>";
    }
    try {
        const response = await fetch(`${API_URL}${query}`);
        const data = await response.json();
        
        // Lưu dữ liệu vào biến tổng
        allProductsData = data; 
        // Bắt đầu chạy từ trang số 1
        displayPage(1); 
        
    } catch (error) {
        if (container) {
            container.innerHTML = `<div class='loading-text' style='color:red'>Lỗi kết nối Server! Kiểm tra lại lệnh 'node server.js'.</div>`;
        }
    }
}

// 5. Hàm xử lý logic Bộ lọc đa năng
function filterProducts() {
    let params = new URLSearchParams();
    
    const dangMat = Array.from(document.querySelectorAll('input[name="dang_mat"]:checked')).map(i => i.value);
    if (dangMat.length > 0) params.append('dang_mat', dangMat.join(','));

    const kieuDang = Array.from(document.querySelectorAll('input[name="kieu_dang"]:checked')).map(i => i.value);
    if (kieuDang.length > 0) params.append('kieu_dang', kieuDang.join(','));
    
    const loaiTrong = Array.from(document.querySelectorAll('input[name="loai_trong"]:checked')).map(i => i.value);
    if (loaiTrong.length > 0) params.append('loai_trong', loaiTrong.join(','));

    const xuHuong = Array.from(document.querySelectorAll('input[name="xu_huong"]:checked')).map(i => i.value);
    if (xuHuong.length > 0) params.append('xu_huong', xuHuong.join(','));
    
    const giaInput = document.querySelector('input[name="khoang_gia"]:checked');
    const gia = giaInput ? giaInput.value : 'all';
    if (gia !== 'all') params.append('khoang_gia', gia);

    const finalQuery = params.toString() ? "?" + params.toString() : "";
    
    currentPage = 1; 
    fetchProducts(finalQuery);
}

// --- Khởi chạy khi mở trang ---
fetchProducts();

// Lắng nghe sự kiện thay đổi của bộ lọc trong sidebar
document.querySelectorAll('.sidebar input').forEach(input => {
    input.addEventListener('change', filterProducts);
});

// Hàm thêm vào giỏ hàng (Danh sách sản phẩm)
function addToCart(event, maSp, tenSp, giaSp, anhSp) {
    if (event) event.stopPropagation(); 

    // Kiểm tra trạng thái đăng nhập
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        
        // Kích hoạt hiển thị modal đăng nhập
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('modal-login');
        if (overlay && loginModal) {
            overlay.classList.add('active');
            loginModal.classList.add('active');
        }
        return; // Dừng hàm lại, không lưu vào giỏ hàng
    }

    // --- LOGIC LƯU GIỎ HÀNG GỐC CỦA BẠN ---
    const product = {
        id: maSp,
        name: tenSp,
        price: giaSp,
        img: anhSp,
        quantity: 1 
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm "${tenSp}" vào giỏ hàng thành công!`);
}
// Hàm mở popup VR
function openVRModal(event) {
    if (event) event.stopPropagation();
    
    const modal = document.getElementById('vrPrivacyModal');
    if (modal) {
        // Mỗi lần mở lên thì phải reset về Bước 1 (Điều khoản) trước
        document.getElementById('vrStepTerms').classList.add('active');
        document.getElementById('vrStepLive').classList.remove('active');
        
        modal.classList.add('active');
    }
}

// Hàm đóng popup VR
function closeVRModal() {
    const modal = document.getElementById('vrPrivacyModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Hàm xử lý KHI BẤM ĐỒNG Ý
function handleVRAccept() {
    const stepTerms = document.getElementById('vrStepTerms');
    const stepLive = document.getElementById('vrStepLive');
    
    if (stepTerms && stepLive) {
        // Ẩn bước điều khoản đi
        stepTerms.classList.remove('active');
        // Hiện bước chứa ảnh tượng trưng lên
        stepLive.classList.add('active');
    }
}

// Thêm sự kiện click ra ngoài khung trắng-hồng thì tự đóng popup cho tiện
document.addEventListener('click', (e) => {
    const modal = document.getElementById('vrPrivacyModal');
    if (e.target === modal) {
        closeVRModal();
    }
});