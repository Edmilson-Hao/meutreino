const dados = JSON.parse(localStorage.getItem('treinosGorillaV7') || '{"definitivos":{}}');
const definitivos = dados.definitivos || {};

// === MAPEAMENTO DE GRUPOS MUSCULARES (ATUALIZADO COM DELTOIDE POSTERIOR) ===
const gruposMusculares = {
  "deltoide-lateral": ["Elevação Lateral", "Elevação Lateral Polia", "Elevação Lateral Halteres", "Remada Alta"],
  "deltoide-frontal": ["Elevação Frontal Halteres", "Desenvolvimento Halteres"],
  "deltoide-posterior": ["FacePull", "Facepull", "Crucifixo Inverso Máquina"],   // NOVO GRUPO
  "biceps": ["Rosca Direta Sentado", "Rosca Martelo", "Rosca Scott Barra W", "Rosca Sentado Halteres"],
  "triceps": ["Tríceps Pulley Barra V", "Tríceps Pulley Barra W", "Tríceps Testa Barra W Supinado", "Tríceps Coice"],
  "peito": ["Supino Inclinado Halteres", "Crucifixo Máquina", "Cross Over Polia Alta"],
  "costas": ["Puxada Pronada", "Remada Máquina", "Remada Alta Sentado no Cross", "Serrote"],
  "quadriceps": ["Agachamento Barra", "Leg Press 45°", "Extensora"],
  "posteriores": ["Flexora Deitada", "Flexora Sentada"],
  "panturrilha": ["Panturrilha no Leg 45°"]
};

// === LISTA DE ÚLTIMOS TREINOS COM TONELAGEM (CORRIGIDA E FUNCIONANDO) ===
function listarTreinos() {
  const container = document.getElementById("listaTreinos");
  const datas = Object.keys(definitivos).sort().reverse();

  if (datas.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#888; padding:30px;'>Nenhum treino concluído ainda.</p>";
    return;
  }

  let html = "";
  datas.forEach(data => {
    const dia = definitivos[data];
    const treinoNome = Object.keys(dia)[0];
    let tonelagemTotal = 0;

    // Calcula tonelagem corretamente
    Object.values(dia[treinoNome]).forEach(exercicio => {
      exercicio.forEach(serie => {
        if (serie.carga && serie.reps) {
          tonelagemTotal += parseInt(serie.carga) * parseInt(serie.reps);
        }
      });
    });

    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short'
    });

    html += `
      <div class="treino-item">
        <div>
          <strong>${dataFormatada} • ${treinoNome.toUpperCase()}</strong>
        </div>
        <div style="color:#00FF9D; font-weight:900;">
          ${tonelagemTotal.toLocaleString()} kg
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

// === GRÁFICO DE TONELAGEM POR TREINO ===
let chartTonelagem;
function gerarGraficoTonelagem(filtro = "todos") {
  const labels = [];
  const valores = [];
  const cores = [];
  const coresTreino = { "Push": "#00FF9D", "Pull": "#FF6B6B", "Legs": "#4ECDC4", "Ombro": "#FFD93D", "Braço": "#95E1D3" };

  const datas = Object.keys(definitivos).sort();

  datas.forEach(data => {
    const dia = definitivos[data];
    const treinoNome = Object.keys(dia)[0];
    if (filtro !== "todos" && treinoNome !== filtro) return;

    let tonelagem = 0;
    Object.values(dia[treinoNome]).forEach(ex => {
      ex.forEach(s => {
        if (s.carga && s.reps) tonelagem += parseInt(s.carga) * parseInt(s.reps);
      });
    });

    if (tonelagem > 0) {
      labels.push(new Date(data).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'}));
      valores.push(tonelagem);
      cores.push(coresTreino[treinoNome] || "#778DA9");
    }
  });

  if (chartTonelagem) chartTonelagem.destroy();
  chartTonelagem = new Chart(document.getElementById("graficoTonelagem"), {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [{
        label: 'Tonelagem',
        data: valores.length ? valores : [0],
        backgroundColor: cores.length ? cores : "rgba(119,141,169,0.6)",
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: filtro === "todos" ? "Tonelagem por Treino" : `Tonelagem - ${filtro.toUpperCase()}`, color: '#E0E1DD', font: {size: 18} },
        legend: { display: false },
        tooltip: { callbacks: { afterLabel: ctx => `Treino: ${Object.keys(definitivos[datas[ctx.dataIndex]])[0]}` } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#E0E1DD', callback: v => v.toLocaleString() + ' kg' } },
        x: { ticks: { color: '#E0E1DD' } }
      }
    }
  });
}

// === GRÁFICO POR GRUPO MUSCULAR ===
let chartGrupo;
function gerarGraficoGrupo(grupo) {
  const exercicios = gruposMusculares[grupo];
  const labels = [];
  const tonelagens = [];
  const datas = Object.keys(definitivos).sort();

  datas.forEach(data => {
    let total = 0;
    Object.values(definitivos[data]).forEach(treinoObj => {
      Object.entries(treinoObj).forEach(([exNome, series]) => {
        if (exercicios.some(e => exNome.includes(e))) {
          series.forEach(s => {
            if (s.carga && s.reps) total += parseInt(s.carga) * parseInt(s.reps);
          });
        }
      });
    });
    if (total > 0) {
      labels.push(new Date(data).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'}));
      tonelagens.push(total);
    }
  });

  const nomeGrupo = document.querySelector('#selectGrupo option:checked').textContent;

  if (chartGrupo) chartGrupo.destroy();
  chartGrupo = new Chart(document.getElementById("graficoGrupo"), {
    type: 'line',
    data: {
      labels: labels.length ? labels : ["Sem dados"],
      datasets: [{
        label: nomeGrupo,
        data: tonelagens.length ? tonelagens : [0],
        borderColor: '#00FF9D',
        backgroundColor: 'rgba(0,255,157,0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 9
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: `Tonelagem - ${nomeGrupo}`, color: '#E0E1DD', font: {size: 18} } },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#E0E1DD', callback: v => v.toLocaleString() + ' kg' } },
        x: { ticks: { color: '#E0E1DD' } }
      }
    }
  });
}

// === EVENTOS ===
document.getElementById("filtroTreino").addEventListener("change", e => gerarGraficoTonelagem(e.target.value));
document.getElementById("selectGrupo").onchange = e => gerarGraficoGrupo(e.target.value);

// === INICIA TUDO ===
listarTreinos();           // ← ESSA LINHA ESTAVA FALTANDO!
gerarGraficoTonelagem();
gerarGraficoGrupo("deltoide-lateral");