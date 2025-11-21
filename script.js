// ==============================================================
// 📦 VARIÁVEIS GLOBAIS DE ESTADO
// ==============================================================
// Estas variáveis guardam o estado atual da aplicação enquanto ela roda.
// Elas são acessíveis por qualquer função dentro deste arquivo.

let currentSemIndex = 0;   // Guarda qual semestre está sendo visualizado (0 = 1º Semestre, etc.)
let notesTimeout = null;   // Timer usado para o "debounce" do salvamento de notas (evita salvar a cada tecla)
let tocObserver = null;    // Guarda a instância do IntersectionObserver do índice (TOC)

// ==============================================================
// 🚀 INICIALIZAÇÃO (BOOTSTRAP)
// ==============================================================
// Esta função window.onload é disparada automaticamente assim que 
// todos os arquivos (HTML, CSS, JS, Imagens) terminam de carregar.
window.onload = () => {
    // ----------------------------------------------------------
    // 1. Renderizar componentes visuais base
    // ----------------------------------------------------------
    renderCalendar();       // Desenha os cards com contagem regressiva das provas
    renderSemesterNav();    // Desenha os botões de navegação dos semestres no topo
    
    // ----------------------------------------------------------
    // 2. Inicializar configurações e rotas
    // ----------------------------------------------------------
    initTheme();            // Verifica se o usuário prefere tema Escuro ou Claro e aplica
    initHashRouting();      // Liga o sistema de navegação por URL (#sem-0/mat-1...)
    handleMobileSidebar();  // Configura a abertura e fechamento do menu lateral no celular
    initFocusMode();        // Configura o botão de modo leitura (foco) - mesmo que esteja oculto
    
    // ----------------------------------------------------------
    // 3. Inicializar Funcionalidades Extras (Novas Features)
    // ----------------------------------------------------------
    initSidebarDesktopToggle(); // Liga o botão de esconder a barra lateral no Desktop
    initTOCToggle();            // Liga o botão de abrir o índice no Mobile
    initSearch();               // Liga a barra de busca global no topo
    initNotes();                // Inicializa o sistema de anotações pessoais
    
    // OBS: O Zoom de imagem (initImageZoom) é chamado dentro de openTopic 
    // porque as imagens só existem depois que o conteúdo carrega.
};

