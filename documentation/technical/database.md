# Base de données PostgreSQL

## Responsabilités

PostgreSQL assure la persistance des scans (CLI) et des utilisateurs enrôlés (serveur). La base
s'appelle `pala`.

## Schéma

### Table `scans`

| Colonne            | Type       | Contrainte   | Contenu                                      |
| ------------------ | ---------- | ------------ | -------------------------------------------- |
| `id`               | `uuid`     | Clé primaire | Identifiant du scan                          |
| `cible`            | `string`   | Non nul      | Nom de la cible                              |
| `date_scan`        | `datetime` | Non nul      | Date du scan                                 |
| `premier_commit`   | `string`   | Nullable     | Premier commit de la fenêtre analysée        |
| `dernier_commit`   | `string`   | Nullable     | Dernier commit de la fenêtre analysée        |
| `duree_historique` | `integer`  | Non nul      | Profondeur d'historique Git, en jours        |
| `fichiers`         | `jsonb`    | Non nul      | `{ "liste": [...] }` : fichiers du périmètre |
| `rapport`          | `binary`   | Nullable     | Rapport du scan                              |

### Table `utilisateurs`

| Colonne     | Type     | Contrainte   | Contenu                                                         |
| ----------- | -------- | ------------ | --------------------------------------------------------------- |
| `id`        | `uuid`   | Clé primaire | Identifiant de l'utilisateur                                    |
| `nom`       | `string` | Non nul      | Nom de l'utilisateur                                            |
| `appareil`  | `jsonb`  | Non nul      | Authentificateur WebAuthn (identifiant, clé publique, compteur) |
| `enveloppe` | `jsonb`  | Nullable     | Clé publique et clé privée chiffrée de l'utilisateur            |

Conventions : noms de tables au pluriel, colonnes en `snake_case`, en français.

## Accès aux données

- L'accès SQL est confiné aux adaptateurs d'infrastructure.
- Le domaine ne dépend pas du schéma relationnel.
- Les conversions entre persistance et objets métier sont explicites.
- Les transactions sont définies à un niveau cohérent avec les invariants métier.

Le contrat commun est `Entrepot<T>` (`persiste`, `lis`) dans `noyau-partage/src/entrepots/`. La
classe abstraite `EntrepotPosgres<T>` en fournit l'implémentation Knex ; chaque entrepôt concret
déclare sa table et une méthode `mappe` qui convertit entité et DTO :

- `outillage/src/noyau/infrastructure/entrepots/postgres/entrepotDeScanPostgres.ts` ;
- `serveur/back/src/infra/entrepots/postgres/entrepotUtilisateursPostgres.ts`.

La connexion partagée est `knexPALA` (`noyau-partage/src/knex/knexfile.ts`).

## Migrations

- Outil : Knex 3.
- Emplacement : `noyau-partage/src/knex/migrations/`.
- Nommage : `<horodatage>_<description-en-français>.ts`, par exemple
  `20261029165004_cree-table-scan.ts`.
- Chaque migration exporte `up` et `down`.
- Exécution : `pnpm run migration-bdd` (`migrate:latest`). Elle est lancée au démarrage des
  conteneurs locaux, avant les tests dans la CI et par `scripts/clever-cloud/pre-run-clever.sh`.
- Table de suivi : `knex_migrations`.

## Index et contraintes

Seules les clés primaires et les contraintes de non-nullité ci-dessus existent. Aucun index
secondaire n'est défini.

## Tests

Les tests d'entrepôts s'exécutent sur un PostgreSQL réel, désigné par `BASE_DONNEES_URL`
(`postgres://postgres@localhost:5432/pala` par défaut, voir `../../vitest.config.ts`). Les
migrations doivent avoir été appliquées. Les autres tests utilisent des entrepôts en mémoire
(par exemple `outillage/test/noyau/infrastructutre/entrepots/memoire/entrepotScanMemoire.ts`).
