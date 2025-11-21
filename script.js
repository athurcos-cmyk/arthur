// Variáveis de Estado
let currentSemIndex = 0;

// Inicialização
window.onload = () => {
    loadTheme(); 
    renderCalendar();
    renderSemesterNav();
    loadSemester(0);
};

// --- TEMA ---
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
    if (!container) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    container.innerHTML = '';

    exams.forEach(exam => {
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return;

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
    if (!nav) return;
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
    if (!sidebar) return;
    
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
                    document.querySelectorAll('.topic-link').forEach(t => t.classList.remove('active'));
                    link.classList.add('active');
                    openTopic(index, subIdx, topicIdx);
                    if(window.innerWidth <= 768) toggleSidebar();
                };
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:15px 25px; font-size:0.85em; color:var(--text-muted); font-style:italic">Conteúdo em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
}

// --- CARREGAR CONTEÚDO (A PARTE CRÍTICA) ---
async function openTopic(semIdx, subIdx, topIdx) {
    const data = db[semIdx].subjects[subIdx].topics[topIdx];
    
    // Troca a tela
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // Atualiza Título
    document.getElementById('topic-title').innerText = data.title;
    document.getElementById('breadcrumb').innerText = `${db[semIdx].subjects[subIdx].name} > ${data.title}`;

    // Área de Texto
    const textArea = document.getElementById('markdown-render');
    textArea.style.display = 'block'; // Garante que está visível
    textArea.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted)"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Carregando...</div>';
    
    if (data.file) {
        try {
            // 1. Tenta buscar o arquivo
            const response = await fetch(data.file);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} (Arquivo não encontrado)`);
            }
            
            const text = await response.text();

            // 2. Verifica se a biblioteca 'marked' existe
            if (typeof marked === 'undefined') {
                // Se não existir (offline/erro), mostra texto puro
                textArea.innerHTML = `
                    <div style="padding:15px; background:#332a00; color:#ffcc00; border-radius:8px; margin-bottom:20px;">
                        ⚠️ Modo Offline: Formatador não carregou. Mostrando texto simples.
                    </div>
                    <pre style="white-space: pre-wrap; font-family: inherit; color: var(--text-main);">${text}</pre>
                `;
            } else {
                // Se existir, formata bonito
                textArea.innerHTML = marked.parse(text);
            }

        } catch (e) {
            // 3. Se der erro no fetch (CORS ou 404)
            console.error(e);
            textArea.innerHTML = `
                <div style="padding:20px; background:#2a0000; border:1px solid #ff5555; border-radius:8px; color:#ffaaaa;">
                    <h3 style="color:#ff5555; margin-top:0"><i class="fas fa-exclamation-triangle"></i> Erro ao abrir arquivo</h3>
                    <p>Não foi possível ler: <b>${data.file}</b></p>
                    <p><b>Motivo:</b> ${e.message}</p>
                    <hr style="border-color:#ff5555; opacity:0.3">
                    <small>DICA: Se estiver no PC, use a extensão <b>Live Server</b> no VS Code.<br>Arquivos locais são bloqueados pelo navegador por segurança.</small>
                </div>
            `;
        }
    } else {
        textArea.innerHTML = '<p style="opacity:0.5">Este tópico ainda não tem resumo escrito.</p>';
    }

    // Slides
    const slideArea = document.getElementById('slides-container');
    slideArea.innerHTML = '';
    if (data.slides && data.slides.length > 0) {
        data.slides.forEach(s => {
            slideArea.innerHTML += `
                <a href="${s.url}" target="_blank" class="slide-link">
                    <div style="background:#f40f02; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px; color:white">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div>
                        <strong style="display:block; color:var(--text-main)">${s.title}</strong>
                        <small style="color:var(--text-muted)">Clique para abrir</small>
                    </div>
                </a>`;
        });
    } else {
        slideArea.innerHTML = '<div style="opacity:0.5; font-style:italic">Sem slides.</div>';
    }

    // Videos
    const videoArea = document.getElementById('videos-container');
    videoArea.innerHTML = '';
    if (data.videos && data.videos.length > 0) {
        data.videos.forEach(v => {
            videoArea.innerHTML += `
                <div class="video-container">
                    <p class="video-titulo"><i class="fas fa-play-circle"></i> ${v.title}</p>
                    <div class="video-wrapper">
                        <iframe src="${v.url}" allowfullscreen loading="lazy"></iframe>
                    </div>
                </div>`;
        });
    } else {
        videoArea.innerHTML = '<div style="opacity:0.5; font-style:italic">Sem vídeos.</div>';
    }

    // Força voltar para a primeira aba
    switchTab('text');
}

function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    const target = document.getElementById(`tab-${name}`);
    if (target) target.classList.add('active');
    
    const tabs = document.querySelectorAll('.tab');
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