// ==============================================================
// A - CALENDÁRIO DE PROVAS (COM PRIORIDADE E URGÊNCIA)
// ==============================================================
// Esta função lê a lista 'exams' do data.js e cria os cards na tela inicial.
function renderCalendar() {
    // Busca o container onde os cards serão inseridos
    const container = document.getElementById('calendar-container');
    
    // Se o container não existir (erro de HTML), a função para aqui para não quebrar o site
    if(!container) return;

    // Limpa qualquer conteúdo que já esteja lá (para não duplicar se chamar de novo)
    container.innerHTML = ''; 
    
    // Pega a data de hoje e "zera" a hora (00:00:00)
    // Isso é importante para comparar apenas as datas, sem se preocupar com horas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Loop: Para cada prova na lista 'exams'...
    exams.forEach(exam => {
        // A data vem como string "DD/MM/AAAA". Precisamos quebrar e converter.
        const parts = exam.date.split('/'); // Cria um array: ["26", "11", "2025"]
        
        // Cria o objeto Date do Javascript (Mês no JS começa em 0, por isso -1)
        const examDate = new Date(parts[2], parts[1] - 1, parts[0]);

        // Calcula a diferença em milissegundos entre a prova e hoje
        const diffTime = examDate - today;
        
        // Converte milissegundos para dias (1000ms * 60s * 60m * 24h)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Se a diferença for negativa, a prova já passou. Não mostramos.
        if (diffDays < 0) return; 

        // --- LÓGICA DE PRIORIDADE VISUAL (CORES) ---
        let priorityClass = 'priority-green'; // Padrão: Verde (Tá tranquilo)
        let color = 'var(--priority-green)';
        let displayDays = diffDays;
        let labelText = 'dias restantes';

        // Nível Crítico: É HOJE!
        if (diffDays === 0) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "HOJE";
            labelText = "🚨 É HOJE!";
        } 
        // Nível Crítico: É AMANHÃ!
        else if (diffDays === 1) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
            displayDays = "1";
            labelText = "⚠️ É AMANHÃ!";
        } 
        // Nível Alto: Menos de uma semana (Urgente)
        else if (diffDays < 6) {
            priorityClass = 'priority-red';
            color = 'var(--priority-red)';
        } 
        // Nível Médio: Menos de 10 dias (Atenção)
        else if (diffDays < 10) {
            priorityClass = 'priority-orange';
            color = 'var(--priority-orange)';
        }

        // Ajuste visual: Se for "HOJE" ou "1", diminui a fonte para caber no card
        const fontSize = diffDays === 0 ? '1.8rem' : '2.5rem';

        // --- GERAÇÃO DO HTML ---
        // Adiciona o card dentro do container usando Template String
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
// O roteamento permite navegar pelo site sem recarregar a página.
// Ele lê o que vem depois do símbolo # na URL.

function initHashRouting() {
    // Adiciona um "ouvinte" que fica esperando a URL mudar
    window.addEventListener('hashchange', parseHash);
    // Executa a função uma vez logo que o site abre para carregar o conteúdo inicial
    parseHash(); 
}

function parseHash() {
    // Pega a string da URL depois do # (ex: "sem-0/mat-1/top-2")
    const hash = location.hash.slice(1); 
    
    // Se não tiver nada (está na home), carrega o primeiro semestre e mostra o dashboard
    if(!hash) {
        loadSemester(0);
        showDashboard(false); 
        return;
    }

    // Quebra a URL nas barras '/' para pegar as partes
    const [semPart, matPart, topPart] = hash.split('/');
    
    // Usa Expressão Regular (Regex) para extrair apenas os números de cada parte
    const semIdx = semPart?.match(/sem-(\d+)/)?.[1];
    const matIdx = matPart?.match(/mat-(\d+)/)?.[1];
    const topIdx = topPart?.match(/top-(\d+)/)?.[1];

    // Lógica de carregamento em cascata (Semestre -> Matéria -> Tópico)
    if (semIdx !== undefined) {
        const sIdx = parseInt(semIdx);
        
        // Se o semestre mudou OU se a sidebar está vazia, recarrega a sidebar
        if (sIdx !== currentSemIndex || document.getElementById('disciplines-container').innerHTML === '') {
            loadSemester(sIdx);
        }
        
        // Se tiver um índice de matéria na URL...
        if (matIdx !== undefined) {
            const mIdx = parseInt(matIdx);
            
            // Usa um pequeno delay (50ms) para garantir que o HTML da sidebar foi criado
            setTimeout(() => { 
                // CORREÇÃO IMPORTANTE: 
                // Passamos 'true' como segundo parâmetro para FORÇAR a abertura do menu.
                // Isso impede que ele feche se já estiver aberto.
                expandDiscipline(mIdx, true); 
                
                // Se tiver um índice de tópico, carrega o conteúdo
                if (topIdx !== undefined) {
                    openTopic(sIdx, mIdx, parseInt(topIdx), false);
                }
            }, 50);
        } else {
            // Se só tiver o semestre na URL, mostra o painel de provas
            showDashboard(false);
        }
    }
}

// Renderiza os botões de navegação superior (1º Semestre, 2º Semestre...)
function renderSemesterNav() {
    const nav = document.getElementById('semester-nav');
    nav.innerHTML = ''; 
    
    // Cria um botão para cada item no array 'db' (data.js)
    db.forEach((sem, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-sem-${index}`;
        btn.innerText = sem.semester;
        
        // Ao clicar, apenas muda o Hash na URL. 
        // O evento 'hashchange' vai detectar e chamar as funções de carregamento.
        btn.onclick = () => {
            location.hash = `#sem-${index}`;
        };
        nav.appendChild(btn);
    });
}

