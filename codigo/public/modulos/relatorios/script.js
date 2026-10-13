const API = 'http://localhost:3001';
let todosRelatorios = [];
let locaisMap = {};
let usuarioAtual = null;

// ── TOAST
function mostrarToast(msg, tipo) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast visivel' + (tipo ? ' toast--' + tipo : '');
  setTimeout(() => { t.className = 'toast'; }, 3200);
}

// ── USUÁRIO LOGADO
async function carregarUsuario() {
  const uid = (typeof usuarioCorrente !== 'undefined' && usuarioCorrente?.id) ? usuarioCorrente.id : 1;
  try {
    const r = await fetch(`${API}/usuarios/${uid}`);
    if (r.ok) {
      usuarioAtual = await r.json();
      const initials = usuarioAtual.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      document.getElementById('nomeUsuario').textContent = usuarioAtual.nome;
      document.getElementById('avatarSidebar').textContent = initials;
      document.getElementById('avatarBarra').textContent = initials;
    }
  } catch (_) {}
}

// ── LOCAIS
async function carregarLocais() {
  try {
    const r = await fetch(`${API}/locais`);
    const locais = await r.json();
    locais.forEach(l => { locaisMap[l.id] = l.nome; });
    const sel = document.getElementById('campoLocal');
    sel.innerHTML = locais.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');
  } catch (_) {}
}

// ── ALERTAS
async function carregarAlertas() {
  try {
    const r = await fetch(`${API}/alertas`);
    const alertas = await r.json();
    document.getElementById('emblemaAlertas').textContent = alertas.length;
  } catch (_) {}
}

// ── BADGE MAPS
const tipoBadge = {
  'Mensal':       'badge--mensal',
  'Semanal':      'badge--semanal',
  'Ocorrência':   'badge--ocorrencia',
  'Qualidade Ar': 'badge--qualidade',
  'Ambiental':    'badge--ambiental',
  'Oficial':      'badge--finalizado',
};
const statusBadge = {
  'Finalizado': 'badge--finalizado',
  'Em revisão': 'badge--revisao',
  'Rascunho':   'badge--rascunho',
};

// ── FORMATAR PERÍODO
function formatarPeriodo(inicio, fim) {
  if (!inicio) return '—';
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const fmt = d => {
    const [,m,day] = d.split('-');
    return `${parseInt(day)}/${meses[parseInt(m)-1]}`;
  };
  if (!fim || inicio === fim) return fmt(inicio);
  return `${fmt(inicio)} – ${fmt(fim)}`;
}

// ── MÉTRICAS
function atualizarMetricas(lista) {
  document.getElementById('metTotal').textContent = lista.length;
  document.getElementById('metOcorrencias').textContent = lista.reduce((s, r) => s + (r.ocorrencias || 0), 0);
  document.getElementById('metOficiais').textContent = lista.filter(r => r.status === 'Finalizado').length;
  const mb = lista.reduce((s, r) => s + (r.tamanhoMB || 0), 0);
  document.getElementById('metTamanho').textContent = mb.toFixed(1) + ' MB';
}

// ── GLOW NOS CARTÕES
function ativarGlow() {
  document.querySelectorAll('.cartao-filtros, .cartao-metricas, .cartao-tabela').forEach(card => {
    card.onmousemove = e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    };
    card.onmouseleave = () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    };
  });
}

