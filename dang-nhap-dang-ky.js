document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.getElementById("userDropdown");
    const userIconLink = document.getElementById("user-icon-link");

    // Kiểm tra trạng thái đăng nhập từ localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        // ================= TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP =================
        if (userIconLink) userIconLink.href = "trang-ca-nhan.html"; 

        if (dropdown) {
            dropdown.innerHTML = `
                <a href="trang-ca-nhan.html">Trang cá nhân</a>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 5px 0;">
                <a href="#" id="logout-btn" style="color: red !important;">Đăng xuất</a>
            `;
        }

        // Xử lý nút đăng xuất
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("currentUser");
                alert("Đã đăng xuất tài khoản!");
                window.location.href = "index.html";            
                });
        }

    } else {
        // ================= TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP =================
        if (userIconLink) {
            userIconLink.href = "#";
            userIconLink.classList.add("btn-open-auth");
        }

        if (dropdown) {
            dropdown.innerHTML = `
                <a href="#" class="btn-open-auth" id="trigger-login-modal">Đăng nhập / Đăng ký</a>
                <a href="#" id="restricted-profile-link">Trang cá nhân</a>
            `;
        }

        // Chặn xem trang cá nhân và bắt đăng nhập
        const restrictedProfileLink = document.getElementById("restricted-profile-link");
        if (restrictedProfileLink) {
            restrictedProfileLink.addEventListener("click", function (e) {
                e.preventDefault();
                alert("Vui lòng đăng nhập để xem thông tin cá nhân!");
                
                const overlay = document.getElementById('modal-overlay');
                const loginModal = document.getElementById('modal-login');
                if (overlay && loginModal) {
                    overlay.classList.add('active');
                    loginModal.classList.add('active');
                }
            });
        }
    }

    // Xử lý click cho dropdown trên thiết bị di động
    document.querySelectorAll('.dropdown').forEach(item => {
        item.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                if (!this.classList.contains('active')) {
                    e.preventDefault(); // Ngăn không cho chuyển trang ngay
                    
                    // Đóng tất cả các dropdown khác đang mở
                    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
                    
                    // Mở dropdown hiện tại
                    this.classList.add('active');
                } 
            }
        });
    });

    // Click ra ngoài thì đóng menu
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
        }
    });

    // Tải tệp modals động ngay khi DOM sẵn sàng
    loadModals();
}); 

// Hàm tải tệp tin HTML Modals
async function loadModals() {
    try {
        const response = await fetch('modals.html'); 
        if (!response.ok) throw new Error("Không tìm thấy file modals.html");
        
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        initModalLogic();
    } catch (error) {
        console.error("Lỗi tải Modal:", error);
    }
}

