/* =========================================================
   ARPENT — Dépôt d'une annonce (deposer.html)
   Dépend de : data.js, favs.js, common.js
   NB : la nouvelle annonce est envoyée directement à Supabase via
   createProperty() (voir data.js), qui l'insère avec le statut
   "en_attente" — la policy RLS "properties_insert_owner" garantit
   que owner_id correspond bien à l'utilisateur connecté.
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

async function submitDeposer(e){
  e.preventDefault();
  const f = e.target;

  const user = await getCurrentUser();
  if (!user){
    showToast('Connectez-vous d’abord pour déposer une annonce.');
    openAuth('login');
    return;
  }

  try {
    const created = await createProperty({
      title: f.title.value.trim(),
      type: f.type.value,
      tx: f.tx.value,
      city: f.city.value,
      price: Number(f.price.value),
      surface: Number(f.surface.value),
      pieces: Number(f.pieces.value) || 0,
      chambres: Number(f.chambres.value) || 0,
      sdb: Number(f.sdb.value) || 0,
      etage: f.etage.value,
      dpe: f.dpe.value,
      description: f.description.value.trim(),
    });

    document.getElementById('deposerForm').style.display = 'none';
    document.getElementById('deposerConfirm').style.display = 'block';
    document.getElementById('confirmTitle').textContent = created.title;
  } catch (err){
    showToast(err.message || "Erreur lors de l'envoi de l'annonce.");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  populateDeposerCities();
  populateDeposerTypes();
});
