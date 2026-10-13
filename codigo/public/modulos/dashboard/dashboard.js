
function parseArea(value) {
  const number = String(value || '').replace('.', '').match(/\d+/);
  return number ? Number(number[0]) : 0;
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function riskBadge(value) {
  const risk = String(value || '').toLowerCase();
  if (risk.includes('alto') || risk.includes('ativo')) return 'rose';
  if (risk.includes('medio') || risk.includes('médio') || risk.includes('analise') || risk.includes('análise')) return 'orange';
  return 'green';
}

function initials(name) {
  return String(name || 'Flamer')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function updateUser(data) {
  const sessionId = (typeof usuarioCorrente !== 'undefined' && usuarioCorrente?.id) ? Number(usuarioCorrente.id) : 2;
  const user = data.usuarios.find(item => Number(item.id) === sessionId) || data.usuarios[0];
  const property = data.locais.find(item => Number(item.usuarioId) === Number(user.id)) || data.locais[0];
  const unreadAlerts = data.alertas.filter(alerta => !alerta.lido).length;

  document.querySelectorAll('.user-avatar, .top-avatar').forEach(item => {
    item.textContent = initials(user.nome);
  });
  document.querySelectorAll('.user-name').forEach(item => {
    item.textContent = user.nome;
  });
  document.querySelectorAll('.farm-name').forEach(item => {
    item.textContent = property ? property.nome : 'Propriedade';
  });
  document.querySelectorAll('.alert-bell').forEach(item => {
    item.textContent = unreadAlerts;
  });
}

function renderMetrics(data) {
  const focos = data.focos_incendio.length;
  const areaAfetada = data.historico_queimadas.reduce((total, item) => total + Number(item.areaHectares || 0), 0);
  const iqaMedio = Math.round(data.qualidade_ar.reduce((total, item) => total + Number(item.iqa || 0), 0) / Math.max(data.qualidade_ar.length, 1));
  const resolvidas = data.ocorrencias.filter(item => String(item.status || '').toLowerCase().includes('resolvido')).length;
  const resolucao = Math.round((resolvidas / Math.max(data.ocorrencias.length, 1)) * 100);

  const metrics = [
    ['🔥', focos, 'Focos no Período', 'db.json', 'red'],
    ['◢', `${areaAfetada} ha`, 'Área Afetada', 'histórico', 'rose'],
    ['☁', `IQA ${iqaMedio}`, 'Média Qualidade Ar', data.qualidade_ar[0]?.classificacao || 'monitorado', 'orange'],
    ['✓', `${resolucao}%`, 'Ocorrências Resolvidas', `${resolvidas} de ${data.ocorrencias.length}`, 'green']
  ];

  document.querySelector('.stats').innerHTML = metrics.map(([icon, value, label, badge, color]) => `
    <article class="card metric metric-${color}">
      <span class="metric-icon">${icon}</span>
      <strong>${value}</strong>
      <p>${label}</p>
      <span class="badge ${color}">${badge}</span>
    </article>
  `).join('');
}

function renderFocusBars(data) {
  const grouped = data.focos_incendio.reduce((acc, foco) => {
    const local = data.locais.find(item => Number(item.id) === Number(foco.localId));
    const name = local ? local.nome : foco.cidade || 'Sem local';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  document.querySelector('.focus-bars').innerHTML = entries.map(([name, count]) => {
    const level = count >= max ? 'high' : count > 1 ? 'medium' : 'low';
    const value = Math.max(28, Math.round((count / max) * 88));
    return `<div class="focus-bar ${level}" style="--value: ${value}%"><span>${name}</span><strong>${count}</strong></div>`;
  }).join('');

  document.querySelector('.focus-chart-header .badge').textContent = `${data.focos_incendio.length} focos`;
}

function renderOccurrences(data) {
  const rows = data.ocorrencias
    .slice()
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 4)
    .map(item => {
      const local = data.locais.find(localItem => Number(localItem.id) === Number(item.localId));
      const status = item.status || item.severidade || item.tipo || 'registrado';
      return `
        <div class="event-row">
          <span>${formatDate(item.data)}</span>
          <span>${local ? local.nome : item.tipo || 'Ocorrência'}</span>
          <span class="badge ${riskBadge(status)}">${status}</span>
        </div>
      `;
    }).join('');

  const panel = document.querySelector('.events-panel');
  panel.innerHTML = `
    <div class="panel-title">Últimas Ocorrências</div>
    <div class="events-head">
      <span>Data</span>
      <span>Local</span>
      <span>Status</span>
    </div>
    ${rows || '<div class="event-row muted-row"><span>--</span><span>Nenhuma ocorrência</span><span class="badge green">ok</span></div>'}
  `;
}

function renderDonut(data) {
  const high = data.locais.filter(item => String(item.risco).toLowerCase() === 'alto').length;
  const medium = data.locais.filter(item => String(item.risco).toLowerCase() === 'medio').length;
  const low = Math.max(data.locais.length - high - medium, 0);
  const total = Math.max(data.locais.length, 1);
  const highPct = Math.round((high / total) * 100);
  const mediumPct = Math.round((medium / total) * 100);

  document.querySelector('.donut').style.background = `conic-gradient(var(--accent) 0 ${highPct}%, #f0b77d ${highPct}% ${highPct + mediumPct}%, #83b889 ${highPct + mediumPct}% 100%)`;
  document.querySelector('.donut span').textContent = data.locais.length;
  document.querySelector('.legend').innerHTML = `
    <div><span class="legend-dot orange-fill"></span>Alto ${highPct}%</div>
    <div><span class="legend-dot sand-fill"></span>Médio ${mediumPct}%</div>
    <div><span class="legend-dot green-fill"></span>Baixo ${Math.max(0, 100 - highPct - mediumPct)}%</div>
  `;
}

async function initDashboard() {
  const [usuarios, locais, ocorrencias, alertas, focos_incendio, qualidade_ar, historico_queimadas] = await Promise.all([
    fetchFromApi('usuarios'),
    fetchFromApi('locais'),
    fetchFromApi('ocorrencias'),
    fetchFromApi('alertas'),
    fetchFromApi('focos_incendio'),
    fetchFromApi('qualidade_ar'),
    fetchFromApi('historico_queimadas')
  ]);

  const data = { usuarios, locais, ocorrencias, alertas, focos_incendio, qualidade_ar, historico_queimadas };
  updateUser(data);
  renderMetrics(data);
  renderFocusBars(data);
  renderOccurrences(data);
  renderDonut(data);
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard().catch(() => {
    document.querySelector('.content').insertAdjacentHTML('afterbegin', '<div class="data-alert">Não foi possível carregar os dados do db.json. Inicie o JSON Server e atualize a página.</div>');
  });
});

// Export dashboard (simple client-side PDF via print)
document.addEventListener('DOMContentLoaded', () => {
  // handle export button inside modal
  const modal = document.getElementById('modal-export-dashboard');
  if (!modal) return;
  const exportBtn = modal.querySelector('.modal-actions .primary.small');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    // Capture main content and open printable window
    const content = document.querySelector('.content');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Dashboard Export</title><link rel="stylesheet" href="style.css"></head><body>${content ? content.outerHTML : ''}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de popups.');
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    // Allow time for styles to load
    setTimeout(() => { win.print(); }, 600);
  });
});
