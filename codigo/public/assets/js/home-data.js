// Preenche a home com dados reais do usuário logado (db.json via login.js -> fetchFromApi).
// Depende de login.js (usuarioCorrente, fetchFromApi) já carregado antes deste arquivo.

(function () {
  function classificacaoIqa(iqa) {
    if (iqa <= 40) return 'Bom';
    if (iqa <= 80) return 'Moderado';
    if (iqa <= 120) return 'Ruim';
    return 'Muito Ruim';
  }

  function ehHoje(dataStr) {
    if (!dataStr) return false;
    const d = new Date(dataStr);
    const hoje = new Date();
    return d.getFullYear() === hoje.getFullYear() &&
           d.getMonth() === hoje.getMonth() &&
           d.getDate() === hoje.getDate();
  }

  async function preencherHome() {
    const uid = (typeof usuarioCorrente !== 'undefined' && usuarioCorrente?.id)
      ? Number(usuarioCorrente.id) : null;
    if (uid === null) return; // sem sessão o login.js já redireciona

    let usuarios = [], locais = [], focos = [], qualidade = [], alertas = [];
    try {
      [usuarios, locais, focos, qualidade, alertas] = await Promise.all([
        fetchFromApi('usuarios'),
        fetchFromApi('locais'),
        fetchFromApi('focos_incendio'),
        fetchFromApi('qualidade_ar'),
        fetchFromApi('alertas')
      ]);
    } catch (e) {
      return; // mantém o estado atual se o servidor não responder
    }

    // Locais (propriedades) do usuário logado
    const meusLocais = locais.filter(l => Number(l.usuarioId) === uid);
    const idsMeusLocais = meusLocais.map(l => Number(l.id));

    // Saudação com o nome real
    const user = usuarios.find(u => Number(u.id) === uid) || {};
    const titulo = document.querySelector('.topbar-title');
    if (titulo && user.nome) titulo.textContent = `Olá, ${user.nome.split(' ')[0]}`;

    // --- Focos Ativos ---
    const focosUsuario = focos.filter(f => idsMeusLocais.includes(Number(f.localId)));
    const focosTotal = focosUsuario.length || focos.length; // fallback: panorama geral
    const baseFocos = focosUsuario.length ? focosUsuario : focos;
    const focosHoje = baseFocos.filter(f => ehHoje(f.data)).length;

    // --- Qualidade do ar (IQA) ---
    const qualidadeUsuario = qualidade.filter(q => idsMeusLocais.includes(Number(q.localId)));
    const baseQual = qualidadeUsuario.length ? qualidadeUsuario : qualidade;
    const iqaMedio = baseQual.length
      ? Math.round(baseQual.reduce((t, q) => t + Number(q.iqa || 0), 0) / baseQual.length)
      : 0;
    const iqaClasse = baseQual[0]?.classificacao || classificacaoIqa(iqaMedio);

    // --- Propriedades ---
    const totalPropriedades = meusLocais.length;
    const propriedadesEmAlerta = meusLocais.filter(l =>
      String(l.risco || '').toLowerCase() === 'alto').length;

    // --- Alertas ---
    const naoLidos = alertas.filter(a => !a.lido).length;
    const criticos = alertas.filter(a =>
      !a.lido && String(a.severidade || '').toLowerCase().includes('critic')).length;

    // Aplica nos cards (ordem do HTML: focos, IQA, propriedades, alertas)
    const cards = document.querySelectorAll('.stats-grid .stat-card');
    function setCard(card, valueHtml, tagText, tagClass) {
      if (!card) return;
      const v = card.querySelector('.stat-value');
      const t = card.querySelector('.stat-tag');
      if (v) v.innerHTML = valueHtml;
      if (t && tagText !== undefined) {
        t.textContent = tagText;
        if (tagClass) t.className = `stat-tag ${tagClass}`;
      }
    }

    setCard(cards[0], String(focosTotal),
      focosHoje > 0 ? `+${focosHoje} hoje` : 'estável',
      focosHoje > 0 ? 'stat-tag--red' : 'stat-tag--orange');
    setCard(cards[1], `IQA <span>${iqaMedio}</span>`, iqaClasse, 'stat-tag--orange');
    setCard(cards[2], String(totalPropriedades),
      propriedadesEmAlerta > 0 ? `${propriedadesEmAlerta} em alerta` : 'sem alertas',
      propriedadesEmAlerta > 0 ? 'stat-tag--orange' : 'stat-tag--orange');
    setCard(cards[3], String(naoLidos),
      criticos > 0 ? `${criticos} críticos` : 'nenhum crítico',
      criticos > 0 ? 'stat-tag--red' : 'stat-tag--orange');

    // Topbar: pílula e sino de alertas
    const pill = document.querySelector('.alert-pill');
    if (pill) {
      const txt = pill.childNodes[pill.childNodes.length - 1];
      const label = criticos > 0 ? `${criticos} alertas críticos` : `${naoLidos} alertas`;
      if (txt && txt.nodeType === Node.TEXT_NODE) txt.textContent = ` ${label}`;
      else pill.append(` ${label}`);
    }
    const badge = document.querySelector('.bell-badge');
    if (badge) badge.textContent = naoLidos;

    // --- Mapa de focos (Leaflet, dados reais) ---
    renderMapa(meusLocais, baseFocos);
  }

  let _homeMap = null;
  function corIntensidade(i) {
    const v = String(i || '').toLowerCase();
    if (v.includes('alta') || v.includes('critic')) return '#DC2626';
    if (v.includes('media') || v.includes('média') || v.includes('moderad')) return '#F97316';
    return '#9CA3AF';
  }

  function renderMapa(meusLocais, focos) {
    const el = document.getElementById('homeMap');
    if (!el || typeof L === 'undefined') return;

    // Centro: propriedade do usuário, senão média dos focos, senão Brasil central
    let centro = [-15.7942, -47.8822], zoom = 4;
    if (meusLocais[0] && meusLocais[0].lat != null) {
      centro = [Number(meusLocais[0].lat), Number(meusLocais[0].lng)];
      zoom = 6;
    } else if (focos[0] && focos[0].lat != null) {
      centro = [Number(focos[0].lat), Number(focos[0].lng)];
      zoom = 6;
    }

    if (_homeMap) { _homeMap.remove(); _homeMap = null; }
    _homeMap = L.map(el, { zoomControl: false, attributionControl: false }).setView(centro, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(_homeMap);
    L.control.attribution({ prefix: false })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
      .addTo(_homeMap);

    const pontos = [];

    // Propriedades do usuário
    meusLocais.forEach(l => {
      if (l.lat == null) return;
      const p = [Number(l.lat), Number(l.lng)];
      pontos.push(p);
      L.marker(p, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:26px;height:26px;border-radius:50%;background:#F97316;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;">⌂</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13]
        })
      }).addTo(_homeMap).bindPopup(`<b>${l.nome || 'Propriedade'}</b><br>${l.cidade || ''}/${l.estado || ''}`);
    });

    // Focos de incêndio
    focos.forEach(f => {
      if (f.lat == null) return;
      const p = [Number(f.lat), Number(f.lng)];
      pontos.push(p);
      const cor = corIntensidade(f.intensidade);
      L.circleMarker(p, { radius: 7, color: '#fff', weight: 2, fillColor: cor, fillOpacity: 0.9 })
        .addTo(_homeMap)
        .bindPopup(`<b>Foco de incêndio</b><br>${f.cidade || ''}/${f.estado || ''}<br>Intensidade: ${f.intensidade || '--'}<br>Data: ${f.data || '--'}`);
    });

    if (pontos.length > 1) {
      _homeMap.fitBounds(L.latLngBounds(pontos).pad(0.3));
    }
    setTimeout(() => _homeMap && _homeMap.invalidateSize(), 200);

    // Título do rodapé com a região do usuário
    const title = document.querySelector('.map-footer-title');
    if (title && meusLocais[0]) {
      title.textContent = `Mapa de Focos – ${meusLocais[0].cidade || meusLocais[0].nome}`;
    }
  }

  document.addEventListener('DOMContentLoaded', preencherHome);
})();
