/* =========================================================
   ARPENT — Connexion au projet Supabase
   Remplace les deux valeurs ci-dessous par les tiennes :
   Supabase > Settings > API > Project URL / anon public key.
   La clé "anon" est publique par design (elle est protégée par
   les règles RLS définies dans backend-supabase/schema.sql),
   donc pas de souci à l'écrire ici en clair côté front.
   ========================================================= */
const SUPABASE_URL = 'https://VOTRE-PROJET.supabase.co';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIC';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
