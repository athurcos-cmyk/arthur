// ==============================================================
// VARIÁVEIS GLOBAIS DE ESTADO
// ==============================================================
let currentSemIndex = 0;

// ==============================================================
// INICIALIZAÇÃO (BOOTSTRAP)
// ==============================================================
window.onload = () => {
    // 1. Renderizar componentes base
    renderCalendar();
    renderSemesterNav();
    
    // 2. Inicializar funcionalidades novas
    initTheme();        // Tema Claro/Escuro
    initHashRouting();  // Roteamento via URL (#)
    handleMobileSidebar(); // Eventos do menu mobile
    initFocusMode();    // Modo leitura
};

// ==============================================================
// A - CALENDÁRIO COM PRIORIDADES
// ==============================================================
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if(!container) return;

    container.innerHTML = ''; // Limpa antes de renderizar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    exams.forEach(exam => {
        // Parse data brasileira
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);

        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return; // Já passou

        // Definição de prioridade e cor (Requisito D)
        let priorityClass = 'priority-green';
        let color = 'var(--priority-green)';
        
        if (diffDays < 10) {
            priorityClass = 'priority-orange';
            color = 'var(--priority-orange)';
        }
        if (diffDays < 6) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
        }

        // Glow effect e animação via classe
        container.innerHTML += `
            <div class="card ${priorityClass} animate-fade-up" tabindex="0">
                <h3>${exam.name}</h3>
                <div class="days-left" style="color:${color}">${diffDays}</div>
                <small>dias restantes (${examDate.toLocaleDateString('pt-BR')})</small>
            </div>
        `;
    });
}

// ==============================================================
// B - NAVEGAÇÃO E ROTEAMENTO
// ==============================================================

// Inicializa o listener de Hash
function initHashRouting() {
    window.addEventListener('hashchange', parseHash);
    parseHash(); // Executa na carga inicial
}

// Interpreta a URL: #sem-0/mat-1/top-2
function parseHash() {
    const hash = location.hash.slice(1); // remove #
    
    // Se vazio, carrega default (semestre 0) e dashboard
    if(!hash) {
        loadSemester(0);
        showDashboard(false); // false = não mudar hash
        return;
    }

    const [semPart, matPart, topPart] = hash.split('/');
    
    // Extrai índices usando Regex
    const semIdx = semPart?.match(/sem-(\d+)/)?.[1];
    const matIdx = matPart?.match(/mat-(\d+)/)?.[1];
    const topIdx = topPart?.match(/top-(\d+)/)?.[1];

    if (semIdx !== undefined) {
        const sIdx = parseInt(semIdx);
        // Carrega semestre se mudou
        if (sIdx !== currentSemIndex || document.getElementById('disciplines-container').innerHTML === '') {
            loadSemester(sIdx);
        }
        
        // Se tiver matéria, abre o acordeão
        if (matIdx !== undefined) {
            const mIdx = parseInt(matIdx);
            setTimeout(() => { // Pequeno delay para garantir DOM
                expandDiscipline(mIdx);
                
                // Se tiver tópico, abre o conteúdo
                if (topIdx !== undefined) {
                    openTopic(sIdx, mIdx, parseInt(topIdx), false);
                } else {
                    // Se só tem matéria na hash, talvez mostrar dashboard? 
                    // Por padrão mantemos o estado atual.
                }
            }, 50);
        } else {
            showDashboard(false);
        }
    }
}

function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    nav.innerHTML = ''; // Limpa para evitar duplicatas
    db.forEach((sem, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-sem-${index}`;
        btn.innerText = sem.semester;
        btn.onclick = () => {
            location.hash = `#sem-${index}`;
            // loadSemester chamado pelo hashchange
        };
        nav.appendChild(btn);
    });
}

