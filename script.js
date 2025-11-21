// ==============================================================
// 📦 VARIÁVEIS GLOBAIS DE ESTADO
// ==============================================================
let currentSemIndex = 0;   // Índice do semestre atual
let notesTimeout = null;   // Timer para o debounce das notas
let tocObserver = null;    // Observador para o destaque do TOC

// ==============================================================
// 🚀 INICIALIZAÇÃO (BOOTSTRAP)
// ==============================================================
// Função executada assim que a página termina de carregar
window.onload = () => {
    // 1. Renderizar componentes base da interface
    renderCalendar();       // Cria os cards de provas
    renderSemesterNav();    // Cria a navegação superior (Semestres)
    
    // 2. Inicializar funcionalidades do Core
    initTheme();            // Carrega tema (Dark/Light)
    initHashRouting();      // Liga o sistema de rotas (#sem-0/mat-1...)
    handleMobileSidebar();  // Configura abertura/fechamento do menu mobile
    initFocusMode();        // Configura o botão de foco (mesmo oculto)
    
    // 3. Inicializar Features Adicionais
    initSidebarDesktopToggle(); // Botão de esconder sidebar no PC
    initTOCToggle();            // Botão de índice no mobile
    initSearch();               // Barra de busca
    initNotes();                // Bloco de notas pessoal
};

// ==============================================================
// A - CALENDÁRIO COM PRIORIDADES
// ==============================================================
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if(!container) return;

    container.innerHTML = ''; 
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparar apenas datas
    
    exams.forEach(exam => {
        // Converte string "DD/MM/AAAA" para Objeto Date
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);

        // Calcula diferença em dias
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return; // Não mostra provas que já passaram

        // Lógica de Prioridade Visual (Cores e Textos)
        let priorityClass = 'priority-green';
        let color = 'var(--priority-green)';
        let displayDays = diffDays;
        let labelText = 'dias restantes';

        // Urgência: HOJE
        if (diffDays === 0) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "HOJE";
            labelText = "🚨 É HOJE!";
        } 
        // Urgência: AMANHÃ
        else if (diffDays === 1) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "1";
            labelText = "⚠️ É AMANHÃ!";
        } 
        // Urgência: Menos de 1 semana
        else if (diffDays < 6) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
        } 
        // Atenção: Menos de 10 dias
        else if (diffDays < 10) {
            priorityClass = 'priority-orange';
            color = 'var(--priority-orange)';
        }

        // Aumenta a fonte se for o dia da prova
        const fontSize = diffDays === 0 ? '1.8rem' : '2.5rem';

        // Injeta o Card no HTML
        container.innerHTML += `
            <div class="card ${priorityClass} animate-fade-up" tabindex="0">
                <h3>${exam.name}</h3>
                <div class="days-left" style="color:${color}; font-size: ${fontSize}">${displayDays}</div>
                <small>${labelText} (${examDate.toLocaleDateString('pt-BR')})</small>
            </div>
        `;
    });
}

// ==============================================================
// B - NAVEGAÇÃO E ROTEAMENTO (HASH ROUTING)
// ==============================================================
function initHashRouting() {
    // Escuta mudanças na URL após o #
    window.addEventListener('hashchange', parseHash);
    parseHash(); // Executa ao abrir a página
}

function parseHash() {
    const hash = location.hash.slice(1); // Remove o '#'
    
    // Se não tem hash, carrega o primeiro semestre e mostra Dashboard
    if(!hash) {
        loadSemester(0);
        showDashboard(false); 
        return;
    }

    // Extrai índices da URL: #sem-X/mat-Y/top-Z
    const [semPart, matPart, topPart] = hash.split('/');
    
    const semIdx = semPart?.match(/sem-(\d+)/)?.[1];
    const matIdx = matPart?.match(/mat-(\d+)/)?.[1];
    const topIdx = topPart?.match(/top-(\d+)/)?.[1];

    // Carrega o semestre se necessário
    if (semIdx !== undefined) {
        const sIdx = parseInt(semIdx);
        // Só recarrega sidebar se mudou de semestre ou está vazia
        if (sIdx !== currentSemIndex || document.getElementById('disciplines-container').innerHTML === '') {
            loadSemester(sIdx);
        }
        
        // Se tem matéria definida, expande e tenta abrir tópico
        if (matIdx !== undefined) {
            const mIdx = parseInt(matIdx);
            // Pequeno delay para garantir que o DOM da sidebar existe
            setTimeout(() => { 
                expandDiscipline(mIdx);
                if (topIdx !== undefined) {
                    openTopic(sIdx, mIdx, parseInt(topIdx), false);
                }
            }, 50);
        } else {
            // Se só tem semestre, mostra dashboard
            showDashboard(false);
        }
    }
}

