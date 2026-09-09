# Arpent — Plateforme immobilière (Vercel + Supabase)

## Architecture

```
index.html, annonces.html, bien.html, favoris.html,
contact.html, deposer.html, admin.html    → pages statiques (HTML/CSS/JS pur)

assets/css/style.css       Feuille de style unique

assets/js/
  supabase-client.js         Connexion au projet Supabase (URL + clé anon)
  data.js                    Toutes les requêtes de lecture/écriture vers Postgres
  auth.js                    Inscription / connexion / mot de passe oublié
  favs.js                    Favoris (toujours via l'URL ?favs=, indépendant du backend)
  common.js                  Cartes de biens, menu mobile, modale, toast
  home.js / annonces.js / bien.js / favoris.js / contact.js / deposer.js / admin.js
                              Logique propre à chaque page

backend/schema.sql          Schéma PostgreSQL + Row Level Security, à exécuter
                              dans Supabase > SQL Editor
```

Il n'y a plus de dossier `backend/php/` : Supabase remplace entièrement le
serveur PHP + MySQL. Il n'y a pas non plus de code serveur à héberger nous-
mêmes — Vercel ne sert que des fichiers statiques.

## Mise en route (résumé, voir aussi les étapes détaillées données dans la conversation)

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Colle `backend/schema.sql` dans Supabase > SQL Editor, exécute-le
3. Dans Supabase > Storage, crée un bucket public `property-photos`
4. Renseigne `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `assets/js/supabase-client.js`
5. Pousse le projet sur GitHub, importe-le dans Vercel, déploie

## Ce qui a changé par rapport à la version PHP

- **Authentification** : gérée entièrement par Supabase Auth (email/mot de
  passe, confirmation par e-mail, réinitialisation) — plus de hachage ou de
  session à coder à la main
- **Sécurité des données** : plus de vérifications `$_SESSION['role']` en
  PHP ; à la place, des règles **Row Level Security** dans `schema.sql`
  décident directement dans Postgres qui peut lire/écrire quoi
- **Stockage des photos** : via Supabase Storage (un vrai bucket), alors
  que le formulaire de dépôt d'annonce avait le champ photo désactivé dans
  la version PHP faute de serveur de stockage
- **Favoris** : **inchangés**, toujours propagés via `?favs=1,4,9` dans
  l'URL plutôt que liés à un compte — c'est une simplification assumée,
  pas une contrainte technique de Supabase (facile à faire évoluer plus
  tard vers une vraie table `favorites` liée à l'utilisateur connecté)

## Limites connues à mentionner en soutenance

- La policy RLS `properties_update_owner_or_admin` autorise un propriétaire
  à modifier sa propre annonce, **y compris son statut** — en toute rigueur
  il faudrait un trigger empêchant un non-admin de se valider lui-même
- La suppression d'un utilisateur depuis l'admin ne supprime que sa ligne
  `profiles`, pas son compte `auth.users` (nécessiterait une fonction
  serveur avec la clé `service_role`, à ne jamais exposer côté front)
- Aucun test automatisé n'a été écrit ; tout se vérifie manuellement
