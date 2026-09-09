/* =========================================================
   ARPENT — comportements partagés (toutes les pages)
   Dépend de : data.js, favs.js
   ========================================================= */

/* ---- Carte de bien (grille annonces / accueil / favoris / similaires) ---- */
function statusBadge(p){
  if (p.status === 'vendue') return `<span class="tag-transaction" style="left:auto;right:14px;background:var(--clay);">Vendu</span>`;
  if (p.status === 'louee') return `<span class="tag-transaction" style="left:auto;right:14px;background:var(--clay);">Loué</span>`;
  if (p.status === 'en_attente') return `<span class="tag-transaction" style="left:auto;right:14px;background:var(--ink-soft);">En attente</span>`;
  return '';
}

function cardHTML(p){
  const isFav = favorites.has(p.id);
  return `
  <div class="card">
    <a class="imgwrap" href="${favLink('bien.html', {id:p.id})}">
      <img src="${p.images[0]}" alt="${p.t}" loading="lazy">
      <span class="corner"></span><span class="corner tr"></span>
      <span class="tag-transaction ${p.tx==='Location'?'location':''}">${p.tx}</span>
      ${statusBadge(p)}
      <button class="fav-btn ${isFav?'active':''}" data-id="${p.id}" onclick="event.preventDefault();toggleFav(${p.id})" aria-label="Ajouter aux favoris">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8.5C.7 8.8 2.6 5 6.3 5c2 0 3.4 1 4.7 2.6C12.3 6 13.7 5 15.7 5c3.7 0 5.6 3.8 3.8 7.5C19 16.65 12 21 12 21z"/></svg>
      </button>
    </a>
    <a class="body" href="${favLink('bien.html', {id:p.id})}">
      <div class="price">${fmtPrice(p.price)}${p.tx==='Location'?'<span> / mois</span>':''}</div>
      <h3>${p.t}</h3>
      <div class="loc">${p.city}</div>
      <div class="specs">
        <span class="s">📐 <b>${p.surface}</b> m²</span>
        <span class="s">🚪 <b>${p.pieces}</b> pièces</span>
        ${p.chambres ? `<span class="s">🛏 <b>${p.chambres}</b> ch.</span>`:''}
        ${p.sdb ? `<span class="s">🛁 <b>${p.sdb}</b> sdb</span>`:''}
      </div>
    </a>
  </div>`;
}

/* ---- Menu mobile ---- */
function toggleMobileNav(){ document.getElementById('mainNav').classList.toggle('open-mobile'); }

/* ---- Toast ---- */
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---- Modale connexion / inscription (la logique d'envoi est dans auth.js) ---- */
let authTab = 'login';
function openAuth(tab){ setAuthTab(tab); document.getElementById('authOverlay').classList.add('show'); }
function closeAuth(){ document.getElementById('authOverlay').classList.remove('show'); }
function setAuthTab(tab){
  authTab = tab;
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('nameField').style.display = tab==='register' ? 'block':'none';
  document.getElementById('authTitle').textContent = tab==='login' ? 'Bon retour' : 'Créer un compte';
  document.getElementById('authSub').textContent = tab==='login' ? 'Connectez-vous pour accéder à vos favoris et alertes.' : 'Rejoignez Arpent pour suivre vos annonces et vos visites.';
  document.getElementById('authSubmitBtn').textContent = tab==='login' ? 'Se connecter':'Créer mon compte';
}

/* ---- Initialisation commune à toutes les pages ---- */
document.addEventListener('DOMContentLoaded', () => {
  decorateNavLinks();
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.addEventListener('click', e => { if (e.target.id === 'authOverlay') closeAuth(); });
});
