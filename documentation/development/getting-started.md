# Démarrer le développement

## Prérequis

- Node.js : La version est renseignée dans le fichier racine du projet `.nvmrc`
- pnpm : la version est renseignée dans `packageManager` du `package.json` racine
- Docker et Docker Compose
- Python ≥ 3.10 pour les scripts utilitaires des outils

## Installation

`pnpm install`

## Configuration locale

1. Copier `.env.example` vers `.env` à la racine du dépôt.
2. Renseigner les valeurs locales sans versionner de secrets
   (voir `../technical/environment-variables.md`).
3. Créer une fois le réseau Docker partagé : `docker network create reseau-pala`.

## Démarrage

```bash
./scripts/dev/start.sh
```

Le script construit les images, démarre PostgreSQL, applique les migrations et lance le serveur.
L'IHM est accessible sur `http://localhost:<PALA_PORT>` (par exemple http://localhost:8086).

Les commandes de la CLI d'audit sont décrites dans le `README.md` racine.

## Tests et contrôles

```bash
pnpm run test            # Lance les tests (PostgreSQL démarré et migrations appliquées)
pnpm run typecheck       # Vérifie le typage
pnpm run lint            # Analyse le code avec ESLint
pnpm run format:verifie  # Vérifie la mise en forme
pnpm run format:corrige  # Corrige la mise en forme
pnpm run migration-bdd   # Applique les migrations
```

## Dépannage

- `NODE_VERSION non definie` au lancement de Docker Compose : passer par `./scripts/dev/start.sh`,
  qui lit la version dans `.nvmrc`.
- `network reseau-pala declared as external, but could not be found` : créer le réseau
  (`docker network create reseau-pala`).
- Toute navigation répond `429` : `NB_REQUETES_MAX_PAR_MINUTE` vaut `0` ou n'est pas définie.
- Le serveur refuse de démarrer : une variable obligatoire manque (`ENROLEMENT_*`, `PALA_PORT`,
  `PALA_HOTE`, `NB_REQUETES_TRUST_PROXY`).
- Les tests d'entrepôts échouent : PostgreSQL n'est pas joignable sur `BASE_DONNEES_URL` ou les
  migrations ne sont pas appliquées.
