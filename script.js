// ==============================================================
// 📦 VARIÁVEIS GLOBAIS DE ESTADO
// ==============================================================
// Armazenam o estado atual da aplicação para controle
let currentSemIndex = 0;   // Índice do semestre atual exibido
let notesTimeout = null;   // Timer para controlar o salvamento automático (debounce)
let tocObserver = null;    // Observador que destaca o item do índice enquanto rola

// ==============================================================
// 🚀 INICIALIZAÇÃO (BOOTSTRAP)
// ==============================================================
// Função executada automaticamente assim que a página termina de carregar
window.onload = () => {
    // 1. Renderizar componentes visuais base
    renderCalendar();       // Cria os cards de contagem regressiva das provas
    renderSemesterNav();    // Cria os botões de navegação dos semestres
    
    // 2. Inicializar configurações e rotas
    initTheme();            // Verifica e aplica o tema (Dark/Light) salvo
    initHashRouting();      // Liga o sistema de navegação por URL (#sem-0/mat-1...)
    handleMobileSidebar();  // Configura a abertura do menu no celular
    initFocusMode();        // Configura o botão de modo leitura (mesmo que oculto)
    
    // 3. Inicializar Funcionalidades Extras
    initSidebarDesktopToggle(); // Botão de esconder a barra lateral no PC
    initTOCToggle();            // Botão de abrir o índice no celular
    initSearch();               // Barra de busca global
    initNotes();                // Sistema de anotações pessoais
    
    // O Zoom de imagem é iniciado dentro de openTopic quando o conteúdo carrega
};

// ==============================================================
// A - CALENDÁRIO DE PROVAS (COM PRIORIDADE E URGÊNCIA)
// ==============================================================
function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if(!container) return; // Segurança: se não achar o container, para.

    container.innerHTML = ''; // Limpa o calendário anterior
    
    // Data de hoje zerada (00:00:00) para comparação justa de dias
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Loop por todas as provas cadastradas no data.js
    exams.forEach(exam => {
        // Converte string "DD/MM/AAAA" para objeto Date do JS
        const parts = exam.date.split('/');
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);

        // Calcula a diferença em milissegundos e converte para dias
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return; // Não mostra provas que já passaram

        // Definição das Cores e Textos de Urgência
        let priorityClass = 'priority-green'; // Padrão: Verde (Tranquilo)
        let color = 'var(--priority-green)';
        let displayDays = diffDays;
        let labelText = 'dias restantes';

        // Nível Crítico: HOJE
        if (diffDays === 0) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "HOJE";
            labelText = "🚨 É HOJE!";
        } 
        // Nível Crítico: AMANHÃ
        else if (diffDays === 1) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "1";
            labelText = "⚠️ É AMANHÃ!";
        } 
        // Nível Alto: Menos de uma semana
        else if (diffDays < 6) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
        } 
        // Nível Médio: Menos de 10 dias
        else if (diffDays < 10) {
            priorityClass = 'priority-orange';
            color = 'var(--priority-orange)';
        }

        // Ajuste visual: Aumenta a fonte se for o dia da prova
        const fontSize = diffDays === 0 ? '1.8rem' : '2.5rem';

        // Cria o HTML do card
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
// B - SISTEMA DE ROTEAMENTO (HASH ROUTING)
// ==============================================================
// Permite que o site funcione sem recarregar, lendo o #na-url
function initHashRouting() {
    window.addEventListener('hashchange', parseHash); // Escuta quando a URL muda
    parseHash(); // Executa a primeira vez ao abrir
}

