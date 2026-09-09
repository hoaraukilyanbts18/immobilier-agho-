/* =========================================================
   ARPENT — page Fiche détaillée d'un bien (bien.html?id=)
   Dépend de : data.js, favs.js, common.js
   ========================================================= */
let currentDetailId = null;
let galleryIndex = 0;
let detailMapInstance = null;

function getIdFromURL(){
  const params = new URLSearchParams(location.search);
  return Number(params.get('id')) || null;
}

function onFavToggle(id){
  if (id === currentDetailId) updateDetailFavBtn();
}
function updateDetailFavBtn(){
  document.getElementById('d-favbtn').classList.toggle('active', favorites.has(currentDetailId));
}
function toggleFavFromDetail(){ toggleFav(currentDetailId); }

function renderGallery(p){
  document.getElementById('galleryMain').src = p.images[galleryIndex];
  document.getElementById('galleryCount').textContent = `${galleryIndex + 1} / ${p.images.length}`;
  document.getElementById('thumbs').innerHTML = p.images.map((src, i) =>
    `<img src="${src}" class="${i === galleryIndex ? 'active' : ''}" onclick="setGalleryIndex(${i})">`
  ).join('');
}
function setGalleryIndex(i){ galleryIndex = i; renderGallery(DATA.find(x => x.id === currentDetailId)); }
function galleryStep(dir){
  const p = DATA.find(x => x.id === currentDetailId);
  galleryIndex = (galleryIndex + dir + p.images.length) % p.images.length;
  renderGallery(p);
}

async function openDetail(id){
  const p = await fetchPropertyById(id);
  if (!p){
    document.querySelector('main').innerHTML = `<div class="wrap block"><div class="empty-state"><h3>Bien introuvable</h3><p>Cette annonce n'existe plus ou a été retirée.</p><a class="btn btn-primary" href="${favLink('annonces.html')}" style="margin-top:16px;display:inline-flex;">Retour aux annonces</a></div></div>`;
    return;
  }
  currentDetailId = id; galleryIndex = 0;

  document.title = p.t + ' — Arpent';
  document.getElementById('bc-title').textContent = p.t;
  document.getElementById('bc-annonces').href = favLink('annonces.html');
  document.getElementById('bc-home').href = favLink('index.html');
  document.getElementById('d-title').textContent = p.t;
  document.getElementById('d-loc').textContent = `${p.city} · Publié le ${p.date.toLocaleDateString('fr-FR')}`;
  document.getElementById('d-views').textContent = `👁 ${p.views.toLocaleString('fr-FR')} vues`;
  document.getElementById('d-desc').textContent = p.desc;
  document.getElementById('sb-price').innerHTML = `${fmtPrice(p.price)}${p.tx === 'Location' ? '<span> / mois, charges comprises</span>' : ''}`;
  document.getElementById('sb-fees').textContent = p.tx === 'Vente' ? 'Honoraires d’agence inclus (4%)' : 'Dépôt de garantie : 1 mois';
  document.getElementById('sb-avail').textContent = 'Disponible immédiatement';
  document.getElementById('agent-initial').textContent = p.agent.split(' ').map(w => w[0]).join('');
  document.getElementById('agent-name').textContent = p.agent;
  document.getElementById('agent-contact').textContent = `${p.agent.toLowerCase().replace(/[^a-z]/g,'').slice(0,12)}@arpent.re · 0692 ${String(p.id).padStart(2,'0')} ${String((p.id*37)%100).padStart(2,'0')} ${String((p.id*13)%100).padStart(2,'0')}`;
  document.getElementById('d-favbtn').dataset.id = p.id;
  updateDetailFavBtn();

  document.getElementById('dataPlate').innerHTML = `
    <div class="cell"><div class="k">Surface</div><div class="v">${p.surface} m²</div></div>
    <div class="cell"><div class="k">Pièces</div><div class="v">${p.pieces || '—'}</div></div>
    <div class="cell"><div class="k">Chambres</div><div class="v">${p.chambres || '—'}</div></div>
    <div class="cell"><div class="k">Salle(s) de bain</div><div class="v">${p.sdb || '—'}</div></div>
    <div class="cell"><div class="k">Étage</div><div class="v">${p.etage}</div></div>
    <div class="cell"><div class="k">DPE</div><div class="v">${p.dpe}</div></div>
    <div class="cell"><div class="k">Type</div><div class="v">${p.type}</div></div>
    <div class="cell"><div class="k">Transaction</div><div class="v">${p.tx}</div></div>
  `;
  renderGallery(p);

  const similar = await fetchSimilar(p);
  document.getElementById('similarGrid').innerHTML = similar.map(cardHTML).join('');

  requestAnimationFrame(() => {
    if (detailMapInstance){ detailMapInstance.remove(); detailMapInstance = null; }
    detailMapInstance = L.map('detailMap', {scrollWheelZoom:false}).setView([p.lat, p.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; OpenStreetMap contributors'}).addTo(detailMapInstance);
    L.marker([p.lat, p.lng]).addTo(detailMapInstance);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const id = getIdFromURL();
  openDetail(id);
});
