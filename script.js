const GITHUB_USERNAME = 'hanhercales'; 
const REPO_NAME = 'Blog';            
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues?creator=${GITHUB_USERNAME}&state=open&sort=created&direction=asc`;

let allChapters = []; 
let currentIndex = -1; 

async function fetchChapters() {
    const container = document.getElementById('chapters-container');
    container.innerHTML = '<p>Đang tải dữ liệu cốt truyện...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Lỗi kết nối");
        
        allChapters = await response.json(); 
        
        // Gọi hàm vẽ UI
        renderChapterList();

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: #ff6b6b;">Không thể kết nối đến kho dữ liệu Github.</p>';
    }
}

// ------------------------------------
// TÍNH NĂNG 1: VẼ DANH SÁCH & SẮP XẾP
// ------------------------------------
function renderChapterList() {
    const container = document.getElementById('chapters-container');
    container.innerHTML = '';
    
    if (allChapters.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Tác phẩm này hiện chưa có chương nào.</p>';
        return;
    }

    allChapters.forEach((issue, index) => {
        const date = new Date(issue.created_at).toLocaleDateString('vi-VN');
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <h3>${issue.title}</h3>
            <div class="chapter-meta">Cập nhật lúc: ${date}</div>
        `;
        card.onclick = () => openChapter(index);
        container.appendChild(card);
    });
}

function sortChapters() {
    const sortMode = document.getElementById('sort-select').value;
    
    // Thuật toán sắp xếp mảng dữ liệu
    if (sortMode === 'desc') {
        // Mới nhất -> Cũ nhất
        allChapters.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
        // Cũ nhất -> Mới nhất
        allChapters.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    // Vẽ lại danh sách sau khi đã sắp xếp
    renderChapterList();
}

// ------------------------------------
// TÍNH NĂNG 2: TÌM KIẾM TRUYỆN Ở SIDEBAR
// ------------------------------------
function filterStories() {
    const input = document.getElementById('search-story').value.toLowerCase();
    const items = document.querySelectorAll('.story-list li');
    
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        // Nếu tên truyện có chứa chữ gõ vào thì hiện, không thì ẩn đi
        if (text.includes(input)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ------------------------------------
// CÁC HÀM ĐIỀU HƯỚNG CŨ (Giữ nguyên)
// ------------------------------------
function openChapter(index) {
    currentIndex = index;
    const chapter = allChapters[index];
    const date = new Date(chapter.created_at).toLocaleDateString('vi-VN');
    
    showReadingView(chapter.title, date, chapter.body);
    updateNavButtons();
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    prevBtn.disabled = (currentIndex <= 0); 
    nextBtn.disabled = (currentIndex >= allChapters.length - 1); 
}

function navChapter(step) {
    const newIndex = currentIndex + step;
    if (newIndex >= 0 && newIndex < allChapters.length) {
        openChapter(newIndex);
    }
}

function showReadingView(title, date, body) {
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'block';
    document.getElementById('reading-title').innerText = title;
    document.getElementById('reading-meta').innerText = 'Đăng ngày: ' + date;
    document.getElementById('reading-body').innerHTML = body ? body.replace(/\n/g, '<br>') : "";
    document.querySelector('.main-content').scrollTop = 0;
}

function showListView() {
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
}

fetchChapters();