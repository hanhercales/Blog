/* =========================================
   CẤU HÌNH API 
   (Hãy thay đổi 2 dòng dưới đây thành thông tin thật của bạn)
========================================= */
const GITHUB_USERNAME = 'TÊN_GITHUB_CỦA_BẠN'; 
const REPO_NAME = 'TÊN_REPO_BLOG';            

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

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Lỗi kết nối: ${response.status}`);
        }
        
        const issues = await response.json();
        container.innerHTML = ''; // Xóa dòng chữ Đang tải...
        
        if (issues.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">Tác phẩm này hiện chưa có chương nào được đăng tải.</p>';
            return;
        }

        // Tạo thẻ hiển thị cho từng chương truyện lấy từ GitHub
        issues.forEach(issue => {
            const date = new Date(issue.created_at).toLocaleDateString('vi-VN');
            
            const card = document.createElement('div');
            card.className = 'chapter-card';
            card.innerHTML = `
                <h3>${issue.title}</h3>
                <div class="chapter-meta">Cập nhật lúc: ${date}</div>
            `;
            
            // Gắn sự kiện click để mở đọc
            card.onclick = () => showReadingView(issue.title, date, issue.body);
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Lỗi:", error);
        container.innerHTML = '<p style="color: #ff6b6b;">Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại cấu hình tên tài khoản hoặc kho lưu trữ.</p>';
    }
}

// Kích hoạt việc lấy dữ liệu ngay khi tải xong trang web
fetchChapters();