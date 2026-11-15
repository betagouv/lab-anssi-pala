# Stack technique

| Technologie             | Usage                   | Responsabilité                                                                        |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| Node.js                 | Runtime                 | Exécution de la CLI d'audit (`outillage`) et du serveur (`serveur/back`)              |
| TypeScript              | Langage                 | Typage strict ; les `.ts` sont exécutés directement par Node (pas de transpilation)   |
| pnpm                    | Gestionnaire de paquets | Workspace à quatre paquets (voir `../architecture/module-organization.md`)            |
| commander               | CLI                     | Analyse des arguments des commandes `pnpm pala:*`, `codex:*`, `shannon:*`             |
| Svelte + Vite           | Frontend                | SPA `serveur/front`, servie sous `/statique/`                                         |
| Kit UI Lab ANSSI        | Design system de l'État | Web components chargés depuis un CDN, non empaquetés (voir `serveur/front/README.md`) |
| Express                 | Backend                 | Sert la SPA, expose l'enrôlement, applique CSP et limitation de trafic                |
| SimpleWebAuthn          | Authentification        | Cérémonies WebAuthn de l'enrôlement (extension PRF)                                   |
| HPKE (`@hpke/core`)     | Chiffrement             | Chiffrement par enveloppe du rapport de scan (`noyau-partage/src/chiffrement`)        |
| PostgreSQL              | Base de données         | Persistance des scans et des utilisateurs                                             |
| Knex                    | Accès SQL et migrations | Constructeur de requêtes et migrations versionnées                                    |
| Vitest                  | Tests                   | Tests unitaires et d'intégration des trois paquets Node                               |
| ESLint + Prettier       | Qualité                 | Analyse statique et formatage (voir `../development/code-style.md`)                   |
| Docker / Docker Compose | Environnement           | Environnement de développement local ; conteneur du proxy LiteLLM                     |
| LiteLLM                 | Proxy LLM               | Traduit l'API _Responses_ en _Chat Completions_ pour Codex Security                   |
| Clever Cloud            | Hébergement             | Environnement DEMO (application PALA et proxy LiteLLM), stockage Cellar               |

Les outils d'audit eux-mêmes (Codex Security, Shannon) sont des sous-modules Git : leurs versions
sont suivies dans `../versions.md`.

## Versions

| Technologie | Version retenue                                  | Source de vérité                                                |
| ----------- | ------------------------------------------------ | --------------------------------------------------------------- |
| Node.js     | 24.22.3                                          | `../../.nvmrc` (`engines` : `>=24.22.1`)                        |
| pnpm        | 10.34.9                                          | `packageManager` de `../../package.json`                        |
| TypeScript  | 7.0.2 (racine, `tsc`) ; 5.9.3 dans chaque paquet | `../../package.json` et `package.json` des paquets              |
| Svelte      | 5.x (`^5.57.0`)                                  | `../../serveur/front/package.json`                              |
| Vite        | 7.x (`^7.1.12`)                                  | `../../serveur/front/package.json`                              |
| Express     | 5.x (`^5.3.0`)                                   | `../../serveur/back/package.json`                               |
| Knex        | 3.x (`^3.3.0`)                                   | `../../package.json`                                            |
| Vitest      | 5.1.0                                            | `../../package.json`                                            |
| PostgreSQL  | 17 en local ; 13 dans la CI                      | `../../docker-compose.yaml`, `../../.github/workflows/ci.yaml`  |
| Docker      | Non épinglée                                     | Poste de développement (relevé indicatif dans `../versions.md`) |

Deux versions de TypeScript cohabitent volontairement : `typescript@7` (natif, sans API JavaScript)
sert au contrôle de types à la racine, alors que `typescript-eslint` exige un `typescript@5` dans
chaque paquet (voir le commentaire de `../../eslint.config.base.js`).

## Principes

- Activer le typage strict TypeScript.
- Éviter `any` ; justifier toute exception.
- Centraliser la configuration.
- Isoler les accès à la base de données derrière des adaptateurs.
- Ne pas rendre le domaine dépendant de Node.js, Express ou Svelte.
- Documenter toute nouvelle dépendance structurante.
- Respecter le délai de sept jours imposé aux nouvelles versions de dépendances
  (`minimumReleaseAge` de `../../pnpm-workspace.yaml`).