// Carrega a lista de disciplinas na barra lateral esquerda
function loadSemester(index) {
    // Validação de segurança
    if (index < 0 || index >= db.length) return;
    
    currentSemIndex = index;
    
    // Atualiza visualmente qual botão de semestre está "ativo"
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active-semester', i === index);
    });

    const sidebar = document.getElementById('disciplines-container');
    const title = document.getElementById('sidebar-title');
    
    sidebar.innerHTML = ''; // Limpa sidebar antiga
    title.innerText = db[index].semester; // Atualiza título da sidebar

    // Gera os botões das matérias (Acordeões)
    db[index].subjects.forEach((sub, subIdx) => {
        const btn = document.createElement('button');
        btn.className = 'discipline-btn';
        btn.id = `disc-btn-${subIdx}`;
        // Adiciona ícone de seta para baixo
        btn.innerHTML = `<span>${sub.name}</span> <i class="fas fa-chevron-down" style="float:right; font-size:0.8em; margin-top:4px"></i>`;
        
        // Cria o container (div) que vai guardar os tópicos (inicialmente oculto)
        const topicList = document.createElement('div');
        topicList.className = 'topic-submenu'; 
        topicList.id = `submenu-${subIdx}`; 
        
        // Ao clicar no botão da matéria, chama a função de expandir
        // Aqui não passamos 'true', então ele vai funcionar como Toggle (Abrir/Fechar)
        btn.onclick = () => {
            expandDiscipline(subIdx);
        };
        
        sidebar.appendChild(btn);

        // Se a matéria tiver tópicos, cria os links
        if (sub.topics.length > 0) {
            sub.topics.forEach((topic, topicIdx) => {
                const link = document.createElement('a');
                link.className = 'topic-link';
                link.id = `topic-link-${subIdx}-${topicIdx}`;
                link.innerText = topic.title;
                link.href = "javascript:void(0)"; // Evita comportamento padrão de link
                
                link.onclick = (e) => {
                    e.preventDefault();
                    // Atualiza a URL para navegar para o conteúdo específico
                    location.hash = `#sem-${index}/mat-${subIdx}/top-${topicIdx}`;
                };
                topicList.appendChild(link);
            });
        } else {
            // Se não tiver tópicos, mostra mensagem "Em breve"
            topicList.innerHTML = '<div style="padding:10px 24px; font-size:0.85em; color:var(--text-muted)">Em breve...</div>';
        }
        sidebar.appendChild(topicList);
    });
    
    // Verifica se o usuário tinha fechado a sidebar no Desktop e restaura o estado
    const isHidden = localStorage.getItem('sidebarHidden') === 'true';
    if(isHidden) document.body.classList.add('sidebar-hidden');
}

// --- FUNÇÃO CORRIGIDA: EXPANDIR MENU (COM LÓGICA DE TOGGLE E FORCE OPEN) ---
// Agora aceita um parâmetro opcional 'forceOpen'.
// Se forceOpen = true, ele abre sem verificar se já estava aberto.
function expandDiscipline(subIdx, forceOpen = false) {
    const targetSubmenu = document.getElementById(`submenu-${subIdx}`);
    const targetBtn = document.getElementById(`disc-btn-${subIdx}`);

    // 1. Verifica se este item ESPECÍFICO já está aberto
    const isAlreadyOpen = targetSubmenu && targetSubmenu.classList.contains('show');

    // 2. Primeiro, fecha TODOS os outros submenus e remove destaque de botões
    document.querySelectorAll('.topic-submenu').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.discipline-btn').forEach(b => b.classList.remove('active-discipline'));
    
    // 3. Lógica inteligente:
    // - Se forceOpen for TRUE (veio da URL), abrimos sempre.
    // - Se forceOpen for FALSE (clique manual) E ele NÃO estava aberto, abrimos.
    // - Se forceOpen for FALSE E ele JÁ estava aberto, não fazemos nada (o passo 2 já fechou ele).
    if ((!isAlreadyOpen || forceOpen) && targetSubmenu && targetBtn) {
        targetSubmenu.classList.add('show');
        targetBtn.classList.add('active-discipline');
    }
}

