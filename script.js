// Variáveis de Estado
let currentSemIndex = 0;

// Inicialização
window.onload = () => {
    renderCalendar();
    renderSemesterNav();
    loadSemester(0);
};

// --- LÓGICA DO CALENDÁRIO ---
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    exams.forEach(exam => {
        // Converte data brasileira (dd/mm/yyyy)
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);

        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return;

        let color = '#4caf50'; // Verde
        if (diffDays < 10) color = '#ff9800'; // Laranja
        if (diffDays < 6) color = '#d32f2f';  // Vermelho

        container.innerHTML += `
            <div class="card">
                <h3 style="color:white">${exam.name}</h3>
                <div style="font-size:2em; color:${color}; margin:10px 0; font-weight:bold">${diffDays}</div>
                <small>${examDate.toLocaleDateString('pt-BR')}</small>
            </div>
        `;
    });
}

// --- LÓGICA DE NAVEGAÇÃO ---
function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    db.forEach((sem, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = sem.semester;
        btn.onclick = () => loadSemester(index);
        nav.appendChild(btn);
    });
}

function loadSemester(index) {
    currentSemIndex = index;
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    const sidebar = document.getElementById('disciplines-container');
    const title = document.getElementById('sidebar-title');
    sidebar.innerHTML = '';
    title.innerText = db[index].semester;

    db[index].subjects.forEach((sub, subIdx) => {
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.innerHTML = `<b>${sub.name}</b>`;
        
        // Gaveta de tópicos
        const topicList = document.createElement('div');
        topicList.className = 'topic-submenu'; 
        topicList.id = `submenu-${subIdx}`; 
        
        btn.onclick = () => {
            document.querySelectorAll('.topic-submenu').forEach(el => {
                if(el.id !== `submenu-${subIdx}`) el.classList.remove('show');
            });
            document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active'));
            
            btn.classList.toggle('active');
            topicList.classList.toggle('show');
        };
        
        sidebar.appendChild(btn);

        // Tópicos
        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.innerHTML = `${topic.title}`;
                link.onclick = () => openTopic(index, subIdx, topicIdx);
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:10px 20px; font-size:0.8em; color:#555">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
}

// --- CARREGAR CONTEÚDO ---
async function openTopic(semIdx, subIdx, topIdx) {
    // 1. FECHA O MENU NO CELULAR (Se estiver aberto)
    const sidebar = document.querySelector('.sidebar-disciplines');
    if (sidebar) sidebar.classList.remove('open');

    // 2. CARREGA OS DADOS
    const data = db[semIdx].subjects[subIdx].topics[topIdx];
    
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    document.getElementById('breadcrumb').innerText = `${db[semIdx].semester} > ${db[semIdx].subjects[subIdx].name}`;
    document.getElementById('topic-title').innerText = data.title;

    // Texto
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p>Carregando...</p>';
    
    if (data.file) {
        try {
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro 404");
            const text = await response.text();
            textArea.innerHTML = marked.parse(text);
        } catch (e) {
            textArea.innerHTML = `<p style="color: #ff5555">⚠️ Não achei: <b>${data.file}</b>.</p>`;
        }
    } else {
        textArea.innerHTML = '<p style="opacity:0.5">Sem resumo cadastrado.</p>';
    }

    // Slides
    const slideArea = document.getElementById('slides-container');
    slideArea.innerHTML = '';
    if (data.slides) {
        data.slides.forEach(s => {
            slideArea.innerHTML += `
                <a href="${s.url}" target="_blank" class="slide-link">
                    <i class="fas fa-file-pdf fa-2x"></i>
                    <div><strong>${s.title}</strong><br><small>Abrir</small></div>
                </a>`;
        });
    }

    // Videos
const videoArea = document.getElementById('videos-container');
videoArea.innerHTML = '';
if (data.videos) {
    data.videos.forEach(v => {
        videoArea.innerHTML += `
            <div class="video-container">
                <p class="video-titulo">${v.title}</p>
                
                <div class="video-wrapper">
                    <iframe src="${v.url}" allowfullscreen loading="lazy"></iframe>
                </div>
            </div>`;
    });
}
    switchTab('text');
}

function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${name}`).classList.add('active');
    
    const tabs = document.querySelectorAll('.tab');
    if(name === 'text') tabs[0].classList.add('active');
    if(name === 'slides') tabs[1].classList.add('active');
    if(name === 'video') tabs[2].classList.add('active');
}

function showDashboard() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('content-view').classList.remove('active');
}

// --- FUNÇÃO DO MENU MOBILE ---
function toggleSidebar() {
    const sidebar = document.getElementById('disciplines-container').parentElement;
    sidebar.classList.toggle('open');
}

