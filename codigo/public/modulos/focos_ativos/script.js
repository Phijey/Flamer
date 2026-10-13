const DEFAULT_LAT = -19.9167;
const DEFAULT_LON = -43.9345;

const FIRMS_KEY = '3b17a02c0738258dfafaf50ee243d737';
const FIRMS_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_KEY}/VIIRS_SNPP_NRT/-74,-34,-28,5/3`;

const MAX_MARKERS = 300;
const MAX_CARDS = 50;

const CITIES = [
  { name: 'São Paulo',             state: 'SP', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro',        state: 'RJ', lat: -22.9068, lon: -43.1729 },
  { name: 'Belo Horizonte',        state: 'MG', lat: -19.9167, lon: -43.9345 },
  { name: 'Salvador',              state: 'BA', lat: -12.9714, lon: -38.5014 },
  { name: 'Brasília',              state: 'DF', lat: -15.7797, lon: -47.9297 },
  { name: 'Fortaleza',             state: 'CE', lat:  -3.7172, lon: -38.5433 },
  { name: 'Manaus',                state: 'AM', lat:  -3.1190, lon: -60.0217 },
  { name: 'Curitiba',              state: 'PR', lat: -25.4284, lon: -49.2733 },
  { name: 'Recife',                state: 'PE', lat:  -8.0476, lon: -34.8770 },
  { name: 'Belém',                 state: 'PA', lat:  -1.4558, lon: -48.5044 },
  { name: 'Porto Alegre',          state: 'RS', lat: -30.0346, lon: -51.2177 },
  { name: 'Goiânia',               state: 'GO', lat: -16.6864, lon: -49.2643 },
  { name: 'São Luís',              state: 'MA', lat:  -2.5297, lon: -44.3028 },
  { name: 'Maceió',                state: 'AL', lat:  -9.6658, lon: -35.7350 },
  { name: 'Natal',                 state: 'RN', lat:  -5.7945, lon: -35.2110 },
  { name: 'Teresina',              state: 'PI', lat:  -5.0892, lon: -42.8019 },
  { name: 'Campo Grande',          state: 'MS', lat: -20.4697, lon: -54.6201 },
  { name: 'João Pessoa',           state: 'PB', lat:  -7.1195, lon: -34.8450 },
  { name: 'Aracaju',               state: 'SE', lat: -10.9472, lon: -37.0731 },
  { name: 'Porto Velho',           state: 'RO', lat:  -8.7612, lon: -63.9004 },
  { name: 'Cuiabá',                state: 'MT', lat: -15.6014, lon: -56.0979 },
  { name: 'Macapá',                state: 'AP', lat:   0.0356, lon: -51.0705 },
  { name: 'Rio Branco',            state: 'AC', lat:  -9.9754, lon: -67.8249 },
  { name: 'Boa Vista',             state: 'RR', lat:   2.8235, lon: -60.6758 },
  { name: 'Palmas',                state: 'TO', lat: -10.2491, lon: -48.3243 },
  { name: 'Florianópolis',         state: 'SC', lat: -27.5954, lon: -48.5480 },
  { name: 'Vitória',               state: 'ES', lat: -20.3155, lon: -40.3128 },
  { name: 'Uberlândia',            state: 'MG', lat: -18.9186, lon: -48.2772 },
  { name: 'Campinas',              state: 'SP', lat: -22.9099, lon: -47.0626 },
  { name: 'Ribeirão Preto',        state: 'SP', lat: -21.1775, lon: -47.8103 },
  { name: 'Santarém',              state: 'PA', lat:  -2.4430, lon: -54.7080 },
  { name: 'Imperatriz',            state: 'MA', lat:  -5.5262, lon: -47.4929 },
  { name: 'Cascavel',              state: 'PR', lat: -24.9555, lon: -53.4552 },
  { name: 'Montes Claros',         state: 'MG', lat: -16.7282, lon: -43.8622 },
  { name: 'Londrina',              state: 'PR', lat: -23.3045, lon: -51.1696 },
  { name: 'Feira de Santana',      state: 'BA', lat: -12.2664, lon: -38.9663 },
  { name: 'Sinop',                 state: 'MT', lat: -11.8643, lon: -55.5041 },
  { name: 'Rondonópolis',          state: 'MT', lat: -16.4726, lon: -54.6366 },
  { name: 'Altamira',              state: 'PA', lat:  -3.2064, lon: -52.2061 },
  { name: 'Ji-Paraná',             state: 'RO', lat: -10.8815, lon: -61.9467 },
  { name: 'Araguaína',             state: 'TO', lat:  -7.1919, lon: -48.2044 },
  { name: 'Cáceres',               state: 'MT', lat: -16.0769, lon: -57.6793 },
  { name: 'Alta Floresta',         state: 'MT', lat:  -9.8760, lon: -56.0861 },
  { name: 'Corumbá',               state: 'MS', lat: -19.0078, lon: -57.6531 },
  { name: 'Marabá',                state: 'PA', lat:  -5.3686, lon: -49.1178 },
  { name: 'Parauapebas',           state: 'PA', lat:  -6.0680, lon: -49.9040 },
  { name: 'Redenção',              state: 'PA', lat:  -8.0289, lon: -49.9742 },
  { name: 'Novo Progresso',        state: 'PA', lat:  -7.1414, lon: -55.3800 },
  { name: 'Itaituba',              state: 'PA', lat:  -4.2761, lon: -55.9839 },
  { name: 'Presidente Médici',     state: 'RO', lat: -11.1766, lon: -61.9008 },
  { name: 'Vilhena',               state: 'RO', lat: -12.7406, lon: -60.1459 },
  { name: 'Colider',               state: 'MT', lat: -10.8120, lon: -55.4509 },
  { name: 'Juara',                 state: 'MT', lat: -11.2616, lon: -57.5228 },
  { name: 'Guarantã do Norte',     state: 'MT', lat:  -9.7968, lon: -54.9071 },
  { name: 'Paragominas',           state: 'PA', lat:  -2.9976, lon: -47.3491 },
];

let map = null;
let allFires = [];
let mapMarkers = [];          // marcadores atualmente no mapa
let markerByIdx = {};         // lookup por f._idx para clique no card

// Estado de visualização: combina modo (todos/propriedade), raio, severidade e busca.
const state = {
  mode: 'todos',          // 'todos' | 'propriedade'
  radius: 10,             // km (apenas no modo propriedade)
  severity: null,         // 'critico' | 'alto' | 'medio' | null
  search: '',
  userLat: DEFAULT_LAT,   // origem = fazenda do usuário logado
  userLon: DEFAULT_LON,
};

function mapConfidence(conf) {
  if (conf === 'high')    return { label: 'Crítico', cssClass: 'foco-badge--critico', color: '#ef4444', key: 'critico' };
  if (conf === 'nominal') return { label: 'Alto',    cssClass: 'foco-badge--alto',    color: '#f97316', key: 'alto'    };
  return                         { label: 'Médio',   cssClass: 'foco-badge--medio',   color: '#f59e0b', key: 'medio'   };
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat, lon) {
  let best = CITIES[0];
  let bestDist = calcDistance(lat, lon, best.lat, best.lon);
  for (let i = 1; i < CITIES.length; i++) {
    const d = calcDistance(lat, lon, CITIES[i].lat, CITIES[i].lon);
    if (d < bestDist) { bestDist = d; best = CITIES[i]; }
  }
  return best;
}

// Contorno aproximado da fronteira do Brasil em [lon, lat] (sentido horário).
// Resolve os casos óbvios de focos em Peru/Bolívia/oceano; é uma aproximação,
// então pode haver pequena imprecisão exatamente na linha de fronteira.
const BRAZIL_POLYGON = [
  // Oeste/Noroeste (Peru/Colômbia)
  [-69.94, -4.23],  // Tabatinga (BR/CO/PE)
  [-69.40, -1.20],
  [-69.60,  0.65],
  [-67.30,  1.80],
  [-66.00,  0.80],  // Pico da Neblina (BR/VE)
  // Norte (Venezuela/Guianas)
  [-64.00,  4.10],
  [-60.70,  5.20],  // ponto mais ao norte (Roraima)
  [-59.50,  4.30],
  [-56.50,  2.00],
  [-54.60,  2.30],
  [-51.10,  4.30],  // Cabo Orange / Oiapoque (AP)
  // Leste (litoral atlântico, descendo)
  [-49.50, -1.40],
  [-44.30, -2.50],
  [-38.50, -3.70],  // Fortaleza
  [-34.79, -7.15],  // Ponta do Seixas (ponto mais a leste)
  [-37.00, -11.00],
  [-38.50, -13.00], // Salvador
  [-39.70, -18.00],
  [-40.90, -21.30],
  [-43.20, -23.00], // Rio de Janeiro
  [-48.50, -28.50],
  [-50.70, -30.50],
  [-53.40, -33.75], // Chuí (ponto mais ao sul)
  // Sul (Uruguai/Argentina/Paraguai, indo para oeste)
  [-57.60, -30.20],
  [-56.00, -27.50],
  [-54.50, -25.60], // Foz do Iguaçu
  [-54.60, -24.00],
  [-57.90, -22.10],
  [-57.60, -19.00], // Corumbá
  [-60.20, -16.30],
  [-65.30, -11.00],
  [-69.57, -10.95], // Assis Brasil (BR/PE/BO)
  // Oeste (Peru, subindo)
  [-72.90,  -9.40],
  [-73.98,  -7.50], // Serra do Divisor (ponto mais a oeste)
  [-72.40,  -5.10],
  [-70.50,  -4.10],
];

// Ray-casting: ponto (lat, lon) dentro do polígono do Brasil?
function pointInBrazil(lat, lon) {
  let inside = false;
  for (let i = 0, j = BRAZIL_POLYGON.length - 1; i < BRAZIL_POLYGON.length; j = i++) {
    const xi = BRAZIL_POLYGON[i][0], yi = BRAZIL_POLYGON[i][1];
    const xj = BRAZIL_POLYGON[j][0], yj = BRAZIL_POLYGON[j][1];
    const intersect = ((yi > lat) !== (yj > lat))
      && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
    const lat = parseFloat(obj['latitude']);
    const lon = parseFloat(obj['longitude']);
    if (isNaN(lat) || isNaN(lon)) return null;
    if (!pointInBrazil(lat, lon)) return null;
    const city = nearestCity(lat, lon);
    return {
      lat, lon,
      confidence: obj['confidence'],
      acq_date:   obj['acq_date'],
      acq_time:   obj['acq_time'],
      frp:        parseFloat(obj['frp']) || 0,
      city:       `${city.name} – ${city.state}`,
      citySearch: `${city.name} ${city.state}`.toLowerCase(),
    };
  }).filter(Boolean);
}

async function fetchFIRMS() {
  const res = await fetch(FIRMS_URL);
  if (!res.ok) throw new Error('Falha ao buscar dados NASA FIRMS');
  return res.text();
}

function makeMarkerIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:32px; height:32px; border-radius:50%;
      background:${color}; opacity:0.85;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-weight:700; font-size:10px; font-family:DM Sans,sans-serif;
    ">${label[0]}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Cria o mapa e o tile layer uma única vez.
function initMap(userLat, userLon) {
  map = L.map('fires-map').setView([userLat, userLon], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);
}

// Reconstrói os marcadores a partir da lista visível, indexando por f._idx
// para que o clique no card sempre encontre o pino correspondente.
function renderMarkers(fires, userLat, userLon) {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];
  markerByIdx = {};

  const subset = fires.slice(0, MAX_MARKERS);
  subset.forEach(f => {
    const info = mapConfidence(f.confidence);
    const dist = calcDistance(userLat, userLon, f.lat, f.lon).toFixed(1);
    const icon = makeMarkerIcon(info.color, info.label);
    const m = L.marker([f.lat, f.lon], { icon })
      .addTo(map)
      .bindPopup(`
        <b>${info.label}</b><br>
        ${f.city}<br>
        Data: ${f.acq_date}<br>
        FRP: ${f.frp} MW<br>
        Distância: ${dist}km
      `);
    mapMarkers.push(m);
    markerByIdx[f._idx] = m;
  });
}

function buildCardHTML(f, userLat, userLon) {
  const info = mapConfidence(f.confidence);
  const dist = calcDistance(userLat, userLon, f.lat, f.lon).toFixed(1);
  const id = String(f._idx + 1).padStart(4, '0');
  const pinColor = f.confidence === 'high' ? '#F97316' : '#aaa';
  return `
    <div class="foco-card" data-idx="${f._idx}" data-key="${info.key}">
      <div class="foco-card-header">
        <span class="foco-id">F-${id}</span>
        <span class="foco-badge ${info.cssClass}">${info.label}</span>
      </div>
      <div class="foco-card-location">${f.city}</div>
      <div class="foco-card-dist">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="${pinColor}"><path d="M12 2C8 2 4 5.5 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.5-4-8-8-8z"/></svg>
        ${dist}km · FRP ${f.frp}MW
      </div>
    </div>`;
}

function renderCards(fires, userLat, userLon) {
  const list = document.getElementById('focos-list');
  if (!list) return;

  const subset = fires.slice(0, MAX_CARDS);
  if (subset.length === 0) {
    list.innerHTML = '<div class="foco-card" style="color:#999;font-size:13px;padding:16px;">Nenhum foco encontrado.</div>';
    return;
  }
  list.innerHTML = subset.map(f => buildCardHTML(f, userLat, userLon)).join('');

  list.querySelectorAll('.foco-card').forEach(card => {
    card.addEventListener('click', () => {
      list.querySelectorAll('.foco-card').forEach(c => c.classList.remove('foco-card--selected'));
      card.classList.add('foco-card--selected');
      const idx = parseInt(card.dataset.idx);
      const m = markerByIdx[idx];
      if (m && map) {
        map.setView(m.getLatLng(), 11);
        m.openPopup();
      }
    });
  });
}

function updateCounts(fires) {
  const counts = { critico: 0, alto: 0, medio: 0 };
  fires.forEach(f => { counts[mapConfidence(f.confidence).key]++; });
  const el = id => document.getElementById(id);
  if (el('count-critico')) el('count-critico').textContent = counts.critico;
  if (el('count-alto'))    el('count-alto').textContent    = counts.alto;
  if (el('count-medio'))   el('count-medio').textContent   = counts.medio;
}

// Zoom do mapa proporcional ao raio escolhido (modo propriedade).
function radiusZoom(radius) {
  if (radius <= 10)  return 10;
  if (radius <= 20)  return 9;
  return 8;
}

// Focos no escopo atual (modo + raio), antes de severidade/busca.
function getBaseFires() {
  if (state.mode === 'propriedade') {
    return allFires.filter(f =>
      calcDistance(state.userLat, state.userLon, f.lat, f.lon) <= state.radius);
  }
  return allFires;
}

// Aplica severidade e busca sobre o escopo base.
function getVisibleFires(base) {
  let fires = base;
  if (state.severity) fires = fires.filter(f => mapConfidence(f.confidence).key === state.severity);
  if (state.search)   fires = fires.filter(f => f.citySearch.includes(state.search));
  return fires;
}

// Recalcula tudo (cards, markers e contadores) a partir do estado atual.
function refresh() {
  const base = getBaseFires();
  updateCounts(base);

  const visible = getVisibleFires(base);
  renderCards(visible, state.userLat, state.userLon);
  renderMarkers(visible, state.userLat, state.userLon);

  const countEl = document.getElementById('focos-count');
  if (countEl) countEl.textContent = `${visible.length} focos encontrados`;
}

function initFilters() {
  document.querySelectorAll('.severity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      if (state.severity === key) {
        state.severity = null;
        btn.classList.remove('active');
      } else {
        state.severity = key;
        document.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      refresh();
    });
  });
}

function initModes() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (map) {
        const zoom = state.mode === 'propriedade' ? radiusZoom(state.radius) : 5;
        map.setView([state.userLat, state.userLon], zoom);
      }
      refresh();
    });
  });
}

function initRadius() {
  const sel = document.getElementById('radius-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    state.radius = Number(sel.value);
    if (state.mode === 'propriedade' && map) {
      map.setView([state.userLat, state.userLon], radiusZoom(state.radius));
    }
    refresh();
  });
}

function initSearch() {
  const input = document.getElementById('focos-search');
  if (!input) return;
  input.addEventListener('input', () => {
    state.search = input.value.toLowerCase().trim();
    refresh();
  });
}

async function init() {
  // Origem = fazenda do usuário logado (db.json), com fallback para o default.
  const farm = typeof getCurrentUserFarm === 'function' ? await getCurrentUserFarm() : null;
  const lat = farm ? farm.lat : DEFAULT_LAT;
  const lon = farm ? farm.lng : DEFAULT_LON;
  state.userLat = lat;
  state.userLon = lon;

  const farmNameEl = document.getElementById('focos-farm-name');
  if (farmNameEl) farmNameEl.textContent = farm ? farm.nome : 'Sem propriedade';

  initMap(lat, lon);

  try {
    const csv = await fetchFIRMS();
    const fires = parseCSV(csv).sort((a, b) => b.frp - a.frp);
    fires.forEach((f, i) => { f._idx = i; });
    allFires = fires;

    initFilters();
    initModes();
    initRadius();
    initSearch();
    refresh();
  } catch (e) {
    console.error('Erro ao carregar focos ativos:', e);
    const list = document.getElementById('focos-list');
    if (list) list.innerHTML = '<div class="foco-card" style="color:#ef4444;font-size:13px;padding:16px;">Erro ao carregar dados NASA FIRMS.</div>';
    const countEl = document.getElementById('focos-count');
    if (countEl) countEl.textContent = 'Erro ao carregar';
  }
}

document.addEventListener('DOMContentLoaded', init);