function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    nav.innerHTML = ''; 
    // Cria botões para cada semestre disponível no data.js
    db.forEach((sem, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-sem-${index}`;
        btn.innerText = sem.semester;
        btn.onclick = () => {
            location.hash = `#sem-${index}`;
        };
        nav.appendChild(btn);
    });
}

function loadSemester(index) {
    if (index < 0 || index >= db.length) return;
    
    currentSemIndex = index;
    
    // Atualiza visual dos botões superiores
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active-semester', i === index);
    });

    const sidebar = document.getElementById('disciplines-container');
    const title = document.getElementById('sidebar-title');
    sidebar.innerHTML = '';
    title.innerText = db[index].semester;

    // Renderiza a lista de disciplinas na sidebar
    db[index].subjects.forEach((sub, subIdx) => {
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.id = `disc-btn-${subIdx}`;
        btn.innerHTML = `<span>${sub.name}</span> <i class="fas fa-chevron-down" style="float:right; font-size:0.8em; margin-top:4px"></i>`;
        
        // Container para os tópicos (submenu)
        const topicList = document.createElement('div');
        topicList.className = 'topic-submenu'; 
        topicList.id = `submenu-${subIdx}`; 
        
        btn.onclick = () => {
            expandDiscipline(subIdx);
        };
        
        sidebar.appendChild(btn);

        // Renderiza os links dos tópicos
        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.id = `topic-link-${subIdx}-${topicIdx}`;
                link.innerText = topic.title;
                link.href = "javascript:void(0)"; 
                link.onclick = (e) => {
                    e.preventDefault();
                    location.hash = `#sem-${index}/mat-${subIdx}/top-${topicIdx}`;
                };
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:10px 24px; font-size:0.85em; color:var(--text-muted)">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
    
    // Verifica se o usuário prefere sidebar oculta e aplica classe
    const isHidden = localStorage.getItem('sidebarHidden') === 'true';
    if(isHidden) document.body.classList.add('sidebar-hidden');
}

function expandDiscipline(subIdx) {
    // Fecha outros menus abertos (acordeão)
    document.querySelectorAll('.topic-submenu').forEach(el => {
        if(el.id !== `submenu-${subIdx}`) el.classList.remove('show');
    });
    document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active-discipline'));
    
    // Abre o atual
    const targetSubmenu = document.getElementById(`submenu-${subIdx}`);
    const targetBtn = document.getElementById(`disc-btn-${subIdx}`);
    
    if (targetSubmenu && targetBtn) {
        targetSubmenu.classList.add('show');
        targetBtn.classList.add('active-discipline');
    }
}

// ==============================================================
// C - CARREGAMENTO DE CONTEÚDO (TOPIC VIEWER)
// ==============================================================
async function openTopic(semIdx, subIdx, topIdx, updateHash = true) {
    if (updateHash) {
        location.hash = `#sem-${semIdx}/mat-${subIdx}/top-${topIdx}`;
        return; 
    }

    markActiveTopic(subIdx, topIdx);
    closeMobileSidebar(); // Fecha menu se estiver no celular

    const data = db[semIdx]?.subjects[subIdx]?.topics[topIdx];
    if (!data) return;

    // Troca a visualização: Esconde Dashboard, Mostra Conteúdo
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // Atualiza Breadcrumb e Título
    document.getElementById('breadcrumb').innerText = `${db[semIdx].semester}  /  ${db[semIdx].subjects[subIdx].name}`;
    const titleEl = document.getElementById('topic-title');
    titleEl.innerText = data.title;
    
    // Acessibilidade: foca no título para leitura
    titleEl.setAttribute('tabindex', '-1');
    titleEl.focus();

    // Carrega Notas Pessoais do LocalStorage
    loadNotes(semIdx, subIdx, topIdx);

    // 1. Renderiza TEXTO (Markdown)
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p class="loading-text">Carregando conteúdo...</p>';
    
    if (data.file) {
        try {
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro 404");
            const text = await response.text();
            
            // Converte Markdown para HTML
            textArea.innerHTML = marked.parse(text);
            
            // MELHORIA: Forçar links externos a abrirem em nova aba
            textArea.querySelectorAll('a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });

            // Gera o índice (TOC) e liga o observador de scroll
            generateTOC();
            initTOCObserver();
            
        } catch (e) {
            textArea.innerHTML = `<p style="color: var(--priority-red)">⚠️ Arquivo não encontrado: <b>${data.file}</b>.</p>`;
            document.getElementById('toc-content').innerHTML = '';
        }
    } else {
        textArea.innerHTML = '<p style="opacity:0.5">Sem resumo cadastrado.</p>';
        document.getElementById('toc-content').innerHTML = '';
    }

    // 2. Renderiza SLIDES
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

    // 3. Renderiza VÍDEOS
    const videoArea = document.getElementById('videos-container');
    videoArea.innerHTML = '';
    if (data.videos && data.videos.length) {
        data.videos.forEach(v => {
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

    // Reseta para a aba de Texto
    switchTab('text');
}

// Marca visualmente o tópico ativo na sidebar
function markActiveTopic(subIdx, topIdx) {
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    const activeLink = document.getElementById(`topic-link-${subIdx}-${topIdx}`);
    if (activeLink) activeLink.classList.add('active-topic');
}

// ==============================================================
// F - GERADOR AUTOMÁTICO DE TOC (ÍNDICE)
// ==============================================================
function generateTOC() {
    const tocContent = document.getElementById('toc-content');
    const tocContainer = document.getElementById('toc');
    const content = document.getElementById('markdown-render');
    const headers = content.querySelectorAll('h1, h2, h3');
    
    tocContent.innerHTML = ''; 
    
    // Se tiver poucos títulos, esconde o TOC
    if (headers.length < 2) { 
        tocContainer.style.display = 'none';
        return;
    }
    tocContainer.style.display = 'block';

    headers.forEach((header, index) => {
        // Cria IDs para os títulos se não existirem
        if (!header.id) header.id = `heading-${index}`;

        const link = document.createElement('a');
        link.innerText = header.innerText;
        link.href = `#${header.id}`;
        link.className = 'toc-link';
        link.dataset.target = header.id;
        
        // Indenta h3
        if (header.tagName === 'H3') link.classList.add('sub-item');

        // --- CORREÇÃO CRÍTICA DE SCROLL MOBILE ---
        link.onclick = (e) => {
            e.preventDefault();
            
            const container = document.getElementById('main-content');
            const targetElement = document.getElementById(header.id);
            
            if (container && targetElement) {
                // Calcula a posição exata dentro do container scrollável
                // Isso evita que o body role e esconda o header no mobile
                const topPos = targetElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
                
                container.scrollTo({
                    top: topPos - 20, // Margem de respiro
                    behavior: 'smooth'
                });
            }

            // Fecha overlay no mobile se estiver aberto
            if(window.innerWidth <= 1024) {
                document.getElementById('toc').classList.remove('visible');
            }
        };
        tocContent.appendChild(link);
    });
}

// Observer: Destaca o item do TOC enquanto rola a página
function initTOCObserver() {
    if (tocObserver) tocObserver.disconnect();

    const options = { root: null, rootMargin: '-100px 0px -60% 0px', threshold: 0 };
    
    tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.toc-link').forEach(link => {
                    link.classList.toggle('toc-link--active', link.dataset.target === id);
                });
            }
        });
    }, options);

    document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3').forEach(h => {
        tocObserver.observe(h);
    });
}

