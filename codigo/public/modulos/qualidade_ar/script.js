const DEFAULT_LAT = -19.9167;
const DEFAULT_LON = -43.9345;

const IQA_LEVELS = [
  { max: 20,  label: 'Bom',              cssClass: 'good',     color: '#22c55e' },
  { max: 40,  label: 'Razoável',         cssClass: 'good',     color: '#84cc16' },
  { max: 60,  label: 'Moderado',         cssClass: 'moderate', color: '#f59e0b' },
  { max: 80,  label: 'Ruim',             cssClass: 'elevated', color: '#f97316' },
  { max: 100, label: 'Muito Ruim',       cssClass: 'elevated', color: '#ef4444' },
  { max: Infinity, label: 'Perigoso',   cssClass: 'elevated', color: '#7c3aed' },
];

const RECOMMENDATIONS = {
  'Bom':        ['Qualidade do ar satisfatória', 'Atividades ao ar livre liberadas', 'Sem restrições para grupos sensíveis'],
  'Razoável':   ['Qualidade aceitável para a maioria', 'Grupos muito sensíveis devem limitar esforço prolongado ao ar livre', 'Monitore sintomas respiratórios'],
  'Moderado':   ['Evitar atividade física intensa ao ar livre', 'Grupos sensíveis devem reduzir exposição', 'Mantenha ambientes ventilados com filtros'],
  'Ruim':       ['Evitar atividade física ao ar livre', 'Manter janelas fechadas', 'Grupos sensíveis usar máscara'],
  'Muito Ruim': ['Evitar qualquer atividade ao ar livre', 'Usar máscara N95 se sair', 'Crianças e idosos devem ficar em casa'],
  'Perigoso':   ['Emergência de saúde pública', 'Toda a população deve evitar sair', 'Procure atendimento médico se sentir sintomas'],
};

let map = null;
let marker = null;
let currentData = null;

function classifyIQA(value) {
  return IQA_LEVELS.find(l => value <= l.max) || IQA_LEVELS.at(-1);
}

function classifyPM25(value) {
  if (value <= 12)  return { label: 'Bom',      cssClass: 'good' };
  if (value <= 35)  return { label: 'Moderado', cssClass: 'moderate' };
  if (value <= 55)  return { label: 'Elevado',  cssClass: 'elevated' };
  return               { label: 'Perigoso', cssClass: 'elevated' };
}

function classifyPM10(value) {
  if (value <= 54)  return { label: 'Bom',      cssClass: 'good' };
  if (value <= 154) return { label: 'Moderado', cssClass: 'moderate' };
  return               { label: 'Elevado',  cssClass: 'elevated' };
}

function classifyCO(value) {
  const ppm = value / 1000;
  if (ppm <= 4.4)  return { label: 'Normal',   cssClass: 'good' };
  if (ppm <= 9.4)  return { label: 'Moderado', cssClass: 'moderate' };
  return              { label: 'Elevado',  cssClass: 'elevated' };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setBadge(id, label, cssClass) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = label;
  el.className = `metric-badge ${cssClass}`;
}

async function fetchAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=pm10,pm2_5,carbon_monoxide,european_aqi`
    + `&hourly=european_aqi&past_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar dados de qualidade do ar');
  return res.json();
}

function renderChart(data) {
  const times = data.hourly.time;
  const values = data.hourly.european_aqi;

  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const labels = [];
  const points = [];

  times.forEach((t, i) => {
    const d = new Date(t);
    if (d >= cutoff && d <= now && values[i] !== null) {
      labels.push(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      points.push(values[i]);
    }
  });

  const canvas = document.getElementById('aq-chart');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: points,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.12)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => `IQA: ${ctx.parsed.y}` }
      }},
      scales: {
        x: { ticks: { maxTicksLimit: 6, font: { size: 10 }, color: '#999' }, grid: { display: false } },
        y: { ticks: { font: { size: 10 }, color: '#999' }, grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
      },
    },
  });
}

function applyAirQuality(data) {
  const c = data.current;
  const iqa   = Math.round(c.european_aqi);
  const pm25  = Math.round(c.pm2_5);
  const pm10  = Math.round(c.pm10);
  const co    = c.carbon_monoxide;

  const iqaInfo  = classifyIQA(iqa);
  const pm25Info = classifyPM25(pm25);
  const pm10Info = classifyPM10(pm10);
  const coInfo   = classifyCO(co);

  setText('aq-iqa-value',  iqa);
  setBadge('aq-iqa-badge', iqaInfo.label, iqaInfo.cssClass);

  setText('aq-pm25-value',  `${pm25}μg`);
  setBadge('aq-pm25-badge', pm25Info.label, pm25Info.cssClass);

  setText('aq-pm10-value',  `${pm10}μg`);
  setBadge('aq-pm10-badge', pm10Info.label, pm10Info.cssClass);

  const coPpm = (co / 1000).toFixed(2);
  setText('aq-co-value',  `${coPpm}ppm`);
  setBadge('aq-co-badge', coInfo.label, coInfo.cssClass);

  setText('aq-gauge-value', iqa);
  setText('aq-gauge-label', iqaInfo.label);
  document.getElementById('aq-gauge').style.borderColor = iqaInfo.color;

  const recs = RECOMMENDATIONS[iqaInfo.label] || [];
  const ul = document.getElementById('aq-recommendations');
  if (ul) {
    ul.innerHTML = recs.map(r => `<li>${r}</li>`).join('');
  }

  currentData = { iqa, pm25, pm10, coPpm, iqaColor: iqaInfo.color };
}

function initMap(lat, lon) {
  map = L.map('aq-map').setView([lat, lon], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  updateMarker(lat, lon);
}

function updateMarker(lat, lon) {
  if (!currentData) return;

  const color = currentData.iqaColor;
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width:48px; height:48px; border-radius:50%;
      background:${color}; opacity:0.85;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex; align-items:center; justify-content:center;
      color:#fff; font-weight:700; font-size:13px; font-family:DM Sans,sans-serif;
    ">${currentData.iqa}</div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  if (marker) marker.remove();
  marker = L.marker([lat, lon], { icon })
    .addTo(map)
    .bindPopup(`
      <b>Qualidade do Ar</b><br>
      IQA: ${currentData.iqa}<br>
      PM2.5: ${currentData.pm25}μg<br>
      PM10: ${currentData.pm10}μg<br>
      CO: ${currentData.coPpm}ppm
    `);
}

function handleTabs(lat, lon) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (map) map.invalidateSize();
    });
  });
}

async function init() {
  // Usa a localização da fazenda do usuário logado (db.json) em vez da geolocalização.
  const farm = typeof getCurrentUserFarm === 'function' ? await getCurrentUserFarm() : null;
  const lat = farm ? farm.lat : DEFAULT_LAT;
  const lon = farm ? farm.lng : DEFAULT_LON;

  const farmNameEl = document.getElementById('aq-farm-name');
  if (farmNameEl) farmNameEl.textContent = farm ? farm.nome : 'Sem propriedade';

  try {
    const data = await fetchAirQuality(lat, lon);
    applyAirQuality(data);
    initMap(lat, lon);
    updateMarker(lat, lon);
    handleTabs(lat, lon);
    try { renderChart(data); } catch (e) { console.error('Gráfico não renderizado:', e); }
  } catch (e) {
    console.error('Erro ao carregar qualidade do ar:', e);
    setText('aq-iqa-value', 'Erro');
    setText('aq-gauge-label', 'Sem dados');
  }
}

document.addEventListener('DOMContentLoaded', init);
