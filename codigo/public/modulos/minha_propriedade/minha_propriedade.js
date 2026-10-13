
function initials(name) {
  return String(name || 'Flamer')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('pt-BR');
}

function riskClass(risk) {
  const value = String(risk || '').toLowerCase();
  if (value.includes('alto')) return 'rose';
  if (value.includes('medio') || value.includes('médio')) return 'orange';
  return 'green';
}

function riskLabel(risk) {
  const value = String(risk || '').toLowerCase();
  if (value.includes('alto')) return 'Alto';
  if (value.includes('medio')) return 'Médio';
  return 'Baixo';
}

function updateShell(data) {
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

function renderPropertyList(data, selected) {
  const list = document.querySelector('.property-list');
  list.innerHTML = `
    <div class="section-title">Minhas Propriedades</div>
    ${data.locais.map(local => `
      <div class="property-item ${local.id === selected.id ? 'active' : ''}">
        <div>
          <strong>${local.nome}</strong>
          <span>${local.tamanho} • ${local.cidade}, ${local.estado}</span>
        </div>
        <span class="badge ${riskClass(local.risco)}">${riskLabel(local.risco)}</span>
      </div>
    `).join('')}
  `;
}

function renderStatus(data, selected) {
  const localFocos = data.focos_incendio.filter(item => Number(item.localId) === Number(selected.id));
  const localOcorrencias = data.ocorrencias.filter(item => Number(item.localId) === Number(selected.id));
  const localAlertas = data.alertas.filter(item => Number(item.localId) === Number(selected.id));
  const weather = data.meteorologia.find(item => Number(item.localId) === Number(selected.id));
  const lastInspection = localOcorrencias
    .slice()
    .sort((a, b) => new Date(b.data) - new Date(a.data))[0]?.data || weather?.data;

  document.querySelector('.status-card').innerHTML = `
    <div class="section-title">Status da Fazenda</div>
    <div class="status-list">
      <div><span>Área total</span><strong>${selected.tamanho}</strong></div>
      <div><span>Cidade</span><strong>${selected.cidade} - ${selected.estado}</strong></div>
      <div><span>Focos próximos</span><strong>${localFocos.length} ativos</strong></div>
      <div><span>Alertas</span><strong>${localAlertas.length} registros</strong></div>
      <div><span>Última inspeção</span><strong>${formatDate(lastInspection)}</strong></div>
      <div><span>Clima</span><strong>${weather ? `${weather.temperatura}°C / ${weather.umidade}%` : '--'}</strong></div>
      <div><span>Risco atual</span><strong class="accent">${riskLabel(selected.risco).toUpperCase()}</strong></div>
    </div>
    <a class="outline" href="#modal-edit-boundary">Editar delimitação</a>
  `;
}

function renderChart(data, selected) {
  const localFocos = data.focos_incendio.filter(item => Number(item.localId) === Number(selected.id));
  const localOcorrencias = data.ocorrencias.filter(item => Number(item.localId) === Number(selected.id));
  const base = Math.max(localFocos.length + localOcorrencias.length, 1);
  const columns = [
    ['Focos', localFocos.length, 'high'],
    ['Ocorrências', localOcorrencias.length, selected.risco === 'alto' ? 'high' : 'medium'],
    ['Alertas', data.alertas.filter(item => Number(item.localId) === Number(selected.id)).length, 'medium'],
    ['Risco', selected.risco === 'alto' ? 3 : selected.risco === 'medio' ? 2 : 1, riskClass(selected.risco) === 'rose' ? 'high' : riskClass(selected.risco) === 'orange' ? 'medium' : 'low']
  ];

  document.querySelector('.property-chart-card').innerHTML = `
    <div class="property-chart-header">
      <div>
        <span class="section-title">${selected.nome}</span>
        <strong>Risco e focos por indicador</strong>
      </div>
      <span class="badge ${riskClass(selected.risco)}">${riskLabel(selected.risco)}</span>
    </div>
    <div class="property-chart">
      ${columns.map(([label, value, level]) => {
        const height = Math.max(24, Math.round((Number(value) / Math.max(base, 3)) * 92));
        return `<div class="risk-column ${level}" style="--height: ${height}%"><strong>${label}</strong><span>${value}</span></div>`;
      }).join('')}
    </div>
  `;
}

function renderZones(data) {
  const rows = data.locais.map(local => {
    const focos = data.focos_incendio.filter(item => Number(item.localId) === Number(local.id)).length;
    return `
      <div class="zones-row">
        <span>${local.nome}</span>
        <span>${local.cidade}</span>
        <span>${local.tamanho}</span>
        <span class="badge ${riskClass(local.risco)}">${riskLabel(local.risco)}</span>
        <a href="#modal-zone-a">${focos} focos</a>
      </div>
    `;
  }).join('');

  document.querySelector('.zones-card').innerHTML = `
    <div class="section-title">Zonas da Propriedade</div>
    <div class="zones-table">
      <div class="zones-head">
        <span>Propriedade</span>
        <span>Cidade</span>
        <span>Área</span>
        <span>Risco</span>
        <span>Focos</span>
      </div>
      ${rows}
    </div>
  `;
}

async function initPropertyPage() {
  const [usuarios, locais, ocorrencias, alertas, focos_incendio, meteorologia] = await Promise.all([
    fetchFromApi('usuarios'),
    fetchFromApi('locais'),
    fetchFromApi('ocorrencias'),
    fetchFromApi('alertas'),
    fetchFromApi('focos_incendio'),
    fetchFromApi('meteorologia')
  ]);

  const data = { usuarios, locais, ocorrencias, alertas, focos_incendio, meteorologia };
  const sessionId = (typeof usuarioCorrente !== 'undefined' && usuarioCorrente?.id) ? Number(usuarioCorrente.id) : 2;
  const user = usuarios.find(item => Number(item.id) === sessionId) || usuarios[0];
  data.locais = data.locais.filter(item => Number(item.usuarioId) === Number(user.id));
  const selected = data.locais[0] || null;

  updateShell(data);
  window.APP = { data, user, selected };

  if (!selected) {
    document.querySelector('.property-list').innerHTML = '<div class="section-title">Minhas Propriedades</div><div style="padding:16px;color:var(--text-secondary)">Nenhuma propriedade cadastrada.</div>';
    document.querySelector('.status-card').innerHTML = '';
    document.querySelector('.property-chart-card').innerHTML = '';
    document.querySelector('.zones-card').innerHTML = '';
    return;
  }

  renderPropertyList(data, selected);
  renderStatus(data, selected);
  renderChart(data, selected);
  renderZones(data);
}

document.addEventListener('DOMContentLoaded', () => {
  initPropertyPage().catch(() => {
    document.querySelector('.content').insertAdjacentHTML('afterbegin', '<div class="data-alert">Não foi possível carregar os dados do db.json. Inicie o JSON Server e atualize a página.</div>');
  });
});

function setupPropertyInteractions() {
  const app = window.APP;
  if (!app) return;

  const list = document.querySelector('.property-list');
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.property-item');
    if (!item) return;
    const items = Array.from(list.querySelectorAll('.property-item'));
    const index = items.indexOf(item);
    const selectedLocal = app.data.locais[index];
    if (!selectedLocal) return;
    app.selected = selectedLocal;
    renderPropertyList(app.data, app.selected);
    renderStatus(app.data, app.selected);
    renderChart(app.data, app.selected);
  });

  const addModal = document.getElementById('modal-add-property');
  const addSave = addModal.querySelector('.modal-actions .primary.small');
  addSave.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const name = addModal.querySelector('input[placeholder^="Ex.: Fazenda"]').value.trim();
    const area = addModal.querySelector('input[placeholder^="Ex.: 280"]').value.trim();
    const municipality = addModal.querySelector('input[placeholder^="Ex.: Belo Horizonte"]').value.trim();
    const notes = addModal.querySelector('textarea').value.trim();
    if (!name) return alert('Informe o nome da propriedade');

    const parts = municipality.split(',').map(p => p.trim());
    const cidade = parts[0] || '';
    const estado = parts[1] || '';

    const maxId = app.data.locais.reduce((m, l) => Math.max(m, Number(l.id || 0)), 0);
    const newLocal = {
      id: maxId + 1,
      usuarioId: app.user.id,
      nome: name,
      tamanho: area || '--',
      cidade: cidade,
      estado: estado,
      observacoes: notes,
      risco: 'baixo'
    };

    app.data.locais.push(newLocal);
    app.selected = newLocal;
    renderPropertyList(app.data, app.selected);
    renderStatus(app.data, app.selected);
    renderChart(app.data, app.selected);

    try {
      await fetch(`/locais`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newLocal) });
    } catch (err) {
    }

    location.hash = '';
  });

  const editModal = document.getElementById('modal-edit-boundary');
  const editSave = editModal.querySelector('.modal-actions .primary.small');
  editSave.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const input = editModal.querySelector('input[type="number"]');
    const value = input ? input.value : null;
    if (!value) return alert('Informe a área da fazenda');
    if (!app.selected) return;
    app.selected.tamanho = `${value} ha`;

    const idx = app.data.locais.findIndex(l => Number(l.id) === Number(app.selected.id));
    if (idx >= 0) app.data.locais[idx].tamanho = app.selected.tamanho;

    renderStatus(app.data, app.selected);

    try {
      await fetch(`/locais/${app.selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tamanho: app.selected.tamanho }) });
    } catch (err) {
    }

    location.hash = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const wait = setInterval(() => {
    if (window.APP) {
      clearInterval(wait);
      setupPropertyInteractions();
    }
  }, 150);
});