function loadSemester(index) {
    // Validação de índice
    if (index < 0 || index >= db.length) return;
    
    currentSemIndex = index;
    
    // Atualiza UI visual do Semestre (Requisito C)
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active-semester', i === index);
    });

    const sidebar = document.getElementById('disciplines-container');
    const title = document.getElementById('sidebar-title');
    sidebar.innerHTML = '';
    title.innerText = db[index].semester;

    db[index].subjects.forEach((sub, subIdx) => {
        // Botão Matéria
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.id = `disc-btn-${subIdx}`;
        btn.innerHTML = `<span>${sub.name}</span> <i class="fas fa-chevron-down" style="float:right; font-size:0.8em; margin-top:4px"></i>`;
        
        // Container Tópicos (Gaveta)
        const topicList = document.createElement('div');
        topicList.className = 'topic-submenu'; 
        topicList.id = `submenu-${subIdx}`; 
        
        // Click na Matéria (Expandir/Recolher)
        btn.onclick = () => {
            // Atualiza Hash se necessário ou apenas expande UI visual
            // Opção: ao clicar na matéria, não muda hash do tópico, apenas expande visualmente
            expandDiscipline(subIdx);
        };
        
        sidebar.appendChild(btn);

        // Tópicos
        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.id = `topic-link-${subIdx}-${topicIdx}`;
                link.innerText = topic.title;
                link.href = "javascript:void(0)"; // Evita reload padrão
                link.onclick = (e) => {
                    e.preventDefault();
                    // Atualiza Hash -> Dispara openTopic via listener
                    location.hash = `#sem-${index}/mat-${subIdx}/top-${topicIdx}`;
                };
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:10px 24px; font-size:0.85em; color:var(--text-muted)">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
}

// Função auxiliar para expandir visualmente a disciplina
function expandDiscipline(subIdx) {
    // Fecha outros
    document.querySelectorAll('.topic-submenu').forEach(el => {
        if(el.id !== `submenu-${subIdx}`) el.classList.remove('show');
    });
    document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active-discipline'));
    
    // Abre atual
    const targetSubmenu = document.getElementById(`submenu-${subIdx}`);
    const targetBtn = document.getElementById(`disc-btn-${subIdx}`);
    
    if (targetSubmenu && targetBtn) {
        targetSubmenu.classList.add('show');
        targetBtn.classList.add('active-discipline');
    }
}

// --- CARREGAR CONTEÚDO ---
async function openTopic(semIdx, subIdx, topIdx, updateHash = true) {
    if (updateHash) {
        location.hash = `#sem-${semIdx}/mat-${subIdx}/top-${topIdx}`;
        return; // Deixa o hashchange chamar de novo com false
    }

    // UI Updates
    markActiveTopic(subIdx, topIdx);
    closeMobileSidebar();

    const data = db[semIdx]?.subjects[subIdx]?.topics[topIdx];
    if (!data) return;

    // Troca visualização
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // Breadcrumb e Título
    document.getElementById('breadcrumb').innerText = `${db[semIdx].semester}  /  ${db[semIdx].subjects[subIdx].name}`;
    document.getElementById('topic-title').innerText = data.title;
    
    // Foco para acessibilidade (Requisito J/K)
    document.getElementById('topic-title').focus();

    // 1. TEXTO (Markdown)
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p class="loading-text">Carregando conteúdo...</p>';
    
    if (data.file) {
        try {
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro 404");
            const text = await response.text();
            
            // Parse Markdown
            textArea.innerHTML = marked.parse(text);
            
            // Gerar TOC após renderizar (Requisito F)
            generateTOC();
            
        } catch (e) {
            textArea.innerHTML = `<p style="color: var(--priority-red)">⚠️ Arquivo não encontrado: <b>${data.file}</b>.</p>`;
            document.getElementById('toc').innerHTML = '';
        }
    } else {
        textArea.innerHTML = '<p style="opacity:0.5">Sem resumo cadastrado.</p>';
        document.getElementById('toc').innerHTML = '';
    }

    // 2. SLIDES
    const slideArea = document.getElementById('slides-container');
    slideArea.innerHTML = '';
    if (data.slides && data.slides.length) {
        data.slides.forEach(s => {
            slideArea.innerHTML += `
                <a href="${s.url}" target="_blank" class="slide-link">
                    <i class="fas fa-file-pdf fa-2x" style="color: var(--priority-red)"></i>
                    <div><strong>${s.title}</strong><br><small>Abrir no Drive</small></div>
                </a>`;
        });
    } else {
        slideArea.innerHTML = '<p style="color:var(--text-muted)">Nenhum slide disponível.</p>';
    }

    // 3. VÍDEOS
    const videoArea = document.getElementById('videos-container');
    videoArea.innerHTML = '';
    if (data.videos && data.videos.length) {
        data.videos.forEach(v => {
            // Valida se tem URL e Título
            if(!v.url) return;
            videoArea.innerHTML += `
                <div class="video-container">
                    <p class="video-titulo">${v.title || 'Vídeo'}</p>
                    <div class="video-wrapper">
                        <iframe src="${v.url}" allowfullscreen loading="lazy" title="${v.title}"></iframe>
                    </div>
                </div>`;
        });
    } else {
        videoArea.innerHTML = '<p style="color:var(--text-muted)">Nenhum vídeo disponível.</p>';
    }

    // Volta para aba texto por padrão
    switchTab('text');
}

// Marca visualmente o link do tópico ativo na sidebar
function markActiveTopic(subIdx, topIdx) {
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    const activeLink = document.getElementById(`topic-link-${subIdx}-${topIdx}`);
    if (activeLink) activeLink.classList.add('active-topic');
}

// ==============================================================
// F - GERADOR AUTOMÁTICO DE TOC
// ==============================================================
function generateTOC() {
    const tocContainer = document.getElementById('toc');
    const content = document.getElementById('markdown-render');
    const headers = content.querySelectorAll('h1, h2, h3');
    
    tocContainer.innerHTML = ''; // Limpa
    
    if (headers.length < 2) { // Se tiver muito pouco conteúdo, esconde TOC
        tocContainer.style.display = 'none';
        return;
    }
    tocContainer.style.display = 'block';

    const title = document.createElement('h4');
    title.innerText = 'NESTA PÁGINA';
    tocContainer.appendChild(title);

    headers.forEach((header, index) => {
        // Cria ID se não existir para ancoragem
        if (!header.id) {
            header.id = `heading-${index}`;
        }

        const link = document.createElement('a');
        link.innerText = header.innerText;
        link.href = `#${header.id}`;
        link.className = 'toc-link';
        if (header.tagName === 'H3') link.classList.add('sub-item');

        link.onclick = (e) => {
            e.preventDefault();
            document.getElementById(header.id).scrollIntoView({ behavior: 'smooth' });
        };

        tocContainer.appendChild(link);
    });
}

// ==============================================================
// UI UTILS (Abas, Dashboard, Mobile)
// ==============================================================
function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    const panel = document.getElementById(`tab-${name}`);
    if(panel) panel.classList.add('active');
    
    // Mapeamento de botões
    const tabIndex = name === 'text' ? 0 : name === 'slides' ? 1 : 2;
    const btn = document.querySelectorAll('.tab')[tabIndex];
    if(btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }
}