// ==============================================================
// C - CARREGAMENTO DE CONTEÚDO (O CORAÇÃO DO SITE)
// ==============================================================
// Esta função carrega o texto, slides e vídeos na área principal
async function openTopic(semIdx, subIdx, topIdx, updateHash = true) {
    // Se a função foi chamada por clique manual, atualizamos o Hash primeiro.
    // O evento 'hashchange' vai chamar essa função de novo com updateHash = false.
    if (updateHash) {
        location.hash = `#sem-${semIdx}/mat-${subIdx}/top-${topIdx}`;
        return; 
    }

    // Atualiza a sidebar para marcar o link ativo (azulzinho)
    markActiveTopic(subIdx, topIdx);
    closeMobileSidebar(); // Se estiver no celular, fecha o menu lateral

    // Busca os dados do tópico no arquivo data.js
    const data = db[semIdx]?.subjects[subIdx]?.topics[topIdx];
    if (!data) return; // Segurança: se não achar, para.

    // Troca as telas: Esconde o Dashboard e mostra a Área de Conteúdo
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('content-view').classList.add('active');
    
    // Atualiza o Breadcrumb (caminho) e o Título Grande
    document.getElementById('breadcrumb').innerText = `${db[semIdx].semester}  /  ${db[semIdx].subjects[subIdx].name}`;
    const titleEl = document.getElementById('topic-title');
    titleEl.innerText = data.title;
    titleEl.setAttribute('tabindex', '-1'); // Acessibilidade
    titleEl.focus(); // Foca no título para leitores de tela

    // Carrega as notas salvas para este tópico específico
    loadNotes(semIdx, subIdx, topIdx);

    // --- 1. CARREGA O TEXTO (MARKDOWN) ---
    const textArea = document.getElementById('markdown-render');
    textArea.innerHTML = '<p class="loading-text">Carregando conteúdo...</p>';
    
    if (data.file) {
        try {
            // Faz uma requisição (fetch) para pegar o arquivo .md na pasta
            const response = await fetch(data.file);
            if (!response.ok) throw new Error("Erro 404");
            const text = await response.text();
            
            // Usa a biblioteca 'marked' para converter Markdown em HTML
            textArea.innerHTML = marked.parse(text);
            
            // MELHORIA DE UX: Percorre todos os links do texto gerado
            textArea.querySelectorAll('a').forEach(link => {
                // Força abrir em nova aba
                link.setAttribute('target', '_blank');
                // Segurança contra links maliciosos
                link.setAttribute('rel', 'noopener noreferrer');
            });

            // ATIVA O ZOOM NAS IMAGENS (NOVA FEATURE)
            initImageZoom();

            // Gera o índice automático (TOC) e liga o observador de rolagem
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

    // --- 2. CARREGA OS SLIDES ---
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

    // --- 3. CARREGA OS VÍDEOS ---
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

    // Reseta a visualização para a aba de texto
    switchTab('text');
}

// Função auxiliar para destacar visualmente o link clicado na sidebar
function markActiveTopic(subIdx, topIdx) {
    document.querySelectorAll('.topic-link').forEach(l => l.classList.remove('active-topic'));
    const activeLink = document.getElementById(`topic-link-${subIdx}-${topIdx}`);
    if (activeLink) activeLink.classList.add('active-topic');
}

// ==============================================================
// 🔍 LIGHTBOX (ZOOM EM IMAGENS)
// ==============================================================
// Cria um efeito de "Modal" para ver imagens em tela cheia ao clicar
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
            // Aguarda a animação CSS terminar antes de esconder (display: none)
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
    // Pega todos os títulos H1, H2 e H3 do texto renderizado
    const headers = content.querySelectorAll('h1, h2, h3');
    
    tocContent.innerHTML = ''; 
    
    // Se tiver menos de 2 títulos, não vale a pena mostrar índice
    if (headers.length < 2) { 
        tocContainer.style.display = 'none';
        return;
    }
    tocContainer.style.display = 'block';

    headers.forEach((header, index) => {
        // Garante que todo título tenha um ID único para linkagem
        if (!header.id) header.id = `heading-${index}`;

        const link = document.createElement('a');
        link.innerText = header.innerText;
        link.href = `#${header.id}`;
        link.className = 'toc-link';
        link.dataset.target = header.id; // Usado pelo Observer para saber quem é quem
        
        // Se for H3 (subtítulo), adiciona classe para indentar visualmente
        if (header.tagName === 'H3') link.classList.add('sub-item');

        // --- CORREÇÃO DO SCROLL NO MOBILE ---
        // O comportamento padrão de link ancora (#id) pula bruscamente.
        // Aqui fazemos um scroll suave calculado manualmente.
        link.onclick = (e) => {
            e.preventDefault();
            
            const container = document.getElementById('main-content');
            const targetElement = document.getElementById(header.id);
            
            if (container && targetElement) {
                // Calcula a posição relativa do título dentro do container scrollável
                const topPos = targetElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
                
                // Rola o container até a posição, deixando 20px de respiro no topo
                container.scrollTo({
                    top: topPos - 20, 
                    behavior: 'smooth'
                });
            }

            // Se estiver no mobile, fecha o painel flutuante do índice após clicar
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

    // Configuração: dispara quando o título está no topo da tela
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
// Permite esconder a barra lateral no PC para focar na leitura
function initSidebarDesktopToggle() {
    const btn = document.getElementById('sidebar-toggle-desktop');
    
    // Se o usuário deixou fechado antes (salvo no localStorage), mantém fechado
    if (localStorage.getItem('sidebarHidden') === 'true') {
        document.body.classList.add('sidebar-hidden');
    }
    if (btn) btn.onclick = toggleSidebarDesktop;
}

function toggleSidebarDesktop() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebarHidden', isHidden); // Salva preferência
}

// ==============================================================
// FEATURE: BUSCA GLOBAL
// ==============================================================
let searchIndex = []; // Array que guarda todos os tópicos indexados para busca rápida

function initSearch() {
    const input = document.getElementById('global-search');
    const resultsBox = document.getElementById('search-results');
    
    // Varre todo o objeto 'db' (data.js) e cria um índice plano
    db.forEach((sem, sIdx) => {
        sem.subjects.forEach((mat, mIdx) => {
            mat.topics.forEach((top, tIdx) => {
                searchIndex.push({
                    // Cria um rótulo legível "Matéria: Título"
                    label: `${mat.name}: ${top.title}`,
                    // Cria keywords para busca (inclui semestre, materia e titulo)
                    keywords: `${sem.semester} ${mat.name} ${top.title}`.toLowerCase(),
                    // Guarda o endereço Hash para navegação
                    hash: `#sem-${sIdx}/mat-${mIdx}/top-${tIdx}`
                });
            });
        });
    });

    // Evento de digitação no campo de busca
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsBox.innerHTML = '';
        
        // Só busca se tiver 2 ou mais caracteres
        if(term.length < 2) {
            resultsBox.style.display = 'none';
            return;
        }

        // Filtra o array de índice
        const filtered = searchIndex.filter(item => item.keywords.includes(term));
        
        if(filtered.length > 0) {
            resultsBox.style.display = 'block';
            // Mostra apenas os 10 primeiros resultados para não poluir
            filtered.slice(0, 10).forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>${item.label.split(':')[1]}</strong><small>${item.label.split(':')[0]}</small>`;
                
                // Ao clicar no resultado...
                div.onclick = () => {
                    location.hash = item.hash; // Navega
                    input.value = '';          // Limpa campo
                    resultsBox.style.display = 'none'; // Fecha resultados
                };
                resultsBox.appendChild(div);
            });
        } else {
            // Feedback visual se nada for encontrado
            resultsBox.style.display = 'block';
            resultsBox.innerHTML = '<div class="search-item" style="cursor:default; color:var(--text-muted);">Nenhum resultado encontrado.</div>';
        }
    });

    // Fecha o dropdown se clicar fora dele
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
        // Salva automaticamente 400ms após parar de digitar (debounce)
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
    
    // Recupera do localStorage
    const saved = localStorage.getItem(currentNoteKey) || '';
    
    const txt = document.getElementById('notes-textarea');
    if(txt) txt.value = saved;
    
    // Garante que o indicador "Salvo" esteja escondido ao carregar
    document.getElementById('notes-saved-indicator').classList.remove('visible');
}

function saveNotes() {
    if(!currentNoteKey) return;
    const txt = document.getElementById('notes-textarea');
    
    // Salva no navegador
    localStorage.setItem(currentNoteKey, txt.value);
    
    // Feedback visual "Salvo" (pisca verdinho)
    const indicator = document.getElementById('notes-saved-indicator');
    indicator.classList.add('visible');
    setTimeout(() => indicator.classList.remove('visible'), 2000);
}

// ==============================================================
// UTILITÁRIOS DE UI (ABAS E DASHBOARD)
// ==============================================================
function switchTab(name) {
    // Esconde todos os painéis de conteúdo
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    // Desativa visualmente todas as abas
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    
    // Ativa o painel solicitado (text, slides ou video)
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
    // Se chamado manualmente, atualiza o Hash para a raiz do semestre
    if(updateHash) location.hash = `#sem-${currentSemIndex}`; 
    
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('content-view').classList.remove('active');
    
    // Remove seleção de tópico da sidebar
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
    
    // Se estiver salvo como light, aplica classe no body
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        icon.classList.replace('fa-moon', 'fa-sun');
        btn.setAttribute('aria-pressed', 'true');
    }
    
    // Evento de clique para alternar
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

// Lógica para abrir/fechar o menu lateral no mobile
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
    
    // Fecha ao apertar ESC no teclado
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
    // já que o botão de reativar foi oculto no CSS.
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