const socket = io("http://127.0.0.1:5000");
const urlParams = new URLSearchParams(window.location.search);
const maSP = urlParams.get('id');
const user = JSON.parse(localStorage.getItem("user")) || { ho_ten: "Khách ẩn danh", role: "user" };

let currentProductData = null;

// Hàm bổ trợ lấy URL ảnh đầu tiên hoặc trả về chuỗi nếu là string
const getUrl = (val) => Array.isArray(val) ? val[0] : val;

async function init() {
    if (!maSP) return;
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/products/${maSP}`);
        if (!res.ok) throw new Error("Không lấy được dữ liệu");
        const sp = await res.json();
        
        // Lưu sản phẩm vào biến toàn cục để các hàm bổ trợ sử dụng chính xác
        currentProductData = sp;
        
        // Ưu tiên lấy hình ảnh chính của sản phẩm, nếu không có lấy hình đầu tiên của màu đầu tiên
        const initialImg = sp.hinh_anh_chinh || getUrl(sp.mau_sac?.[0]?.hinh_anh);

        // Render giao diện chuẩn cấu trúc Flexbox song song
        document.getElementById('product-card-container').innerHTML = `
            <div class="product-detail-container">
                <div class="product-gallery">
                    <div class="main-img-box">
                        <img id="main-view-img" src="${initialImg}" alt="${sp.ten_sp}">
                        <button class="try-on-btn" onclick="openVRModal(event)">
                            <img src="images/VR.svg">Try on
                        </button>
                    </div>
                    <div class="thumb-container">
                        <button class="thumb-arrow" onclick="document.getElementById('t-list').scrollBy({left: -80, behavior: 'smooth'})">«</button>
                        <div class="thumb-list" id="t-list">
                            ${(sp.mau_sac || []).map((m, i) => {
                                const url = getUrl(m.hinh_anh);
                                return `<img src="${url}" class="thumb-item ${i===0?'active':''}" onclick="changeProductImage('${url}', this)">`;
                            }).join('')}
                        </div>
                        <button class="thumb-arrow" onclick="document.getElementById('t-list').scrollBy({left: 80, behavior: 'smooth'})">»</button>
                    </div>
                </div>
                
                <div class="product-info">
                    <h1 class="product-title">${sp.ten_sp}</h1>
                    
                    <div class="rating-summary">
                        <span class="rating-num">4.9 <img src="images/Star.svg"><img src="images/Star.svg"><img src="images/Star.svg"><img src="images/Star.svg"><img src="images/Star.svg"></span> | 
                        <span>21 Đánh giá</span> | 
                        <span>35 Đã bán</span>
                    </div>
                    
                    <div class="price-row">
                        <span class="current-price">${sp.gia.toLocaleString()}đ</span>
                        <span class="old-price">${(sp.gia * 1.2).toLocaleString()}đ</span>
                    </div>

                    <div class="coupon-row">
                        <span><img src="images/voucher.png"></span>
                        <span><img src="images/voucher50.png"></span>
                    </div>

                    <div class="shipping-box">
                        <div class="shipping-title">Vận chuyển: Nhận từ ${getFutureDateStr(2)} - ${getFutureDateStr(4)}</div>
                        <div style="font-size: 11px; color: #666;">Tặng voucher 15.000đ nếu đơn giao sau thời điểm trên</div>
                    </div>
                    
                    <div class="option-group">
                        <span class="option-title">Thẻ:</span>
                        <div class="tag-list">
                            ${sp.bo_loc?.loai_trong ? `<span class="tag-btn active">${sp.bo_loc.loai_trong[0]}</span>` : ''}
                            ${sp.bo_loc?.kieu_dang_gong ? `<span class="tag-btn">${sp.bo_loc.kieu_dang_gong}</span>` : ''}
                            ${sp.bo_loc?.hinh_dang_mat ? `<span class="tag-btn">${sp.bo_loc.hinh_dang_mat}</span>` : ''}
                            ${sp.bo_loc?.chat_lieu ? `<span class="tag-btn">${sp.bo_loc.chat_lieu}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <span class="option-title">Màu sắc:</span>
                        <div class="tag-list" id="color-tags">
                            ${(sp.mau_sac || []).map((m, i) => {
                                const url = getUrl(m.hinh_anh);
                                return `<button class="tag-btn ${i===0?'active':''}" onclick="changeProductImage('${url}', this)">${m.ten_mau}</button>`;
                            }).join('')}
                        </div>
                    </div>

                    <div class="option-group">
                        <span class="option-title">Tròng:</span>
                        <div class="tag-list">
                            <button class="tag-btn active">Không</button>
                            <button class="tag-btn">Chọn tròng</button>
                        </div>
                    </div>

                    <div class="option-group" style="align-items: center; margin-top: 5px;">
                        <span class="option-title">Số lượng:</span>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="quantity-input">
                                <button class="quantity-btn" onclick="let inp = this.nextElementSibling; if(inp.value > 1) inp.value--">-</button>
                                <input type="text" class="quantity-val" value="1" readonly>
                                <button class="quantity-btn" onclick="this.previousElementSibling.value++">+</button>
                            </div>
                            <span style="font-size: 13px; color: #666;">222 sản phẩm có sẵn</span>
                        </div>
                    </div>
                    
                    <div class="btn-buy-group">
                        <button class="btn-add-cart" onclick="addToCartFromDetail()">
                            <img src="images/shoppingcart.svg"> Thêm vào giỏ hàng
                        </button>
                        <button class="btn-buy-now" onclick="buyNow()">Mua ngay</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('product-desc').innerHTML = sp.mo_ta;
        loadReviews();
        renderForm();
    } catch (e) {
        document.getElementById('product-card-container').innerText = "Lỗi kết nối hoặc sản phẩm không tồn tại!";
    }
}

// Hàm xử lý đổi ảnh mượt mà khi click thumbnail hoặc button màu sắc
function changeProductImage(url, element) {
    const mainImg = document.getElementById('main-view-img');
    if (mainImg) mainImg.src = url;
    
    if (element) {
        const parentGroup = element.parentElement;
        parentGroup.querySelectorAll('.active').forEach(b => b.classList.remove('active'));
        element.classList.add('active');
    }
}

async function loadReviews() {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/reviews/${maSP}`);
        const reviews = await res.json();
        document.getElementById('review-list').innerHTML = reviews.length > 0 
            ? reviews.reverse().map(r => renderReview(r)).join('')
            : "<p style='color:#888; text-align:center;'>Chưa có đánh giá nào cho sản phẩm này.</p>";
    } catch (err) {
        document.getElementById('review-list').innerHTML = "<p style='color:red;'>Không thể tải bình luận.</p>";
    }
}