function showDashboard(updateHash = true) {
    if(updateHash) location.hash = `#sem-${currentSemIndex}`; // Volta para a raiz do semestre
    
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('content-view').classList.remove('active');
    
    // Limpa seleção lateral
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    closeMobileSidebar();
}

// ==============================================================
// E - TEMA CLARO/ESCURO
// ==============================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('theme-toggle');
    const icon = btn.querySelector('i');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        icon.classList.replace('fa-moon', 'fa-sun');
        btn.setAttribute('aria-pressed', 'true');
    }
    
    btn.onclick = () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        
        // Troca Ícone
        if (isLight) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    };
}

// ==============================================================
// K - MENU MOBILE (Off-canvas)
// ==============================================================
function handleMobileSidebar() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-mobile');
    const sidebar = document.getElementById('sidebar-disciplines');
    const overlay = document.getElementById('sidebar-overlay');
    
    function open() {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Bloqueia scroll fundo
    }
    
    function close() {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    btn.onclick = open;
    closeBtn.onclick = close;
    overlay.onclick = close;
    
    // Fecha com ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
    });
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar-disciplines');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('visible');
        document.body.style.overflow = '';
    }
}

// ==============================================================
// G - FOCUS MODE (Modo Leitura)
// ==============================================================
function initFocusMode() {
    const btn = document.getElementById('focus-mode-btn');
    const icon = btn.querySelector('i');
    
    // Check session persistence
    if(sessionStorage.getItem('focusMode') === 'on') {
        document.body.classList.add('focus-mode');
        icon.classList.replace('fa-expand', 'fa-compress');
    }
    
    btn.onclick = () => {
        document.body.classList.toggle('focus-mode');
        const active = document.body.classList.contains('focus-mode');
        
        if(active) {
            icon.classList.replace('fa-expand', 'fa-compress');
            sessionStorage.setItem('focusMode', 'on');
            document.getElementById('topic-title').scrollIntoView();
        } else {
            icon.classList.replace('fa-compress', 'fa-expand');
            sessionStorage.removeItem('focusMode');
        }
    };
}