// ── RENDERIZAR TABELA
function renderizarTabela(lista) {
  const tbody = document.getElementById('corpoTabela');
  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="estado-tabela">Nenhum relatório encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(r => {
    const idStr = 'R-' + String(r.id).padStart(3, '0');
    const local = locaisMap[r.localId] || 'Regional';
    const periodo = formatarPeriodo(r.dataInicio, r.dataFim);
    const tipoCls = tipoBadge[r.tipo] || 'badge--rascunho';
    const stCls   = statusBadge[r.status] || 'badge--rascunho';
    return `
    <tr data-id="${r.id}">
      <td class="col-id">${idStr}</td>
      <td class="col-titulo">${r.titulo}</td>
      <td><span class="badge ${tipoCls}">${r.tipo || '—'}</span></td>
      <td class="col-periodo">${periodo}</td>
      <td class="col-propriedade">${local}</td>
      <td><span class="badge ${stCls}">${r.status || '—'}</span></td>
      <td class="col-acoes">
        <button class="btn-acao" title="Ver detalhes" onclick="verDetalhe('${r.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-acao btn-acao--delete" title="Excluir" onclick="excluirRelatorio('${r.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── CARREGAR RELATÓRIOS
async function carregarRelatorios() {
  try {
    const r = await fetch(`${API}/relatorios`);
    if (!r.ok) throw new Error();
    todosRelatorios = await r.json();
    renderizarTabela(todosRelatorios);
    atualizarMetricas(todosRelatorios);
  } catch (_) {
    document.getElementById('corpoTabela').innerHTML =
      `<tr><td colspan="7" class="estado-tabela">⚠️ Servidor indisponível. Rode: <code>npm start</code> na pasta do projeto.</td></tr>`;
    mostrarToast('Servidor indisponível', 'erro');
  }
}

// ── FILTRAR
function aplicarFiltros() {
  const tipo   = document.getElementById('filtroTipo').value;
  const status = document.getElementById('filtroStatus').value;
  const di     = document.getElementById('filtroDataInicio').value;
  const df     = document.getElementById('filtroDataFim').value;
  const busca  = document.getElementById('filtroBusca').value.trim().toLowerCase();
  let lista = [...todosRelatorios];
  if (tipo)   lista = lista.filter(r => r.tipo === tipo);
  if (status) lista = lista.filter(r => r.status === status);
  if (di)     lista = lista.filter(r => r.dataInicio >= di);
  if (df)     lista = lista.filter(r => !r.dataFim || r.dataFim <= df);
  if (busca)  lista = lista.filter(r => r.titulo?.toLowerCase().includes(busca));
  renderizarTabela(lista);
  atualizarMetricas(lista);
}

// ── VER DETALHE
function verDetalhe(id) {
  const r = todosRelatorios.find(x => x.id === id);
  if (!r) return;
  const local = locaisMap[r.localId] || 'Regional';
  const periodo = formatarPeriodo(r.dataInicio, r.dataFim);

  document.getElementById('detalheTitulo').textContent = r.titulo;
  document.getElementById('detalheIdChip').textContent = 'R-' + String(r.id).padStart(3, '0');
  document.getElementById('detalheLocal').textContent = local;
  document.getElementById('detalhePeriodo').textContent = periodo || '—';
  document.getElementById('detalheOcorrencias').textContent = r.ocorrencias ?? '—';
  document.getElementById('detalheAlertas').textContent = r.alertas ?? '—';
  document.getElementById('detalheObs').textContent = r.observacoes?.trim() || 'Sem observações.';

  const tipoBadgeEl = document.getElementById('detalheTipoBadge');
  tipoBadgeEl.textContent = r.tipo || '—';
  tipoBadgeEl.className = 'badge ' + (tipoBadge[r.tipo] || 'badge--rascunho');

  const stBadgeEl = document.getElementById('detalheStatusBadge');
  stBadgeEl.textContent = r.status || '—';
  stBadgeEl.className = 'badge ' + (statusBadge[r.status] || 'badge--rascunho');

  document.getElementById('modalDetalheOverlay').classList.add('aberto');
}

// ── EXCLUIR
async function excluirRelatorio(id) {
  if (!confirm('Excluir este relatório permanentemente?')) return;
  try {
    const r = await fetch(`${API}/relatorios/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error();
    todosRelatorios = todosRelatorios.filter(x => String(x.id) !== String(id));
    renderizarTabela(todosRelatorios);
    atualizarMetricas(todosRelatorios);
    mostrarToast('Relatório excluído', 'sucesso');
  } catch (_) {
    mostrarToast('Erro ao excluir', 'erro');
  }
}

// ── EVENT LISTENERS
document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
document.getElementById('filtroBusca').addEventListener('input', aplicarFiltros);

document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroStatus').value = '';
  document.getElementById('filtroDataInicio').value = '';
  document.getElementById('filtroDataFim').value = '';
  document.getElementById('filtroBusca').value = '';
  renderizarTabela(todosRelatorios);
  atualizarMetricas(todosRelatorios);
});

// ── MODAL DETALHE
const overlayDetalhe = document.getElementById('modalDetalheOverlay');
const fecharDetalhe = () => overlayDetalhe.classList.remove('aberto');
document.getElementById('btnFecharDetalhe').addEventListener('click', fecharDetalhe);
document.getElementById('btnFecharDetalhe2').addEventListener('click', fecharDetalhe);
overlayDetalhe.addEventListener('click', e => { if (e.target === overlayDetalhe) fecharDetalhe(); });

// ── MODAL NOVO
const overlay = document.getElementById('modalOverlay');
const fecharModal = () => overlay.classList.remove('aberto');

document.getElementById('btnNovoRelatorio').addEventListener('click', () => overlay.classList.add('aberto'));
document.getElementById('btnFecharModal').addEventListener('click', fecharModal);
document.getElementById('btnCancelar').addEventListener('click', fecharModal);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });

document.getElementById('btnSalvar').addEventListener('click', async () => {
  const titulo = document.getElementById('campoTitulo').value.trim();
  if (!titulo) { mostrarToast('Informe o título do relatório', ''); return; }

  const novoRelatorio = {
    titulo,
    tipo:        document.getElementById('campoTipo').value,
    status:      document.getElementById('campoStatus').value,
    localId:     parseInt(document.getElementById('campoLocal').value) || 1,
    usuarioId:   usuarioAtual?.id || 1,
    ocorrencias: 0,
    alertas:     0,
    observacoes: document.getElementById('campoObservacoes').value.trim(),
    dataInicio:  document.getElementById('campoDataInicio').value,
    dataFim:     document.getElementById('campoDataFim').value,
    tamanhoMB:   0
  };

  const btn = document.getElementById('btnSalvar');
  btn.disabled = true;
  btn.textContent = 'Salvando…';

  try {
    const r = await fetch(`${API}/relatorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoRelatorio)
    });
    if (!r.ok) throw new Error();
    const criado = await r.json();
    todosRelatorios.unshift(criado);
    renderizarTabela(todosRelatorios);
    atualizarMetricas(todosRelatorios);
    fecharModal();
    mostrarToast('Relatório criado com sucesso!', 'sucesso');
    document.getElementById('campoTitulo').value = '';
    document.getElementById('campoObservacoes').value = '';
    document.getElementById('campoDataInicio').value = '';
    document.getElementById('campoDataFim').value = '';
  } catch (_) {
    mostrarToast('Erro ao criar relatório', 'erro');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Relatório';
  }
});

// ── INIT
(async () => {
  await Promise.all([carregarUsuario(), carregarLocais(), carregarAlertas()]);
  await carregarRelatorios();
  ativarGlow();
})();
