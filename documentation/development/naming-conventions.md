# Conventions de nommage

## Langue

Les concepts métier sont nommés en français, de façon cohérente avec `../project/glossary.md`. Les conventions imposées par les langages et frameworks peuvent rester en anglais.

Les identifiants TypeScript s'écrivent sans accent (`EntrepotScan`, `genereConfigCible`). Les
accents restent possibles dans les chaînes : noms d'événements (`SCAN_TERMINÉ`), noms de scripts
`pnpm` (`pala:génère-config`), messages.

## Principes

- Un nom est explicite et simple : il exprime l'intention métier, pas le détail technique
  (`Enveloppe` plutôt qu'un nom décrivant l'algorithme).
- Pas d'abréviation.

## Conventions techniques

| Élément                                      | Convention                                                          | Exemple                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dossiers de module                           | `kebab-case`                                                        | `codex-security`, `scan-complet`                                |
| Fichiers de cas d'utilisation                | `camelCase`, du nom de la classe                                    | `lanceScan.ts`, `genereConfigCible.ts`                          |
| Fichiers de ports et de classes d'adaptateur | `PascalCase` (usage dominant dans `outillage`)                      | `SystemeDeFichier.ts`, `GitEnLigneDeCommande.ts`                |
| Fichiers de points d'entrée CLI              | `kebab-case`                                                        | `genere-config.ts`, `scan-complet.ts`                           |
| Fichiers de test                             | Nom du fichier testé suivi de `.spec.ts`                            | `lanceScan.spec.ts`                                             |
| Classes / types                              | `PascalCase`                                                        | `LanceScan`, `ScanTermine`, `Constat`                           |
| Cas d'utilisation                            | Verbe à la 3ᵉ personne du présent et complément ; méthode `execute` | `LanceScan`, `DemarreProxy`, `PrepareEnvironnement`             |
| Ports                                        | Nom du besoin, sans préfixe ni suffixe technique                    | `Horloge`, `Reseau`, `MessagerieInstantanee`                    |
| Adaptateurs                                  | Nom du port suivi de la technique                                   | `SystemeDeFichierNode`, `ReseauFetch`, `EntrepotDeScanPostgres` |
| Entrepôts                                    | `Entrepot` suivi du concept                                         | `EntrepotScan`, `EntrepotUtilisateurs`                          |
| Doublures de test                            | Nom du port suivi de `Simule`, `EnMemoire`, `Fige`…                 | `ReseauSimule`, `ConsoleEnMemoire`, `HorlogeFigee`              |
| Fonctions / méthodes                         | `camelCase`, verbe conjugué                                         | `persiste`, `dernierScanPourLaCible`, `creeServeur`             |
| Fabriques de données                         | Article indéfini et concept                                         | `unScanTermine`, `unScanNonEffectue`                            |
| Variables                                    | `camelCase`                                                         | `nomCible`, `busDEvenements`                                    |
| Constantes                                   | `MAJUSCULES_AVEC_TIRETS_BAS`                                        | `NOMBRE_DE_JOURS_PAR_DEFAUT`                                    |
| Noms d'événements                            | `MAJUSCULES_AVEC_TIRETS_BAS`, participe passé                       | `SCAN_TERMINÉ`, `SCAN_NON_EFFECTUÉ`                             |
| Variables d'environnement                    | `MAJUSCULES_AVEC_TIRETS_BAS`, préfixées par leur domaine            | `FOURNISSEUR_MODELE`, `PALA_PORT`                               |
| Composants Svelte                            | `PascalCase.svelte`                                                 | `App.svelte`                                                    |
| Tables SQL                                   | Pluriel, `snake_case`                                               | `scans`, `utilisateurs`                                         |
| Colonnes SQL                                 | `snake_case`                                                        | `date_scan`, `premier_commit`                                   |
| Migrations                                   | `<horodatage>_<description-kebab-case>.ts`                          | `20261106160317_cree-table-utilisateurs.ts`                     |

La casse des fichiers n'est pas encore homogène dans tout le dépôt : pour un nouveau fichier,
suivre la convention du dossier dans lequel il est créé.

## Règle

Ne pas introduire un nouveau synonyme pour un concept métier déjà défini.
