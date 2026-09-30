/* =========================================================
   ARPENT — Dépôt d'une annonce (deposer.html)
   Dépend de : data.js, favs.js, common.js
   NB : la nouvelle annonce est ajoutée à DATA en mémoire (donc
   perdue au rechargement). En production, ce formulaire doit
   poster vers /backend/php/api/properties.php (méthode POST),
   qui insère en base avec le statut "en_attente" (voir Property::create).
   ========================================================= */

function populateDeposerCities(){
  const sel = document.getElementById('dp-city');
  Object.keys(CITIES).forEach(c => {
    const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o);
  });
}
function populateDeposerTypes(){
  const sel = document.getElementById('dp-type');
  TYPES.forEach(t => {
    const o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o);
  });
}

function submitDeposer(e){
  e.preventDefault();
  const f = e.target;
  const title = f.title.value.trim();
  const city = f.city.value;
  const [lat0, lng0] = CITIES[city];

  const newProp = {
    id: Math.max(0, ...DATA.map(p => p.id)) + 1,
    t: title,
    type: f.type.value,
    tx: f.tx.value,
    city: city,
    price: Number(f.price.value),
    surface: Number(f.surface.value),
    pieces: Number(f.pieces.value) || 0,
    chambres: Number(f.chambres.value) || 0,
    sdb: Number(f.sdb.value) || 0,
    etage: f.etage.value || '—',
    dpe: f.dpe.value || '—',
    desc: f.description.value.trim(),
    views: 0,
    status: 'en_attente', // toute nouvelle annonce doit être validée par un administrateur
    lat: lat0, lng: lng0,
    agent: 'Vous (propriétaire)',
    date: new Date(),
    featured: false,
    images: ['https://picsum.photos/seed/new' + Date.now() + 'a/900/650', 'https://picsum.photos/seed/new' + Date.now() + 'b/900/650'],
  };

  DATA.push(newProp);

  document.getElementById('deposerForm').style.display = 'none';
  document.getElementById('deposerConfirm').style.display = 'block';
  document.getElementById('confirmTitle').textContent = title;
}

document.addEventListener('DOMContentLoaded', () => {
  populateDeposerCities();
  populateDeposerTypes();
});
