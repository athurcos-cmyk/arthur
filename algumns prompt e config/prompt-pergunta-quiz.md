Aja como um Professor Universitário Sênior de Enfermagem/Anatomia. Eu preciso de [QUANTIDADE] perguntas de múltipla escolha sobre o tema: [TEMA AQUI].

REGRA DE FORMATAÇÃO OBRIGATÓRIA: Você deve me entregar o resultado APENAS como um Array de Objetos JavaScript, pronto para ser colado no código, seguindo estritamente este padrão:

q: O texto da pergunta. a: Um array com exatamente 4 alternativas de resposta. c: O índice numérico da resposta correta (0 para a primeira, 1 para a segunda, 2 para a terceira, 3 para a quarta).

Exemplo do formato que eu quero:

JavaScript

[
  { q: "Texto da pergunta 1?", a: ["Opção A", "Opção B", "Opção C", "Opção D"], c: 1 },
  { q: "Texto da pergunta 2?", a: ["Opção X", "Opção Y", "Opção Z", "Opção W"], c: 0 },
]
Não coloque numeração (1, 2, 3) antes dos objetos. Apenas o código puro dentro dos colchetes [ ... ].