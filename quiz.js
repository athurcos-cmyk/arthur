// ==============================================================
// 🧠 BANCO DE DADOS DE QUIZZES
// ==============================================================
// A chave é formada por: "SEMESTRE - MATERIA - TOPICO" (índices começam em 0)
// O script.js vai ler este arquivo para buscar as perguntas.

const quizDb = {
    // -----------------------------------------------------------------------
    // 1º SEMESTRE -> ANATOMIA HUMANA (0) -> SISTEMA DIGESTÓRIO (6) -> ID: "0-0-6"
    // -----------------------------------------------------------------------
    "0-0-6": [ 
        { q: "Qual estrutura marca o limite posterior da cavidade própria da boca e comunica diretamente com a faringe?", a: ["Palato duro","Istmo das fauces","Frênulo da língua","Vestíbulo bucal"], c: 1 },
        { q: "As papilas linguais localizadas no dorso da língua têm qual função principal?", a: ["Produção de muco","Defesa imunológica","Atrito e percepção de sabor","Movimentação da língua"], c: 2 },
        { q: "Qual é a divisão correta da faringe em ordem superior → inferior?", a: ["Orofaringe, nasofaringe, laringofaringe","Nasofaringe, orofaringe, laringofaringe","Laringofaringe, nasofaringe, orofaringe","Orofaringe, laringofaringe, nasofaringe"], c: 1 },
        { q: "Em relação ao esôfago, sua posição no tórax é melhor descrita como:", a: ["Anterior à traqueia","Entre a traqueia e os pulmões","Posterior à traqueia e anterior à coluna vertebral","Posterior à coluna vertebral"], c: 2 },
        { q: "O movimento que empurra o bolo alimentar ao longo do tubo digestório é chamado de:", a: ["Segregação","Antiperistalse","Peristaltismo","Hemodinâmica"], c: 2 },
        { q: "Qual parte do estômago se localiza superiormente e à esquerda, acima da junção esofagogástrica?", a: ["Piloro","Cárdia","Corpo","Fundo gástrico"], c: 3 },
        { q: "O quimo é formado principalmente em qual região do trato digestório?", a: ["Intestino delgado","Estômago","Faringe","Intestino grosso"], c: 1 },
        { q: "Onde ocorre a maior parte da absorção de nutrientes?", a: ["Ceco","Duodeno","Jejuno","Íleo"], c: 2 },
        { q: "O duodeno recebe secreções de quais órgãos anexos?", a: ["Fígado e rim","Pâncreas e baço","Fígado e pâncreas","Baço e vesícula biliar"], c: 2 },
        { q: "O intestino grosso tem como principal função:", a: ["Digestão de proteínas","Absorção maciça de nutrientes","Produção de bile","Reabsorção de água e formação de fezes"], c: 3 },
        { q: "O apêndice vermiforme está anatomicamente ligado a qual estrutura?", a: ["Íleo","Ceco","Jejuno","Colo ascendente"], c: 1 },
        { q: "A vesícula biliar possui qual função principal?", a: ["Produzir bile","Armazenar e concentrar bile","Neutralizar ácido gástrico","Produzir enzimas digestivas"], c: 1 },
        { q: "Qual ducto transporta a bile do fígado até o ponto de junção com o ducto pancreático?", a: ["Ducto hepático comum / colédoco","Ducto cístico","Ducto acessório","Ducto torácico"], c: 0 },
        { q: "O pâncreas é classificado como retroperitoneal porque:", a: ["Fica completamente envolto pelo peritônio","Localiza-se anterior ao estômago","Sua face posterior está aderida à parede abdominal posterior","Não possui função exócrina"], c: 2 },
        { q: "Qual parte do intestino delgado conecta-se diretamente ao ceco?", a: ["Jejuno","Íleo","Duodeno","Flexura hepática"], c: 1 },
        { q: "O palato mole encontra-se em qual região da boca?", a: ["Anterior, óssea","Posterior, muscular","Inferior, cartilaginosa","Lateral, fibrosa"], c: 1 },
        { q: "As tonsilas linguais localizam-se em qual região?", a: ["Apex da língua","Margem lateral","Raiz da língua","Dorso médio"], c: 2 },
        { q: "A parótida drena saliva principalmente para qual região?", a: ["Vestíbulo próximo ao segundo molar superior","Soalho da boca","Palato mole","Palato duro"], c: 0 },
        { q: "A função endócrina do pâncreas inclui a produção de:", a: ["Tripsina","Lipase","Insulina e glucagon","Bile"], c: 2 },
        { q: "A bile atua principalmente na digestão de qual tipo de nutriente?", a: ["Carboidratos","Gorduras","Proteínas","Vitaminas"], c: 1 },
        { q: "O segmento do intestino grosso que atravessa o abdome transversalmente chama-se:", a: ["Ceco","Colo transverso","Colo ascendente","Colo sigmoide"], c: 1 },
        { q: "O peritônio visceral tem como função principal:", a: ["Revestir a parede abdominal","Envolver as vísceras e reduzir atrito","Produzir enzimas digestivas","Formar fezes"], c: 1 },
        { q: "Qual estrutura controla a saída do conteúdo gástrico para o duodeno?", a: ["Cárdia","Piloro","Fundo","Esfíncter ileocecal"], c: 1 },
        { q: "O vestíbulo da boca é definido como:", a: ["Espaço atrás dos dentes","Espaço entre dentes e lábios/bochechas","Região sob a língua","Região do palato mole"], c: 1 },
        { q: "A digestão química começa principalmente em qual estrutura?", a: ["Estômago","Duodeno","Boca (saliva)","Esôfago"], c: 2 }
    ]
};