function parseHash() {
    const hash = location.hash.slice(1); // Pega tudo depois do #
    
    // Se não tiver hash (está na home), carrega o semestre 0
    if(!hash) {
        loadSemester(0);
        showDashboard(false); 
        return;
    }

    // Quebra a URL em partes: sem-0 / mat-2 / top-4
    const [semPart, matPart, topPart] = hash.split('/');
    
    // Extrai apenas os números usando Regex
    const semIdx = semPart?.match(/sem-(\d+)/)?.[1];
    const matIdx = matPart?.match(/mat-(\d+)/)?.[1];
    const topIdx = topPart?.match(/top-(\d+)/)?.[1];

    // Lógica de carregamento em cascata
    if (semIdx !== undefined) {
        const sIdx = parseInt(semIdx);
        
        // Carrega a sidebar se mudou de semestre ou se está vazia
        if (sIdx !== currentSemIndex || document.getElementById('disciplines-container').innerHTML === '') {
            loadSemester(sIdx);
        }
        
        // Se tiver matéria na URL, abre o menu dela
        if (matIdx !== undefined) {
            const mIdx = parseInt(matIdx);
            
            // Pequeno delay para garantir que o HTML da sidebar foi criado
            setTimeout(() => { 
                expandDiscipline(mIdx);
                
                // Se tiver tópico na URL, carrega o conteúdo
                if (topIdx !== undefined) {
                    openTopic(sIdx, mIdx, parseInt(topIdx), false);
                }
            }, 50);
        } else {
            // Se tiver só o semestre, mostra o painel de provas
            showDashboard(false);
        }
    }
}

// Renderiza os botões de semestres no topo
function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    nav.innerHTML = ''; 
    
    db.forEach((sem, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-sem-${index}`;
        btn.innerText = sem.semester;
        
        // Ao clicar, muda o Hash (o que dispara o parseHash)
        btn.onclick = () => {
            location.hash = `#sem-${index}`;
        };
        nav.appendChild(btn);
    });
}

// Carrega a lista de disciplinas na barra lateral
function loadSemester(index) {
    if (index < 0 || index >= db.length) return;
    
    currentSemIndex = index;
    
    // Atualiza estilo do botão ativo no topo
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active-semester', i === index);
    });

    const sidebar = document.getElementById('disciplines-container');
    const title = document.getElementById('sidebar-title');
    
    sidebar.innerHTML = ''; // Limpa sidebar antiga
    title.innerText = db[index].semester; // Atualiza título

    // Gera os botões das matérias
    db[index].subjects.forEach((sub, subIdx) => {
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.id = `disc-btn-${subIdx}`;
        btn.innerHTML = `<span>${sub.name}</span> <i class="fas fa-chevron-down" style="float:right; font-size:0.8em; margin-top:4px"></i>`;
        
        // Cria o container oculto para os tópicos
        const topicList = document.createElement('div');
        topicList.className = 'topic-submenu'; 
        topicList.id = `submenu-${subIdx}`; 
        
        btn.onclick = () => {
            expandDiscipline(subIdx);
        };
        
        sidebar.appendChild(btn);

        // Gera os links dos tópicos dentro do submenu
        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.id = `topic-link-${subIdx}-${topicIdx}`;
                link.innerText = topic.title;
                link.href = "javascript:void(0)"; 
                
                link.onclick = (e) => {
                    e.preventDefault();
                    // Atualiza a URL para navegar
                    location.hash = `#sem-${index}/mat-${subIdx}/top-${topicIdx}`;
                };
                topicList.appendChild(link);
            });
        } else {
            topicList.innerHTML = '<div style="padding:10px 24px; font-size:0.85em; color:var(--text-muted)">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
    
    // Restaura preferência de sidebar oculta se existir
    const isHidden = localStorage.getItem('sidebarHidden') === 'true';
    if(isHidden) document.body.classList.add('sidebar-hidden');
}

