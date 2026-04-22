/* =========================================
   CẤU HÌNH API
========================================= */
const GITHUB_USERNAME = 'hanhercales'; 
const REPO_NAME = 'Blog';            
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/issues?creator=${GITHUB_USERNAME}&state=open&sort=created&direction=asc`;

let allIssues = [];        
let storiesMap = {};       
let homeStories = [];      // (MỚI) Lưu danh sách truyện ở trang chủ để sắp xếp
let currentStoryName = ""; 
let currentChapters = [];  
let currentIndex = -1;     

/* =========================================
   BƯỚC 1: LẤY VÀ PHÂN LOẠI DỮ LIỆU
========================================= */
async function fetchAndProcessData() {
    const grid = document.getElementById('stories-grid');
    grid.innerHTML = '<p>Đang đồng bộ dữ liệu từ thư viện...</p>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Lỗi kết nối");
        
        allIssues = await response.json();
        
        storiesMap = {};
        allIssues.forEach(issue => {
            const storyName = issue.labels.length > 0 ? issue.labels[0].name : "Truyện ngắn / Chưa phân loại";
            if (!storiesMap[storyName]) {
                storiesMap[storyName] = [];
            }
            storiesMap[storyName].push(issue);
        });

        // (MỚI) Chuyển object Map thành mảng để dễ sắp xếp
        homeStories = Object.keys(storiesMap).map(name => {
            return { name: name, count: storiesMap[name].length };
        });

        // Kích hoạt hàm sắp xếp lần đầu (mặc định A-Z) và vẽ UI
        sortHomeStories();
        renderSidebar();

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: #ff6b6b;">Không thể kết nối đến kho dữ liệu Github.</p>';
    }
}

/* =========================================
   BƯỚC 2: VẼ GIAO DIỆN TRANG CHỦ & SIDEBAR
========================================= */
// (MỚI) Hàm sắp xếp truyện ở trang chủ
function sortHomeStories() {
    const sortMode = document.getElementById('sort-home-select').value;
    
    if (sortMode === 'az') {
        homeStories.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortMode === 'za') {
        homeStories.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sortMode === 'most') {
        homeStories.sort((a, b) => b.count - a.count); // Giảm dần
    } else if (sortMode === 'least') {
        homeStories.sort((a, b) => a.count - b.count); // Tăng dần
    }
    
    renderHomeView();
}

function renderHomeView() {
    const grid = document.getElementById('stories-grid');
    grid.innerHTML = '';
    
    if (homeStories.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">Hiện chưa có tác phẩm nào.</p>';
        return;
    }

    // Vẽ từng thẻ truyện dựa trên mảng homeStories đã được sắp xếp
    homeStories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card-home';
        card.innerHTML = `
            <h3>${story.name}</h3>
            <span class="badge">${story.count} Chương</span>
        `;
        card.onclick = () => openStory(story.name);
        grid.appendChild(card);
    });

    // Chạy lại bộ lọc tìm kiếm phòng trường hợp người dùng vừa gõ tìm vừa ấn sắp xếp
    filterHomeStories(); 
}

function renderSidebar() {
    const list = document.getElementById('sidebar-story-list');
    list.innerHTML = '';
    homeStories.forEach(story => {
        const li = document.createElement('li');
        li.innerText = story.name;
        li.onclick = () => {
            openStory(story.name);
            if (window.innerWidth <= 768) toggleSidebar(); 
        };
        list.appendChild(li);
    });
}

function filterHomeStories() {
    const input = document.getElementById('search-story').value.toLowerCase();
    const cards = document.querySelectorAll('.story-card-home');
    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(input) ? 'flex' : 'none';
    });
}

/* =========================================
   BƯỚC 3: XỬ LÝ KHI CLICK VÀO MỘT TRUYỆN
========================================= */
function openStory(storyName) {
    currentStoryName = storyName;
    currentChapters = [...storiesMap[storyName]]; // Copy mảng để sort không ảnh hưởng gốc
    
    document.getElementById('current-story-title').innerText = storyName;
    
    // Đổi view
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
    
    // Sort mặc định là cũ đến mới
    document.getElementById('sort-select').value = 'asc';
    sortChapters(); 
}

function sortChapters() {
    const sortMode = document.getElementById('sort-select').value;
    if (sortMode === 'desc') {
        currentChapters.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
        currentChapters.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    renderChapterList();
}

function renderChapterList() {
    const container = document.getElementById('chapters-container');
    container.innerHTML = '';
    document.getElementById('chapter-count-meta').innerText = `Tổng cộng: ${currentChapters.length} chương`;

    currentChapters.forEach((chapter, index) => {
        const date = new Date(chapter.created_at).toLocaleDateString('vi-VN');
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <h3>${chapter.title}</h3>
            <div class="chapter-meta">Cập nhật lúc: ${date}</div>
        `;
        card.onclick = () => openChapter(index);
        container.appendChild(card);
    });
}

/* =========================================
   BƯỚC 4: XỬ LÝ KHI CLICK ĐỌC CHƯƠNG
========================================= */
function openChapter(index) {
    currentIndex = index;
    const chapter = currentChapters[index];
    const date = new Date(chapter.created_at).toLocaleDateString('vi-VN');
    
    // Ẩn/Hiện view
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'block';
    
    // Đổ dữ liệu
    document.getElementById('reading-title').innerText = chapter.title;
    document.getElementById('reading-meta').innerText = `Tác phẩm: ${currentStoryName} | Đăng ngày: ${date}`;
    document.getElementById('reading-body').innerHTML = chapter.body ? chapter.body.replace(/\n/g, '<br>') : "";
    
    // Cuộn lên top & Cập nhật nút điều hướng
    document.querySelector('.main-content').scrollTop = 0;
    updateNavButtons();
}

function updateNavButtons() {
    document.getElementById('prev-btn').disabled = (currentIndex <= 0); 
    document.getElementById('next-btn').disabled = (currentIndex >= currentChapters.length - 1); 
}

function navChapter(step) {
    const newIndex = currentIndex + step;
    if (newIndex >= 0 && newIndex < currentChapters.length) {
        openChapter(newIndex);
    }
}

/* =========================================
   CÁC NÚT ĐIỀU HƯỚNG QUAY LẠI VÀ MOBILE
========================================= */
function showHomeView() {
    document.getElementById('list-view').style.display = 'none';
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

function showListView() {
    document.getElementById('reading-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

// Khởi động vòng lặp lấy dữ liệu
fetchAndProcessData();