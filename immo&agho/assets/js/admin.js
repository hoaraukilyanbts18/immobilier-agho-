/* =========================================================
   ARPENT — Espace administration (admin.html)
   Dépend de : data.js
   NB : ceci est une démonstration front-end uniquement. En
   production, chaque action (valider, refuser, supprimer...)
   doit appeler l'API PHP (voir /backend/php/api/) qui vérifie
   que l'utilisateur connecté a bien le rôle "admin" avant
   d'écrire en base.
   ========================================================= */

/* ---------- Connexion (DÉMONSTRATION UNIQUEMENT — voir avertissement en bas de fichier) ---------- */
function adminLogin(e){
  e.preventDefault();
  const email = document.getElementById('gate-email').value.trim();
  const pass = document.getElementById('gate-pass').value;
  if (email === 'admin@arpent.re' && pass === 'admin2026'){
    document.getElementById('adminGate').style.display = 'none';
    document.getElementById('adminShell').style.display = 'grid';
    setAdminTab('dashboard');
  } else {
    document.getElementById('gate-error').style.display = 'block';
  }
}

function setAdminTab(tab){
  document.querySelectorAll('.admin-side .atab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'annonces') renderAdminListings();
  if (tab === 'utilisateurs') renderAdminUsers();
  if (tab === 'categories') renderCategories();
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
          ${p.status !== 'validee' ? `<button class="ok" onclick="setPropertyStatus(${p.id},'validee')">Valider</button>` : ''}
          ${p.status !== 'refusee' ? `<button class="danger" onclick="setPropertyStatus(${p.id},'refusee')">Refuser</button>` : ''}
          <button onclick="event.preventDefault();window.open('bien.html?id=${p.id}','_blank')">Voir</button>
          <button class="danger" onclick="deleteProperty(${p.id})">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}
function filterAdminListings(val){ annoncesFilter = val; renderAdminListings(); }
function setPropertyStatus(id, status){
  const p = DATA.find(x => x.id === id);
  if (p){ p.status = status; renderAdminListings(); renderDashboard(); showAdminToast(`Annonce « ${p.t} » → ${STATUS_LABELS[status]}`); }
}
function deleteProperty(id){
  const idx = DATA.findIndex(x => x.id === id);
  if (idx === -1) return;
  if (!confirm('Supprimer définitivement cette annonce ?')) return;
  const [removed] = DATA.splice(idx, 1);
  renderAdminListings(); renderDashboard();
  showAdminToast(`Annonce « ${removed.t} » supprimée`);
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
          ${u.status === 'actif' ? `<button class="danger" onclick="toggleUserStatus(${u.id})">Suspendre</button>` : `<button class="ok" onclick="toggleUserStatus(${u.id})">Réactiver</button>`}
          <button class="danger" onclick="deleteUser(${u.id})">Supprimer</button>
        </div>
      </td>
    </tr>`).join('');
}
function filterAdminUsers(val){ usersFilter = val; renderAdminUsers(); }
function toggleUserStatus(id){
  const u = USERS.find(x => x.id === id);
  if (u){ u.status = u.status === 'actif' ? 'suspendu' : 'actif'; renderAdminUsers(); showAdminToast(`${u.name} → ${u.status}`); }
}
function deleteUser(id){
  const idx = USERS.findIndex(x => x.id === id);
  if (idx === -1) return;
  if (!confirm('Supprimer cet utilisateur ?')) return;
  const [removed] = USERS.splice(idx, 1);
  renderAdminUsers();
  showAdminToast(`Utilisateur ${removed.name} supprimé`);
}
function addUser(e){
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name=name]').value.trim();
  const email = form.querySelector('[name=email]').value.trim();
  const role = form.querySelector('[name=role]').value;
  if (!name || !email) return;
  USERS.push({ id: Math.max(0, ...USERS.map(u => u.id)) + 1, name, email, role, status: 'actif', date: new Date() });
  form.reset();
  renderAdminUsers();
  showAdminToast(`Utilisateur ${name} ajouté`);
}

/* ---------- Catégories ---------- */
function renderCategories(){
  document.getElementById('categoriesList').innerHTML = TYPES.map(t => `
    <div class="cat-pill">${t} <button onclick="removeCategory('${t}')" aria-label="Supprimer">×</button></div>
  `).join('');
}
function addCategory(e){
  e.preventDefault();
  const input = document.getElementById('newCategory');
  const val = input.value.trim();
  if (!val || TYPES.includes(val)) return;
  TYPES.push(val);
  input.value = '';
  renderCategories();
  showAdminToast(`Catégorie « ${val} » ajoutée`);
}
function removeCategory(name){
  const idx = TYPES.indexOf(name);
  if (idx === -1) return;
  TYPES.splice(idx, 1);
  renderCategories();
  showAdminToast(`Catégorie « ${name} » supprimée`);
}

/* ---------- Toast (admin utilise son propre toast, plus court à charger) ---------- */
let adminToastTimer = null;
function showAdminToast(msg){
  const t = document.getElementById('adminToast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(adminToastTimer);
  adminToastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// L'initialisation du dashboard se fait dans adminLogin(), pas au chargement de la page,
// puisque l'accès est protégé par l'écran de connexion ci-dessus.