// --- CORREÇÃO: Função atualizada para Abrir/Fechar (Toggle) ---
function expandDiscipline(subIdx) {
    const targetSubmenu = document.getElementById(`submenu-${subIdx}`);
    const targetBtn = document.getElementById(`disc-btn-${subIdx}`);

    // 1. Verifica se o item clicado JÁ está aberto
    const isAlreadyOpen = targetSubmenu && targetSubmenu.classList.contains('show');

    // 2. Fecha TODOS os submenus e remove destaque de todos os botões
    document.querySelectorAll('.topic-submenu').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active-discipline'));
    
    // 3. Lógica de Toggle:
    // Se ele NÃO estava aberto, nós abrimos agora.
    // Se ele JÁ estava aberto, não fazemos nada (pois o passo 2 já o fechou), resultando em fechar.
    if (!isAlreadyOpen && targetSubmenu && targetBtn) {
        targetSubmenu.classList.add('show');
        targetBtn.classList.add('active-discipline');
    }
}

// ==============================================================
// C - CARREGAMENTO DE CONTEÚDO (O CORAÇÃO DO SITE)
// ==============================================================
async function openTopic(semIdx, subIdx, topIdx, updateHash = true) {
    // Se for clique manual, apenas atualiza o hash (o hashchange chama essa função de novo)
    if (updateHash) {
        location.hash = `#sem-${semIdx}/mat-${subIdx}/top-${topIdx}`;
        return; 
    }

    // Atualiza UI
    markActiveTopic(subIdx, topIdx);
    closeMobileSidebar(); // Esconde menu no celular ao clicar

    // Busca os dados no data.js
    const data = db[semIdx]?.subjects[subIdx]?.topics[topIdx];
    if (!data) return;

    // Troca as telas (some dashboard, aparece conteúdo)
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // Atualiza Breadcrumb e Título
    document.getElementById('breadcrumb').innerText = `${db[semIdx].semester}  /  ${db[semIdx].subjects[subIdx].name}`;
    const titleEl = document.getElementById('topic-title');
    titleEl.innerText = data.title;
    titleEl.setAttribute('tabindex', '-1');
    titleEl.focus(); // Acessibilidade

    // Carrega as notas salvas para este tópico
    loadNotes(semIdx, subIdx, topIdx);

    // 1. CARREGA O TEXTO (MARKDOWN)
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p class="loading-text">Carregando conteúdo...</p>';
    
    if (data.file) {
        try {
            // Busca o arquivo .md na pasta conteudos
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro 404");
            const text = await response.text();
            
            // Converte Markdown para HTML usando a biblioteca 'marked'
            textArea.innerHTML = marked.parse(text);
            
            // MELHORIA DE UX: Todos os links do texto abrem em nova aba
            textArea.querySelectorAll('a').forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });

            // ATIVA O ZOOM NAS IMAGENS (NOVA FEATURE)
            initImageZoom();

            // Gera o índice automático (TOC) e o observador
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

    // 2. CARREGA OS SLIDES
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

    // 3. CARREGA OS VÍDEOS
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

    // Volta para a aba de texto por padrão
    switchTab('text');
}

function markActiveTopic(subIdx, topIdx) {
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    const activeLink = document.getElementById(`topic-link-${subIdx}-${topIdx}`);
    if (activeLink) activeLink.classList.add('active-topic');
}

