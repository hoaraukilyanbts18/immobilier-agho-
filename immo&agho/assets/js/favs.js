/* =========================================================
   ARPENT — favoris
   NB : le site est un ensemble de pages statiques (pas de compte
   serveur ici), donc les favoris sont propagés d'une page à
   l'autre via le paramètre d'URL ?favs=1,4,9 plutôt qu'un
   stockage navigateur. Une vraie version connectée au back-end
   (voir /backend/php) stockerait ça en base, liée au compte.
   ========================================================= */
function getFavsFromURL(){
  const params = new URLSearchParams(location.search);
  const f = params.get('favs');
  return f ? new Set(f.split(',').filter(Boolean).map(Number)) : new Set();
}
let favorites = getFavsFromURL();

// Construit une URL vers `base` en conservant les favoris (+ params additionnels)
function favLink(base, extra = {}){
  const params = new URLSearchParams();
  if (favorites.size) params.set('favs', [...favorites].join(','));
  Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  const qs = params.toString();
  return base + (qs ? '?' + qs : '');
}

// Met à jour l'URL courante (sans recharger la page) pour refléter les favoris actuels
function syncURL(extra = {}){
  const params = new URLSearchParams(location.search);
  if (favorites.size) params.set('favs', [...favorites].join(',')); else params.delete('favs');
  Object.entries(extra).forEach(([k, v]) => {
    if (v === null) params.delete(k); else params.set(k, v);
  });
  const qs = params.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
}

// Ajoute/retire un favori et met à jour l'UI de la page courante
function toggleFav(id){
  if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
  syncURL();
  document.querySelectorAll('[data-fav-count]').forEach(el => el.textContent = favorites.size);
  document.querySelectorAll('.fav-btn[data-id="' + id + '"]').forEach(b => b.classList.toggle('active', favorites.has(id)));
  decorateNavLinks();
  if (typeof onFavToggle === 'function') onFavToggle(id);
  showToast(favorites.has(id) ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
}

// Réécrit tous les liens de nav marqués data-base pour qu'ils transportent les favoris courants
function decorateNavLinks(){
  document.querySelectorAll('a[data-base]').forEach(a => {
    a.href = favLink(a.getAttribute('data-base'));
  });
  document.querySelectorAll('[data-fav-count]').forEach(el => el.textContent = favorites.size);
}