function renderReview(r) {
    const stars = '★'.repeat(r.so_sao) + '☆'.repeat(5 - r.so_sao);
    const avatar = r.ten_nguoi_dung ? r.ten_nguoi_dung.charAt(0).toUpperCase() : "K";
    return `
        <div class="review-item" id="rev-${r._id}">
            <div class="user-header">
                <div class="user-avatar">${avatar}</div>
                <div class="user-name">@${(r.ten_nguoi_dung || "vo_danh").toLowerCase().replace(/\s/g, '_')}</div>
                <div class="stars-orange">${stars}</div>
            </div>
            <div class="review-content">${r.noi_dung_danh_gia}</div>
            <div class="review-media">
                ${(r.media || []).map(m => m.endsWith('.mp4') ? `<video src="${m}" controls></video>` : `<img src="${m}">`).join('')}
            </div>
            ${r.phan_hoi_cua_shop ? `
                <div class="shop-reply-box">
                    <div class="shop-info">🏠 @matmo <small>(Phản hồi từ shop)</small></div>
                    <div class="shop-reply-text">${r.phan_hoi_cua_shop}</div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderForm() {
    document.getElementById('review-form').innerHTML = `
        <h4 style="margin-top:0; color: var(--primary-purple);">Viết đánh giá của bạn</h4>
        <div style="margin-bottom:10px; font-size:14px;">Tài khoản đánh giá: <b>${user.ho_ten}</b></div>
        <textarea id="rev_msg" rows="3" placeholder="Chia sẻ cảm nhận của bạn về kính (chất lượng gọng, độ trong suốt tròng)..."></textarea>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <input type="file" id="rev_files" multiple accept="image/*,video/*" style="font-size:12px;">
            <button onclick="postReview()" style="background:var(--primary-purple); color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:bold;">GỬI ĐÁNH GIÁ</button>
        </div>
    `;
}

async function postReview() {
    const msg = document.getElementById('rev_msg').value;
    if(!msg) return alert("Vui lòng điền nội dung bình luận trước khi gửi!");

    const formData = new FormData();
    formData.append('ma_san_pham', maSP);
    formData.append('ten_nguoi_dung', user.ho_ten);
    formData.append('so_sao', 5);
    formData.append('noi_dung_danh_gia', msg);
    
    const fileInput = document.getElementById('rev_files');
    if (fileInput) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('files', fileInput.files[i]);
        }
    }

    const res = await fetch("http://127.0.0.1:5000/api/reviews", { method: "POST", body: formData });
    if(res.ok) {
        document.getElementById('rev_msg').value = "";
        document.getElementById('rev_files').value = "";
        alert("Đánh giá của bạn đã được gửi lên hệ thống!");
    }
}