// Configura botão de abrir/fechar TOC no mobile
function initTOCToggle() {
    const btn = document.getElementById('toc-toggle-btn');
    const toc = document.getElementById('toc');
    const close = document.getElementById('toc-close-mobile');
    
    if(btn) btn.onclick = () => toc.classList.toggle('visible');
    if(close) close.onclick = () => toc.classList.remove('visible');
}

// ==============================================================
// FEATURE: SIDEBAR DESKTOP TOGGLE
// ==============================================================
function initSidebarDesktopToggle() {
    const btn = document.getElementById('sidebar-toggle-desktop');
    
    // Recupera preferência salva
    if (localStorage.getItem('sidebarHidden') === 'true') {
        document.body.classList.add('sidebar-hidden');
    }

    if (btn) {
        btn.onclick = toggleSidebarDesktop;
    }
}

function toggleSidebarDesktop() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebarHidden', isHidden);
}

// ==============================================================
// FEATURE: BUSCA GLOBAL SIMPLES
// ==============================================================
let searchIndex = [];

function initSearch() {
    const input = document.getElementById('global-search');
    const resultsBox = document.getElementById('search-results');
    
    // Cria um índice plano de todo o conteúdo
    db.forEach((sem, sIdx) => {
        sem.subjects.forEach((mat, mIdx) => {
            mat.topics.forEach((top, tIdx) => {
                searchIndex.push({
                    label: `${mat.name}: ${top.title}`,
                    keywords: `${sem.semester} ${mat.name} ${top.title}`.toLowerCase(),
                    hash: `#sem-${sIdx}/mat-${mIdx}/top-${tIdx}`
                });
            });
        });
    });

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsBox.innerHTML = '';
        
        if(term.length < 2) {
            resultsBox.style.display = 'none';
            return;
        }

        const filtered = searchIndex.filter(item => item.keywords.includes(term));
        
        if(filtered.length > 0) {
            resultsBox.style.display = 'block';
            filtered.slice(0, 10).forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>${item.label.split(':')[1]}</strong><small>${item.label.split(':')[0]}</small>`;
                div.onclick = () => {
                    location.hash = item.hash;
                    input.value = '';
                    resultsBox.style.display = 'none';
                };
                resultsBox.appendChild(div);
            });
        } else {
            // Feedback visual se nada for encontrado
            resultsBox.style.display = 'block';
            resultsBox.innerHTML = '<div class="search-item" style="cursor:default; color:var(--text-muted);">Nenhum resultado encontrado.</div>';
        }
    });

    // Fecha busca ao clicar fora
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.search-container')) {
            resultsBox.style.display = 'none';
        }
    });
}

// ==============================================================
// FEATURE: NOTAS PESSOAIS (LOCALSTORAGE)
// ==============================================================
let currentNoteKey = '';

function initNotes() {
    const txt = document.getElementById('notes-textarea');
    const btnClear = document.getElementById('notes-clear');
    
    if(txt) {
        // Salva automaticamente após parar de digitar (debounce)
        txt.addEventListener('input', () => {
            if(notesTimeout) clearTimeout(notesTimeout);
            notesTimeout = setTimeout(saveNotes, 400); 
        });
    }
    if(btnClear) {
        btnClear.onclick = () => {
            if(confirm('Apagar notas deste tópico?')) {
                txt.value = '';
                saveNotes();
            }
        };
    }
}

function loadNotes(s, m, t) {
    currentNoteKey = `notes::sem-${s}::mat-${m}::top-${t}`;
    const saved = localStorage.getItem(currentNoteKey) || '';
    const txt = document.getElementById('notes-textarea');
    if(txt) txt.value = saved;
    document.getElementById('notes-saved-indicator').classList.remove('visible');
}

function saveNotes() {
    if(!currentNoteKey) return;
    const txt = document.getElementById('notes-textarea');
    localStorage.setItem(currentNoteKey, txt.value);
    
    // Feedback visual "Salvo"
    const indicator = document.getElementById('notes-saved-indicator');
    indicator.classList.add('visible');
    setTimeout(() => indicator.classList.remove('visible'), 2000);
}

// ==============================================================
// UTILITÁRIOS DE UI (TABS, DASHBOARD)
// ==============================================================
function switchTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    const panel = document.getElementById(`tab-${name}`);
    if(panel) panel.classList.add('active');
    
    const tabIndex = name === 'text' ? 0 : name === 'slides' ? 1 : 2;
    const btn = document.querySelectorAll('.tab')[tabIndex];
    if(btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }
}

function showDashboard(updateHash = true) {
    if(updateHash) location.hash = `#sem-${currentSemIndex}`; 
    
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('content-view').classList.remove('active');
    
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    closeMobileSidebar();
}

// ==============================================================
// TEMA (DARK/LIGHT) & MENU MOBILE
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
        
        if (isLight) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    };
}

function handleMobileSidebar() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-sidebar-mobile');
    const sidebar = document.getElementById('sidebar-disciplines');
    const overlay = document.getElementById('sidebar-overlay');
    
    function open() {
        sidebar.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; 
    }
    
    function close() {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    btn.onclick = open;
    closeBtn.onclick = close;
    overlay.onclick = close;
    
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
// MODO FOCO (FIX: Sempre inicia desligado para segurança)
// ==============================================================
function initFocusMode() {
    const btn = document.getElementById('focus-mode-btn');
    
    // Garante que o modo foco comece desligado para evitar bugs visuais
    document.body.classList.remove('focus-mode');
    sessionStorage.removeItem('focusMode');

    if(btn) {
        btn.onclick = () => {
            document.body.classList.toggle('focus-mode');
            const active = document.body.classList.contains('focus-mode');
            if(active) {
                sessionStorage.setItem('focusMode', 'on');
            } else {
                sessionStorage.removeItem('focusMode');
            }
        };
    }
}