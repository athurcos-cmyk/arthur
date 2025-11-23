# ⏱️ Guia de Configuração: Timer do Quiz

Este documento serve como referência técnica para alterar a duração ou desativar o timer do sistema de Quiz.

---

## 1. Como alterar o tempo (Ex: aumentar para 120 segundos)

Para mudar o tempo padrão, você precisa editar o arquivo **`script.js`**.
Localize a função `renderQuestion()` (geralmente próxima ao final do arquivo).

É necessário alterar o valor em **dois lugares** para garantir que a lógica e o visual fiquem sincronizados:

### A. Alterar a Lógica (Variável JavaScript)
Dentro de `renderQuestion()`, encontre a linha que define `quizTimeLeft`:

```javascript
// 📄 Arquivo: script.js -> function renderQuestion()

    // ... código anterior ...
    const q = currentQuizData[currentQIndex];
    
    // 👇 MUDE O VALOR AQUI (Em segundos)
    quizTimeLeft = 120; 
    
    isQuizAnswered = false;
    // ...
B. Alterar o Visual (HTML Inicial)
Logo abaixo, dentro da string container.innerHTML, altere o número que aparece dentro do span para evitar que o relógio "pule" visualmente (ex: de 60 para 120) assim que a página carregar.

JavaScript

// 📄 Arquivo: script.js -> function renderQuestion()

    container.innerHTML = `
        <div class="quiz-header">
            <span>Pergunta ${currentQIndex + 1} de ${currentQuizData.length}</span>
            
            <div class="quiz-timer"><i class="fas fa-stopwatch"></i> <span id="q-timer">120</span>s</div>
        </div>
        ...
2. Como desativar o Timer (Modo Sem Tempo)
Se você preferir estudar sem a pressão do tempo, a melhor prática é impedir que o relógio inicie, em vez de apagar o código.

Você precisa comentar (adicionar //) na chamada da função startQuizTimer() em dois lugares no arquivo script.js:

Lugar 1: Na função renderQuestion()
Isso impede que o timer comece quando uma nova pergunta aparece.

JavaScript

// 📄 Arquivo: script.js -> function renderQuestion()

    // Reinicia timer
    quizTimeLeft = 60; 
    isQuizAnswered = false;
    
    // 👇 ADICIONE DUAS BARRAS (//) NA FRENTE DESTA LINHA PARA COMENTAR
    // startQuizTimer(); 
Lugar 2: Na função switchTab()
Isso impede que o timer reinicie caso você saia da aba do Quiz e volte depois.

JavaScript

// 📄 Arquivo: script.js -> function switchTab(name)

    if (name === 'quiz') {
        const display = document.getElementById('q-timer');
        const isResult = document.querySelector('.quiz-result');
        
        if(display && !isResult && !isQuizAnswered) {
            // 👇 ADICIONE DUAS BARRAS (//) AQUI TAMBÉM
            // startQuizTimer();
        }
    }
3. Esconder o Relógio Visualmente (Opcional)
Se você desativou o timer seguindo o passo 2, o relógio ficará parado estático (ex: "60s") no topo da pergunta. Se quiser que ele suma da tela, adicione este código ao final do seu arquivo style.css:

CSS

/* 📄 Arquivo: style.css - Adicione ao final */

.quiz-timer {
    display: none !important;
}