// Socket nhận dữ liệu đánh giá real-time từ các client khác
socket.on("co_danh_gia_moi", (newReview) => {
    if (newReview.ma_san_pham === maSP) {
        const list = document.getElementById('review-list');
        if (list.innerHTML.includes("Chưa có đánh giá")) list.innerHTML = "";
        list.insertAdjacentHTML('afterbegin', renderReview(newReview));
    }
});

// Kích hoạt chạy hàm lấy dữ liệu
init();

// Hàm lấy ngày hiện tại cộng thêm một số ngày nhất định và định dạng thành "DD thMM"
const getFutureDateStr = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day} th${month}`;
};


// --- CHUẨN HÓA LOGIC POPUP VR TRY-ON THEO BASE.CSS ---

function openVRModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('vrPrivacyModal');
    if (modal) {
        document.getElementById('vrStepTerms').classList.add('active');
        document.getElementById('vrStepLive').classList.remove('active');
        modal.classList.add('active');
    }
}

function closeVRModal() {
    const modal = document.getElementById('vrPrivacyModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleVRAccept() {
    const stepTerms = document.getElementById('vrStepTerms');
    const stepLive = document.getElementById('vrStepLive');
    if (stepTerms && stepLive) {
        stepTerms.classList.remove('active');
        stepLive.classList.add('active');
    }
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('vrPrivacyModal');
    if (e.target === modal) {
        closeVRModal();
    }
});


// --- LOGIC XỬ LÝ GIỎ HÀNG & MUA NGAY (ĐÃ ĐỒNG BỘ THUỘC TÍNH TIẾNG ANH) ---

// Hàm gom dữ liệu sản phẩm hiện tại một cách an toàn nhất
function getProductCurrentData() {
    if (!currentProductData) return null;
    
    const mainImg = document.getElementById('main-view-img');
    const qtyInput = document.querySelector('.quantity-val');
    
    return {
        id: maSP,
        name: currentProductData.ten_sp,
        price: currentProductData.gia,
        img: mainImg ? mainImg.src : (currentProductData.hinh_anh_chinh || ""),
        quantity: qtyInput ? parseInt(qtyInput.value) || 1 : 1
    };
}

// 1. Hàm Thêm vào giỏ hàng từ trang chi tiết
function addToCartFromDetail() {
    // Kiểm tra trạng thái đăng nhập trước
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('modal-login');
        if (overlay && loginModal) {
            overlay.classList.add('active');
            loginModal.classList.add('active');
        }
        return; // Ngăn không cho chạy tiếp xuống dưới
    }

    const currentSp = getProductCurrentData();
    if (!currentSp) return alert("Dữ liệu sản phẩm chưa sẵn sàng, vui lòng thử lại!");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(item => item.id === currentSp.id);
    
    if (index !== -1) {
        cart[index].quantity += currentSp.quantity;
    } else {
        cart.push(currentSp);
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(` Đã thêm thành công ${currentSp.quantity} sản phẩm "${currentSp.name}" vào giỏ hàng!`);
}

// 2. Hàm Mua ngay từ trang chi tiết
function buyNow() {
    // Kiểm tra trạng thái đăng nhập trước
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Vui lòng đăng nhập để mua sản phẩm!");
        
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('modal-login');
        if (overlay && loginModal) {
            overlay.classList.add('active');
            loginModal.classList.add('active');
        }
        return; // Ngăn không cho chuyển hướng sang trang thanh toán
    }

    // --- LOGIC MUA NGAY GỐC ---
    const currentSp = getProductCurrentData();
    if (!currentSp) return alert("Dữ liệu sản phẩm chưa sẵn sàng, vui lòng thử lại!");
    
    localStorage.setItem("buy_now_item", JSON.stringify(currentSp));
    window.location.href = "thanh-toan.html";
}