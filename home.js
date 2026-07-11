// XỬ LÝ LOGIC SLIDER BANNER TỰ ĐỘNG VÀ BẤM MŨI TÊN
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentSlide = 0;
const slideIntervalTime = 2000; // Thời gian chuyển ảnh (2 giây)
let slideInterval;

// Hàm chuyển sang Slide bất kỳ
function showSlide(index) {
    // Loại bỏ class active hiện tại
    slides[currentSlide].classList.remove('active');
    
    // Tính toán index vòng lặp (nếu vượt quá số slide thì về 0, nếu nhỏ hơn 0 thì về cuối)
    currentSlide = (index + slides.length) % slides.length;
    
    // Thêm class active cho slide mới
    slides[currentSlide].classList.add('active');
}

// Hàm xử lý khi bấm nút Next
function nextSlide() {
    showSlide(currentSlide + 1);
}

// Hàm xử lý khi bấm nút Prev
function prevSlide() {
    showSlide(currentSlide - 1);
}

// Sự kiện bấm chuột
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetTimer(); 
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetTimer();
});

// Hàm khởi tạo đếm giây tự động chuyển động
function startTimer() {
    slideInterval = setInterval(nextSlide, slideIntervalTime);
}

// Hàm reset bộ đếm thời gian khi người dùng tự tương tác
function resetTimer() {
    clearInterval(slideInterval);
    startTimer();
}

// Chạy bộ tự động chuyển slide khi load trang lần đầu
// Lưu ý: Nhớ gọi startTimer() ở đây nếu bạn muốn slider tự chạy ngay từ đầu nhé!
startTimer(); 

