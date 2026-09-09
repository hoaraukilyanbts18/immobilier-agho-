/* =========================================================
   ARPENT — page Accueil (index.html)
   Dépend de : data.js, favs.js, common.js
   ========================================================= */
let homeMapInstance = null;

async function renderHome(){
  await loadProperties();
  document.getElementById('stat-biens').textContent = DATA.length * 47;
  const featured = DATA.filter(p => p.featured);
  document.getElementById('featuredGrid').innerHTML = featured.map(cardHTML).join('');
  renderHomeMap();
}

function renderHomeMap(){
  if (homeMapInstance) return;
  homeMapInstance = L.map('homeMap', {scrollWheelZoom:false}).setView([-21.115,55.536], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; OpenStreetMap contributors'}).addTo(homeMapInstance);
  DATA.forEach(p => {
    L.marker([p.lat, p.lng]).addTo(homeMapInstance)
      .bindPopup(`<b>${p.t}</b><br>${p.city} — ${fmtPrice(p.price)}`);
  });
}

function runHomeSearch(){
  const city = document.getElementById('hs-city').value.trim();
  const type = document.getElementById('hs-type').value;
  const tx = document.getElementById('hs-transaction').value;
  const budget = document.getElementById('hs-budget').value;

  const matchedCity = city ? (Object.keys(CITIES).find(c => c.toLowerCase().includes(city.toLowerCase())) || '') : '';

  const extra = {};
  if (matchedCity) extra.city = matchedCity;
  if (type) extra.type = type;
  if (tx) extra.tx = tx;
  if (budget) extra.maxPrice = budget;

  window.location.href = favLink('annonces.html', extra);
}

document.addEventListener('DOMContentLoaded', renderHome);
