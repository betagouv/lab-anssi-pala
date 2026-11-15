# Flux de données

## Flux d'un scan complet

C'est le flux principal du projet (`pnpm run codex:scan-complet --cible <url-git>`), orchestré par
`LanceScanComplet` et assemblé dans `outillage/src/composition/scan-complet.ts`.

Une fois pour l'ensemble des cibles :

1. génération de l'environnement des outils (`GenereEnvironnement`) ;
2. génération de la configuration du proxy LiteLLM (`GenereConfigurationProxy`) ;
3. démarrage du proxy (`DemarreProxy`).

Puis, pour chaque cible :

4. bootstrap : préparation de Codex Security et clonage ou mise à jour de la cible dans
   `cible/copies/<nom>` (`PrepareEnvironnement`) ;
5. génération de la configuration de scan : périmètre limité aux fichiers modifiés sur la fenêtre
   demandée, et enregistrement du scan en base (`GenereConfigCible`) ;
6. scan (`LanceScan`) : exécution de Codex Security, lecture du journal, estimation du coût ;
7. publication d'un événement sur le bus : `SCAN_TERMINÉ` ou `SCAN_NON_EFFECTUÉ` (périmètre vide) ;
8. réaction de `composition/notificationScan.ts` : enregistrement du rapport sur le scan, puis
   envoi du compte rendu sur Mattermost.

L'échec d'une cible n'interrompt pas les suivantes : le code de sortie est le nombre de cibles en échec.

## Flux HTTP entrant

1. `GET /sante` répond avant tout autre traitement.
2. Limitation de trafic, puis en-têtes de sécurité et génération du nonce CSP
   (`http/middleware.ts`).
3. `/statique` sert la SPA construite ; les autres routes renvoient `index.html` avec le nonce.
4. `POST /enrolement/*` : session dédiée, corps JSON limité à 64 ko, puis `routeEnrolement.ts`
   appelle l'étape d'enrôlement correspondante (`enrolement/etapesEnrolement.ts`), qui s'appuie sur
   les opérations WebAuthn et sur l'entrepôt d'utilisateurs.

| Route                                          | Étape                     |
| ---------------------------------------------- | ------------------------- |
| `POST /enrolement/enregistrement/demarrage`    | `DemarreEnregistrement`   |
| `POST /enrolement/enregistrement/finalisation` | `FinaliseEnregistrement`  |
| `POST /enrolement/authentification/demarrage`  | `DemarreAuthentification` |
| `POST /enrolement/finalisation`                | `FinaliseEnrolement`      |

Les trois dernières routes exigent une cérémonie d'enrôlement en cours dans la session.

## Flux de données frontend

La SPA Svelte est chargée depuis Express. Le kit UI est chargé depuis son CDN (voir
`../../serveur/front/README.md`). En développement, Express relaie les requêtes vers le serveur
Vite (port 3001).

[À compléter : échanges entre la SPA et les routes d'enrôlement, consultation des rapports.]

## Persistance

Chaque entrepôt convertit explicitement l'entité en DTO et inversement dans sa méthode `mappe`
(voir `../technical/database.md`). Exemple : `Scan.informationsDeCommits.premierCommit` devient
la colonne `premier_commit`.

## Transactions et cohérence

- Aucune transaction explicite : chaque écriture est un `insert … on conflict (id) merge` unitaire.
- Le bus d'événements (`BusEvenementsPALA`) est interne au processus de la CLI.
- [À compléter : invariants et frontières transactionnelles à mesure qu'ils apparaissent.]
