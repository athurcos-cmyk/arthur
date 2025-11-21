// Variáveis de Estado
let currentSemIndex = 0;

// Inicialização
window.onload = () => {
    loadTheme(); // Carrega o tema (Nova funcionalidade)
    renderCalendar();
    renderSemesterNav();
    loadSemester(0);
};

// --- TEMA (SOL/LUA) ---
function loadTheme() {
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    
    if (current === 'light') {
        html.removeAttribute('data-theme');
        localStorage.setItem('siteTheme', 'dark');
        updateThemeIcon(false);
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('siteTheme', 'light');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isLight) {
    const icon = document.querySelector('#theme-toggle i');
    if(icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    container.innerHTML = '';

    exams.forEach(exam => {
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return;

        // Cores e Classes para o CSS novo
        let color = 'var(--accent)';
        let statusText = "dias restantes";
        let cardClass = ""; 

        if (diffDays < 10) { color = '#ff9800'; cardClass = "atencao"; }
        if (diffDays < 6) { color = '#ff5555'; cardClass = "perigo"; }
        if (diffDays === 0) { statusText = "É HOJE!"; color = "#ff5555"; cardClass = "perigo"; }

        container.innerHTML += `
            <div class="card ${cardClass}">
                <h3 style="color:var(--text-muted); font-size:0.9rem; text-transform:uppercase; margin-bottom:10px;">${exam.name}</h3>
                <div style="font-size:2.5rem; color:${color}; font-weight:700; line-height:1">${diffDays}</div>
                <small style="color:var(--text-muted)">${statusText}</small>
                <div style="margin-top:15px; font-size:0.85rem; color:var(--text-main); border-top:1px solid var(--divider); padding-top:10px;">
                    <i class="far fa-calendar-alt"></i> ${examDate.toLocaleDateString('pt-BR')}
                </div>
            </div>
        `;
    });
}

// --- NAVEGAÇÃO ---
function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    nav.innerHTML = '';
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
    if(title) title.innerText = db[index].semester;

    db[index].subjects.forEach((sub, subIdx) => {
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.innerHTML = `${sub.name} <i class="fas fa-chevron-down" style="float:right; font-size:0.8em; margin-top:4px; opacity:0.5"></i>`;
        
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

        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.innerHTML = `<i class="fas fa-circle" style="font-size:0.4em; margin-right:10px; opacity:0.6"></i> ${topic.title}`;
                
                link.onclick = () => {
                    // Destaque visual (Novo)
                    document.querySelectorAll('.topic-link').forEach(t => t.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Fecha menu no celular
                    if(window.innerWidth <= 768) toggleSidebar();

                    // Carrega conteúdo (Lógica Antiga)
                    openTopic(index, subIdx, topicIdx);
                };
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:15px 25px; font-size:0.85em; color:var(--text-muted); font-style:italic">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
}

// --- CARREGAR CONTEÚDO (LÓGICA RESTAURADA DO BACKUP) ---
async function openTopic(semIdx, subIdx, topIdx) {
    const data = db[semIdx].subjects[subIdx].topics[topIdx];
    
    // 1. Troca a tela imediatamente
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // 2. Preenche Títulos
    document.getElementById('breadcrumb').innerText = `${db[semIdx].subjects[subIdx].name} > ${data.title}`;
    document.getElementById('topic-title').innerText = data.title;

    // 3. Reseta e Carrega Texto
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">Carregando resumo...</p>';
    
    if (data.file) {
        try {
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro ao carregar");
            const text = await response.text();
            
            // Se 'marked' estiver disponível, usa. Se não, texto puro.
            if (typeof marked !== 'undefined') {
                textArea.innerHTML = marked.parse(text);
            } else {
                textArea.innerHTML = `<pre>${text}</pre>`;
            }
        } catch (e) {
            textArea.innerHTML = `<p style="color: #ff5555; padding: 20px; border: 1px solid #ff5555; border-radius: 8px;">
                ⚠️ Não achei: <b>${data.file}</b>.<br>
                <small>Se estiver no PC, abra com "Live Server".</small>
            </p>`;
        }
    } else {
        textArea.innerHTML = '<p style="opacity:0.5; padding: 20px;">Sem resumo cadastrado.</p>';
    }

    // 4. Slides
    const slideArea = document.getElementById('slides-container');
    slideArea.innerHTML = '';
    if (data.slides) {
        data.slides.forEach(s => {
            slideArea.innerHTML += `
                <a href="${s.url}" target="_blank" class="slide-link">
                    <div style="background:#f40f02; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; color:white"><i class="fas fa-file-pdf"></i></div>
                    <div><strong>${s.title}</strong><br><small>Abrir</small></div>
                </a>`;
        });
    }

    // 5. Vídeos
    const videoArea = document.getElementById('videos-container');
    videoArea.innerHTML = '';
    if (data.videos) {
        data.videos.forEach(v => {
            videoArea.innerHTML += `
                <div class="video-container">
                    <p class="video-titulo"><i class="fas fa-play-circle"></i> ${v.title}</p>
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
    
    const target = document.getElementById(`tab-${name}`);
    if (target) target.classList.add('active');
    
    const tabs = document.querySelectorAll('.tab');
    // Garante que as abas acendam corretamente
    if(name === 'text' && tabs[0]) tabs[0].classList.add('active');
    if(name === 'slides' && tabs[1]) tabs[1].classList.add('active');
    if(name === 'video' && tabs[2]) tabs[2].classList.add('active');
}

function showDashboard() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('content-view').classList.remove('active');
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-disciplines');
    if(sidebar) sidebar.classList.toggle('open');
}