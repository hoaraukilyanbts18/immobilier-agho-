# Arpent — Plateforme immobilière (prototype)

## Structure du projet

```
index.html              Page d'accueil
annonces.html            Liste des biens (filtres, tri, pagination)
bien.html                Fiche détaillée d'un bien (?id=1)
favoris.html             Favoris de l'utilisateur
contact.html             Contact + FAQ

assets/css/style.css     Feuille de style unique, partagée par toutes les pages
assets/js/data.js        Données des biens (mock — à remplacer par l'API)
assets/js/favs.js        Gestion des favoris (via l'URL, pas de compte pour l'instant)
assets/js/common.js      Comportements communs : carte "bien", menu mobile, modale, toast
assets/js/home.js        Logique propre à la page d'accueil
assets/js/annonces.js    Logique propre à la page annonces (filtres/tri/pagination)
assets/js/bien.js        Logique propre à la fiche d'un bien
assets/js/favoris.js     Logique propre à la page favoris
assets/js/contact.js     Logique propre à la page contact (FAQ, formulaire)

backend/php/             Squelette d'API PHP + MySQL (§4.2 à §4.4 du cahier des charges)
  Database.php             Connexion PDO
  models/Property.php      CRUD des biens (requêtes préparées)
  api/properties.php       Endpoint REST GET/POST
  schema.sql               Script de création des tables (3NF)

backend/python/           Scripts Python d'automatisation (§4.2)
  import_properties.py     Import en masse depuis un CSV
  estimate_price.py        Estimation de prix simplifiée
```

## Comment ouvrir le site

Double-cliquez sur `index.html`, ou mieux, lancez un petit serveur local pour
éviter les restrictions de certains navigateurs sur les fichiers `file://` :

```
cd site
python3 -m http.server 8000
```

Puis ouvrez http://localhost:8000

## Ce qui est fonctionnel dès maintenant (sans serveur)

- Navigation entre les 5 pages
- Recherche, filtres, tri, pagination sur `annonces.html`
- Favoris : ajoutés/retirés en cliquant sur le cœur, conservés d'une page à
  l'autre via le paramètre d'URL `?favs=1,4,9` (pas de compte réel = pas de
  stockage navigateur dans cette version)
- Fiche bien : galerie photo, carte OpenStreetMap, biens similaires
- Formulaires (contact, connexion) : simulés, affichent un message de
  confirmation mais n'envoient rien nulle part

## Ce qu'il reste à faire pour une vraie mise en production

1. **Base de données** : créer la base avec `backend/php/schema.sql`
2. **API** : compléter `backend/php/api/` avec les endpoints manquants
   (utilisateurs, messages, visites, favoris en base plutôt que dans l'URL)
3. **Authentification réelle** : sessions PHP sécurisées (cookie HttpOnly,
   Secure, SameSite), hachage bcrypt, protection CSRF sur les formulaires
4. **Brancher le front sur l'API** : dans `assets/js/data.js`, remplacer le
   tableau `DATA` par un `fetch('/backend/php/api/properties.php')`
5. **Dashboard admin** : partie privée décrite en §3 du cahier des charges,
   non traitée dans ce prototype (CRUD utilisateurs, CMS, statistiques…)
6. **Hébergement** : PHP 8.1+, MySQL/PostgreSQL, certificat SSL/TLS
