// ==============================================================
// 📅 DATAS DAS PROVAS
// ==============================================================
const exams = [
    { name: "Anatomia Humana", date: "26/11/2025" },
    { name: "Biologia Celular", date: "27/11/2025" },
    { name: "Processos Psicologicos Basicos", date: "28/11/2025" },
    { name: "Nutrição", date: "01/12/2025" },
    { name: "Fisiologia Humana", date: "02/12/2025" },
];

// ==============================================================
// 📚 SEU CURRÍCULO
// ==============================================================
const db = [
    {
        semester: "1º Semestre",
        subjects: [
// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //

// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //// ANATOMIA // ANATOMIA //
            {
                name: "Anatomia Humana",
                topics: [
                    {
                        title: "Introdução a Anatomia",
                        file: "conteudos/1Semestre/Anatomia/introducao-anatomia.md",
                        slides: [
                            { title: "Introdução Anatomia", url: "https://drive.google.com/file/d/1OEBkm2c5l2d07iQjHLvVpvOCUUaAFrBO/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Introdução Anatomia", url: "https://drive.google.com/file/d/13RBgHwTw3qSBsRPJFo4j-_hXjZ-YCSAM/view?usp=drive_link" }
                        ],
                        videos: [
                            { title: "", url: "" }
                        ]
                    },
                    {
                        title: "Sistema Esqueletico",
                        file: "conteudos/1Semestre/Anatomia/sistema-esqueletico.md",
                        slides: [
                            { title: "Sistema Esqueletico", url: "https://drive.google.com/file/d/1fxWVhYWN5z5DOWAfvW4URzX8_rRktXxa/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Esqueletico", url: "https://drive.google.com/file/d/1eeMihZURtNb5W-eo-yNwz7bG19aG9v0X/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema de Articulação",
                        file: "conteudos/1Semestre/Anatomia/Sistema-articular.md",
                        slides: [
                            { title: "Sistema de articulação", url: "https://drive.google.com/file/d/1fxWVhYWN5z5DOWAfvW4URzX8_rRktXxa/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema de Articulação", url: "https://drive.google.com/file/d/1VEaD1H5GBA28J8CEqwu8hqLusbp98eWM/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Muscular",
                        file: "conteudos/1Semestre/Anatomia/sistema-muscular.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1fxWVhYWN5z5DOWAfvW4URzX8_rRktXxa/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Muscular", url: "https://drive.google.com/file/d/1m7mshYmwImP8rXIDjdCptSrcz-gfXRxi/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Circulatorio",
                        file: "conteudos/1Semestre/Anatomia/Sistema-circulatorio.md",
                        slides: [
                            { title: "Sistema Circulatorio", url: "https://drive.google.com/file/d/1jilquT5dGUS991w9-DY96YMGre_V8Ttk/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Circulatorio", url: "https://drive.google.com/file/d/1PkHLrVuFxgvsGXzKEUINm5QL6nHv9f2S/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Nervoso",
                        file: "conteudos/1Semestre/Anatomia/Sistema-nervoso.md",
                        slides: [
                            { title: "Sistema Nervoso", url: "https://drive.google.com/file/d/1QnzsTxL7MZqyGgAFF49U7osRXWqtywSA/view?usp=drive_link" },
                            { title: "Sistema Nervoso - Revisão Anatomica", url: "https://drive.google.com/file/d/15glvFjrahC7jlNrzie8EjPF3t-lvKsSB/view?usp=drive_link" },
                            { title: "Roteiro de apoio 1 - Sistema Nervoso", url: "https://drive.google.com/file/d/13Kulz9wLhkVBUbnE-MoSVDktTHeGTFxg/view?usp=drive_link" },
                            { title: "Roteiro de apoio 2 - Sistema Nervoso", url: "https://drive.google.com/file/d/16xMAE_Iextm0GgDVpoH1Uti70vrZ33Og/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Digestorio",
                        file: "conteudos/1Semestre/Anatomia/sistema-digestorio.md",
                        slides: [
                            { title: "Sistema Digestorio", url: "https://drive.google.com/file/d/15GncI0bKqzotWhwk5VgH6E1xvfGgHVwb/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Digestorio", url: "https://drive.google.com/file/d/1_8AkZjDQFf9jlX4KKL1_V3w4652_4jGs/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Respiratorio",
                        file: "conteudos/1Semestre/Anatomia/Sistema-respiratorio.md",
                        slides: [
                            { title: "Sistema Respiratorio", url: "https://drive.google.com/file/d/1ah9nB4vD_DK3L3hVVGeYigfEGgA4Xcic/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Respiratorio", url: "https://drive.google.com/file/d/1fm60zFV4Gqjhj7Y3xBHVXsPihKy6Qf0a/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Urogenital",
                        file: "conteudos/1Semestre/Anatomia/sistema-urogenital.md",
                        slides: [
                            { title: "Sistema Urogenital", url: "https://drive.google.com/file/d/1LvhWNCn8w3xf2gG-bg5y3xuE9Vxd8T5N/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Urogenital Masculino", url: "https://drive.google.com/file/d/1F0pffc7tAbL4SZBSivI5Yg6JEprCjRuQ/view?usp=drive_link" },
                            { title: "Roteiro de apoio - Sistema Urogenital Feminino", url: "https://drive.google.com/file/d/1PD1zGxGU60oyOhchi3oDw4fXRLgcUyZw/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Urinario",
                        file: "conteudos/1Semestre/Anatomia/sistema-urinario.md",
                        slides: [
                            { title: "Roteiro de apoio - Sistema Urinario", url: "https://drive.google.com/file/d/1AC-Ht-cCExpSNHwsy-f-1ypiJ2HXyuVv/view?usp=drive_link" }
                        ],
                        videos: []
                    }
                ]
            },
//BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL ////BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL ////BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL // 

//BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL ////BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL ////BIOLOGIA CELULAR E TECIDUAL // //BIOLOGIA CELULAR E TECIDUAL //
            {
                name: "Biologia Celular",
                topics: [
                    {
                        title: "Introdução a Biologia Celular",
                        file: "conteudos/1Semestre/biologia/introducao.md",
                        slides: [
                            { title: "Aula 1 - Introdução à Bio Cel", url: "https://drive.google.com/file/d/1qKOngqjo7E3xOSKHNusW7yqFezbZLvoB/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Membrana Plasmatica e Organelas",
                        file: "conteudos/1Semestre/biologia/membrana-plasmatica-organelas.md",
                        slides: [
                            { title: "Aula 2 - Membrana Plasmatica e Organelas", url: "https://drive.google.com/file/d/1Eb2V977fyZd2CJ1ts33EnX3VHZ_3YBp9/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "DNA, RNA, Mitose e Meiose",
                        file: "conteudos/1Semestre/biologia/DNA.md",
                        slides: [
                            { title: "Aula 3 - DNA, RNA, Mitose e Meiose", url: "https://drive.google.com/file/d/1K3q-tPox8Oa2NkrL3rVXS6ZqCyVJRl79/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Morte Celular",
                        file: "conteudos/1Semestre/biologia/morte-celular.md",
                        slides: [
                            { title: "Aula 4 - Morte Celular", url: "https://drive.google.com/file/d/1uo8GfaBTXbp2iKuCPvstElM7SMXchIuG/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Tecido Epitelial",
                        file: "conteudos/1Semestre/biologia/Tecido-epitelial.md",
                        slides: [
                            { title: "Aula 5 - Tecido Epitelial", url: "https://drive.google.com/file/d/1aT1f-nc6C2MRN0Fl7Std-lcsi73uqWMt/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Tecido Conjuntivo",
                        file: "conteudos/1Semestre/biologia/Tecido-conjuntivo.md",
                        slides: [
                            { title: "Aula 6 e 7 - Tecido Conjuntivo", url: "https://drive.google.com/file/d/1B3h5IageMYw1i4jjrMhvj3cAFZv4y3Ic/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Tecido Muscular",
                        file: "conteudos/1Semestre/biologia/Tecido-muscular.md",
                        slides: [
                            { title: "Aula 8 - Tecido Muscular", url: "https://drive.google.com/file/d/1QIakNjY4Z-_py4DPhBbVFxrOwqoXewgS/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Tecido Nervoso",
                        file: "conteudos/1Semestre/biologia/Tecido-nervoso.md",
                        slides: [
                            { title: "Aula 9 - Tecido Nervoso", url: "https://drive.google.com/file/d/1UTcnjbmd0ervzGORSLFCrEmGoIhzj2q-/view?usp=drive_link" }
                        ],
                        videos: []
                    }
                ]
            },

///FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA

///FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA//FISIOLOGIA
            {
                name: "Fisiologia Humana",
                topics: [
                    {
                        title: "Sistema Nervoso",
                        file: "conteudos/1Semestre/Fisiologia/sistema-nervoso.md",
                        slides: [
                            { title: "Sistema Nervoso Parte 1", url: "https://drive.google.com/file/d/1UMq9DMcwRL0YlQAqjMRmotdmOIhMmxWi/view?usp=drive_link" },
                            { title: "Sistema Nervoso Parte 2", url: "https://drive.google.com/file/d/1mwXDYI4A7zzHhv5D-wD_uxM-uwYdI0yy/view?usp=drive_link" },
                            { title: "Sistema Nervoso - Samuel Cunha", url: "https://drive.google.com/file/d/1YTeUAnNkBU2ar3WP_QFCDVQvST29sHvk/view?usp=drive_link" },
                            { title: "Sistema Nervoso Khan Academy", url: "https://drive.google.com/file/d/1BVEwFV7thlZXt92OKHdeynsBSSzVYVnx/view?usp=drive_link" },
                            { title: "Sistema Nervoso - Revisão Anatomica", url: "https://drive.google.com/file/d/15glvFjrahC7jlNrzie8EjPF3t-lvKsSB/view?usp=drive_link" },
                            { title: "Sistema Nervoso Geral", url: "https://drive.google.com/file/d/1N1q3hoIu38dkIarkkU1V-R8vun5JEn6P/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Nervoso Parte (FOCO SNP)",
                        file: "conteudos/1Semestre/Fisiologia/sistema-nervoso-snp.md",
                        slides: [
                            { title: "Sistema Nervoso Parte 2", url: "https://drive.google.com/file/d/1mwXDYI4A7zzHhv5D-wD_uxM-uwYdI0yy/view?usp=drive_link" }
                        ],
                        videos: []
                    },
                    {
                        title: "Sistema Muscular - Base",
                        file: "conteudos/1Semestre/Fisiologia/sistema-muscular.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1xoaCcO6qNCyeawuyyOoasjgPV_ons6wb/view?usp=drive_link"}
                        ],
                        videos: [
                            { title: "Sistema Muscular 1/6: Introdução | Anatomia e etc", url: "https://www.youtube.com/embed/n07UO0exapQ" },
                            { title: "Tecido Muscular - Histologia Samuel cunha", url: "https://www.youtube.com/embed/rpwNCVp2HRo"}
                        ]
                    },
                    {
                        title: "Sistema Muscular - Sarcomero",
                        file: "conteudos/1Semestre/Fisiologia/sistema-muscular-sarcomero.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1xoaCcO6qNCyeawuyyOoasjgPV_ons6wb/view?usp=drive_link"}
                        ],
                        videos: [
                            {title: "Estrutura do Sarcomero", url: "https://www.youtube.com/embed/Owp2sGdtPAo"}
                        ]
                    },
                    {
                        title: "Sistema Muscular - Junção Neuro Muscular (JNM)",
                        file: "conteudos/1Semestre/Fisiologia/sistema-muscular-jnm.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1xoaCcO6qNCyeawuyyOoasjgPV_ons6wb/view?usp=drive_link"}
                        ],
                        videos: [
                            {title: "Junção Neuro Muscular", url: "https://www.youtube.com/embed/UnycENhCObM"}
                        ]
                    },
                    {
                        title: "Sistema Muscular - Mecanismo de contração",
                        file: "conteudos/1Semestre/Fisiologia/sistema-muscular-contracao.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1xoaCcO6qNCyeawuyyOoasjgPV_ons6wb/view?usp=drive_link"}
                        ],
                        videos: [
                            {title: "Fisiologia da Contração Muscular", url: "https://www.youtube.com/embed/9HnB54dETss"},
                            {title: "Animação contração muscular", url: "https://www.youtube.com/embed/-Mfo3Af5E3c"}
                        ]
                    },
                    {
                        title: "Sistema Muscular - ATP e fontes de energia",
                        file: "conteudos/1Semestre/Fisiologia/sistema-muscular-atp.md",
                        slides: [
                            { title: "Sistema Muscular", url: "https://drive.google.com/file/d/1xoaCcO6qNCyeawuyyOoasjgPV_ons6wb/view?usp=drive_link"} 
                        ],
                        videos: []
                    },
                    {
                        title: "Fisiologia do Coração",
                        file: "conteudos/1Semestre/Fisiologia/fisiologia-coracao.md",
                        slides: [
                            { title: "Fisiologia do coração", url: "https://drive.google.com/file/d/10qjObb_wmbWLNFNRYZs8I6FwUaZ_YqTy/view?usp=drive_link" }
                        ],
                        videos: [
                            {title: "Introdução Fisiologia do Coração", url: "https://www.youtube.com/embed/0IleJNYR5tk"},
                            {title: "Anatomia Cardiaca Basica", url: "https://www.youtube.com/embed/uFabswAGE6U"},
                            {title: "Fisiologia Cardiaca", url: "https://www.youtube.com/embed/8SunmLyTfbQ"},
                            {title: "Ciclo Cardíaco, Sístole e Diástole", url: "https://www.youtube.com/embed/eg_QCX1e1mg"},
                            {title: "Atividade elétrica do coração", url: "https://www.youtube.com/embed/yWZtY1grl6Q"},
                            {title: "Vasos Sanguíneos (Veias, Artérias e Capilares)", url: "https://www.youtube.com/embed/u0qzXDzDhZ8"},
                            {title: "Tecido Sanguíneo", url: "https://www.youtube.com/embed/BFY82pX85VU"}
                        ]
                    },
                    {
                        title: "Sistema Respiratorio",
                        file: "conteudos/1Semestre/Fisiologia/sistema-respiratorio.md",
                        slides: [],
                        videos: [
                            {title: "Sistema Respiratório 1/6: Introdução", url: "https://www.youtube.com/embed/6g_saSN-sbc"},
                            {title: "Sistema Respiratório 2/6: Vias Aéreas Superiores", url: "https://www.youtube.com/embed/0OW6Xka4DGs"},
                            {title: "Sistema Respiratório 3/6: Vias Aéreas Inferiores", url: "https://www.youtube.com/embed/3-wJx1Sogn8"},
                            {title: "Sistema Respiratório 4/6: Anatomia dos Pulmões", url: "https://www.youtube.com/embed/M0zRrqGgVb4"},
                            {title: "Sistema Respiratório 5/6: Mecânica Respiratória, Músculos Acessórios e Hematose", url: "https://www.youtube.com/embed/2PUoDYnrOsU"},
                            {title: "Sistema Respiratório 6/6: Aula Prática com Wedson Vila Nova ", url: "https://www.youtube.com/embed/0XoOW04AF_o"},
                            {title: "Sistema Respiratório - Samuel Cunha", url: "https://www.youtube.com/embed/6BAypTlvWQM"}
                        ]
                    },
                    {
                        title: "Sistema Endocrino",
                        file: "conteudos/1Semestre/Fisiologia/sistema-endocrino.md",
                        slides: [
                            {title: "Introdução ao Sistema Endócrino", url: "https://drive.google.com/file/d/1tOvdHtjyqpsnF2R8088p9u7riwam0Qq9/view?usp=drive_link"}
                        ],
                        videos: [
                            {title: "Sistema Endócrino: Introdução", url: "https://www.youtube.com/embed/3z79gvXn-1M"},
                            {title: "Mapa Mental - Sistema Endócrino", url: "https://www.youtube.com/embed/OSZ1yYqFLT4"},
                            {title: "Sistema Endócrino, Horminios - Samuel Cunha", url: "https://www.youtube.com/embed/f8dra4Nuxn8"}
                        ]
                    },
                    {
                        title: "Sistema Digestorio",
                        file: "conteudos/1Semestre/Fisiologia/digestorio.md",
                        slides: [],
                        videos: []
                    }
                ]
            }
        ]
    },

    {
        semester: "2º Semestre",
        subjects: [
            { name: "MATERIA EM BREVE", topics: [] }
        ]
    },
    { semester: "3º Semestre", subjects: [] },
    { semester: "4º Semestre", subjects: [] },
    { semester: "5º Semestre", subjects: [] },
    { semester: "6º Semestre", subjects: [] },
    { semester: "7º Semestre", subjects: [] },
    { semester: "8º Semestre", subjects: [] },
    { semester: "9º Semestre", subjects: [] },
    { semester: "10º Semestre", subjects: [] }
];