// Hàm khởi tạo toàn bộ logic xử lý Modal tương tác
function initModalLogic() {
    const overlay = document.getElementById('modal-overlay');
    const loginModal = document.getElementById('modal-login');
    const registerModal = document.getElementById('modal-register');
    const verifyModal = document.getElementById('modal-verify');
    const forgotModal = document.getElementById('modal-forgot'); 

    let verifyFlow = "register"; 

    // ================= HÀM KIỂM TRA HỢP LỆ (VALIDATION) =================
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    function validatePhone(phone) {
        const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
        return phoneRegex.test(phone.trim());
    }

    function validateName(name) {
        const nameRegex = /^[^0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        return nameRegex.test(name.trim());
}
    // ===================================================================

    function closeAll() {
        [loginModal, registerModal, verifyModal, forgotModal, overlay].forEach(el => {
            if(el) el.classList.remove('active');
        });
    }

    // 1. Kích hoạt mở modal Đăng nhập toàn trang
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-open-auth')) {
            e.preventDefault();
            closeAll();
            if(overlay && loginModal) {
                overlay.classList.add('active');
                loginModal.classList.add('active');
            }
        }
    });

    // 2. Chuyển đổi qua lại giữa các màn hình Modal khác nhau
    if(document.getElementById('go-to-register')) {
        document.getElementById('go-to-register').onclick = () => {
            closeAll(); overlay.classList.add('active'); registerModal.classList.add('active');
        };
    }
    if(document.getElementById('go-to-forgot')) {
        document.getElementById('go-to-forgot').onclick = (e) => {
            e.preventDefault(); closeAll(); overlay.classList.add('active'); forgotModal.classList.add('active');
        };
    }
    if(document.getElementById('forgot-back-to-login')) {
        document.getElementById('forgot-back-to-login').onclick = () => {
            closeAll(); overlay.classList.add('active'); loginModal.classList.add('active');
        };
    }
    if(document.getElementById('back-to-login')) {
        document.getElementById('back-to-login').onclick = () => {
            closeAll(); overlay.classList.add('active'); loginModal.classList.add('active');
        };
    }

    // 3. Xử lý ĐĂNG KÝ -> Tiếp theo (Kiểm tra Họ Tên, Email, SĐT)
    const btnNext = document.getElementById('btn-next-step');
    if(btnNext) {
        btnNext.onclick = () => {
            const lastNameVal = document.getElementById('register-lastname')?.value.trim() || "";
            const firstNameVal = document.getElementById('register-firstname')?.value.trim() || "";
            const usernameVal = document.getElementById('register-username')?.value.trim() || "";
            const phoneReg = document.getElementById('register-phone')?.value.trim() || "";
            
            // Tự động gộp chuỗi @gmail.com để thành email hoàn chỉnh phục vụ kiểm tra
            const fullEmailReg = usernameVal ? `${usernameVal}@gmail.com` : "";

            if (!lastNameVal || !firstNameVal) {
                alert("Vui lòng điền đầy đủ Họ và Tên!");
                return;
            }

            if (!validateName(lastNameVal) || !validateName(firstNameVal)) {
                alert("Họ và Tên không hợp lệ! Vui lòng không nhập số hoặc ký tự đặc biệt.");
                return;
            }

            if (!usernameVal) {
                alert("Vui lòng nhập tên người dùng cho Email!");
                return;
            }

            if (!validateEmail(fullEmailReg)) {
                alert("Email không đúng định dạng ký tự hợp lệ!");
                return;
            }

            if (!validatePhone(phoneReg)) {
                alert("Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số thuộc nhà mạng Việt Nam (VD: 03/05/07/08/09...).");
                return;
            }

            // Đạt điều kiện chuyển sang bước Xác nhận
            verifyFlow = "register"; 
            document.getElementById('verify-title').innerText = "Xác nhận tài khoản Mắt Mơ";
            document.getElementById('verify-email').value = fullEmailReg; 
            
            closeAll();
            overlay.classList.add('active');
            verifyModal.classList.add('active');
        };
    }

    // 4. Xử lý QUÊN MẬT KHẨU -> Gửi OTP (Kiểm tra định dạng Email)
    const btnSendOtp = document.getElementById('btn-send-otp');
    if(btnSendOtp) {
        btnSendOtp.onclick = () => {
            const emailForgot = document.getElementById('forgot-email').value.trim();
            
            if(!emailForgot) {
                alert("Vui lòng nhập Email!");
                return;
            }

            if (!validateEmail(emailForgot)) {
                alert("Email không đúng định dạng chuẩn hệ thống (ví dụ: name@gmail.com)!");
                return;
            }

            verifyFlow = "forgot"; 
            document.getElementById('verify-title').innerText = "Khôi phục mật khẩu";
            document.getElementById('verify-email').value = emailForgot; 
            
            alert(`Mã OTP khôi phục đã được gửi tới: ${emailForgot}`);
            closeAll();
            overlay.classList.add('active');
            verifyModal.classList.add('active');
        };
    }

    // 5. Từ Xác nhận OTP -> Bấm nút Hoàn tất
    const btnVerifyFinish = document.getElementById('btn-verify-finish');
    if(btnVerifyFinish) {
        btnVerifyFinish.onclick = () => {
            const verifyCode = document.getElementById('verify-code').value.trim();
            if(!verifyCode) {
                alert("Vui lòng nhập mã xác nhận OTP!");
                return;
            }
            if(verifyCode.length < 6) {
                alert("Mã OTP phải nhập đủ 6 chữ số!");
                return;
            }
            
            if(verifyFlow === "register") {
                alert("Đăng ký & Xác nhận thành công! Vui lòng đăng nhập.");
            } else if(verifyFlow === "forgot") {
                alert("Xác thực OTP thành công! Mật khẩu mới đã được gửi về Email của bạn.");
            }
            closeAll();
            overlay.classList.add('active');
            loginModal.classList.add('active');
        };
    }

    // 6. Xử lý ĐĂNG NHẬP (Kiểm tra dữ liệu rỗng và định dạng Email)
    const btnDoLogin = document.getElementById('btn-do-login');
    if(btnDoLogin) {
        btnDoLogin.onclick = () => {
            const emailVal = document.getElementById('login-email').value.trim();
            const passVal = document.getElementById('login-pass').value.trim();
            
            if (!emailVal) {
                alert("Vui lòng nhập Email đăng nhập!");
                return;
            }

            if (!validateEmail(emailVal)) {
                alert("Email đăng nhập không đúng định dạng!");
                return;
            }

            if (!passVal) {
                alert("Vui lòng nhập mật khẩu!");
                return;
            }

            localStorage.setItem("currentUser", JSON.stringify({ email: emailVal, name: "Thành viên Mắt Mơ" }));
            alert("Đăng nhập thành công!");
            closeAll();
            window.location.reload();
        };
    }

    // Xử lý Checkbox Hiện / Ẩn mật khẩu trong form Đăng ký
    const checkReg = document.getElementById('check-reg');
    if(checkReg) {
        checkReg.onchange = function() {
            const pwInputs = document.querySelectorAll('.class-password-input');
            pwInputs.forEach(input => {
                input.type = this.checked ? "text" : "password";
            });
        };
    }

    // CHẶN REAL-TIME 1: Chặn tuyệt đối không cho gõ/dán SỐ và KÝ TỰ ĐẶC BIỆT vào ô Họ và Tên
    const textInputs = ['register-lastname', 'register-firstname'];
    textInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', function() {
                // Chỉ giữ lại chữ cái và khoảng trắng, xóa bỏ số và các ký tự đặc biệt như @, #, $,...
                this.value = this.value.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/g, '');
            });

            el.addEventListener('paste', function(e) {
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pasteData)) {
                    e.preventDefault(); 
                    alert("Họ tên không được phép chứa số hoặc ký tự đặc biệt!");
                }
            });
        }
    });

    // CHẶN REAL-TIME 2: Chặn tuyệt đối không cho nhập/dán ký tự khác ngoài số vào ô Số điện thoại và Mã OTP
    const numericInputs = ['register-phone', 'verify-code'];
    numericInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, ''); 
            });

            el.addEventListener('paste', function(e) {
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                if (/[^0-9]/.test(pasteData)) {
                    e.preventDefault();
                    alert("Ô này chỉ được phép nhập hoặc dán dữ liệu số!");
                }
            });
        }
    });

    // Nhấp chuột vào lớp nền mờ (overlay) thì đóng toàn bộ modal
    if(overlay) {
        overlay.onclick = closeAll;
    }
}