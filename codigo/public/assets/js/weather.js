const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '🌥️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌦️', 82: '🌦️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function wmoIcon(code) {
  return WMO_ICONS[code] ?? '🌡️';
}

function formatDayLabel(dateStr, index) {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  const d = new Date(dateStr + 'T12:00:00');
  return DIAS_PT[d.getDay()];
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code`
    + `&forecast_days=3&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar dados meteorológicos');
  return res.json();
}

function applyWeather(data) {
  const cur = data.current;
  const daily = data.daily;

  setText('wx-temp', `${Math.round(cur.temperature_2m)}°C`);
  setText('wx-humidity', `${cur.relative_humidity_2m}%`);
  setText('wx-wind', `${Math.round(cur.wind_speed_10m)} km/h`);
  setText('wx-icon', wmoIcon(cur.weather_code));

  const now = new Date();
  const hhmm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  setText('wx-updated', `Atualizado ${hhmm}`);

  for (let i = 0; i < 3; i++) {
    const icon = wmoIcon(daily.weather_code[i]);
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    const rain = daily.precipitation_probability_max[i];
    const label = formatDayLabel(daily.time[i], i);

    setText(`wx-day${i}-label`, label);
    setText(`wx-day${i}-info`, `${icon} ${max}°/${min}° · Chuva ${rain}%`);
  }
}

function showError(msg) {
  const el = document.getElementById('wx-status');
  if (el) {
    el.textContent = msg;
    el.style.color = '#f97316';
  }
}

function initWeather() {
  if (!navigator.geolocation) {
    showError('Geolocalização não suportada neste navegador.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
        applyWeather(data);
      } catch (e) {
        showError('Não foi possível carregar os dados.');
      }
    },
    () => {
      showError('Permissão de localização negada.');
    },
    { timeout: 10000 }
  );
}

document.addEventListener('DOMContentLoaded', initWeather);