// ==============================================================
// 🔍 LIGHTBOX (ZOOM EM IMAGENS)
// ==============================================================
function initImageZoom() {
    // 1. Cria o elemento HTML do lightbox se ele ainda não existir no corpo da página
    if (!document.getElementById('lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = '<img src="" alt="Zoom">';
        
        // Ao clicar no fundo preto, fecha o zoom
        lightbox.onclick = () => {
            lightbox.classList.remove('active');
            // Aguarda a animação CSS terminar antes de esconder
            setTimeout(() => lightbox.style.display = 'none', 200); 
        };
        document.body.appendChild(lightbox);
    }

    // 2. Seleciona todas as imagens dentro do texto do resumo
    const imgs = document.querySelectorAll('.markdown-content img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('img');

    // 3. Adiciona o evento de clique em cada imagem
    imgs.forEach(img => {
        img.onclick = () => {
            lightboxImg.src = img.src;      // Copia a imagem clicada para o lightbox
            lightbox.style.display = 'flex'; // Mostra o container
            // Pequeno delay para permitir que o CSS anime a opacidade (fade in)
            setTimeout(() => lightbox.classList.add('active'), 10);
        };
    });
}

// ==============================================================
// F - GERADOR AUTOMÁTICO DE ÍNDICE (TOC)
// ==============================================================
function generateTOC() {
    const tocContent = document.getElementById('toc-content');
    const tocContainer = document.getElementById('toc');
    const content = document.getElementById('markdown-render');
    // Pega todos os títulos H1, H2 e H3 do texto
    const headers = content.querySelectorAll('h1, h2, h3');
    
    tocContent.innerHTML = ''; 
    
    // Se tiver menos de 2 títulos, não vale a pena mostrar índice
    if (headers.length < 2) { 
        tocContainer.style.display = 'none';
        return;
    }
    tocContainer.style.display = 'block';

    headers.forEach((header, index) => {
        // Garante que todo título tenha um ID para linkagem
        if (!header.id) header.id = `heading-${index}`;

        const link = document.createElement('a');
        link.innerText = header.innerText;
        link.href = `#${header.id}`;
        link.className = 'toc-link';
        link.dataset.target = header.id; // Usado pelo Observer
        
        // Se for H3, adiciona classe para indentar visualmente
        if (header.tagName === 'H3') link.classList.add('sub-item');

        // CORREÇÃO DO SCROLL NO MOBILE
        link.onclick = (e) => {
            e.preventDefault();
            
            const container = document.getElementById('main-content');
            const targetElement = document.getElementById(header.id);
            
            if (container && targetElement) {
                // Calcula a posição relativa dentro do scroll do container
                // Isso impede que o cabeçalho do site seja empurrado para cima
                const topPos = targetElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
                
                container.scrollTo({
                    top: topPos - 20, // Margem de respiro
                    behavior: 'smooth'
                });
            }

            // Fecha o painel flutuante se estiver no mobile
            if(window.innerWidth <= 1024) {
                document.getElementById('toc').classList.remove('visible');
            }
        };
        tocContent.appendChild(link);
    });
}

// Observa qual título está visível na tela para destacar no índice
function initTOCObserver() {
    if (tocObserver) tocObserver.disconnect();

    // Margens ajustadas para detectar o título um pouco antes do topo
    const options = { root: null, rootMargin: '-100px 0px -60% 0px', threshold: 0 };
    
    tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // Adiciona classe ativa apenas ao link correspondente
                document.querySelectorAll('.toc-link').forEach(link => {
                    link.classList.toggle('toc-link--active', link.dataset.target === id);
                });
            }
        });
    }, options);

    // Começa a observar todos os headers
    document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3').forEach(h => {
        tocObserver.observe(h);
    });
}

// Botões para abrir/fechar TOC no mobile
function initTOCToggle() {
    const btn = document.getElementById('toc-toggle-btn');
    const toc = document.getElementById('toc');
    const close = document.getElementById('toc-close-mobile');
    if(btn) btn.onclick = () => toc.classList.toggle('visible');
    if(close) close.onclick = () => toc.classList.remove('visible');
}

// ==============================================================
// FEATURE: SIDEBAR TOGGLE (DESKTOP)
// ==============================================================
function initSidebarDesktopToggle() {
    const btn = document.getElementById('sidebar-toggle-desktop');
    // Se o usuário deixou fechado antes, mantém fechado
    if (localStorage.getItem('sidebarHidden') === 'true') {
        document.body.classList.add('sidebar-hidden');
    }
    if (btn) btn.onclick = toggleSidebarDesktop;
}

function toggleSidebarDesktop() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebarHidden', isHidden);
}

// ==============================================================
// FEATURE: BUSCA GLOBAL
// ==============================================================
let searchIndex = []; // Array que guarda todos os tópicos para busca rápida

