// 1. Tự động bơm cấu trúc HTML Chatbox vào trang web
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('chatboxContainer')) return;

    const chatboxHTML = `
        <div class="ai-chatbox-toggle" onclick="toggleChatbox()">
            <img src="images/logoAI.svg" alt="AI Chatbot" class="chat-icon">
        </div>

        <div class="ai-chatbox-container" id="chatboxContainer">
            <div class="chatbox-header">
                <span class="chatbox-title">nhắn với Mắt Mơ nhó!</span>
                <button class="close-btn" onclick="toggleChatbox()">✕</button>
            </div>

            <div class="chatbox-body" id="chatboxBody">
            </div>

            <div class="quick-replies">
                <div class="reply-tag">Kính nào đang được ưa chuộng nhất?</div>
                <div class="reply-tag">Shop có chính sách đổi trả linh hoạt...</div>
                <div class="reply-tag">Giá kính ở shop dao động bao nhiêu?</div>
                <div class="reply-tag">Thời điểm này có khuyến mãi gì mới không?</div>
            </div>

            <div class="chatbox-footer">
                <div class="footer-utils">
                    <img src="images/image.svg" alt="Upload">
                    <img src="images/link.svg" alt="Link">
                    <img src="images/mic.svg" alt="Mic">
                </div>
                <input type="text" placeholder="Nhập tin nhắn..." class="chat-input">
                <button class="send-btn">
                    <img src="images/send.svg" alt="Send">
                </button>
            </div>
        </div>
    `;
        
    document.body.insertAdjacentHTML('beforeend', chatboxHTML);
    
    // Nạp thẳng toàn bộ lịch sử hội thoại
    initStaticChatHistory();

    // Kích hoạt sự kiện lắng nghe click cho các câu trả lời gợi ý
    initQuickReplies();
});

// 2. Logic đóng mở chatbox
function toggleChatbox() {
    const chatbox = document.getElementById('chatboxContainer');
    if (chatbox) {
        chatbox.classList.toggle('active');
        const body = document.getElementById('chatboxBody');
        if (body) body.scrollTop = body.scrollHeight;
    }
}

// 3. NẠP SẴN LỊCH SỬ HỘI THOẠI 
function initStaticChatHistory() {
    const body = document.getElementById('chatboxBody');
    if (!body) return;

    body.innerHTML = `
        <div class="message-row bot-row">
            <div class="avatar-ai"></div>
            <div class="message-bubble">
                Xin chào! Bạn cần Mắt Mơ giúp đỡ gì khôngg? Hãy nói cho Mắt Mơ biết nhé
                <span class="chat-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    `;

    body.scrollTop = body.scrollHeight;
}

// 4. HÀM GỬI TIN NHẮN CỦA NGƯỜI DÙNG VÀO HỘI THOẠI
function sendUserMessage(text) {
    if (!text || text.trim() === "") return;

    const body = document.getElementById('chatboxBody');
    if (!body) return;

    // Lấy thời gian hiện tại
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toLowerCase();

    // Tạo cấu trúc tin nhắn của User (bạn có thể đổi class css cho đúng giao diện của bạn)
    const userMessageHTML = `
        <div class="message-row user-row" style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
            <div class="message-bubble user-bubble" style="background-color: #000181; color: white; padding: 10px; border-radius: 10px; max-width: 70%;">
                ${text}
                <span class="chat-time" style="display: block; font-size: 10px; color: #ddd; text-align: right; margin-top: 5px;">${currentTime}</span>
            </div>
        </div>
    `;

    // Đẩy tin nhắn vào khung chat
    body.insertAdjacentHTML('beforeend', userMessageHTML);
    body.scrollTop = body.scrollHeight;

    // TODO: Tại đây bạn có thể gọi API Bot phản hồi nếu có backend xử lý tin nhắn
    // ví dụ: fetchReplyFromAI(text);
}

// 5. LẮNG NGHE SỰ KIỆN CLICK VÀO CÁC TAG GỢI Ý
function initQuickReplies() {
    const tags = document.querySelectorAll('.quick-replies .reply-tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            const question = tag.textContent;
            sendUserMessage(question);
        });
    });

    // Thêm sự kiện nút gửi tin nhắn thủ công bằng ô input luôn cho đồng bộ
    const sendBtn = document.querySelector('.chatbox-footer .send-btn');
    const chatInput = document.querySelector('.chatbox-footer .chat-input');

    if (sendBtn && chatInput) {
        // Click nút gửi
        sendBtn.addEventListener('click', () => {
            sendUserMessage(chatInput.value);
            chatInput.value = ""; // Xóa text ô input sau khi gửi
        });

        // Nhấn Enter để gửi
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendUserMessage(chatInput.value);
                chatInput.value = "";
            }
        });
    }
}