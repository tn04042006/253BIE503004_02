document.addEventListener("DOMContentLoaded", function() {
    const searchTrigger = document.getElementById("search-trigger");
    const searchDropdown = document.getElementById("search-dropdown");
    const searchInput = document.getElementById("search-input");

    if (searchTrigger && searchDropdown && searchInput) {
        
        // 1. Click vào kính lúp ban đầu để mở bảng search
        searchTrigger.addEventListener("click", function(e) {
            e.stopPropagation(); // Không cho sự kiện truyền ra ngoài làm đóng bảng
            searchDropdown.classList.add("active");
            searchInput.focus(); // Tự động đưa con trỏ chuột vào ô nhập liệu
        });

        // 2. Nhấn phím Enter khi đang gõ -> Chuyển sang trang sp-tat-ca.html
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                window.location.href = "sp-tat-ca.html";
            }
        });

        // 3. Click ra bên ngoài vùng bảng search thì tự động ẩn bảng đi
        document.addEventListener("click", function(event) {
            // Nếu vị trí click không nằm trong bảng tìm kiếm thì đóng bảng
            if (!searchDropdown.contains(event.target) && event.target !== searchTrigger) {
                searchDropdown.classList.remove("active");
            }
        });
    }
});