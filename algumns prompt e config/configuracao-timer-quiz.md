# ⏱️ Guia de Configuração: Timer do Quiz (v4.1)

Este documento serve como referência técnica para alterar a duração ou desativar o timer do sistema de Quiz.

---

## 1. Como alterar o tempo (Ex: aumentar para 120 segundos)

Para mudar o tempo padrão, você precisa editar o arquivo **`script.js`**.
Localize a função `renderQuestion()` (geralmente próxima ao final do arquivo).

É necessário alterar o valor em **dois lugares**:

### A. Alterar a Lógica (Variável JavaScript)
No começo da função `renderQuestion()`, encontre a linha que define `quizTimeLeft`:

```javascript
// 📄 Arquivo: script.js -> function renderQuestion()

    // ...
    const q = currentQuizData[currentQIndex];
    
    // 👇 MUDE O VALOR AQUI (Em segundos)
    quizTimeLeft = 120; 
    
    isQuizAnswered = false;
    // ...
B. Alterar o Visual (HTML Inicial)
Logo abaixo, dentro da string container.innerHTML, altere o número que aparece dentro do span para evitar que o relógio "pule" visualmente.

JavaScript

// 📄 Arquivo: script.js -> function renderQuestion()

    container.innerHTML = `
        <div class="quiz-header">
            <div class="quiz-timer"><i class="fas fa-stopwatch"></i> <span id="q-timer">120</span>s</div>
        </div>
        ...
2. Como desativar o Timer (Modo Sem Tempo)
Para estudar sem a pressão do tempo, comente a chamada da função startQuizTimer() em dois lugares no arquivo script.js:

Lugar 1: Na função renderQuestion()
Atenção: Agora esta linha fica na última linha da função renderQuestion.

JavaScript

// 📄 Arquivo: script.js -> function renderQuestion() (FINAL DA FUNÇÃO)

    // ... (todo o código do HTML acima) ...

    // 👇 ADICIONE DUAS BARRAS (//) AQUI PARA DESATIVAR
    // startQuizTimer();
}
Lugar 2: Na função switchTab()
Isso impede que o timer reinicie caso você saia da aba do Quiz e volte depois.

JavaScript

// 📄 Arquivo: script.js -> function switchTab(name)

    if (name === 'quiz') {
        // ... verificações ...
        
        if(display && !isResult && !isQuizAnswered) {
            // 👇 ADICIONE DUAS BARRAS (//) AQUI TAMBÉM
            // startQuizTimer();
        }
    }
3. Esconder o Relógio Visualmente (Opcional)
Se você desativou o timer, para remover o relógio parado da tela, adicione ao final do style.css:

CSS

/* 📄 Arquivo: style.css */

.quiz-timer {
    display: none !important;
}