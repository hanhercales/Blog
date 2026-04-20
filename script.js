/* =========================================
   CẤU HÌNH API 
   (Hãy thay đổi 2 dòng dưới đây thành thông tin thật của bạn)
========================================= */
const GITHUB_USERNAME = 'hanhercales'; 
const REPO_NAME = 'Blog';            

// Đường dẫn API lấy bài viết do chính bạn tạo và đang ở trạng thái Open
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues?creator=${GITHUB_USERNAME}&state=open`;

/* =========================================
   GIAO DIỆN (VIEW CONTROL)
========================================= */
// Hiển thị nội dung đọc truyện
function showReadingView(title, date, body) {
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'block';
    
    document.getElementById('reading-title').innerText = title;
    document.getElementById('reading-meta').innerText = 'Đăng ngày: ' + date;
    
    // Xử lý ngắt dòng để giữ đúng form kịch bản
    const formattedBody = body ? body.replace(/\n/g, '<br>') : "Chương này chưa có nội dung.";
    document.getElementById('reading-body').innerHTML = formattedBody;
    
    // Tự động cuộn lên đầu trang
    document.querySelector('.main-content').scrollTop = 0;
}

// Trở về màn hình danh sách chương
function showListView() {
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
}

/* =========================================
   DỮ LIỆU (DATA FETCHING)
========================================= */
async function fetchChapters() {
    const container = document.getElementById('chapters-container');
    container.innerHTML = '<p style="color: var(--text-muted);">Đang tải dữ liệu cốt truyện...</p>';

    // Lệnh in ra Console để kiểm tra xem link URL ghép vào đã chuẩn 100% chưa
    console.log("🛠️ Bắt đầu gọi API tới link này:");
    console.log("👉", API_URL);

    try {
        const response = await fetch(API_URL);
        
        // In ra mã trạng thái (Ví dụ: 200 là OK, 404 là Không tìm thấy, 403 là Bị cấm)
        console.log("📥 Mã trạng thái phản hồi từ Github:", response.status);

        if (!response.ok) {
            // Nếu lỗi, cố gắng đọc xem Github nói gì rồi in ra đỏ chót trên Console
            const errorText = await response.text();
            console.error("❌ Lỗi chi tiết từ máy chủ Github:", errorText);
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        
        const issues = await response.json();
        
        // Nếu thành công, in toàn bộ dữ liệu truyện ra Console để bạn xem cấu trúc
        console.log("✅ Lấy dữ liệu thành công! Tổng số chương tìm thấy:", issues.length);
        console.log("📦 Dữ liệu chi tiết:", issues);

        container.innerHTML = ''; 
        
        if (issues.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">Tác phẩm này hiện chưa có chương nào được đăng tải.</p>';
            return;
        }

        issues.forEach(issue => {
            const date = new Date(issue.created_at).toLocaleDateString('vi-VN');
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.innerHTML = `
                <h3>${issue.title}</h3>
                <div class="chapter-meta">Cập nhật lúc: ${date}</div>
            `;
            card.onclick = () => showReadingView(issue.title, date, issue.body);
            container.appendChild(card);
        });

    } catch (error) {
        // In ra dòng lỗi hệ thống (ví dụ: đứt mạng, sai cấu trúc)
        console.error("🚨 Bắt được lỗi Exception:", error);
        container.innerHTML = '<p style="color: #ff6b6b;">Không thể kết nối đến máy chủ. Vui lòng nhấn F12 để xem lỗi chi tiết.</p>';
    }
}

// Kích hoạt việc lấy dữ liệu ngay khi tải xong trang web
fetchChapters();