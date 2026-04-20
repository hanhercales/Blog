// Hàm chuyển đổi sang chế độ đọc
function showReadingView(title, date, body) {
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'block';
    
    document.getElementById('reading-title').innerText = title;
    document.getElementById('reading-meta').innerText = 'Đăng ngày: ' + date;
    
    // Xử lý xuống dòng
    document.getElementById('reading-body').innerHTML = body;
    
    // Cuộn lên đầu trang
    document.querySelector('.main-content').scrollTop = 0;
}

// Hàm quay lại danh sách
function showListView() {
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
}

/* Dữ liệu giả định (Mock Data) để kiểm tra giao diện */
const mockIssues = [
    {
        title: "Chương 5: Bắt đầu viết kịch bản",
        created_at: "2026-04-18T10:00:00Z",
        body: "Khung cảnh trở nên im lặng. Eve nhìn chằm chằm vào khoảng không, cố gắng tiêu hóa những gì vừa xảy ra. Cô khẽ cắn môi, định nói một điều gì đó nghe thật an ủi.\n\nNhưng Han đã gạt đi trước khi cô kịp mở lời. Cậu cất giọng đều đều, không một chút sến súa:\n\n'Xin lỗi nhé. Nhưng gã đó chưa từng nói chuyện sến súa như này đâu.'",
        labels: [{name: "Ocschosia X"}]
    },
    {
        title: "Chương 4: Ráp nối cấu trúc",
        created_at: "2026-04-10T10:00:00Z",
        body: "Nội dung chương 4 sẽ được load vào đây...",
        labels: [{name: "Ocschosia X"}]
    },
    {
        title: "Chương 1, 2, 3: Phác thảo ý tưởng",
        created_at: "2026-04-01T10:00:00Z",
        body: "Hệ thống logic đã được đóng khung. Đang tiến hành xử lý các nhánh rẽ...",
        labels: [{name: "Ocschosia X"}]
    }
];

// Hàm render dữ liệu ra màn hình
function renderChapters(issues) {
    const container = document.getElementById('chapters-container');
    container.innerHTML = ''; 

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
}

// Khởi chạy giao diện với dữ liệu giả
renderChapters(mockIssues);