-- =========================================================
-- ARPENT — Schéma PostgreSQL pour Supabase
-- À coller dans Supabase > SQL Editor, puis "Run".
-- Remplace entièrement backend/php/schema.sql (MySQL).
-- =========================================================

-- ---------------------------------------------------------
-- 1. PROFILS UTILISATEURS
-- Supabase gère déjà l'authentification dans le schéma auth.users
-- (email, mot de passe haché, etc.). On ne duplique pas ça : on
-- ajoute juste une table "profiles" pour les infos métier (rôle,
-- nom affiché...), reliée 1-pour-1 à auth.users.
-- ---------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','agent','client')),
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cette fonction se déclenche automatiquement à chaque inscription
-- (auth.users) et crée la ligne profiles correspondante.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction utilitaire : l'utilisateur connecté est-il admin ?
-- (SECURITY DEFINER pour éviter une boucle infinie dans les policies RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------
-- 2. CATÉGORIES DE BIENS
-- ---------------------------------------------------------
CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO categories (name) VALUES ('Appartement'), ('Maison'), ('Studio'), ('Villa'), ('Terrain'), ('Bureau');

-- ---------------------------------------------------------
-- 3. ANNONCES
-- ---------------------------------------------------------
CREATE TABLE properties (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Vente','Location')),
    city TEXT NOT NULL,
    postal_code TEXT,
    price NUMERIC(12,2) NOT NULL,
    surface NUMERIC(8,2) NOT NULL,
    pieces SMALLINT NOT NULL DEFAULT 0,
    chambres SMALLINT NOT NULL DEFAULT 0,
    salles_bain SMALLINT NOT NULL DEFAULT 0,
    etage TEXT,
    dpe CHAR(1),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','validee','refusee','vendue','louee')),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);

CREATE TABLE property_images (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position SMALLINT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------
-- 4. FAVORIS / MESSAGES / VISITES
-- ---------------------------------------------------------
CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, property_id)
);

CREATE TABLE messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE visit_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente','confirmee','annulee','effectuee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 5. ROW LEVEL SECURITY — remplace les vérifications $_SESSION
-- de PHP. Sans ces règles, Supabase bloque TOUT accès par défaut.
-- =========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- PROFILES : lecture publique (pour afficher le nom de l'agent),
-- modification réservée à soi-même ou à un admin.
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_self_or_admin" ON profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin());

-- PROPERTIES : lecture publique des annonces validées/vendues/louées,
-- + le propriétaire voit toujours les siennes, + l'admin voit tout.
CREATE POLICY "properties_select_public" ON properties FOR SELECT
    USING (status IN ('validee','vendue','louee') OR owner_id = auth.uid() OR is_admin());
CREATE POLICY "properties_insert_owner" ON properties FOR INSERT
    WITH CHECK (owner_id = auth.uid());
CREATE POLICY "properties_update_owner_or_admin" ON properties FOR UPDATE
    USING (owner_id = auth.uid() OR is_admin());
CREATE POLICY "properties_delete_owner_or_admin" ON properties FOR DELETE
    USING (owner_id = auth.uid() OR is_admin());
-- NB (simplification assumée) : cette règle permet à un propriétaire de modifier
-- aussi le champ "status" de sa propre annonce (ex: se marquer "validee" lui-même).
-- Une version plus stricte séparerait ça avec un trigger BEFORE UPDATE qui
-- interdit de changer "status" sauf si is_admin(). À mentionner en soutenance.

-- PROPERTY_IMAGES : visibles si l'annonce parente est visible ; ajout par le propriétaire.
CREATE POLICY "images_select_if_property_visible" ON property_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM properties p WHERE p.id = property_images.property_id
        AND (p.status IN ('validee','vendue','louee') OR p.owner_id = auth.uid() OR is_admin())
    ));
CREATE POLICY "images_insert_owner" ON property_images FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));

-- FAVORITES : uniquement les siens.
CREATE POLICY "favorites_owner_only" ON favorites FOR ALL
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MESSAGES : visibles par l'expéditeur ou le destinataire ; envoi par un utilisateur connecté.
CREATE POLICY "messages_select_participant" ON messages FOR SELECT
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- VISIT_REQUESTS : visibles par le demandeur, le propriétaire du bien, ou l'admin.
CREATE POLICY "visits_select_related" ON visit_requests FOR SELECT
    USING (requester_id = auth.uid() OR is_admin() OR
        EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));
CREATE POLICY "visits_insert_requester" ON visit_requests FOR INSERT
    WITH CHECK (requester_id = auth.uid());

-- CATEGORIES : lecture publique, écriture réservée à l'admin.
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_write_admin" ON categories FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- =========================================================
-- 6. STORAGE (photos des annonces)
-- À faire dans l'interface Supabase (Storage > New bucket > "property-photos",
-- coché "Public"), puis exécuter ces policies dans le SQL Editor :
-- =========================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);
-- CREATE POLICY "photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');
-- CREATE POLICY "photos_upload_auth" ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');