function initSearch() {
    const input = document.getElementById('global-search');
    const resultsBox = document.getElementById('search-results');
    
    // Monta o índice de busca varrendo todo o data.js
    db.forEach((sem, sIdx) => {
        sem.subjects.forEach((mat, mIdx) => {
            mat.topics.forEach((top, tIdx) => {
                searchIndex.push({
                    label: `${mat.name}: ${top.title}`,
                    // Cria uma string de palavras-chave para facilitar a busca
                    keywords: `${sem.semester} ${mat.name} ${top.title}`.toLowerCase(),
                    hash: `#sem-${sIdx}/mat-${mIdx}/top-${tIdx}`
                });
            });
        });
    });

    // Evento de digitação
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsBox.innerHTML = '';
        
        // Só busca se tiver 2 ou mais caracteres
        if(term.length < 2) {
            resultsBox.style.display = 'none';
            return;
        }

        // Filtra resultados
        const filtered = searchIndex.filter(item => item.keywords.includes(term));
        
        if(filtered.length > 0) {
            resultsBox.style.display = 'block';
            // Mostra apenas os 10 primeiros
            filtered.slice(0, 10).forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>${item.label.split(':')[1]}</strong><small>${item.label.split(':')[0]}</small>`;
                div.onclick = () => {
                    location.hash = item.hash; // Navega
                    input.value = '';          // Limpa campo
                    resultsBox.style.display = 'none'; // Fecha resultados
                };
                resultsBox.appendChild(div);
            });
        } else {
            // Feedback de nenhum resultado
            resultsBox.style.display = 'block';
            resultsBox.innerHTML = '<div class="search-item" style="cursor:default; color:var(--text-muted);">Nenhum resultado encontrado.</div>';
        }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.search-container')) {
            resultsBox.style.display = 'none';
        }
    });
}

// ==============================================================
// FEATURE: NOTAS PESSOAIS (PERSISTÊNCIA)
// ==============================================================
let currentNoteKey = ''; // Chave única para salvar a nota do tópico atual

function initNotes() {
    const txt = document.getElementById('notes-textarea');
    const btnClear = document.getElementById('notes-clear');
    
    if(txt) {
        // Salva automaticamente 400ms após parar de digitar
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
    // Cria uma chave única baseada na posição do tópico (ex: notes::sem-0::mat-1::top-0)
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
// UTILITÁRIOS DE UI (ABAS E DASHBOARD)
// ==============================================================
function switchTab(name) {
    // Esconde todos os painéis
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    // Desativa todas as abas
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    // Ativa o painel solicitado
    const panel = document.getElementById(`tab-${name}`);
    if(panel) panel.classList.add('active');
    
    // Ativa a aba correspondente
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
    
    // Remove seleção da sidebar
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    closeMobileSidebar();
}

// ==============================================================
// TEMA (DARK/LIGHT) E MENU MOBILE
// ==============================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('theme-toggle');
    const icon = btn.querySelector('i');
    
    // Aplica tema salvo
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        icon.classList.replace('fa-moon', 'fa-sun');
        btn.setAttribute('aria-pressed', 'true');
    }
    
    // Alterna ao clicar
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
        document.body.style.overflow = 'hidden'; // Trava scroll do fundo
    }
    
    function close() {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = ''; // Destrava scroll
    }
    
    btn.onclick = open;
    closeBtn.onclick = close;
    overlay.onclick = close;
    
    // Fecha ao apertar ESC
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
// MODO FOCO (SEGURANÇA: INICIA SEMPRE DESLIGADO)
// ==============================================================
function initFocusMode() {
    const btn = document.getElementById('focus-mode-btn');
    
    // Garante que começa desligado para evitar bugs de interface sumindo
    document.body.classList.remove('focus-mode');
    sessionStorage.removeItem('focusMode');

    if(btn) {
        btn.onclick = () => {
            document.body.classList.toggle('focus-mode');
            const active = document.body.classList.contains('focus-mode');
            
            // Salva estado apenas na sessão atual
            if(active) {
                sessionStorage.setItem('focusMode', 'on');
            } else {
                sessionStorage.removeItem('focusMode');
            }
        };
    }
}