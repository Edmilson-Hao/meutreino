const sequenciaTreinos = ["Push", "Pull", "Legs", "Ombro", "Braço"];

const treinos = {
  "Push": [
    "Supino Inclinado Halteres - 5x10",
    "Crucifixo Máquina - 4x10",
    "Cross Over Polia Alta - 4x10",
    "Elevação Lateral - 2x50 + 2x10",
    "Tríceps Pulley Barra V - 4x10",
    "Tríceps Testa Barra W Supinado - 4x10"
  ],
  "Pull": [
    "Puxada Pronada - 5x10",
    "Remada Máquina - 4x10",
    "Remada Alta Sentado no Cross - 4x10",
    "Serrote - 4x8",
    "FacePull - 4x12",
    "Rosca Direta Sentado - 4x10",
    "Rosca Martelo - 4x10"
  ],
  "Legs": [
    "Flexora Deitada - 4x10",
    "Flexora Sentada - 4x10",
    "Agachamento Barra - 4x10",
    "Leg Press 45° - 4x8",
    "Panturrilha no Leg 45° - 4x12",
    "Extensora - 4x10"
  ],
  "Ombro": [
    "Elevação Lateral Polia - 6x10",
    "Desenvolvimento Halteres - 4x10",
    "Elevação Frontal Halteres - 4x10",
    "Facepull - 4x10",
    "Crucifixo Inverso Máquina - 4x10",
    "Elevação Lateral Halteres - 2x50 + 2x10",
    "Remada Alta - 4x10"
  ],
  "Braço": [
    "Rosca Scott Barra W - 4x10",
    "Tríceps Pulley Barra W - 4x10",
    "Rosca Sentado Halteres - 4x10",
    "Tríceps Testa Barra W Supinado - 4x10",
    "Rosca Martelo - 4x10",
    "Tríceps Coice - 4x10"
  ]
};

// ==================== LOCALSTORAGE ====================
function getDados() {
  const dados = localStorage.getItem('treinosGorillaV7');
  if (!dados) {
    return { ultimoCompleto: null, definitivos: {}, rascunhos: {} };
  }
  return JSON.parse(dados);
}

function salvarDados(dados) {
  localStorage.setItem('treinosGorillaV7', JSON.stringify(dados));
}

// ==================== RASCUNHO (a cada digitação) ====================
function salvarComoRascunho() {
  const inputs = document.querySelectorAll('input[data-ex]');
  if (inputs.length === 0) return;

  const dados = getDados();
  const hoje = new Date().toISOString().split('T')[0];
  const treinoHoje = determinarTreinoDoDia();

  // Garante a estrutura
  if (!dados.rascunhos[hoje]) dados.rascunhos[hoje] = {};
  if (!dados.rascunhos[hoje][treinoHoje]) dados.rascunhos[hoje][treinoHoje] = {};

  inputs.forEach(inp => {
    const ex = inp.dataset.ex;
    const serie = parseInt(inp.dataset.serie);
    const tipo = inp.dataset.tipo;
    const valor = inp.value.trim();

    if (!dados.rascunhos[hoje][treinoHoje][ex]) {
      dados.rascunhos[hoje][treinoHoje][ex] = [];
    }
    if (!dados.rascunhos[hoje][treinoHoje][ex][serie]) {
      dados.rascunhos[hoje][treinoHoje][ex][serie] = { carga: "", reps: "" };
    }
    dados.rascunhos[hoje][treinoHoje][ex][serie][tipo] = valor;
  });

  salvarDados(dados);
}

// ==================== DEFINITIVO (botão concluir) ====================
function salvarComoDefinitivo() {
  const dados = getDados();
  const hoje = new Date().toISOString().split('T')[0];
  const treinoHoje = determinarTreinoDoDia();

  // Copia rascunho para definitivo (se existir)
  if (dados.rascunhos[hoje] && dados.rascunhos[hoje][treinoHoje]) {
    if (!dados.definitivos[hoje]) dados.definitivos[hoje] = {};
    dados.definitivos[hoje][treinoHoje] = JSON.parse(JSON.stringify(dados.rascunhos[hoje][treinoHoje]));
  }

  // Avança a sequência
  dados.ultimoCompleto = treinoHoje;

  // Remove rascunho do dia
  delete dados.rascunhos[hoje];

  salvarDados(dados);
}

// ==================== CARREGA REGISTROS DO DIA ====================
function getRegistrosDoDia() {
  const dados = getDados();
  const hoje = new Date().toISOString().split('T')[0];
  const treinoHoje = determinarTreinoDoDia();

  // Rascunho tem prioridade
  return dados.rascunhos[hoje]?.[treinoHoje] || dados.definitivos[hoje]?.[treinoHoje] || {};
}

