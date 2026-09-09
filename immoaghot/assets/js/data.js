/* =========================================================
   ARPENT — Couche de données (Supabase)
   Remplace l'ancien data.js (tableau DATA codé en dur).
   Dépend de : supabase-client.js
   Toutes les pages continuent de lire la variable globale DATA,
   mais elle est maintenant remplie par des appels réseau (await)
   au lieu d'être écrite en dur — ça évite de réécrire tout le
   code d'affichage des cartes/pages qui existait déjà.
   ========================================================= */

// Coordonnées des communes (statique, ne dépend pas de la base)
const CITIES = {
  "Saint-Denis":[-20.8789,55.4481], "Saint-Pierre":[-21.3393,55.4781], "Saint-Paul":[-21.0097,55.2707],
  "Le Tampon":[-21.2782,55.5156], "Saint-André":[-20.9631,55.6486], "Saint-Louis":[-21.2857,55.4142],
  "Le Port":[-20.9373,55.2919], "Saint-Benoît":[-21.0339,55.7133], "Sainte-Marie":[-20.8965,55.5464],
  "Saint-Leu":[-21.1667,55.2833]
};

let TYPES = ["Appartement","Maison","Studio","Villa","Terrain","Bureau"]; // rafraîchi depuis "categories" au chargement
const PUBLIC_STATUSES = ["validee","vendue","louee"];
const STATUS_LABELS = {
  en_attente: "En attente", validee: "Validée", refusee: "Refusée",
  vendue: "Vendue", louee: "Louée",
};
const fmtPrice = (p) => `${Number(p).toLocaleString('fr-FR')} €`;

let DATA = [];   // rempli par loadProperties() / loadAllPropertiesAdmin()
let USERS = [];  // rempli par loadUsers() (admin uniquement)

/* ---- Transforme une ligne Postgres en objet utilisé par le reste du front ---- */
function adaptProperty(row){
  const images = (row.property_images || [])
    .sort((a,b) => a.position - b.position)
    .map(i => i.url);
  return {
    id: row.id,
    t: row.title,
    type: row.type,
    tx: row.transaction_type,
    city: row.city,
    price: Number(row.price),
    surface: Number(row.surface),
    pieces: row.pieces,
    chambres: row.chambres,
    sdb: row.salles_bain,
    etage: row.etage || '—',
    dpe: row.dpe || '—',
    desc: row.description || '',
    views: row.views_count || 0,
    status: row.status,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    agent: row.profiles?.full_name || 'Propriétaire',
    date: new Date(row.created_at),
    featured: false,
    images: images.length ? images : ['https://picsum.photos/seed/arpent' + row.id + '/900/650'],
  };
}

const PROPERTY_SELECT = '*, profiles(full_name), property_images(url, position)';

/* ---- Lecture ---- */
async function loadProperties(){
  const { data, error } = await supabaseClient
    .from('properties')
    .select(PROPERTY_SELECT)
    .in('status', PUBLIC_STATUSES)
    .order('created_at', { ascending: false });
  if (error){ console.error('loadProperties', error); DATA = []; return DATA; }
  DATA = data.map(adaptProperty);
  DATA.forEach((p, i) => { p.featured = i < 6; });
  return DATA;
}

async function loadAllPropertiesAdmin(){
  const { data, error } = await supabaseClient
    .from('properties')
    .select(PROPERTY_SELECT)
    .order('created_at', { ascending: false });
  if (error){ console.error('loadAllPropertiesAdmin', error); DATA = []; return DATA; }
  DATA = data.map(adaptProperty);
  return DATA;
}

async function fetchPropertyById(id){
  const { data, error } = await supabaseClient
    .from('properties').select(PROPERTY_SELECT).eq('id', id).single();
  if (error){ console.error('fetchPropertyById', error); return null; }
  return adaptProperty(data);
}

async function fetchSimilar(p){
  const { data, error } = await supabaseClient
    .from('properties').select(PROPERTY_SELECT)
    .or(`city.eq.${p.city},type.eq.${p.type}`)
    .neq('id', p.id)
    .in('status', PUBLIC_STATUSES)
    .limit(3);
  if (error){ console.error('fetchSimilar', error); return []; }
  return data.map(adaptProperty);
}

async function loadCategories(){
  const { data, error } = await supabaseClient.from('categories').select('name').eq('is_active', true);
  if (!error && data?.length) TYPES = data.map(c => c.name);
  return TYPES;
}

async function loadUsers(){
  const { data, error } = await supabaseClient
    .from('profiles').select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error){ console.error('loadUsers', error); USERS = []; return USERS; }
  USERS = data.map(u => ({
    id: u.id, name: u.full_name || u.email, email: u.email,
    role: u.role, status: u.is_active ? 'actif' : 'suspendu', date: new Date(u.created_at),
  }));
  return USERS;
}

/* ---- Écriture ---- */
async function createProperty(input){
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour déposer une annonce.');
  const [lat, lng] = CITIES[input.city] || [null, null];

  const { data, error } = await supabaseClient.from('properties').insert({
    owner_id: user.id,
    title: input.title, type: input.type, transaction_type: input.tx, city: input.city,
    price: input.price, surface: input.surface, pieces: input.pieces || 0,
    chambres: input.chambres || 0, salles_bain: input.sdb || 0,
    etage: input.etage || null, dpe: input.dpe || null, description: input.description,
    latitude: lat, longitude: lng,
  }).select().single();
  if (error) throw error;
  return data;
}

async function setPropertyStatus(id, status){
  const { error } = await supabaseClient.from('properties').update({ status }).eq('id', id);
  if (error) throw error;
}
async function deletePropertyRemote(id){
  const { error } = await supabaseClient.from('properties').delete().eq('id', id);
  if (error) throw error;
}
async function toggleUserActiveRemote(id, active){
  const { error } = await supabaseClient.from('profiles').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}
async function deleteUserRemote(id){
  // Nécessite normalement une fonction serveur (service_role) pour supprimer un compte
  // auth.users complet ; ceci ne supprime que le profil métier.
  const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
  if (error) throw error;
}
async function addCategoryRemote(name){
  const { error } = await supabaseClient.from('categories').insert({ name });
  if (error) throw error;
}
async function removeCategoryRemote(name){
  const { error } = await supabaseClient.from('categories').delete().eq('name', name);
  if (error) throw error;
}
