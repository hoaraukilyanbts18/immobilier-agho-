/* =========================================================
   ARPENT — page Favoris (favoris.html)
   Dépend de : data.js, favs.js, common.js
   ========================================================= */
function onFavToggle(){ renderFavorites(); }

function renderFavorites(){
  const list = DATA.filter(p => favorites.has(p.id));
  document.getElementById('favGrid').innerHTML = list.map(cardHTML).join('');
  document.getElementById('favEmpty').style.display = list.length ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadProperties();
  renderFavorites();
});