// ==================== ÚLTIMO REGISTRO (placeholder) ====================
function getUltimoRegistro(exercicio) {
  const dados = getDados();
  const datas = Object.keys(dados.definitivos).sort().reverse();

  for (const data of datas) {
    for (const treino of Object.keys(dados.definitivos[data])) {
      if (dados.definitivos[data][treino]?.[exercicio]) {
        return dados.definitivos[data][treino][exercicio];
      }
    }
  }
  return null;
}

// ==================== CONTAR SÉRIES ====================
function contarSeries(seriesStr) {
  const partes = seriesStr.split('+').map(p => p.trim());
  let total = 0;
  for (let parte of partes) {
    const match = parte.match(/(\d+)x/);
    if (match) total += parseInt(match[1]);
  }
  return total;
}

// ==================== DETERMINAR TREINO DO DIA ====================
function determinarTreinoDoDia() {
  const dados = getDados();
  const hoje = new Date().toISOString().split('T')[0];

  // Se já concluiu hoje → mostra o concluído
  if (dados.definitivos[hoje] && Object.keys(dados.definitivos[hoje]).length > 0) {
    return Object.keys(dados.definitivos[hoje])[0];
  }

  // Senão calcula o próximo
  let index = 0;
  if (dados.ultimoCompleto !== null) {
    const ultimoIndex = sequenciaTreinos.indexOf(dados.ultimoCompleto);
    index = (ultimoIndex + 1) % sequenciaTreinos.length;
  }
  return sequenciaTreinos[index];
}

// ==================== RENDERIZAR TREINO ====================
function gerarTreinoDoDia() {
  const treinoNome = determinarTreinoDoDia();
  document.getElementById("nomeTreinoHoje").textContent = treinoNome.toUpperCase();
  document.getElementById("dataHoje").textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const container = document.getElementById("treinoContainer");
  const registrosHoje = getRegistrosDoDia();

  let html = "";

  treinos[treinoNome].forEach(ex => {
    const [nomeExercicio, seriesStr] = ex.split(" - ");
    const seriesCount = contarSeries(seriesStr);
    const seriesHoje = registrosHoje[nomeExercicio] || [];
    const ultimoRegistro = getUltimoRegistro(nomeExercicio);

    html += `
      <div class="exercicio-item">
        <div class="exercicio-header" onclick="toggleSeries(this)">
          <div>
            <div style="font-size:1.5rem; font-weight:900;">${nomeExercicio}</div>
            <small style="color:#778DA9;">${seriesStr}</small>
          </div>
        </div>
        <div class="series-container">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; margin-top: 8px;">`;

    for (let i = 0; i < seriesCount; i++) {
      const hojeData = seriesHoje[i] || { carga: "", reps: "" };
      const ultimo = ultimoRegistro?.[i] || { carga: "", reps: "" };

      const cargaValue = hojeData.carga;
      const repsValue = hojeData.reps;
      const cargaPlaceholder = cargaValue ? "" : (ultimo.carga || "kg");
      const repsPlaceholder = repsValue ? "" : (ultimo.reps || "reps");
      const completo = cargaValue && repsValue;

      html += `
        <div class="serie">
          <span>S${i+1}:</span>
          <input type="number" ${cargaValue ? `value="${cargaValue}"` : `placeholder="${cargaPlaceholder}"`}
                 data-ex="${nomeExercicio}" data-serie="${i}" data-tipo="carga">
          <strong>×</strong>
          <input type="number" ${repsValue ? `value="${repsValue}"` : `placeholder="${repsPlaceholder}"`}
                 data-ex="${nomeExercicio}" data-serie="${i}" data-tipo="reps">
          ${completo ? '<span class="checkmark">✓</span>' : ''}
        </div>`;
    }

    html += `</div></div></div>`;
  });

  container.innerHTML = html;
}

// ==================== TOGGLE ====================
function toggleSeries(header) {
  const container = header.nextElementSibling;
  container.classList.toggle('open');
  header.classList.toggle('open');
}

// ==================== EVENTOS ====================
document.addEventListener('input', salvarComoRascunho);

document.getElementById('btnConcluir').addEventListener('click', () => {
  salvarComoDefinitivo();
  const treinoHoje = determinarTreinoDoDia();
  const proxIndex = (sequenciaTreinos.indexOf(treinoHoje) + 1) % 5;
  const proximo = sequenciaTreinos[proxIndex];
  alert(`TREINO ${treinoHoje.toUpperCase()} CONCLUÍDO!\n\nAmanhã: ${proximo.toUpperCase()}!`);
  location.reload();
});

// ==================== INICIA ====================
gerarTreinoDoDia();