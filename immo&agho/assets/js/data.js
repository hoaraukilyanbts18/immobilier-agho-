/* =========================================================
   ARPENT — données (mock)
   À remplacer par des appels à l'API REST (voir /backend/php/api)
   ========================================================= */
const CITIES = {
  "Saint-Denis":[-20.8789,55.4481], "Saint-Pierre":[-21.3393,55.4781], "Saint-Paul":[-21.0097,55.2707],
  "Le Tampon":[-21.2782,55.5156], "Saint-André":[-20.9631,55.6486], "Saint-Louis":[-21.2857,55.4142],
  "Le Port":[-20.9373,55.2919], "Saint-Benoît":[-21.0339,55.7133], "Sainte-Marie":[-20.8965,55.5464],
  "Saint-Leu":[-21.1667,55.2833]
};
const AGENTS = ["S. Grondin","M. Payet","L. Hoarau","A. Técher","K. Maillot","P. Boyer"];

function img(seed){ return `https://picsum.photos/seed/${seed}/900/650`; }

const TYPES = ["Appartement","Maison","Studio","Villa","Terrain","Bureau"];
// Statuts possibles d'une annonce (cahier des charges §2) : en_attente, validee, refusee, vendue, louee
const PUBLIC_STATUSES = ["validee","vendue","louee"]; // seuls ceux-ci sont visibles côté public

const RAW = [
  {t:"Appartement vue mer au Barachois",type:"Appartement",tx:"Vente",city:"Saint-Denis",price:245000,surface:68,pieces:3,chambres:2,sdb:1,etage:"4ᵉ étage",dpe:"C",views:1240,status:"validee",desc:"Bel appartement lumineux à deux pas du Barachois, double exposition avec vue dégagée sur l'océan. Cuisine équipée ouverte, climatisation réversible. Proche commerces et front de mer."},
  {t:"Maison créole avec jardin",type:"Maison",tx:"Vente",city:"Saint-André",price:298000,surface:110,pieces:5,chambres:3,sdb:2,etage:"R+1",dpe:"B",views:860,status:"validee",desc:"Maison familiale au calme, jardin clos de 400 m² planté de manguiers, varangue traversante. Quartier résidentiel prisé, écoles à moins de 10 minutes à pied."},
  {t:"Studio étudiant rénové",type:"Studio",tx:"Location",city:"Saint-Denis",price:480,surface:20,pieces:1,chambres:0,sdb:1,etage:"2ᵉ étage",dpe:"D",views:2210,status:"validee",desc:"Studio idéal étudiant ou jeune actif, entièrement meublé et rénové en 2024. Kitchenette équipée, salle d'eau moderne. Proche campus universitaire du Moufia."},
  {t:"Villa contemporaine vue lagon",type:"Villa",tx:"Vente",city:"Saint-Leu",price:685000,surface:195,pieces:6,chambres:4,sdb:3,etage:"R+1",dpe:"A",views:1980,status:"validee",desc:"Villa d'architecte avec piscine à débordement et vue panoramique sur le lagon. Prestations haut de gamme, domotique intégrale, garage double, à deux pas des spots de surf."},
  {t:"T2 rénové proche du port",type:"Appartement",tx:"Location",city:"Le Port",price:680,surface:42,pieces:2,chambres:1,sdb:1,etage:"1ᵉʳ étage",dpe:"C",views:640,status:"en_attente",desc:"Appartement lumineux entièrement refait à neuf, balcon filant, cave et parking en option. À deux pas du port et des commerces."},
  {t:"Case créole rénovée avec varangue",type:"Maison",tx:"Vente",city:"Saint-Pierre",price:265000,surface:88,pieces:3,chambres:2,sdb:1,etage:"RDC",dpe:"D",views:1105,status:"validee",desc:"Ancienne case créole entièrement rénovée en conservant son cachet, varangue en bois, jardin tropical. Quartier calme proche du centre-ville et du front de mer."},
  {t:"Terrain constructible viabilisé",type:"Terrain",tx:"Vente",city:"Le Tampon",price:135000,surface:500,pieces:0,chambres:0,sdb:0,etage:"—",dpe:"—",views:410,status:"validee",desc:"Terrain plat viabilisé de 500 m² en hauteur avec vue dégagée, permis de construire purgeable. Idéal projet maison individuelle, climat tempéré des hauts."},
  {t:"Duplex avec terrasse",type:"Appartement",tx:"Location",city:"Sainte-Marie",price:850,surface:65,pieces:3,chambres:2,sdb:1,etage:"3ᵉ-4ᵉ étage",dpe:"B",views:730,status:"refusee",desc:"Duplex récent avec terrasse de 16 m² exposée ouest, résidence sécurisée avec parking. Proche aéroport Roland-Garros et zone commerciale."},
  {t:"Maison de caractère en hauteur",type:"Maison",tx:"Vente",city:"Saint-Louis",price:310000,surface:140,pieces:6,chambres:4,sdb:2,etage:"R+2",dpe:"C",views:990,status:"vendue",desc:"Maison rénovée avec goût dans les hauts de Saint-Louis, vue sur les champs de canne à sucre. Cour intérieure et terrain arboré."},
  {t:"Studio meublé centre-ville",type:"Studio",tx:"Location",city:"Saint-Pierre",price:460,surface:18,pieces:1,chambres:0,sdb:1,etage:"3ᵉ étage",dpe:"E",views:1560,status:"louee",desc:"Petit studio pratique et lumineux proche du marché forain, entièrement meublé, idéal pied-à-terre ou investissement locatif saisonnier."},
  {t:"Penthouse avec toit-terrasse",type:"Appartement",tx:"Vente",city:"Saint-Denis",price:420000,surface:120,pieces:4,chambres:3,sdb:2,etage:"6ᵉ étage",dpe:"B",views:2430,status:"validee",desc:"Exceptionnel dernier étage avec toit-terrasse privatif de 50 m² offrant une vue dégagée sur la mer et les montagnes. Prestations premium, proche centre-ville."},
  {t:"Villa avec piscine face au lagon",type:"Villa",tx:"Location",city:"Saint-Leu",price:2400,surface:170,pieces:5,chambres:4,sdb:3,etage:"R+1",dpe:"C",views:520,status:"validee",desc:"Location saisonnière ou longue durée, villa avec piscine chauffée et jardin tropical, à 5 minutes à pied de la plage. Climatisation réversible dans toutes les chambres."},
  {t:"Bureau moderne centre-ville",type:"Bureau",tx:"Location",city:"Saint-Denis",price:1100,surface:75,pieces:3,chambres:0,sdb:1,etage:"2ᵉ étage",dpe:"C",views:305,status:"validee",desc:"Plateau de bureaux climatisé en open-space avec deux salles fermées, idéal profession libérale ou petite entreprise. Parking sécurisé, fibre optique installée."},
  {t:"Local commercial en attente de validation",type:"Bureau",tx:"Vente",city:"Le Port",price:180000,surface:60,pieces:2,chambres:0,sdb:1,etage:"RDC",dpe:"D",views:40,status:"en_attente",desc:"Local commercial avec vitrine sur rue passante, à proximité immédiate de la zone portuaire. Idéal commerce de proximité ou bureau."},
];

