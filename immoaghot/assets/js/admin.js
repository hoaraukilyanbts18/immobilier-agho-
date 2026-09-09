/* =========================================================
   ARPENT — Espace administration (admin.html)
   Dépend de : supabase-client.js, data.js, auth.js
   La protection réelle vient des règles RLS de Supabase
   (voir backend-supabase/schema.sql : is_admin()) — même si
   quelqu'un contournait l'écran de connexion ci-dessous, la
   base refuserait ses requêtes d'écriture s'il n'a pas le rôle
   admin dans la table "profiles".
   ========================================================= */

async function adminLogin(e){
  e.preventDefault();
  const email = document.getElementById('gate-email').value.trim();
  const pass = document.getElementById('gate-pass').value;
  document.getElementById('gate-error').style.display = 'none';

  try {
    await signIn(email, pass);
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== 'admin'){
      await signOut();
      document.getElementById('gate-error').textContent = "Ce compte n'a pas le rôle administrateur.";
      document.getElementById('gate-error').style.display = 'block';
      return;
    }
    document.getElementById('adminGate').style.display = 'none';
    document.getElementById('adminShell').style.display = 'grid';
    await setAdminTab('dashboard');
  } catch (err){
    document.getElementById('gate-error').textContent = 'Identifiants incorrects.';
    document.getElementById('gate-error').style.display = 'block';
  }
}

async function setAdminTab(tab){
  document.querySelectorAll('.admin-side .atab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
  if (tab === 'dashboard'){ await loadAllPropertiesAdmin(); await loadUsers(); renderDashboard(); }
  if (tab === 'annonces'){ await loadAllPropertiesAdmin(); renderAdminListings(); }
  if (tab === 'utilisateurs'){ await loadUsers(); renderAdminUsers(); }
  if (tab === 'categories'){ await loadCategories(); renderCategories(); }
}

/* ---------- Tableau de bord ---------- */
function renderDashboard(){
  document.getElementById('kpi-biens').textContent = DATA.length;
  document.getElementById('kpi-attente').textContent = DATA.filter(p => p.status === 'en_attente').length;
  document.getElementById('kpi-users').textContent = USERS.length;
  document.getElementById('kpi-vues').textContent = DATA.reduce((s,p) => s + p.views, 0).toLocaleString('fr-FR');

  const recent = [...DATA].sort((a,b) => b.date - a.date).slice(0,5);
  document.getElementById('recentTable').innerHTML = recent.map(p => `
    <tr>
      <td>${p.t}</td>
      <td>${p.city}</td>
      <td>${fmtPrice(p.price)}</td>
      <td><span class="badge ${p.status}">${STATUS_LABELS[p.status]}</span></td>
      <td>${p.date.toLocaleDateString('fr-FR')}</td>
    </tr>`).join('');
}

/* ---------- Annonces (validation) ---------- */
let annoncesFilter = '';
function renderAdminListings(){
  const q = annoncesFilter.toLowerCase();
  const rows = DATA.filter(p => !q || p.t.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
  document.getElementById('adminListingsTable').innerHTML = rows.map(p => `
    <tr>
      <td>${p.t}</td>
      <td>${p.type}</td>
      <td>${p.city}</td>
      <td>${fmtPrice(p.price)}</td>
      <td><span class="badge ${p.status}">${STATUS_LABELS[p.status]}</span></td>
      <td>
        <div class="row-actions">
          ${p.status !== 'validee' ? `<button class="ok" onclick="setStatusAndRefresh(${p.id},'validee')">Valider</button>` : ''}
          ${p.status !== 'refusee' ? `<button class="danger" onclick="setStatusAndRefresh(${p.id},'refusee')">Refuser</button>` : ''}
          <button onclick="event.preventDefault();window.open('bien.html?id=${p.id}','_blank')">Voir</button>
          <button class="danger" onclick="deletePropertyAndRefresh(${p.id})">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}
function filterAdminListings(val){ annoncesFilter = val; renderAdminListings(); }

async function setStatusAndRefresh(id, status){
  try {
    await setPropertyStatus(id, status);
    await loadAllPropertiesAdmin();
    renderAdminListings(); renderDashboard();
    showAdminToast(`Annonce → ${STATUS_LABELS[status]}`);
  } catch (err){ showAdminToast(err.message || 'Erreur : action refusée (droits admin ?)'); }
}
async function deletePropertyAndRefresh(id){
  if (!confirm('Supprimer définitivement cette annonce ?')) return;
  try {
    await deletePropertyRemote(id);
    await loadAllPropertiesAdmin();
    renderAdminListings(); renderDashboard();
    showAdminToast('Annonce supprimée');
  } catch (err){ showAdminToast(err.message || 'Erreur lors de la suppression'); }
}

/* ---------- Utilisateurs ---------- */
let usersFilter = '';
function renderAdminUsers(){
  const q = usersFilter.toLowerCase();
  const rows = USERS.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  document.getElementById('adminUsersTable').innerHTML = rows.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge role-${u.role}">${u.role}</span></td>
      <td><span class="badge ${u.status}">${u.status}</span></td>
      <td>${u.date.toLocaleDateString('fr-FR')}</td>
      <td>
        <div class="row-actions">
          ${u.status === 'actif' ? `<button class="danger" onclick="toggleUserAndRefresh('${u.id}', false)">Suspendre</button>` : `<button class="ok" onclick="toggleUserAndRefresh('${u.id}', true)">Réactiver</button>`}
          <button class="danger" onclick="deleteUserAndRefresh('${u.id}')">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}
function filterAdminUsers(val){ usersFilter = val; renderAdminUsers(); }

async function toggleUserAndRefresh(id, active){
  try { await toggleUserActiveRemote(id, active); await loadUsers(); renderAdminUsers(); showAdminToast('Statut mis à jour'); }
  catch (err){ showAdminToast(err.message || 'Erreur'); }
}
async function deleteUserAndRefresh(id){
  if (!confirm('Supprimer cet utilisateur ?')) return;
  try { await deleteUserRemote(id); await loadUsers(); renderAdminUsers(); showAdminToast('Utilisateur supprimé'); }
  catch (err){ showAdminToast(err.message || 'Erreur'); }
}
// NB : la création d'utilisateur se fait normalement via l'inscription publique
// (bouton "Connexion" > "Inscription"), pas depuis l'admin — Supabase Auth ne
// permet pas de créer un utilisateur "auth" complet depuis le client sans
// clé service_role (qui ne doit jamais être exposée côté front).

/* ---------- Catégories ---------- */
function renderCategories(){
  document.getElementById('categoriesList').innerHTML = TYPES.map(t => `
    <div class="cat-pill">${t} <button onclick="removeCategoryAndRefresh('${t}')" aria-label="Supprimer">×</button></div>
  `).join('');
}
async function addCategoryAndRefresh(e){
  e.preventDefault();
  const input = document.getElementById('newCategory');
  const val = input.value.trim();
  if (!val || TYPES.includes(val)) return;
  try { await addCategoryRemote(val); await loadCategories(); input.value = ''; renderCategories(); showAdminToast(`Catégorie « ${val} » ajoutée`); }
  catch (err){ showAdminToast(err.message || 'Erreur'); }
}
async function removeCategoryAndRefresh(name){
  try { await removeCategoryRemote(name); await loadCategories(); renderCategories(); showAdminToast(`Catégorie « ${name} » supprimée`); }
  catch (err){ showAdminToast(err.message || 'Erreur'); }
}

/* ---------- Toast admin ---------- */
let adminToastTimer = null;
function showAdminToast(msg){
  const t = document.getElementById('adminToast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(adminToastTimer);
  adminToastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
