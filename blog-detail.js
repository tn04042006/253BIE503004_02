window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id && blogData[id]) {
        document.getElementById('blog-title').innerText = blogData[id].title;
        document.getElementById('blog-content').innerHTML = blogData[id].content;
    } else {
        document.querySelector('.main-content').innerHTML = "<h1>Bài viết không tồn tại!</h1>";
    }
};
document.addEventListener("DOMContentLoaded", function () {
    renderRandomBlogs();
});

function renderRandomBlogs() {
    const allIds = Object.keys(blogData);
    if (allIds.length === 0) return;

    const shuffledIds = allIds.sort(() => 0.5 - Math.random());
    const selectedIds = shuffledIds.slice(0, 4);

    // Render bài Nổi Bật (Cột trái)
    const featuredTarget = document.getElementById('featured-blog-content');
    const fId = selectedIds[0];
    const fPost = blogData[fId];

    if (featuredTarget && fPost) {
        featuredTarget.innerHTML = `
            <a href="blog-detail.html?id=${fId}" style="text-decoration: none;">
                <div class="main-blog-card">
                    <div class="blog-img-box">
                        <img src="${fPost.image}" alt="${fPost.title}">
                    </div>
                    <h3 class="blog-item-name">${fPost.title}</h3>
                </div>
            </a>
        `;
    }

    // Render danh sách (Cột phải)
    const sidebarTarget = document.getElementById('sidebar-blog-list');
    if (sidebarTarget) {
        sidebarTarget.innerHTML = '';
        selectedIds.slice(1, 4).forEach(id => {
            const post = blogData[id];
            sidebarTarget.innerHTML += `
                <div class="side-blog-item">
                    <a href="blog-detail.html?id=${id}" style="text-decoration: none;">
                        <div class="side-blog-card">
                            <div class="blog-img-small">
                                <img src="${post.image}" alt="${post.title}">
                            </div>
                            <h3 class="blog-item-name">${post.title}</h3>
                        </div>
                    </a>
                    <p class="blog-desc">${post.desc || "Mô tả đang cập nhật..."}</p>
                </div>
            `;
        });
    }
}