const DATA = RAW.map((p,i)=>{
  const [lat,lng] = CITIES[p.city];
  const jitter = () => (Math.random()-0.5)*0.012;
  return {
    id:i+1, ...p,
    lat:lat+jitter(), lng:lng+jitter(),
    agent: AGENTS[i % AGENTS.length],
    date: new Date(2026,7,26 - i*2),
    featured: i < 6,
    images:[img("re"+i+"a"),img("re"+i+"b"),img("re"+i+"c"),img("re"+i+"d")],
  };
});

const fmtPrice = (p) => `${p.toLocaleString('fr-FR')} €`;

// Annonces visibles côté public (une annonce doit être validée par un admin avant publication)
function visibleProperties(){ return DATA.filter(p => PUBLIC_STATUSES.includes(p.status)); }

const STATUS_LABELS = {
  en_attente: "En attente", validee: "Validée", refusee: "Refusée",
  vendue: "Vendue", louee: "Louée",
};

// Utilisateurs mock pour la démonstration de l'espace admin (§6 du cahier des charges)
const USERS = [
  {id:1, name:"S. Grondin", email:"s.grondin@arpent.re", role:"agent", status:"actif", date:new Date(2026,3,12)},
  {id:2, name:"M. Payet", email:"m.payet@arpent.re", role:"agent", status:"actif", date:new Date(2026,4,2)},
  {id:3, name:"J. Técher", email:"j.techer@gmail.com", role:"client", status:"actif", date:new Date(2026,5,20)},
  {id:4, name:"A. Fontaine", email:"a.fontaine@gmail.com", role:"client", status:"actif", date:new Date(2026,6,1)},
  {id:5, name:"Admin Arpent", email:"admin@arpent.re", role:"admin", status:"actif", date:new Date(2026,0,1)},
  {id:6, name:"K. Maillot", email:"k.maillot@gmail.com", role:"client", status:"suspendu", date:new Date(2026,6,15)},
];
