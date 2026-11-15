# Organisation des modules

## 1. Principe

Organiser le code autour des capacités et domaines fonctionnels plutôt qu'autour des seuls types techniques de fichiers.

Chaque module doit :

- avoir une responsabilité clairement définie ;
- encapsuler ses règles et détails internes ;
- exposer un contrat public maîtrisé ;
- limiter les dépendances vers les autres modules ;
- être testable indépendamment autant que possible.

## 2. Paquets du workspace

| Paquet               | Répertoire       | Rôle                                                              |
| -------------------- | ---------------- | ----------------------------------------------------------------- |
| `pala-outillage`     | `outillage/`     | CLI d'audit : bootstrap, configuration, scans, pentests           |
| `pala-back`          | `serveur/back/`  | Serveur Express : sert la SPA, enrôlement des utilisateurs        |
| `pala-front`         | `serveur/front/` | SPA Svelte                                                        |
| `pala-noyau-partage` | `noyau-partage/` | Code commun à la CLI et au serveur : chiffrement, entrepôts, Knex |

La racine porte l'outillage de développement partagé (TypeScript, Vitest, Prettier, ESLint) et
les scripts de lancement.

## 3. Structure d'un module

Structure en usage dans `outillage/src/<module>/` et `noyau-partage/src/<module>/` :

```text
nom-module/
├── domaine/        types métier, objets-valeurs, événements, règles
├── application/    cas d'utilisation (une classe, une méthode `execute`)
├── ports/          interfaces dont l'application a besoin
├── adaptateurs/    implémentations techniques des ports
└── cli/            adaptateur de ligne de commande (commander)
```

Cette structure est indicative : ne créer que les dossiers dont le module a besoin.

Les tests vivent hors de `src/`, dans `test/`, selon la même arborescence, et les doublures
partagées dans `test/doubles/`.

`outillage/src/composition/` est le Composition Root : un fichier par commande `pnpm` y assemble
adaptateurs et cas d'utilisation ; `dependances.ts` regroupe les fabriques de dépendances.

`serveur/back/src/` suit une organisation plus plate : `http/` (routes et middlewares),
`enrolement/` et `utilisateurs/` (domaine et étapes), `adaptateurs/` (environnement, WebAuthn,
protection) et `infra/` (entrepôts PostgreSQL, type d'environnement). Son point d'assemblage est
`index.ts`.

## 4. Inventaire réel des modules

### `outillage`

| Module                | Responsabilité                                                                                                                                   | Dépendances constatées                                          | Contrat public                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `noyau`               | Ports et infrastructure transverses : système de fichiers, réseau, horloge, attente, console, bus d'événements, environnement, entrepôt de scans | `noyau-partage`, `codex-security`, `scan`                       | `noyau/ports/*`, type `Scan`                                                                                                |
| `bootstrap`           | Prépare les outils et clone la cible                                                                                                             | `noyau`, `environnement`                                        | `PrepareEnvironnement`, `PreparationOutil`, port `Git`                                                                      |
| `environnement`       | Génère l'environnement des outils (`shannon.env`)                                                                                                | `noyau`, `codex-security`                                       | `GenereEnvironnement`, `Cible`                                                                                              |
| `codex-security`      | Configuration de scan, proxy LiteLLM, scan, validation d'un constat                                                                              | `noyau`, `cout`, `scan`, `bootstrap`, `environnement`           | `GenereConfigCible`, `GenereConfigurationProxy`, `DemarreProxy`, `LanceScan`, événements `ScanTermine` et `ScanNonEffectue` |
| `scan`                | Contrat de l'entrepôt de scans                                                                                                                   | `noyau`, `noyau-partage`                                        | `EntrepotScan`                                                                                                              |
| `scan-complet`        | Enchaîne toutes les étapes pour une ou plusieurs cibles                                                                                          | `noyau`                                                         | `LanceScanComplet`, `EtapesScanComplet`                                                                                     |
| `cout`                | Estime le coût d'un scan à partir des tokens consommés                                                                                           | `noyau`                                                         | `EstimationDuCout`, `Cout`                                                                                                  |
| `shannon`             | Installation, test de fumée, pentest, vérification des appels d'outils                                                                           | `noyau`, `bootstrap`, `environnement`, `codex-security`, `cout` | `PrepareShannon`, `LancePentest`                                                                                            |
| `messagerie`          | Envoi de messages instantanés                                                                                                                    | `noyau`                                                         | Port `MessagerieInstantanee`                                                                                                |
| `chiffrement-rapport` | Branche le chiffrement de `noyau-partage` sur le rapport de scan                                                                                 | `noyau-partage`                                                 | `fabriqueDeChiffrement`                                                                                                     |
| `composition`         | Composition Root et abonnement aux événements de scan                                                                                            | Tous                                                            | Points d'entrée des scripts `pnpm`                                                                                          |

Deux cycles existent aujourd'hui et ne doivent pas être étendus : `noyau` ↔ `codex-security`
(`noyau/environnement.ts` importe des types et chemins de `codex-security`) et `environnement` ↔
`codex-security`.

### `noyau-partage`

| Module        | Responsabilité                                                                              | Contrat public                                        |
| ------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `chiffrement` | Chiffrement par enveloppe d'un document pour des destinataires ; enrôlement cryptographique | `ServiceDeChiffrement`, ports de `chiffrement/ports/` |
| `entrepots`   | Contrat `Entrepot<T>` et base PostgreSQL commune                                            | `Entrepot<T>`, `EntrepotPosgres<T>`                   |
| `knex`        | Connexion et migrations                                                                     | `knexPALA`                                            |

### `serveur/back`

| Module         | Responsabilité                                       | Contrat public                                    |
| -------------- | ---------------------------------------------------- | ------------------------------------------------- |
| `http`         | Routes, middlewares de sécurité                      | `creeRouteEnrolement`, `middleware`               |
| `enrolement`   | Étapes de l'enrôlement WebAuthn, appareil, enveloppe | Étapes de `etapesEnrolement.ts`                   |
| `utilisateurs` | Utilisateur et contrat de son entrepôt               | `Utilisateur`, `EntrepotUtilisateurs`             |
| `adaptateurs`  | Environnement, WebAuthn, limitation de trafic        | `adaptateurEnvironnement`, `adaptateurProtection` |
| `infra`        | Entrepôt PostgreSQL des utilisateurs                 | `EntrepotUtilisateursPostgres`                    |

## 5. Communication intermodules

Les interactions utilisent des contrats explicites : interfaces, ports, événements ou API applicatives. Un module ne doit pas accéder directement aux détails internes d'un autre.

- Les paquets s'importent par chemin relatif (`../../../noyau-partage/src/...`).
- La fin d'un scan est communiquée par événement (`SCAN_TERMINÉ`, `SCAN_NON_EFFECTUÉ`) sur le
  bus ; les abonnés sont branchés dans `composition/`.

## 6. Dépendances interdites

- accès direct aux tables d'un autre module ;
- import de classes internes non exposées ;
- appel direct à un repository interne d'un autre domaine ;
- dépendances circulaires ;
- partage de fichiers privés entre modules ;
- dépendance de `noyau-partage` vers `outillage` ou `serveur` ;
- dépendance entre `outillage` et `serveur`.
