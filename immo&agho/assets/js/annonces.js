/* =========================================================
   ARPENT — page Annonces (annonces.html)
   Dépend de : data.js, favs.js, common.js
   L'état des filtres est reflété dans l'URL (?city=&type=&tx=
   &minPrice=&maxPrice=&minSurface=&minChambres=&sort=&view=&page=)
   afin qu'un lien partagé reproduise exactement la même recherche.
   Seules les annonces au statut "validee/vendue/louee" sont visibles
   (une annonce doit être validée par un administrateur, cf. admin.html).
   ========================================================= */
let viewMode = 'grid';
let currentPage = 1;
const PAGE_SIZE = 6;

function readStateFromURL(){
  const params = new URLSearchParams(location.search);
  document.getElementById('f-city').value = params.get('city') || '';
  setChip('f-transaction', params.get('tx') || '');
  setChip('f-type', params.get('type') || '');
  setChip('f-surface', params.get('minSurface') || '0');
  setChip('f-chambres', params.get('minChambres') || '0');
  document.getElementById('f-price-min').value = params.get('minPrice') || '';
  document.getElementById('f-price-max').value = params.get('maxPrice') || '';
  const sliderMax = params.get('maxPrice') || 1500000;
  document.getElementById('f-price').value = sliderMax;
  document.getElementById('priceOut').textContent = Number(sliderMax).toLocaleString('fr-FR') + ' €';
  document.getElementById('sortSelect').value = params.get('sort') || 'recent';
  viewMode = params.get('view') || 'grid';
  currentPage = Number(params.get('page')) || 1;
  document.getElementById('gridBtn').classList.toggle('active', viewMode === 'grid');
  document.getElementById('listBtn').classList.toggle('active', viewMode === 'list');
}

function setChip(groupId, val){
  document.querySelectorAll('#' + groupId + ' .chip').forEach(c => c.classList.toggle('active', c.dataset.val === val));
}

function getFilters(){
  return {
    transaction: document.querySelector('#f-transaction .chip.active').dataset.val,
    type: document.querySelector('#f-type .chip.active').dataset.val,
    city: document.getElementById('f-city').value,
    minPrice: Number(document.getElementById('f-price-min').value) || 0,
    maxPrice: Number(document.getElementById('f-price-max').value) || Number(document.getElementById('f-price').value),
    minSurface: Number(document.querySelector('#f-surface .chip.active').dataset.val),
    minChambres: Number(document.querySelector('#f-chambres .chip.active').dataset.val),
  };
}

function applyFilters(list){
  const f = getFilters();
  return list.filter(p =>
    (!f.transaction || p.tx === f.transaction) &&
    (!f.type || p.type === f.type) &&
    (!f.city || p.city === f.city) &&
    (p.price >= f.minPrice) &&
    (p.price <= f.maxPrice) &&
    (p.surface >= f.minSurface) &&
    (p.chambres >= f.minChambres)
  );
}

function sortList(list){
  const s = document.getElementById('sortSelect').value;
  const arr = [...list];
  if (s === 'priceAsc') arr.sort((a,b) => a.price - b.price);
  else if (s === 'priceDesc') arr.sort((a,b) => b.price - a.price);
  else if (s === 'surface') arr.sort((a,b) => b.surface - a.surface);
  else arr.sort((a,b) => b.date - a.date);
  return arr;
}

function pushStateToURL(){
  const f = getFilters();
  syncURL({
    city: f.city || null,
    type: f.type || null,
    tx: f.transaction || null,
    minPrice: f.minPrice || null,
    maxPrice: f.maxPrice !== 1500000 ? f.maxPrice : null,
    minSurface: f.minSurface || null,
    minChambres: f.minChambres || null,
    sort: document.getElementById('sortSelect').value !== 'recent' ? document.getElementById('sortSelect').value : null,
    view: viewMode !== 'grid' ? viewMode : null,
    page: currentPage > 1 ? currentPage : null,
  });
}

function renderListings(){
  pushStateToURL();
  let list = sortList(applyFilters(visibleProperties()));
  document.getElementById('resultCount').textContent = list.length;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = 1;
  const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  document.querySelector('.empty-state')?.remove();
  const grid = document.getElementById('listingsGrid');
  grid.className = 'grid-cards' + (viewMode === 'list' ? ' list-mode' : '');

  if (list.length === 0){
    grid.innerHTML = '';
    grid.insertAdjacentHTML('afterend', `<div class="empty-state"><h3>Aucun bien ne correspond</h3><p>Essayez d'élargir vos critères de recherche.</p></div>`);
  } else {
    grid.innerHTML = pageItems.map(cardHTML).join('');
  }
  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const el = document.getElementById('pagination');
  let html = '';
  for (let i = 1; i <= totalPages; i++){
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  el.innerHTML = totalPages > 1 ? html : '';
}
function goToPage(i){ currentPage = i; renderListings(); window.scrollTo({top:0, behavior:'smooth'}); }

function setViewMode(m){
  viewMode = m;
  document.getElementById('gridBtn').classList.toggle('active', m === 'grid');
  document.getElementById('listBtn').classList.toggle('active', m === 'list');
  renderListings();
}

function resetFilters(){
  setChip('f-transaction', ''); setChip('f-type', ''); setChip('f-surface', '0'); setChip('f-chambres', '0');
  document.getElementById('f-city').value = '';
  document.getElementById('f-price-min').value = '';
  document.getElementById('f-price-max').value = '';
  document.getElementById('f-price').value = 1500000;
  document.getElementById('priceOut').textContent = '1 500 000 €';
  document.getElementById('sortSelect').value = 'recent';
  currentPage = 1;
  renderListings();
}

function populateCityFilter(){
  const sel = document.getElementById('f-city');
  Object.keys(CITIES).forEach(c => {
    const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o);
  });
}

function onFavToggle(){ renderListings(); }

document.addEventListener('DOMContentLoaded', () => {
  populateCityFilter();
  readStateFromURL();
  renderListings();

  document.addEventListener('click', e => {
    if (e.target.closest('#f-transaction .chip') || e.target.closest('#f-type .chip') || e.target.closest('#f-surface .chip') || e.target.closest('#f-chambres .chip')) {
      const chip = e.target.closest('.chip');
      chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPage = 1;
      renderListings();
    }
  });
  document.getElementById('f-city').addEventListener('change', () => { currentPage = 1; renderListings(); });
  document.getElementById('f-price-min').addEventListener('input', () => { currentPage = 1; renderListings(); });
  document.getElementById('f-price-max').addEventListener('input', () => { currentPage = 1; renderListings(); });
  document.getElementById('f-price').addEventListener('input', (e) => {
    document.getElementById('priceOut').textContent = Number(e.target.value).toLocaleString('fr-FR') + ' €';
    document.getElementById('f-price-max').value = '';
    currentPage = 1; renderListings();
  });
});
